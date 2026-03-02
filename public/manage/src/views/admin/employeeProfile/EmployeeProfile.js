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
  Toast,
  Card,
  CardBody,
} from 'reactstrap';
import classnames from 'classnames';
import userimage from '../../../assets/img/auth/Default_profileoic.jpg';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { setprofiledata } from 'store/actions';
import AssignedWork from '../employeeProfile/AssignedWork';
import EmployeeDoc from './EmployeeDoc';
import Spinner from 'components/common/Spinner';
import OffBoarding from './OffBoarding';
import EmployeeBankdetails from './EmployeeBankDetails';
import { setUsername } from 'store/actions';
import Personal from './Personal';
import Work from './Work';
import { decryptData } from 'utils/crypto';
import DashboardTab from '../profile/components/DashboardTab';
import { useParams } from 'react-router-dom';

const MyProfile = () => {
  const inputRef = useRef(null);
  const [image, setImage] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isEditingWorkInfo, setIsEditingWorkInfo] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [inputErrors, setInputErrors] = useState({});
  const [isImg, setIsImg] = useState(false);

  const [disable, setDisable] = useState(false);
  const [disableContact, setDisableContact] = useState(false);
  const roleId = decryptData(Cookies.get('role_id'));

  const dispatch = useDispatch();

  const id = useParams();
  const user_id = id.id;

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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

    setDisable(disable); // Set disable state based on validation
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

  const handleImageclick = () => {
    inputRef.current.click(); // Using ref to trigger file input
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Setting image using FileReader
        setIsImg(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  //  upload image function(take from here)
  const saveImage = async () => {
    const formDataa = new FormData();
    const id = decryptData(Cookies.get('user_id'));
    formDataa.append('file', inputRef.current.files[0]); // Append file from inputRef
    formDataa.append('id', id);
    try {
      // here we are calling upload image api
      const response = await httpInjectorService.uploadImage(formDataa);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error('Error while saving image:', err);
    }
  };

  const getUserDetails = async () => {
    try {
      const response = await httpInjectorService.getUsersDetails();
      if (response.status === 'success') {
        dispatch(setUsername(response.data.username));
      } else {
        dispatch(setUsername(''));
      }
    } catch (err) {
      dispatch(setUsername(''));
    }
  };

  const saveData = async () => {
    const processedData = Object.keys(formData).reduce((acc, key) => {
      acc[key] = formData[key] === '' ? ' ' : formData[key];
      return acc;
    }, {});

    try {
      // processedData = user_id;
      const response = await httpInjectorService.updateprofiledetails({
        user_id: user_id,
        ...processedData,
      });
      if (response.status === 'success') {
        toast.success(response.message, {
          // Display success toast
          position: 'top-right',
          autoClose: 3000,
        });
        getUserDetails();
      } else {
        toast.error(response.message, {
          // Display error toast
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(error, {
        // Display error toast
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      if (isImg) {
        saveImage();
        setIsImg(false);
      }
    }
  };

  const getData = async () => {
    const startTime = Date.now();
    setLoading(true);

    try {
      const id = decryptData(Cookies.get('user_id'));
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
        console.log('Profile Data:', profileData);
        dispatch(setprofiledata(getResponse.data));
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
      console.error('Error fetching profile data:', error);
    } 

  // enforce MINIMUM 2 seconds loader
  const elapsed = Date.now() - startTime;
  const remaining = 2000 - elapsed;

  setTimeout(() => {
    setLoading(false);
  }, remaining > 0 ? remaining : 0);
};

  useEffect(() => {
    getData();
  }, []);

  const options = async () => {
    try {
      const response = await httpInjectorService.getdepartment();
      if (response.status === 'success') {
        setDepartments(response.data);
      } else {
      }
    } catch (err) {}
  };

  const fetchDesignations = async () => {
    try {
      const response = await httpInjectorService.getdesignation();
      if (response.status === 'success') {
        setDesignations(response.data);
      } else {
        // toast.error(response.message, {
        //   position: 'top-right',
        // });
      }
    } catch (error) {
      // toast.error(error.message, {
      //   position: 'top-right',
      // });
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

  return (
    <React.Fragment>
      {/* {loading ? (
        <Spinner />
      ) : ( */}
        <>
          <Card
            className="shadow p-1 bg-white"
            style={{ borderRadius: '10px', marginTop: '80px' }}
          >
            <DashboardTab>
              <CardBody>
                <Nav tabs style={{ flexGrow: 1 }}>
                  {' '}
                  {/* Allow Nav to take up available space */}
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === '1' })}
                      onClick={() => toggleTab('1')}
                      style={{ cursor: 'pointer', color: 'purple' }}
                    >
                      <i className="bx bx-chat font-size-20 d-sm-none" />
                      <span className="d-none d-sm-block">Personal</span>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === '2' })}
                      onClick={() => toggleTab('2')}
                      style={{ cursor: 'pointer', color: 'purple' }}
                    >
                      <i className="bx bx-group font-size-20 d-sm-none" />
                      <span className="d-none d-sm-block">Work</span>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === '3' })}
                      onClick={() => toggleTab('3')}
                      style={{ cursor: 'pointer', color: 'purple' }}
                    >
                      <i className="bx bx-group font-size-20 d-sm-none" />
                      <span className="d-none d-sm-block">Documents</span>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === '4' })}
                      onClick={() => toggleTab('4')}
                      style={{ cursor: 'pointer', color: 'purple' }}
                    >
                      <span className="d-none d-sm-block"> Workweek </span>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === '5' })}
                      onClick={() => toggleTab('5')}
                      style={{ cursor: 'pointer', color: 'purple' }}
                    >
                      <span className="d-none d-sm-block"> Resignation </span>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === '6' })}
                      onClick={() => toggleTab('6')}
                      style={{ cursor: 'pointer', color: 'purple' }}
                    >
                      <span className="d-none d-sm-block"> Bank Details </span>
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={activeTab}>
                  <TabPane tabId="1">
                    <Personal
                      isEditingPersonal={isEditingPersonal}
                      setIsEditingPersonal={setIsEditingPersonal}
                      setIsEditingContact={setIsEditingContact}
                      disableContact={disableContact}
                      saveData={saveData}
                      disable={disable}
                      isEditingContact={isEditingContact}
                      validatePhoneNumber={validatePhoneNumber}
                      validateEmail={validateEmail}
                      formData={formData}
                      handleChange={handleChange}
                      handleDateChange={handleDateChange}
                      formErrors={formErrors}
                      inputRef={inputRef}
                      handleImageChange={handleImageChange}
                      handleImageclick={handleImageclick}
                      image={image}
                      inputErrors={inputErrors}
                    />{' '}
                  </TabPane>

                  <TabPane tabId="2">
                    <Work
                      isEditingBasicInfo={isEditingBasicInfo}
                      setIsEditingBasicInfo={setIsEditingBasicInfo}
                      roleId={roleId}
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
                    <EmployeeDoc activeTab={activeTab} />
                  </TabPane>
                  <TabPane tabId="4">
                    <AssignedWork activeTab={activeTab} />
                  </TabPane>
                  <TabPane tabId="5">
                    <OffBoarding activeTab={activeTab} />
                  </TabPane>
                  <TabPane tabId="6">
                    <EmployeeBankdetails activeTab={activeTab} />
                  </TabPane>
                </TabContent>
              </CardBody>
            </DashboardTab>
          </Card>
        </>
      {/* )} */}
    </React.Fragment>
  );
};

export default MyProfile;
