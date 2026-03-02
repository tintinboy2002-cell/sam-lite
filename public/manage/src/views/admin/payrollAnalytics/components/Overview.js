import React, { useState, useEffect } from 'react';
import { Heading, Select } from '@chakra-ui/react';
import { Card, CardBody, Col, Label, Row } from 'reactstrap';
import httpInjectorService from 'services/http-injector.service';
import dayjs from 'dayjs';
import { BulletList } from 'react-content-loader';
import { Empty } from 'antd';

const Overview = ({ activeTab }) => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('MMMM'));
  const [selectedYear, setSelectedYear] = useState(dayjs().format('YYYY'));
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

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

  const getPayrollOverview = async () => {
    setIsLoading(true);
    try {
      const reqBody = { month: selectedMonth, year: selectedYear };
      const response = await httpInjectorService.getPayrollOverview(reqBody);
      if (response.status === 'success') {
      const formattedData = response.data.flatMap((row) => [
  { name: 'Total Employees', value: Number(row.total_employees) || 0 },
  { name: 'Payroll Completed', value: Number(row.payroll_completed) || 0 },
  { name: 'Gross Pay', value: Number(Number(row.gross_pay).toFixed(2)) || 0 },
  { name: 'Net Pay', value: Number(Number(row.net_pay).toFixed(2)) || 0 },
  { name: 'Payslip Generated', value: Number(row.payslip) || 0 },
]);
        setChartData(formattedData);
        setIsLoading(false);
      } else {
        setChartData([]);
        setIsLoading(false);
      }
    } catch {
      setChartData([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === '9') {
      getPayrollOverview();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  return (
    <React.Fragment>
      <Card className="p-4 bg-white shadow mt-3 rounded-xl">
        <CardBody>
          <Heading size="md">Payroll Analytics</Heading>
          <div className="row mt-3">
            <div className="col-sm-2">
              <Label>
                Select Month <span className="text-danger">*</span>
              </Label>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </Select>
            </div>
            <div className="col-sm-2">
              <Label>
                Select Year <span className="text-danger">*</span>
              </Label>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          {isLoading ? (
            <div>
              <BulletList />
            </div>
          ) : (
            <Card className="p-3 shadow-sm mt-4">
              {chartData.length !== 0 ? (
                <CardBody>
                  <Row className="text-center align-items-center">
                    {chartData.map((item, index) => (
                      <Col
                        key={index}
                        className="d-flex flex-column align-items-center"
                      >
                        <div className="fw-bold text-uppercase text-muted">
                          {item.name}
                        </div>
                        <div
                          className="fs-4 fw-semibold"
                          style={{ color: 'purple' }}
                        >
                          {item.value}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              ) : (
                <div className="text-center">
                  <Empty />
                </div>
              )}
            </Card>
          )}
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default Overview;
