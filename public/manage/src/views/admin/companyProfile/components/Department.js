import React, { useState, useEffect } from 'react';
import { Table, Input } from 'reactstrap';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  useDisclosure,
  Flex,
  Text,
  Card,
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@chakra-ui/react';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BulletList } from 'react-content-loader';
import { Empty } from 'antd';

const DepartmentTable = ({ activeTab }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [currentDepartmentIndex, setCurrentDepartmentIndex] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [deleteDeptId, setDeleteDeptId] = useState(null);

  const [formData, setFormData] = useState({
    department: '',
    departmentHead: '',
    subDepartments: [{ subDepartment: '', subDepartmentId: '' }],
  });

  const [errors, setErrors] = useState({
    department: '',
    subDepartments: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Validate to disallow empty or spaces-only input
    if (!value.trim()) {
      setErrors({
        ...errors,
        [name]: 'This field cannot be empty or contain only spaces.',
      });
    } else {
      setErrors({ ...errors, [name]: '' }); // Clear error on valid input
    }
    setFormData({
      ...formData,
      [name]: value, // Don't trim spaces here
    });
  };

  const handleSubDepartmentChange = (index, e) => {
    const { name, value } = e.target;
    const newSubDepartments = [...formData.subDepartments];
    newSubDepartments[index] = {
      ...newSubDepartments[index],
      [name]: value, // Don't trim spaces here
    };
    setFormData({ ...formData, subDepartments: newSubDepartments });

    setErrors((prevErrors) => {
      const newSubErrors = [...prevErrors.subDepartments];
      if (!value.trim()) {
        newSubErrors[index] =
          'Sub-department cannot be empty or contain only spaces.';
      } else {
        newSubErrors[index] = '';
      }
      return { ...prevErrors, subDepartments: newSubErrors };
    });
  };

  // Note that you may need to update your addSubDepartment function if you have validation there as well.

  const addSubDepartment = () => {
    const { subDepartments } = formData;
    if (subDepartments[0].subDepartment) {
      setFormData({
        ...formData,
        subDepartments: [
          ...subDepartments,
          { subDepartment: '', subDepartmentId: '' },
        ],
      });
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        subDepartments: [
          'Please fill the first sub-department before adding another.',
        ],
      }));
    }
  };

  const removeSubDepartment = (index) => {
    const newSubDepartments = formData.subDepartments.filter(
      (_, i) => i !== index,
    );

    // Only call deleteSubDepartment if it's an existing sub-department
    const subDepartmentId = formData.subDepartments[index].subDepartmentId; // Get the sub-department ID
    if (subDepartmentId) {
      const departmentId = departments[currentDepartmentIndex].id; // Get the current department ID
      deleteSubDepartment(departmentId, subDepartmentId); // Pass both IDs
    }

    setFormData({ ...formData, subDepartments: newSubDepartments });
  };

  const validateSubDepartments = () => {
    const { subDepartments } = formData;
    const newSubErrors = [];
    let isValid = true;

    subDepartments.forEach((subDept, index) => {
      if (!subDept.subDepartment.trim()) {
        isValid = false;
        newSubErrors[index] =
          'Sub-department cannot be empty or contain only spaces.';
      } else {
        newSubErrors[index] = '';
      }
    });

    setErrors((prevErrors) => ({
      ...prevErrors,
      subDepartments: newSubErrors,
    }));

    return isValid;
  };

  const validateDepartmentName = (name) => {
    return name.trim() !== ''; // Check if name is not empty after trimming
  };

  const onSave = async () => {
    const { department, subDepartments } = formData;

    let hasError = false;
    if (!department.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        department:
          'Department name is required or cannot contain only spaces.',
      }));
      hasError = true;
    } else if (!validateDepartmentName(department)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        department: 'Department name must contain valid characters.',
      }));
      hasError = true;
    }

    if (!validateSubDepartments()) {
      hasError = true;
    }

    if (hasError) return;

    const dataToSend = {
      ...formData,
      subDepartments: subDepartments.map((subDept) => ({
        subDepartment: subDept.subDepartment,
        subDepartmentId: subDept.subDepartmentId,
      })),
    };

    if (isEditing) {
      await handleUpdateDepartment(dataToSend);
    } else {
      await handleAddDepartment(dataToSend);
    }
    onAddClose();
    onEditClose();
  };

  const handleAddDepartment = async (dataToSend) => {
    try {
      const response = await httpInjectorService.postdepartment(dataToSend);
      if (response.status === 'success') {
        await getData();
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setDepartments([
          ...departments,
          { ...dataToSend, id: response.data.id },
        ]);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(error, {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };

  const handleUpdateDepartment = async (dataToSend) => {
    try {
      const updatedDepartment = {
        ...departments[currentDepartmentIndex],
        ...dataToSend,
      };
      const response = await httpInjectorService.updatedepartment(
        updatedDepartment,
      );
      if (response.status === 'success') {
        const updatedDepartments = [...departments];
        updatedDepartments[currentDepartmentIndex] = updatedDepartment;
        setDepartments(updatedDepartments);
        toast.success('Department updated successfully');
      } else {
        // toast.error('Failed to update department');
      }
    } catch (error) {
      toast.error('Error updating department');
    }
  };

  const handleEditDepartment = (index) => {
    setCurrentDepartmentIndex(index);
    setIsEditing(true);
    setFormData({
      department: departments[index].department,
      departmentHead: departments[index].departmentHead,
      subDepartments: departments[index].subDepartments.map((subDept) => ({
        subDepartment: subDept.subDepartment,
        subDepartmentId: subDept.subDepartmentId,
      })),
    });
    onEditOpen();
  };

  const deleteDepartment = async () => {
    if (deleteDeptId) {
      try {
        const response = await httpInjectorService.deletedepartment({
          departmentId: deleteDeptId,
        });
        if (response.status === 'success') {
          toast.success('Department deleted successfully');
          getData();
          setDeleteDeptId(null);
          onDeleteClose();
        } else {
          toast.error(response.message, {
            position: 'top-right',
            autoClose: 3000,
          });
          setDeleteDeptId(null);
          onDeleteClose();
        }
      } catch (error) {
        toast.error(error, {
          position: 'top-right',
          autoClose: 2000,
        });
        setDeleteDeptId(null);
        onDeleteClose();
      }
    }
  };

  const deleteSubDepartment = async (deptId, subdeptId) => {
    try {
      const response = await httpInjectorService.deletedepartment({
        departmentId: deptId,
        subDepartmentId: subdeptId,
      });
      if (response.status === 'success') {
        toast.success('SubDepartment deleted');
      } else {
        // toast.error('Failed to delete subdepartment');
      }
    } catch (err) {
      toast.error(err, {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };

  const getData = async () => {
    setLoading(true);
    try {
      const response = await httpInjectorService.getdepartment();
      if (response.data && response.data.length > 0) {
        const transformedData = response.data.map((dept) => ({
          id: dept.department_id,
          department: dept.department_name || 'N/A',
          departmentHead: dept.department_head || 'N/A',
          subDepartments: dept.subdepartments.map((subDept) => ({
            subDepartment: subDept.subdepartment,
            subDepartmentId: subDept.subdepartment_id,
            count: subDept.count,
          })),
        }));
        setDepartments(transformedData);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === '4') {
      getData();
    }
  }, [activeTab]);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      department: '',
      departmentHead: '',
      subDepartments: [{ subDepartment: '', subDepartmentId: '' }],
    });
    setErrors({ department: '', subDepartments: [] }); // Reset errors
    onAddOpen();
  };

  const deleteDepartmentModal = (id) => {
    setDeleteDeptId(id);
    onDeleteOpen();
  };

  return (
    <React.Fragment>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: '10px' }}>Departments</h2>
        <Tooltip label="Add Department" aria-label="Add Department">
          <Button colorScheme="purple" onClick={openAddModal}>
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </Tooltip>
      </div>
      {loading ? (
        <div className="text-center">
          <BulletList />
        </div>
      ) : departments.length > 0 ? (
        <Box
          overflowX={{ base: 'auto', md: 'visible' }}
          overflowY="hidden"
          width="100%"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
          }}
          sx={{
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}
        >
          <Table bordered style={{ minWidth: '600px', width: '100%' }}>
            <thead>
              <tr>
                <th>Serial No.</th>
                <th>Department</th>
                <th>Department Head</th>
                <th>Sub Departments</th>
                <th>Employees</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department, index) => (
                <tr key={department.id}>
                  <td>{index + 1}</td>
                  <td>{department.department}</td>
                  <td>{department.departmentHead}</td>
                  <td>
                    {department.subDepartments.map((subDept, subIndex) => (
                      <div key={subIndex}>{subDept.subDepartment}</div>
                    ))}
                  </td>
                  <td>
                    {department.subDepartments.map((subDept, idx) => (
                      <div key={idx}>{subDept.count}</div>
                    ))}
                  </td>
                  <td>
                    <Tooltip label="Edit Department" aria-label="Edit Department">
                      <Button
                        colorScheme="blue"
                        onClick={() => handleEditDepartment(index)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      label="Delete Department"
                      aria-label="Delete Department"
                    >
                      <Button
                        colorScheme="red"
                        onClick={() => deleteDepartmentModal(department.id)}
                        style={{ marginLeft: '10px' }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      ) : (
        <Card mt={2}>
          <Flex justify="center" align="center" height="200px">
            <Empty description="No data found" style={{ fontSize: '24px' }} />
          </Flex>
        </Card>
      )}

      {/* Modal for adding departments */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="3xl">
        <ModalOverlay />
        <ModalContent bg="#E1D1F4">
          <ModalHeader color="black">Add Department</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex direction="column">
              <FormControl mb={4}>
                <FormLabel color="black">Department</FormLabel>
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Department"
                />
                {errors.department && (
                  <Text color="red.500">{errors.department}</Text>
                )}
              </FormControl>
              <FormControl mb={4}>
                <FormLabel color="black">Department Head</FormLabel>
                <Input
                  name="departmentHead"
                  value={formData.departmentHead}
                  onChange={handleInputChange}
                  placeholder="Department Head"
                />
              </FormControl>
              {formData.subDepartments.map((subDept, subdepartment_id) => (
                <Flex key={subdepartment_id} mb={4}>
                  <FormControl mr={4}>
                    <FormLabel color="black">Sub Department</FormLabel>
                    <Input
                      name="subDepartment"
                      value={subDept.subDepartment}
                      onChange={(e) =>
                        handleSubDepartmentChange(subdepartment_id, e)
                      }
                      placeholder="Sub Department"
                    />
                    {errors.subDepartments[subdepartment_id] && (
                      <Text color="red.500">
                        {errors.subDepartments[subdepartment_id]}
                      </Text>
                    )}
                  </FormControl>
                  <Button
                    colorScheme="red"
                    onClick={() => {
                      removeSubDepartment(subdepartment_id);
                    }}
                    ml={2}
                    mt={8}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </Flex>
              ))}
              <Button colorScheme="green" onClick={addSubDepartment}>
                <FontAwesomeIcon icon={faPlus} /> Add Sub Department
              </Button>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onSave}>
              Save
            </Button>
            <Button onClick={onAddClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for editing departments */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="3xl">
        <ModalOverlay />
        <ModalContent bg="#E1D1F4">
          <ModalHeader color="black">Edit Department</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex direction="column">
              <FormControl mb={4}>
                <FormLabel color="black">Department</FormLabel>
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Department"
                />
                {errors.department && (
                  <Text color="red.500">{errors.department}</Text>
                )}
              </FormControl>
              <FormControl mb={4}>
                <FormLabel color="black">Department Head</FormLabel>
                <Input
                  name="departmentHead"
                  value={formData.departmentHead}
                  onChange={handleInputChange}
                  placeholder="Department Head"
                />
              </FormControl>
              {formData.subDepartments.map((subDept, index) => (
                <Flex key={index} mb={4}>
                  <FormControl mr={4}>
                    <FormLabel color="black">Sub Department</FormLabel>
                    <Input
                      name="subDepartment"
                      value={subDept.subDepartment}
                      onChange={(e) => handleSubDepartmentChange(index, e)}
                      placeholder="Sub Department"
                    />
                    {errors.subDepartments[index] && (
                      <Text color="red.500">
                        {errors.subDepartments[index]}
                      </Text>
                    )}
                  </FormControl>
                  <Button
                    colorScheme="red"
                    onClick={() => removeSubDepartment(index)}
                    ml={2}
                    mt={8}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </Flex>
              ))}
              <Button colorScheme="green" onClick={addSubDepartment}>
                <FontAwesomeIcon icon={faPlus} /> Add Sub Department
              </Button>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onSave}>
              Save
            </Button>
            <Button onClick={onEditClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this department?
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDeleteClose} colorScheme='purple' mr={3}>
              No
            </Button>
            <Button colorScheme="red" onClick={deleteDepartment}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default DepartmentTable;
