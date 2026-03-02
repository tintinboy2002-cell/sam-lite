import TableContainer from 'components/common/TableContainer';
import React, { useEffect, useMemo, useState } from 'react';
import httpInjectorService from 'services/http-injector.service';
import { BulletList } from 'react-content-loader';
import { Empty } from 'antd';
import { Button } from '@chakra-ui/react';
import {
  Col,
  Input,
  Label,
  Modal,
  ModalFooter,
  ModalHeader,
  ModalBody,
  Row,
} from 'reactstrap';
import { MdAddBox, MdCreate, MdDelete } from 'react-icons/md';
import Select from 'react-dropdown-select';
import { toast } from 'react-toastify';
import { Amount, EmployeeId, EmployeeName, Id, Type } from './AdocVariableCol';

const AdocVariable = ({ activeTab }) => {
  const [getAdocVariableDetails, setAdocVariableDetails] = useState([]);
  const [isloading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState([]);
  const [errors, setErrors] = useState({ structure: false, date: false });
  const [types, setTypes] = useState([
    { label: 'Adoc', value: 'adoc' },
    { label: 'Variable', value: 'variable' },
  ]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [rowid, setRowId] = useState('');
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [empuserid, setEmpUserId] = useState('');
  const [organizationUsers, setOrganizationUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [updateErrors, setUpdateErrors] = useState({
    amount: false,
    type: false,
    description: false,
  });

  const [updateAmount, setUpdateAmount] = useState('');
  const [updateType, setUpdateType] = useState([]);
  const [updateDescription, setUpdateDescription] = useState('');
  const [userLogId, setUserLogId] = useState('');
 
  const columns = useMemo(
    () => [
      {
        Header: 'Id',
        accessor: (row, i) => i + 1,
        disableFilters: true,
        Cell: (cellProps) => <Id {...cellProps} />,
      },
      {
        Header: 'Employee ID',
        accessor: 'employee_id',
        disableFilters: true,
        Cell: (cellProps) => <EmployeeId {...cellProps} />,
      },
      {
        Header: 'Employee Name',
        accessor: 'name',
        disableFilters: true,
        Cell: (cellProps) => <EmployeeName {...cellProps} />,
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        disableFilters: true,
        Cell: (cellProps) => <Amount {...cellProps} />,
      },
      {
        Header: 'Type',
        accessor: 'type',
        disableFilters: true,
        Cell: (cellProps) => <Type {...cellProps} />,
      },
      {
        Header: 'Action',
        accessor: 'action',
        disableFilters: true,
        Cell: ({ row }) => {
          const Employeedata = row.original;
         
          return (
            <div className="d-flex justify-content-center align-items-center">
              <MdCreate
                size="25"
                color="purple"
                onClick={() => openClickUpdateModal(Employeedata)}
                style={{ cursor: 'pointer', marginRight: '10px' }}
              />
              <MdDelete
                size="25"
                color="red"
                onClick={() => handleRemoveAdocVariable(Employeedata.id)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          );
        },
      },
    ],
    [getAdocVariableDetails],
  );

  const openClickUpdateModal = (data) => {
    setOpenUpdateModal(true);
    setEmpUserId(data.id);
    setUserLogId(data.user_id);
  };

  const handleRemoveAdocVariable = (id) => {
    setOpenDeleteModal(true);
    setRowId(id);
  };

  const getOrganizartionUsers = async () => {
    try {
      const response = await httpInjectorService.listorganizationusers();
      if (response.status === 'success' && Array.isArray(response.data)) {
        const formattedData = response.data.map((user) => ({
          user_id: String(user.user_id),
          employee_name: user.username,
        }));
        setOrganizationUsers(formattedData);
      } else {
        setOrganizationUsers([]);
      }
    } catch {
      setOrganizationUsers([]);
    }
  };

  const handleAssignAdocVariable = async () => {
    const newErrors = {
      user: selectedUser.length === 0,
      type: type.length === 0,
      amount: !amount,
      description: !description,
    };

    setErrors(newErrors);

    // Proceed only if no errors
    if (
      !newErrors.user &&
      !newErrors.type &&
      !newErrors.amount &&
      !newErrors.description
    ) {
      const reqBody = {
        user_id: selectedUser[0]?.user_id,
        type: type[0]?.value,
        amount: amount,
        description: description,
      };
      try {
        const response = await httpInjectorService.createAdocAndVariable(
          reqBody,
        );
        if (response.status === 'success') {
          toast.success(response.message, {
            position: 'top-right',
            autoClose: 1000,
          });
          setModalOpen(false);
          getAdocAndVariableDetails();
          setType([]);
          setAmount('');
          setSelectedUser([]);
          setDescription('');
        } else {
          toast.error(response.message, {
            position: 'top-right',
            autoClose: 1000,
          });
          setType([]);
          setAmount('');
          setSelectedUser([]);
          setDescription('');
        }
      } catch (err) {
        toast.error(err.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setType([]);
        setAmount('');
        setSelectedUser([]);
        setDescription('');
      }
    }
  };

  const getAdocAndVariableDetails = async () => {
    setIsLoading(true);
    try {
      const response = await httpInjectorService.getAdocAndVariableDetails();
      if (response.status === 'success') {
        setAdocVariableDetails(response.data);
        setIsLoading(false);
      } else {
        setAdocVariableDetails([]);
        setIsLoading(false);
      }
    } catch {
      setAdocVariableDetails([]);
      setIsLoading(false);
    }
  };

  const deleteAdocAndVariable = async () => {
    try {
      const response = await httpInjectorService.deleteAdocAndVariable(rowid);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setOpenDeleteModal(false);
        getAdocAndVariableDetails();
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setOpenDeleteModal(false);
        getAdocAndVariableDetails();
      }
    } catch (err) {
      toast.err(err.message, {
        position: 'top-right',
        autoClose: 1000,
      });
      setOpenDeleteModal(false);
      getAdocAndVariableDetails();
    }
  };

  const onOpenModal = () => {
    setModalOpen(true);
  };

  useEffect(() => {
    if (activeTab === '5') {
      getAdocAndVariableDetails();
      getOrganizartionUsers();
    }
  }, [activeTab]);

  const handleUpdateAdocVariable = async () => {
    const errors = {
      amount: !updateAmount,
      type: updateType.length === 0,
      description: !updateDescription,
    };

    setUpdateErrors(errors);

    // Proceed only if no errors
    if (!errors.amount && !errors.type && !errors.description) {
      const reqBody = {
        id: empuserid,
        type: updateType[0]?.value,
        amount: updateAmount,
        description: updateDescription,
        user_id: userLogId,
      };
      try {
        const response = await httpInjectorService.updateAdocAndVariable(
          reqBody,
        );
        if (response.status === 'success') {
          toast.success(response.message, {
            position: 'top-right',
            autoClose: 1000,
          });
          setOpenUpdateModal(false);
          getAdocAndVariableDetails();
          setUpdateAmount('');
          setUpdateDescription('');
          setUpdateType([]);
        } else {
          toast.error(response.message, {
            position: 'top-right',
            autoClose: 1000,
          });
        }
      } catch (err) {
        toast.error(err.message, {
          position: 'top-right',
          autoClose: 1000,
        });
      }
    }
  };

  return (
    <React.Fragment>
      {isloading ? (
        <div>
          <BulletList />
        </div>
      ) : (
        <div className="mt-3">
          <div className="d-flex justify-content-end">
            <Button
              rounded="3"
              colorScheme="purple"
              float="right"
              onClick={onOpenModal}
            >
              <MdAddBox />
              &nbsp; Create Adoc / Variable
            </Button>
          </div>
          {getAdocVariableDetails.length === 0 ? (
            <Empty />
          ) : (
            <div>
              <TableContainer
                columns={columns}
                data={getAdocVariableDetails}
                isGlobalFilter={true}
                customPageSize={10}
                className="custom-header-css"
              />
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <ModalHeader
          toggle={() => {
            setType([]);
            setAmount('');
            setSelectedUser([]);
            setDescription('');
            setModalOpen(false);
          }}
        >
          Create Adoc / Variable
        </ModalHeader>
        <ModalBody>
          <div className="col-md-12">
            <Label>
              Select Employee Name<span className="text-danger">*</span>
            </Label>
            <Select
              options={organizationUsers}
              labelField="employee_name"
              valueField="employee_name"
              className={`mb-2 ${errors.user ? 'is-invalid' : ''}`}
              color={`${errors.user ? 'red' : '#884b9e'}`}
              style={errors.user ? { border: '1px solid red' } : {}}
              values={selectedUser}
              onChange={(selected) => {
                setSelectedUser(selected);
                setErrors({ ...errors, user: false });
              }}
            />
            {errors.user && (
              <div className="text-danger">Please select employee name</div>
            )}
          </div>

          <div className="col-md-12">
            <Label>
              Select Type<span className="text-danger">*</span>
            </Label>
            <Select
              options={types}
              labelField="label"
              valueField="label"
              className={`mb-2 ${errors.type ? 'is-invalid' : ''}`}
              color={`${errors.type ? 'red' : '#884b9e'}`}
              style={errors.type ? { border: '1px solid red' } : {}}
              values={type}
              onChange={(type) => {
                setType(type);
                setErrors({ ...errors, type: false });
              }}
            />
            {errors.type && (
              <div className="text-danger">Please select a type</div>
            )}
          </div>

          <div className="col-md-12">
            <Label>
              Amount<span className="text-danger">*</span>
            </Label>
            <Input
              type="text"
              className={`mb-2 ${errors.amount ? 'is-invalid' : ''}`}
              value={amount}
              placeholder="Enter Amount"
              onChange={(e) => {
                const value = e.target.value;
                const isValid =
                  /[\+]?([\-]?([0-9]{1,})?[\.]?[0-9]{1,})/.test(value) ||
                  value === '';
                if (isValid) {
                  setAmount(value);
                  setErrors({ ...errors, amount: false });
                } else {
                  setErrors({ ...errors, amount: true });
                }
              }}
            />
            {errors.amount && (
              <div className="text-danger">Please enter a valid amount</div>
            )}
          </div>

          <div className="col-md-12 mt-2">
            <Label>
              Description<span className="text-danger">*</span>
            </Label>
            <textarea
              name="description"
              className={`form-control mb-2 ${
                errors.description ? 'is-invalid' : ''
              }`}
              style={{
                resize: 'vertical',
                minHeight: '100px',
                borderColor: errors.description ? 'red' : '',
              }}
              placeholder="Enter a brief description for the Adoc / Variable..."
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: false });
              }}
            />
            {errors.description && (
              <div className="text-danger">Please enter a description</div>
            )}
          </div>

          <Row>
            <Col md="12" className="text-right">
              <Button
                onClick={handleAssignAdocVariable}
                float="right"
                className="mx-2"
                rounded="3"
                colorScheme="purple"
              >
                Create Adoc / Variable
              </Button>
              <Button
                onClick={() => {
                  setType([]);
                  setAmount('');
                  setSelectedUser([]);
                  setDescription('');
                  setModalOpen(false);
                }}
                float="right"
                rounded="3"
                colorScheme="blue"
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
      <Modal
        size="md"
        isOpen={openDeleteModal}
        toggle={() => setOpenDeleteModal(false)}
      >
        <ModalHeader toggle={() => setOpenDeleteModal(false)}>
          Confirm Deletion
        </ModalHeader>
        <ModalBody>Are you sure you want to remove ?</ModalBody>
        <ModalFooter>
          <Button
            rounded="3"
            onClick={() => setOpenDeleteModal(false)}
            colorScheme="red"
          >
            No
          </Button>
          <Button
            onClick={deleteAdocAndVariable}
            rounded="3"
            colorScheme="purple"
          >
            Yes
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        size="md"
        isOpen={openUpdateModal}
        onClose={() => setOpenUpdateModal(false)}
      >
        <ModalHeader toggle={() => setOpenUpdateModal(false)}>
          Update Adoc / Variable
        </ModalHeader>
        <ModalBody>
          <div className="col-md-12">
            <Label>
              Select Type<span className="text-danger">*</span>
            </Label>
            <Select
              options={types}
              labelField="label"
              valueField="label"
              className={`mb-2 ${updateErrors.type ? 'is-invalid' : ''}`}
              color={`${updateErrors.type ? 'red' : '#884b9e'}`}
              style={updateErrors.type ? { border: '1px solid red' } : {}}
              values={updateType}
              onChange={(selected) => {
                setUpdateType(selected);
                setUpdateErrors({ ...updateErrors, type: false });
              }}
            />
            {updateErrors.type && (
              <div className="text-danger">Please select a type</div>
            )}
          </div>

          <div className="col-md-12">
            <Label>
              Amount<span className="text-danger">*</span>
            </Label>
            <Input
              type="text"
              className={`mb-2 ${updateErrors.amount ? 'is-invalid' : ''}`}
              value={updateAmount}
              placeholder="Enter Amount"
              onChange={(e) => {
                const value = e.target.value;
                const isValid =
                  /[\+]?([\-]?([0-9]{1,})?[\.]?[0-9]{1,})/.test(value) ||
                  value === '';
                if (isValid) {
                  setUpdateAmount(value);
                  setUpdateErrors({ ...updateErrors, amount: false });
                } else {
                  setUpdateErrors({ ...updateErrors, amount: true });
                }
              }}
            />
            {updateErrors.amount && (
              <div className="text-danger">Please enter a valid amount</div>
            )}
          </div>

          <div className="col-md-12 mt-2">
            <Label>
              Description<span className="text-danger">*</span>
            </Label>
            <textarea
              name="description"
              className={`form-control mb-2 ${
                updateErrors.description ? 'is-invalid' : ''
              }`}
              style={{
                resize: 'vertical',
                minHeight: '100px',
                borderColor: updateErrors.description ? 'red' : '',
              }}
              placeholder="Enter a brief description for the Adoc / Variable..."
              onChange={(e) => {
                setUpdateDescription(e.target.value);
                setUpdateErrors({ ...updateErrors, description: false });
              }}
            />
            {updateErrors.description && (
              <div className="text-danger">Please enter a description</div>
            )}
          </div>

          <Row>
            <Col md="12" className="text-right">
              <Button
                onClick={handleUpdateAdocVariable}
                float="right"
                className="mx-2"
                rounded="3"
                colorScheme="purple"
              >
                Save
              </Button>
              <Button
                onClick={() => setOpenUpdateModal(false)}
                float="right"
                rounded="3"
                colorScheme="blue"
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default AdocVariable;
