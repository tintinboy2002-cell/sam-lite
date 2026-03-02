import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Card, Flex, Text, Button } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import { decryptData } from 'utils/crypto';
import Cookies from 'js-cookie';
import { Pencil } from 'lucide-react';
import { BulletList } from 'react-content-loader';

const PersonalInfoCard = () => {
  const [formData, setFormData] = useState({
    username: '',
    blood_group: '',
    gender: '',
    dob: '',
    marital_status: '',
  });

  const [originalData, setOriginalData] = useState({}); // ✅ store original data
  const roleId = decryptData(Cookies.get('role_id'));
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [loading , setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Personal Info from backend API
  const getProfileDetails = async () => {

    // const startTime = Date.now();
    setLoading(true);

    try {
      const id = decryptData(Cookies.get('user_id'));
      if (!id) throw new Error('User ID not found');

      const response = await httpInjectorService.getProfiledetails(id);

      if (response?.data?.length > 0) {
        const user = response.data[0];
        const data = {
          username: user.username || '',
          blood_group: user.blood_group || '',
          gender: user.gender || '',
          dob: user.dob?.split('T')[0] || '',
          marital_status: user.marital_status || '',
        };
        setFormData(data);
        setOriginalData(data); // ✅ save original data for comparison
      } else {
        toast.error('No profile data found');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
   };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Compare and send only updated fields to the backend
  const saveData = async () => {
    try {
      // const id = decryptData(Cookies.get('user_id'));

      // Find only changed fields
      const updatedFields = Object.keys(formData).reduce((acc, key) => {
        if (formData[key] !== originalData[key]) {
          acc[key] = formData[key];
        }
        return acc;
      }, {});

      if (Object.keys(updatedFields).length === 0) {
        toast.info('No changes detected.');
        setIsEditingBasicInfo(false);
        return;
      }

      setIsSaving(true);

      await httpInjectorService.updateprofiledetails({
        user_id: decryptData(Cookies.get('user_id')),
        ...updatedFields,
      });
      toast.success('Profile updated successfully');
      setOriginalData(formData); // ✅ update reference data
      setIsEditingBasicInfo(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    getProfileDetails();
  }, []);


  return (
    <>
      {loading ? ( <BulletList/> ) : (
            <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
            <Card>
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
                    Personal Info
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
                              setFormData(originalData);
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
                <div className="row">
                  <div className="col-6 mb-3 ">
                    <strong>Name</strong>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="form-control bg-white"
                      disabled={!isEditingBasicInfo}
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <strong>Blood Group</strong>
                    <input
                      type="text"
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleChange}
                      className="form-control bg-white"
                      disabled={!isEditingBasicInfo}
                    />
                  </div>
                </div>
      
                <div className="row">
                  <div className="col-6 mb-3">
                    <strong>Gender</strong>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          disabled={!isEditingBasicInfo}
                          className="form-control"
                          style={{
                            border: 'none',
                            width: '100%',
                            backgroundColor: isEditingBasicInfo ? '' : '#fff',
                            padding: '2px',
                          }}
                        >
                          {' '}
                          <option value="">Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                  </div>
                  <div className="col-6 mb-3">
                    <strong>Date of Birth</strong>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="form-control bg-white"
                      disabled={!isEditingBasicInfo}
                    />
                  </div>
                </div>
      
                <div className="row">
                  <div className="col-6 mb-3">
                    <strong>Marital Status</strong>
                      <select
                          name="marital_status"
                          value={formData.marital_status}
                          onChange={handleChange}
                          disabled={!isEditingBasicInfo}
                          className="form-control"
                          style={{
                            border: 'none',
                            width: '100%',
                            backgroundColor: isEditingBasicInfo ? '' : '#fff',
                            padding: '2px',
                          }}
                        >
                          {' '}
                          <option value="">Marital Status</option>
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="divorced">Divorced</option>
                          <option value="widowed">Widowed</option>
                        </select>
                  </div>
                </div>
              </Box>
            </Card>
          </SimpleGrid>
      )}
    </>
  );
};

export default PersonalInfoCard;
