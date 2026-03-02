import React, { useEffect, useMemo, useState } from 'react';
import {
  AdocAndVariable,
  BasicMonth,
  CtcPerAnnual,
  CtcPerMonth,
  EmployeeId,
  EmployeeName,
  HraMonth,
  LopDays,
  NetPay,
} from './RunPayrollCol';
import TableContainer from 'components/common/TableContainer';
import httpInjectorService from 'services/http-injector.service';
import {
  Button,
  Checkbox,
  Select as ChakraSelect,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { BulletList } from 'react-content-loader';
import { Empty, Select, Space } from 'antd';
import { Label } from 'reactstrap';
import dayjs from 'dayjs';

const RunPayroll = ({ setActiveTab, activeTab }) => {
  const [getRunPayrollData, setRunPayrollData] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isSpinner, setSpinner] = useState(false);

  const months = [
    {
      label: 'January',
      value: '1',
    },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  const years = Array.from({ length: 10 }, (_, i) =>
    (dayjs().year() - 5 + i).toString(),
  );

  const toggleAllSelection = () => {
    const allUserIds = getRunPayrollData.map((item) => item.user_id);

    setSelectedUsers((prevSelectedUsers) => {
      if (allSelected) {
        return [];
      } else {
        return allUserIds;
      }
    });

    setAllSelected((prevAllSelected) => !prevAllSelected);
  };

  const toggleRowSelection = (id) => {
    setSelectedUsers((prevState) => {
      if (prevState.includes(id)) {
        return prevState.filter((rowId) => rowId !== id);
      } else {
        return [...prevState, id];
      }
    });
  };

  const columns = useMemo(
    () => [
      {
        Header: (
          <Checkbox
            colorScheme="purple"
            isChecked={allSelected}
            onChange={toggleAllSelection}
          />
        ),
        accessor: 'select',
        Cell: ({ row }) => (
          <Checkbox
            colorScheme="purple"
            isChecked={selectedUsers?.includes(row.original.user_id)}
            onChange={() => toggleRowSelection(row.original.user_id)}
          />
        ),
      },
      {
        Header: 'Employee ID',
        accessor: 'employee_id',
        disableFilters: true,
        Cell: (cellProps) => <EmployeeId {...cellProps} />,
      },
      {
        Header: 'Employee Name',
        accessor: 'name',
        disableFilters: true,
        Cell: (cellProps) => <EmployeeName {...cellProps} />,
      },
      {
        Header: 'Adoc / Variable',
        accessor: 'adoc_variable_amount',
        disableFilters: true,
        Cell: (cellProps) => <AdocAndVariable {...cellProps} />,
      },
      {
        Header: 'HRA Month',
        accessor: 'hra_month',
        disableFilters: true,
        Cell: (cellProps) => <HraMonth {...cellProps} />,
      },
      {
        Header: 'Basic Month',
        accessor: 'basic_month',
        disableFilters: true,
        Cell: (cellProps) => <BasicMonth {...cellProps} />,
      },
      {
        Header: 'Month CTC',
        accessor: 'ctc_per_month',
        disableFilters: true,
        Cell: (cellProps) => <CtcPerMonth {...cellProps} />,
      },
      {
        Header: 'LOP Days',
        accessor: 'lop',
        disableFilters: true,
        Cell: (cellProps) => <LopDays {...cellProps} />,
      },
      {
        Header: 'Net Pay',
        accessor: 'net_pay',
        disableFilters: true,
        Cell: (cellProps) => <NetPay {...cellProps} />,
      },
    ],
    [allSelected, selectedUsers, getRunPayrollData],
  );

  const getRunPayrollDetails = async () => {
    setSpinner(true);
    setIsLoading(true);
    const reqBody = {
      month: selectedMonth.key,
      year: selectedYear.key,
    };
    try {
      const response = await httpInjectorService.getRunPayrollDetails(reqBody);
      if (response.status === 'success') {
        setRunPayrollData(response.data);
        setIsLoading(false);
        toast.success(response.message, {
          autoClose: 1000,
          position: 'top-right',
        });
        setSpinner(false);
      } else {
        setRunPayrollData([]);
        setIsLoading(false);
        toast.error(response.message, {
          autoClose: 1000,
          position: 'top-right',
        });
        setSpinner(false);
      }
    } catch {
      setRunPayrollData([]);
      setIsLoading(false);
      setSpinner(false);
    }
  };

  const OnChangeRunPayOut = async () => {
    if (selectedUsers.length === 0) {
      toast.error('please select at least one user', {
        position: 'top-right',
        autoClose: 1000,
      });
      return;
    }
    setButtonLoader(true);
    try {
      const reqBody = {
        users: selectedUsers,
        month: selectedMonth.key,
        year: selectedYear.key,
        monthName: selectedMonth.label,
      };
      const response = await httpInjectorService.runPayout(reqBody);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setActiveTab('4');
        setSelectedUsers([]);
        setAllSelected(false);
        setButtonLoader(false);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setButtonLoader(false);
      }
    } catch (err) {
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 1000,
      });
      setButtonLoader(false);
    }
  };


  return (
    <React.Fragment>
      <div className="mt-3">
        <Button
          float="right"
          onClick={OnChangeRunPayOut}
          rounded="3"
          colorScheme="purple"
          isLoading={buttonLoader}
        >
          Run PayOut
        </Button>
        <VStack align="flex-start" spacing={4} mt={4}>
          <HStack spacing={4}>
            <ChakraSelect
              placeholder="Select Month"
              onChange={(e) =>
                setSelectedMonth({
                  key: e.target.value,
                  label: months.find((m) => m.value === e.target.value)?.label,
                })
              }
              size="sm"
              borderColor="purple.300"
              focusBorderColor="purple.500"
              rounded="md"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </ChakraSelect>

            <ChakraSelect
              placeholder="Select Year"
              onChange={(e) =>
                setSelectedYear({
                  key: e.target.value,
                  label: e.target.value,
                })
              }
              size="sm"
              borderColor="purple.300"
              focusBorderColor="purple.500"
              rounded="md"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </ChakraSelect>
            <div className="col-sm-2">
              <Button
                onClick={getRunPayrollDetails}
                colorScheme="purple"
                isLoading={isSpinner}
                size="sm"
                rounded="md"
              >
                Submit
              </Button>
            </div>
          </HStack>
        </VStack>

        {isloading ? (
          <div>
            <BulletList />
          </div>
        ) : (
          <div>
            {getRunPayrollData.length === 0 ? (
              <Empty className="mt-4" />
            ) : (
              <div className="mt-3">
                <TableContainer
                  columns={columns}
                  data={getRunPayrollData}
                  isGlobalFilter={true}
                  customPageSize={10}
                  className="custom-header-css"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default RunPayroll;
