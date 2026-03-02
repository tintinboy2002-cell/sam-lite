import React, { useState } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardBody,
  CardTitle,
  FormFeedback,
  CardHeader,
  Row,
  Col,
} from 'reactstrap';
import { Button } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Cookies from 'js-cookie';
import httpInjectorService from 'services/http-injector.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import 'boxicons/css/boxicons.min.css';
import grpimg from '../../../assets/img/organization/teamspirit.png';
import { useSelector, useDispatch } from 'react-redux';
import { setprofiledata } from 'store/actions';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { encryptData } from 'utils/crypto';

import { requestForToken } from '../../../firebase/notificationService';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('email');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string().when('step', {
      is: 'password',
      then: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
  });

  // newly added code for mobile web
  function getPlatform() {
    const ua = navigator.userAgent || '';
  
    try {
      // Detect custom app WebView
      if (ua.includes('MyApp')) {
        if (/Android/i.test(ua)) return 'Android App';
        if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS App';
        return 'App';
      }
  
      // Mobile browsers
      if (/Android/i.test(ua)) return 'Android Web';
      if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS Web';
  
      // Desktop browsers
      if (/Win/i.test(ua)) return 'Windows Web';
      if (/Mac/i.test(ua)) return 'Mac Web';
      if (/Linux/i.test(ua)) return 'Linux Web';
  
      // Fallback
      return 'Web';
    } catch (err) {
      console.warn('Platform detection failed:', err);
      return 'Web';
    }
  }

// newly added code for desktop web
const sendDeviceDetails = async(fcm_token, platform) => {
  try {
    const device_type = platform;
    const response = await httpInjectorService.sendDeviceDetails({
      fcm_token,
      device_type
    });
    if (response.status === 'success') {
      console.log('Device details sent successfully');
    } else {
      console.warn('Failed to send device details:', response.message);
    }
  } catch (err) {
    console.error('Error sending device details:', err);
  }
};

  // Separate submit function
  const handleSubmit = async (values) => {
    console.log('Form values:', values);

    if (step === 'email') {
      setStep('password');
      return;
    }

    const reqBody = {
      email: values.email,
      password: values.password,
    };

    try {
      const response = await httpInjectorService.login(reqBody);
      // if (response.status === 'success') {
      //   toast.success(response.message, {
      //     position: 'top-right',
      //     autoClose: 3000,
      //   });
      //   handleLoginSuccess(response, values.email);
      // } else {
      //   toast.error(response.message, {
      //     position: 'top-right',
      //     autoClose: 3000,
      //   });
      // }
      if (response.status === 'success') {
        console.log("hello from mobile web")
        const fcm_token = await requestForToken(); // Get FCM Token
        console.log("FCM Token in login:", fcm_token);
        const platform = getPlatform(); // Get platform type
        console.log('Platform detected:', platform);
        toast.success(response.message, {
              position: 'top-right',
              autoClose: 3000,
            });
        handleLoginSuccess(response, values.email);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleLoginSuccess = async(response, email) => {
    const fcm_token = await requestForToken(); // Get FCM Token
    const platform = getPlatform(); // Get platform type
    Cookies.set('authUser', response.data.tokenid);
    Cookies.set('userRole', encryptData(response.data.role));
    Cookies.set('email', email);
    Cookies.set('role_id', encryptData(response.data.role_id));
    Cookies.set('org_id', encryptData(response.data.org_id));
    Cookies.set('user_id', encryptData(response.data.user_id));
    Cookies.set('username', response.data.user_name);
    localStorage.setItem('authUser', response.data.tokenid);
    localStorage.setItem(
      'accessModules',
      response.data.accessmodule.Accessmodule,
    );
    sessionStorage.setItem('Logged In', true);

    await sendDeviceDetails(fcm_token, platform); // Send device details to backend

    navigate('/admin/default');
  };

  const handleGoogleLogin = async (values) => {
    const reqBody = { token: values.credential };
    try {
      const response = await httpInjectorService.login(reqBody);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        handleLoginSuccess(response, '');
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const goToForgot = () => navigate('/login/forgotpassword');
  const organizationregister = () => navigate('/login/register');

  const signInWithOTP = async (values) => {
    const reqbody = { email: values.email };

    try {
      const response = await httpInjectorService.signInwithotp(reqbody);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        Cookies.set('email', reqbody.email);
        navigate('/login/signinotp');
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching OTP:', error);
    }
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#E1D1F4' }}>
      <Row style={{ height: '100%' }}>
        <Col
          xs="12"
          md="6"
          className="d-flex flex-column justify-content-center align-items-center"
        >
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
            SΛM LĪTΞ
          </h2>
          <img
            src={grpimg}
            alt="Group"
            style={{ maxWidth: '90%', height: 'auto', maxHeight: '90vh' }}
          />
        </Col>

        <Col
          xs="12"
          md="6"
          className="d-flex justify-content-center align-items-center"
          style={{ backgroundColor: '#f4f4f9' }}
        >
          <Card
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '20px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              backgroundColor: '#F7E6FF',
            }}
          >
            <CardBody>
              <CardTitle
                tag="h2"
                className="text-center mb-4"
                style={{ color: '#333' }}
              >
                Sign in
              </CardTitle>

              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  values,
                  errors,
                  touched,
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <FormGroup>
                      <Label for="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        type="email"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                        invalid={touched.email && !!errors.email}
                        style={{ height: '50px' }}
                      />
                      <FormFeedback style={{ display: 'block' }}>
                        {touched.email && errors.email}
                      </FormFeedback>
                    </FormGroup>

                    {step === 'password' && (
                      <>
                        <FormGroup>
                          <Label for="password">Password</Label>
                          <div style={{ position: 'relative' }}>
                            <Input
                              id="password"
                              name="password"
                              placeholder="Enter your password"
                              type={showPassword ? 'text' : 'password'}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.password}
                              invalid={touched.password && !!errors.password}
                              style={{ height: '50px' }}
                            />
                            <span
                              onClick={togglePasswordVisibility}
                              style={{
                                position: 'absolute',
                                right: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                              }}
                            >
                              <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                              />
                            </span>
                            <FormFeedback style={{ display: 'block' }}>
                              {touched.password && errors.password}
                            </FormFeedback>
                          </div>
                        </FormGroup>

                        {/* OTP Option */}
                        <div className="text-end mb-3"></div>

                        {/* Forgot + Register Links */}
                        <div className="d-flex justify-content-between mb-3">
                          <Button
                            variant="link"
                            colorScheme="purple"
                            onClick={() => signInWithOTP(values)}
                          >
                            Login with OTP
                          </Button>

                          <Button
                            variant="link"
                            colorScheme="purple"
                            onClick={goToForgot}
                          >
                            Forgot Password?
                          </Button>

                          {/* <Button
                            variant="link"
                            colorScheme="purple"
                            onClick={organizationregister}
                          >
                            Register organization
                          </Button> */}
                        </div>
                      </>
                    )}

                    <Button
                      colorScheme="purple"
                      className="mt-2 w-100"
                      type="submit"
                      rounded="3"
                    >
                      {step === 'email' ? 'Next' : 'Log In'}
                    </Button>
                  </Form>
                )}
              </Formik>
              <div className="mt-5">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  theme="outline"
                  width="100%"
                  onError={() => {
                    toast.error('Google login failed', {
                      position: 'top-right',
                      autoClose: 3000,
                    });
                  }}
                />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
