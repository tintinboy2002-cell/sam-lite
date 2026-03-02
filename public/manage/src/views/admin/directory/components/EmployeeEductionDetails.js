import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Image,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useDisclosure,
  Stack,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { decryptData } from 'utils/crypto';
import college from 'assets/img/college.png';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Paperclip } from 'lucide-react';
// import AlertDialogBox from '../UI/AlertDialogBox';
import AlertDialogBox from '../../profile/UI/AlertDialogBox';
// import Spinner from 'components/common/Spinner';

// Formik + Yup
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { BulletList } from 'react-content-loader';
import { useParams } from 'react-router-dom';

var defaultForm = (id) => ({
  education_level: '',
  user_id: id,
  degree_name: '',
  field_of_study: '',
  institute: '',
  university_name: '',
  start_date: '',
  end_date: '',
  grade: '',
  country: '',
  mode_of_study: '',
  status: '',
  remarks: '',
  attachment: [],
});

// Only letters, numbers and spaces(final regex)
const ONLY_VALID_CHARS = /^[A-Za-z\s]+$/;

const valid_grade = /^[A-Za-z0-9.\s%]+$/;

const educationSchema = Yup.object().shape({
  degree_name: Yup.string()
    .trim()
    .matches(ONLY_VALID_CHARS, 'Only letters and characters are allowed')
    .required('Degree name is required'),
  field_of_study: Yup.string()
    .trim()
    .matches(ONLY_VALID_CHARS, 'Only letters and characters are allowed')
    .required('Field of study is required'),
  institute: Yup.string()
    .trim()
    .matches(ONLY_VALID_CHARS, 'Only letters and characters are allowed')
    .required('Institute is required'),
  university_name: Yup.string()
    .trim()
    .matches(ONLY_VALID_CHARS, 'Only letters and characters are allowed')
    .required('University name is required'),
  grade: Yup.string()
    .trim()
    .matches(valid_grade, 'Only letters and numbers are allowed')
    .required('Grade/CGPA is required'),
  country: Yup.string()
    .trim()
    .matches(ONLY_VALID_CHARS, 'Only letters and characters are allowed')
    .required('Country is required'),
  // start_date: Yup.string().required('Start date is required'),
  // end_date: Yup.string().required('End date is required'),
});

const Education = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
  } = useDisclosure();

  // const userId = useParams().userId || decryptData(Cookies.get('userId')) || '';

  const { id } = useParams();

  const cancelRef = useRef();
  const fileRef = useRef();
  const [educations, setEducations] = useState([]);
  const [initialForm, setInitialForm] = useState(defaultForm(id));
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [originalForm, setOriginalForm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toDeleteEducation, setToDeleteEducation] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [fileAttachment, setFileAttachment] = useState([]); // separate file state
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // track expanded state per education id so only the clicked card toggles
  const [expandedMap, setExpandedMap] = useState({});
  const toggleVisibility = (id) =>
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    fetchEducationData();
  }, []);

  const fetchEducationData = async () => {
    const startTime = Date.now();
    setLoading(true);
    try {
      const response = await httpInjectorService.getEducationDetails(id);
      if (response?.status === 'success') {
        setEducations(response.data || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setEducations([]);
    }
    // enforce MINIMUM 2 seconds loader
    const elapsed = Date.now() - startTime;
    const remaining = 2000 - elapsed;

    setTimeout(
      () => {
        setLoading(false);
      },
      remaining > 0 ? remaining : 0,
    );
  };

  const openAddModal = () => {
    setInitialForm(defaultForm(id));
    setFileAttachment([]);
    setEditMode(false);
    setEditingId(null);
    onOpen();
  };

  const openEditModal = (data) => {
    const mapped = {
      ...defaultForm(id),
      ...data,
      attachment: [],
    };
    setInitialForm(mapped);
    setOriginalForm(mapped);
    setEditingId(data.education_id || data.id || null);
    setEditMode(true);
    setFileAttachment([]);
    // convert start/end to Date objects for DatePicker
    if (mapped.start_date) setStartDate(new Date(mapped.start_date));
    if (mapped.end_date) setEndDate(new Date(mapped.end_date));
    onOpen();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
    ];

    const validFiles = [];
    const errs = [];

    files.forEach((file) => {
      if (file.size > maxSize)
        errs.push(`${file.name} is too large. Maximum size is 5MB.`);
      else if (!allowedTypes.includes(file.type))
        errs.push(`${file.name} is not a supported file type.`);
      else validFiles.push(file);
    });

    if (errs.length) errs.forEach((er) => toast.error(er));
    if (validFiles.length > 1) {
      toast.warning(
        'Only the first file will be uploaded. Please select one file at a time.',
      );
      validFiles.splice(1);
    }

    setFileAttachment(validFiles);
  };

  const removeAttachment = () => {
    if(fileRef.current) {
      fileRef.current.value = null;
    }
    setFileAttachment([]);
  };

   const handleDownload = (education_id, file_name) => {
    try {
      httpInjectorService
        .downloadEducationFile(education_id)
        .then((response) => {
          const gcpUrl = response.data.attachment_url;
  
          const a = document.createElement('a');
          a.href = gcpUrl;
          a.download = file_name || 'education.pdf';
          a.target = '_blank'; // optional
          document.body.appendChild(a);
          a.click();
          a.remove();
  
          // toast.success('File downloaded succesfully');
        });
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (education_id) => {
    try {
      const response = await httpInjectorService.deleteEducationDetails({
        education_id,
        user_id: id,
      });
      if (response?.status === 'success') {
        setEducations((prev) =>
          prev.filter((edu) => edu.education_id !== education_id),
        );
        toast.success(response.message || 'Education deleted successfully');
      } else {
        toast.error(response?.message || 'Failed to delete education');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Error deleting education');
    }
  };

  const confirmDelete = async () => {
    if (!toDeleteEducation) return;
    setDeleteLoading(true);
    await handleDelete(toDeleteEducation);
    onCloseDelete();
    setToDeleteEducation(null);
    setDeleteLoading(false);
  };

  // Submit function: accepts values from Formik and current fileAttachment
  const submitEducation = async (values, { resetForm }) => {
    // date validation: ensure start <= end when both present
    if (values.start_date && values.end_date) {
      const start = new Date(values.start_date);
      const end = new Date(values.end_date);
      if (start > end) {
        toast.error('Start date cannot be greater than end date.');
        return;
      }
    }

    const payloadBase = { ...values, user_id: id };

    // Edit flow
    if (editMode && editingId) {
      if (isUpdating) return;
      setIsUpdating(true);
      const prevEducations = [...educations];
      try {
        // compute changed fields compared to originalForm
        const changedFields = {};
        Object.keys(values).forEach((k) => {
          if (k === 'attachment') return;
          const orig = originalForm?.[k] || '';
          const now = values[k] || '';
          if (String(orig) !== String(now)) changedFields[k] = now;
        });
        const onlyAttachmentChanged =
          fileAttachment && fileAttachment.length > 0;
        if (Object.keys(changedFields).length === 0 && !onlyAttachmentChanged) {
          toast.info('No changes detected.');
          setIsUpdating(false);
          onClose();
          return;
        }

        const matchesId = (edu) =>
          String(edu.education_id || edu.id) === String(editingId);
        // optimistic update
        setEducations((prev) =>
          prev.map((edu) =>
            matchesId(edu) ? { ...edu, ...changedFields } : edu,
          ),
        );

        onClose();

        let updatePayload = {
          ...changedFields,
          education_id: editingId,
          user_id: id,
        };
        if (fileAttachment.length > 0) {
          const formData = new FormData();
          Object.keys(updatePayload).forEach((key) =>
            formData.append(key, updatePayload[key]),
          );
          formData.append('file', fileAttachment[0]);
          updatePayload = formData;
        }

        const response = await httpInjectorService.updateEducationDetails(
          updatePayload,
        );
        if (response?.status === 'success') {
          toast.success(response.message || 'Education updated successfully');
          // if (response.data) {
          //   setEducations((prev) => prev.map((edu) => (matchesId(edu) ? response.data : edu)));
          // }
          await fetchEducationData();
          resetForm();
        } else {
          toast.error(response?.message || 'Failed to update education');
          setEducations(prevEducations);
        }
      } catch (err) {
        console.error('Update error:', err);
        toast.error('Error updating education');
        setEducations(prevEducations);
      } finally {
        setIsUpdating(false);
      }
    } else {
      // Create flow
      if (isUpdating) return;
      setIsUpdating(true);
      const prevEducations = [...educations];
      try {
        onClose();
        const formData = new FormData();
        Object.keys(payloadBase).forEach((key) => {
          if (key !== 'attachment') formData.append(key, payloadBase[key]);
        });
        if (fileAttachment.length > 0)
          formData.append('file', fileAttachment[0]);

        const response = await httpInjectorService.addEducationDetails(
          formData,
        );
        if (response?.status === 'success') {
          toast.success(response.message || 'Education added successfully');
          await fetchEducationData();
          resetForm();
        } else {
          toast.error(response?.message || 'Failed to add education');
          setEducations(prevEducations);
          onOpen();
        }
      } catch (err) {
        console.error('Create error:', err);
        toast.error('Error adding education');
        onOpen();
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <>
      <Box>
        <HStack justify="space-between" mb={6}>
          <Heading size="md">Educational Info</Heading>
          <Button
            display="flex"
            alignItems="center"
            gap={{base: 'none' , md:'4px'}}
            colorScheme="purple"
            onClick={openAddModal}
          >
            <AddIcon />
            <Text mb='0px' display={{ base: 'none', md: 'block' }}>Add Education</Text>
          </Button>
        </HStack>

        {/* Education Cards */}
        {loading ? (
          <BulletList />
        ) : (
          <VStack spacing={4} align="stretch">
            {educations.length > 0 ? (
              educations.map((data, idx) => {
                const eduId = data.education_id || data.id || idx;
                return (
                  <Box key={eduId} borderRadius="xl" borderWidth="1px" p={4}>
                    <HStack
                      display="flex"
                      flexDirection="row"
                      justify="space-between"
                      mr={4}
                    >
                      <Text fontWeight="bold" mb={0}>
                        {data.education_level || 'No data'}
                      </Text>
                      <HStack
                      borderRadius="2xl"
                      border="1px solid #ccc"
                      p={2}
                      spacing={2}>
                        <EditIcon
                          onClick={() => openEditModal(data)}
                          color="purple"
                          _hover={{ backgroundColor: 'gray.100' }}
                          style={{
                            cursor: 'pointer',
                            width: '25px',
                            height: '25px',
                          }}
                        />
                        <DeleteIcon
                          onClick={() => {
                            setToDeleteEducation(data.education_id);
                            onOpenDelete();
                          }}
                          size="25"
                          color="red"
                          _hover={{ backgroundColor: 'gray.100' }}
                          style={{
                            cursor: 'pointer',
                            width: '25px',
                            height: '25px',
                          }}
                        />
                      </HStack>
                    </HStack>

                    <HStack display="flex" flexDirection="row">
                      <Box
                        display="flex"
                        flexDirection={{ base: 'column', md: 'row', lg: 'row' }}
                        gap={4}
                      >
                        <Box>
                          <Image
                            src={college}
                            alt="college"
                            boxSize={{ base: '60px', md: '80px' }}
                            objectFit="cover"
                            mx={{ base: '0', md: '0' }}
                            mb={{ base: 2, md: 0 }}
                          />
                        </Box>
                        <Box>
                          <Text color="gray.500">
                            {data.degree_name || 'No data'}
                          </Text>
                          <Text color="gray.500">
                            {data.field_of_study || 'No data'}
                          </Text>
                          <Text color="gray.500">
                            {data.mode_of_study
                              ? `${data.mode_of_study}`
                              : 'No data'}
                          </Text>
                          <Text color="gray.500">
                            {data.start_date || 'No date'} -{' '}
                            {data.end_date || 'No date'}
                          </Text>
                          <Text color="gray.500">
                            {data.institute || 'No data'}
                          </Text>

                          <Box>
                            <Button onClick={() => toggleVisibility(eduId)}>
                              {expandedMap[eduId] ? (
                                <>
                                  <>show less</> <ChevronUp size={16} />
                                </>
                              ) : (
                                <>
                                  <>show more</> <ChevronDown size={16} />
                                </>
                              )}
                            </Button>

                            {expandedMap[eduId] && (
                              <Box mt={2}>
                                <Text color="gray.500">
                                  {data.university_name || 'No data'}
                                </Text>
                                <Text color="gray.500">
                                  {data.country
                                    ? `Country: ${data.country}`
                                    : 'No data'}
                                </Text>
                                <Text color="gray.500">
                                  {data.grade
                                    ? `Grade/CGPA: ${data.grade}`
                                    : 'No data'}
                                </Text>
                                <Text color="gray.500">
                                  {data.status
                                    ? `Status: ${data.status}`
                                    : 'No data'}
                                </Text>

                                <Box
                                  style={{ width: 'fit-content' }}
                                  mt={2}
                                  bg="gray.100"
                                  p={2}
                                  borderRadius="2xl"
                                  border="1px solid #ccc"
                                >
                                  <Text color="gray.500">
                                    {data.remarks
                                      ? `📝Notes: ${data.remarks}`
                                      : 'No notes added yet 📝'}
                                  </Text>
                                </Box>

                                <Box mt={2}>
                                  <Text fontWeight="bold" mb={1}>
                                    Attachments:
                                  </Text>
                                  {data.docname ? (
                                    <Box
                                      p={2}
                                      bg="blue.50"
                                      borderRadius="md"
                                      border="1px solid"
                                      borderColor="blue.200"
                                    >
                                      <HStack
                                        alignItems="center"
                                        justifyContent="space-between"
                                        spacing={2}
                                      >
                                        <HStack spacing={2} alignItems="center">
                                          <Paperclip />
                                          <Text
                                            fontSize="sm"
                                            fontWeight="medium"
                                            color="blue.700"
                                            mb={0}
                                          >
                                            {data.docname}
                                          </Text>
                                        </HStack>
                                        <Button
                                          size="xs"
                                          colorScheme="blue"
                                          variant="outline"
                                          onClick={() =>
                                            handleDownload(
                                              data.education_id,
                                              data.docname,
                                            )
                                          }
                                        >
                                          View
                                        </Button>
                                        {/* <Button
                                          size="xs"
                                          colorScheme="red"
                                          variant="outline"
                                          onClick={() => removeAttachment()}
                                        >
                                          Remove
                                        </Button> */}
                                      </HStack>
                                    </Box>
                                  ) : (
                                    <Text color="gray.500" fontSize="sm">
                                      No attachments
                                    </Text>
                                  )}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </HStack>
                  </Box>
                );
              })
            ) : (
              <Box borderRadius="md" borderWidth="1px" p={4}>
                <HStack>
                  <img src={college} alt="" width={80} />
                  <Box>
                    <Text fontWeight="bold">No education data</Text>
                    <Text color="gray.500" fontSize="sm">
                      Click “Add Education” to add records.
                    </Text>
                  </Box>
                </HStack>
              </Box>
            )}
          </VStack>
        )}

        {/* Add / update Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
          <ModalOverlay />
          <ModalContent>
            <Formik
              initialValues={initialForm}
              enableReinitialize
              validationSchema={educationSchema}
              onSubmit={submitEducation}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                setFieldValue,
                isSubmitting,
              }) => (
                <Form>
                  <ModalHeader>
                    {editMode ? 'Update Education' : 'Add Education'}
                  </ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Stack spacing={4}>
                      <FormControl
                        isRequired
                        isInvalid={
                          touched.education_level && !!errors.education_level
                        }
                      >
                        <FormLabel>Education Level</FormLabel>
                        <Select
                          name="education_level"
                          value={values.education_level}
                          onChange={handleChange}
                          placeholder="Select education level"
                        >
                          <option value="high school">High School</option>
                          <option value="pre university">
                            Pre University / PUC
                          </option>
                          <option value="diploma">Diploma</option>
                          <option value="bachelor">Bachelor's Degree</option>
                          <option value="master">Master's Degree</option>
                          <option value="phd">PhD</option>
                          <option value="other">Other</option>
                        </Select>
                        {errors.education_level && touched.education_level && (
                          <Text color="red.500" fontSize="sm">
                            {errors.education_level}
                          </Text>
                        )}
                      </FormControl>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl
                          isRequired
                          isInvalid={
                            touched.degree_name && !!errors.degree_name
                          }
                        >
                          <FormLabel>Degree Name</FormLabel>
                          <Input
                            name="degree_name"
                            value={values.degree_name}
                            onChange={(e) => {
                              handleChange(e);
                            }}
                            placeholder="e.g., BCA"
                          />
                          {errors.degree_name && touched.degree_name && (
                            <Text color="red.500" fontSize="sm">
                              {errors.degree_name}
                            </Text>
                          )}
                        </FormControl>

                        <FormControl
                          isRequired
                          isInvalid={
                            touched.field_of_study && !!errors.field_of_study
                          }
                        >
                          <FormLabel>Field of Study</FormLabel>
                          <Input
                            name="field_of_study"
                            value={values.field_of_study}
                            onChange={handleChange}
                            placeholder="e.g., Computer Science"
                          />
                          {errors.field_of_study && touched.field_of_study && (
                            <Text color="red.500" fontSize="sm">
                              {errors.field_of_study}
                            </Text>
                          )}
                        </FormControl>
                      </SimpleGrid>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl
                          isRequired
                          isInvalid={touched.institute && !!errors.institute}
                        >
                          <FormLabel>Institute</FormLabel>
                          <Input
                            name="institute"
                            value={values.institute}
                            onChange={handleChange}
                            placeholder="Institute Name"
                          />
                          {errors.institute && touched.institute && (
                            <Text color="red.500" fontSize="sm">
                              {errors.institute}
                            </Text>
                          )}
                        </FormControl>

                        <FormControl
                          isRequired
                          isInvalid={
                            touched.university_name && !!errors.university_name
                          }
                        >
                          <FormLabel>University Name</FormLabel>
                          <Input
                            name="university_name"
                            value={values.university_name}
                            onChange={handleChange}
                            placeholder="University Name"
                          />
                          {errors.university_name &&
                            touched.university_name && (
                              <Text color="red.500" fontSize="sm">
                                {errors.university_name}
                              </Text>
                            )}
                        </FormControl>
                      </SimpleGrid>

                      <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                        <FormControl>
                          <FormLabel>From</FormLabel>
                          <Box width={{ base: '100%', md: 'auto' }}>
                            <DatePicker
                              selected={startDate}
                              onChange={(date) => {
                                if (date instanceof Date && !isNaN(date)) {
                                  setStartDate(date);
                                  const formatted = format(date, 'yyyy/MM/dd');
                                  setFieldValue('start_date', formatted);
                                } else {
                                  setStartDate(null);
                                  setFieldValue('start_date', '');
                                }
                              }}
                              dateFormat="yyyy/MM/dd"
                              placeholderText="Select a date"
                              isClearable
                              showYearDropdown
                              scrollableMonthYearDropdown
                              maxDate={new Date()}
                              style={{ width: '100%' }}
                            />
                          </Box>
                        </FormControl>

                        <FormControl>
                          <FormLabel>To</FormLabel>
                          <Box width={{ base: '100%', md: 'auto' }}>
                            <DatePicker
                              selected={endDate}
                              onChange={(date) => {
                                if (date instanceof Date && !isNaN(date)) {
                                  setEndDate(date);
                                  const formatted = format(date, 'yyyy/MM/dd');
                                  setFieldValue('end_date', formatted);
                                } else {
                                  setEndDate(null);
                                  setFieldValue('end_date', '');
                                }
                              }}
                              dateFormat="yyyy/MM/dd"
                              placeholderText="Select a date"
                              isClearable
                              showYearDropdown
                              scrollableMonthYearDropdown
                              maxDate={new Date()}
                              style={{ width: '100%' }}
                            />
                          </Box>
                        </FormControl>
                      </Stack>

                      <FormControl isInvalid={touched.grade && !!errors.grade}>
                        <FormLabel>Grade/CGPA</FormLabel>
                        <Input
                          name="grade"
                          value={values.grade}
                          onChange={handleChange}
                        />
                        {errors.grade && touched.grade && (
                          <Text color="red.500" fontSize="sm">
                            {errors.grade}
                          </Text>
                        )}
                      </FormControl>

                      <FormControl
                        isInvalid={touched.country && !!errors.country}
                      >
                        <FormLabel>Country</FormLabel>
                        <Input
                          name="country"
                          value={values.country}
                          onChange={handleChange}
                        />
                        {errors.country && touched.country && (
                          <Text color="red.500" fontSize="sm">
                            {errors.country}
                          </Text>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel>Mode of Study</FormLabel>
                        <Select
                          name="mode_of_study"
                          value={values.mode_of_study}
                          onChange={handleChange}
                          placeholder="Select mode"
                        >
                          <option value="Part Time">Part Time</option>
                          <option value="Full Time">Full Time</option>
                          <option value="Distance">Distance</option>
                          <option value="Online">Online</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Status</FormLabel>
                        <Select
                          name="status"
                          value={values.status}
                          onChange={handleChange}
                          placeholder="Select status"
                        >
                          <option value="Completed">Completed</option>
                          <option value="Ongoing">Ongoing</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Notes</FormLabel>
                        <Textarea
                          name="remarks"
                          value={values.remarks}
                          onChange={handleChange}
                          placeholder="Add notes or remarks"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Attachments</FormLabel>
                        <Input
                          type="file"
                          ref={fileRef}
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF (Max
                          1 file at a time)
                        </Text>

                        {fileAttachment.length > 0 ? (
                          fileAttachment.map((file, idx) => (
                            <HStack key={idx}>
                              <Text fontSize="sm" fontWeight="medium">
                                {file.name}
                              </Text>
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => removeAttachment(idx)}
                              >
                                Remove
                              </Button>
                            </HStack>
                          ))
                        ) : (
                          <Text color="gray.500" fontSize="sm">
                            No attachments
                          </Text>
                        )}
                      </FormControl>
                    </Stack>
                  </ModalBody>

                  <ModalFooter>
                    <Button
                      variant="ghost"
                      mr={3}
                      onClick={() => {
                        onClose();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      colorScheme="blue"
                      type="submit"
                      isLoading={isUpdating}
                    >
                      {editMode ? 'Update' : 'Save'}
                    </Button>
                  </ModalFooter>
                </Form>
              )}
            </Formik>
          </ModalContent>
        </Modal>
      </Box>

      <AlertDialogBox
        isDeleteOpen={isDeleteOpen}
        cancelRef={cancelRef}
        onCloseDelete={onCloseDelete}
        confirmDelete={confirmDelete}
        deleteLoading={deleteLoading}
      />
    </>
  );
};

export default Education;