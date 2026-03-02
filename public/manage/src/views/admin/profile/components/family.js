import React, { useEffect, useState } from 'react';
import {
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  // Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Card } from 'reactstrap';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import httpInjectorService from 'services/http-injector.service';
import { decryptData } from 'utils/crypto';
import Table from 'components/Table/Table.jsx';
import { BulletList } from 'react-content-loader';

const Family = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactData, setContactData] = useState({
    full_name: '',
    relationship_with_employee: '',
    primary_contact_number: '',
    alternate_contact_number: '',
    address: '',
    email_address: '',
    priority_level: '',
    remarks: '',
  });
  const [originalContact, setOriginalContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [deleteId, setDeleteId] = useState(null);

  const user_id = decryptData(Cookies.get('user_id'));

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setContactData({
      full_name: '',
      relationship_with_employee: '',
      primary_contact_number: '',
      alternate_contact_number: '',
      address: '',
      email_address: '',
      priority_level: '',
      remarks: '',
    });
    setEditingId(null);
    setOriginalContact(null);
    setIsModalOpen(false);
  };

  // fetch contacts on component mount from backend API
  const getContacts = async () => {
    setLoading(true);
    try {
      const response = await httpInjectorService.getFamilyContact(user_id);
  
      if (response?.data && Array.isArray(response.data)) {
        setContacts(response.data);
      }
    } catch (err) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    getContacts();
  }, []);

  const handleUpdate = async () => {
    if (isUpdating) return;
    const { full_name, primary_contact_number } = contactData;

    if (!full_name || !primary_contact_number) {
      toast.error('Full Name and Primary Contact Number are required.');
      return;
    }

    setIsUpdating(true);
    try {
      let payload = { user_id };
      let response;

      if (editingId) {
        // ✅ Send only modified fields
        const changedFields = {};
        Object.keys(contactData).forEach((key) => {
          if (contactData[key] !== originalContact[key]) {
            changedFields[key] = contactData[key];
          }
        });

        if (Object.keys(changedFields).length === 0) {
          toast.info('No changes detected.');
          setIsUpdating(false);
          return;
        }

        payload = { ...payload, ...changedFields, pri_contact_id: editingId };
        response = await httpInjectorService.updateFamilyContact(payload);
      } else {
        // ✅ Add new contact (full payload)
        payload = { ...payload, ...contactData };
        response = await httpInjectorService.addFamilyContact(payload);
      }

      if (response.status === 'success') {
        toast.success(
          editingId
            ? 'Contact updated successfully!'
            : 'Contact added successfully!',
        );
        getContacts();
        closeModal();
      } else {
        toast.error(response.message || 'Operation failed.');
      }
    } catch (err) {
      toast.error('An error occurred while saving.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = (contact) => {
    setContactData(contact);
    setEditingId(contact.pri_contact_id);
    setOriginalContact(contact);
    setIsModalOpen(true);
  };

  const handleDeleteModal = (pri_contact_id) => {
    setDeleteId(pri_contact_id);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    try {
      console.log('Deleting contact with ID:', deleteId.pri_contact_id);
      const payload = { pri_contact_id: deleteId.pri_contact_id, user_id };

      const response = await httpInjectorService.deleteFamilyContact(payload);

      if (response.status === 'success') {
        setContacts((prev) =>
          prev.filter((c) => c.pri_contact_id !== deleteId.pri_contact_id),
        );
        toast.success('Contact deleted successfully.');
      } else {
        toast.error(response.message || 'Failed to delete contact.');
      }
    } catch (err) {
      toast.error('Error deleting contact.');
    } finally {
      setDeleteId(null);
      onDeleteClose();
    }
  };

  return (
    <>
        <Box className="card-header">Employee Emergency Contacts</Box>

        <Box className="card-body">
          {loading ? (
            <BulletList />
          ) : (
            //rendered table UI
            <Table
              contacts={contacts}
              handleEdit={handleEdit}
              handleDeleteModal={handleDeleteModal}
            />
          )}
        </Box>

        <Box className="card-footer d-flex justify-content-between align-items-center">
          <IconButton
            icon={<AddIcon />}
            aria-label="Add"
            colorScheme="teal"
            variant="outline"
            onClick={openModal}
            boxSize="35px"
            borderRadius="full"
            border="2px solid"
            fontSize="15px"
            _hover={{ backgroundColor: 'teal.100' }}
          />
        </Box>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                value={contactData.full_name}
                onChange={(e) =>
                  setContactData({ ...contactData, full_name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </FormControl>

            <FormControl isRequired mt="3">
              <FormLabel>Relationship</FormLabel>
              <Select
                placeholder="Select Relationship"
                value={contactData.relationship_with_employee}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    relationship_with_employee: e.target.value,
                  })
                }
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Sibling">Sibling</option>
                <option value="Relative">Relative</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>

            <FormControl isRequired mt="3">
              <FormLabel>Primary Contact Number</FormLabel>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={contactData.primary_contact_number}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    primary_contact_number: e.target.value,
                  })
                }
                placeholder="Enter primary contact number"
              />
            </FormControl>

            <FormControl mt="3">
              <FormLabel>Alternate Contact Number</FormLabel>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={contactData.alternate_contact_number}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    alternate_contact_number: e.target.value,
                  })
                }
                placeholder="Enter alternate contact number"
              />
            </FormControl>

            <FormControl isRequired mt="3">
              <FormLabel>Address</FormLabel>
              <Textarea
                value={contactData.address}
                onChange={(e) =>
                  setContactData({ ...contactData, address: e.target.value })
                }
                placeholder="Enter address"
              />
            </FormControl>

            <FormControl mt="3">
              <FormLabel>Email Address</FormLabel>
              <Input
                type="email"
                value={contactData.email_address}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    email_address: e.target.value,
                  })
                }
                placeholder="Enter email address"
              />
            </FormControl>

            <FormControl mt="3">
              <FormLabel>Priority Level</FormLabel>
              <Select
                value={contactData.priority_level}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    priority_level: e.target.value,
                  })
                }
              >
                <option value="">Select Priority</option>
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
              </Select>
            </FormControl>

            <FormControl mt="3">
              <FormLabel>Remarks</FormLabel>
              <Textarea
                value={contactData.remarks}
                onChange={(e) =>
                  setContactData({ ...contactData, remarks: e.target.value })
                }
                placeholder="Enter remarks"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="yellow" mr={3} onClick={closeModal}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleUpdate}
              isLoading={isUpdating}
              loadingText={editingId === null ? 'Saving...' : 'Updating...'}
            >
              {editingId ? 'update' : 'Save'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this emergency contact?
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDeleteClose} colorScheme="purple" mr={3}>
              No
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Family;
