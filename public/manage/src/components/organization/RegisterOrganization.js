import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';
import { Button, Text } from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {toast } from 'react-toastify';
import OrgImage from '../../assets/img/organization/company.png';
import classes from './authcode.module.css';
import { Link, useNavigate } from 'react-router-dom';
import AuthCode from 'react-auth-code-input';
import httpInjectorService from 'services/http-injector.service';
import imgg from '../../assets/img/organization/newregistration.gif';
import { FaArrowLeft } from 'react-icons/fa';
 
 
const registrationData = [
  {
    id: 1,
    label: 'First name',
    tag_name: 'firstName',
    placeHolder: 'John',
    type: 'text',
  },
  {
    id: 2,
    label: 'Last name',
    tag_name: 'lastName',
    placeHolder: 'Crane',
    type: 'text',
  },
  {
    id: 3,
    label: 'Company name',
    tag_name: 'companyName',
    placeHolder: 'nubaxdatalabs',
    type: 'text',
  },
  {
    id: 4,
    label: 'Company website',
    tag_name: 'companyWebsite',
    placeHolder: 'www.nubaxdatalabs.com',
    type: 'text',
  },
  {
    id: 5,
    label: 'Email',
    tag_name: 'email',
    placeHolder: 'john@nubaxdatalabs.com',
    type: 'email',
  },
  {
    id: 6,
    label: 'Password',
    tag_name: 'password',
    placeHolder: '******',
    type: 'password',
  },
  {
    id: 7,
    label: 'Address',
    tag_name: 'address',
    placeHolder: 'street, locality, city',
    type: 'text',
  },
  {
    id: 8,
    label: 'Country',
    tag_name: 'country',
    placeHolder: 'USA',
    type: 'text',
  },
];
 
const RegisterOrganization = () => {
 
  const [showEyeIcon, setShowEyeIcon] = useState(true);
  const [showPasswordIcon, setShowPasswordIcon] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isOTPModalOpen, setOTPModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [viewProgressBar, setViewProgressBar] = useState(false);
  const [resendOtpEvent, setResendOtpEvent] = useState(true);
  const [buttonName, setButtonName] = useState('Verify email');
  const navigate = useNavigate();
  const [isModified, setIsModified] = useState(false);
 
 
  const validationSchema = Yup.object().shape(
    registrationData.reduce((acc, field) => {
      switch (field.tag_name) {
        case 'firstName':
        case 'lastName':
          acc[field.tag_name] = Yup.string()
            .required(`Please provide ${field.label}`)
            .matches(
              /^[a-zA-Z]+$/,
              'Only alphabetic characters and spaces are allowed.',
            );
          break;
        case 'companyWebsite':
          acc[field.tag_name] = Yup.string()
            .matches(
              /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
              'Must be a valid URL ending with .com, .net, etc.',
            )
            .required(`Please provide ${field.label}`);
          break;
        case 'email':
          acc[field.tag_name] = Yup.string()
            .email('Must be a valid email')
            .required(`Please provide ${field.label}`)
            .test(
              'email-domain-match',
              'Email should include the domain name of the organization',
              function (value) {
                const { companyWebsite } = this.parent;
                if (!value || !companyWebsite) return true;
                const emailDomain = value.trim().split('@')[1];
                const websiteDomain = companyWebsite
                  .trim()
                  .replace(/^https?:\/\//, '')
                  .replace(/^www\./, '')
                  .split('/')[0];
                console.log('Email Domain:', emailDomain);
                console.log('Website Domain:', websiteDomain);
                return emailDomain === websiteDomain;
              },
            );
          break;
        case 'password':
          acc[field.tag_name] = Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .matches(
              /[A-Z]/,
              'Password must contain at least one uppercase letter.',
            )
            .matches(
              /[0-9]/,
              'Password must contain at least one numeric digit.',
            )
            .matches(
              /[^A-Za-z0-9]/,
              'Password must contain at least one special character.',
            )
            .required(`Please provide ${field.label}`);
          break;
          case 'address':
            acc[field.tag_name] = Yup.string()
              .matches(
                /^(?!\s*$)(?=.*[a-zA-Z])([a-zA-Z0-9\s]+)$/,
                'Only alphanumeric characters and spaces are allowed.'
              )
              .required(`Please provide ${field.label}`);
            break;
          
        case 'country':
          acc[field.tag_name] = Yup.string()
            .matches(/^[a-zA-Z\s]+$/, 'Only alphabetic characters are allowed.')
            .required(`Please provide ${field.label}`);
          break;
        default:
          acc[field.tag_name] = Yup.string().required(
            `Please provide ${field.label}`,
          );
          break;
      }
      return acc;
    }, {}),
  );
 
  const handleFormSubmit = async () => {
    const email = formik.values.email;
    const companyname = formik.values.companyName;
    const reqbody={
      email, 
      companyname,
    }
    console.log(formik.values);
    await getOtp(reqbody);
    // toggleOTPModal();
  };
 
  const getOtp = async (reqbody) => {
    try {
      const response = await httpInjectorService.getOtp(reqbody);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        toggleOTPModal();
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching OTP:', error);
      toast.error('Failed to send OTP. Please try again later.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };
 
  const resendOtp = async () => {
    setResendOtpEvent(false);
    try {
      const response = await httpInjectorService.getOtp({
        email: formik.values.email,
      });
      setTimeout(() => {
        setResendOtpEvent(true);
      }, 120000);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 2000,
        });
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again later.', {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };
 
  const verifyOtp = async () => {
    setViewProgressBar(true);
    const reqBody = {
      email: formik.values.email,
      otp: otp,
    };
    try {
      const response = await httpInjectorService.verifyOtp(reqBody);
      setViewProgressBar(false);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 2000,
        });
        setButtonName('Submit');
        await register();
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 2000,
        });
      }
    } catch (error) {
      setViewProgressBar(false);
      console.log(error);
      toast.error('Failed to verify OTP. Please try again later.', {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };
 
  const register = async () => {
    const regdata = {
      first_name: formik.values.firstName,
      last_name: formik.values.lastName,
      email: formik.values.email,
      password: formik.values.password,
      website: formik.values.companyWebsite,
      company_name: formik.values.companyName,
      Address: formik.values.address, // Assuming this value exists in formik.values
      country: formik.values.country, // Assuming this value exists in formik.values
    };
    console.log(regdata, 'data');
    try {
      const response = await httpInjectorService.Register(regdata);
      console.log(response);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
 
        navigate('/admin/listorganization');
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        if (response.message === 'Organization Already registered.') {
          navigate('/admin/listorganization');
        }
      }
    } catch (error) {
      toast.error('Failed to register. Please try again later.', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/admin/listorganization');
    }
  };
 
  const formik = useFormik({
    initialValues: registrationData.reduce((acc, field) => {
      acc[field.tag_name] = '';
      return acc;
    }, {}),
    validationSchema,
    onSubmit: handleFormSubmit,
    // onSubmit: (values, { setSubmitting }) => {
    //   console.log('Form Values:', values); // Log the form values
    //   setOTPModalOpen(true); // Open the OTP modal after form submission
    //   setSubmitting(false); // Ensure to reset the submitting state
    // },
  });
 
  const toggleOTPModal = () => {
    setOTPModalOpen(!isOTPModalOpen);
  };
 
  const handleInputChange = (e) => {
    formik.handleChange(e);
    setIsModified(true); // Set to true when any input is changed
  };
 
  const handleOnChange = (res) => {
    setOtp(res);
  };
 
  const handleReset = () => {
    formik.resetForm();
    setIsModified(false);
  };
 
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
 
  const handlePasswordChange = (e) => {
    formik.handleChange(e);
 
    if (e.target.name === 'Password') {
      const hasError = formik.errors.Password && formik.touched.Password;
      const isTyping = e.target.value !== '';
 
      // Show the eye icon only if there's no error or the user is typing
      setShowPasswordIcon(!hasError || isTyping);
    }
  };
 
  const handleSubmit = (values, { setSubmitting }) => {
    console.log('Form Values:', values); // Log the form values
    setOTPModalOpen(true); // Open the OTP modal after form submission
    setSubmitting(false); // Ensure to reset the submitting state
  };
 
  const backToLogin = () => {
    navigate('/login');
  };
 
  return (
    <React.Fragment>
    <div className='d-flex justify-content-center align-items-center' style={{backgroundColor:'#E1D1F4', width:'100%', marginTop:"60px"}}>
      <div className="row">
        <div className=" d-flex align-items-center  mb-4 mt-1" style={{width:"600px"}}>
          <Container className="mt-4 mb-4">
            <Row className="justify-content-center">
              <Col md={12}>
                <Card className="overflow-hidden">
                  <div style={{ backgroundColor: '#884B9E' }}>
                    <Row>
                      <Col xs={12}>
                        <div className="text-white p-4">
                          <h4 className="text-white">Organization Details</h4>
                          <p className="mb-2">
                            Continue to Samlite by entering your organization's
                            data.
                          </p>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <CardBody
                    className="pt-0 d-flex flex-column"
                    style={{ marginTop: '10px', minHeight: '550px' }}
                  >
                    <Form onSubmit={formik.handleSubmit}>
                      <Row>
                        {registrationData.map((item) => (
                          <Col md={6} key={item.id} className="mb-2 mt-2">
                            <FormGroup>
                              <Label>{item.label}</Label>
                              <div style={{ position: 'relative' }}>
                                <Input
                                  type={
                                    item.tag_name === 'password' &&
                                    !showPassword
                                      ? 'password'
                                      : 'text'
                                  }
                                  name={item.tag_name}
                                  placeholder={item.placeHolder}
                                  onChange={(e) => {
                                    formik.handleChange(e);
                                    if (
                                      item.tag_name === 'password' &&
                                      e.target.value
                                    ) {
                                      setShowPasswordIcon(true);
                                    }
                                  }}
                                  onBlur={formik.handleBlur}
                                  value={formik.values[item.tag_name]}
                                  invalid={
                                    formik.touched[item.tag_name] &&
                                    !!formik.errors[item.tag_name]
                                  }
                                  style={{ paddingRight: '40px' }}
                                  onKeyUp={() => {
                                    if (
                                      formik.touched[item.tag_name] &&
                                      !!formik.errors[item.tag_name]
                                    ) {
                                      setShowPasswordIcon(false);
                                    }
                                  }}
                                />
                                {item.tag_name === 'password' &&
                                  showPasswordIcon &&
                                  !formik.errors[item.tag_name] && (
                                    <Button
                                      onClick={togglePasswordVisibility}
                                      type="button"
                                      color="primary"
                                      style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                        margin: 0,
                                        color: 'black',
                                      }}
                                    >
                                      {showPassword ? (
                                        <i className="bx bx-hide icon"></i>
                                      ) : (
                                        <i className="bx bx-show icon"></i>
                                      )}
                                    </Button>
                                  )}
                              </div>
                              {formik.touched[item.tag_name] &&
                                formik.errors[item.tag_name] && (
                                  <div
                                    style={{
                                      color: '#f44336',
                                      fontSize: '0.75rem',
                                      marginTop: '0.25rem',
                                    }}
                                  >
                                    {formik.errors[item.tag_name]}
                                  </div>
                                )}
                            </FormGroup>
                          </Col>
                        ))}
                      </Row>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center', // Center items horizontally
                          marginTop: '20px', // Add overall top margin if needed
                        }}
                      >
                        <Button
                          colorScheme="orange"
                          onClick={handleReset}
                          mr="2"
                        >
                          Reset
                        </Button>
                        <Button type="submit" colorScheme="purple">
                          Verify Email
                        </Button>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        {/* <Link
                          to="/login"
                          style={{ marginLeft: '8px', color: 'blue' }}
                        >
                          <span style={{ color: 'black' }}> Back to </span>{' '}
                          LoginPage
                        </Link> */}
                      </div>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            </Row>
 
            <Modal isOpen={isOTPModalOpen} toggle={toggleOTPModal} centered>
              <ModalHeader toggle={toggleOTPModal}>
                {' '}
                Verify your email
              </ModalHeader>
              <ModalBody className="text-center">
                <div className="avatar-md mx-auto">
                  <div className="avatar-title rounded-circle bg-light">
                    <i className="bx bxs-envelope h1 mb-0 text-primary"></i>
                  </div>
                </div>
                <div className="p-2 mt-4">
                  <p className="mb-5">
                    Please enter the 6 digit code sent to{' '}
                    <span className="font-weight-semibold">
                      {formik.values.email}
                    </span>
                  </p>
 
                  <Form>
                    <Row>
                      <Col xs={12}>
                        <FormGroup className="verification">
                          <AuthCode
                            characters={6}
                            className="form-control form-control-lg text-center"
                            allowedCharacters="alphanumeric"
                            inputClassName={classes.authCodeInput}
                            onChange={handleOnChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </Form>
 
                  <div className="mt-4">
                    <div className="d-flex justify-content-center mt-3">
                      <Button
                        className="w-md"
                        colorScheme='purple'
                        onClick={verifyOtp}
                        disabled={viewProgressBar}
                      >
                        {viewProgressBar ? 'Verifying Otp...' : 'Verify otp'}
                      </Button>
                    </div>
                  </div>
 
                  <div className="mt-5 text-center">
                    <p>
                      Didn't receive a code?{' '}
                      {resendOtpEvent ? '' : 'Resend OTP in 2 minutes'}
                      <a
                        onClick={resendOtp}
                        className="fw-medium text-primary"
                        style={{ cursor: 'pointer' }}
                      >
                        {resendOtpEvent ? 'Resend' : ''}
                      </a>
                    </p>
                  </div>
                </div>
              </ModalBody>
            </Modal>
          </Container>
        </div>
      </div>
    </div>
    </React.Fragment>
  );
};
 
export default RegisterOrganization;