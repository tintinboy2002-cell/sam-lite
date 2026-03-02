import React from 'react';
import { Box, SimpleGrid, Card, Flex, Text, Button } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';

import httpInjectorService from 'services/http-injector.service';
import { decryptData } from 'utils/crypto';
import { Pencil } from 'lucide-react';
// import Loader from 'components/common/Spinner';

import { BulletList } from 'react-content-loader';

import Cookies from 'js-cookie';

const ContactInfoCard = () => {
  const [formData, setFormData] = useState({
    official_email_id: '',
    personal_email_id: '',
    phone_number: '',
    alternate_phone_number: '',
    current_address: '',
    permanent_address: '',
  });

  const roleId = decryptData(Cookies.get('role_id'));
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [originalData, setOriginalData] = useState({}); // ✅ store original data
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Handle input changes (if editing)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save handler
  const saveData = async () => {
    try {
      // Find only changed fields
      const updatedFields = Object.keys(formData).reduce((acc, key) => {
        if (formData[key] !== originalData[key]) {
          acc[key] = formData[key];
        }
        return acc;
      }, {});

      if (Object.keys(updatedFields).length === 0) {
        toast.info('No changes detected.');
        setOriginalData(formData); // Update original data
        setIsEditingBasicInfo(false);
        return;
      }

      setIsSaving(true);

      await httpInjectorService.updateprofiledetails({
        user_id : decryptData(Cookies.get('user_id')),
        ...updatedFields,
      });
      toast.success('Profile updated successfully');
      // update baseline to latest saved data
      setOriginalData(formData);
      setIsEditingBasicInfo(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch Personal Info from backend API
  useEffect(() => {
    const fetchData = async () => {
      // const startTime = Date.now();
      setLoading(true);
  
      try {
        const id = decryptData(Cookies.get('user_id'));
        const response = await httpInjectorService.getProfiledetails(id);
  
        if (response?.data?.length > 0) {
          const user = response.data[0];
  
          const data = {
            official_email_id: user.official_email_id || '',
            personal_email_id: user.personal_email_id || '',
            phone_number: user.phone_number || '',
            alternate_phone_number: user.alternate_phone_number || '',
            current_address: user.current_address || '',
            permanent_address: user.permanent_address || '',
          };
  
          setFormData(data);
          setOriginalData(data);
        } else {
          toast.error('No profile data found');
        }
      } catch (error) {
        toast.error(`Error: ${error.message}`);
      }
  
      // Ensure MINIMUM of 2 seconds from start
      // const elapsed = Date.now() - startTime;
      // const remaining = 2000 - elapsed;
  
      // setTimeout(() => {
      //   setLoading(false);
      // }, remaining > 0 ? remaining : 0);
  
      setLoading(false); // simple fallback since delay is removed
    };
  
    fetchData();
  }, []);
  

  return (
    <>
      {
        loading ? ( <BulletList/> ) : (
          <>
          <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
            {/* Basic Info Card */}
            <Card className="" mt={4}>
              <Box
                border="1px solid"
                borderColor="gray.200"
                bg="white"
                boxShadow="xs"
                borderRadius="lg"
                p={4}
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize="lg" fontWeight="bold">
                    Contact Info
                  </Text>

                    <Flex gap={2}>
                      {isEditingBasicInfo ? (
                        <>
                        <Button size="sm" colorScheme="purple" onClick={saveData} borderRadius="md" isLoading={isSaving}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="gray"
                          variant="outline"
                          borderRadius="md"
                          onClick={() => {
                            // reset to baseline values
                            setFormData({ ...originalData });
                            setIsEditingBasicInfo(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => setIsEditingBasicInfo(true)}
                      >
                        <Pencil/>
                      </Button>
                    )}
                    </Flex>
                </Flex>

                {/* Fields */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box mb={3}>
                    <strong>Official Email ID</strong>
                    <input
                      type="text"
                      name="official_email_id"
                      value={formData.official_email_id}
                      onChange={handleChange}
                      className="form-control"
                      disabled={!isEditingBasicInfo}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingBasicInfo ? '' : '#fff',
                        padding: '2px',
                      }}
                    />
                  </Box>
                  <Box mb={3}>
                    <strong>Personal Email ID</strong>
                    <input
                      type="text"
                      name="personal_email_id"
                      value={formData.personal_email_id}
                      onChange={handleChange}
                      className="form-control"
                      disabled={!isEditingBasicInfo}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingBasicInfo ? '' : '#fff',
                        padding: '2px',
                      }}
                    />
                  </Box>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box mb={3}>
                    <strong>Phone Number</strong>
                    <input
                      type="number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="form-control"
                      disabled={!isEditingBasicInfo}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingBasicInfo ? '' : '#fff',
                        padding: '2px',
                      }}
                    />
                  </Box>
                  <Box mb={3}>
                    <strong>Alternate Phone Number</strong>
                    <input
                      type="number"
                      name="alternate_phone_number"
                      value={formData.alternate_phone_number}
                      onChange={handleChange}
                      className="form-control"
                      disabled={!isEditingBasicInfo}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingBasicInfo ? '' : '#fff',
                        padding: '2px',
                      }}
                    />
                  </Box>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box mb={3}>
                    <strong>Current Address</strong>
                    <input
                      type="text"
                      name="current_address"
                      value={formData.current_address}
                      onChange={handleChange}
                      className="form-control"
                      disabled={!isEditingBasicInfo}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingBasicInfo ? '' : '#fff',
                        padding: '2px',
                      }}
                    />
                  </Box>
                  <Box mb={3}>
                    <strong>Permanent Address</strong>
                    <input
                      type="text"
                      name="permanent_address"
                      value={formData.permanent_address}
                      onChange={handleChange}
                      className="form-control"
                      disabled={!isEditingBasicInfo}
                      style={{
                        border: 'none',
                        width: '100%',
                        backgroundColor: isEditingBasicInfo ? '' : '#fff',
                        padding: '2px',
                      }}
                    />
                  </Box>
                </SimpleGrid>
              </Box>
            </Card>
          </SimpleGrid>
          </>
        )
      }
    </>
  );
};  

export default ContactInfoCard;
