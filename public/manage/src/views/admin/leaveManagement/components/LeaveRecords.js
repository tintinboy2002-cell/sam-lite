import React, { useEffect, useMemo, useState } from 'react';
import TableContainer from 'components/common/TableContainer';
import { Box, Text, Button } from '@chakra-ui/react';
import UserViewDetails from './UserViewDetails';
import httpInjectorService from 'services/http-injector.service';
 
const LeaveRecords = ({ activeTab }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [leaveData, setLeaveData] = useState([]);
 
  const columns = useMemo(
    () => [
      { Header: 'Employee Name', accessor: 'employee_name' },
      { Header: 'Employee ID', accessor: 'employee_id' },
      { Header: 'Total Earn Leaves', accessor: 'totalleaves' },
      { Header: 'Applied Earn Leaves', accessor: 'appliedleaves' },
      { Header: 'Leave Balance', accessor: 'appliedleavebalance' },
      { Header: 'Total Comp Off ', accessor: 'totalcompoff' },
      { Header: 'Applied Comp off ', accessor: 'earncompoffapplied' },
      { Header: 'Leave Balance', accessor: 'compoffleavebalance' },
      { Header: 'Total Loss of pay ', accessor: 'lossofpay' },
      { Header: 'Applied loss of pay ', accessor: 'totalloassofpay' },
      { Header: 'Leave Balance', accessor: 'lopleavebalance' },
      {
        Header: 'Action',
        Cell: ({ row }) => (
          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => setSelectedUser(row.original)}
          >
            Edit
          </Button>
        ),
      },
    ],
    [],
  );
 
  const transformLeaveData = (data) => {
    return data.map((user) => {
      const leaveSummary = {
        user_id: user.user_id,
        employee_id: user.employee_id,
        employee_name: user.employee_name,
 
        totalleaves: 0,
        appliedleaves: 0,
        appliedleavebalance: 0,
 
        totalcompoff: 0,
        earncompoffapplied: 0,
        compoffleavebalance: 0,
 
        lossofpay: 0,
        totalloassofpay: 0,
        lopleavebalance: 0,
      };
 
      user.leaves.forEach((leave) => {
        const leaveType = leave.leave_type.toLowerCase();
 
        const applied =
          leave.details.find((d) => d.label === 'Applied Leaves')?.value || 0;
        const total =
          leave.details.find((d) => d.label === 'Total Leaves')?.value || 0;
        const balance = leave.balance || 0;
 
        if (leaveType === 'earn leave') {
          leaveSummary.totalleaves = total;
          leaveSummary.appliedleaves = applied;
          leaveSummary.appliedleavebalance = balance;
        } else if (leaveType === 'comp off') {
          leaveSummary.totalcompoff = total;
          leaveSummary.earncompoffapplied = applied;
          leaveSummary.compoffleavebalance = balance;
        } else if (leaveType === 'loss of pay') {
          leaveSummary.lossofpay = total;
          leaveSummary.totalloassofpay = applied;
          leaveSummary.lopleavebalance = balance;
        }
      });
 
      return leaveSummary;
    });
  };
 
  const getLeaveRecord = async () => {
    try {
      const response = await httpInjectorService.getLeaveRecordsData();
      if (response.status === 'success') {
        const transformed = transformLeaveData(response.data);
        setLeaveData(transformed);
      } else {
        console.warn('Unexpected API response:', response);
      }
    } catch (error) {
      console.error('Failed to fetch leave records:', error);
    }
  };
 
  useEffect(() => {
    if (activeTab === '4') {
      getLeaveRecord();
    }
  }, [activeTab]);
 
  return (
    <Box p={4}>
      {selectedUser ? (
        <UserViewDetails
          username={selectedUser.username}
          userId={selectedUser.user_id}
          onBackClick={() => setSelectedUser(null)}
        />
      ) : (
        <>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Leave Records
          </Text>
          <TableContainer
            columns={columns}
            data={leaveData}
            isGlobalFilter={true}
            customPageSize={10}
            className="custom-header-css"
          />
        </>
      )}
    </Box>
  );
};
 
export default LeaveRecords;