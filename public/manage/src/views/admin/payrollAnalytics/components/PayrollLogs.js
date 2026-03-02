import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardBody,
  Col,
  Row,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  Collapse,
} from 'reactstrap';
import { HStack, Box, Button, } from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import httpInjectorService from 'services/http-injector.service';
import TableContainer from 'components/common/TableContainer';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { toast } from 'react-toastify';
import { BulletList } from 'react-content-loader';
import { Empty } from 'antd';
import AssignedPayrollStructure from './AuditlogsModels/AssignedPayrollStructure';
import UpdatePayrollDetails from './AuditlogsModels/UpdatePayrollDetails';
import RemoveAssignedPayrollStructure from './AuditlogsModels/RemoveAssignedPayrollStructure';
import CreatePayrollStructure from './AuditlogsModels/CreatePayrollStructure';
import UpdatePayrollStructure from './AuditlogsModels/UpdatePayrollStructure';
import DeletedPayrollStructure from './AuditlogsModels/DeletedPayrollStructure';
import CreateAdocVariableLogs from './AuditlogsModels/CreateAdocVariableLogs';
import UpdateAdocVariable from './AuditlogsModels/UpdateAdocVariable';
import DeleteAdocVariable from './AuditlogsModels/DeleteAdocVariable';
import HoldUserSalary from './AuditlogsModels/HoldUserSalary';
import RemoveHeldUserSalary from './AuditlogsModels/RemoveHeldUserSalary';
import UpdatePayoutDetails from './AuditlogsModels/UpdatePayoutDetails';
import GeneratePayslip from './AuditlogsModels/GeneratePayslip';
import CreatePayout from './AuditlogsModels/CreatePayout';

const PayrollLogs = ({ activeTab }) => {
  const [logs, setLogs] = useState([]);
  const [modal, setModal] = useState(false);
  const [modal2, setModal2] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [dateRange, setDateRange] = useState({ fromDate: null, toDate: null });
  const [loading, setIsLoading] = useState(true);
  const [isPayrollOpen, setPayrollOpen] = useState(false);
  const [tab, setTab] = useState('0');

  const toggleModal = () => {
    setTab('0')
    setModal((prevModal) => !prevModal);
  };

  const togglePayroll = () => setPayrollOpen(!isPayrollOpen);

  const toggleModal2 = () => {
    setModal2((prevModal) => !prevModal);
  };


  const getLogs = async (dateRange) => {
    const formattedRange = {
      startDate: dateRange.fromDate
        ? formatLocalDate(dateRange.fromDate)
        : null,
      endDate: dateRange.toDate ? formatLocalDate(dateRange.toDate) : null,
    };

    console.log(formattedRange, 'obj');

    try {
      const response = await httpInjectorService.getPayrollLogs(formattedRange);
      if (response.status === 'success') {
        const formattedLogs = await response.data.map((log) => {
          const createdAt = new Date(log.created_at);
          return {
            ...log,
            created_at: createdAt.toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }), // Format date and time
          };
        });
        setLogs(formattedLogs);
      } else {
        console.log(response.message);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === '10') {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      setDateRange({
        fromDate: thirtyDaysAgo,
        toDate: tomorrow,
      });

      getLogs({
        fromDate: thirtyDaysAgo,
        toDate: tomorrow,
      });
    }
  }, [activeTab]);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString(); // Formats the date using the browser's locale
  };

  const isIsoDateString = (value) => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    return isoDateRegex.test(value);
  };

  const modalOpener = async (data) => {
    const logDetails = JSON.parse(data.logs);
    setSelectedLog(logDetails);
    console.log(logDetails, 'parsed log details');

    const modulename = data.module_name;
    const userId = logDetails.user_id;
    console.log(userId, modulename, 'userId', 'modulename');

    if (modulename === 'Assign Payroll Structure') {
      // const userId = logDetails.users;
    
      // try {
      //   const response =
      //     await httpInjectorService.fetchUserDetailsForPayrollLogs({
      //       id: userId,
      //       modulename: modulename,
      //     });
      //   console.log('assign api calling');
      //   const additionalInfo = response.data;
      //   // console.log(additionalInfo, "additional info")
      //   const usernames =await additionalInfo.map(user => user.username).join(', ');
      //   const emails = await additionalInfo.map(user => user.email).join(', ');
      //   console.log(usernames);
      //   setSelectedLog((prevState) => ({
      //     ...prevState,
      //     usernames,
      //     emails,
      //     // email: additionalInfo.email,
      //     modulename:'Assigned Payroll Structure'
      //   }));
      //   console.log(selectedLog, "a'Assigned Payroll Structure'")
        setTab('1');
        // toggleModal();
      // } catch (error) {
      //   console.error('Error fetching user details:', error);
      // }
    } else if(modulename === 'Update Payroll Details')  {
      const response =
      await httpInjectorService.fetchUserDetailsForPayrollLogs({
        id: userId,
        modulename: modulename,
      });
      const additionalInfo = response.data[0];
      setSelectedLog((prevState) => ({
        ...prevState,
        username: additionalInfo.username,
        email: additionalInfo.email,
      }));
      setTab('2');
    }
    else if(modulename === 'Removed Assigned Payroll Structure') {
       const response =
      await httpInjectorService.fetchUserDetailsForPayrollLogs({
        id: userId,
        modulename: modulename,
      });
      const additionalInfo = response.data[0];
      setSelectedLog((prevState) => ({
        ...prevState,
        username: additionalInfo.username,
        email: additionalInfo.email,
      }));
       setTab('3')
    }
    else if( modulename === 'Create Payroll Structure') {
      setTab('4');
    }
    else if( modulename === 'Update Payroll Structure') {
       setTab('5');
     }
     else if( modulename === 'Deleted created Payroll Structure') {
      setTab('6');
    }
    else if( modulename === 'Create ADOC/Variable logs') {
      const response =
      await httpInjectorService.fetchUserDetailsForPayrollLogs({
        id: userId,
        modulename: modulename,
      });
      const additionalInfo = response.data[0];
      setSelectedLog((prevState) => ({
        ...prevState,
        username: additionalInfo.username,
        email: additionalInfo.email,
      }));
      setTab('7');
    }
    else if(modulename === 'Update ADOC/Variable logs') {
      const response =
      await httpInjectorService.fetchUserDetailsForPayrollLogs({
        id: userId,
        modulename: modulename,
      });
      const additionalInfo = response.data[0];
      setSelectedLog((prevState) => ({
        ...prevState,
        username: additionalInfo.username,
        email: additionalInfo.email,
      }));
      setTab('8');
    }
    else if(modulename === 'Deleted ADOC/Variable for employee') {
      const response =
      await httpInjectorService.fetchUserDetailsForPayrollLogs({
        id: userId,
        modulename: modulename,
      });
      const additionalInfo = response.data[0];
      setSelectedLog((prevState) => ({
        ...prevState,
        username: additionalInfo.username,
        email: additionalInfo.email,
      }));
      setTab('9');
    }
    else if( modulename === 'Hold User Salary') {
      const response =
      await httpInjectorService.fetchUserDetailsForPayrollLogs({
        id: userId,
        modulename: modulename,
      });
      const additionalInfo = response.data[0];
      setSelectedLog((prevState) => ({
        ...prevState,
        username: additionalInfo.username,
        email: additionalInfo.email,
      }));
      setTab('10');
    }
    else if(modulename === 'delete Held Salary') {
      const response =
      await httpInjectorService.fetchUserDetailsForPayrollLogs({
        id: userId,
        modulename: modulename,
      });
      const additionalInfo = response.data[0];
      setSelectedLog((prevState) => ({
        ...prevState,
        username: additionalInfo.username,
        email: additionalInfo.email,
      }));
        setTab('11');
   } else if (modulename === 'Update Payout Details') {
      setTab('12');
    } 
    else if( modulename === 'Generate Payslip'){
       setTab('13');
     }
     else if (modulename === 'Create Payout') {
       setTab('14');
     }
   
    else {
      try {
        const response =
          await httpInjectorService.fetchUserDetailsForPayrollLogs({
            id: userId,
            modulename: modulename,
          });
        console.log(response, 'latest API response');
        const additionalInfo = response.data[0];
        setSelectedLog((prevState) => ({
          ...prevState,
          username: additionalInfo.username,
          email: additionalInfo.email,
        }));
        toggleModal();
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    }
  };

  const handleFilter = () => {
    if (dateRange.fromDate && dateRange.toDate) {
      getLogs(dateRange);
    } else {
      toast.warning('Please select both from and to dates', {
        position: 'top-right',
      });
    }
  };

  const renderLogDetailsTable = (logDetails) => {
    console.log(logDetails, 'logdetails');
    const keys = Object.keys(logDetails);
    const values = Object.values(logDetails);

    return (
      <Table>
    <thead>
      <tr>
        {keys.map((key) => (
          <th key={key}>{key.replace(/_/g, ' ')}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      <tr>
        {values.map((value, index) => (
          <td key={index}>
            {typeof value === 'object'
              ? JSON.stringify(value)
              : isIsoDateString(value)
              ? formatDate(value)
              : value}
          </td>
        ))}
      </tr>
    </tbody>
  </Table>
    );
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        Header: 'Sl No.',
        accessor: 'idx',
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: 'Module name',
        accessor: 'module_name',
      },
      {
        Header: 'Performed By',
        accessor: 'username',
      },
      {
        Header: 'Performed At',
        accessor: 'created_at',
      },
      {
        Header: 'Performed Action',
        accessor: 'action',
      },
      {
        Header: 'Action',
        Cell: ({ row }) => (
          <>
            <MdOutlineRemoveRedEye onClick={() => modalOpener(row.original)} />
          </>
        ),
      },
    ];

    return baseColumns;
  }, []);

  return (
    <React.Fragment>
    {loading ? (
      <Card className="text-center">
        <BulletList />
      </Card>
    ) : logs.length === 0 ? (
      <Box width="100%" padding="6" borderWidth="1px" borderRadius="lg" boxShadow="lg" marginTop="0">
        <Empty />
      </Box>
    ) : (
      <Card className="shadow p-1 bg-white" style={{ marginTop: '20px' }}>
        <HStack spacing={2} justifyContent="flex-end">
          <DatePicker
            selected={dateRange.fromDate}
            onChange={(date) => setDateRange({ ...dateRange, fromDate: date })}
            selectsStart
            startDate={dateRange.fromDate}
            endDate={dateRange.toDate}
            placeholderText="From Date"
          />
          <DatePicker
            selected={dateRange.toDate}
            onChange={(date) => setDateRange({ ...dateRange, toDate: date })}
            selectsEnd
            startDate={dateRange.fromDate}
            endDate={dateRange.toDate}
            minDate={dateRange.fromDate}
            placeholderText="To Date"
          />
          <Button colorScheme="purple" onClick={handleFilter}>
            Filter
          </Button>
        </HStack>
        <CardBody>
          <TableContainer
            columns={columns}
            data={logs}
            isGlobalFilter={true}
            customPageSize={10}
            className="custom-header-css"
          />
        </CardBody>
      </Card>
    )}
     {/* <Modal
    isOpen={modal}
    toggle={toggleModal}
    size="xl"
    centered
    style={{ maxWidth: '90vw' }}
  >
    <ModalHeader toggle={toggleModal}>Log Details</ModalHeader>
    <ModalBody style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      {selectedLog ? renderLogDetailsTable(selectedLog) : <p>No log details available.</p>}
    </ModalBody> 
  </Modal> */}


  
    
{/* 
    <Modal isOpen={modal2} toggle={toggleModal2} size="xl" centered style={{ maxWidth: '90vw' }}>
      <ModalHeader toggle={toggleModal2}>Log Details</ModalHeader>
      <ModalBody style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        {selectedLog && selectedLog.modulename==='Assigned Payroll Structure' ? (
          <div>
            <Card>
              <CardBody>
                <h5>Basic Information</h5>
                <Table>
                  <tbody>
                    <tr>
                      <th>Effective Date</th>
                      <td>{new Date(selectedLog.effective_date).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <th>Org ID</th>
                      <td>{selectedLog.org_id}</td>
                    </tr>
                    <tr>
                      <th>Users</th>
                      <td>{selectedLog.users.join(', ')}</td>
                    </tr>
                    <tr>
                    <th>User names</th>
                    <td>{selectedLog.usernames}</td>
                    </tr>
                    <tr>
                      <th>emails</th>
                      <td>{selectedLog.emails}</td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>

            <Card className="mt-3">
              <CardBody>
                <h5>Payroll Structure</h5>
                  <Table>
                    <thead>
                      <tr>
                        <th>Key</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(selectedLog.payroll_structure[0]).map(([key, value]) => (
                        <tr key={key}>
                          <th>{key.replace(/_/g, ' ')}</th>
                          <td>{typeof value === 'object' ? JSON.stringify(value) : value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
              </CardBody>
            </Card>
          </div>
        ) : (
          <p>No log details available.</p>
        )}
      </ModalBody>
    </Modal> */}

   {tab==='1' && <AssignedPayrollStructure   toggleModal={toggleModal} selectedLog={selectedLog}  modal={tab==='1'}/>}
   {tab==='2' && <UpdatePayrollDetails  toggleModal={toggleModal} selectedLog={selectedLog} modal={tab==='2'}/>}
   {tab==='3' && <RemoveAssignedPayrollStructure toggleModal={toggleModal} selectedLog={selectedLog} modal={tab==='3'} /> }
   {tab==='4' && <CreatePayrollStructure toggleModal={toggleModal} selectedLog={selectedLog} modal={tab==='4'}/>}
  {tab==='5'  && <UpdatePayrollStructure toggleModal={toggleModal} selectedLog={selectedLog} modal={tab==='5'} />}
  {tab==='6' && <DeletedPayrollStructure toggleModal={toggleModal} selectedLog={selectedLog} modal={tab==='6'} />}
  {tab==='7' && <CreateAdocVariableLogs toggleModal={toggleModal} selectedLog={selectedLog} modal={tab==='7'}/>}
   {tab==='8' && <UpdateAdocVariable toggleModal={toggleModal} selectedData={selectedLog} modal={tab==='8'} />}
   {tab==='9' && <DeleteAdocVariable toggleModal={toggleModal} selectedLog={selectedLog} modal={tab==='9'}/>}
   {tab==='10' && <HoldUserSalary toggleModal={toggleModal} selectedLog={selectedLog} modal={tab==='10'} />}
   {tab==='11' && <RemoveHeldUserSalary toggleModal={toggleModal} selectedLog={selectedLog} modal={tab==='11'}/>}
    {tab === '12' && (
        <UpdatePayoutDetails
          toggleModal={toggleModal}
          selectedLog={selectedLog}
          modal={tab === '12'}
        />
      )}
      {tab === '13' && (
        <GeneratePayslip
        toggleModal={toggleModal}
        selectedLog={selectedLog}
        modal = {tab === '13'}
        />
      )}
      {tab === '14' && ( 
        <CreatePayout
        toggleModal={toggleModal}
        selectedLog={selectedLog}
        modal = {tab === '14'}
        />
      )}
  </React.Fragment>
  
  );
};

export default PayrollLogs;
