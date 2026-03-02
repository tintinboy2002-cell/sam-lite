import { Heading } from '@chakra-ui/react';
import { Empty } from 'antd';
import React, { useEffect, useState } from 'react';
import { Card, CardBody, Table } from 'reactstrap';
import httpInjectorService from 'services/http-injector.service';
import { BulletList } from 'react-content-loader';

const SalaryStructure = ({ activeTab }) => {
  const [salaryStructureData, setSalaryStructureData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getSalaryStructureDetails = async () => {
    setIsLoading(true);
    try {
      const response = await httpInjectorService.getSalaryStructureDetails();
      if (response.status === 'success') {
        const normalizedData = Array.isArray(response.data)
          ? response.data
          : [response.data]; // 💡 Normalize single object to array
        setSalaryStructureData(normalizedData);
      } else {
        setSalaryStructureData([]);
      }
    } catch {
      setSalaryStructureData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === '8') {
      getSalaryStructureDetails();
    }
  }, [activeTab]);

  return (
    <React.Fragment>
      {isLoading ? (
        <div>
          <BulletList />
        </div>
      ) : (
        <Card className="p-4 bg-white shadow mt-3 rounded-xl">
          {salaryStructureData.length !== 0 ? (
            salaryStructureData.map((item, index) => (
              <CardBody key={index}>
                <Heading size="md">Salary Structure</Heading>
                <span className="fw-bold" style={{ float: 'right' }}>
                  Effective Date:{' '}
                  {new Date(item.effective_from).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <Heading className="mt-4" size="sm">
                  Current Salary
                </Heading>
                <Table
                  className="border-collapse border-[1px] border-black"
                  bordered
                >
                  <thead className="align-top w-50 mt-2">
                    <tr>
                      <td rowSpan="2">
                        <div className="row mb-2">
                          <div className="fw-bold col-6">Components</div>
                          <div className="fw-bold col-6">Monthly</div>
                        </div>
                      </td>
                      <td rowSpan="2">
                        <div className="row mb-2 text-center">
                          <div className="fw-bold col-6">Annual</div>
                        </div>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="align-top w-50">
                        <div className="row p-2">
                          <div className="col-6">CTC</div>
                          <div className="col-6">{item.ctc_per_month}</div>
                        </div>
                        <div className="row p-2">
                          <div className="col-6">Basic</div>
                          <div className="col-6">{item.basic_month}</div>
                        </div>
                        <div className="row p-2">
                          <div className="col-6">HRA</div>
                          <div className="col-6">{item.hra_month}</div>
                        </div>
                        <div className="row p-2">
                          <div className="col-6">PF Employer</div>
                          <div className="col-6">0</div>
                        </div>
                        <div className="row p-2">
                          <div className="col-6">Conveyance Allowance</div>
                          <div className="col-6">
                            {item.conveyance_allowance_month}
                          </div>
                        </div>
                        <div className="row p-2">
                          <div className="col-6">ESI Employer</div>
                          <div className="col-6">0</div>
                        </div>
                        <div className="row p-2">
                          <div className="col-6">Special Allowance</div>
                          <div className="col-6">
                            {item.special_allowance_month}
                          </div>
                        </div>
                      </td>
                      <td className="align-top w-50">
                        <div className="row p-2 text-center">
                          <div className="col-6">{item.ctc}</div>
                        </div>
                        <div className="row p-2 text-center">
                          <div className="col-6">{item.basic}</div>
                        </div>
                        <div className="row p-2 text-center">
                          <div className="col-6">{item.hra}</div>
                        </div>
                        <div className="row p-2 text-center">
                          <div className="col-6">0</div>
                        </div>
                        <div className="row p-2 text-center">
                          <div className="col-6">{item.conveyance_allowance}</div>
                        </div>
                        <div className="row p-2 text-center">
                          <div className="col-6">0</div>
                        </div>
                        <div className="row p-2 text-center">
                          <div className="col-6">{item.special_allowance}</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            ))
          ) : (
            <Empty />
          )}
        </Card>
      )}
    </React.Fragment>
  );
};

export default SalaryStructure;