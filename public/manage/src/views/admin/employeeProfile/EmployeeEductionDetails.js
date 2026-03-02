import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Image,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  IconButton,
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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { MdCreate, MdDelete, MdEdit, MdUpdate } from 'react-icons/md';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { decryptData } from 'utils/crypto';

const defaultForm = (userId) => ({
  education_level: '',
  user_id: userId,
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

const Education = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
  } = useDisclosure();

  const roleId = decryptData(Cookies.get('role_id'));
  const userId = decryptData(Cookies.get('user_id'));

  const cancelRef = useRef();
  const [educations, setEducations] = useState([]);
  const [form, setForm] = useState(defaultForm(userId));
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [originalForm, setOriginalForm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toDeleteEducation, setToDeleteEducation] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  /** Utility: diff between original and current form */
  const getChangedFields = (original, current) => {
    const diff = {};
    Object.keys(current).forEach((key) => {
      if (key === 'attachment') return;
      const origVal = original?.[key] || '';
      const newVal = current?.[key] || '';
      if (String(origVal) !== String(newVal)) diff[key] = newVal;
    });
    return diff;
  };

  /** Reset form to default */
  const resetForm = () => {
    setForm(defaultForm(userId));
    setEditMode(false);
    setEditingId(null);
    setOriginalForm(null);
  };

  /** Open Add Modal */
  const openAddModal = () => {
    resetForm();
    onOpen();
  };

  /** Open Edit Modal with data */
  const openEditModal = (data) => {
    const mapped = {
      ...defaultForm(userId),
      ...data,
      attachment: [], // do not overwrite local attachments with remote
    };
    setForm(mapped);
    setOriginalForm(mapped);
    setEditingId(data.education_id || data.id || null);
    setEditMode(true);
    onOpen();
  };

  /** Handle form field change */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** Handle file upload */
  const handleFileChange = (e) => {
    setForm((prev) => ({
      ...prev,
      attachment: Array.from(e.target.files || []),
    }));
  };

  /** Remove file */
  const removeAttachment = (index) => {
    setForm((prev) => ({
      ...prev,
      attachment: prev.attachment.filter((_, i) => i !== index),
    }));
  };

  /** Create / Update education */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, user_id: userId };

    // Edit flow (optimistic close + revert on failure)
    if (editMode && editingId) {
      if (isUpdating) return;
      setIsUpdating(true);

      // snapshot previous state so we can revert on error
      const prevEducations = [...educations];
      try {
        const changedFields = getChangedFields(originalForm, form);
        if (Object.keys(changedFields).length === 0) {
          toast.info('No changes detected.');
          setIsUpdating(false);
          // close modal even if nothing changed (user expectation)
          handleModalClose();
          return;
        }

        // optimistic update locally
        const matchesId = (edu) =>
          String(edu.education_id || edu.id) === String(editingId);
        setEducations((prev) =>
          prev.map((edu) =>
            matchesId(edu) ? { ...edu, ...changedFields } : edu,
          ),
        );

        // close modal immediately (optimistic UX)
        handleModalClose();

        const response = await httpInjectorService.updateeductiondeatils({
          ...changedFields,
          education_id: editingId,
          user_id: userId,
        });

        if (response?.status === 'success') {
          toast.success(response.message || 'Education updated successfully');
          // replace with authoritative data from server if provided
          if (response.data) {
            setEducations((prev) =>
              prev.map((edu) => (matchesId(edu) ? response.data : edu)),
            );
          }
        } else {
          toast.error(response?.message || 'Failed to update education');
          // revert optimistic change
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
      // Create flow (optimistic close + revert on failure)
      if (isUpdating) return;
      setIsUpdating(true);
      const prevEducations = [...educations];
      try {
        // close modal immediately for a snappier UX
        handleModalClose();

        const response = await httpInjectorService.addeductiondeatils(payload);
        if (response?.status === 'success') {
          toast.success(response.message || 'Education added successfully');
          setEducations((prev) => [response.data, ...prev]);
        } else {
          toast.error(response?.message || 'Failed to add education');
          setEducations(prevEducations);
          // reopen modal so user can retry
          onOpen();
        }
      } catch (err) {
        console.error('Create error:', err);
        toast.error('Error adding education');
        setEducations(prevEducations);
        onOpen();
      } finally {
        setIsUpdating(false);
      }
    }
  };

  /** Delete education */
  const handleDelete = async (education_id) => {
    try {
      const response = await httpInjectorService.deleteeductiondeatils({
        education_id,
        user_id: userId,
      });
      if (response?.status === 'success') {
        toast.success(response.message || 'Education deleted successfully');
        setEducations((prev) =>
          prev.filter((edu) => edu.education_id !== education_id),
        );
      } else toast.error(response?.message || 'Failed to delete education');
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

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  /** Fetch Education List */
  const fetchEducationData = async () => {
    try {
      const response = await httpInjectorService.geteductiondeatils(userId);
      if (response.status === 'success') {
        setEducations(response.data || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchEducationData();
  }, []);

  return (
    <>
      <Box>
        <HStack justify="space-between" mb={6}>
          <Heading size="md">Educational Info</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={openAddModal}
          >
            Add Education
          </Button>
        </HStack>

        {/* Education Cards */}
        <VStack spacing={4} align="stretch">
          {educations.length > 0 ? (
            educations.map((data) => (
              <Box
                key={data.education_id}
                borderRadius="md"
                borderWidth="1px"
                p={4}
              >
                {/* Responsive stack: column on mobile, row on md+ */}
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  spacing={4}
                  align="start"
                >
                  {/* Image column - centered on mobile */}
                  <Box flexShrink={0} textAlign="center">
                    <Image
                      boxSize={{ base: '60px', md: '80px' }}
                      objectFit="cover"
                      mx={{ base: 'auto', md: '0' }}
                      mb={{ base: 2, md: 0 }}
                    />
                  </Box>

                  {/* Content column */}
                  <Box flex="1">
                    <Text fontWeight="bold">
                      {data.education_level || 'No data'}
                    </Text>
                    <Text color="gray.500">
                      {data.degree_name || 'No data'}
                    </Text>
                    <Text color="gray.500">
                      {data.field_of_study || 'No data'}
                    </Text>
                    <Text color="gray.500">
                      {data.institute || 'No data'}
                    </Text>
                    <Text color="gray.500">
                      {data.university_name || 'No data'}
                    </Text>
                    <Text color="gray.500">
                      {data.start_date || 'No date'} -{' '}
                      {data.end_date || 'No date'}
                    </Text>

                    {/* <Text color="gray.500">
                      {data.country ? `Country: ${data.country}` : 'No data'}
                    </Text>
                    <Text color="gray.500">
                      {data.grade ? `Grade: ${data.grade}` : 'No data'}
                    </Text>
                    <Text color="gray.500">
                      {data.mode_of_study
                        ? `Mode: ${data.mode_of_study}`
                        : 'No data'}
                    </Text> */}
                    <Text color="gray.500">
                      {data.status ? `Status: ${data.status}` : 'No data'}
                    </Text>
                    {/* <Box mt={2} bg="gray.100" p={2} borderRadius="md">
                      <Text color="gray.500">
                        {data.remarks
                          ? `Notes: ${data.remarks}`
                          : 'No notes added yet 📝'}
                      </Text>
                    </Box> */}
                  </Box>

                  {/* Actions column - on row layout this sits to the far right */}
                  <Box alignSelf={{ base: 'flex-start' }}>
                    <HStack spacing={2}>
                      <EditIcon
                        onClick={() => openEditModal(data)}
                        color="purple"
                        style={{ cursor: 'pointer', width: '25px', height: '25px' }}
                      />
                    
                        <DeleteIcon
                          onClick={() => {
                            setToDeleteEducation(data.education_id);
                            onOpenDelete();
                          }}
                          size="25"
                          color="red"
                          style={{ cursor: 'pointer' }}
                        />
                      
                    </HStack>
                  </Box>
                </Stack>
              </Box>
            ))
          ) : (
            <Box borderRadius="md" borderWidth="1px" p={4}>
              <HStack>
                {/* <img src={college} alt="" width={80} /> */}
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

        {/* Add / update Modal */}
        <Modal isOpen={isOpen} onClose={handleModalClose} size="lg" isCentered>
          <ModalOverlay />
          <ModalContent>
            <form onSubmit={handleSubmit}>
              <ModalHeader>
                {editMode ? 'Update Education' : 'Add Education'}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack spacing={4}>
                  {/* Education Level */}
                  <FormControl isRequired>
                    <FormLabel>Education Level</FormLabel>
                    <Select
                      name="education_level"
                      value={form.education_level}
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
                  </FormControl>

                  {/* Degree and Field */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Degree Name</FormLabel>
                      <Input
                        name="degree_name"
                        value={form.degree_name}
                        onChange={handleChange}
                        placeholder="e.g., BCA"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Field of Study</FormLabel>
                      <Input
                        name="field_of_study"
                        value={form.field_of_study}
                        onChange={handleChange}
                        placeholder="e.g., Computer Science"
                      />
                    </FormControl>
                  </SimpleGrid>

                  {/* Institute and University */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Institute</FormLabel>
                      <Input
                        name="institute"
                        value={form.institute}
                        onChange={handleChange}
                        placeholder="Institute Name"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>University Name</FormLabel>
                      <Input
                        name="university_name"
                        value={form.university_name}
                        onChange={handleChange}
                        placeholder="University Name"
                      />
                    </FormControl>
                  </SimpleGrid>

                  {/* Dates */}
                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel>From</FormLabel>
                      <Input
                        type="text"
                        id="customDate"
                        placeholder="YYYY/MM/DD"
                        pattern="\d{4}/\d{2}/\d{2}"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleChange}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>To</FormLabel>
                      <Input
                        type="text"
                        id="customDate"
                        placeholder="YYYY/MM/DD"
                        pattern="\d{4}/\d{2}/\d{2}" 
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel>Grade</FormLabel>
                    <Input
                      name="grade"
                      value={form.grade}
                      onChange={handleChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Country</FormLabel>
                    <Input
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                    />
                  </FormControl>

                  {/* Mode of Study */}
                  <FormControl isRequired>
                    <FormLabel>Mode of Study</FormLabel>
                    <Select
                      name="mode_of_study"
                      value={form.mode_of_study}
                      onChange={handleChange}
                      placeholder="Select mode"
                    >
                      <option value="Part Time">Part Time</option>
                      <option value="Full Time">Full Time</option>
                      <option value="Distance">Distance</option>
                      <option value="Online">Online</option>
                    </Select>
                  </FormControl>

                  {/* Status */}
                  <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      placeholder="Select status"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Ongoing">Ongoing</option>
                    </Select>
                  </FormControl>

                  {/* Notes */}
                  <FormControl>
                    <FormLabel>Notes</FormLabel>
                    <Textarea
                      name="remarks"
                      value={form.remarks}
                      onChange={handleChange}
                      placeholder="Add notes or remarks"
                    />
                  </FormControl>

                  {/* Attachments */}
                  <FormControl>
                    <FormLabel>Attachments</FormLabel>
                    <Input type="file" multiple onChange={handleFileChange} />
                    {form.attachment.length > 0 && (
                      <VStack align="stretch" spacing={2} mt={2}>
                        {form.attachment.map((file, idx) => (
                          <HStack key={idx} justify="space-between">
                            <Text fontSize="sm">{file.name}</Text>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => removeAttachment(idx)}
                            >
                              Remove
                            </Button>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </FormControl>
                </Stack>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={handleModalClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" type="submit" isLoading={isUpdating}>
                  {editMode ? 'Update' : 'Save'}
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </Box>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCloseDelete}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Education
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this education record? This action
              cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCloseDelete}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deleteLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Education;