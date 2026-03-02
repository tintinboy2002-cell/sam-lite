import React, { useEffect, useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Checkbox,
  Flex,
  SimpleGrid,
  Textarea,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import { Card, CardBody } from 'reactstrap';
import Spinner from 'components/common/Spinner';
import ExperienceLetter from './ExperienceLetter';
import { Empty } from 'antd';
 
const OffBoarding = () => {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setModalOpen] = useState(false);
  const [lastWorkingDay, setLastWorkingDay] = useState('');
  const [generateLetter, setGenerateLetter] = useState(false);
  const [preview, setPreview] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSecondModalOpen, setSecondModalOpen] = useState(false);
  const [reasonForRejection, setReasonForRejection] = useState('');
 
  const getUsers = async () => {
    setIsLoading(true);
    try {
      const response = await httpInjectorService.getResignedUsers();
      if (response.status === 'success') {
        // Map over the data and format resignation_timestamp and updated_at
        const formattedData = response.data.map(user => ({
          ...user,
          resignation_timestamp: new Date(user.resignation_timestamp)
            .toLocaleString([], {
              dateStyle: 'short', // Formats date as per local settings
              timeStyle: 'short', // Shows hour and minute
            }),
          updated_at: new Date(user.updated_at) // Add the same logic for updated_at
            .toLocaleString([], {
              dateStyle: 'short', 
              timeStyle: 'short',
            }),
        }));
        setUsers(formattedData);
      } else {
        // toast.error(response.message, {
        //   position: 'top-right',
        //   autoClose: 3000,
        // });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
 
  useEffect(() => {
    getUsers();
  }, []);
 
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
 
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(e.target.value);
  };
 
  const filteredUsers = users.filter((user) => {
    const username = user.Name ? user.Name.toLowerCase() : '';
    const employeeId = user.Employee_id ? user.Employee_id.toString() : '';
    return (
      username.includes(searchQuery.toLowerCase()) ||
      employeeId.includes(searchQuery.toLowerCase())
    );
  });
 
  const openModal = (user) => {
    setCurrentUser(user);
    setModalOpen(true);
  };
 
  const handleModalClose = () => {
    setModalOpen(false);
    setLastWorkingDay('');
    setGenerateLetter(false);
    setPreview(false);
  };
 
  const handleSecondModalClose = () => {
    setSecondModalOpen(false);
  };
 
  const handleSecondModalOpen = (user) => {
    setCurrentUser(user);
    setSecondModalOpen(true);
  };
 
  const handlePreview = () => {
    setPreview(true);
  };
 
  const handleSubmit = async (data) => {
    try {
      const response = await httpInjectorService.offboardUsers(data);
 
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
    } catch (err) {
      console.log(err);
    }
  };

 

 
  return (
    <React.Fragment>
      <Card style={{ marginTop: '80px' }}>
        <CardBody>
          <Flex mb={4} align="center">
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              style={{
                width: '10%',
                height: '35px',
                borderRadius: '10px',
                border: '1px solid #ccc',
              }}
            >
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
              <option value={50}>50 rows</option>
            </select>
            <Input
              placeholder="Search by name or employee ID"
              value={searchQuery}
              onChange={handleSearchChange}
              style={{ width: '25%', marginLeft: '10px' }}
            />
          </Flex>
          {isLoading ? (
            <Spinner />
          ) : (
            <Table
              variant="simple"
              borderColor="#c0c0c0"
              borderWidth="1px"
              borderStyle="solid"
            >
              <Thead backgroundColor="#B58EE4">
                <Tr>
                  <Th
                    borderColor="#c0c0c0"
                    borderWidth="1px"
                    fontWeight="bold"
                    color="black"
                  >
                    <strong>Name</strong>
                  </Th>
                  <Th
                    borderColor="#c0c0c0"
                    borderWidth="1px"
                    fontWeight="bold"
                    color="black"
                  >
                    <strong>Employee ID</strong>
                  </Th>
                  <Th
                    borderColor="#c0c0c0"
                    borderWidth="1px"
                    fontWeight="bold"
                    color="black"
                  >
                    <strong>Department</strong>
                  </Th>
                  <Th
                    borderColor="#c0c0c0"
                    borderWidth="1px"
                    fontWeight="bold"
                    color="black"
                  >
                    <strong>Designation</strong>
                  </Th>
                  <Th
                   borderColor="#c0c0c0"
                   borderWidth="1px"
                   fontWeight="bold"
                   color="black"
                  >
                     <strong>Timestamp</strong> 
                  </Th>
                  {/* <Th 
                   borderColor="#c0c0c0"
                   borderWidth="1px"
                   fontWeight="bold"
                   color="black">
                      <strong>Status</strong>
                   </Th>
                   <Th borderColor="#c0c0c0"
                   borderWidth="1px"
                   fontWeight="bold"
                   color="black">
                      <strong>Updated at</strong>
                   </Th>
                   <Th borderColor="#c0c0c0"
                   borderWidth="1px"
                   fontWeight="bold"
                   color="black">
                      <strong>Updated by</strong>
                   </Th> */}
                  <Th
                    borderColor="#c0c0c0"
                    borderWidth="1px"
                    fontWeight="bold"
                    color="black"
                  >
                    <strong>Actions</strong>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.slice(0, rowsPerPage).map((user) => (
                    <Tr
                      key={user.Employee_id}
                      borderColor="#c0c0c0"
                      borderWidth="1px"
                    >
                      <Td borderColor="#c0c0c0" borderWidth="1px">
                        {user.Name}
                      </Td>
                      <Td borderColor="#c0c0c0" borderWidth="1px">
                        {user.Employee_id}
                      </Td>
                      <Td borderColor="#c0c0c0" borderWidth="1px">
                        {user.department_name}
                      </Td>
                      <Td borderColor="#c0c0c0" borderWidth="1px">
                        {user.designations}
                      </Td>
                      <Td borderColor="#c0c0c0" borderWidth="1px">
                        {user.resignation_timestamp}
                      </Td>
                      {/* <Td borderColor="#c0c0c0" borderWidth="1px">
                        {user.status}
                      </Td>
                      <Td borderColor="#c0c0c0" borderWidth="1px">
                        {user.updated_at}
                      </Td>
                      <Td borderColor="#c0c0c0" borderWidth="1px">
                        {user.updated_by}
                      </Td> */}
                      <Td
                        borderColor="#c0c0c0"
                        borderWidth="1px"
                        style={{ width: '22%' }}
                      >
                        <Button
                          colorScheme="purple"
                          onClick={() => {
                            openModal(user);
                            setStatus('approved');
                          }}
                        >
                          Offboard
                        </Button>
                        <Button
                          colorScheme="red"
                          ml={2}
                          onClick={() => {
                            handleSecondModalOpen(user);
                            setStatus('rejected');
                          }}
                        >
                          Reject
                        </Button>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan="5" style={{ textAlign: 'center' }}>
                      <Empty
                        description="No users found"
                        style={{ fontSize: '24px' }}
                      />
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
 
      {/* Offboarding Modal */}
      <Modal isOpen={isModalOpen} onClose={handleModalClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Employee Offboarding</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={2} spacing={4} mb={4}>
              <Input
                placeholder="Additional Field 1"
                value={currentUser?.Name || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
              <Input
                placeholder="Additional Field 2"
                value={currentUser?.Employee_id || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
            </SimpleGrid>
            <SimpleGrid columns={2} spacing={4} mb={4}>
              <Input
                placeholder="Additional Field 3"
                value={currentUser?.department_name || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
              <Input
                placeholder="Additional Field 4"
                value={currentUser?.designations || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
            </SimpleGrid>
            <SimpleGrid columns={2} spacing={4} mb={4}>
              <Input
                placeholder="Personal Email ID"
                value={currentUser?.personalemail_id || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
              <Input
                placeholder="Phone No"
                value={currentUser?.mobile_number || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
            </SimpleGrid>
            <SimpleGrid columns={2} spacing={4} mb={4}>
              <Input
                placeholder="Emergency Contact"
                value={currentUser?.emergency_contact_number || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
              <Input
                placeholder="Address"
                value={currentUser?.address || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
            </SimpleGrid>
            <label htmlFor="lastWorkingDay">Last Working Day:</label>
            <Input
              type="date"
              id="lastWorkingDay"
              value={lastWorkingDay}
              onChange={(e) => {
                setLastWorkingDay(e.target.value);
              }}
              placeholder="Last Working Day"
              mb={3}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Checkbox
                isChecked={generateLetter}
                onChange={(e) => setGenerateLetter(e.target.checked)}
                mb={4}
              >
                Generate Relieving Letter
              </Checkbox>
              {generateLetter && (
                <Button onClick={handlePreview} colorScheme="teal" mt={2}>
                  Preview
                </Button>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="purple"
              onClick={() => {
                handleModalClose();
                handleSubmit({ ...currentUser, status, lastWorkingDay });
              }}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
 
      <Modal
        isOpen={isSecondModalOpen}
        onClose={handleSecondModalClose}
        size="3xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Resignation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={2} spacing={4} mb={4}>
              <Input
                placeholder="Additional Field 1"
                value={currentUser?.Name || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
              <Input
                placeholder="Additional Field 2"
                value={currentUser?.Employee_id || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
            </SimpleGrid>
            <SimpleGrid columns={2} spacing={4} mb={4}>
              <Input
                placeholder="Additional Field 3"
                value={currentUser?.department_name || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
              <Input
                placeholder="Additional Field 4"
                value={currentUser?.designations || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
            </SimpleGrid>
            <SimpleGrid columns={2} spacing={4} mb={4}>
              <Input
                placeholder="Personal Email ID"
                value={currentUser?.personalemail_id || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
              <Input
                placeholder="Phone No"
                value={currentUser?.mobile_number || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
            </SimpleGrid>
            <SimpleGrid columns={2} spacing={4} mb={4}>
              <Input
                placeholder="Emergency Contact"
                value={currentUser?.emergency_contact_number || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
              <Input
                placeholder="Address"
                value={currentUser?.address || ''}
                isDisabled
                style={{ fontWeight: 'bold', color: '#000' }}
              />
            </SimpleGrid>
            <label htmlFor="Reason for rejection">Reason for rejection</label>
            <Textarea
              type="date"
              id="Reason for rejection"
              value={reasonForRejection}
              onChange={(e) => {
                setReasonForRejection(e.target.value);
              }}
              placeholder="Reason for rejection"
              mb={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="purple"
              onClick={() => {
                handleSecondModalClose();
                handleSubmit({ ...currentUser, status, reasonForRejection });
              }}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
 
      {/* Experience Letter Preview Modal */}
      <Modal isOpen={preview} onClose={() => setPreview(false)} size="lg">
        <ModalOverlay />
        <ModalContent
          style={{
            width: '80%', // Adjust the width as needed
            maxWidth: '800px', // Set a maximum width
            top: '1%', // Position it closer to the top
            margin: '0 auto', // Center it horizontally
          }}
        >
          <ModalHeader>Experience Letter Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {currentUser && (
              <ExperienceLetter
                name={currentUser.Name}
                employeeId={currentUser.Employee_id}
                department={currentUser.department_name}
                designation={currentUser.designations}
                lastWorkingDay={lastWorkingDay}
                dateOfJoining={currentUser.DateofJoining}
                Address={currentUser.Address}
                companyName={currentUser.org_name}
                logo={currentUser.logo_url}
              />
            )}
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};
 
export default OffBoarding;