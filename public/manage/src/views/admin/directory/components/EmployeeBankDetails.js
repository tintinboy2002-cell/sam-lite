import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  SimpleGrid,
  useDisclosure,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { decryptData } from 'utils/crypto';
import { BulletList } from 'react-content-loader';

const EmployeeBankdetails = ({ activeTab }) => {
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState(null); // To handle errors
  const roleId = decryptData(Cookies.get('role_id'));
  const { id } = useParams();
  console.log(id, 'userid');

  useEffect(() => {
    if (activeTab === '5') {
      fetchBankDetails();
    }
  }, [activeTab]);

  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const response = await httpInjectorService.getBankDetails(id);
      if (response.status === 'success') {
        // Update form values with the fetched data
        const data = response.data[0];
        formik.setValues({
          account_holder_name: data.account_holder_name || '',
          bank_name: data.bank_name || '',
          account_number: data.account_number || '',
          branch_name: data.branch_name || '',
          ifsc_code: data.ifsc_code || '',
          city: data.city || '',
          user_id: id,
        });
      } else {
        // toast.error(response.message, {
        //   position: 'top-right',
        //   autoClose: 3000,
        // });
      }
    } catch (error) {
      setError('Failed to fetch bank details.');
      // toast.error('An error occurred while fetching the details.', {
      //   position: 'top-right',
      //   autoClose: 3000,
      // });
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      account_holder_name: '',
      bank_name: '',
      account_number: '',
      branch_name: '',
      ifsc_code: '',
      city: '',
      user_id: id,
    },
    validationSchema: Yup.object({
      account_holder_name: Yup.string().required('Required'),
      bank_name: Yup.string().required('Required'),
      account_number: Yup.string()
        .matches(/^[0-9]+$/, 'Must be numeric')
        .required('Required'),
      branch_name: Yup.string().required('Required'),
      ifsc_code: Yup.string().trim().required('Required'),
      city: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      console.log('values:', values);
      try {
        const response = await httpInjectorService.UpdatebankDetails(values);
        if (response.status === 'success') {
          toast.success(response.message, {
            position: 'top-right',
            autoClose: 3000,
          });
          formik.resetForm();
        } else {
          toast.error(response.message, {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred while submitting the form.', {
          position: 'top-right',
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleSave = () => {
    if (formik.dirty) {
      formik.handleSubmit();
      setIsEditable(false);
      formik.resetForm({ values: formik.values });
    }
  };

return (
  <>
    {
      loading ? (
        <BulletList/>
      ) : (
        // <Box
        //   maxW="960px"
        //   mx="auto"
        //   p={{ base: 4, md: 8 }}
        //   borderWidth="1px"
        //   borderColor="#E2E8F0"
        //   borderRadius="16px"
        //   bg="white"
        //   boxShadow="0 18px 45px rgba(15, 23, 42, 0.12)"
        //   position="relative"
        //   mt={{ base: 4, md: 6 }}
        // >
        <>
          {!isEditable && roleId === 2 && (
            <Button
              onClick={handleEdit}
              colorScheme="purple"
              position="relative"
              float="right"
              size={{ base: 'sm', md: 'md' }}
              borderRadius="12px"
              fontWeight="600"
              boxShadow="0 4px 12px rgba(128, 90, 213, 0.3)"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(128, 90, 213, 0.4)',
              }}
              transition="all 0.2s ease"
            >
              Edit
            </Button>
          )}
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={{ base: 4, md: 6 }}>
              <Box
                borderBottom="2px solid"
                borderColor="purple.200"
                pb={3}
                mb={2}
              >
                <Text
                  fontSize={{ base: 'xl', md: '2xl' }}
                  fontWeight="700"
                  color="#1A202C"
                  letterSpacing="-0.02em"
                >
                  Salary Account Details
                </Text>
              </Box>
  
              <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
                <FormControl
                  isInvalid={
                    formik.touched.account_holder_name &&
                    !!formik.errors.account_holder_name
                  }
                >
                  <FormLabel
                    fontWeight="600"
                    fontSize="0.95rem"
                    color="#4A5568"
                    mb={2}
                  >
                    Account Holder's Name
                  </FormLabel>
                  <Input
                    name="account_holder_name"
                    type="text"
                    value={formik.values.account_holder_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Account Holder's Name"
                    isDisabled={!isEditable}
                    bg={!isEditable ? '#F9FAFB' : 'white'}
                    border="1px solid #E2E8F0"
                    borderRadius="12px"
                    padding="12px"
                    fontSize="0.95rem"
                    _focus={{
                      borderColor: '#805AD5',
                      boxShadow: '0 0 0 1px #805AD5',
                      bg: 'white',
                    }}
                    _disabled={{
                      opacity: 0.6,
                      cursor: 'not-allowed',
                    }}
                  />
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formik.touched.account_holder_name &&
                      formik.errors.account_holder_name}
                  </Text>
                </FormControl>
              </SimpleGrid>
  
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <FormControl
                  isInvalid={formik.touched.bank_name && !!formik.errors.bank_name}
                >
                  <FormLabel
                    fontWeight="600"
                    fontSize="0.95rem"
                    color="#4A5568"
                    mb={2}
                  >
                    Bank Name
                  </FormLabel>
                  <Input
                    name="bank_name"
                    value={formik.values.bank_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Bank Name"
                    isDisabled={!isEditable}
                    bg={!isEditable ? '#F9FAFB' : 'white'}
                    border="1px solid #E2E8F0"
                    borderRadius="12px"
                    padding="12px"
                    fontSize="0.95rem"
                    _focus={{
                      borderColor: '#805AD5',
                      boxShadow: '0 0 0 1px #805AD5',
                      bg: 'white',
                    }}
                    _disabled={{
                      opacity: 0.6,
                      cursor: 'not-allowed',
                    }}
                  />
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formik.touched.bank_name && formik.errors.bank_name}
                  </Text>
                </FormControl>
  
                <FormControl
                  isInvalid={
                    formik.touched.account_number && !!formik.errors.account_number
                  }
                >
                  <FormLabel
                    fontWeight="600"
                    fontSize="0.95rem"
                    color="#4A5568"
                    mb={2}
                  >
                    Account Number
                  </FormLabel>
                  <Input
                    name="account_number"
                    type="text"
                    value={formik.values.account_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Account Number"
                    isDisabled={!isEditable}
                    bg={!isEditable ? '#F9FAFB' : 'white'}
                    border="1px solid #E2E8F0"
                    borderRadius="12px"
                    padding="12px"
                    fontSize="0.95rem"
                    _focus={{
                      borderColor: '#805AD5',
                      boxShadow: '0 0 0 1px #805AD5',
                      bg: 'white',
                    }}
                    _disabled={{
                      opacity: 0.6,
                      cursor: 'not-allowed',
                    }}
                  />
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formik.touched.account_number && formik.errors.account_number}
                  </Text>
                </FormControl>
  
                <FormControl
                  isInvalid={
                    formik.touched.branch_name && !!formik.errors.branch_name
                  }
                >
                  <FormLabel
                    fontWeight="600"
                    fontSize="0.95rem"
                    color="#4A5568"
                    mb={2}
                  >
                    Branch Name
                  </FormLabel>
                  <Input
                    name="branch_name"
                    value={formik.values.branch_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Branch Name"
                    isDisabled={!isEditable}
                    bg={!isEditable ? '#F9FAFB' : 'white'}
                    border="1px solid #E2E8F0"
                    borderRadius="12px"
                    padding="12px"
                    fontSize="0.95rem"
                    _focus={{
                      borderColor: '#805AD5',
                      boxShadow: '0 0 0 1px #805AD5',
                      bg: 'white',
                    }}
                    _disabled={{
                      opacity: 0.6,
                      cursor: 'not-allowed',
                    }}
                  />
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formik.touched.branch_name && formik.errors.branch_name}
                  </Text>
                </FormControl>
              </SimpleGrid>
  
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl
                  isInvalid={formik.touched.ifsc_code && !!formik.errors.ifsc_code}
                >
                  <FormLabel
                    fontWeight="600"
                    fontSize="0.95rem"
                    color="#4A5568"
                    mb={2}
                  >
                    IFSC Code
                  </FormLabel>
                  <Input
                    name="ifsc_code"
                    type="text"
                    value={formik.values.ifsc_code}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter IFSC Code"
                    isDisabled={!isEditable}
                    bg={!isEditable ? '#F9FAFB' : 'white'}
                    border="1px solid #E2E8F0"
                    borderRadius="12px"
                    padding="12px"
                    fontSize="0.95rem"
                    _focus={{
                      borderColor: '#805AD5',
                      boxShadow: '0 0 0 1px #805AD5',
                      bg: 'white',
                    }}
                    _disabled={{
                      opacity: 0.6,
                      cursor: 'not-allowed',
                    }}
                  />
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formik.touched.ifsc_code && formik.errors.ifsc_code}
                  </Text>
                </FormControl>
  
                <FormControl
                  isInvalid={formik.touched.city && !!formik.errors.city}
                >
                  <FormLabel
                    fontWeight="600"
                    fontSize="0.95rem"
                    color="#4A5568"
                    mb={2}
                  >
                    City
                  </FormLabel>
                  <Input
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter City"
                    isDisabled={!isEditable}
                    bg={!isEditable ? '#F9FAFB' : 'white'}
                    border="1px solid #E2E8F0"
                    borderRadius="12px"
                    padding="12px"
                    fontSize="0.95rem"
                    _focus={{
                      borderColor: '#805AD5',
                      boxShadow: '0 0 0 1px #805AD5',
                      bg: 'white',
                    }}
                    _disabled={{
                      opacity: 0.6,
                      cursor: 'not-allowed',
                    }}
                  />
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {formik.touched.city && formik.errors.city}
                  </Text>
                </FormControl>
              </SimpleGrid>
  
              {isEditable && roleId === 2 && (
                <Box textAlign="center" mt={6}>
                  <Stack
                    direction={{ base: 'column', sm: 'row' }}
                    spacing={4}
                    justify="center"
                    align="center"
                  >
                    <Button
                      onClick={handleSave}
                      colorScheme="purple"
                      size={{ base: 'md', md: 'lg' }}
                      borderRadius="20px"
                      fontWeight="600"
                      px={8}
                      py={6}
                      boxShadow="0 4px 12px rgba(128, 90, 213, 0.3)"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(128, 90, 213, 0.4)',
                      }}
                      transition="all 0.2s ease"
                      w={{ base: '100%', sm: 'auto' }}
                    >
                      Save
                    </Button>
  
                    <Button
                      type="button"
                      onClick={() => {
                        formik.resetForm();
                        setIsEditable(false);
                      }}
                      colorScheme="gray"
                      size={{ base: 'md', md: 'lg' }}
                      borderRadius="20px"
                      fontWeight="600"
                      px={8}
                      py={6}
                      _hover={{
                        transform: 'translateY(-2px)',
                        bg: 'gray.200',
                      }}
                      transition="all 0.2s ease"
                      w={{ base: '100%', sm: 'auto' }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Box>
              )}
            </Stack>
          </form>
        </>
        // </Box>
      )
    }
    </>
  );
};

export default EmployeeBankdetails;
