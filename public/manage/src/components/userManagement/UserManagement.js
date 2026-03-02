import React, { useEffect, useState, useMemo } from 'react';
import {
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  IconButton,
  Box,
  Spinner as ChakraSpinner,
  HStack,
  Input,
  useDisclosure,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import TableContainer from 'components/common/TableContainer';
import { Switch } from '@chakra-ui/react';
import { Flex, FormControl, FormLabel, Select } from '@chakra-ui/react';
import Spinner from 'components/common/Spinner';
import { BulletList } from 'react-content-loader';
import {
  MdAddBox,
  MdCreate,
  MdDelete,
  MdRemoveRedEye,
  MdDownload,
  MdAccountBox,
} from 'react-icons/md';
import { FaUserPlus } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import httpInjectorService from 'services/http-injector.service'; // Ensure this path is correct
import { toast } from 'react-toastify';
import { Empty } from 'antd';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import UserModal from './UserModal';
import { Avatar } from '@chakra-ui/react';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [isSpinner, setIsSpinner] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filter, setFilter] = useState('sheet');
  const [selectedUser, setSelectedUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [formData, setFormData] = useState({
    department: '',
    subDepartment: '',
    designation: '',
  });

  const toggle = () => setModal(!modal);

  const roles = [
    { id: '2', name: 'Admin' },
    { id: '3', name: 'betauser' },
  ];

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await httpInjectorService.listorganizationusers();
      if (response.status === 'success') {
        setUsers(response.data);
      } else {
        console.error(response.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allUserIds = users.map((user) => user.user_id);
      setSelectedUsers(allUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleUserCheckboxChange = (userId) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };

  const deleteUserById = async (userId) => {
    setIsSpinner(true);
    try {
      const payload = { userIds: [userId] };
      const response = await httpInjectorService.deleteUser(payload);
      if (response.status === 'success') {
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.user_id !== userId),
        );
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setSelectedUsers([]);
        toggle();
        fetchUsers();
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        toggle();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Something went wrong', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSpinner(false);
    }
  };

  const getOrganizationDetails = async (userId) => {
    onOpen(); // Open immediately
    setSelectedUser(null); // Reset first to show loader
    try {
      const response =
        await httpInjectorService.getOrganizationDetailsById(userId);

      if (response.status === 'success') {
        const user = response.data;

        const dept = departments.find(
          (d) => d.department_name === user.Department,
        );
        const departmentId = dept ? dept.department_id : '';

        const subDept = dept?.subdepartments?.find(
          (sd) => sd.subdepartment === user.SubDepartment,
        );
        const subdepartmentId = subDept ? subDept.subdepartment_id : '';

        const designation = designations.find(
          (d) => d.designations === user.Designation,
        );
        const designationId = designation ? designation.id : '';

        const role = roles.find((r) => r.name === user.role);
        const role_id = role ? role.id : '';

        setSelectedUser({
          ...user,
          departmentId,
          subdepartmentId,
          designationId,
          role_id,
        });

        setSubDepartments(dept?.subdepartments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const options = async () => {
    try {
      const response = await httpInjectorService.getdepartment();
      console.log(response, 'options');
      if (response.status === 'success') {
        setDepartments(response.data);
        console.log(response.data, ' departments latest');
      }
    } catch (err) {
      // toast.error('error fetching departments', {
      //   position: 'top-right',
      console.log(err, '');
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await httpInjectorService.getdesignation();
      if (response.status === 'success') {
        console.log(response.data, 'may day may day');
        setDesignations(response.data);
      }
    } catch (error) {
      toast.error('error fetching designations', {
        position: 'top-right',
      });
    }
  };

  const updateUserDetails = async (data) => {
    try {
      const response = await httpInjectorService.updateUser(data);
      if (response.status === 'success') {
        toast.success(response.message || 'User updated successfully', {
          position: 'top-right',
          autoClose: 3000,
        });
        fetchUsers();
        onClose();
      } else {
        toast.error(response.message || 'Failed to update user', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Something went wrong while updating user', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // If any selected → download only selected
      // If none selected → download all filtered users
      const usersToDownload =
        selectedUsers.length > 0
          ? filteredUsers.filter((user) => selectedUsers.includes(user.user_id))
          : filteredUsers;

      if (usersToDownload.length === 0) {
        toast.error('No users to download!', { position: 'top-right' });
        return;
      }

      const columnsToInclude = [
        'Employee_id',
        'username',
        'Department',
        'Designation',
        'role',
        'IsActive',
      ];

      const convertToCSV = (jsonData) => {
        const headers = columnsToInclude;
        const rows = jsonData.map((row) =>
          headers.map((field) => JSON.stringify(row[field] ?? '')).join(','),
        );
        return [headers.join(','), ...rows].join('\n');
      };

      const csv = '\uFEFF' + convertToCSV(usersToDownload);
      const blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_${filter}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('File Downloaded!', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Error occurred during download!', {
        position: 'top-right',
      });
    }
  };

  useEffect(() => {
    options();
    fetchDesignations();
  }, []);

  useEffect(() => {
    if (selectedUser?.department || selectedUser?.Department) {
      const deptName = selectedUser.department || selectedUser.Department;
      const dept_details = departments.find(
        (d) => d.department_name === deptName,
      );
      if (dept_details) {
        setSubDepartments(dept_details.subdepartments || []);
      }
    }
  }, [selectedUser, departments, setSubDepartments]);

  const onchangeHandle = () => {
    navigate('/admin/addUser');
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'Active') return user.IsActive === 1;
    if (filter === 'Inactive') return user.IsActive === 0;
    return true; // For 'All'
  });

  const toggleUserStatus = async (userId, currentStatus, orgId) => {
    const newStatus = Number(currentStatus) === 1 ? 0 : 1; // Toggle status
    const payload = {
      user_id: userId,
      Is_Active: newStatus,
      org_id: orgId,
    };
    try {
      const response = await httpInjectorService.updateUserStatus(payload);
      if (response.status === 'success') {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === userId ? { ...user, IsActive: newStatus } : user,
          ),
        );
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
    } catch (error) {}
  };

  const columns = useMemo(() => [
    {
      id: 'selection',
      Header: (
        <Checkbox
          colorScheme="purple"
          isChecked={
            filteredUsers.length > 0 &&
            selectedUsers.length === filteredUsers.length
          }
          onChange={(e) => {
            if (e.target.checked) {
              const allIds = filteredUsers.map((u) => u.user_id);
              setSelectedUsers(allIds);
            } else {
              setSelectedUsers([]);
            }
          }}
        />
      ),
      Cell: ({ row }) => (
        <Checkbox
          colorScheme="purple"
          isChecked={selectedUsers.includes(row.original.user_id)}
          onChange={() => handleUserCheckboxChange(row.original.user_id)}
        />
      ),
    },
    {
      Header: 'Employee',
      accessor: 'username',
      Cell: ({ row }) => {
        const user = row.original;
        return (
          <HStack
            onClick={() => navigate(`/admin/profile/${user.user_id}`)}
            spacing={3}
          >
            <Avatar
              size="sm"
              name={user.username}
              src={user.profile_image || ''}
            />
            <Box>
              <Box fontWeight="semibold">{user.username}</Box>
              <Box fontSize="sm" color="gray.500">
                {user.email}
              </Box>
            </Box>
          </HStack>
        );
      },
    },
    {
      Header: 'Department',
      accessor: 'Department',
    },
    {
      Header: 'Designation',
      accessor: 'Designation',
    },
    {
      Header: 'Role',
      accessor: 'role',
    },
    {
      Header: 'Status',
      Cell: ({ row }) => {
        const { user_id, IsActive, org_id } = row.original;

        return (
          <HStack justifyContent="center" spacing={2}>
            <Switch
              colorScheme="green"
              isChecked={IsActive === 1}
              onChange={() => toggleUserStatus(user_id, IsActive, org_id)}
            />
            <Box
              px={2}
              py={1}
              borderRadius="md"
              fontSize="sm"
              fontWeight="medium"
              bg={IsActive === 1 ? 'green.100' : 'gray.200'}
              color={IsActive === 1 ? 'green.700' : 'gray.600'}
            >
              {IsActive === 1 ? 'Active' : 'InActive'}
            </Box>
          </HStack>
        );
      },
    },
    {
      Header: 'Actions',
      Cell: ({ row }) => {
        const user = row.original;

        return (
          <HStack justifyContent="center" spacing={2}>
            {/* Edit */}
            <Button
              size="xs"
              rounded={2}
              colorScheme="purple"
              leftIcon={<MdCreate />}
              onClick={() => getOrganizationDetails(user.user_id)}
            >
              Edit
            </Button>

            {/* Delete */}
            <Button
              size="xs"
              rounded={2}
              colorScheme="red"
              leftIcon={<MdDelete />}
              onClick={() => {
                setUserToDelete(user.user_id);
                toggle();
              }}
            >
              Delete
            </Button>
          </HStack>
        );
      },
    },
  ]);

  return (
    <React.Fragment>
      <div style={{ marginTop: '70px' }}>
        <Card>
          {isLoading ? (
            <Box mt={6}>
              <BulletList />
            </Box>
          ) : (
            <CardBody>
              <Flex justify="flex-end" align="center" gap="4">
                <FormControl width="200px">
                  <Select
                    id="user-status-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filter By status"
                    bg="white"
                    borderColor="#ccc"
                    boxShadow="sm"
                  >
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Select>
                </FormControl>

                <Button
                  colorScheme="purple"
                  size="sm"
                  leftIcon={<MdDownload />}
                  rounded={2}
                  onClick={handleDownload}
                  download
                >
                  Download
                </Button>

                <Button
                  rounded={2}
                  size="sm"
                  leftIcon={<FaUserPlus />}
                  onClick={onchangeHandle}
                  colorScheme="purple"
                >
                  Create User
                </Button>
              </Flex>
              {filteredUsers.length === 0 ? (
                <Box mt={6} textAlign="center">
                  <Empty description="No Users Found" />
                </Box>
              ) : (
                <TableContainer
                  columns={columns}
                  data={filteredUsers}
                  isGlobalFilter={true}
                  customPageSize={10}
                  className="custom-header-css"
                />
              )}

              <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader>Confirm Deletion</ModalHeader>
                <ModalBody>
                  Are you sure you want to delete the selected users?
                </ModalBody>
                <ModalFooter>
                  <Button
                    onClick={toggle}
                    colorScheme="purple"
                    size="sm"
                    rounded={2}
                    style={{
                      margin: '0 10px',
                      padding: '10px 20px',
                      fontWeight: 'bold',
                    }}
                  >
                    No
                  </Button>
                  <Button
                    onClick={() => {
                      setIsSpinner(true);
                      deleteUserById([userToDelete]);
                    }}
                    colorScheme="red"
                    size="sm"
                    disabled={isSpinner}
                    rounded={2}
                  >
                    {isSpinner ? <ChakraSpinner size="sm" /> : 'Yes'}
                  </Button>
                </ModalFooter>
              </Modal>

              <UserModal
                isOpen={isOpen}
                onClose={onClose}
                roles={roles}
                departments={departments}
                subDepartments={subDepartments}
                designations={designations}
                selectedUser={selectedUser}
                setSubDepartments={setSubDepartments}
                updateUserDetails={updateUserDetails}
              />
            </CardBody>
          )}
        </Card>
      </div>
    </React.Fragment>
  );
};

export default UserManagement;
