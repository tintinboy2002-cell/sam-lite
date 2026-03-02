import React, { useEffect, useMemo, useState } from 'react';
import httpInjectorService from 'services/http-injector.service';
import TableContainer from 'components/common/TableContainer';
import { MdAddBox, MdDelete } from 'react-icons/md';
import { EmployeeId, EmployeeName, Id, PayAction } from './SalaryOnHoldCol';
import { Button } from '@chakra-ui/react';
import {
  Col,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  ModalFooter,
} from 'reactstrap';
import Select from 'react-dropdown-select';
import { toast } from 'react-toastify';
import { BulletList } from 'react-content-loader';
import { Empty } from 'antd';

const SalaryOnHold = ({ activeTab }) => {
  const [getSalaryholdusers, setSalaryHoldUsers] = useState([]);
  const [getreleasedusers, setReleasedUsers] = useState([]);
  const [openModal, setopenModal] = useState(false);
  const [Errors, setErrors] = useState({
    employeeName: '',
  });
  const [employeeName, setEmployeeName] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [rowId, setRowId] = useState('');
  const [isloading, setIsLoading] = useState(true);

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
        Header: 'Pay Action',
        accessor: 'onhold',
        disableFilters: true,
        Cell: (cellProps) => <PayAction {...cellProps} />,
      },
      {
        Header: 'Action',
        accessor: 'action',
        disableFilters: true,
        Cell: ({ row }) => {
          const Employeedata = row.original;
          return (
            <div className="d-flex justify-content-center align-items-center">
              <MdDelete
                size="25"
                color="red"
                onClick={() => handleRemoveSalaryHoldUser(Employeedata.id)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          );
        },
      },
    ],
    [],
  );

  const handleRemoveSalaryHoldUser = (id) => {
    setOpenDeleteModal(true);
    setRowId(id);
  };

  const openSalaryHoldModal = () => {
    setopenModal(true);
  };

  const getSalaryOnHoldUsers = async () => {
    setIsLoading(true);
    try {
      const response = await httpInjectorService.getHoldSalaryUsers();
      if (response.status === 'success') {
        setSalaryHoldUsers(
          Array.isArray(response.data.on_hold_salary_users)
            ? response.data.on_hold_salary_users
            : [],
        );
        setReleasedUsers(
          Array.isArray(response.data.released_users)
            ? response.data.released_users
            : [],
        );
        setIsLoading(false);
      } else {
        setReleasedUsers([]);
        setSalaryHoldUsers([]);
        setIsLoading(false);
      }
    } catch {
      setSalaryHoldUsers([]);
      setIsLoading(false);
    }
  };

  const handleAddSalaryHold = async () => {
    const newerrors = {
      employeeName: employeeName.length === 0,
    };
    setErrors(newerrors);
    if (!newerrors.employeeName) {
      const reqBody = {
        user_id: employeeName[0]?.id,
      };
      try {
        const response = await httpInjectorService.holdSalaryOfUser(reqBody);
        if (response.status === 'success') {
          toast.success(response.message, {
            position: 'top-right',
            autoClose: 1000,
          });
          setopenModal(false);
          getSalaryOnHoldUsers();
          setEmployeeName([]);
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

  const deleteSalaryHoldUser = async () => {
    try {
      const response = await httpInjectorService.releaseSalaryUser(rowId);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setOpenDeleteModal(false);
        getSalaryOnHoldUsers();
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
  };

  useEffect(() => {
    if (activeTab === '6') {
      getSalaryOnHoldUsers();
    }
  }, [activeTab]);

  return (
    <React.Fragment>
      {isloading ? (
        <div>
          <BulletList />
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-end">
            <Button
              onClick={openSalaryHoldModal}
              mt="2"
              rounded="3"
              size="sm"
              colorScheme="purple"
            >
              <MdAddBox />
              &nbsp; Add Employee
            </Button>
          </div>
          <div className="mt-3">
            {getSalaryholdusers.length !== 0 ? (
              <TableContainer
                columns={columns}
                data={getSalaryholdusers}
                isGlobalFilter={true}
                customPageSize={10}
                className="custom-header-css"
              />
            ) : (
              <Empty />
            )}
          </div>
        </div>
      )}
      <Modal
        size="md"
        isOpen={openModal}
        onClose={() => {
          setopenModal(false);
          setEmployeeName([]);
        }}
      >
        <ModalHeader
          toggle={() => {
            setopenModal(false);
            setEmployeeName([]);
          }}
        >
          Add To Salary Hold List
        </ModalHeader>
        <ModalBody>
          <div className="col-md-12">
            <Label>
              Select Employee Name<span className="text-danger">*</span>
            </Label>
            <Select
              options={getreleasedusers}
              labelField="name"
              valueField="name"
              className={`mb-2 ${Errors.employeeName ? 'is-invalid' : ''}`}
              color={`${Errors.employeeName ? 'red' : '#884b9e'}`}
              style={Errors.employeeName ? { border: '1px solid red' } : {}}
              values={employeeName}
              onChange={(selected) => {
                setEmployeeName(selected);
                setErrors({ ...Errors, employeeName: '' });
              }}
            />
            {Errors.employeeName && (
              <div className="text-danger">please select a employee name</div>
            )}
          </div>

          <Row>
            <Col md="12" className="text-right">
              <Button
                onClick={handleAddSalaryHold}
                float="right"
                className="mx-2"
                rounded="3"
                colorScheme="purple"
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setopenModal(false);
                  setEmployeeName([]);
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
        <ModalBody>Are you sure you want to remove this user</ModalBody>
        <ModalFooter>
          <Button
            rounded="3"
            onClick={() => setOpenDeleteModal(false)}
            colorScheme="red"
          >
            No
          </Button>
          <Button
            onClick={deleteSalaryHoldUser}
            rounded="3"
            colorScheme="purple"
          >
            Yes
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default SalaryOnHold;
