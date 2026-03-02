import React, { useState, useEffect } from 'react';
import { Table } from 'reactstrap';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Tooltip,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Flex,
  Text,
  Card,
  useDisclosure,
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BulletList } from 'react-content-loader';
import { Empty } from 'antd';

const Designation = ({ activeTab }) => {
  const [designations, setDesignations] = useState([]); // State to store fetched designation data.
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility.
  const [newDesignations, setNewDesignations] = useState([
    { id: Date.now(), name: '', error: '' },
  ]); // State to handle multiple designations with error message for validation.
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [deleteDesgtId, setDeleteDesgntId] = useState(null);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    setLoading(true);
    try {
      const response = await httpInjectorService.getdesignation();

      if (response?.status === 'success' && response?.data) {
        setDesignations(response.data);
      } else {
        // toast.error('Failed to fetch designations');
      }
      setLoading(false);
    } catch (error) {
      toast.error(error, {
        position: 'top-right',
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === '5') {
      getData();
    }
  }, [activeTab]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewDesignations([{ id: Date.now(), name: '', error: '' }]); // Resetting the input fields on modal close
  };

  const handleInputChange = (id, value) => {
    setNewDesignations((prevDesignations) =>
      prevDesignations.map((designation) =>
        designation.id === id
          ? { ...designation, name: value, error: '' }
          : designation,
      ),
    );
  };

  const handleBlur = (id) => {
    const validDesignationRegex = /^[A-Za-z\s]+$/;
    setNewDesignations((prevDesignations) =>
      prevDesignations.map((designation) =>
        designation.id === id
          ? {
              ...designation,
              error:
                designation.name &&
                !validDesignationRegex.test(designation.name)
                  ? 'Designation must only contain alphabets and spaces.'
                  : '',
            }
          : designation,
      ),
    );
  };

  const handleAddField = () => {
    setNewDesignations((prevDesignations) => [
      ...prevDesignations,
      { id: Date.now(), name: '', error: '' },
    ]);
  };

  const handleRemoveField = (id) => {
    setNewDesignations((prevDesignations) =>
      prevDesignations.filter((designation) => designation.id !== id),
    );
  };

  const handleAddDesignations = async () => {
    // Regular expression to allow only alphabetic characters and spaces
    const validDesignationRegex = /^[A-Za-z\s]+$/;

    // Filter out empty names and validate the remaining names
    const validDesignations = newDesignations
      .map((d) => d.name.trim())
      .filter((name) => name && validDesignationRegex.test(name)); // Validate each name

    if (validDesignations.length === 0) {
      toast.error(
        'Please enter at least one valid designation (only alphabets and spaces are allowed)',
      );
      return;
    }

    try {
      const response = await httpInjectorService.addDesignation({
        designations: validDesignations,
      });
      if (response?.status === 'success') {
        toast.success('Designations added successfully');
        closeModal();
        getData();
      } else {
        toast.error('Failed to add designations');
      }
    } catch (error) {
      toast.error('Error adding designations');
    }
  };

  const handleDeleteDesignation = async () => {
    if (deleteDesgtId) {
      try {
        const response = await httpInjectorService.deleteDesignation({
         id: deleteDesgtId,
        });
        if (response.status === 'success') {
          setDesignations((prevDesignations) =>
            prevDesignations.filter(
              (designation) => designation.id !== deleteDesgtId,
            ),
          );
          onDeleteClose();
          setDeleteDesgntId(null);
          toast.success(response.message, {
            position: 'top-right',
            autoClose: 2000,
          });
        } else {
          toast.error(response.message, {
            position: 'top-right',
            autoClose: 2000,
          });
          setDeleteDesgntId(null);
          onDeleteClose();
        }
      } catch (error) {
        toast.error(error, {
          position: 'top-right',
          autoClose: 2000,
        });
        onDeleteClose();
        setDeleteDesgntId(null);
      }
    }
  };

  const DeleteDesignationModal = (id) => {
    setDeleteDesgntId(id);
    onDeleteOpen();
  };

  return (
    <React.Fragment>
      {loading ? (
        <BulletList />
      ) : ( 
        <div>
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '10px',
            }}
          >
            <h2>Designations</h2>
            <Tooltip
              label="Add Designation"
              aria-label="Add Designation"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '15px',
              }}
            >
              <Button colorScheme="purple" onClick={openModal}>
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </Tooltip>
          </div>

          {designations.length > 0 ? (
            <Table bordered style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>S.No</th>
                  <th style={{ width: '30%' }}>Designation</th>
                  <th style={{ width: '30%' }}>Number of Employees</th>
                  <th style={{ width: '30%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {designations.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.designations}</td>
                    <td>{item.designation_count}</td>
                    <td>
                      <Tooltip label="Delete this designation">
                        <Button
                          colorScheme="red"
                          onClick={() => DeleteDesignationModal(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Card mt={2}>
              <Flex justify="center" align="center" height="200px">
                <Empty
                  description="No data found"
                  style={{ fontSize: '24px' }}
                />
              </Flex>
            </Card>
          )}
        </div>

        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add New Designations</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {newDesignations.map((item, index) => (
                  <Flex
                    key={item.id}
                    mb={4}
                    direction="column"
                    align="stretch"
                    gap="12px"
                    p={4}
                    border="1px solid #e2e8f0"
                    borderRadius="8px"
                  >
                    <Input
                      placeholder="Enter designation"
                      value={item.name}
                      onChange={(e) =>
                        handleInputChange(item.id, e.target.value)
                      }
                      onBlur={() => handleBlur(item.id)}
                      isInvalid={!!item.error}
                    />
                    {item.error && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {item.error}
                      </Text>
                    )}
                    <Flex justify="flex-end" align="center">
                      {index !== 0 && (
                        <Button
                          colorScheme="red"
                          onClick={() => handleRemoveField(item.id)}
                          size="sm"
                          mr={2}
                        >
                          Remove
                        </Button>
                      )}
                      {index === newDesignations.length - 1 && (
                        <Button
                          colorScheme="green"
                          onClick={handleAddField}
                          size="sm"
                        >
                          Add
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                ))}
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="purple" onClick={handleAddDesignations}>
                  Add
                </Button>
                <Button variant="ghost" onClick={closeModal} ml={3}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </div>
 )}


      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this designation?
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDeleteClose} colorScheme="purple" mr={3}>
              No
            </Button>
            <Button colorScheme="red" onClick={handleDeleteDesignation}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default Designation;
