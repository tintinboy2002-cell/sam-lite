import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import devTeam from 'assets/img/Team.png';
import { BulletList } from 'react-content-loader';
import { AddIcon } from '@chakra-ui/icons';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import { decryptData } from 'utils/crypto';
import Cookies from 'js-cookie';

import Table from 'components/Table/Table.jsx';

// Report Manager UI
const Report = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    role: '',
    department: '',
    designation: '',
  });

  const user_id = decryptData(Cookies.get('user_id'));

  const roleId = decryptData(Cookies.get('role_id'));

  console.log('role-id', roleId);

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Role', accessor: 'role' },
    { header: 'Department', accessor: 'department' },
    { header: 'Designation', accessor: 'designation' },
  ];

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormValues({
      name: '',
      role: '',
      department: '',
      designation: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // Later this will be sent to the backend API(POST api).
    setReportData((prev) => [...prev, formValues]);
    handleCloseModal();
  };

  // get all report data
  const getReportData = async () => {
    // set loading to true
    setLoading(true);

    try {
      const response = await httpInjectorService.getReports(user_id);

      if (
        response?.status === 'success' ||
        response?.data ||
        Array.isArray(response.data)
      ) {
        setReportData(response?.data); // update state to store api data
      }
    } catch {
      toast.error('Failed to load Report data');
    } finally {
      // make loading false after api call
      setLoading(false);
    }
  };

  // handle update
  const handleUpdateData = async () => {};

  // handle delete
  const handleDeleteData = async () => {};

  // this run side effect once component mount on the page
  useEffect(() => {
    getReportData();
  }, []);

  return (
    <>
      <Box className="card-header">Reporting Manager</Box>

      {/* Reusable Table component just add data and columns as prop and send to table*/}
      {loading ? (
        <BulletList />
      ) : (
        <>
          <Table data={reportData} columns={columns} />
        </>
      )}

      {roleId < 3 && (
        <Box className="card-footer d-flex justify-content-between align-items-center">
          <IconButton
            icon={<AddIcon />}
            aria-label="Add"
            colorScheme="teal"
            variant="outline"
            onClick={handleOpenModal}
            boxSize="35px"
            borderRadius="full"
            border="2px solid"
            fontSize="15px"
            _hover={{ backgroundColor: 'teal.100' }}
          />
        </Box>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Reporting Manager</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formValues.name}
                onChange={handleChange}
                placeholder="Enter name"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Role</FormLabel>
              <Input
                name="role"
                value={formValues.role}
                onChange={handleChange}
                placeholder="Enter Role"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Department</FormLabel>
              <Input
                name="department"
                value={formValues.department}
                onChange={handleChange}
                placeholder="Enter department"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Designation</FormLabel>
              <Input
                name="designation"
                value={formValues.designation}
                onChange={handleChange}
                placeholder="Enter designation"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleSubmit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Report;
