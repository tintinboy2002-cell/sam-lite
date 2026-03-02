import TableContainer from 'components/common/TableContainer';
import React, { useEffect, useMemo, useState } from 'react';
import {
  BasicMonth,
  CtcPerMonth,
  EmployeeId,
  EmployeeName,
  HraMonth,
  AdocAndVariable,
  LopDays,
  NetPay,
  Status,
} from './PayoutCol';
import httpInjectorService from 'services/http-injector.service';
import { Button, Checkbox } from '@chakra-ui/react';
import { Empty } from 'antd';
import Select from 'react-dropdown-select';
import { Badge, Label } from 'reactstrap';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { BulletList } from 'react-content-loader';

const Payout = ({ activeTab }) => {
  const [getPayoutData, setPayoutData] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [isloading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('MMMM'));
  const [selectedYear, setSelectedYear] = useState(dayjs().format('YYYY'));
  const [selectedStatus, setSelectedStatus] = useState('');
  const [editingRow, setEditingRow] = useState(null);
  const [buttonLoader, setButtonLoader] = useState(false);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const years = Array.from({ length: 10 }, (_, i) =>
    (dayjs().year() - 5 + i).toString(),
  );

const toggleAllSelection = () => {
  const selectableUserIds = getPayoutData
    .filter((item) => item.status !== 'SALARY ON HOLD')
    .map((item) => item.user_id);

  setSelectedUsers((prevSelectedUsers) => {
    const allAlreadySelected = selectableUserIds.every((id) =>
      prevSelectedUsers.includes(id)
    );
    return allAlreadySelected ? [] : selectableUserIds;
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
  Cell: ({ row }) =>
    row.original.status === 'SALARY ON HOLD' ? null : (
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
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ row }) => {
          const options = [
            { value: 'SALARY ON HOLD', label: 'SALARY ON HOLD' },
            { value: 'PENDING', label: 'PENDING' },
            { value: 'PAID', label: 'PAID' },
          ];

          const badgeColors = {
            'SALARY ON HOLD': 'danger',
            PENDING: 'warning',
            PAID: 'success',
          };

          return editingRow === row.original.id ? (
            <Select
              options={options}
              values={options.filter(
                (option) => option.value === row.original.status,
              )}
              onChange={(selected) => handleChangeStatus(row, selected)}
              labelField="label"
              valueField="value"
              clearable={false}
              searchable={false}
              autoFocus
              onBlur={() => setEditingRow(null)}
            />
          ) : (
            <Badge
              color={badgeColors[row.original.status]}
              style={{ cursor: 'pointer' }}
              onClick={() => setEditingRow(row.original.id)}
            >
              {row.original.status}
            </Badge>
          );
        },
      },
    ],
    [allSelected, selectedUsers, getPayoutData, editingRow],
  );

  const handleChangeStatus = async (row, selectedOption) => {
    const newValue = selectedOption[0]?.value;
    if (!newValue || newValue === row.original.status) return;

    setEditingRow(null);

    const reqBody = { row_id: row.original.id, status: newValue };

    try {
      const response = await httpInjectorService.updatePayoutDetails(reqBody);
      if (response.status === 'success') {
        toast.success(response.message, {
          autoClose: 1000,
          position: 'top-right',
        });
        getPayoutDetails();
      } else {
        toast.error(response.message, {
          autoClose: 1000,
          position: 'top-right',
        });
      }
    } catch (error) {
      toast.error(error.message, {
        autoClose: 1000,
        position: 'top-right',
      });
    }
  };

  const getPayoutDetails = async () => {
    const reqBody = {
      month: selectedMonth,
      year: selectedYear,
    };
    setIsLoading(true);
    try {
      const response = await httpInjectorService.getPayoutDetails(reqBody);
      if (response.status === 'success') {
        setPayoutData(response.data);
        setIsLoading(false);
        toast.success(response.message, {
          autoClose: 1000,
          position: 'top-right',
        });
      } else {
        setPayoutData([]);
        setIsLoading(false);
        toast.error(response.message, {
          autoClose: 1000,
          position: 'top-right',
        });
      }
    } catch (err) {
      setPayoutData([]);
      setIsLoading(false);
      toast.error(err.message, {
        autoClose: 1000,
        position: 'top-right',
      });
    }
  };

  const generatePayslip = async () => {
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
        month: selectedMonth,
        year: selectedYear,
      };
      const response = await httpInjectorService.generatePayslip(reqBody);
      if (response.status === 'success') {
        toast.success(response.message, {
          autoClose: 1000,
          position: 'top-right',
        });
        setSelectedUsers([]);
        setAllSelected(false);
        setButtonLoader(false);
      } else {
        toast.error(response.message, {
          autoClose: 1000,
          position: 'top-right',
        });
        setButtonLoader(false);
      }
    } catch (err) {
      toast.error(err.message, {
        autoClose: 1000,
        position: 'top-right',
      });
      setButtonLoader(false);
    }
  };

  useEffect(() => {
    if (activeTab === '4') {
      getPayoutDetails();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  return (
    <React.Fragment>
      {isloading ? (
        <div>
          <BulletList />
        </div>
      ) : (
        <div className="mt-3">
          <Button
            float="right"
            className="mx-3"
            rounded="3"
            colorScheme="purple"
            isLoading={buttonLoader}
            onClick={generatePayslip}
          >
            Generate Payslip
          </Button>
          <div className="row">
            <div className="col-sm-2">
              <Label>
                Select Month <span className="text-danger">*</span>
              </Label>
              <select
                className="form-control"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-2">
              <Label>
                Select Year <span className="text-danger">*</span>
              </Label>
              <select
                className="form-control"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {getPayoutData.length === 0 ? (
            <Empty />
          ) : (
            <div className="mt-3">
              <TableContainer
                columns={columns}
                data={getPayoutData}
                isGlobalFilter={true}
                customPageSize={10}
                className="custom-header-css"
              />
            </div>
          )}
        </div>
      )}
    </React.Fragment>
  );
};

export default Payout;