import React, { useEffect, useState } from 'react';
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
} from 'reactstrap';

import { toast } from 'react-toastify';

import httpInjectorService from 'services/http-injector.service';
// const roleId = decryptData(Cookies.get('role_id'));
import { decryptData } from 'utils/crypto';

import Cookies from 'js-cookie';
import { Pencil } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { BulletList } from 'react-content-loader';

const Work = () => {
  const [formData, setFormData] = useState({
    employee_id: '',
    date_of_joining: '',
    probation_period: '',
    employee_type: '',
    work_location: '',
    designations: '',
    department_name: '',
    subdepartment: '',
  });

  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isEditingWorkInfo, setIsEditingWorkInfo] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [originalData, setOriginalData] = useState({});

  const [loading, setLoading] = useState(true);

  const roleId = decryptData(Cookies.get('role_id'));
  const user_id = useParams();
  const id = user_id.id;

  // Fetch profile details
  const getProfileDataById = async () => {
    try {
      // const id = decryptData(Cookies.get('user_id'));

      if (!id) throw new Error('User ID not found');

      const response = await httpInjectorService.getProfiledetails(id);

      if (response?.data?.length > 0) {
        const user = response.data[0];
        const data = {
          employee_id: user.employee_id || '',
          date_of_joining: user.date_of_joining?.split('T')[0] || '',
          probation_period: user.probation_period || '',
          employee_type: user.employee_type || '',
          work_location: user.work_location || '',
          designations: user.designations || '',
          department_name: user.department_name?.trim() || '',
          subdepartment: user.subdepartment || '',
        };

        setFormData(data);
        setOriginalData(data); // ✅ Store original reference
      } else {
        toast.error('User not found');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load user data');
    } 
  };

  console.log('formData', formData);

  // Handle input changes (if editing)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Compare and send only updated fields to the backend
  const saveData = async () => {
    try {
      // Find only changed fields
      const updatedFields = Object.keys(formData).reduce((acc, key) => {
        if (formData[key] !== originalData[key]) {
          acc[key] = formData[key];
        }
        return acc;
      }, {});

      if (Object.keys(updatedFields).length === 0) {
        toast.info('No changes detected.');
        setIsEditingBasicInfo(false);
        setIsEditingWorkInfo(false);
        return;
      }

      console.log('Updated fields payload:', updatedFields);

      // ✅ Include user_id if backend expects it
      const payload = { user_id: id, ...updatedFields };

      // ✅ Send only changed data
      await httpInjectorService.updateprofiledetails(payload);

      toast.success('Profile updated successfully');

      // ✅ Refresh reference data
      setOriginalData(formData);

      // ✅ Turn off edit mode
      setIsEditingBasicInfo(false);
      setIsEditingWorkInfo(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    }
  };

  const fetchDepartments = async () => {
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

  // Load on mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
  
      await Promise.all([
        getProfileDataById(),
        fetchDepartments(),
        fetchDesignations(),
      ]);
  
      setLoading(false);
    };
  
    loadAllData();
  }, []);


  // Update subdepartments when department changes
  useEffect(() => {
    if (formData.department_name === '' || departments.length === 0) {
      return;
    }
    const dept_details = departments.filter(
      (department) => department.department_name === formData.department_name,
    );

    if (dept_details.length === 0) return;
    setSubDepartments(dept_details[0].subdepartments);
  }, [formData, departments]);

  return (
    <Box borderRadius="xl" shadow="sm">
      <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
        {/* Basic Info Card */}

        { loading ? (
          <BulletList />
        ) : (
          <>
            <Card className="shadow-sm border-0">
              <Box
                border="1px solid"
                borderColor="gray.200"
                // bg="gray.50"
                boxShadow="xs"
                borderRadius="lg"
                p={4}
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize="lg" fontWeight="bold">
                    Basic Info
                  </Text>

                  {roleId === 2 && (
                    <Flex gap={2}>
                      {isEditingBasicInfo ? (
                        <>
                          <Button
                            size="sm"
                            borderRadius="md"
                            colorScheme="purple"
                            onClick={() => {
                              saveData();
                              setIsEditingBasicInfo(false);
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            borderRadius="md"
                            colorScheme="gray"
                            variant="outline"
                            onClick={() => {
                              {
                                setFormData(originalData);
                                setIsEditingBasicInfo(false);
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          // borderRadius="md"
                          colorScheme="blue"
                          onClick={() => setIsEditingBasicInfo(true)}
                        >
                          <Pencil />
                        </Button>
                      )}
                    </Flex>
                  )}
                </Flex>

                {/* Fields */}
                <div className="row">
                  <div className="col-6 mb-3">
                    <strong>Employee ID</strong>
                    <input
                      type="text"
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleChange}
                      className="form-control"
                      disabled={!isEditingBasicInfo}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingBasicInfo ? '' : '#fff',
                        padding: '2px',
                      }}
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <strong>Date of Joining</strong>
                    <input
                      type="date"
                      name="date_of_joining"
                      value={formData.date_of_joining}
                      onChange={handleChange}
                      className="form-control"
                      disabled={!isEditingBasicInfo}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingBasicInfo ? '' : '#fff',
                        padding: '2px',
                      }}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-6 mb-3">
                    <strong>Probation Period (days)</strong>
                    <input
                      type="number"
                      name="probation_period"
                      value={formData.probation_period}
                      onChange={handleChange}
                      className="form-control"
                      disabled={!isEditingBasicInfo}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingBasicInfo ? '' : '#fff',
                        padding: '2px',
                      }}
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <strong>Employee Type</strong>
                    <select
                      name="employee_type"
                      value={formData.employee_type}
                      onChange={handleChange}
                      className="form-control"
                      disabled={!isEditingBasicInfo}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingBasicInfo ? '' : '#fff',
                        padding: '2px',
                      }}
                    >
                      <option>select</option>
                      <option value="intern">intern</option>
                      <option value="full-time">full-time</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-6 mb-3">
                    <strong>Work Location</strong>
                    <input
                      type="text"
                      name="work_location"
                      value={formData.work_location}
                      onChange={handleChange}
                      className="form-control"
                      disabled={!isEditingBasicInfo}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingBasicInfo ? '' : '#fff',
                        padding: '2px',
                      }}
                    />
                  </div>
                </div>
              </Box>
            </Card>

            {/* Work Info Card */}
            <Card className="shadow-sm border-0">
              <Box
                border="1px solid"
                borderColor="gray.200"
                // bg="gray.50"
                boxShadow="xs"
                borderRadius="lg"
                p={4}
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize="lg" fontWeight="bold">
                    Work Info
                  </Text>

                  {roleId === 2 && (
                    <Flex gap={2}>
                      {isEditingWorkInfo ? (
                        <>
                          <Button
                            size="sm"
                            borderRadius="md"
                            colorScheme="purple"
                            onClick={() => {
                              saveData();
                              setIsEditingWorkInfo(false);
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            borderRadius="md"
                            colorScheme="gray"
                            variant="outline"
                            onClick={() => {
                              {
                                setFormData(originalData);
                                setIsEditingWorkInfo(false);
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          // borderRadius="md"
                          colorScheme="blue"
                          onClick={() => setIsEditingWorkInfo(true)}
                        >
                          <Pencil />
                        </Button>
                      )}
                    </Flex>
                  )}
                </Flex>

                <div className="row">
                  <div className="col-6 mb-3">
                    <strong>Department</strong>
                    <Input
                      type="select"
                      name="department_name"
                      value={formData.department_name}
                      disabled={!isEditingWorkInfo}
                      onChange={(e) => {
                        const selectedDept = departments.find(
                          (dept) => dept.department_name === e.target.value,
                        );

                        setFormData((prevState) => ({
                          ...prevState,
                          department_name: selectedDept
                            ? selectedDept.department_name
                            : '',
                          // key : value
                          department_Id: selectedDept
                            ? selectedDept.department_id
                            : '',
                          subdepartment: '', // reset when department changes
                        }));
                      }}
                    >
                      <option value="">Select department</option>
                      {departments?.map((dept) => (
                        <option
                          key={dept.department_id}
                          value={dept.department_name}
                        >
                          {dept.department_name}
                        </option>
                      ))}
                    </Input>
                  </div>
                  <div className="col-6 mb-3">
                    <strong>SubDepartment</strong>
                    <Input
                      type="select"
                      name="subdepartment"
                      value={formData.subdepartment}
                      disabled={!isEditingWorkInfo}
                      onChange={(e) => {
                        const selectedSubDept = subDepartments.find(
                          (sub) => sub.subdepartment === e.target.value,
                        );

                        setFormData((prevState) => ({
                          ...prevState,
                          subdepartment: selectedSubDept
                            ? selectedSubDept.subdepartment
                            : '',
                          subdepartment_Id: selectedSubDept
                            ? selectedSubDept.subdepartment_id
                            : '',
                        }));
                      }}
                    >
                      <option value="">Select subdepartment</option>
                      {Array.isArray(subDepartments) &&
                      subDepartments.length > 0 ? (
                        subDepartments.map((subDept) => (
                          <option
                            key={subDept.subdepartment_id}
                            value={subDept.subdepartment}
                          >
                            {subDept.subdepartment}
                          </option>
                        ))
                      ) : (
                        <option value="">No subdepartments available</option>
                      )}
                    </Input>
                  </div>
                </div>

                <div className="row">
                  <div className="col-6 mb-3">
                    <strong>Designation</strong>
                    <Input
                      type="select"
                      name="designations"
                      value={formData.designations}
                      disabled={!isEditingWorkInfo}
                      onChange={(e) => {
                        const selectedDesignation = designations.find(
                          (d) => d.designations === e.target.value,
                        );

                        setFormData((prevState) => ({
                          ...prevState,
                          designations: selectedDesignation
                            ? selectedDesignation.designations
                            : '',
                          designation_Id: selectedDesignation
                            ? selectedDesignation.id
                            : '',
                        }));
                      }}
                    >
                      <option value="">Select designation</option>
                      {designations.map((d) => (
                        <option key={d.id} value={d.designations}>
                          {d.designations}
                        </option>
                      ))}
                    </Input>
                  </div>
                </div>
              </Box>
            </Card>
          </>
        )}
      </SimpleGrid>
    </Box>
  );
};

export default Work;
