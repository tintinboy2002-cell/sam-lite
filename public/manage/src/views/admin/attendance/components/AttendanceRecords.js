import React, { useEffect, useMemo, useState } from 'react';
import TableContainer from 'components/common/TableContainer';
import httpInjectorService from 'services/http-injector.service';
import { Badge, Row, Col } from 'reactstrap';
import { ImCross } from 'react-icons/im';
import { TiTick } from 'react-icons/ti';
import { toast } from 'react-toastify';
import {
  Card,
  CardBody,
  Button,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Box,
  HStack,
  VStack,
  Text,
} from '@chakra-ui/react';
import { BulletList } from 'react-content-loader';
import { Empty } from 'antd';
import { MdRemoveRedEye } from 'react-icons/md';

// const epochToIST = (epochTime) => {
//   const date = new Date(epochTime * 1000);
//   return date.toLocaleTimeString('en-IN', {
//     hour12: true,
//     timeZone: 'Asia/Kolkata',
//   });
// };

const epochToIST = (epochTime) => {
  const date = new Date(epochTime * 1000); // Convert seconds to milliseconds
  return date.toLocaleTimeString('en-IN', {
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
};

const AttendanceRecords = ({ activeTab }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getusers = async () => {
    try {
      setLoading(true);
      const response = await httpInjectorService.getPendingRequestUsers();
      if (response?.data) {
        const updatedData = response.data.map((Employee) => ({
          ...Employee,
          formatted_date: formatDate(Employee.date),
          formattedClockIn: Employee.clock_in_epoch
            ? epochToIST(Employee.clock_in_epoch)
            : '--',
          formattedClockOut: Employee.clock_out_epoch
            ? epochToIST(Employee.clock_out_epoch)
            : '--',
        }));
        console.log(updatedData);
        setUsers(updatedData, 'update');
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === '3') {
      getusers();
    }
  }, [activeTab]);

  const postRequestStatus = async (id, status, showToast = true) => {
    try {
      const payload = { issue_id: id, action: status };
      const response = await httpInjectorService.postRequestStatus(payload);

      if (showToast && response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 2000,
        });
      }
      getusers();
      return response;
    } catch (error) {
      if (showToast) {
        toast.error('Error updating request status.');
      }
      console.error('Error updating request status:', error);
    }
  };

  //  Bulk approve all
  const handleApproveAll = async () => {
    if (selectedUsers.length === 0) return;
    try {
      await Promise.all(
        selectedUsers.map((id) => postRequestStatus(id, 'APPROVE', false)),
      );
      toast.success('All selected requests approved!', {
        position: 'top-right',
        autoClose: 2000,
      });
      setSelectedUsers([]);
      setAllSelected(false);
      getusers();
    } catch (error) {
      toast.error('Error approving all requests.');
    }
  };

  const handleRejectAll = async () => {
    if (selectedUsers.length === 0) return;
    try {
      await Promise.all(
        selectedUsers.map((id) => postRequestStatus(id, 'REJECT', false)),
      );
      toast.info('All selected requests rejected.', {
        position: 'top-right',
        autoClose: 2000,
      });
      setSelectedUsers([]);
      setAllSelected(false);
      getusers();
    } catch (error) {
      toast.error('Error rejecting all requests.');
    }
  };

  // Toggle Select All
  const toggleAllSelection = () => {
    const pendingIds = users
      .filter((item) => item.status === 'PENDING')
      .map((item) => item.id);

    if (allSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(pendingIds);
    }
    setAllSelected(!allSelected);
  };

  //  Toggle single row
  const toggleRowSelection = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id],
    );
  };

  //  Sync Select All checkbox when rows are selected/deselected
  useEffect(() => {
    const pendingIds = users
      .filter((item) => item.status === 'PENDING')
      .map((item) => item.id);
    setAllSelected(
      pendingIds.length > 0 &&
        pendingIds.every((id) => selectedUsers.includes(id)),
    );
  }, [selectedUsers, users]);

  const handleViewDetails = async (user) => {
  setSelectedUserData(null);
  onOpen();
  setModalLoading(true);

  try {
    const response = await httpInjectorService.aprovalViewDetails(user.id);
    const data = response?.data?.[0];

    if (data) {
      const formatted_date = new Date(data.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      // ✅ Same function, but manually add +5:30
      const formatSameTime = (utcString) => {
        if (!utcString) return '—';
        const date = new Date(utcString);

        // manually add +5 hours 30 minutes
        date.setMinutes(date.getMinutes() + 330);

        let hours = date.getUTCHours();
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        return `${hours}:${minutes} ${ampm}`;
      };

      const formattedClockIn = formatSameTime(data.clock_in_time);
      const formattedClockOut = formatSameTime(data.clock_out_time);

      setSelectedUserData({
        ...data,
        formatted_date,
        formattedClockIn,
        formattedClockOut,
      });
    }
  } catch (error) {
    console.error('Error fetching view details:', error);
  } finally {
    setModalLoading(false);
  }
};

  const columns = useMemo(
    () => [
      {
        Header: (
          <Checkbox
            colorScheme="purple"
            isChecked={allSelected}
            isIndeterminate={
              selectedUsers.length > 0 &&
              selectedUsers.length <
                users.filter((u) => u.status === 'PENDING').length
            }
            onChange={toggleAllSelection}
          />
        ),
        accessor: 'select',
        Cell: ({ row }) =>
          row.original.status === 'PENDING' && (
            <Checkbox
              colorScheme="purple"
              isChecked={selectedUsers.includes(row.original.id)}
              onChange={() => toggleRowSelection(row.original.id)}
            />
          ),
      },
      {
        Header: 'Date',
        accessor: 'formatted_date',
      },
      {
        Header: 'Employee Name',
        accessor: 'username',
      },
      {
        Header: 'Clock In',
        accessor: 'formattedClockIn',
      },
      {
        Header: 'Clock Out',
        accessor: 'formattedClockOut',
      },
      {
        Header: 'Reason',
        accessor: 'reason',
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => {
          let color =
            value === 'APPROVED'
              ? 'success'
              : value === 'REJECTED'
              ? 'danger'
              : value === 'PENDING'
              ? 'warning'
              : 'secondary';
          return <Badge color={color}>{value}</Badge>;
        },
      },
      {
        Header: 'Action',
        id: 'action',
        Cell: ({ row }) => {
          const user = row.original;
          const isPending = user.status === 'PENDING';

          return (
            <div className="d-flex justify-content-center align-items-center">
              {isPending && (
                <>
                  <TiTick
                    size="28"
                    color="purple"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => postRequestStatus(user.id, 'APPROVE')}
                  />
                  <ImCross
                    size="18"
                    color="red"
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => postRequestStatus(user.id, 'REJECT')}
                  />
                </>
              )}
              <MdRemoveRedEye
                size="25"
                color="purple"
                style={{ cursor: 'pointer', marginRight: '10px' }}
                onClick={() => handleViewDetails(user)}
              />
            </div>
          );
        },
      },
    ],
    [users, selectedUsers, allSelected],
  );

  return (
    <React.Fragment>
      <Card className="shadow bg-white mt-3">
        {loading ? (
          <div>
            <BulletList />
          </div>
        ) : (
          <CardBody>
            {users.length === 0 ? (
              <div>
                <Empty />
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'end',
                    alignItems: 'center',
                  }}
                >
                  <Button
                    colorScheme="purple"
                    disabled={selectedUsers.length === 0}
                    onClick={handleApproveAll}
                    style={{ marginRight: '10px' }}
                  >
                    Approve All
                  </Button>
                  <Button
                    colorScheme="red"
                    disabled={selectedUsers.length === 0}
                    onClick={handleRejectAll}
                  >
                    Reject All
                  </Button>
                </div>
                <div
                  className="page-content"
                  style={{ borderRadius: '10px', marginTop: '20px' }}
                >
                  <TableContainer
                    columns={columns}
                    data={users}
                    isGlobalFilter={true}
                    customPageSize={10}
                    className="custom-header-css"
                  />
                </div>
              </>
            )}
          </CardBody>
        )}
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Attendance Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUserData ? (
              <Box fontSize="md" color="gray.700">
                <VStack align="start" spacing={3}>
                  <HStack justify="space-between" w="100%">
                    <Text>
                      <strong>Date:</strong> {selectedUserData.formatted_date}
                    </Text>
                    <Text>
                      <strong>Employee:</strong> {selectedUserData.username}
                    </Text>
                  </HStack>

                  <HStack justify="space-between" w="100%">
                    <Text>
                      <strong>Department:</strong>{' '}
                      {selectedUserData.department_name}
                    </Text>
                    <Text>
                      <strong>Designation:</strong>{' '}
                      {selectedUserData.designation_name}
                    </Text>
                  </HStack>

                  <HStack justify="space-between" w="100%">
                    <Text>
                      <strong>Clock In:</strong>{' '}
                      {selectedUserData.formattedClockIn}
                    </Text>
                    <Text>
                      <strong>Clock Out:</strong>{' '}
                      {selectedUserData.formattedClockOut}
                    </Text>
                  </HStack>

                  <Text>
                    <strong>Reason:</strong> {selectedUserData.reason || '—'}
                  </Text>

                  <HStack justify="space-between" w="100%">
                    <HStack>
                      <Text>
                        <strong>Status:</strong>
                      </Text>
                      <Badge
                        colorScheme={
                          selectedUserData.status === 'APPROVED'
                            ? 'green'
                            : selectedUserData.status === 'REJECTED'
                            ? 'red'
                            : 'orange'
                        }
                      >
                        {selectedUserData.status}
                      </Badge>
                    </HStack>
                    <Text>
                      <strong>Approver:</strong>{' '}
                      {selectedUserData.approver_name}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            ) : (
              <Text>No details available.</Text>
            )}
          </ModalBody>

          <ModalFooter />
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default AttendanceRecords;
