import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardBody, Button, } from '@chakra-ui/react';
import httpInjectorService from 'services/http-injector.service';
import TableContainer from 'components/common/TableContainer';
import Cookies from 'js-cookie';
import { Empty } from 'antd';
import { BulletList } from 'react-content-loader';
import { useDispatch, useSelector } from 'react-redux';
import { setEmployeesDailyLogs } from 'store/actions';
import { toast } from 'react-toastify';
import { decryptData } from 'utils/crypto';
 
// Helper function to convert epoch time to IST
const epochToIST = (epochTime) => {
  const date = new Date(epochTime * 1000); // Convert seconds to milliseconds
  return date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
};
 
// Helper function to format the date without time
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
};
 
const DailyLogs = ({ activeTab }) => {
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState({});
  const logData = useSelector((state) => state.Authentication?.data);
   const roleId = decryptData(Cookies.get('role_id'));
 // console.log("roleId", roleId);
  const employees = useSelector(
    (state) => state.Authentication.employeesDailylogs,
  );
  const dispatch = useDispatch();
 
  const toggleRowSelection = (id) => {
    setSelectedRows((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };
 
  const columns = useMemo(() => {
    const baseColumns = [
      {
        Header: 'Date',
        accessor: 'formattedDate',
      },
      {
        Header: 'Clock In',
        accessor: 'formattedClockIn',
      },
      {
        Header: 'Clock Out',
        accessor: 'formattedClockOut',
      },
    ];
 
    let finalColumns = baseColumns;
 
    if (roleId === 2) {
      finalColumns = [
        {
          Header: 'Employee ID',
          accessor: 'employee_id',
        },
        {
          Header: 'Name',
          accessor: 'username',
        },
        ...baseColumns,
      ];
    }
 
    return [
      {
        Header: 'Sl No',
        accessor: (row, index) => index + 1,
      },
      ...finalColumns,
    ];
  }, [roleId, selectedRows]);
 
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await httpInjectorService.dailylogs();
      if (response.status === 'success') {
        const updatedEmployees = response.data.map((employee) => ({
          ...employee,
          id: employee.Employee_id,
          formattedDate: formatDate(employee.date),
          formattedClockIn: employee.clock_In
            ? epochToIST(employee.clock_In)
            : '',
          formattedClockOut: employee.clock_out
            ? epochToIST(employee.clock_out)
            : '',
        }));
        dispatch(setEmployeesDailyLogs(updatedEmployees));
        setLoading(false);
      } else {
        dispatch(setEmployeesDailyLogs([]));
        setLoading(false);
      }
    } catch (error) {
      dispatch(setEmployeesDailyLogs([]));
      setLoading(false);
    }
  };
 
  useEffect(() => {
    if (activeTab === '1') {
      fetchEmployees();
    }
  }, [activeTab]);
 
 
const handleDownload = async () => {
    try {
      const response = await httpInjectorService.downloadDailyLogs();

      if (response.status === 'success' && response.data?.length > 0) {
        const data = response.data.map((row) => {
          const date = new Date(row.date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });

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

          return {
            EMPLOYEE_ID: row.EMPLOYEE_ID,
            NAME: row.NAME,
            DATE: date,
            CLOCK_IN: clockIn,
            CLOCK_OUT: clockOut,
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
        link.setAttribute('download', 'daily_logs.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('File Downloaded', { position: 'top-right' });
      } else {
        toast.error('No data available for download!', {
          position: 'top-right',
        });
      }
    } catch (error) {
      toast.error('Download failed!', { position: 'top-right' });
      console.error(error);
    }
  };
 
  return (
    <React.Fragment>
      <Card className="shadow bg-white mt-3">
        {loading ? (
          <div>
            <BulletList />
          </div>
        ) : (
          <CardBody>
            {employees.length === 0 ? (
              <div>
                <Empty />
              </div>
            ) : (
              <div className="container-fluid">
                <div class="d-flex justify-content-end">
                  <Button colorScheme="purple"onClick={handleDownload} download>
                    Download
                  </Button>
                </div>
 
                <TableContainer
                  columns={columns}
                  data={employees}
                  isGlobalFilter={true}
                  customPageSize={10}
                  className="custom-header-css"
                />
 
              </div>
            )}
          </CardBody>
        )}
      </Card>
    </React.Fragment>
  );
};
 
export default DailyLogs;
 
 
 