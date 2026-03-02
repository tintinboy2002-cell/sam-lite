import React, { useEffect, useMemo, useState } from 'react';
import TableContainer from 'components/common/TableContainer';
import httpInjectorService from 'services/http-injector.service';
import {
  CardTitle,
  Col,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Row,
} from 'reactstrap';
import {
  LeaveType,
  StartDate,
  EndDate,
  Days,
  AppliedOn,
  Status,
  Actions,
  EmployeeId,
  EmployeeName,
  Delete,
} from './EmployeeLogsCol';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { BulletList } from 'react-content-loader';
import './LeaveViewDetails.css';
import { Button, Checkbox } from '@chakra-ui/react';
import { Empty } from 'antd';
import { Header } from 'stories/Header';
import { Await } from 'react-router-dom';
import { set } from 'lodash';
import { decryptData } from 'utils/crypto';

const EmployeeLogs = ({ activeTab }) => {
  const [employeeLogs, setEmployeeLogs] = useState([]);
  const role_id = decryptData(Cookies.get('role_id'));
  const user_role = decryptData(Cookies.get('userRole'));
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewdetails, setViewDetails] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [leaveApplicationId, setLeaveApplicationId] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allSelected, setAllSelected] = useState(false);

  const formatDate = (date) => {
    if (!date) return 'N/A';

    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';

    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const handleViewDetails = (isOpen) => {
    setShowModal(isOpen);
  };

  const onOpenModal = (isOpen) => {
    setOpenDeleteModal(isOpen);
  };

  const deleteLeaveApplication = async () => {
    const reqBody = {
      leave_application_id: leaveApplicationId,
    };
    try {
      const response = await httpInjectorService.deleteLeaveApplication(
        reqBody,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setOpenDeleteModal(false);
        getEmployeeLogs();
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setOpenDeleteModal(false);
        getEmployeeLogs();
      }
    } catch (err) {
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 1000,
      });
      setOpenDeleteModal(false);
      getEmployeeLogs();
    }
  };

  const getViewDetails = async (data) => {
    const reqBody = {
      row_id: data,
    };
    try {
      const response = await httpInjectorService.getLeaveViewDetails(reqBody);
      if (response.status === 'success') {
        setViewDetails(response.data);
      } else {
        setViewDetails([]);
      }
    } catch (err) {
      setViewDetails([]);
    }
  };

  const updateLeaveApplication = async (status, applicationId) => {
    let reqBody = {
      leave_application_id: [applicationId],
      status: status,
    };
    try {
      const response = await httpInjectorService.updateLeaveApplication(
        reqBody,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        getEmployeeLogs();
        setLoading(false);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setLoading(false);
      }
    } catch (err) {
      console.debug(err);
    }
  };

  const toggleAllSelection = () => {
    setAllSelected((prev) => {
      const newAllSelected = !prev; // Determine the new state for allSelected
      const pendingIds = employeeLogs
        .filter((item) => item.status === 'Pending') // Filter for 'pending' users
        .map((item) => item.id); // Get IDs of those users with 'pending' status

      // Update selectedUsers based on the new state of allSelected
      if (newAllSelected) {
        setSelectedUsers(pendingIds); // Select only users with 'pending' status
      } else {
        setSelectedUsers([]); // Deselect all users
      }
      return newAllSelected; // Set the updated state for allSelected
    });
  };

  const toggleRowSelection = async (id) => {
    await setSelectedUsers((prevSelectedUsers) => {
      if (!prevSelectedUsers.includes(id)) {
        return [...prevSelectedUsers, id];
      } else {
        return prevSelectedUsers.filter((userId) => userId !== id);
      }
    });
    setAllSelected(false); // Reset the "Select All" checkbox when a row is selected/deselected
  };

  const columns = useMemo(() => {
    const baseColumns = [
      ...(role_id === 2 && user_role === 'Admin'
        ? [
            {
              Header: (
                <Checkbox
                  colorScheme="purple"
                  isChecked={allSelected}
                  onChange={toggleAllSelection}
                />
              ),
              accessor: 'select',
              Cell: ({ row }) =>
                row.original.status === 'Pending' && (
                  <Checkbox
                    colorScheme="purple"
                    isChecked={selectedUsers?.includes(row.original.id)}
                    onChange={() => toggleRowSelection(row.original.id)}
                  />
                ),
            },
            {
              Header: 'EMPLOYEE ID',
              accessor: 'employee_id',
              disableFilters: true,
              Cell: (cellProps) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <EmployeeId {...cellProps} />
                </div>
              ),
            },

            {
              Header: 'EMPLOYEE NAME',
              accessor: 'username',
              disableFilters: true,
              Cell: (cellProps) => <EmployeeName {...cellProps} />,
            },
          ]
        : []),

      {
        Header: 'LEAVE TYPE',
        accessor: 'leave_type',
        disableFilters: true,
        Cell: (cellProps) => <LeaveType {...cellProps} />,
      },
      {
        Header: 'START DATE',
        accessor: 'start_date',
        disableFilters: true,
        Cell: (cellProps) => <StartDate {...cellProps} />,
      },
      {
        Header: 'END DATE',
        accessor: 'end_date',
        disableFilters: true,
        Cell: (cellProps) => <EndDate {...cellProps} />,
      },
      {
        Header: 'DAYS',
        accessor: 'days',
        disableFilters: true,
        Cell: (cellProps) => <Days {...cellProps} />,
      },
      {
        Header: 'APPLIED ON',
        accessor: 'applied_on',
        disableFilters: true,
        Cell: (cellProps) => <AppliedOn {...cellProps} />,
      },
      {
        Header: 'STATUS',
        accessor: 'status',
        disableFilters: true,
        Cell: (cellProps) => <Status {...cellProps} />,
      },
    ];

    if (role_id !== 2 && user_role !== 'Admin') {
      baseColumns.push({
        Header: 'Action',
        disableFilters: true,
        Cell: (cellProps) => (
          <Delete
            data={cellProps.row.original}
            onOpenModalView={onOpenModal}
            leaveApplicationId={setLeaveApplicationId}
          />
        ),
      });
    }

    if (role_id === 2 && user_role === 'Admin') {
      baseColumns.push({
        Header: 'ACTIONS',
        disableFilters: true,
        Cell: (cellProps) => (
          <Actions
            onApprove={updateLeaveApplication}
            onReject={updateLeaveApplication}
            onViewDetails={handleViewDetails}
            getViewDetails={(data) => getViewDetails(data)}
            data={cellProps.row.original}
          />
        ),
      });
    }

    return baseColumns;
  }, [role_id, user_role, updateLeaveApplication]);

  const getEmployeeLogs = async () => {
    setLoading(true);
    try {
      const respone = await httpInjectorService.getEmployeeLogs();
      if (respone.status === 'success') {
        setEmployeeLogs(respone.data);
        setLoading(false);
      } else {
        setEmployeeLogs([]);
        setLoading(false);
      }
    } catch {
      setEmployeeLogs([]);
      setLoading(false);
    }
  };

  const handleApproveAll = async () => {
    console.log('Selected Users:', selectedUsers);
    let reqBody = {
      leave_application_id: [...selectedUsers], // Spread selectedUsers into leave_application_ids
      status: 1,
      bulk: true,
    };
    setLoading(true);
    try {
      const response = await httpInjectorService.updateLeaveApplication(
        reqBody,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        getEmployeeLogs();
        setLoading(false);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setLoading(false);
      }
    } catch (err) {
      console.debug(err);
    } finally {
      setSelectedUsers([]); // Clear selected users after operation
    }
  };

  const handleRejectAll = async () => {
    let reqBody = {
      leave_application_id: [...selectedUsers], // Spread selectedUsers into leave_application_ids
      status: 0,
      bulk: true,
    };
    setLoading(true);
    try {
      const response = await httpInjectorService.updateLeaveApplication(
        reqBody,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        getEmployeeLogs();
        setLoading(false);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setLoading(false);
      }
    } catch (err) {
      console.debug(err);
    } finally {
      setSelectedUsers([]); // Clear selected users after operation
    }
  };

  useEffect(() => {
    if (activeTab === '2') {
      getEmployeeLogs();
    }
  }, [activeTab]);

  return (
    <React.Fragment>
      {loading ? (
        <div>
          <BulletList />
        </div>
      ) : (
        <div>
          <div
            className="d-flex justify-content-between align-items-center"
            style={{ borderRadius: '10px', marginTop: '10px' }}
          >
            <CardTitle className="fw-bolder h5 mx-1 mt-2">Logs</CardTitle>
          </div>
          {employeeLogs?.length === 0 ? (
            <div>
              <Empty />
            </div>
          ) : (
            <>
              {(role_id === 1 || role_id === 2) && (
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
                    onClick={() => {
                      handleApproveAll();
                    }}
                    rounded="2"
                    style={{ marginRight: '10px' }}
                  >
                    Approve All
                  </Button>
                  <Button
                    colorScheme="red"
                    disabled={selectedUsers.length === 0}
                    onClick={() => {
                      handleRejectAll();
                    }}
                    rounded="2"
                  >
                    Reject All
                  </Button>
                </div>
              )}
              <TableContainer
                columns={columns}
                data={employeeLogs}
                isGlobalFilter={true}
                customPageSize={10}
                className="custom-header-css"
              />
            </>
          )}
        </div>
      )}
      <Modal size="md" isOpen={showModal} toggle={() => setShowModal(false)}>
        <ModalHeader toggle={() => setShowModal(false)}>
          <h5 className="mb-0">
            <b>Leave Request Details</b>
          </h5>
        </ModalHeader>
        {viewdetails &&
          viewdetails.map((modal, index) => (
            <ModalBody>
              <Row className="mb-3">
                <Col>
                  <h6>
                    <b>Employee Name:</b>
                  </h6>
                  <p className="mb-1">{modal.username}</p>
                </Col>
                <Col>
                  <h6>
                    <b>Department:</b>
                  </h6>
                  <p className="mb-1">{modal.department_name}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <h6>
                    <b>Designation:</b>
                  </h6>
                  <p className="mb-1">{modal.designations}</p>
                </Col>
                <Col>
                  <h6>
                    <b>Leave Type:</b>
                  </h6>
                  <p className="mb-1">{modal.leave_type}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <h6>
                    <b>Leave Balance:</b>
                  </h6>
                  <p className="mb-1">{modal.total_leaves}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <h6>
                    <b>Start Date:</b>
                  </h6>
                  <p>{formatDate(modal.start_date)}</p>
                </Col>
                <Col>
                  <h6>
                    <b>End Date:</b>
                  </h6>
                  <p>{formatDate(modal.end_date)}</p>
                </Col>
                <Col>
                  <h6>
                    <b>Total Days:</b>
                  </h6>
                  <p>{modal.days}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <h6>
                    <b>Reason:</b>
                  </h6>
                  <p className="mb-1">{modal.reason}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <h6>
                    <b>Actioned By: </b>
                  </h6>
                  <p className="mb-1"> {modal.updated_by}</p>
                </Col>
                <Col>
                  <h6>
                    <b>Applied By:</b>
                  </h6>
                  <p className="mb-1">{modal.username}</p>
                </Col>
              </Row>
            </ModalBody>
          ))}
      </Modal>
      <Modal
        size="md"
        isOpen={openDeleteModal}
        toggle={() => setOpenDeleteModal(false)}
      >
        <ModalHeader toggle={() => setOpenDeleteModal(false)}>
          Confirm Deletion
        </ModalHeader>
        <ModalBody>Are you sure you want to delete this item?</ModalBody>
        <ModalFooter>
          <Button
            onClick={() => setOpenDeleteModal(false)}
            colorScheme="purple"
          >
            No
          </Button>
          <Button onClick={deleteLeaveApplication} colorScheme="red">
            Yes
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default EmployeeLogs;
