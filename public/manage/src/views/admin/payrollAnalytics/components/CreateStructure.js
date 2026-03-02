import { Button, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { MdAddBox, MdCreate } from 'react-icons/md';
import {
  Row,
  Card,
  CardBody,
  Input,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import CreateStructureModal from './CreateStructureModal';
import httpInjectorService from '../../../../services/http-injector.service';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { BulletList } from 'react-content-loader';

const CreateStructure = ({ activeTab }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [structures, setStructures] = useState([]);
  const [selectedStructureId, setSelectedStructureId] = useState('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [structure_id, setStructureId] = useState('');
  const [isloading, setIsLoading] = useState(true);

  const validationSchema = Yup.object({
    structureName: Yup.string().required('Salary Structure Name is required'),
    description: Yup.string().required('Description is required'),
    basis: Yup.string()
      .matches(/[+-]?([0-9]*[.])?[0-9]+/, 'Number is required')
      .required('Basis is required'),
    hra: Yup.string()
      .matches(/[+-]?([0-9]*[.])?[0-9]+/, 'Number is required')
      .required('HRA is required'),
    conveyance: Yup.string().required('Conveyance Allowance is required'),
    specialAllowance: Yup.string().required('Special Allowance is required'),
    overtime: Yup.string().required('Overtime is required'),
  });

  const getPayrollStructures = async () => {
    setIsLoading(true);
    try {
      const response = await httpInjectorService.getPayrollStructure();
      if (response.status === 'success') {
        setStructures(response.data);
        setSelectedStructureId(response.data[0]?.id || null);
        setIsLoading(false);
      } else {
        setStructures([]);
        setIsLoading(false);
      }
    } catch {
      setStructures([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === '2') {
      getPayrollStructures();
    }
  }, [activeTab]);

  const handleEditChange = () => {
    setIsEditing(!isEditing);
  };

  const handleEditClose = () => {
    setIsEditing(false);
  };

  const onHandleOpenModal = () => {
    setOpenModal(true);
  };

  const onHandleDeleteRuleModal = (id) => {
    setOpenDeleteModal(true);
    setStructureId(id);
  };

  const deletePayrollStructure = async () => {
    const reqBody = {
      structure_id: structure_id,
    };
    try {
      const response = await httpInjectorService.deletePayrollStructure(
        reqBody.structure_id,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        getPayrollStructures();
        setOpenDeleteModal(false);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        getPayrollStructures();
        setOpenDeleteModal(false);
      }
    } catch (err) {
      toast.err(err.message, {
        position: 'top-right',
        autoClose: 1000,
      });
      getPayrollStructures();
      setOpenDeleteModal(false);
    }
  };

  const onSubmit = async (values) => {
    const reqBody = {
      id: values.id,
      name: values.structureName,
      description: values.description,
      basic_formula: values.basis,
      hra_formula: values.hra,
      overtime: values.overtime,
      conveyance_allowance_formula: values.conveyance,
      special_allowance_formula: values.specialAllowance,
    };

    try {
      const response = await httpInjectorService.updatePayrollStructure(
        reqBody,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        getPayrollStructures();
        setIsEditing(false);
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

  return (
    <React.Fragment>
      {isloading ? (
        <div>
          <BulletList />
        </div>
      ) : (
        <Row className="mt-5">
          <div className="col-sm-3">
            {structures.map((struct, index) => (
              <Card
                key={struct.id}
                onClick={() => setSelectedStructureId(struct.id)}
                style={{
                  borderLeft:
                    selectedStructureId === struct.id
                      ? '6px solid purple'
                      : '6px solid #666666',
                  cursor: 'pointer',
                }}
                className="shadow bg-white hover-card mt-3"
              >
                <CardBody>
                  <Button
                    float="right"
                    onClick={() => onHandleDeleteRuleModal(struct.id)}
                  >
                    <i className="bx bx-trash"></i>
                  </Button>
                  <h5
                    style={{
                      color:
                        selectedStructureId === struct.id
                          ? 'purple'
                          : '#666666',
                      fontWeight: 'bold',
                    }}
                  >
                    {struct.name}
                  </h5>
                  <p className="text-muted">
                    {struct.no_of_employees ? struct.no_of_employees : 'No'}{' '}
                    Employees
                  </p>
                </CardBody>
              </Card>
            ))}
            <Button
              className="col-md-12"
              mt="4"
              rounded="3"
              size="sm"
              colorScheme="purple"
              onClick={onHandleOpenModal}
            >
              <MdAddBox />
              &nbsp; Create New Structure
            </Button>
          </div>
          <div className="col-sm-9 mt-3">
            {structures.map((struct) => (
              <div key={struct.id}>
                {selectedStructureId === struct.id && (
                  <Card className="shadow bg-white">
                    <CardBody>
                      <div
                        style={{
                          cursor: 'pointer',
                          float: 'right',
                        }}
                        onClick={handleEditChange}
                      >
                        <MdCreate size="25" color="purple" />
                      </div>
                      <Heading color="purple" size="md">
                        {struct.name}
                      </Heading>
                      <hr />
                      {isEditing ? (
                        <Formik
                          initialValues={{
                            id: struct.id,
                            structureName: struct.name,
                            description: struct.description,
                            basis: struct.basic_formula,
                            hra: struct.hra_formula,
                            conveyance: struct.conveyance_allowance_formula,
                            specialAllowance: struct.special_allowance_formula,
                            overtime: struct.overtime,
                          }}
                          validationSchema={validationSchema}
                          onSubmit={onSubmit}
                        >
                          {({ errors, touched }) => (
                            <Form>
                              <div className="mt-3">
                                <Heading size="sm">
                                  Salary Structure Name
                                </Heading>
                                <Field
                                  name="structureName"
                                  placeholder="Enter Salary Structure Name"
                                  type="text"
                                  className={`form-control ${
                                    errors.structureName &&
                                    touched.structureName
                                      ? 'is-invalid'
                                      : ''
                                  }`}
                                />
                                <ErrorMessage
                                  name="structureName"
                                  component="div"
                                  className="text-danger mt-1"
                                />
                              </div>
                              <div className="mt-3">
                                <Heading size="sm">Description</Heading>
                                <Field
                                  name="description"
                                  placeholder="Enter Description"
                                  as="textarea"
                                  className={`form-control ${
                                    errors.description && touched.description
                                      ? 'is-invalid'
                                      : ''
                                  }`}
                                />
                                <ErrorMessage
                                  name="description"
                                  component="div"
                                  className="text-danger mt-1"
                                />
                              </div>
                              <Heading className="mt-4" size="sm">
                                Salary Structure
                              </Heading>
                              <Table className="table table-bordered">
                                <thead>
                                  <tr>
                                    <th style={{ backgroundColor: '#b58ee4' }}>
                                      Earnings
                                    </th>
                                    <th style={{ backgroundColor: '#b58ee4' }}>
                                      Calculation (Annual)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>Basis</td>
                                    <td>
                                      <div className="input-group">
                                        <div className="input-group-prepend">
                                          <span className="input-group-text">
                                            CTC*
                                          </span>
                                        </div>
                                        <Field
                                          placeholder="Enter Basis"
                                          name="basis"
                                          type="text"
                                          className={`form-control ${
                                            errors.basis && touched.basis
                                              ? 'is-invalid'
                                              : ''
                                          }`}
                                        />
                                      </div>
                                      <ErrorMessage
                                        name="basis"
                                        component="div"
                                        className="text-danger mt-1"
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>HRA</td>
                                    <td>
                                      <div className="input-group">
                                        <div className="input-group-prepend">
                                          <span className="input-group-text">
                                            CTC*
                                          </span>
                                        </div>
                                        <Field
                                          placeholder="Enter HRA"
                                          name="hra"
                                          type="text"
                                          className={`form-control ${
                                            errors.hra && touched.hra
                                              ? 'is-invalid'
                                              : ''
                                          }`}
                                        />
                                      </div>
                                      <ErrorMessage
                                        name="hra"
                                        component="div"
                                        className="text-danger mt-1"
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Conveyance Allowance</td>
                                    <td>
                                      <Field
                                        placeholder="Enter Conveyance Allowance"
                                        name="conveyance"
                                        type="text"
                                        className={`form-control ${
                                          errors.conveyance &&
                                          touched.conveyance
                                            ? 'is-invalid'
                                            : ''
                                        }`}
                                      />
                                      <ErrorMessage
                                        name="conveyance"
                                        component="div"
                                        className="text-danger mt-1"
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Special Allowance</td>
                                    <td>
                                      <Field
                                        placeholder="Enter Special Allowance"
                                        name="specialAllowance"
                                        type="text"
                                        className={`form-control ${
                                          errors.specialAllowance &&
                                          touched.specialAllowance
                                            ? 'is-invalid'
                                            : ''
                                        }`}
                                      />
                                      <ErrorMessage
                                        name="specialAllowance"
                                        component="div"
                                        className="text-danger mt-1"
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Overtime</td>
                                    <td>
                                      <Field
                                        placeholder="Enter Overtime"
                                        name="overtime"
                                        type="text"
                                        className={`form-control ${
                                          errors.overtime && touched.overtime
                                            ? 'is-invalid'
                                            : ''
                                        }`}
                                      />
                                      <ErrorMessage
                                        name="overtime"
                                        component="div"
                                        className="text-danger mt-1"
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                              <div style={{ float: 'right' }}>
                                <Button
                                  onClick={handleEditClose}
                                  rounded="3"
                                  colorScheme="blue"
                                  size="md"
                                >
                                  Cancel
                                </Button>
                                &nbsp;
                                <Button
                                  type="submit"
                                  rounded="3"
                                  colorScheme="purple"
                                  size="md"
                                >
                                  Update
                                </Button>
                              </div>
                            </Form>
                          )}
                        </Formik>
                      ) : (
                        <div>
                          <div>
                            <Heading size="sm">Salary Structure Name</Heading>
                            {struct.name}
                          </div>
                          <div>
                            <Heading className="mt-2" size="sm">
                              Description
                            </Heading>
                            {struct.description}
                          </div>
                          <Heading className="mt-4" size="sm">
                            Salary Structure
                          </Heading>
                          <Table className="table table-bordered">
                            <thead>
                              <tr>
                                <th style={{ backgroundColor: '#b58ee4' }}>
                                  Earnings
                                </th>
                                <th style={{ backgroundColor: '#b58ee4' }}>
                                  Calculation (Annual)
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Basis</td>
                                <td>{struct.basic_formula}</td>
                              </tr>
                              <tr>
                                <td>HRA</td>
                                <td>{struct.hra_formula}</td>
                              </tr>
                              <tr>
                                <td>Conveyance Allowance</td>
                                <td>{struct.conveyance_allowance_formula}</td>
                              </tr>
                              <tr>
                                <td>Special Allowance</td>
                                <td>{struct.special_allowance_formula}</td>
                              </tr>
                              <tr>
                                <td>Overtime</td>
                                <td>{struct.overtime}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </Row>
      )}
      <Modal
        size="md"
        isOpen={openDeleteModal}
        toggle={() => setOpenDeleteModal(false)}
      >
        <ModalHeader toggle={() => setOpenDeleteModal(false)}>
          Confirm Deletion
        </ModalHeader>
        <ModalBody>Are you sure you want to delete this structure ?</ModalBody>
        <ModalFooter>
          <Button rounded="3" onClick={() => setOpenDeleteModal(false)} colorScheme="purple">
            No
          </Button>
          <Button rounded="3" onClick={deletePayrollStructure} colorScheme="red">
            Yes
          </Button>
        </ModalFooter>
      </Modal>
      <CreateStructureModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        getPayrollStructures={getPayrollStructures}
      />
    </React.Fragment>
  );
};

export default CreateStructure;
