import React, { useState } from "react";
import { Row, Col, CardBody, Card, Container, Form, Label, Input, FormFeedback } from "reactstrap";
import { useFormik } from "formik";
import { Button } from "@chakra-ui/react";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import httpInjectorService from "services/http-injector.service";
import { toast } from "react-toastify"; // Ensure you have this import for toast notifications

const ForgotPassword = () => {
  
  const [viewProgressBar, setViewProgressBar] = useState(false);
  const navigate = useNavigate();

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: '',
    },
    
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email format").required("Please Enter Your Email"),
    }),
    onSubmit: async (values) => {
      await getOtp(values.email);
    },
  });

  const getOtp = async (email) => {
    setViewProgressBar(true); // Show the loading state
    try {
      const response = await httpInjectorService.forgotPasswordOtp({ email });
      if (response.status === "success") {
        toast.success(response.message, {
          position: "top-right",
          autoClose: 3000,
        });
        // Optionally, you can navigate or show a modal here
        localStorage.setItem("email", email);
        navigate("/login/forgotpassword/authenticate")
      } else {
        toast.error(response.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error fetching OTP:", error);
      toast.error("Failed to send OTP. Please try again later.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setViewProgressBar(false); // Hide the loading state
    }
  };

  const backToLogin = () => {
    navigate("/login");
  };

  return (
    <React.Fragment>
      <div className="home-btn d-none d-sm-block">
        <Link to="/" className="text-dark">
          <i className="fas fa-home h2" />
        </Link>
      </div>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="overflow-hidden">
                <div style={{backgroundColor:"#884B9E"}}>
                  <Row>
                    <Col className="col-7">
                      <div className="text-dark p-4">
                        <h5 className="text-light">Email Verification</h5>
                      </div>
                    </Col>
                    <Col className="col-5 align-self-end">
                      {/* <img src={profile} alt="" className="img-fluid" /> */}
                    </Col>
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
                        <Label className="form-label">Email</Label>
                        <Input
                          name="email"
                          className="form-control"
                          placeholder="Enter email"
                          type="email"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.email}
                          invalid={validation.touched.email && !!validation.errors.email}
                        />
                        {validation.touched.email && validation.errors.email ? (
                          <FormFeedback>{validation.errors.email}</FormFeedback>
                        ) : null}
                      </div>
                      <Row className="mb-3">
                        <Col className="text-end">
                          <Button
                            colorScheme="purple"
                            type="submit"
                            disabled={viewProgressBar}
                          >
                            {viewProgressBar ? 'Sending OTP...' : 'Send OTP'}
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </div>
                </CardBody>
              </Card>
              <div className="mt-3 text-center">
                <p>
                  Go back to{" "}
                  <a
                    onClick={backToLogin}
                    style={{ cursor: 'pointer' }}
                    className="font-weight-medium text-primary"
                  >
                    Login Page
                  </a>{" "}
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ForgotPassword;
