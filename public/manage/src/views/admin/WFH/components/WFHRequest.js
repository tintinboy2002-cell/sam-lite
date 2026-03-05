import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Input,
  Flex,
  InputGroup,
  // InputLeftElement,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  FormControl,
  FormLabel,
  Textarea,
  Text,
  ModalFooter,
  ModalCloseButton,
  Badge,
  Checkbox
} from '@chakra-ui/react';
import { ViewIcon, CheckIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { FiFilePlus, FiTrash2, FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';
import TableContainer from 'components/common/TableContainer';
import httpInjectorService from 'services/http-injector.service';
import Cookies from 'js-cookie';
import { decryptData } from 'utils/crypto';

const WFHRequest = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [requestType] = useState('WFH Request');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [workFromHome, setWorkFromHome] = useState([]);
  const [editRequest, setEditRequest] = useState(null);
  const role_id = decryptData(Cookies.get('role_id'));
  const user_role = decryptData(Cookies.get('userRole'));

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onviewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const [viewRequest, setViewRequest] = useState(null);

  // FETCH API (post)
  const fetchWfhRequest = async () => {
    try {
      const response = await httpInjectorService.getWfhRequset();
      console.log('FULL API RESPONSE:', response);

      if (response?.status === 'success') {
        const apiData = response?.data;

        if (Array.isArray(apiData)) {
          setWorkFromHome(apiData);
        } else if (Array.isArray(apiData?.data)) {
          setWorkFromHome(apiData.data);
        } else {
          setWorkFromHome([]);
        }
      } else {
        setWorkFromHome([]);
      }
    } catch (error) {
      console.log('Failed to fetch WFH requests', error);
      setWorkFromHome([]); // prevent crash
    }
  };

  // SUBMIT REQUEST
  const submitRequest = async () => {
    if (!startDate || !endDate || !reason) {
      alert('All fields have to fill (required)');
      return;
    }

    try {
      const payload = {
        request_type: requestType,
        start_date: startDate,
        end_date: endDate,
        reason: reason,
      };

      const response = await httpInjectorService.createWfhRequest(payload);

      if (response?.status === 'success') {
        fetchWfhRequest();
        resetForm();
        onClose();
      }
    } catch (error) {
      console.log('WFH request submission failed', error);
    }
  };

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  // DELETE WFH REQUEST
  const handleDelete = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this WFH request?'))
      return;

    try {
      const response = await httpInjectorService.deleteWfhRequest(requestId);

      console.log('DELETE RESPONSE:', response);

      if (response?.data?.status === 'success') {
        // Remove deleted item from state or refetch table
        setWorkFromHome((prev) => prev.filter((item) => item.id !== requestId));
        toast.success('Deleted successfully');
      } else {
        toast.error(response?.data?.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Something went wrong');
    }
  };

  useEffect(() => {
    fetchWfhRequest();
  }, []);

  // TABLE COLUMNS
  const columns = useMemo(() => {
    const baseColumn = [
      ...(role_id === 2
        ? [
            { Header: 'Employee ID', accessor: 'employee_id' },
            { Header: 'Employee Name', accessor: 'username' },
          ]
        : []),
      { Header: 'Request type', accessor: 'request_type' },
      {
        Header: 'Start Date',
        accessor: 'start_date',
        Cell: ({ value }) => (value ? value.split('T')[0] : ''),
      },
      {
        Header: 'End Date',
        accessor: 'end_date',
        Cell: ({ value }) => (value ? value.split('T')[0] : ''),
      },
      { Header: 'Days', accessor: 'days' },
      { Header: 'Status', accessor: 'status', Cell:({value}) => {
        const color = 
        value === 'Pending' ? 'yellow' : 
        value === 'Approved' ? 'green' : 
        value === 'Rejected' ? 'red' : 'gray';
        
        return (
          <Badge colorScheme={color}
          variant='solid' px={3} py={1} borderRadius="full" fontWeight="medium">{value}</Badge>
        );
      },
    },
      {
        Header: 'Applied On',
        accessor: 'applied_on',
        Cell: ({ value }) => (value ? value.split('T')[0] : ''),
      },
    ];
    //user action column(beta user)
    if (role_id === 3) {
      baseColumn.push({
        Header: 'Action',
        Cell: ({ row }) => (
          <Flex gap={3}>
            <Box onClick={() => handleDelete(row.original.id)}>
              <FiTrash2 />
            </Box>
            <Box
              cursor="pointer"
              color="gray.600"
              _hover={{ color: 'blue.500' }}
              onClick={() => {
                const rowData = row.original;

                setEditRequest({
                  id: rowData.id,
                  start_date: rowData.start_date?.split('T')[0],
                  end_date: rowData.end_date?.split('T')[0],
                  reason: rowData.reason,
                });
                onEditOpen();
              }}
            >
              <FiEdit size={18} />
            </Box>
          </Flex>
        ),
      });
    }
    //admin action column
    if (role_id === 2) {
      baseColumn.push({
        Header: 'Action',
      Cell: ({ row }) => {
  const status = row.original.status;

  return (
    <Flex gap={2} align="center">
      
      {status === "Pending" && (
        <>
          <Button
            size="xs"
            colorScheme="green"
            variant="solid"
            borderRadius="md"
            onClick={() => updateStatus(row.original.id, "Approved")}
          >
            <CheckIcon boxSize={3} />
          </Button>

          <Button
            size="xs"
            colorScheme="red"
            variant="solid"
            borderRadius="md"
            onClick={() => updateStatus(row.original.id, "Rejected")}
          >
            <SmallCloseIcon boxSize={3} />
          </Button>
        </>
      )}

      <Button
        size="xs"
        colorScheme="blue"
        variant="solid"
        borderRadius="md"
        onClick={() => {
          setViewRequest(row.original);
          onviewOpen();
        }}
      >
        <ViewIcon boxSize={3} />
      </Button>

    </Flex>
  );
},
      });
    }
    return baseColumn;
  }, [role_id]);

  const handleUpdate = async () => {
    if (
      !editRequest?.start_date ||
      !editRequest?.end_date ||
      !editRequest?.reason
    ) {
      toast.error('All fields are required');
      return;
    }
    try {
      const payload = {
        id: editRequest.id,
        start_date: editRequest.start_date,
        end_date: editRequest.end_date,
        reason: editRequest.reason,
      };

      const response = await httpInjectorService.updateWfhrequest(payload);

      if (response?.data?.status === 'success') {
        toast.success('Updated successfully');
        onEditClose();
        setEditRequest(null);
        fetchWfhRequest(); // for refresh
      } else {
        toast.error('Update failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };


  const updateStatus = async (id, status) => {
  try {
    const payload = { id, status };

    const response = await httpInjectorService.updateWfhStatus(payload);

    if (response?.status === "success") {
      toast.success(response.message || "Status Updated Successfully");
      fetchWfhRequest();
    } else {
      toast.error(response.message || "Status update failed");
    }
  } catch (error) {
    toast.error("Something went wrong");
  }
};
  
  return (
    <Box p={10}>
      <Flex justify={'space-between'} align="center">
        <InputGroup maxW="300px" />

        <Button
          colorScheme="purple"
          borderRadius="full"
          px={6}
          mt={4}
          leftIcon={<FiFilePlus />}
          onClick={onOpen}
        >
          WFH Request
        </Button>
      </Flex>

      {/*raise request modal create*/}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Work From Home Request</ModalHeader>

          <ModalBody>
            <Text mb={6} color="gray.600">
              Fill out the form below to submit a WFH request.
            </Text>

            <FormControl mb={3}>
              <FormLabel>Request Type</FormLabel>
              <Input value={requestType} isReadOnly />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Reason</FormLabel>
              <Textarea
                placeholder="Enter reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              borderRadius="full"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </Button>

            <Button
              colorScheme="purple"
              borderRadius="full"
              ml={3}
              onClick={submitRequest}
            >
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* modal Update */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          onEditClose();
          setEditRequest(null);
        }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit WFH Request</ModalHeader>

          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={editRequest?.start_date || ''}
                onChange={(e) =>
                  setEditRequest({ ...editRequest, start_date: e.target.value })
                }
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={editRequest?.end_date || ''}
                onChange={(e) =>
                  setEditRequest({ ...editRequest, end_date: e.target.value })
                }
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Reason</FormLabel>
              <Textarea
                value={editRequest?.reason || ''}
                onChange={(e) =>
                  setEditRequest({ ...editRequest, reason: e.target.value })
                }
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              onClick={() => {
                onEditClose();
                setEditRequest(null);
              }}
            >
              Cancel
            </Button>

            <Button colorScheme="purple" ml={3} onClick={handleUpdate}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* modal View for admin */}

      <Modal
        isOpen={isViewOpen}
        onClose={() => {
          onViewClose();
          setViewRequest(null);
        }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Work From Home Request Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Employee Name</FormLabel>
              <Input value={viewRequest?.username || ''} isReadOnly />
            </FormControl>
            <FormControl>
              <FormLabel>Start Date</FormLabel>
              <Input
                value={
                  viewRequest?.start_date
                    ? viewRequest.start_date.split('T')[0]
                    : ''
                }
                isReadOnly
              />
            </FormControl>
            <FormControl>
              <FormLabel>End Date</FormLabel>
              <Input
                value={
                  viewRequest?.end_date
                    ? viewRequest.end_date.split('T')[0]
                    : ''
                }
                isReadOnly
              />
            </FormControl>
            <FormControl>
              <FormLabel>Reason</FormLabel>
              <Input value={viewRequest?.reason || ''} isReadOnly />
            </FormControl>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* table */}
      <Box mt={8}>
        <TableContainer
          columns={columns}
          data={Array.isArray(workFromHome) ? workFromHome : []}
          isGlobalFilter={true}
          customPageSize={10}
          className="custom-header-css"
        />
      </Box>
    </Box>
  );
};

export default WFHRequest;
