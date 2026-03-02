import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Avatar,
  Flex,
  Text,
  useColorModeValue,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Image,
  Heading,
  Stack,
} from '@chakra-ui/react';
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Input,
  Card,
  CardBody,
} from 'reactstrap';
import classnames from 'classnames';
import userimage from '../../../../assets/img/auth/Default_profileoic.jpg';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AssignedWork from './AssignedWork';
import EmployeeDoc from './EmployeeDoc';
// import Spinner from 'components/common/Spinner';
import EmployeeBankdetails from './EmployeeBankDetails';
import { BulletList } from 'react-content-loader';

const Personal = ({
  isEditingPersonal,
  eligible,
  setIsEditingPersonal,
  formData,
  handleChange,
  handleDateChange,
  formErrors,
  image,
  inputRef,
  handleImageChange,
  handleImageclick,
  saveData,
  disable,
  isEditingContact,
  setIsEditingContact,
  validateEmail,
  inputErrors,
  validatePhoneNumber,
  disableContact,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  });

  return (
    <React.Fragment>
      {loading ? (
        <BulletList />
      ) : (
        <>
          <Box
            border="1px solid"
            borderColor="gray.200"
            bg="white"
            boxShadow="sm"
            borderRadius="lg"
            p={4}
            mb={4}
            // mt={5}
          >
            <Flex
              justify="space-between"
              align="center"
              mb={4}
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 3, md: 0 }}
            >
              <Heading size="md">Personal Info</Heading>
              {!isEditingPersonal && eligible && (
                <Button
                  colorScheme="purple"
                  size="sm"
                  onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                >
                  Edit
                </Button>
              )}
            </Flex>

            <SimpleGrid
              columns={{ base: 1, md: 3 }}
              spacing={6}
              templateColumns={{ base: '1fr', md: '2fr 1fr' }}
            >
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontWeight="bold" mb={1}>
                    Name
                  </FormLabel>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditingPersonal}
                    placeholder="Enter your name"
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingPersonal ? '#f7fafc' : '#fff',
                      padding: '8px',
                      borderRadius: '4px',
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="bold" mb={1}>
                    Blood Group
                  </FormLabel>
                  <input
                    type="text"
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    disabled={!isEditingPersonal}
                    placeholder="Enter your blood group"
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingPersonal ? '#f7fafc' : '#fff',
                      padding: '8px',
                      borderRadius: '4px',
                    }}
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontWeight="bold" mb={1}>
                      Gender
                    </FormLabel>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={!isEditingPersonal}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingPersonal ? '#f7fafc' : '#fff',
                        padding: '8px',
                        borderRadius: '4px',
                      }}
                    >
                      <option value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="bold" mb={1}>
                      Date of Birth
                    </FormLabel>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={(e) => {
                        handleChange(e);
                        handleDateChange(e);
                      }}
                      disabled={!isEditingPersonal}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingPersonal ? '#f7fafc' : '#fff',
                        padding: '8px',
                        borderRadius: '4px',
                      }}
                    />
                    {formErrors.dob && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {formErrors.dob}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="bold" mb={1}>
                      Marital Status
                    </FormLabel>
                    <select
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleChange}
                      disabled={!isEditingPersonal}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingPersonal ? '#f7fafc' : '#fff',
                        padding: '8px',
                        borderRadius: '4px',
                      }}
                    >
                      <option value="">Marital Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </FormControl>
                </SimpleGrid>

                {isEditingPersonal && (
                  <HStack spacing={3} justify="center" mt={4}>
                    <Button
                      colorScheme="purple"
                      onClick={() => {
                        saveData();
                        setIsEditingPersonal(!isEditingPersonal);
                      }}
                      disabled={disable}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      onClick={() => setIsEditingPersonal(false)}
                    >
                      Cancel
                    </Button>
                  </HStack>
                )}
              </VStack>

              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                order={{ base: -1, md: 0 }}
              >
                <Box position="relative" mb={2}>
                  {image ? (
                    <Image
                      src={image}
                      alt="Selected"
                      boxSize={{ base: '150px', md: '180px' }}
                      borderRadius="full"
                      objectFit="cover"
                    />
                  ) : (
                    <Image
                      src={userimage}
                      alt="Default"
                      boxSize={{ base: '150px', md: '180px' }}
                      borderRadius="full"
                      objectFit="cover"
                    />
                  )}
                  <input
                    type="file"
                    ref={inputRef}
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                </Box>
                {isEditingPersonal && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleImageclick}
                    colorScheme="blue"
                  >
                    <i className="bx bx-edit-alt" style={{ marginRight: '4px' }} />
                    Edit Photo
                  </Button>
                )}
              </Box>
            </SimpleGrid>
          </Box>

          <Box
            border="1px solid"
            borderColor="gray.200"
            bg="white"
            boxShadow="sm"
            borderRadius="lg"
            p={4}
            mb={4}
            mt={5}
          >
            <Flex
              justify="space-between"
              align="center"
              mb={4}
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 3, md: 0 }}
            >
              <Heading size="md">Contact Info</Heading>
              {!isEditingContact && eligible && (
                <Button
                  colorScheme="purple"
                  size="sm"
                  onClick={() => setIsEditingContact(!isEditingContact)}
                >
                  Edit
                </Button>
              )}
            </Flex>

            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontWeight="bold" mb={1}>
                    Official Email ID
                  </FormLabel>
                  <input
                    type="email"
                    name="official_email_id"
                    value={formData.official_email_id}
                    onChange={(e) => {
                      validateEmail(e);
                      handleChange(e);
                    }}
                    disabled={!isEditingContact}
                    placeholder="Enter your official email"
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingContact ? '#f7fafc' : '#fff',
                      padding: '8px',
                      borderRadius: '4px',
                    }}
                  />
                  {inputErrors.official_email_id && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {inputErrors.official_email_id}
                    </Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="bold" mb={1}>
                    Personal Email ID
                  </FormLabel>
                  <input
                    type="email"
                    name="personal_email_id"
                    value={formData.personal_email_id}
                    onChange={(e) => {
                      validateEmail(e);
                      handleChange(e);
                    }}
                    disabled={!isEditingContact}
                    placeholder="Enter your personal email"
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingContact ? '#f7fafc' : '#fff',
                      padding: '8px',
                      borderRadius: '4px',
                    }}
                  />
                  {inputErrors.personal_email_id && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {inputErrors.personal_email_id}
                    </Text>
                  )}
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontWeight="bold" mb={1}>
                    Phone Number
                  </FormLabel>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => {
                      validatePhoneNumber(e);
                      handleChange(e);
                    }}
                    disabled={!isEditingContact}
                    placeholder="Enter your phone number"
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingContact ? '#f7fafc' : '#fff',
                      padding: '8px',
                      borderRadius: '4px',
                    }}
                  />
                  {inputErrors.phone_number && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {inputErrors.phone_number}
                    </Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="bold" mb={1}>
                    Alternate Phone Number
                  </FormLabel>
                  <input
                    type="tel"
                    name="alternate_phone_number"
                    value={formData.alternate_phone_number}
                    onChange={(e) => {
                      validatePhoneNumber(e);
                      handleChange(e);
                    }}
                    disabled={!isEditingContact}
                    placeholder="Enter your alternate phone number"
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingContact ? '#f7fafc' : '#fff',
                      padding: '8px',
                      borderRadius: '4px',
                    }}
                  />
                  {inputErrors.alternate_phone_number && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {inputErrors.alternate_phone_number}
                    </Text>
                  )}
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontWeight="bold" mb={1}>
                    Current Address
                  </FormLabel>
                  <textarea
                    name="current_address"
                    value={formData.current_address}
                    onChange={handleChange}
                    disabled={!isEditingContact}
                    placeholder="Enter your current address"
                    rows={3}
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingContact ? '#f7fafc' : '#fff',
                      padding: '8px',
                      borderRadius: '4px',
                      resize: 'vertical',
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="bold" mb={1}>
                    Permanent Address
                  </FormLabel>
                  <textarea
                    name="permanent_address"
                    value={formData.permanent_address}
                    onChange={handleChange}
                    disabled={!isEditingContact}
                    placeholder="Enter your permanent address"
                    rows={3}
                    style={{
                      border: 'none',
                      width: '100%',
                      backgroundColor: isEditingContact ? '#f7fafc' : '#fff',
                      padding: '8px',
                      borderRadius: '4px',
                      resize: 'vertical',
                    }}
                  />
                </FormControl>
              </SimpleGrid>

              {isEditingContact && (
                <HStack spacing={3} justify="center" mt={4}>
                  <Button
                    colorScheme="purple"
                    onClick={() => {
                      saveData();
                      setIsEditingContact(!isEditingContact);
                    }}
                    disabled={disableContact}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    onClick={() => setIsEditingContact(!isEditingContact)}
                  >
                    Cancel
                  </Button>
                </HStack>
              )}
            </VStack>
          </Box>
        </>
      )}
    </React.Fragment>
  );
};

export default Personal;