import {
  Button,
  HStack,
  Input,
  Card,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  useDisclosure,
  Flex,
  Spacer,
  Text,
  Box
} from '@chakra-ui/react';
import TableContainer from 'components/common/TableContainer';
import React, { useEffect, useMemo, useState } from 'react';
import { MdCreate, MdDelete, MdAdd } from 'react-icons/md';
import httpInjectorService from 'services/http-injector.service';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Empty } from 'antd';
import { BulletList } from 'react-content-loader';


const RoleManage = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isOpen: isRoleModalOpen,
    onOpen: onRoleModalOpen,
    onClose: onRoleModalClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  const getOrganizationRoles = async () => {
    setIsLoading(true);
    try {
      const response = await httpInjectorService.getOrganizationRoles();
      if (response.status === 'success') {
        setRoles(response.data);
      } else {
        setRoles([]);
      }
    } catch {
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getOrganizationRoles();
  }, []);

  const validationSchema = Yup.object({
    role_name: Yup.string().required('Role Name is required'),
    description: Yup.string().required('Description is required'),
  });

  const formik = useFormik({
    initialValues: {
      role_name: '',
      description: '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (selectedRole) {
          const reqBody = {
            role_name: values.role_name,
            role_id: selectedRole.role_id,
            description: values.description,
          };

          const response =
            await httpInjectorService.updateOrganizationRole(reqBody);
          if (response.status === 'success') {
            toast.success(response.message, {
              position: 'top-right',
              autoClose: 1000,
            });
          } else {
            toast.error(response.message, {
              position: 'top-right',
              autoClose: 1000,
            });
          }
        } else {
          const reqBody = {
            role_name: values.role_name,
            description: values.description,
          };
          const response =
            await httpInjectorService.createOrganizationRole(reqBody);
          if (response.status === 'success') {
            toast.success(response.message, {
              position: 'top-right',
              autoClose: 1000,
            });
          } else {
            toast.error(response.message, {
              position: 'top-right',
              autoClose: 1000,
            });
          }
        }

        onRoleModalClose();
        getOrganizationRoles();
      } catch (err) {
        toast.error(err.message, {
          position: 'top-right',
          autoClose: 1000,
        });
      }
    },
  });

  // Open Create
  const handleCreate = () => {
    setSelectedRole(null);
    formik.resetForm();
    onRoleModalOpen();
  };

  // Open Edit
  const handleEdit = (role) => {
    setSelectedRole(role);
    formik.setValues({
      role_name: role.role_name || '',
      description: role.description || '',
    });
    onRoleModalOpen();
  };

  // Delete
  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    onDeleteModalOpen();
  };

  const handleDeleteConfirm = async () => {
    try {
      const reqBody = {
        role_id: selectedRole.role_id,
      };

      const response =
        await httpInjectorService.deleteOrganizationRole(reqBody);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
      }
      onDeleteModalClose();
      getOrganizationRoles();
    } catch (err) {
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 1000,
      });
    }
  };

  const columns = useMemo(
    () => [
      { Header: 'Role Id', accessor: 'role_id' },
      { Header: 'Role Name', accessor: 'role_name' },
      { Header: 'Description', accessor: 'description' },
      {
        Header: 'Actions',
        Cell: ({ row }) => {
          const role = row.original;
          return (
            <HStack justifyContent="center" spacing={2}>
              <Button
                size="xs"
                colorScheme="purple"
                leftIcon={<MdCreate />}
                onClick={() => handleEdit(role)}
              >
                Edit
              </Button>

              <Button
                size="xs"
                colorScheme="red"
                leftIcon={<MdDelete />}
                onClick={() => handleDeleteClick(role)}
              >
                Delete
              </Button>
            </HStack>
          );
        },
      },
    ],
    [],
  );

  return (
    <React.Fragment>
      <div style={{ marginTop: '80px' }}>
        <Card>
          {isLoading ? (
            <Box mt={6}>
              <BulletList />
            </Box>
          ) : (
            <CardBody>
              <Flex mb={4}>
                <Text fontSize="xl" fontWeight="bold">
                  Role Management
                </Text>
                <Spacer />
                <Button
                  colorScheme="purple"
                  rounded={2}
                  size="sm"
                  leftIcon={<MdAdd />}
                  onClick={handleCreate}
                >
                  Create Role
                </Button>
              </Flex>
              {roles.length === 0 ? (
                <Box mt={6} textAlign="center">
                  <Empty description="No Users Found" />
                </Box>
              ) : (
                <TableContainer
                  columns={columns}
                  data={roles}
                  isGlobalFilter={true}
                  customPageSize={10}
                  className="custom-header-css"
                />
              )}
            </CardBody>
          )}
        </Card>
      </div>

      {/* ✅ Create / Edit Modal */}
      <Modal isOpen={isRoleModalOpen} onClose={onRoleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedRole ? 'Update Role' : 'Create Role'}
          </ModalHeader>
          <ModalCloseButton />

          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              {/* Role Name */}
              <FormControl
                mb={3}
                isInvalid={formik.touched.role_name && formik.errors.role_name}
              >
                <FormLabel>
                  Role Name<span className="text-danger">*</span>{' '}
                </FormLabel>
                <Input
                  name="role_name"
                  value={formik.values.role_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter role name"
                />
                <FormErrorMessage>{formik.errors.role_name}</FormErrorMessage>
              </FormControl>

              {/* Description */}
              <FormControl
                isInvalid={
                  formik.touched.description && formik.errors.description
                }
              >
                <FormLabel>
                  Description<span className="text-danger">*</span>
                </FormLabel>
                <Textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter description"
                />
                <FormErrorMessage>{formik.errors.description}</FormErrorMessage>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                mr={3}
                colorScheme="red"
                size="sm"
                rounded={2}
                onClick={onRoleModalClose}
              >
                Cancel
              </Button>
              <Button colorScheme="purple" size="sm" rounded={2} type="submit">
                {selectedRole ? 'Update' : 'Save'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to delete this role?</ModalBody>
          <ModalFooter>
            <Button rounded={2} size="sm" colorScheme='red' mr={3} onClick={onDeleteModalClose}>
              No
            </Button>
            <Button rounded={2} size="sm" colorScheme="purple" onClick={handleDeleteConfirm}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default RoleManage;
