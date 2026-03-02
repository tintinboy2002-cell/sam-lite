import React, { useEffect, useState, useRef } from 'react';
import { Button, Input } from '@chakra-ui/react';
import { Card, Col, Row, CardBody, Form } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { toast } from 'react-toastify';
import { BulletList } from 'react-content-loader';
import logo from '../../../../assets/img/organization/logo1.jpg';
import { MdEdit } from 'react-icons/md';

const Overview = ({
  formData,
  image,
  setImage,
  setFormData,
  isEditingCompany,
  setIsEditingCompany,
  postOverview,
  handleImageChange,
  handleImageclick,
  handleChange,
  setIsEditingOffice,
  render,
  inputRef,
}) => {

  const [errors, setErrors] = useState({});
  const originalDataRef = useRef(null);

  useEffect(() => {
    if (isEditingCompany) {
      originalDataRef.current = JSON.parse(JSON.stringify(formData));
    }
  }, [isEditingCompany]);

  // Validation for the form
  const validateForm = () => {
    let newErrors = {};
  
    // Email validation
     const emailRegex = /^[a-zA-Z._%+-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.companyEmail)) {
      newErrors.companyEmail = "Invalid email format";
    }
  
    // Mobile validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.companyContact)) {
      newErrors.companyContact = "Invalid mobile number. Please enter a valid 10-digit mobile number.";
    }

    // Website validation
    const websiteRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;

    if (!websiteRegex.test(formData.website)) {
      newErrors.website = "Invalid website format. Please enter a valid website URL.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save the data
  const saveData = () => {
    if (!validateForm()) {
      toast.error(errors.companyEmail || errors.companyContact || errors.website || 'Please fill in all required fields', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    postOverview(formData);
    setIsEditingCompany(false);
    setIsEditingOffice(false);
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <BulletList />
      ) : (
        <>
          <Card
            className="shadow bg-white mb-4"
            style={{
              marginTop: '20px',
              maxWidth: '960px',
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
            }}
          >
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Company Overview</h5>
              {!isEditingCompany && render && (
                <Button
                  colorScheme="purple"
                  onClick={() => setIsEditingCompany(!isEditingCompany)}
                >
                  Edit
                </Button>
              )}
            </div>
            <CardBody>
              <Form>
                <Row className="g-4">
                  <Col xs="12">
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          color: '#4A5568',
                        }}
                      >
                        Logo
                      </label>
                      <div
                        style={{
                          position: 'relative',
                        }}
                      >
                        <img
                          src={image || logo}
                          alt="Selected"
                          style={{
                            width: '96px',
                            height: '96px',
                            borderRadius: '50%',
                            objectFit: 'contain',
                            marginBottom: '10px',
                            backgroundColor: '#F9FAFB',
                            border: '1px solid #E2E8F0',
                          }}
                        />
                        {isEditingCompany && render && (
                          <MdEdit
                            onClick={handleImageclick}
                            style={{
                              position: 'absolute',
                              top: '66px',
                              right: '-10px',
                              cursor: 'pointer',
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              padding: '5px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #E2E8F0',
                              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
                            }}
                            size={30}
                          />
                        )}
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={inputRef}
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      accept="image/*"
                    />
                  </Col>
                </Row>
                <Row className="g-4">
                  <Col xs="12" md="6">
                    <div className="mb-3">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          color: '#4A5568',
                        }}
                      >
                        Registered Company Name
                      </label>
                      <Input
                        type="text"
                        name="registeredCompanyName"
                        value={formData.registeredCompanyName}
                        onChange={handleChange}
                        disabled
                        placeholder="Enter Registered Company Name"
                        bg="#F9FAFB"
                        border="1px solid #E2E8F0"
                        borderRadius="12px"
                        padding="12px"
                        fontSize="0.95rem"
                        _focus={{
                          borderColor: '#805AD5',
                          boxShadow: '0 0 0 1px #805AD5',
                          bg: '#FFFFFF',
                        }}
                      />
                    </div>
                  </Col>
                  <Col xs="12" md="6">
                    <div className="mb-3">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          color: '#4A5568',
                        }}
                      >
                        Brand Name
                      </label>
                      <Input
                        type="text"
                        name="brandName"
                        value={formData.brandName}
                        onChange={handleChange}
                        disabled={!isEditingCompany}
                        placeholder="Enter Brand Name"
                        bg="#F9FAFB"
                        border="1px solid #E2E8F0"
                        borderRadius="12px"
                        padding="12px"
                        fontSize="0.95rem"
                        _focus={{
                          borderColor: '#805AD5',
                          boxShadow: '0 0 0 1px #805AD5',
                          bg: '#FFFFFF',
                        }}
                      />
                    </div>
                  </Col>
                </Row>

                <Row className="g-4">
                  <Col xs="12" md="6">
                    <div className="mb-3">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          color: '#4A5568',
                        }}
                      >
                        Company Official Email
                      </label>
                      <Input
                        type="email"
                        name="companyEmail"
                        value={formData.companyEmail}
                        onChange={handleChange}
                        disabled={!isEditingCompany}
                        isInvalid={errors.companyEmail}
                        placeholder="Enter Company Official Email"
                        bg="#F9FAFB"
                        border="1px solid #E2E8F0"
                        borderRadius="12px"
                        padding="12px"
                        fontSize="0.95rem"
                        _focus={{
                          borderColor: '#805AD5',
                          boxShadow: '0 0 0 1px #805AD5',
                          bg: '#FFFFFF',
                        }}
                      />
                      {errors.companyEmail && (
                        <small style={{ color: 'red' }}>{errors.companyEmail}</small>
                      )}
                    </div>
                  </Col>
                  <Col xs="12" md="6">
                    <div className="mb-3">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          color: '#4A5568',
                        }}
                      >
                        Company Official Contact
                      </label>
                      <Input
                        type="text"
                        name="companyContact"
                        value={formData.companyContact}
                        onChange={handleChange}
                        disabled={!isEditingCompany}
                        isInvalid={errors.companyContact}
                        placeholder="Enter Company Official Contact"
                        bg="#F9FAFB"
                        border="1px solid #E2E8F0"
                        borderRadius="12px"
                        padding="12px"
                        fontSize="0.95rem"
                        _focus={{
                          borderColor: '#805AD5',
                          boxShadow: '0 0 0 1px #805AD5',
                          bg: '#FFFFFF',
                        }}
                      />
                      {errors.companyContact && (
                        <small style={{ color: 'red' }}>{errors.companyContact}</small>
                      )}
                    </div>
                  </Col>
                </Row>

                <Row className="g-4">
                  <Col xs="12" md="6">
                    <div className="mb-3">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          color: '#4A5568',
                        }}
                      >
                        Website
                      </label>
                      <Input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        disabled={!isEditingCompany}
                        isInvalid={errors.website}
                        placeholder="Enter Website"
                        bg="#F9FAFB"
                        border="1px solid #E2E8F0"
                        borderRadius="12px"
                        padding="12px"
                        fontSize="0.95rem"
                        _focus={{
                          borderColor: '#805AD5',
                          boxShadow: '0 0 0 1px #805AD5',
                          bg: '#FFFFFF',
                        }}
                      />
                      {errors.website && (
                        <small style={{ color: 'red' }}>{errors.website}</small>
                      )}
                    </div>
                  </Col>
                  <Col xs="12" md="6">
                    <div className="mb-3">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          color: '#4A5568',
                        }}
                      >
                        Domain Name
                      </label>
                      <Input
                        type="text"
                        name="domainName"
                        value={formData.domainName}
                        onChange={handleChange}
                        disabled={!isEditingCompany}
                        placeholder="Enter Domain Name"
                        bg="#F9FAFB"
                        border="1px solid #E2E8F0"
                        borderRadius="12px"
                        padding="12px"
                        fontSize="0.95rem"
                        isInvalid={errors.domainName}
                        _focus={{
                          borderColor: '#805AD5',
                          boxShadow: '0 0 0 1px #805AD5',
                          bg: '#FFFFFF',
                        }}
                      />
                      {errors.domainName && (
                        <small style={{ color: 'red' }}>{errors.domainName}</small>
                      )}
                    </div>
                  </Col>
                </Row>

                <Row className="g-4">
                  <Col xs="12" md="6">
                    <div className="mb-3">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          color: '#4A5568',
                        }}
                      >
                        Industry Type
                      </label>
                      <Input
                        type="text"
                        name="industryType"
                        value={formData.industryType}
                        onChange={handleChange}
                        disabled={!isEditingCompany}
                        placeholder="Enter Industry Type"
                        bg="#F9FAFB"
                        border="1px solid #E2E8F0"
                        borderRadius="12px"
                        padding="12px"
                        fontSize="0.95rem"
                        isInvalid={errors.industryType}
                        _focus={{
                          borderColor: '#805AD5',
                          boxShadow: '0 0 0 1px #805AD5',
                          bg: '#FFFFFF',
                        }}
                      />
                      {errors.industryType && (
                        <small style={{ color: 'red' }}>{errors.industryType}</small>
                      )}
                    </div>
                  </Col>
                </Row>

                {isEditingCompany && (
                  <div
                    className="row"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: '20px',
                    }}
                  >
                    <div className="col-md-12" style={{ textAlign: 'center' }}>
                      <Button colorScheme="purple" onClick={saveData}>
                        Save
                      </Button>
                      <Button
                        className="btn btn-secondary"
                        style={{ marginLeft: '10px' }}
                        onClick={() => {
                          setFormData(originalDataRef.current);
                          setIsEditingCompany(false);
                        }}
                      disabled={!isEditingCompany}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Form>
            </CardBody>
          </Card>

          <Card
            className="shadow bg-white mb-4"
            style={{
              marginTop: '20px',
              maxWidth: '960px',
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
            }}
          >
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Social Media Profiles</h5>
            </div>
            <CardBody>
              <div>
                <a
                  href="https://www.linkedin.com/in/alan-paul-962968231?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon
                    icon={faLinkedin}
                    size="2x"
                    style={{ marginRight: '10px' }}
                  />
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faInstagram} size="2x" />
                </a>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </>
  );
};

export default Overview;
