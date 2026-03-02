import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Textarea,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import { useSelector } from 'react-redux';
 
const OffBoarding = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const profiledata = useSelector((state) => state.Authentication?.profiledata);
  const formik = useFormik({
    initialValues: {
      mobileNumber: '',
      email: '',
      emergencyContactNumber: '',
      address: '',
      reason: '',
      declaration: false,
    },
    validationSchema: Yup.object({
      mobileNumber: Yup.string()
        .matches(/^[0-9]+$/, 'Must be numeric')
        .length(10, 'Must be 10 digits')
        .required('Required'),
      email: Yup.string().email('Invalid email address').required('Required'),
      emergencyContactNumber: Yup.string()
        .matches(/^[0-9]+$/, 'Must be numeric')
        .length(10, 'Must be 10 digits')
        .required('Required'),
      address: Yup.string().trim().required('Required'),
      reason: Yup.string().trim().required('Required'),
      declaration: Yup.boolean().oneOf(
        [true],
        'You must accept the declaration',
      ),
    }),
    onSubmit: async (values) => {
      console.log('values:', values);
      try {
        const response = await httpInjectorService.resignation(values);
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
       toast.error(error, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    },
  });
 
  useEffect(() => {
    console.log('profiledata:', profiledata);
  }, []);
 
  const handleConfirmation = () => {
    formik.handleSubmit();
    onClose();
  };
 
  return (
    <Box
      maxW="xxl"
      mx="auto"
      mt="50px"
      p="8"
      borderWidth="1px"
      borderRadius="lg"
      style={{ maxWidth: '90%', backgroundColor: '#FFFFFF' }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onOpen();
        }}
      >
        <Stack spacing="6">
          <Text fontSize="2xl" mb="4">
            Resignation
          </Text>
 
          <SimpleGrid columns={2} spacing={6}>
            <FormControl
              isInvalid={formik.touched.firstName && !!formik.errors.firstName}
            >
              <FormLabel>Name</FormLabel>
              <Input
                name="Name"
                type="text"
                value={profiledata[0]?.Name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder=""
                disabled
              />
              <Text color="red.500" fontSize="sm">
                {formik.touched.firstName && formik.errors.firstName}
              </Text>
            </FormControl>
 
            <FormControl
              isInvalid={formik.touched.lastName && !!formik.errors.lastName}
            >
              <FormLabel>Employee id</FormLabel>
              <Input
                name="employee id"
                type="text"
                value={profiledata[0]?.Employee_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder=""
                disabled
              />
              <Text color="red.500" fontSize="sm">
                {formik.touched.lastName && formik.errors.lastName}
              </Text>
            </FormControl>
 
            <FormControl
              isInvalid={
                formik.touched.mobileNumber && !!formik.errors.mobileNumber
              }
            >
              <FormLabel>Mobile Number</FormLabel>
              <Input
                name="mobileNumber"
                type="text" // Keep as text to allow input restrictions
                value={formik.values.mobileNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your mobile number"
              />
              <Text color="red.500" fontSize="sm">
                {formik.touched.mobileNumber && formik.errors.mobileNumber}
              </Text>
            </FormControl>
 
            <FormControl
              isInvalid={formik.touched.email && !!formik.errors.email}
            >
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your email"
              />
              <Text color="red.500" fontSize="sm">
                {formik.touched.email && formik.errors.email}
              </Text>
            </FormControl>
 
            <FormControl
              isInvalid={
                formik.touched.emergencyContactNumber &&
                !!formik.errors.emergencyContactNumber
              }
            >
              <FormLabel>Emergency Contact Number</FormLabel>
              <Input
                name="emergencyContactNumber"
                type="text" // Keep as text to allow input restrictions
                value={formik.values.emergencyContactNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter emergency contact number"
              />
              <Text color="red.500" fontSize="sm">
                {formik.touched.emergencyContactNumber &&
                  formik.errors.emergencyContactNumber}
              </Text>
            </FormControl>
 
            <FormControl
              isInvalid={formik.touched.address && !!formik.errors.address}
            >
              <FormLabel>Address</FormLabel>
              <Textarea
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your address"
              />
              <Text color="red.500" fontSize="sm">
                {formik.touched.address && formik.errors.address}
              </Text>
            </FormControl>
          </SimpleGrid>
 
          <FormControl
            isInvalid={formik.touched.reason && !!formik.errors.reason}
          >
            <FormLabel>Reason for Resignation</FormLabel>
            <Textarea
              name="reason"
              value={formik.values.reason}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your reason for resignation"
            />
            <Text color="red.500" fontSize="sm">
              {formik.touched.reason && formik.errors.reason}
            </Text>
          </FormControl>
 
          <FormControl
            isInvalid={
              formik.touched.declaration && !!formik.errors.declaration
            }
          >
            <Checkbox
              name="declaration"
              isChecked={formik.values.declaration}
              onChange={formik.handleChange}
              display="inline-block"
              marginRight="1rem" // Space between checkbox and text
            >
              <Text as="span">
                I hereby declare that the information provided above is true and
                accurate to the best of my knowledge and belief. I understand
                that any false information or misrepresentation may result in
                disciplinary action or termination of employment.
              </Text>
            </Checkbox>
            <Text color="red.500" fontSize="sm" marginTop="0.5rem">
              {formik.touched.declaration && formik.errors.declaration}
            </Text>
          </FormControl>
 
          <Box textAlign="center">
            <Stack direction="row" spacing="6" justify="center">
              <Button type="submit" colorScheme="purple">
                Apply
              </Button>
              <Button
                type="button"
                colorScheme="red"
                onClick={() => formik.resetForm()}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        </Stack>
      </form>
 
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Submission</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to apply for resignation?</ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={handleConfirmation}>
              Yes
            </Button>
            <Button colorScheme="red" onClick={onClose}>
              No
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
 
export default OffBoarding;