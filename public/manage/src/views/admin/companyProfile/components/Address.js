import React, { useState, useEffect } from 'react';
import { Card, Col, Row, CardBody, Label, Form, Input } from 'reactstrap';
import { Button } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import httpInjectorService from 'services/http-injector.service';
import { Textarea } from '@chakra-ui/react';
import { BulletList } from 'react-content-loader';

const Address = ({
  isEditingOffice,
  render,
  handleChange,
  formData,
  setIsEditingOffice,
  setFormData,
  postOverview,
}) => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOverview = async () => {
      setLoading(true);
      try {
        const response = await httpInjectorService.getcompanyoverview();
        console.log(response.data, 'overview');
        if (response.data) {
          setFormData({
            registeredOffice: response.data.registeredOffice || '',
            corporateOffice: response.data.corporateOffice || '',
          });
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching office addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    getOverview();
  }, []);


  const saveData = () => {
    postOverview(formData);
    setIsEditingOffice(false);
  };

  return (
    <>
    { loading ? (
      <BulletList/> 
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
          <h5>Office Addresses</h5>
          {!isEditingOffice && render && (
            <Button
              colorScheme="purple"
              onClick={() => setIsEditingOffice(true)}
            >
              Edit
            </Button>
          )}
        </div>
        <CardBody>
          <Form>
            <Row className="g-4">
              <Col xs="12" md="6">
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    color: '#4A5568',
                  }}
                >
                  Registered Office
                </label>
                <Textarea
                  value={formData.registeredOffice}
                  onChange={handleChange}
                  isDisabled={!isEditingOffice}
                  placeholder="Enter Registered Office Address"
                  name="registeredOffice"
                  height="120px"
                  width="100%"
                  padding="12px"
                  fontSize="0.95rem"
                  resize="vertical"
                  overflow="hidden"
                  borderRadius="12px"
                  border="1px solid #E2E8F0"
                  bg="#F9FAFB"
                  _focus={{
                    borderColor: '#805AD5',
                    boxShadow: '0 0 0 1px #805AD5',
                    bg: '#FFFFFF',
                  }}
                />
              </Col>

              <Col xs="12" md="6">
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    color: '#4A5568',
                  }}
                >
                  Corporate Office
                </label>
                <Textarea
                  value={formData.corporateOffice}
                  onChange={handleChange}
                  isDisabled={!isEditingOffice}
                  placeholder="Enter Corporate Office Address"
                  name="corporateOffice"
                  height="120px"
                  width="100%"
                  padding="12px"
                  fontSize="0.95rem"
                  resize="vertical"
                  overflow="hidden"
                  borderRadius="12px"
                  border="1px solid #E2E8F0"
                  bg="#F9FAFB"
                  _focus={{
                    borderColor: '#805AD5',
                    boxShadow: '0 0 0 1px #805AD5',
                    bg: '#FFFFFF',
                  }}
                />
              </Col>
            </Row>

            {isEditingOffice && (
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
                    onClick={() => setIsEditingOffice(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Form>
        </CardBody>
      </Card>
      </>
    )}
    </>
  );
};

export default Address;
