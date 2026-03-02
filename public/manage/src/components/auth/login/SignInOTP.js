import { Row, Col, Card, CardBody, CardTitle } from 'reactstrap';
import enterotp from '../../../assets/img/organization/enterotp.png';
import { PinInput, PinInputField, Button, HStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { encryptData } from 'utils/crypto';

const SignInOTP = () => {
  const [otp, setOtp] = useState('');
  const email = Cookies.get('email');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleverify = async () => {
    const reqbody = { email: email, otp: otp };
    try {
      const response = await httpInjectorService.login(reqbody);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
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
        navigate('/admin/default');
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
    } finally {
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#E1D1F4',
        overflow: 'hidden',
      }}
    >
      <Row style={{ minHeight: '100vh', margin: '0', overflow: 'hidden' }}>
        <Col
          xs="12"
          md="6"
          className="d-flex flex-column justify-content-center align-items-center"
        >
          <img
            src={enterotp}
            alt="Group"
            style={{
              maxWidth: '100%',
              minHeight: '100vh',
              objectFit: 'contain',
            }}
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
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              backgroundColor: '#F7E6FF',
            }}
          >
            <CardBody>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="purple"
                onClick={handleBack}
                mb={4}
              >
                ← Back
              </Button>
              <CardTitle
                tag="h2"
                className="text-right mb-1"
                style={{ color: '#333' }}
              >
                Enter OTP
              </CardTitle>
              <span style={{ color: 'grey' }}>
                We have share a otp to your registered email 
              </span>
              <span style={{ color: 'grey' }}>&nbsp;{email}</span>
              <div className="mt-4 d-flex justify-content-center">
                <HStack spacing={4} mt={4} justify="center">
                  <PinInput otp onChange={(value) => setOtp(value)}>
                    <PinInputField
                      border="2px solid #333"
                      _focus={{
                        borderColor: '#6B46C1',
                        boxShadow: '0 0 0 1px #6B46C1',
                      }}
                    />
                    <PinInputField
                      border="2px solid #333"
                      _focus={{
                        borderColor: '#6B46C1',
                        boxShadow: '0 0 0 1px #6B46C1',
                      }}
                    />
                    <PinInputField
                      border="2px solid #333"
                      _focus={{
                        borderColor: '#6B46C1',
                        boxShadow: '0 0 0 1px #6B46C1',
                      }}
                    />
                    <PinInputField
                      border="2px solid #333"
                      _focus={{
                        borderColor: '#6B46C1',
                        boxShadow: '0 0 0 1px #6B46C1',
                      }}
                    />
                    <PinInputField
                      border="2px solid #333"
                      _focus={{
                        borderColor: '#6B46C1',
                        boxShadow: '0 0 0 1px #6B46C1',
                      }}
                    />
                    <PinInputField
                      border="2px solid #333"
                      _focus={{
                        borderColor: '#6B46C1',
                        boxShadow: '0 0 0 1px #6B46C1',
                      }}
                    />
                  </PinInput>
                </HStack>
              </div>

              <Button
                colorScheme="purple"
                mt={6}
                width="100%"
                onClick={handleverify}
              >
                Verify
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SignInOTP;
