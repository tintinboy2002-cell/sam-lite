import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  Flex,
  Box,
  Text,
  Divider,
  useDisclosure,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  SimpleGrid,
  Input,
  Badge,
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';
import { Empty } from 'antd';
import { BulletList } from 'react-content-loader';

import TableContainer from 'components/common/TableContainer';
import httpInjectorService from 'services/http-injector.service';

const PayrollAudit = ({ isActive }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ✅ FORMAT DATE DD-MM-YYYY
  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}-${String(
      d.getMonth() + 1,
    ).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const getPayrollAudit = async (sDate, eDate) => {
    const start = sDate || startDate;
    const end = eDate || endDate;
    if (!start || !end) return;

    setIsLoading(true);
    try {
      const response = await httpInjectorService.getPayrollLogs({
        startDate: start,
        endDate: end,
      });
      if (response.status === 'success') {
        const formattedLogs = response.data.map((log) => ({
          ...log,
          parsed_logs: (() => {
            try {
              return JSON.parse(log.logs);
            } catch {
              return null;
            }
          })(),
          created_at: formatDate(log.created_at),
        }));
        setLogs(formattedLogs);
      } else setLogs([]);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0],
    };
  };

  useEffect(() => {
    const { start, end } = getCurrentWeekRange();
    setStartDate(start);
    setEndDate(end);
    getPayrollAudit(start, end);
  }, []);

  useEffect(() => {
    if (isActive) {
      const { start, end } = getCurrentWeekRange();
      setStartDate(start);
      setEndDate(end);
      getPayrollAudit(start, end);
    }
  }, [isActive]);

  const columns = useMemo(
    () => [
      {
        Header: 'Sl No',
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: 'Module Name',
        accessor: 'module_name',
      },
      {
        Header: 'Changed By',
        accessor: 'username',
      },
      {
        Header: 'Action',
        accessor: 'action',
      },
      {
        Header: 'Created At',
        accessor: 'created_at',
      },
      {
        Header: 'View',
        Cell: ({ row }) => (
          <Flex justifyContent="center">
            <IconButton
              icon={<ViewIcon />}
              size="sm"
              variant="ghost"
              colorScheme="purple"
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

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (date) {
      const start = new Date(date);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setEndDate(end.toISOString().split('T')[0]);
    } else {
      setEndDate('');
    }
  };

  const renderValue = (value) =>
    value === null || value === undefined || value === '' ? '—' : String(value);

  return (
    <React.Fragment>
      <Flex gap={4} align="end" flexWrap="wrap">
        <Box>
          <Text fontSize="sm" mb={1}>
            Start Date
          </Text>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Box>

        <Box>
          <Text fontSize="sm" mb={1}>
            End Date
          </Text>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Box>

        <Button
          rounded={2}
          mb="1"
          size="sm"
          colorScheme="purple"
          px={8}
          onClick={() => getPayrollAudit()}
        >
          Filter
        </Button>
      </Flex>
      <CardBody>
        {isLoading && <BulletList />}

        {!isLoading && logs.length === 0 && (
          <Empty description="No Records Found" />
        )}

        {!isLoading && logs.length > 0 && (
          <TableContainer
            columns={columns}
            data={logs}
            isGlobalFilter
            customPageSize={10}
          />
        )}
      </CardBody>

      {/* 🔍 MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="purple.600" color="white">
            Audit Details
          </ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody p={6}>
            {selectedLog && (
              <>
                {/* HEADER */}
                <Box
                  mb={6}
                  p={5}
                  bg="purple.50"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="purple.100"
                >
                  <Text fontSize="xl" fontWeight="bold" color="purple.700">
                    {selectedLog.module_name}
                  </Text>

                  <Flex mt={2} gap={4} flexWrap="wrap">
                    <Badge colorScheme="purple">
                      By: {selectedLog.username}
                    </Badge>
                    <Badge colorScheme="green">{selectedLog.action}</Badge>
                    <Badge colorScheme="gray">{selectedLog.created_at}</Badge>
                  </Flex>
                </Box>

                <Divider mb={6} />

                {/* ✅ HANDLE ARRAY OR OBJECT LOGS */}
                {Array.isArray(selectedLog.parsed_logs) ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {selectedLog.parsed_logs.map((item, idx) => (
                      <Box
                        key={idx}
                        p={5}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="gray.200"
                        boxShadow="md"
                        bg="white"
                      >
                        {Object.entries(item).map(([key, value], i) => (
                          <Box key={i} mb={3}>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color="purple.600"
                            >
                              {key
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </Text>
                            <Text color="gray.700">{renderValue(value)}</Text>
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : typeof selectedLog.parsed_logs === 'object' &&
                  selectedLog.parsed_logs !== null ? (
                  <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                    {Object.entries(selectedLog.parsed_logs).map(
                      ([key, value], index) => (
                        <Box
                          key={index}
                          p={5}
                          borderRadius="xl"
                          border="1px solid"
                          borderColor="gray.200"
                          boxShadow="md"
                          bg="white"
                        >
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="purple.600"
                            mb={2}
                          >
                            {key
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </Text>
                          <Text color="gray.700">{renderValue(value)}</Text>
                        </Box>
                      ),
                    )}
                  </SimpleGrid>
                ) : (
                  <Text color="gray.500">No log data available</Text>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              rounded={2}
              size="sm"
              colorScheme="purple"
              onClick={onClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default PayrollAudit;
