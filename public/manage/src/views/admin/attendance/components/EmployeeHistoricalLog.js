import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import httpInjectorService from 'services/http-injector.service';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { Empty } from 'antd';
import { BulletList } from 'react-content-loader';
import { Badge } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { setEmployeesMonthlyLogs } from 'store/actions';
import { decryptData } from 'utils/crypto';
import TableContainer from 'components/common/TableContainer';


// Helper function to convert epoch time to IST
const epochToIST = (epochTime) => {
  const date = new Date(epochTime * 1000); // Convert seconds to milliseconds
  return date.toLocaleTimeString('en-IN', {
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
};

// Helper function to format the date without time
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
};

// Helper function to format date to local date (YYYY-MM-DD)
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  return `${year}-${month}-${day}`;
};

const EmployeeHistoricalLog = ({ activeTab }) => {
  // const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [display, setDisplay] = useState(true);
  const [dateRange, setDateRange] = useState({ fromDate: null, toDate: null });
  // const [editableCell, setEditableCell] = useState({
  //   rowId: null,
  //   cellName: null,
  // });
  const [searchQuery, setSearchQuery] = useState('');

  // const [completedRows, setCompletedRows] = useState(() => {
  //   try {
  //     const saved = JSON.parse(localStorage.getItem('completedRows')) || {};
  //     return saved;
  //   } catch {
  //     return {};
  //   }
  // });

  const dispatch = useDispatch();

  const roleId = decryptData(Cookies.get('role_id'));
  // console.log("roleId month", roleId);

  const employees = useSelector(
    (state) => state.Authentication.employeesMonthlyLogs,
  );

  // const toggle = () => {
  //   setModal(!modal);
  // };

  // const formatDateForBackend = (dateString) => {
  //   if (!dateString) return '';
  //   const [day, month, year] = dateString.split('/');
  //   return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  // };

  // const handleRaiseRequest = async (row) => {
  //   setSelectedRow(row);
  //   setDate(row.formatted_date);
  //   setClockIn(
  //     row.formattedClockIn !== '--'
  //       ? convertToInputTime(row.formattedClockIn)
  //       : '',
  //   );
  //   setClockOut(
  //     row.formattedClockOut !== '--'
  //       ? convertToInputTime(row.formattedClockOut)
  //       : '',
  //   );
  //   toggle();
  // };

  // // determine a stable key for a row (try id, Employee_id, EMPLOYEE_ID, fallback to name+date)
  // const getRowKey = (row) => {
  //   if (!row) return null;

  //   // Prefer unique combo: Employee ID + Date
  //   if (row.Employee_id && row.formatted_date) {
  //     return `${row.Employee_id}::${row.formatted_date}`;
  //   }

  //   if (row.id) return String(row.id);
  //   if (row.EMPLOYEE_ID && row.formatted_date) {
  //     return `${row.EMPLOYEE_ID}::${row.formatted_date}`;
  //   }

  //   if (row.Name && row.formatted_date) {
  //     return `${row.Name}::${row.formatted_date}`;
  //   }

  //   return null;
  // };

  // const markRowCompleted = (rowId, actionType) => {
  //   if (!rowId || !actionType) return;
  //   setCompletedRows((prev) => {
  //     const updated = {
  //       ...prev,
  //       [rowId]: { ...prev[rowId], [actionType]: true },
  //     };
  //     try {
  //       localStorage.setItem('completedRows', JSON.stringify(updated));
  //     } catch (e) {
  //       console.warn('Could not persist completedRows', e);
  //     }
  //     return updated;
  //   });
  // };

  // const submitRaiseRequest = async () => {
  //   try {
  //     const payload = {
  //       date: formatDateForBackend(date),
  //       clock_in_time: clockIn,
  //       clock_out_time: clockOut,
  //       reason,
  //       employee_id: selectedRow?.Employee_id || selectedRow?.EMPLOYEE_ID,
  //       employee_name: selectedRow?.Name,
  //       user_id: selectedRow?.user_id,
  //     };
  //     const response = await httpInjectorService.submitRaiseRequest(payload);
  //     console.log('Raise request submitted:', response);
  //     console.log(payload, 'payload');
  //     toggle();
  //     if (response.status === 'success') {
  //       toast.success(response.message, {
  //         position: 'top-right',
  //         autoClose: 2000,
  //       });
  //       const key = getRowKey(selectedRow);
  //       if (key) markRowCompleted(key, 'raise');
  //       //if (key) markRowCompleted(key, 'leave');
  //     }
  //   } catch (error) {
  //     console.error('Error submitting raise request:', error);
  //   }
  // };

  const fetchData = async (dateRange) => {
    setLoading(true);
    try {
      const formattedRange = {
        fromDate: dateRange.fromDate
          ? formatLocalDate(dateRange.fromDate)
          : null,
        toDate: dateRange.toDate ? formatLocalDate(dateRange.toDate) : null,
      };
      const response = await httpInjectorService.monthlylogs(formattedRange);

      if (response?.data) {
        const updatedData = response.data.map((Employee, index) => ({
          ...Employee,
          id: Employee.id || index,
          formatted_date: formatDate(Employee.date),
          formattedClockIn: Employee.firstclockin
            ? epochToIST(Employee.firstclockin)
            : '--',
          formattedClockOut: Employee.lastclockout
            ? epochToIST(Employee.lastclockout)
            : '--',
        }));
        dispatch(setEmployeesMonthlyLogs(updatedData));
        // setEmployees(updatedData);
        setLoading(false);
      } else {
        setLoading(false);
        setDisplay(false);
        dispatch(setEmployeesMonthlyLogs([]));
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setLoading(false);
      setDisplay(false);
      dispatch(setEmployeesMonthlyLogs([]));
    }
  };

  const handleFilter = async () => {
    if (dateRange.fromDate && dateRange.toDate) {
      setLoading(true);
      fetchData(dateRange);
    } else {
      toast.warning('Please select both from and to dates', {
        position: 'top-right',
      });
    }
  };

  const handleDownload = async () => {
    try {
      const payload = {
        start: dateRange.fromDate,
        end: dateRange.toDate,
      };

      const response = await httpInjectorService.downloadHistoricalsLog(
        payload,
      );
      // console.log(response, 'response');

      if (response.status === 'success' && response.data?.length > 0) {
        const data = response.data.map((row) => {
          const clockIn =
            row.CLOCK_IN && row.CLOCK_IN !== 0
              ? new Date(row.CLOCK_IN * 1000).toLocaleString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })
              : '';

          const clockOut =
            row.CLOCK_OUT && row.CLOCK_OUT !== 0
              ? new Date(row.CLOCK_OUT * 1000).toLocaleString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })
              : '';

          const date = new Date(row.date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });

          return {
            EMPLOYEE_ID: row.EMPLOYEE_ID,
            NAME: row.NAME,
            DATE: date,
            CLOCK_IN: clockIn,
            CLOCK_OUT: clockOut,
            STATUS: row.STATUS,
            TOTAL_HOURS: row.TOTAL_HOURS,
          };
        });

        // Convert JSON to CSV
        const headers = Object.keys(data[0]).join(',');
        const rows = data
          .map((row) =>
            Object.values(row)
              .map((value) => `"${value}"`)
              .join(','),
          )
          .join('\n');

        const csvContent = [headers, rows].join('\n');

        // Trigger CSV download
        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'historical_logs.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('File Downloaded', {
          position: 'top-right',
          autoClose: 2000,
        });
      } else {
        toast.error('No data available for download!', {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Download failed!', { position: 'top-right' });
    }
  };

  // const handleEdit = (rowId, cellName, value) => {
  //   setEditableCell({ rowId, cellName });
  //   setTempValues({ [cellName]: value });
  // };

  // const handleInputChange = (e, field) => {
  //   const value = e.target.value;
  //   setTempValues((prev) => ({ ...prev, [field]: value }));
  // };

  // const handleSave = async (employee) => {
  //   console.log(employee, tempValues);
  //   const updatedData = {
  //     ...employee,
  //     formatted_clockin: convertTo24Hour(
  //       tempValues.formattedClockIn || employee.formattedClockIn,
  //     ),
  //     formatted_clockout: convertTo24Hour(
  //       tempValues.formattedClockOut || employee.formattedClockOut,
  //     ),
  //   };

  //   try {
  //     await updateUser(updatedData);
  //     setEditableCell({ rowId: null, cellName: null });
  //     setTempValues({});
  //   } catch (error) {
  //     console.error('Error updating employee data:', error);
  //   }
  // };

  // const convertTo24Hour = (timeInput) => {
  //   let hours, minutes;

  //   // Check if the input has AM/PM (12-hour format)
  //   const is12HourFormat =
  //     timeInput.toLowerCase()?.includes('am') ||
  //     timeInput.toLowerCase()?.includes('pm');

  //   if (is12HourFormat) {
  //     // Handle 12-hour format
  //     const [time, modifier] = timeInput.split(' ');
  //     [hours, minutes] = time.split(':');
  //     if (hours === '12') {
  //       hours = '00';
  //     }
  //     if (modifier.toUpperCase() === 'PM') {
  //       hours = parseInt(hours, 10) + 12;
  //     }
  //   } else {
  //     // Handle 24-hour format
  //     [hours, minutes] = timeInput.split(':');
  //   }

  //   // Convert to UTC by subtracting 5 hours and 30 minutes
  //   let date = new Date();
  //   date.setUTCHours(parseInt(hours, 10), parseInt(minutes, 10));
  //   date.setUTCMinutes(date.getUTCMinutes() - 330); // Subtract 330 minutes (5 hours 30 minutes)

  //   const utcHours = date.getUTCHours().toString().padStart(2, '0');
  //   const utcMinutes = date.getUTCMinutes().toString().padStart(2, '0');

  //   // Return the time in 24-hour format
  //   return `${utcHours}:${utcMinutes}`;
  // };

  // const updateUser = async (values) => {
  //   try {
  //     const response = await httpInjectorService.adminuserudpdate(values);
  //     console.log(values, 'updating user');
  //     toast.success(response.message, {
  //       position: 'top-right',
  //       autoClose: 2000,
  //     });
  //     fetchData(dateRange);
  //   } catch (error) {
  //     console.error('Error updating employee data:', error);
  //   }
  // };

  useEffect(() => {
    if (activeTab === '4') {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 2);
      setDateRange({
        fromDate: thirtyDaysAgo,
        toDate: today,
      });
      fetchData({
        fromDate: thirtyDaysAgo,
        toDate: today,
      });
    }
  }, [activeTab]);

   const filteredEmployees = employees.filter((employee) => {
  if (roleId === 2 || roleId === 1) {
    const name = employee?.Name?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase());
  }
  return true;
});

  // const convertToInputTime = (timeStr) => {
  //   if (!timeStr || timeStr === '--') return '';

  //   const [time, modifier] = timeStr.split(' '); // "02:30 PM" -> ["02:30", "PM"]
  //   let [hours, minutes] = time.split(':');

  //   if (modifier.toUpperCase() === 'PM' && hours !== '12') {
  //     hours = parseInt(hours, 10) + 12;
  //   }
  //   if (modifier.toUpperCase() === 'AM' && hours === '12') {
  //     hours = '00';
  //   }

  //   return `${hours.toString().padStart(2, '0')}:${minutes}`;
  // };

  // const convertTo12Hour = (time24) => {
  //   let [hours, minutes] = time24.split(':');
  //   let period = 'AM';
  //   hours = parseInt(hours, 10);
  //   if (hours >= 12) {
  //     period = 'PM';
  //     if (hours > 12) hours -= 12;
  //   }
  //   if (hours === 0) hours = 12;
  //   return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
  // };

  const columns = useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'formatted_date',
      },
      {
        Header: 'Employee ID',
        accessor: 'employee_id',
      },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Clock In',
        accessor: 'formattedClockIn',
      },
      {
        Header: 'Clock Out',
        accessor: 'formattedClockOut',
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => {
          let color =
            value === 'Present'
              ? 'success'
              : value === 'Absent'
              ? 'danger'
              : value === 'Holiday' || value === 'Weekend'
              ? 'warning'
              : value === 'OnLeave'
              ? 'primary'
              : 'secondary';

          return <Badge color={color}>{value}</Badge>;
        },
      },
      {
        Header: 'Total Hours',
        accessor: 'totalhours',
      }
      // {
      //   Header: 'Actions',
      //   id: 'actions',
      //   Cell: ({ row }) => {
      //     const { formattedClockIn, formattedClockOut } = row.original;

      //     const isClockInEmpty =
      //       !formattedClockIn || formattedClockIn === '--';
      //     const isClockOutEmpty =
      //       !formattedClockOut || formattedClockOut === '--';

      //     const showRaiseRequest = isClockOutEmpty;
      //     const showApplyLeave = isClockInEmpty && isClockOutEmpty;

      //     const rowKey = getRowKey(row.original);
      //     const raiseCompleted = rowKey
      //       ? completedRows[rowKey]?.raise
      //       : false;
      //     const leaveCompleted = rowKey
      //       ? completedRows[rowKey]?.leave
      //       : false;

      //     return (
      //       <div>
      //         {showRaiseRequest && (
      //           <Button
      //             size="xs"
      //             colorScheme="purple"
      //             mr={2}
      //             onClick={() => handleRaiseRequest(row.original)}
      //             isDisabled={raiseCompleted}
      //           >
      //             {raiseCompleted ? '✔ Requested' : 'Raise Request'}
      //           </Button>
      //         )}
      //         {showApplyLeave && (
      //           <Button
      //             size="xs"
      //             colorScheme="blue"
      //             onClick={() => navigate(`/admin/leaves`)}
      //             isDisabled={leaveCompleted}
      //           >
      //             {leaveCompleted ? '✔ Leave Applied' : 'Apply Leave'}
      //           </Button>
      //         )}
      //       </div>
      //     );
      //   },
      // },
    ],
    [],
  );

  return (
    <>
      <div
        className="page-content"
        style={{ borderRadius: '10px', marginTop: '20px' }}
      >
        <div className="container-fluid">
          <div class="d-flex justify-content-end">
            <DatePicker
              selected={dateRange.fromDate}
              onChange={(date) =>
                setDateRange({ ...dateRange, fromDate: date })
              }
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
            <Button
              colorScheme="green"
              onClick={handleDownload}
              style={{ marginLeft: '10px' }}
            >
              Download
            </Button>
          </div>
          {loading ? (
            <div className="text-center">
              <BulletList />
            </div>
          ) : employees.length === 0 ? (
            <Box
              width="100%"
              padding="6"
              borderWidth="1px"
              borderRadius="lg"
              boxShadow="lg"
              marginTop="0"
            >
              <Empty />
            </Box>
          ) : (
            <Box position="relative">
              {employees.length > 0 && (
                <>
                  <TableContainer
                    columns={columns}
                    data={filteredEmployees}
                    isGlobalFilter={true}
                    customPageSize={10}
                    className="custom-header-css"
                  />
                </>
              )}
            </Box>
          )}
        </div>
      </div>
      {/*  
       <Modal isOpen={modal} onClose={toggle}>
         <ModalOverlay />
         <ModalContent>
           <ModalHeader>Raise Attendance Correction Request</ModalHeader>
           <ModalCloseButton />
           <ModalBody>
             <FormControl mb={4}>
               <FormLabel>Date</FormLabel>
               <Input
                 type="text"
                 value={date}
                 // onChange={(e) => setDate(e.target.value)}
               />
             </FormControl>
 
             <FormControl mb={4}>
               <FormLabel>Clock In</FormLabel>
               <Input
                 type="time"
                 value={clockIn}
                 onChange={(e) => setClockIn(e.target.value)}
               />
             </FormControl>
 
             <FormControl mb={4}>
               <FormLabel>Clock Out</FormLabel>
               <Input
                 type="time"
                 value={clockOut}
                 onChange={(e) => setClockOut(e.target.value)}
               />
             </FormControl>
 
             <FormControl>
               <FormLabel>Reason</FormLabel>
               <Textarea
                 placeholder="Enter reason for correction"
                 value={reason}
                 onChange={(e) => setReason(e.target.value)}
               />
             </FormControl>
           </ModalBody>
 
           <ModalFooter>
             <Button
               colorScheme="purple"
               mr={3}
               onClick={() => submitRaiseRequest()}
             >
               Submit
             </Button>
 
             <Button variant="ghost" onClick={toggle}>
               Cancel
             </Button>
           </ModalFooter>
         </ModalContent>
       </Modal> */}
    </>
  );
};

export default EmployeeHistoricalLog;
