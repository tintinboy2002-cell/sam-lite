import React, {useState} from 'react'
import {
    Card,
    CardBody,
    Col,
    Container,
    Form,
    FormGroup,
    Row,
  } from "reactstrap"
import { Button } from '@chakra-ui/react';
import AuthCode from 'react-auth-code-input';
import httpInjectorService from 'services/http-injector.service';
import classes from '../login/authcode.module.css';
import {  useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const AuthTwostepVerification = () => {
const [otp, setOtp] = useState();
const [viewProgressBar, setViewProgressBar] = useState(false);
const [resendOtpEvent, setResendOtpEvent] = useState(true);
const navigate=useNavigate()
const resetPassword = JSON.parse(localStorage.getItem('resetPassword'));

  if(resetPassword !== true || resetPassword === undefined){
        
  }



  const email=localStorage.getItem('email');

const verifyOtp = async () => {

    setViewProgressBar(oldValue => {
      return true;
    });
    const reqBody ={
      email: email,
      otp: otp
    };
    try {
      const response = await httpInjectorService.verifyOtp(reqBody);
      setViewProgressBar(oldValue => {
        return false;
      });
        if (response.status === "success") {
          toast.success(response.message, {
            position: "top-right",
            autoClose: 2000,
          });
          navigate("/login/forgotpassword/resetpassword");            
        } else {
          toast.error(response.message, {
            position: "top-right",
            autoClose: 2000,
          });
        }
    } catch (error) {
      console.log(error)
      setViewProgressBar(oldValue => {
        return false;
      });
    }
  }




  const resendOtp = async () => {
    setResendOtpEvent(false);
    try {
      const response = await httpInjectorService.forgotPasswordOtp();
      setTimeout(() => {
        setResendOtpEvent(true);
      },120000);
      if (response.status === "success") {
        toast.success(response.message, {
          position: "top-right",
          autoClose: 2000,
        });     
      } else {
        toast.error(response.message, {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error(error, '', {
        position: "top-right",
        autoClose: 2000,
      });
    }
  }


 const handleOnChange = (res) => {
    setOtp(res);
  };

  const backToLogin = () => {
    navigate("/login");
 }
 



  return (

    <React.Fragment>
    <div className="account-pages my-5 pt-sm-5">
      <Container>
        
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={6}>
            <Card>
              <CardBody>
                <div className="p-2">
                  <div className="text-center">
                    <div className="avatar-md mx-auto">
                      {/* <div className="avatar-title rounded-circle bg-light"> */}
                        <i className="bx bxs-envelope h1 mb-0 text-primary"></i>
                      {/* </div> */}
                    </div>
                    <div className="p-2 mt-4">
                      <h4>Verify your email</h4>
                      <p className="mb-5">
                        Please enter the 6 digit code sent to{" "}
                        <span className="font-weight-semibold">
                          {email}
                        </span>
                      </p>

                      <Form>
                        <Row>
                          <Col xs={12}>
                            <FormGroup className="verification">
                              <label
                                htmlFor="digit1-input"
                                className="sr-only"
                              >
                              
                              </label>
                              <AuthCode
                                characters={6}
                                className="form-control form-control-lg text-center"
                                allowedCharacters="alphanumeric"
                                // inputStyle={{
                                //   width: "50px",
                                //   height: "50px",
                                //   padding: "8px",
                                //   borderRadius: "8px",
                                //   fontSize: "16px",
                                //   textAlign: "center",
                                //   marginRight: "15px",
                                //   border: "1px solid #ced4da",
                                //   textTransform: "uppercase",
                                // }}
                                inputClassName={classes.authCodeInput}
                                onChange={handleOnChange}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </Form>

                      <div className="mt-4">
                        <Button 
                          colorScheme="purple"
                           onClick={verifyOtp}
                           disabled={viewProgressBar === false ? false : true }
                        >
                          {viewProgressBar === false ? "Verify Otp" : 'Verifying Otp...'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
            <div className="mt-5 text-center">
            <p>
                Go back to{" "}
                <a
                  className="font-weight-medium text-primary"
                  onClick={backToLogin}
                  style={{cursor:"pointer"}}
                  href=''
                >
                  Login
                </a>{" "}
              </p>
              <p>
                Didn&apos;t receive otp ?{resendOtpEvent === true ? ' ' : ' Resend otp in 2 minutes'}
                <a onClick={resendOtp} className="fw-medium text-primary" style={{cursor:"pointer"}}
                  href=''
                  >
                    {" "}
                    {resendOtpEvent === true ? 'Resend' : ''}{" "}
                  </a>{" "}
                </p>

              {/* <p>
                © {new Date().getFullYear()} Skote. Crafted with{" "}
                <i className="mdi mdi-heart text-danger"></i> by Themesbrand
              </p> */}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  </React.Fragment>
  )
}

export default AuthTwostepVerification