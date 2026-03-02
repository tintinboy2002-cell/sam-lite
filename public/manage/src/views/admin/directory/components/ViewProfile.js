import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Avatar,
  Flex,
  Text,
  useColorModeValue,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Input,
  Card,
  CardBody,
} from 'reactstrap';
import classnames from 'classnames';
import userimage from '../../../../assets/img/auth/Default_profileoic.jpg';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AssignedWork from './AssignedWork';
import EmployeeDoc from './EmployeeDoc';
import EmployeeEmergencyContact from './EmployeeEmergencyContact';
import EmployeeEductionDetails from './EmployeeEductionDetails';
import Spinner from 'components/common/Spinner';
import EmployeeBankdetails from './EmployeeBankDetails';
import Personal from './Personal';
import Work from './Work';
import { decryptData } from 'utils/crypto';
import gradient from 'assets/img/gradient.jpg';
import {
  MdPerson,
  MdWork,
  MdDescription,
  MdCalendarToday,
  MdAccountBalance,
  MdFamilyRestroom,
  MdSchool,
  MdAccountTree,
} from 'react-icons/md';
import ReportingContainer from 'views/admin/reporting/ReportingContainer';

const ViewProfile = () => {
  const { id } = useParams();
  const inputRef = useRef(null);
  const [image, setImage] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isEditingWorkInfo, setIsEditingWorkInfo] = useState(false);
  const [eligible, setIsEligible] = useState(false);
  const [uploaded, isUploaded] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disable, setDisable] = useState(false);
  const [disableContact, setDisableContact] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [inputErrors, setInputErrors] = useState({});
  const [isIdChanged, setIsIdChanged] = useState(false);
  const [originalData, setOriginalData] = useState({});

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    dob: '',
    blood_group: '',
    marital_status: '',
    gender: '',
    official_email_id: '',
    personal_email_id: '',
    phone_number: '',
    alternate_phone_number: '',
    currentAddress: '',
    permanentAddress: '',
    employee_id: '',
    date_of_joining: '',
    probation_period: '',
    employee_type: '',
    work_location: '',
    department: '',
    department_Id: '',
    subDepartment: '',
    designation: '',
    subdepartment_Id: '',
    designation_Id: '',
  });

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    const currentDate = new Date();
    const selectedDate = new Date(value);
    const age = currentDate.getFullYear() - selectedDate.getFullYear();
    const isOfAge =
      age > 18 ||
      (age === 18 &&
        (currentDate.getMonth() > selectedDate.getMonth() ||
          (currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getDate() >= selectedDate.getDate())));

    let errorMessage = '';
    let disable = false;

    if (selectedDate.getFullYear() > currentDate.getFullYear()) {
      errorMessage =
        'Invalid date of birth. The DOB must not exceed the current year.';
      disable = true;
    } else if (!isOfAge) {
      errorMessage = 'User must be at least 18 years old.';
      disable = true;
    }

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));

    setDisable(disable);
    handleChange(event);
  };

  const validateEmail = (event) => {
    const { name, value } = event.target;
    let errorMessage = '';

    if (!value.includes('@')) {
      errorMessage = "Invalid email. The email must contain '@'.";
      setDisableContact(true);
    } else {
      setDisableContact(false);
    }

    setInputErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));

    handleChange(event);
  };

  const validatePhoneNumber = (event) => {
    const { name, value } = event.target;
    let errorMessage = '';

    if (value.length < 10) {
      errorMessage =
        'Invalid phone number. The phone number must contain at least 10 digits.';
      setDisableContact(true);
    } else {
      setDisableContact(false);
    }

    setInputErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));

    handleChange(event);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'employee_id' && value !== originalData.employee_id) {
      setIsIdChanged(true);
    }
  
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageclick = () => {
    inputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
      isUploaded(true);
    }
  };

  const loginid = decryptData(Cookies.get('role_id'));

  useEffect(() => {
    if (loginid === 2) {
      setIsEligible(true);
    }

    getData();
  }, [loginid, id]);

  //  upload image function
  const saveImage = async () => {
    const adminid = decryptData(Cookies.get('user_id'));
    const formDataa = new FormData();
    formDataa.append('file', inputRef.current.files[0]);
    formDataa.append('id', id);
    formDataa.append('adminid', adminid);

    try {
      const response = await httpInjectorService.uploadImage(formDataa);
      if (response.status === 'success') {
        toast.success('Image saved successfully.', {
          position: 'top-right',
          autoClose: 3000,
        });
        isUploaded(!isUploaded);
      } else {
        toast.error('Failed to save image.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.error('Error while saving image.', {
        position: 'top-right',
        autoClose: 3000,
      });
      console.error('Error while saving image:', err);
    }
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const saveData = async () => {
    try {
      const numericFields = ['probation_period'];
  
      // ✅ Step 1: Find only changed fields
      const updatedFields = Object.keys(formData).reduce((acc, key) => {
        const currentValue = formData[key];
        const originalValue = originalData[key];
  
        // Skip if value hasn't changed
        if (currentValue === originalValue) {
          return acc;
        }
  
        // ✅ Handle numeric fields safely
        if (
          numericFields.includes(key) &&
          (currentValue === '' || currentValue === ' ')
        ) {
          // Skip sending empty numeric field
          return acc;
        }
  
        // Replace empty string with single space if needed
        acc[key] = currentValue === '' ? ' ' : currentValue;
  
        return acc;
      }, {});
  
      // ✅ If no changes detected
      if (Object.keys(updatedFields).length === 0 && !isIdChanged) {
        toast.info('No changes detected.');
        return;
      }
  
      if (!id) {
        console.error('ID is undefined');
        return;
      }
  
      // ✅ Prepare final payload
      const payload = {
        user_id: id,
        ...updatedFields,
        isIdChanged,
      };
  
      console.log('Updated fields payload:', payload);
  
      const response = await httpInjectorService.updateprofiledetails(payload);
  
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
  
        if (uploaded === true) {
          saveImage();
        }
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsIdChanged(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      if (!id) {
        throw new Error('Role ID not found in cookies');
      }

      const getResponse = await httpInjectorService.getProfiledetails(id);
      if (
        getResponse &&
        Array.isArray(getResponse.data) &&
        getResponse.data.length > 0
      ) {
        const profileData = getResponse.data[0];
        if (profileData.image_url) {
          setImage(profileData.image_url);
        } else {
          setImage('');
        }

        setFormData({
          username: profileData.username || '',
          dob: profileData.dob
            ? new Date(profileData.dob).toISOString().split('T')[0]
            : '',
          blood_group: profileData.blood_group || '',
          marital_status: profileData.marital_status || '',
          gender: profileData.gender || '',
          official_email_id: profileData.official_email_id || '',
          personal_email_id: profileData.personal_email_id || '',
          phone_number: profileData.phone_number || '',
          alternate_phone_number: profileData.alternate_phone_number || '',
          current_address: profileData.current_address || '',
          permanent_address: profileData.permanent_address || '',
          employee_id: profileData.employee_id || '',
          date_of_joining: profileData.date_of_joining
            ? new Date(profileData.date_of_joining).toISOString().split('T')[0]
            : '',
          probation_period: profileData.probation_period || '',
          employee_type: profileData.employee_type || '',
          work_location: profileData.work_location || '',
          designations: profileData.designations || '',
          department_name: profileData.department_name || '',
          subDepartment: profileData.subdepartment || '',
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching profile details:', error);
      toast.error('Failed to fetch profile details', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackButton = () => {
    navigate('/admin/directory');
  };

  const options = async () => {
    try {
      const response = await httpInjectorService.getdepartment();
      if (response.status === 'success') {
        setDepartments(response.data);
      }
    } catch (err) {
      // Error handling
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await httpInjectorService.getdesignation();
      if (response.status === 'success') {
        setDesignations(response.data);
      }
    } catch (error) {
      // Error handling
    }
  };

  useEffect(() => {
    options();
    fetchDesignations();
  }, []);

  useEffect(() => {
    if (formData.department === '' || departments.length === 0) {
      return;
    }
    const dept_details = departments.filter(
      (department) => department.department_name === formData.department,
    );
    if (dept_details.length === 0) return;
    setSubDepartments(dept_details[0].subdepartments);
  }, [formData, departments]);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const tabActiveBg = useColorModeValue('purple.500', 'purple.400');
  const tabInactiveBg = useColorModeValue('transparent', 'transparent');
  const tabActiveColor = useColorModeValue('white', 'white');
  const tabInactiveColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <React.Fragment>
      {loading ? (
        <Flex
          direction="column"
          align="center"
          justify="flex-start"
          w="100%"
          mt="80px"
        >
          <Spinner size="xl" color="purple.500" />
        </Flex>
      ) : (
        <Box bg={bgColor} minH="100vh" pt="50px" m={0}>
          {/* Banner with background image */}
          <Box
            position="relative"
            w="100%"
            bgImage={{ base: 'none', md: `url(${gradient})` }}
            bgSize="cover"
            bgPosition="center"
            bgRepeat="no-repeat"
            borderRadius="md"
            h={{ base: '36vh', md: '44vh', lg: '30vh' }}
          >
            <Box maxW="1400px" mx="auto">
              {/* Modern Tab Navigation */}
              <Box
                bg={cardBg}
                borderRadius="20px"
                p={2}
                mb={6}
                boxShadow="0 4px 20px rgba(0,0,0,0.08)"
              >
                <Flex
                  gap={2}
                  overflowX="auto"
                  css={{
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none',
                  }}
                >
                  <Button
                    onClick={() => toggleTab('1')}
                    bg={activeTab === '1' ? tabActiveBg : tabInactiveBg}
                    color={
                      activeTab === '1' ? tabActiveColor : tabInactiveColor
                    }
                    borderRadius="12px"
                    px={{ base: 4, md: 6 }}
                    py={{ base: 4, md: 5 }}
                    fontWeight="600"
                    fontSize="14px"
                    _hover={{
                      bg: activeTab === '1' ? 'purple.600' : 'gray.100',
                    }}
                    transition="all 0.3s"
                    title="Personal"
                    aria-label="Personal"
                  >
                    <Box
                      as="span"
                      display={{ base: 'inline-flex', md: 'none' }}
                      alignItems="center"
                      justifyContent="center"
                      fontSize="20px"
                      lineHeight="1"
                    >
                      <MdPerson />
                    </Box>
                    <Box as="span" display={{ base: 'none', md: 'inline' }}>
                      Personal
                    </Box>
                  </Button>

                  <Button
                    onClick={() => toggleTab('2')}
                    bg={activeTab === '2' ? tabActiveBg : tabInactiveBg}
                    color={
                      activeTab === '2' ? tabActiveColor : tabInactiveColor
                    }
                    borderRadius="12px"
                    px={{ base: 4, md: 6 }}
                    py={{ base: 4, md: 5 }}
                    fontWeight="600"
                    fontSize="14px"
                    _hover={{
                      bg: activeTab === '2' ? 'purple.600' : 'gray.100',
                    }}
                    transition="all 0.3s"
                    title="Work"
                    aria-label="Work"
                  >
                    <Box
                      as="span"
                      display={{ base: 'inline-flex', md: 'none' }}
                      alignItems="center"
                      justifyContent="center"
                      fontSize="20px"
                      lineHeight="1"
                    >
                      <MdWork />
                    </Box>
                    <Box as="span" display={{ base: 'none', md: 'inline' }}>
                      Work
                    </Box>
                  </Button>

                  <Button
                    onClick={() => toggleTab('3')}
                    bg={activeTab === '3' ? tabActiveBg : tabInactiveBg}
                    color={
                      activeTab === '3' ? tabActiveColor : tabInactiveColor
                    }
                    borderRadius="12px"
                    px={{ base: 4, md: 6 }}
                    py={{ base: 4, md: 5 }}
                    fontWeight="600"
                    fontSize="14px"
                    _hover={{
                      bg: activeTab === '3' ? 'purple.600' : 'gray.100',
                    }}
                    transition="all 0.3s"
                    title="Reporting"
                    aria-label="Reporting"
                  >
                    <Box
                      as="span"
                      display={{ base: 'inline-flex', md: 'none' }}
                      alignItems="center"
                      justifyContent="center"
                      fontSize="20px"
                      lineHeight="1"
                    >
                      <MdAccountTree />
                    </Box>
                    <Box as="span" display={{ base: 'none', md: 'inline' }}>
                      Reporting
                    </Box>
                  </Button>

                  {eligible && (
                    <>
                      <Button
                        onClick={() => toggleTab('4')}
                        bg={activeTab === '4' ? tabActiveBg : tabInactiveBg}
                        color={
                          activeTab === '4' ? tabActiveColor : tabInactiveColor
                        }
                        borderRadius="12px"
                        px={{ base: 4, md: 6 }}
                        py={{ base: 4, md: 5 }}
                        fontWeight="600"
                        fontSize="14px"
                        _hover={{
                          bg: activeTab === '4' ? 'purple.600' : 'gray.100',
                        }}
                        transition="all 0.3s"
                        title="Documents"
                        aria-label="Documents"
                      >
                        <Box
                          as="span"
                          display={{ base: 'inline-flex', md: 'none' }}
                          alignItems="center"
                          justifyContent="center"
                          fontSize="20px"
                          lineHeight="1"
                        >
                          <MdDescription />
                        </Box>
                        <Box as="span" display={{ base: 'none', md: 'inline' }}>
                          Documents
                        </Box>
                      </Button>

                      <Button
                        onClick={() => toggleTab('5')}
                        bg={activeTab === '5' ? tabActiveBg : tabInactiveBg}
                        color={
                          activeTab === '5' ? tabActiveColor : tabInactiveColor
                        }
                        borderRadius="12px"
                        px={{ base: 4, md: 6 }}
                        py={{ base: 4, md: 5 }}
                        fontWeight="600"
                        fontSize="14px"
                        _hover={{
                          bg: activeTab === '5' ? 'purple.600' : 'gray.100',
                        }}
                        transition="all 0.3s"
                        title="Work Week"
                        aria-label="Work Week"
                      >
                        <Box
                          as="span"
                          display={{ base: 'inline-flex', md: 'none' }}
                          alignItems="center"
                          justifyContent="center"
                          fontSize="20px"
                          lineHeight="1"
                        >
                          <MdCalendarToday />
                        </Box>
                        <Box as="span" display={{ base: 'none', md: 'inline' }}>
                          Work Week
                        </Box>
                      </Button>

                      <Button
                        onClick={() => toggleTab('6')}
                        bg={activeTab === '6' ? tabActiveBg : tabInactiveBg}
                        color={
                          activeTab === '6' ? tabActiveColor : tabInactiveColor
                        }
                        borderRadius="12px"
                        px={{ base: 4, md: 6 }}
                        py={{ base: 4, md: 5 }}
                        fontWeight="600"
                        fontSize="14px"
                        _hover={{
                          bg: activeTab === '6' ? 'purple.600' : 'gray.100',
                        }}
                        transition="all 0.3s"
                        title="Bank Details"
                        aria-label="Bank Details"
                      >
                        <Box
                          as="span"
                          display={{ base: 'inline-flex', md: 'none' }}
                          alignItems="center"
                          justifyContent="center"
                          fontSize="20px"
                          lineHeight="1"
                        >
                          <MdAccountBalance />
                        </Box>
                        <Box as="span" display={{ base: 'none', md: 'inline' }}>
                          Bank Details
                        </Box>
                      </Button>

                      <Button
                        onClick={() => toggleTab('7')}
                        bg={activeTab === '7' ? tabActiveBg : tabInactiveBg}
                        color={
                          activeTab === '7' ? tabActiveColor : tabInactiveColor
                        }
                        borderRadius="12px"
                        px={{ base: 4, md: 6 }}
                        py={{ base: 4, md: 5 }}
                        fontWeight="600"
                        fontSize="14px"
                        _hover={{
                          bg: activeTab === '7' ? 'purple.600' : 'gray.100',
                        }}
                        transition="all 0.3s"
                        whiteSpace="nowrap"
                        title="Family"
                        aria-label="Family"
                      >
                        <Box
                          as="span"
                          display={{ base: 'inline-flex', md: 'none' }}
                          alignItems="center"
                          justifyContent="center"
                          fontSize="20px"
                          lineHeight="1"
                        >
                          <MdFamilyRestroom />
                        </Box>
                        <Box as="span" display={{ base: 'none', md: 'inline' }}>
                          Family
                        </Box>
                      </Button>

                      <Button
                        onClick={() => toggleTab('8')}
                        bg={activeTab === '8' ? tabActiveBg : tabInactiveBg}
                        color={
                          activeTab === '8' ? tabActiveColor : tabInactiveColor
                        }
                        borderRadius="12px"
                        px={{ base: 4, md: 6 }}
                        py={{ base: 4, md: 5 }}
                        fontWeight="600"
                        fontSize="14px"
                        _hover={{
                          bg: activeTab === '8' ? 'purple.600' : 'gray.100',
                        }}
                        transition="all 0.3s"
                        title="Education"
                        aria-label="Education"
                      >
                        <Box
                          as="span"
                          display={{ base: 'inline-flex', md: 'none' }}
                          alignItems="center"
                          justifyContent="center"
                          fontSize="20px"
                          lineHeight="1"
                        >
                          <MdSchool />
                        </Box>
                        <Box as="span" display={{ base: 'none', md: 'inline' }}>
                          Education
                        </Box>
                      </Button>
                    </>
                  )}
                </Flex>
              </Box>

              {/* Content Card */}
              <Box
                bg={cardBg}
                borderRadius="20px"
                p={4}
                boxShadow="0 4px 20px rgba(0,0,0,0.08)"
              >
                <TabContent activeTab={activeTab}>
                  <TabPane tabId="1">
                    <Personal
                      isEditingPersonal={isEditingPersonal}
                      eligible={eligible}
                      setIsEditingPersonal={setIsEditingPersonal}
                      formData={formData}
                      handleChange={handleChange}
                      handleDateChange={handleDateChange}
                      formErrors={formErrors}
                      image={image}
                      inputRef={inputRef}
                      handleImageChange={handleImageChange}
                      handleImageclick={handleImageclick}
                      saveData={saveData}
                      disable={disable}
                      isEditingContact={isEditingContact}
                      setIsEditingContact={setIsEditingContact}
                      validateEmail={validateEmail}
                      inputErrors={inputErrors}
                      validatePhoneNumber={validatePhoneNumber}
                      disableContact={disableContact}
                    />
                  </TabPane>

                  <TabPane tabId="2">
                    <Work
                      eligible={eligible}
                      isEditingBasicInfo={isEditingBasicInfo}
                      setIsEditingBasicInfo={setIsEditingBasicInfo}
                      formData={formData}
                      handleChange={handleChange}
                      saveData={saveData}
                      isEditingWorkInfo={isEditingWorkInfo}
                      setIsEditingWorkInfo={setIsEditingWorkInfo}
                      departments={departments}
                      setFormData={setFormData}
                      subDepartments={subDepartments}
                      designations={designations}
                    />
                  </TabPane>

                  <TabPane tabId="3">
                    <ReportingContainer activeTab={activeTab} />
                  </TabPane>

                  <TabPane tabId="4">
                    <EmployeeDoc activeTab={activeTab} />
                  </TabPane>

                  <TabPane tabId="5">
                    <AssignedWork activeTab={activeTab} />
                  </TabPane>

                  <TabPane tabId="6">
                    <EmployeeBankdetails activeTab={activeTab} />
                  </TabPane>

                  <TabPane tabId="7">
                    <EmployeeEmergencyContact activeTab={activeTab} />
                  </TabPane>

                  <TabPane tabId="8">
                    <EmployeeEductionDetails activeTab={activeTab} />
                  </TabPane>
                </TabContent>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </React.Fragment>
  );
};

export default ViewProfile;
