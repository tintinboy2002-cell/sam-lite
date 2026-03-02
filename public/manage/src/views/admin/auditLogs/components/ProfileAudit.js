import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  Badge,
  Flex,
  Box,
  Text,
  Divider,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';
import TableContainer from 'components/common/TableContainer';
import { useEffect, useMemo, useState } from 'react';
import { MdBusiness, MdPerson, MdAssuredWorkload } from 'react-icons/md';
import { CardTitle, Table } from 'reactstrap';
import {
  Action,
  ChangedBy,
  ChangedFields,
  EmployeeId,
  EmployeeName,
} from './ProfileAuditCol';
import httpInjectorService from 'services/http-injector.service';
import { BulletList } from 'react-content-loader';
import { Empty } from 'antd';
import { SimpleGrid } from '@chakra-ui/react';

const ProfileAudit = () => {
  const [profileauditlogs, setProfileAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedLog, setSelectedLog] = useState(null);

  const columns = useMemo(
    () => [
      {
        Header: 'Sl No',
        accessor: 'serial',
        disableFilters: true,
        disableSortBy: false,
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: 'Employee ID',
        accessor: 'employee_id',
        disableFilters: true,
        Cell: (cellProps) => <EmployeeId {...cellProps} />,
      },
      {
        Header: 'Employee Name',
        accessor: 'username',
        disableFilters: true,
        Cell: (cellProps) => <EmployeeName {...cellProps} />,
      },
      {
        Header: 'Changed Fields',
        accessor: 'changed_fields',
        disableFilters: true,
        Cell: (cellProps) => <ChangedFields {...cellProps} />,
      },
      {
        Header: 'Changed By',
        accessor: 'changed_by_name',
        disableFilters: true,
        Cell: (cellProps) => <ChangedBy {...cellProps} />,
      },
      {
        Header: 'Action',
        accessor: 'action',
        disableFilters: true,
        Cell: ({ row }) => (
          <Flex justifyContent="center" align="center" gap={3}>
            <IconButton
              icon={<ViewIcon />}
              size="sm"
              variant="ghost"
              colorScheme="purple"
              aria-label="View Details"
              onClick={() => {
                setSelectedLog(row.original);
                onOpen();
              }}
            />
          </Flex>
        ),
      },
    ],
    [],
  );

  useEffect(() => {
    getProfileAuditLogs();
  }, []);

  const getProfileAuditLogs = async () => {
    try {
      const response = await httpInjectorService.getProfileAuditLogs();
      if (response.status === 'success') {
        setProfileAuditLogs(response.data);
      } else {
        setProfileAuditLogs([]);
      }
    } catch {
      setProfileAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const renderValue = (value, field) => {
    if (!value) return 'null';

    // If DOB field → format date
    if (field === 'dob') {
      const date = new Date(value);
      if (!isNaN(date)) {
        return date.toISOString().split('T')[0];
      }
    }

    if (typeof value === 'string') return value;

    if (typeof value === 'object') return JSON.stringify(value);

    return String(value);
  };

  return (
    <div style={{ marginTop: '80px' }}>
      <Card>
        <CardBody>
          <Tabs colorScheme="purple">
            <TabList gap={4}>
              <Tab>
                <MdPerson style={{ marginRight: '5px' }} />
                My Profile
              </Tab>
              <Tab>
                <MdBusiness style={{ marginRight: '5px' }} />
                Company Profile
              </Tab>
              <Tab>
                <MdAssuredWorkload style={{ marginRight: '5px' }} />
                Payroll
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {loading ? (
                  <div>
                    <BulletList />
                  </div>
                ) : (
                  <div>
                    {profileauditlogs.length === 0 ? (
                      <Empty className="mt-4" />
                    ) : (
                      <div className="table-container">
                        <TableContainer
                          columns={columns}
                          data={profileauditlogs}
                          isGlobalFilter={true}
                          customPageSize={10}
                          className="custom-header-css"
                        />
                      </div>
                    )}
                  </div>
                )}
              </TabPanel>
              <TabPanel>
                <Empty className="mt-4" />
              </TabPanel>
              <TabPanel>
                <Empty className="mt-4" />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader bg="purple.600" color="white">
            Profile Audit Details
          </ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody p={6} maxH="70vh" overflowY="auto">
            {selectedLog && (
              <>
                {/* Header Section */}
                <Box
                  mb={6}
                  p={4}
                  bg="purple.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="purple.100"
                >
                  <Text fontWeight="bold" fontSize="xl" color="purple.700">
                    {selectedLog.username} ({selectedLog.employee_id})
                  </Text>

                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Changed By: <b>{selectedLog.changed_by_name}</b>
                  </Text>

                  <Text fontSize="sm" color="gray.500">
                    {new Date(selectedLog.changed_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </Text>
                </Box>

                <Divider mb={6} />

                {/* Changed Fields Grid */}
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                  {selectedLog.changed_fields.map((field, index) => (
                    <Box
                      key={index}
                      p={5}
                      borderRadius="xl"
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      boxShadow="md"
                      transition="0.2s"
                      _hover={{
                        boxShadow: 'lg',
                        transform: 'translateY(-2px)',
                      }}
                    >
                      {/* Field Name */}
                      <Text
                        fontWeight="semibold"
                        fontSize="sm"
                        color="purple.600"
                        mb={4}
                        textTransform="capitalize"
                      >
                        {field.replace(/_/g, ' ')}
                      </Text>

                      {/* Old & New Section */}
                      <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                        {/* Old Value */}
                        <Box
                          flex={1}
                          bg="red.50"
                          p={3}
                          borderRadius="md"
                          border="1px solid"
                          borderColor="red.100"
                        >
                          <Text fontSize="xs" color="red.500" mb={1}>
                            OLD
                          </Text>
                          <Text fontWeight="medium" fontSize="sm">
                            {renderValue(selectedLog.old_data?.[field], field)}
                          </Text>
                        </Box>

                        {/* New Value */}
                        <Box
                          flex={1}
                          bg="green.50"
                          p={3}
                          borderRadius="md"
                          border="1px solid"
                          borderColor="green.100"
                        >
                          <Text fontSize="xs" color="green.500" mb={1}>
                            NEW
                          </Text>
                          <Text fontWeight="medium" fontSize="sm">
                            {renderValue(selectedLog.new_data?.[field], field)}
                          </Text>
                        </Box>
                      </Flex>
                    </Box>
                  ))}
                </SimpleGrid>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="purple" rounded="2" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProfileAudit;
