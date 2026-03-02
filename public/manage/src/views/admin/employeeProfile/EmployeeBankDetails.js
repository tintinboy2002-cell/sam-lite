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
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import Cookies from 'js-cookie';
import { decryptData } from 'utils/crypto';

const EmployeeBankdetails = ({ activeTab }) => {
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(true);
  const roleId = decryptData(Cookies.get('role_id'));
  const userId = decryptData(Cookies.get('user_id'));

  const formik = useFormik({
    initialValues: {
      account_holder_name: '',
      bank_name: '',
      account_number: '',
      branch_name: '',
      ifsc_code: '',
      city: '',
      user_id: userId,
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
        toast.error('An error occurred while submitting the form.', {
          position: 'top-right',
          autoClose: 3000,
        });
      } finally {
        setIsEditable(false);
      }
    },
  });

  const fetchBankDetails = async () => {
    try {
      const response = await httpInjectorService.getBankDetails(userId);
      if (response.status === 'success') {
        const data = response.data[0];
        formik.setValues({
          ...formik.values,
          account_holder_name: data.account_holder_name || '',
          bank_name: data.bank_name || '',
          account_number: data.account_number || '',
          branch_name: data.branch_name || '',
          ifsc_code: data.ifsc_code || '',
          city: data.city || '',
        });
      } else {
        // toast.error(response.message, {
        //   position: 'top-right',
        //   autoClose: 3000,
        // });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === '6') {
      fetchBankDetails();
    }
  }, [activeTab]);

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleSave = () => {
    if (formik.dirty) {
      formik.handleSubmit();
      setIsEditable(false);
      formik.resetForm({ values: formik.values });
    } else {
      // toast.info('No changes detected to save.', {
      //   position: 'top-right',
      //   autoClose: 3000,
      // });
    }
  };
  return (
    <Box
      maxW="xxl"
      mx="auto"
      mt="50px"
      p="8"
      borderWidth="1px"
      borderRadius="lg"
      style={{
        maxWidth: '90%',
        backgroundColor: '#FFFFFF',
        position: 'relative',
      }}
    >
      {!isEditable && (
        <Button
          onClick={handleEdit}
          colorScheme="purple"
          position="absolute"
          top="10px"
          right="10px"
          display={!isEditable ? 'block' : 'none'} // Show only when not editable
        >
          Edit
        </Button>
      )}{' '}
      {/* Edit Button at the top right */}
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing="6">
          <Text fontSize="2xl" mb="4">
            SALARY ACCOUNT DETAILS
          </Text>

          <SimpleGrid columns={1} spacing={6}>
            <FormControl
              isInvalid={
                formik.touched.account_holder_name &&
                !!formik.errors.account_holder_name
              }
            >
              <FormLabel>Account Holder's Name</FormLabel>
              <Input
                name="account_holder_name"
                type="text"
                value={formik.values.account_holder_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Account Holder's Name"
                isDisabled={!isEditable}
              />
              <Text color="red.500" fontSize="sm">
                {formik.touched.account_holder_name &&
                  formik.errors.account_holder_name}
              </Text>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={3} spacing={6}>
            <FormControl
              isInvalid={formik.touched.bank_name && !!formik.errors.bank_name}
            >
              <FormLabel>Bank Name</FormLabel>
              <Input
                name="bank_name"
                value={formik.values.bank_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Bank Name"
                isDisabled={!isEditable}
              />
              <Text color="red.500" fontSize="sm">
                {formik.touched.bank_name && formik.errors.bank_name}
              </Text>
            </FormControl>

            <FormControl
              isInvalid={
                formik.touched.account_number && !!formik.errors.account_number
              }
            >
              <FormLabel>Account Number</FormLabel>
              <Input
                name="account_number"
                type="text"
                value={formik.values.account_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Account Number"
                isDisabled={!isEditable}
              />
              <Text color="red.500" fontSize="sm">
                {formik.touched.account_number && formik.errors.account_number}
              </Text>
            </FormControl>

            <FormControl
              isInvalid={
                formik.touched.branch_name && !!formik.errors.branch_name
              }
            >
              <FormLabel>Branch Name</FormLabel>
              <Input
                name="branch_name"
                value={formik.values.branch_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Branch Name"
                isDisabled={!isEditable}
              />
              <Text color="red.500" fontSize="sm">
                {formik.touched.branch_name && formik.errors.branch_name}
              </Text>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={2} spacing={6}>
            <FormControl
              isInvalid={formik.touched.ifsc_code && !!formik.errors.ifsc_code}
            >
              <FormLabel>IFSC Code</FormLabel>
              <Input
                name="ifsc_code"
                type="text"
                value={formik.values.ifsc_code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter IFSC Code"
                isDisabled={!isEditable}
              />
              <Text color="red.500" fontSize="sm">
                {formik.touched.ifsc_code && formik.errors.ifsc_code}
              </Text>
            </FormControl>

            <FormControl
              isInvalid={formik.touched.city && !!formik.errors.city}
            >
              <FormLabel>City</FormLabel>
              <Input
                name="city"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter City"
                isDisabled={!isEditable}
              />
              <Text color="red.500" fontSize="sm">
                {formik.touched.city && formik.errors.city}
              </Text>
            </FormControl>
          </SimpleGrid>

          <Box textAlign="center">
            <Stack direction="row" spacing="6" justify="center">
              <>
                {isEditable && (
                  <>
                    <Button onClick={handleSave} colorScheme="purple">
                      Save
                    </Button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        formik.resetForm();
                        setIsEditable(false);
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </>
            </Stack>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};

export default EmployeeBankdetails;
