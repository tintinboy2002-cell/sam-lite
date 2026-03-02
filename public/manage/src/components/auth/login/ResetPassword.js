import React, { useState } from 'react';
// Formik Validation
import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
  Container,
  Row,
  Col,
  CardBody,
  Card,
  Form,
  Label,
  Input,
  FormFeedback,
  InputGroup,
  InputGroupText,
} from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import httpInjectorService from 'services/http-injector.service';
import { ToastContainer, toast } from 'react-toastify';
import { Button } from '@chakra-ui/react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [viewProgressBar, setViewProgressBar] = useState(false);
  const resetPassword = JSON.parse(localStorage.getItem('resetPassword'));

  if (resetPassword !== true || resetPassword === undefined) {
    // navigate('/login');
  }

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      password: '',
      repeatPassword: '',
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter.')
        .matches(/[0-9]/, 'Password must contain at least one numeric digit.')
        .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character.')
        .required('Please Enter Your Password'),
      repeatPassword: Yup.string()
        .required('Please Re-Enter Your Password')
        .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    }),
    onSubmit: async (values) => {
      setViewProgressBar(true);
      const email = localStorage.getItem('email');
      const reqBody = {
        email: email,
        password: values.password,
      };
      try {
        const response = await httpInjectorService.resetPassword(reqBody);
        setViewProgressBar(false);
        if (response.status === 'success') {
          toast.success(response.message, {
            position: 'top-right',
            autoClose: 1500,
          });
          navigate('/login');
          localStorage.removeItem('email');
          localStorage.removeItem('resetPassword');
        } else {
          toast.error(response.message, {
            position: 'top-right',
            autoClose: 2000,
          });
        }
      } catch (error) {
        console.log(error);
        setViewProgressBar(false);
      }
    },
  });

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowRepeatPassword = () => {
    setShowRepeatPassword(!showRepeatPassword);
  };

  const redirectToLogin = () => {
    navigate('/login');
  };

  return (
    <React.Fragment>
      <div className="home-btn d-none d-sm-block">
        <span className="text-dark">
          <i className="fas fa-home h2" />
        </span>
      </div>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md="8" lg="6" xl="5">
              <Card className="overflow-hidden">
                <div style={{ backgroundColor: '#884B9E' }}>
                  <Row>
                    <Col xs="7">
                      <div className="text-white p-4">
                        <h5 className="text-white">Update Your Password</h5>
                      </div>
                    </Col>
                    <Col xs="5" className="align-self-end"></Col>
                  </Row>
                </div>
                <CardBody className="pt-0">
                  <div>
                    <div className="avatar-md profile-user-wid mb-4">
                      <span className="avatar-title rounded-circle bg-light"></span>
                    </div>
                  </div>
                  <div className="p-2">
                    <Form
                      className="form-horizontal"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      <div className="mb-3">
                        <Label className="form-label">New Password</Label>
                        <InputGroup>
                          <InputGroupText>
                            <i className="fa fa-lock" />
                          </InputGroupText>
                          <Input
                            name="password"
                            className="form-control"
                            placeholder="Enter Password"
                            type={showPassword ? 'text' : 'password'}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.password || ''}
                            invalid={validation.touched.password && Boolean(validation.errors.password)}
                          />
                          <span
                            className="mt-2"
                            onClick={toggleShowPassword}
                            style={{
                              position: 'absolute',
                              marginLeft: '86%',
                              cursor: 'pointer',
                            }}
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </span>
                          {validation.touched.password && validation.errors.password ? (
                            <FormFeedback type="invalid">
                              {validation.errors.password}
                            </FormFeedback>
                          ) : null}
                        </InputGroup>
                      </div>
                      <div className="mb-3">
                        <Label className="form-label">Re-enter New Password</Label>
                        <InputGroup>
                          <InputGroupText>
                            <i className="fa fa-lock" />
                          </InputGroupText>
                          <Input
                            name="repeatPassword"
                            className="form-control"
                            placeholder="Re-enter Password"
                            type={showRepeatPassword ? 'text' : 'password'}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.repeatPassword || ''}
                            invalid={validation.touched.repeatPassword && Boolean(validation.errors.repeatPassword)}
                          />
                          <span
                            className="mt-2"
                            onClick={toggleShowRepeatPassword}
                            style={{
                              position: 'absolute',
                              marginLeft: '86%',
                              cursor: 'pointer',
                            }}
                          >
                            {showRepeatPassword ? 'Hide' : 'Show'}
                          </span>
                          {validation.touched.repeatPassword && validation.errors.repeatPassword ? (
                            <FormFeedback type="invalid">
                              {validation.errors.repeatPassword}
                            </FormFeedback>
                          ) : null}
                        </InputGroup>
                      </div>

                      <div className="d-flex justify-content-center">
                        <Col xs="12" className="text-center">
                          <Button
                            colorScheme="purple"
                            type="submit"
                            disabled={viewProgressBar}
                          >
                            {viewProgressBar ? 'Updating...' : 'Update'}
                          </Button>
                        </Col>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
        <div className="text-center">
          Go back to{' '}
          <a onClick={redirectToLogin} style={{ cursor: 'pointer' }}>
            Login
          </a>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ResetPassword;
