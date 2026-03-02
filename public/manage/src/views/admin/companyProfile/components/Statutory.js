import React, { useState, useEffect } from 'react';
import { Card, CardBody, Row, Col, Form } from 'reactstrap';
import { Button, Input } from '@chakra-ui/react';
import httpInjectorService from 'services/http-injector.service';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { BulletList } from 'react-content-loader';
import { setcompanydetails } from 'store/actions';
import { useDispatch } from 'react-redux';

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '600',
  fontSize: '0.95rem',
  color: '#4A5568',
};

const inputProps = {
  bg: '#F9FAFB',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '12px',
  fontSize: '0.95rem',
  _focus: {
    borderColor: '#805AD5',
    boxShadow: '0 0 0 1px #805AD5',
    bg: '#FFFFFF',
  },
};

const cardStyle = {
  marginTop: '20px',
  maxWidth: '960px',
  marginLeft: 'auto',
  marginRight: 'auto',
  borderRadius: '16px',
  border: '1px solid #E2E8F0',
  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
};

const CompanyDetails = ({ activeTab }) => {
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const comData = useSelector((state) => state.Authentication.companydata);

  const [companyData, setCompanyData] = useState({
    entity_type: '',
    cin: '',
    date_of_incorporation: '',
    company_pan: '',
    company_tan: '',
    gst: '',
    account_title: '',
    bank_name: '',
    account_number: '',
    branch_name: '',
    city: '',
    ifsc: '',
    account_type: '',
    corporate_Id: '',
  });

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({ ...prev, [name]: value }));
  };

    // // ================= RELOAD FROM SERVER =================
    const refreshCompanyData = async () => {
      const response = await httpInjectorService.getcompanyoverview();
      if (response.status === 'success') {
        dispatch(setcompanydetails(response.data));
      }
    };
    

  // ================= SAVE COMPANY =================
  const saveCompanyData = async () => {
    const payload = {
      ...companyData,
    };

    try {
      const response = await httpInjectorService.putstatutory(payload);
      if (response.status === 'success') {
        toast.success(response.message);
        await refreshCompanyData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update company');
    }

    setIsEditingCompany(false);
  };

  // ================= SAVE BANK =================
  const saveBankData = async () => {
    const payload = {
      account_title: companyData.account_title,
      bank_name: companyData.bank_name,
      account_number: companyData.account_number,
      branch_name: companyData.branch_name,
      city: companyData.city,
      ifsc: companyData.ifsc,
      account_type: companyData.account_type,
      corporate_Id: companyData.corporate_Id,
    };

    try {
      const response = await httpInjectorService.putstatutory(payload);
      if (response.status === 'success') {
        toast.success(response.message);
        await refreshCompanyData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update bank');
    } finally {
      setIsEditingBank(false);
    }
  };

  // ================= LOAD DATA =================
  useEffect(() => {
    if (activeTab === '6' && comData?.length) {
      const d = comData[0];
      setCompanyData({
        entity_type: d?.entity_type || '',
        cin: d?.cin || '',
        date_of_incorporation: d?.date_of_incorporation
          ? new Date(d.date_of_incorporation).toISOString().split('T')[0]
          : '',
        company_pan: d?.company_pan || '',
        company_tan: d?.company_tan || '',
        gst: d?.gst || '',
        account_title: d?.account_title || '',
        bank_name: d?.bank_name || '',
        account_number: d?.account_number || '',
        branch_name: d?.branch_name || '',
        city: d?.city || '',
        ifsc: d?.ifsc || '',
        account_type: d?.account_type || '',
        corporate_Id: d?.corporate_Id || '',
      });
    }
  }, [activeTab, comData]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <BulletList />;

  return (
    <>
      {/* COMPANY CARD */}
      <Card className="shadow bg-white mb-4" style={cardStyle}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>Company ID</h5>
          {!isEditingCompany && (
            <Button colorScheme="purple" onClick={() => setIsEditingCompany(true)}>
              Edit
            </Button>
          )}
        </div>
        <CardBody>
          <Form>
            <Row className="g-4">
              {[
                ['Entity Type', 'entity_type', 'text'],
                ['CIN', 'cin', 'text'],
                ['Date of Incorporation', 'date_of_incorporation', 'date'],
                ['Company PAN', 'company_pan', 'text'],
                ['Company TAN', 'company_tan', 'text'],
                ['GST', 'gst', 'text'],
              ].map(([label, name, type = 'text']) => (
                <Col xs="12" md="6" key={name}>
                  <div className="mb-3">
                    <label style={labelStyle}>{label}</label>
                    <Input
                      type={type}
                      name={name}
                      value={companyData[name]}
                      onChange={handleCompanyChange}
                      disabled={!isEditingCompany}
                      placeholder={`Enter ${label}`}
                      {...inputProps}
                    />
                  </div>
                </Col>
              ))}
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
                  <Button colorScheme="purple" onClick={saveCompanyData}>
                    Save
                  </Button>
                  <Button
                    className="btn btn-secondary"
                    style={{ marginLeft: '10px' }}
                    onClick={() => setIsEditingCompany(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Form>
        </CardBody>
      </Card>

      {/* BANK CARD */}
      <Card className="shadow bg-white mb-4" style={cardStyle}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>Bank Details</h5>
          {!isEditingBank && (
            <Button colorScheme="purple" onClick={() => setIsEditingBank(true)}>
              Edit
            </Button>
          )}
        </div>
        <CardBody>
          <Form>
            <Row className="g-4">
              {[
                ['Account Title', 'account_title'],
                ['Bank Name', 'bank_name'],
                ['Account Number', 'account_number'],
                ['Branch Name', 'branch_name'],
                ['City', 'city'],
                ['IFSC', 'ifsc'],
                ['Account Type', 'account_type'],
                ['Corporate ID', 'corporate_Id'],
              ].map(([label, name]) => (
                <Col xs="12" md="6" key={name}>
                  <div className="mb-3">
                    <label style={labelStyle}>{label}</label>
                    <Input
                      type="text"
                      name={name}
                      value={companyData[name]}
                      onChange={handleCompanyChange}
                      disabled={!isEditingBank}
                      placeholder={`Enter ${label}`}
                      {...inputProps}
                    />
                  </div>
                </Col>
              ))}
            </Row>

            {isEditingBank && (
              <div
                className="row"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '20px',
                }}
              >
                <div className="col-md-12" style={{ textAlign: 'center' }}>
                  <Button colorScheme="purple" onClick={saveBankData}>
                    Save
                  </Button>
                  <Button
                    className="btn btn-secondary"
                    style={{ marginLeft: '10px' }}
                    onClick={() => setIsEditingBank(false)}
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
  );
};

export default CompanyDetails;