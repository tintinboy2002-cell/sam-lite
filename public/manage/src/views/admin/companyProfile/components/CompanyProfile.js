import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Flex,
  Text,
  Avatar,
  Button,
  IconButton,
  Divider,
} from '@chakra-ui/react';

import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import Policies from './Policies';
import Address from './Address';
import Department from './Department';
import Designation from './Designation';
import Statutory from './Statutory';
import { Card, Col, Row, CardBody, Label, Form } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faInstagram } from '@fortawesome/free-brands-svg-icons';
import httpInjectorService from 'services/http-injector.service';
import { ToastContainer, toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setcompanydetails } from 'store/actions';
import Cookies from 'js-cookie';
import Spinner from 'components/common/Spinner';
// import nubaxlogo from '../../../../assets/img/offboarding/nubaxlogo.png';
import logo from '../../../../assets/img/organization/logo1.jpg';
import { set } from 'store';
import Overview from './Overview';
import {
  MdEdit,
  MdDashboard,
  MdLocationOn,
  MdPolicy,
  MdAccountTree,
  MdBadge,
  MdGavel,
  MdReport,
} from 'react-icons/md';
import { decryptData } from 'utils/crypto';
import SkeletonWithLoaders from 'components/common/Spinner';

// import profile from 'assets/img/profile.jpg';
import company from 'assets/img/company.jpg';
import Report from 'views/admin/profile/components/Report';
import CompanyReportingManager from 'views/admin/reporting/CompanyReportingManager';
import ReportingContainer from 'views/admin/reporting/ReportingContainer';

const CompanyProfile = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingOffice, setIsEditingOffice] = useState(false);
  const [render, setRender] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null); // Using useRef for file input
  const [image, setImage] = useState('');
  const [isImg, setIsImg] = useState(false);
  const [isImageChanged, setIsImageChanged] = useState(false);

  const [formData, setFormData] = useState({
    registeredCompanyName: '',
    brandName: '',
    companyEmail: '',
    companyContact: '',
    website: '',
    domainName: '',
    industryType: '',
    registeredOffice: '',
    corporateOffice: '',
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const renderId = decryptData(Cookies.get('role_id'));
    console.log(renderId, 'renderId');
    if (renderId === 2 || renderId === 1) {
      setRender(true);
    }

    // Fetch company overview data
    const getOverview = async () => {
      try {
        const response = await httpInjectorService.getcompanyoverview();
        dispatch(setcompanydetails(response.data));
        console.log(dispatch(setcompanydetails(response.data)), 'getoverview');
        if (response.data) {
          setFormData({
            registeredCompanyName: response.data[0].company_name || '',
            brandName: response.data[0].brand_name || '',
            companyEmail: response.data[0].official_email || '',
            companyContact: response.data[0].official_contact || '',
            website: response.data[0].website || '',
            domainName: response.data[0].domain || '',
            industryType: response.data[0].industry_type || '',
            registeredOffice: response.data[0].registered_office || '',
            corporateOffice: response.data[0].corporate_office || '',
          });
          setImage(response.data[0].logo_url);
        }
      } catch (error) {
        console.error('Error fetching company overview:', error);
      } finally {
        setLoading(false);
      }
    };

    getOverview();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Function to post company overview data
  const postOverview = async (data) => {
    const formDataa = new FormData();
    // Append each data field separately
    formDataa.append('registeredCompanyName', data.registeredCompanyName);
    formDataa.append('brandName', data.brandName);
    formDataa.append('companyEmail', data.companyEmail);
    formDataa.append('companyContact', data.companyContact);
    formDataa.append('website', data.website);
    formDataa.append('domainName', data.domainName);
    formDataa.append('industryType', data.industryType);
    formDataa.append('registeredOffice', data.registeredOffice);
    formDataa.append('corporateOffice', data.corporateOffice);
    // Append the file
    if (isImageChanged) {
      formDataa.append('file', inputRef.current.files[0]);
    }

    try {
      const response = await httpInjectorService.postcompanyoverview(formDataa);

      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error('Error occurred while updating company overview.', {
        position: 'top-right',
        autoClose: 3000,
      });
      console.error('Error posting company overview:', error);
    } finally {
      setIsImageChanged(false);
    }
  };

  const saveData = () => {
    postOverview(formData);
    setIsEditingCompany(false);
    setIsEditingOffice(false);
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Setting image using FileReader
        setIsImg(true);
      };
      reader.readAsDataURL(file);
      setIsImageChanged(true);
    }
  };

  const handleImageClick = () => {
    inputRef.current.click(); // Using ref to trigger file input
  };

  return (
    <SkeletonWithLoaders>
      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          w="100%"
          mt="80px" // Margin top to position it below other elements
        >
          <Spinner size="xl" color="purple.500" />
        </Box>
      )}

      {!loading && (
        <>
          <Box
            mt={{
              base: '40px',
              md: '60px',
            }}
          >
            <Box
              position="relative"
              w="100%"
              bgImage={{ base: 'none', md: `url(${company})` }}
              bgSize="cover"
              bgPosition="center"
              bgRepeat="no-repeat"
              borderRadius="md"
              p={{ base: 0, md: 6 }}
              h={{ base: '30vh', md: '44vh', lg: '30vh' }}
            >
              <Flex
                direction={{ base: 'column', md: 'row' }}
                gap={6}
                align="flex-start"
                wrap="wrap"
              >
                {/* left profile UI card */}
                <Box
                  w="100%"
                  maxW={{ base: '100%', md: '320px' }}
                  mx={{ base: 'auto', md: '0' }}
                  bg="white"
                  borderRadius="xl"
                  boxShadow="lg"
                  p={6}
                  textAlign="center"
                >
                  <Box position="relative" display="inline-block">
                    <Avatar
                      size={{ base: 'xl', md: '2xl' }}
                      src={image || logo}
                      name={formData.brandName}
                    />

                    {render && (
                      <IconButton
                        icon={<MdEdit />}
                        size="sm"
                        position="absolute"
                        bottom="2"
                        right="2"
                        borderRadius="full"
                        colorScheme="purple"
                        onClick={handleImageClick}
                      />
                    )}

                    <input
                      type="file"
                      hidden
                      ref={inputRef}
                      onChange={handleImageChange}
                    />
                  </Box>

                  <Text fontSize="xl" fontWeight="bold" mt={4}>
                    {formData.brandName || 'Company Name'}
                  </Text>

                  <Text color="gray.500" fontSize="sm">
                    {formData.companyEmail}
                  </Text>

                  <Text color="gray.500" fontSize="sm">
                    {formData.website}
                  </Text>

                  {render && (
                    <Button
                      mt={4}
                      size="sm"
                      colorScheme="purple"
                      onClick={() => setIsEditingCompany(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>

                {/* right tab panel */}
                <Box
                  width="100%"
                  flex="1"
                  bg="white"
                  borderRadius="xl"
                  boxShadow="lg"
                  p={{ base: 4, md: 4 }}
                >
                  <Nav tabs>
                    {[
                      { label: 'Overview', icon: MdDashboard },
                      { label: 'Address', icon: MdLocationOn },
                      { label: 'Policies', icon: MdPolicy },
                    ]
                      .concat(
                        render
                          ? [
                              { label: 'Department', icon: MdAccountTree },
                              { label: 'Designation', icon: MdBadge },
                              { label: 'Statutory', icon: MdGavel },
                              { label: 'Reporting', icon: MdReport },
                            ]
                          : [],
                      )
                      .map((tab, index) => (
                        <NavItem key={index}>
                          <NavLink
                            className={classnames({
                              active: activeTab === (index + 1).toString(),
                            })}
                            onClick={() => toggleTab((index + 1).toString())}
                            style={{
                              whiteSpace: 'nowrap', // PREVENT WRAP
                              padding: '12px 16px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              color:
                                activeTab === (index + 1).toString()
                                  ? '#6B46C1'
                                  : '#555',
                              borderBottom:
                                activeTab === (index + 1).toString()
                                  ? '3px solid #6B46C1'
                                  : 'none',
                            }}
                            title={tab.label}
                            aria-label={tab.label}
                          >
                            <Box
                              as="span"
                              display={{ base: 'inline-flex', md: 'none' }}
                              alignItems="center"
                              justifyContent="center"
                              fontSize="20px"
                              lineHeight="1"
                            >
                              <tab.icon />
                            </Box>
                            <Box
                              as="span"
                              display={{ base: 'none', md: 'inline' }}
                            >
                              {tab.label}
                            </Box>
                          </NavLink>
                        </NavItem>
                      ))}
                  </Nav>

                  {/* EXISTING TAB LOGIC */}
                  <TabContent activeTab={activeTab}>
                    <TabPane tabId="1">
                      <Overview
                        formData={formData}
                        setFormData={setFormData}
                        isEditingCompany={isEditingCompany}
                        setIsEditingCompany={setIsEditingCompany}
                        setIsEditingOffice={setIsEditingOffice}
                        postOverview={postOverview}
                        handleImageChange={handleImageChange}
                        handleImageclick={handleImageClick}
                        handleChange={handleChange}
                        image={image}
                        setImage={setImage}
                        render={render}
                        inputRef={inputRef}
                      />
                    </TabPane>

                    <TabPane tabId="2">
                      <Address
                        isEditingOffice={isEditingOffice}
                        render={render}
                        handleChange={handleChange}
                        formData={formData}
                        postOverview={postOverview}
                        setIsEditingOffice={setIsEditingOffice}
                      />
                    </TabPane>

                    <TabPane tabId="3">
                      <Policies activeTab={activeTab} />
                    </TabPane>

                    {render && (
                      <>
                        <TabPane tabId="4">
                          <Department activeTab={activeTab} />
                        </TabPane>

                        <TabPane tabId="5">
                          <Designation activeTab={activeTab} />
                        </TabPane>

                        <TabPane tabId="6">
                          <Statutory activeTab={activeTab} />
                        </TabPane>

                        <TabPane tabId="7">
                          {/* <CompanyReportingManager activeTab={activeTab}/> */}
                          <ReportingContainer activeTab={activeTab}/>
                        </TabPane>
                      </>
                    )}
                  </TabContent>
                </Box>
              </Flex>
            </Box>
          </Box>
        </>
      )}
    </SkeletonWithLoaders>
  );
};

export default CompanyProfile;
