import { Button, Heading } from '@chakra-ui/react';
import React from 'react';
import { Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import httpInjectorService from 'services/http-injector.service';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

const CreateStructureModal = ({
  openModal,
  setOpenModal,
  getPayrollStructures,
}) => {
  const onCloseModal = () => {
    setOpenModal(false);
  };

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

  const initialValues = {
    structureName: '',
    description: '',
    basis: '',
    hra: '',
    conveyance: 'None',
    specialAllowance: 'Balancing Amount of CTC',
    overtime: '0',
  };

  const onSubmit = async (values) => {
    const reqBody = {
      name: values.structureName,
      description: values.description,
      basic_formula: values.basis,
      hra_formula: values.hra,
      overtime: values.overtime,
      conveyance_allowance_formula: values.conveyance,
      special_allowance_formula: values.specialAllowance,
    };
    try {
      const response = await httpInjectorService.createPayrollStructure(
        reqBody,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        onCloseModal();
        getPayrollStructures();
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        onCloseModal();
        getPayrollStructures();
      }
    } catch (err) {
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 1000,
      });
      onCloseModal();
      getPayrollStructures();
    }
  };

  return (
    <React.Fragment>
      <Modal size="lg" isOpen={openModal} toggle={() => setOpenModal(false)}>
        <ModalHeader toggle={() => setOpenModal(false)}>
          Create New Structure
        </ModalHeader>
        <ModalBody>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ errors, touched, setFieldValue }) => (
              <Form>
                <div className="col-md-12">
                  <Label className="bold">
                    Salary Structure Name<span className="text-danger">*</span>
                  </Label>
                  <Field
                    name="structureName"
                    placeholder="Enter Salary Structure Name"
                    type="text"
                    className={`form-control ${
                      errors.structureName && touched.structureName
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

                <div className="col-md-12 mt-3">
                  <Label>
                    Description<span className="text-danger">*</span>
                  </Label>
                  <Field
                    name="description"
                    as="textarea"
                    className={`form-control ${
                      errors.description && touched.description
                        ? 'is-invalid'
                        : ''
                    }`}
                    placeholder="Enter Your Description"
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

                {[
                  { name: 'basis', label: 'Basis' },
                  { name: 'hra', label: 'HRA' },
                ].map((field, index) => (
                  <div className="col-md-12 mt-3" key={index}>
                    <Label>
                      {field.label}
                      <span className="text-danger">*</span>
                    </Label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">CTC*</span>
                      </div>
                      <Field
                        name={field.name}
                        placeholder={`Enter ${field.name} `}
                        type="text"
                        className={`form-control ${
                          errors[field.name] && touched[field.name]
                            ? 'is-invalid'
                            : ''
                        }`}
                      />
                    </div>
                    <ErrorMessage
                      name={field.name}
                      component="div"
                      className="text-danger mt-1"
                    />
                  </div>
                ))}

                {[
                  { name: 'conveyance', label: 'Conveyance Allowance' },
                  { name: 'specialAllowance', label: 'Special Allowance' },
                  { name: 'overtime', label: 'Overtime' },
                ].map((field, index) => (
                  <div className="col-md-12 mt-3" key={index}>
                    <Label>
                      {field.label}
                      <span className="text-danger">*</span>
                    </Label>
                    <Field
                      name={field.name}
                      placeholder={`Enter ${field.label}`}
                      type="text"
                      className={`form-control ${
                        errors[field.name] && touched[field.name]
                          ? 'is-invalid'
                          : ''
                      }`}
                    />
                    <ErrorMessage
                      name={field.name}
                      component="div"
                      className="text-danger mt-1"
                    />
                  </div>
                ))}

                <div className="mt-2" style={{ float: 'right' }}>
                  <Button
                    rounded="3"
                    colorScheme="blue"
                    size="md"
                    onClick={onCloseModal}
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
                    Save
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default CreateStructureModal;
