import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@chakra-ui/react';
import { Card, CardBody, Label, Table } from 'reactstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import numberToWords from 'number-to-words';
import { Empty } from 'antd';
import { BulletList } from 'react-content-loader';
import Cookies from 'js-cookie';
import PayslipUsers from './PayslipUsers';
import { decryptData } from 'utils/crypto';

const Payslip = ({ activeTab }) => {
  const payslipRef = useRef(null);
  const [payslipData, setPayslipData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('MMMM'));
  const [selectedYear, setSelectedYear] = useState(dayjs().format('YYYY'));
  const [usersData, setUsersData] = useState([]);
  const years = Array.from({ length: 10 }, (_, i) =>
    (dayjs().year() - 5 + i).toString(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const roleId = decryptData(Cookies.get('role_id'));

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

  const downloadPDF = async () => {
    if (!payslipRef.current) {
      console.error('Payslip reference is null');
      return;
    }

    try {
      // Ensure all elements have proper borders and dark text
      const tables = payslipRef.current.querySelectorAll('table');
      tables.forEach((table) => {
        table.style.border = '1px solid black';
        table.style.borderCollapse = 'collapse';
        table.querySelectorAll('th, td').forEach((cell) => {
          cell.style.border = '1px solid black';
          cell.style.color = 'black';
        });
      });

      // Wait for styles to be applied
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(payslipRef.current, {
        scale: 3, // Higher scale for better quality
        backgroundColor: '#fff', // Ensures a white background
        useCORS: true, // Helps with styling issues
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save('payslip.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const getPayslipDetails = async () => {
    setIsLoading(true);
    try {
      const reqBody = {
        month: selectedMonth,
        year: selectedYear,
      };
      const response = await httpInjectorService.getPayslipDetails(reqBody);
      if (response.status === 'success') {
        setPayslipData(response.data);
        setIsLoading(false);
      } else {
        setPayslipData([]);
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setIsLoading(false);
      }
    } catch (err) {
      setPayslipData([]);
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 1000,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === '7') {
      if (roleId === 3) {
        getPayslipDetails();
      } else if (roleId === 1 || roleId === 2) {
        fetchPayslipUsers();
      }
    }
  }, [activeTab, selectedMonth, selectedYear, roleId]);

  const fetchPayslipUsers = async () => {
    const reqBody = {
      month: selectedMonth,
      year: selectedYear,
    };
    try {
      const response = await httpInjectorService.fetchUsersForPayslip(reqBody);
      if (response.status === 'success') {
        setUsersData(response.data);
        setIsLoading(false);
      } else {
        setUsersData([]); // Clear users data if the response is not successful
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setIsLoading(false);
      }
    } catch (err) {
      setUsersData([]); // Clear users data on error
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 1000,
      });
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div className="row mt-2 mx-2">
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

      {isLoading ? (
        <Card>
          <BulletList />
        </Card>
      ) : roleId === 3 ? (
        <div ref={payslipRef} className="p-4 bg-white shadow mt-3 rounded-xl">
          <CardBody>
            {payslipData.length !== 0 ? (
              payslipData.map((item, index) => (
                <div className="bg-white rounded-xl p-3" key={index}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <img src={item.logo_url} height="150px" width="150px" />
                  </div>
                  <h2 className="text-xl fw-bold text-center">
                    {item.company_name}
                  </h2>
                  <p className="text-center">
                    {item.Registered_office
                      ? item.Registered_office
                      : item.corporate_office
                      ? item.corporate_office
                      : ''}
                  </p>
                  <div className="text-center">
                    <h4 className="mt-4">
                      Payslip for the Month of {item.month}, {item.year}
                    </h4>
                  </div>
                  <div className="mt-4">
                    <Table className="border-collapse border-[3px] border-black" bordered>
                      <tbody>
                        <tr>
                          <td className="align-top p-3 w-50">
                            <div className="mb-2 row">
                              <div className="col-4">Name:</div>
                              <div className="col-8">{item.employee_name}</div>
                            </div>
                            <div className="mb-2 row">
                              <div className="col-4">Designation:</div>
                              <div className="col-8">{item.designations}</div>
                            </div>
                            <div className="mb-2 row">
                              <div className="col-4">Department:</div>
                              <div className="col-8">{item.department_name}</div>
                            </div>
                            <div className="mb-2 row">
                              <div className="col-4">Location:</div>
                              <div className="col-8">{item.work_location}</div>
                            </div>
                            <div className="mb-2 row">
                              <div className="col-4">LOP:</div>
                              <div className="col-8">{item.lop}</div>
                            </div>
                          </td>
                          <td className="align-top p-3 w-50">
                            <div className="mb-2 row">
                              <div className="col-4">Employee ID:</div>
                              <div className="col-8">{item.employee_id}</div>
                            </div>
                            <div className="mb-2 row">
                              <div className="col-4">Bank Name:</div>
                              <div className="col-8">{item.bank_name}</div>
                            </div>
                            <div className="mb-2 row">
                              <div className="col-4">Bank Account No:</div>
                              <div className="col-8">{item.account_number}</div>
                            </div>
                            <div className="mb-2 row">
                              <div className="col-4">PAN No:</div>
                              <div className="col-8">{item.pan_no}</div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                  <div className="mt-4">
                    <Table className="border-collapse border-[3px] border-black" bordered>
                      <thead className="align-top w-50">
                        <tr>
                          <td rowSpan="2">
                            <div className="row mb-2">
                              <div className="fw-bold col-6">Earnings</div>
                              <div className="fw-bold col-6">Amount</div>
                            </div>
                          </td>
                          <td rowSpan="2">
                            <div className="row mb-2">
                              <div className="fw-bold col-6">Deductions</div>
                              <div className="fw-bold col-6">Amount</div>
                            </div>
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="align-top w-50">
                            <div className="row p-2">
                              <div className="col-6">Basic</div>
                              <div className="col-6">{item.basic_month}</div>
                            </div>
                            <div className="row p-2">
                              <div className="col-6">HRA</div>
                              <div className="col-6">{item.hra_month}</div>
                            </div>
                            <div className="row p-2">
                              <div className="col-6">Conveyance Allowance</div>
                              <div className="col-6">{item.conveyance_allowance_month}</div>
                            </div>
                            <div className="row p-2">
                              <div className="col-6">Special Allowance</div>
                              <div className="col-6">{item.special_allowance_month}</div>
                            </div>
                            <div className="row p-2">
                              <div className="col-6">Variable</div>
                              <div className="col-6">{item.variable}</div>
                            </div>
                          </td>
                          <td className="align-top w-50">
                            <div className="row p-2">
                              <div className="col-6">Adoc</div>
                              <div className="col-6">{item.adoc_deduction}</div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot className="align-top w-50">
                        <tr>
                          <td rowSpan="2">
                            <div className="row mb-2">
                              <div className="fw-bold col-6">Total Earnings (Rs)</div>
                              <div className="col-6">{item.ctc_per_month}</div>
                            </div>
                          </td>
                          <td rowSpan="2">
                            <div className="row mb-2">
                              <div className="fw-bold col-6">Total Deductions (Rs)</div>
                              <div className="col-6">{item.adoc_deduction}</div>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                    <div className="row mx-1">
                      <span className="fw-bold col-3">Net Pay For The Month</span>
                      <span className="col-3">{item.net_pay}</span>
                    </div>
                    <div className="mt-3">
                      <span className="mx-3">
                        {`Rupees ${
                          item?.net_pay && !isNaN(item.net_pay)
                            ? numberToWords.toWords(item.net_pay)
                            : ''
                        } Only`}
                      </span>
                      <hr />
                      <span className="d-flex justify-content-center">
                        This is a system generated payslip and does not require signature.
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <Empty />
              </div>
            )}
          </CardBody>
        </div>
      ) : ( // For roleId 1 or 2
        <div ref={payslipRef} className="p-4 bg-white shadow mt-3 rounded-xl">
          <CardBody>
            {usersData.length !== 0 ? (
              <PayslipUsers usersData={usersData} setUsersData={setUsersData} month={selectedMonth} year={selectedYear} />
            ) : (
              <div className="text-center py-5">
                <Empty />
              </div>
            )}
          </CardBody>
        </div>
      )}

      {payslipData.length !== 0 && roleId === 3 && (
        <Button
          className="mt-3"
          float="right"
          colorScheme="purple"
          rounded="3"
          onClick={downloadPDF}
        >
          Download PDF
        </Button>
      )}
    </React.Fragment>
  );
};

export default Payslip;
