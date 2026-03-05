import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Select,
  Text,
} from '@chakra-ui/react';
import Table from 'components/Table/Table.jsx';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@chakra-ui/react';

const CompanyReportingManager = ({
  users = [],
  loading = false,
  refreshUsers,
  isAdmin = false,
  isBetaUser = false,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [manager1, setManager1] = useState('');
  const [manager2, setManager2] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [managers, setManagers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteData, setDeleteData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isCreateManagerOpen, setIsCreateManagerOpen] = useState(false);
  const [selectedManagerUserId, setSelectedManagerUserId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [creatingManager, setCreatingManager] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Fetch Managers List api
  const fetchManagersList = async () => {
    try {
      const res = await httpInjectorService.getManagersList();
      if (res?.status === 'success') {
        setManagers(res.data || []);
      } else {
        toast.error(res?.message || 'Failed to fetch managers');
      }
    } catch (error) {
      toast.error('Failed to fetch managers');
    }
  };

  // const fetchDepartments = async () => {
  //   try {
  //     const res = await httpInjectorService.getUsersReportingList();

  //     const department = res?.data?.[0]?.department_name || null;

  //     console.log('department', department);

  //     setDepartments(department); // update state
  //   } catch (error) {
  //     console.error('Error fetching department:', error);
  //   }
  // };

  const fetchDepartments = async () => {
    try {
      const res = await httpInjectorService.getUsersReportingList();
  
      const uniqueDepartments = [
        ...new Map(
          res.data.map((u) => [
            u.department_id,
            {
              id: u.department_id,
              department_name: u.department_name,
            },
          ])
        ).values(),
      ];
  
      setDepartments(uniqueDepartments);
  
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchManagersList();
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, []);

  // handle open modal
  const openModal = (user) => {
    setSelectedUser(user);

    setManager1(user?.reportingAuthorities?.[0]?.id || '');
    setManager2(user?.reportingAuthorities?.[1]?.id || '');

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setManager1('');
    setManager2('');
    setIsModalOpen(false);
  };

  // Assign / Update handler functions
  const handleSubmit = async () => {
    if (!selectedUser) return;

    if (!manager1 && !manager2) {
      toast.error('Select at least one manager');
      return;
    }

    if (manager1 && manager2 && manager1 === manager2) {
      toast.error('Managers must be different');
      return;
    }

    // req payload that sends to the backend api
    const payload = {
      user_id: selectedUser.id,
      manager_id1: manager1 ? Number(manager1) : undefined,
      manager_id2: manager2 ? Number(manager2) : undefined,
    };

    try {
      setSubmitting(true);

      const hasExistingManagers =
        selectedUser?.reportingAuthorities?.length > 0;

      const res = hasExistingManagers
        ? await httpInjectorService.updateReportingManager(payload)
        : await httpInjectorService.assignReportingManager(payload);

      if (res?.status === 'success') {
        toast.success(res.message);
        closeModal();
        refreshUsers();
      } else {
        toast.error(res?.message || 'Operation failed');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteManager = async () => {
    if (!deleteData) return;

    const payload = {
      user_id: deleteData.userId,
      remove_manager1: deleteData.slot === 1,
      remove_manager2: deleteData.slot === 2,
    };

    try {
      setDeleteLoading(true);

      const res = await httpInjectorService.removeUserReportingManager(payload);

      if (res?.status === 'success') {
        toast.success(res?.message);
        setDeleteData(null);
        refreshUsers();
      } else {
        toast.error(res?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to remove manager');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateManager = async () => {
    if (!selectedManagerUserId) {
      toast.error('Select user');
      return;
    }

    const selectedUser = users.find(
      (u) => u.id === Number(selectedManagerUserId),
    );

    const payload = {
      user_id: Number(selectedManagerUserId),
      department_id: Number(selectedDepartmentId),
      manager_name: selectedUser?.name,
    };

    try {
      setCreatingManager(true);

      const res = await httpInjectorService.addReportingManager(payload);

      if (res?.status === 'success') {
        toast.success(res.message);
        setIsCreateManagerOpen(false);
        fetchManagersList();
      } else {
        toast.error(res?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    } finally {
      setCreatingManager(false);
    }
  };

  const columns = useMemo(() => {
    const baseColumns = [
      { header: 'Username', accessor: 'name' },
      ...(isBetaUser ? [] : [{ header: 'Role', accessor: 'role' }]),
      { header: 'Department', accessor: 'department' },
      { header: 'Designation', accessor: 'designation' },
      {
        header: 'Reporting Managers',
        accessor: 'reportingAuthorities',
        cell: (row) =>
          row.reportingAuthorities?.length
            ? row.reportingAuthorities.map((m, index) => {
                const slot = m.slot || index + 1;
                return (
                  <Box
                    key={m.id}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                  >
                    <Text fontSize="sm" mb="0">
                      {m.name}
                      {m.designation}
                    </Text>

                    {isAdmin && (
                      <Tooltip
                        label="Remove Manager"
                        aria-label="Remove Manager"
                      >
                        <Button
                          size="xs"
                          colorScheme="red"
                          // onClick={() => handleRemoveManager(row.id, slot)}
                          onClick={() =>
                            setDeleteData({
                              userId: row.id,
                              slot,
                              userName: row.name,
                              managerName: m.name,
                            })
                          }
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                );
              })
            : 'Assign Manager',
      },
    ];
    if (!isAdmin) return baseColumns;

    return [
      ...baseColumns,
      {
        header: 'Actions',
        accessor: 'actions',
        cell: (row) => (
          <Tooltip label="Assign Manager" aria-label="Assign Manager">
            <Button size="sm" colorScheme="teal" onClick={() => openModal(row)}>
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </Tooltip>
        ),
      },
    ];
  }, [isAdmin, isBetaUser]);

  return (
    <>
      <Box className="d-flex justify-content-between align-items-center">
        <Box
          className="card-header"
          py={4}
          textColor="black"
          fontSize="25px"
          fontWeight="bold"
        >
          Reporting Manager
        </Box>

        {isAdmin && (
          <Button
            colorScheme="blue"
            onClick={() => setIsCreateManagerOpen(true)}
          >
            Add Manager
          </Button>
        )}
      </Box>

      <Table data={users} columns={columns} loading={loading} />

      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Assign Reporting Managers for {selectedUser?.name}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Select
              placeholder="Select Manager 1"
              value={manager1}
              onChange={(e) => setManager1(e.target.value)}
              mb={3}
            >
              {managers.map((manager) => (
                <option
                  key={manager.reporting_manager_record_id}
                  value={manager.reporting_manager_record_id}
                >
                  {manager.manager_name}
                </option>
              ))}
            </Select>

            <Select
              placeholder="Select Manager 2 (Optional)"
              value={manager2}
              onChange={(e) => setManager2(e.target.value)}
            >
              {managers.map((manager) => (
                <option
                  key={manager.reporting_manager_record_id}
                  value={manager.reporting_manager_record_id}
                >
                  {manager.manager_name}
                </option>
              ))}
            </Select>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={closeModal}>
              Cancel
            </Button>

            <Button
              colorScheme="green"
              onClick={handleSubmit}
              isLoading={submitting}
            >
              {selectedUser?.reportingAuthorities?.length > 0
                ? 'Update'
                : 'Save'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteData}
        onClose={() => setDeleteData(null)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="red.500">Confirm Removal</ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            <Text>
              Are you sure you want to remove <b>{deleteData?.managerName}</b>{' '}
              as reporting manager for <b>{deleteData?.userName}</b>?
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={() => setDeleteData(null)}>
              Cancel
            </Button>

            <Button
              colorScheme="red"
              onClick={confirmDeleteManager}
              isLoading={deleteLoading}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Manager Modal */}
      <Modal
        isOpen={isCreateManagerOpen}
        onClose={() => setIsCreateManagerOpen(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Manager</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Select
              placeholder="Select User"
              value={selectedManagerUserId}
              onChange={(e) => setSelectedManagerUserId(e.target.value)}
              mb={3}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>

            <Select
              placeholder="Select Department"
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </Select>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={() => setIsCreateManagerOpen(false)}>
              Cancel
            </Button>

            <Button
              colorScheme="blue"
              onClick={handleCreateManager}
              isLoading={creatingManager}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CompanyReportingManager;
