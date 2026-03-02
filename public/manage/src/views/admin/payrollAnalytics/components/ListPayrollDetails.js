import TableContainer from 'components/common/TableContainer';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Action,
  ConveyanceAllowance,
  CTCWage,
  Designation,
  EmployeeId,
  EmployeeName,
  HRA,
  Location,
  RulesApplied,
  SpecialAllowance,
} from './ListPayrollDetailsCol';
import httpInjectorService from 'services/http-injector.service';
import { BulletList } from 'react-content-loader';
import { Empty } from 'antd';
import {
  Badge,
  border,
  Button,
  Checkbox,
  CloseButton,
  Switch,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
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
import { MdAddBox, MdCreate } from 'react-icons/md';
import Select from 'react-dropdown-select';
import { toast } from 'react-toastify';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ListPayrollDetails = ({ activeTab }) => {
  const [getPayrollDetails, setPayrollDetails] = useState([]);
  const [isloading, setIsLoading] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [ruleEffectiveDate, setRuleEffectiveDate] = useState('');
  const [selectedAssignedStructure, setSelectedAssignedStructure] = useState(
    [],
  );
  const [errors, setErrors] = useState({ structure: false, date: false });
  const [structures, setStructures] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [payroleStructureId, setPayroleStructureId] = useState('');
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [empuserid, setEmpUserId] = useState('');

  const validationSchema = Yup.object({
    ctc: Yup.number()
      .required('CTC is required')
      .positive('CTC must be a positive number'),
    conveyanceAllowance: Yup.number()
      .required('Conveyance Allowance is required')
      .positive('Conveyance Allowance must be a positive number'),
  });

  const toggleAllSelection = () => {
    const allUserIds = getPayrollDetails.map((item) => item.user_id);

    setSelectedUsers((prevSelectedUsers) => {
      if (allSelected) {
        return [];
      } else {
        return allUserIds;
      }
    });

    setAllSelected((prevAllSelected) => !prevAllSelected);
  };

  const columns = useMemo(
    () => [
      {
        Header: (
          <Checkbox
            colorScheme="purple"
            isChecked={allSelected}
            onChange={toggleAllSelection}
          />
        ),
        accessor: 'select',
        Cell: ({ row }) => (
          <Checkbox
            colorScheme="purple"
            isChecked={selectedUsers?.includes(row.original.user_id)}
            onChange={() => toggleRowSelection(row.original.user_id)}
          />
        ),
      },
      {
        Header: 'Employee ID',
        accessor: 'employee_id',
        disableFilters: true,
        Cell: (cellProps) => <EmployeeId {...cellProps} />,
      },
      {
        Header: 'Employee Name',
        accessor: 'employee_name',
        disableFilters: true,
        Cell: (cellProps) => <EmployeeName {...cellProps} />,
      },
      // {
      //   Header: 'LOCATION',
      //   accessor: 'location',
      //   disableFilters: true,
      //   Cell: (cellProps) => <Location {...cellProps} />,
      // },
      {
        Header: 'Designation',
        accessor: 'designation',
        disableFilters: true,
        Cell: (cellProps) => <Designation {...cellProps} />,
      },
      {
        Header: 'Rules Applied',
        accessor: 'payroll_name',
        disableFilters: true,
        Cell: ({ row }) => {
          const payrollName = row.original.payroll_name;

          return (
            <div>
              {payrollName ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Badge
                    size="sm"
                    colorScheme="purple"
                    display="inline-flex"
                    alignItems="center"
                    borderRadius="md"
                    px={2}
                    py={1}
                  >
                    {payrollName}
                    <CloseButton
                      size="sm"
                      onClick={() =>
                        handleRemovePayrollName(row.original.assigned_id)
                      }
                    />
                  </Badge>
                </div>
              ) : (
                <></>
              )}
            </div>
          );
        },
      },
      {
        Header: 'CTC',
        accessor: isChecked ? 'ctc' : 'ctc_per_month',
        disableFilters: true,
        Cell: (cellProps) => <CTCWage {...cellProps} />,
      },
      {
        Header: 'Basic',
        accessor: isChecked ? 'basic' : 'basic_month',
        disableFilters: true,
        Cell: (cellProps) => <CTCWage {...cellProps} />,
      },
      {
        Header: 'HRA',
        accessor: isChecked ? 'hra' : 'hra_month',
        disableFilters: true,
        Cell: (cellProps) => <HRA {...cellProps} />,
      },
      {
        Header: 'Conveyance Allowance',
        accessor: isChecked
          ? 'conveyance_allowance'
          : 'conveyance_allowance_month',
        disableFilters: true,
        Cell: (cellProps) => <ConveyanceAllowance {...cellProps} />,
      },
      {
        Header: 'Special Allowance',
        accessor: isChecked ? 'special_allowance' : 'special_allowance_month',
        disableFilters: true,
        Cell: (cellProps) => <SpecialAllowance {...cellProps} />,
      },
      {
        Header: 'Action',
        accessor: 'action',
        disableFilters: true,
        Cell: ({ row }) => {
          const Employeedata = row.original;
          return (
            <div>
              <MdCreate
                size="25"
                color="purple"
                onClick={() => openClickUpdateModal(Employeedata)}
              />
            </div>
          );
        },
      },
    ],
    [allSelected, selectedUsers, getPayrollDetails],
  );

  const openClickUpdateModal = (data) => {
    setOpenUpdateModal(true);
    setEmpUserId(data.user_id);
  };

  const handleRemovePayrollName = (id) => {
    setOpenDeleteModal(true);
    setPayroleStructureId(id);
  };

  const toggleRowSelection = (id) => {
    setSelectedUsers((prevState) => {
      // Check if the id already exists in the array
      if (prevState.includes(id)) {
        // Remove the id from the array
        return prevState.filter((rowId) => rowId !== id);
      } else {
        // Add the id to the array
        return [...prevState, id];
      }
    });
  };

  const getPayrollStructures = async () => {
    try {
      const response = await httpInjectorService.getPayrollStructure();
      if (response.status === 'success') {
        setStructures(response.data);
      } else {
        setStructures([]);
      }
    } catch {
      setStructures([]);
    }
  };

  const handleAssignStructure = async () => {
    const newErrors = {
      structure: selectedAssignedStructure.length === 0,
      date: !ruleEffectiveDate,
    };

    setErrors(newErrors);

    // Proceed only if no errors
    if (!newErrors.structure && !newErrors.date) {
      const reqBody = {
        payroll_structure: selectedAssignedStructure,
        users: selectedUsers,
        effective_date: ruleEffectiveDate,
      };
      try {
        const response = await httpInjectorService.assignPayrollStructure(
          reqBody,
        );
        if (response.status === 'success') {
          toast.success(response.message, {
            position: 'top-right',
            autoClose: 1000,
          });
          setModalOpen(false);
          setSelectedAssignedStructure([]);
          setRuleEffectiveDate('');
          setSelectedUsers([]);
          setAllSelected(false);
          getPayrollStructureDetails();
        } else {
          toast.error(response.message, {
            position: 'top-right',
            autoClose: 1000,
          });
          setModalOpen(false);
          setSelectedAssignedStructure([]);
          setRuleEffectiveDate('');
          setSelectedUsers([]);
          setAllSelected(false);
          getPayrollStructureDetails();
        }
      } catch (err) {
        toast.error(err.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setModalOpen(false);
          setSelectedAssignedStructure([]);
          setRuleEffectiveDate('');
          setSelectedUsers([]);
          setAllSelected(false);
          getPayrollStructureDetails();
      }
    }
  };

  const getPayrollStructureDetails = async () => {
    try {
      const response = await httpInjectorService.getPayrollStructureDetails();
      if (response.status === 'success' && Array.isArray(response.data)) {
        setPayrollDetails(response.data);
        setIsLoading(false);
      } else {
        setPayrollDetails([]);
        setIsLoading(false);
      }
    } catch {
      setPayrollDetails([]);
      setIsLoading(false);
    }
  };

  const deleteAssignedPayrollStructure = async () => {
    try {
      const response = await httpInjectorService.deleteAssignedPayrollStructure(
        payroleStructureId,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        getPayrollStructureDetails();
        setOpenDeleteModal(false);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        getPayrollStructureDetails();
        setOpenDeleteModal(false);
      }
    } catch (err) {
      toast.err(err.message, {
        position: 'top-right',
        autoClose: 1000,
      });
      getPayrollStructureDetails();
      setOpenDeleteModal(false);
    }
  };

  const onOpenModal = () => {
    if (selectedUsers.length === 0) {
      toast.error('please select at least one user', {
        position: 'top-right',
        autoClose: 1000,
      });
      return;
    }
    setModalOpen(true);
  };

  useEffect(() => {
    if (activeTab === '1') {
      getPayrollStructureDetails();
      getPayrollStructures();
    }
  }, [activeTab]);

  const onUpdatePayrollDetails = async (values) => {
    const reqBody = {
      user_id: empuserid,
      ctc: values.ctc,
      conveyance_allowance: values.conveyanceAllowance,
    };
    try {
      const response = await httpInjectorService.updateEmployeePayrollDetails(
        reqBody,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        getPayrollStructureDetails();
        setOpenUpdateModal(false);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        getPayrollStructureDetails();
        setOpenUpdateModal(false);
      }
    } catch (err) {
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 1000,
      });
      getPayrollStructureDetails();
      setOpenUpdateModal(false);
    }
  };

  const onHandleChangeSwitch = (e) => {
    setIsChecked(e.target.checked);
    getPayrollStructureDetails();
  };

  return (
    <React.Fragment>
      {isloading ? (
        <div>
          <BulletList />
        </div>
      ) : (
        <div>
          <Button
            rounded="3"
            colorScheme="purple"
            float="right"
            onClick={onOpenModal}
          >
            <MdAddBox />
            &nbsp; Assign Structure
          </Button>
          <div className="mt-3">
            {getPayrollDetails.length === 0 ? (
              <Empty />
            ) : (
              <div>
                <Switch
                  isChecked={isChecked}
                  onChange={onHandleChangeSwitch}
                  marginRight="20px"
                  marginTop="5px"
                  sx={{
                    '.chakra-switch__track': {
                      width: '100px',
                      height: '30px',
                      padding: '0 5px',
                      position: 'relative',
                    },
                    '.chakra-switch__thumb': {
                      width: '17px',
                      height: '17px',
                      transform: isChecked
                        ? 'translateX(70px)'
                        : 'translateX(0)',
                      transition: 'transform 0.2s ease-in-out',
                    },
                    '.chakra-switch__track::before': {
                      content: isChecked ? '"Annual"' : '"Monthly"',
                      fontSize: '17px',
                      color: 'black',
                      fontWeight: 'bold',
                      position: 'absolute',
                      left: isChecked ? '10px' : 'unset',
                      right: isChecked ? 'unset' : '10px',
                    },
                  }}
                  colorScheme="purple"
                  float="right"
                />
                <TableContainer
                  columns={columns}
                  data={getPayrollDetails}
                  isGlobalFilter={true}
                  customPageSize={10}
                  className="custom-header-css"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <ModalHeader
          toggle={() => {
            setSelectedAssignedStructure([]);
            setRuleEffectiveDate('');
            setModalOpen(false);
          }}
        >
          Assign Structure
        </ModalHeader>
        <ModalBody>
          <Label>
            Select Structure<span className="text-danger">*</span>
          </Label>
          <Select
            options={structures}
            labelField="name"
            valueField="name"
            className={`mb-2 ${errors.structure ? 'is-invalid' : ''}`}
            color={`${errors.structure ? 'red' : '#884b9e'}`}
            style={errors.structure ? { border: '1px solid red' } : {}}
            values={selectedAssignedStructure}
            onChange={(selectedRules) => {
              setSelectedAssignedStructure(selectedRules);
              setErrors({ ...errors, structure: false });
            }}
          />
          {errors.structure && (
            <div className="text-danger">please select structure.</div>
          )}

          <Label>
            Effective Date <span className="text-danger">*</span>
          </Label>
          <Input
            type="date"
            className={`mb-2 ${errors.date ? 'is-invalid' : ''}`}
            value={ruleEffectiveDate}
            onChange={(e) => {
              setRuleEffectiveDate(e.target.value);
              setErrors({ ...errors, date: false });
            }}
          />
          {errors.date && (
            <div className="text-danger">Please select an effective date.</div>
          )}

          <Row>
            <Col md="12" className="text-right">
              <Button
                onClick={handleAssignStructure}
                float="right"
                className="mx-2"
                rounded="3"
                colorScheme="purple"
              >
                Assign Structure
              </Button>
              <Button
                onClick={() => setModalOpen(false)}
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
        <ModalBody>Are you sure you want to remove this structure ?</ModalBody>
        <ModalFooter>
          <Button
            rounded="3"
            onClick={() => setOpenDeleteModal(false)}
            colorScheme="red"
          >
            No
          </Button>
          <Button
            onClick={deleteAssignedPayrollStructure}
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
          Update Payroll Details
        </ModalHeader>
        <ModalBody>
          <Formik
            initialValues={{
              ctc: '',
              conveyanceAllowance: '',
            }}
            validationSchema={validationSchema}
            onSubmit={onUpdatePayrollDetails}
          >
            {({ errors, touched }) => (
              <Form>
                <FormControl isInvalid={errors.ctc && touched.ctc} mb={4}>
                  <FormLabel htmlFor="ctc">
                    CTC <span className="text-danger">*</span>
                  </FormLabel>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">CTC*</span>{' '}
                    </div>
                    <Field
                      name="ctc"
                      as={Input}
                      id="ctc"
                      placeholder="Enter CTC"
                      variant="filled"
                      isInvalid={errors.ctc && touched.ctc}
                      style={{
                        borderColor:
                          errors.ctc || (touched.ctc && errors.ctc)
                            ? 'red'
                            : 'gray',
                      }}
                    />
                  </div>
                  <FormErrorMessage>{errors.ctc}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={
                    errors.conveyanceAllowance && touched.conveyanceAllowance
                  }
                  mb={4}
                >
                  <FormLabel htmlFor="conveyanceAllowance">
                    Conveyance Allowance <span className="text-danger">*</span>
                  </FormLabel>
                  <Field
                    name="conveyanceAllowance"
                    as={Input}
                    id="conveyanceAllowance"
                    placeholder="Enter Conveyance Allowance"
                    variant="filled"
                    isInvalid={
                      errors.conveyanceAllowance && touched.conveyanceAllowance
                    }
                    style={{
                      borderColor:
                        errors.conveyanceAllowance ||
                        (touched.conveyanceAllowance &&
                          errors.conveyanceAllowance)
                          ? 'red'
                          : 'gray',
                    }}
                  />
                  <FormErrorMessage>
                    {errors.conveyanceAllowance}
                  </FormErrorMessage>
                </FormControl>

                <ModalFooter>
                  <Button
                    rounded="3"
                    colorScheme="red"
                    onClick={() => setOpenUpdateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button rounded="3" colorScheme="purple" type="submit">
                    Save
                  </Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default ListPayrollDetails;
