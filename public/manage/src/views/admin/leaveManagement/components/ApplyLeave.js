import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from 'reactstrap';
import LeaveApplyModal from './LeaveApplyModal';
import { Badge, Button } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import Select from 'react-dropdown-select';
import { BulletList } from 'react-content-loader';
import { Empty } from 'antd';

const ApplyLeave = ({ activeTab }) => {
  const [showForm, setShowForm] = useState(false);
  const [getLeaveDetails, setLeaveDetails] = useState([]);
  const [getAssignedLeaves, setAssignedLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeaveForAccrualHistory, setSelectedLeaveForAccrualHistory] =
    useState([]);
  const [accrualHistory, setAccrualHistory] = useState([]);
  const [mappedData, setMappedData] = useState([]);

  const onButtonClick = () => {
    setShowForm(true);
  };

  const getLeavesDetails = async () => {
    try {
      const response = await httpInjectorService.getLeaveDetails();
      if (response.status === 'success') {
        setLeaveDetails(response.data);
        setLoading(false);
      } else {
        setLeaveDetails([]);
        setLoading(false);
      }
    } catch {
      setLeaveDetails([]);
      setLoading(false);
    }
  };

  const allMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const getAccrualHistory = async (rule_id) => {
    setLoading(true);
    try {
      const response = await httpInjectorService.getAccrualHistory(rule_id);
      if (response.status === 'success') {
        setAccrualHistory(response.data);
        const mappedData = allMonths.map((month) => {
          const monthData = response.data.find(
            (record) => record.month === month,
          );
          return (
            monthData || {
              month,
              credited_leaves: 0,
              applied_leaves: 0,
              penalty_leaves: 0,
              carry_forward_leaves: 0,
              closing_balance: 0,
            }
          );
        });
        setMappedData(mappedData);
        setLoading(false);
      } else {
        setAccrualHistory([]);
        toast.error(response.data.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setLoading(false);
      }
    } catch (err) {
      setAccrualHistory([]);
      toast.error('Accrual History Not Found', {
        position: 'top-right',
        autoClose: 1000,
      });
      setLoading(false);
    }
  };

  const getLeaveTypes = async () => {
    try {
      const response = await httpInjectorService.getAssignedLeaveTypes();
      if (response.status === 'success') {
        setAssignedLeaves(response.data);
        if (response.data.length > 0) {
          setSelectedLeaveForAccrualHistory([response.data[0]]);
          getAccrualHistory(response.data[0].rule_id);
        }
      } else {
        setAssignedLeaves([]);
      }
    } catch {
      setAssignedLeaves([]);
    }
  };

  useEffect(() => {
    if (activeTab === '1') {
      getLeaveTypes();
      getLeavesDetails();
    }
  }, [activeTab]);

  return (
    <React.Fragment>
      {loading ? (
        <div>
          <BulletList />
        </div>
      ) : (
        <div>
          {getLeaveDetails && getLeaveDetails.length > 0 ? (
            <div>
              <div
                className="d-flex justify-content-between align-items-center"
                style={{ borderRadius: '10px', marginTop: '10px' }}
              >
                <CardTitle className="fw-bolder h5 mx-1">Apply Leave</CardTitle>
                <Button colorScheme="purple" onClick={onButtonClick}>
                  Apply For Leave
                </Button>
              </div>
              <div className="container mt-4">
                <div className="row">
                  {/* Left Panel */}
                  <div className="col-md-4">
                    {getLeaveDetails.map((card, index) => (
                      <Card key={index} className="shadow p-1 bg-white mb-3">
                        <CardHeader
                          style={{ color: 'purple' }}
                          className="card-header bg-light"
                        >
                          {card.leave_type}
                        </CardHeader>
                        <CardBody>
                          <div className="row">
                            {/* Left Side: Details */}
                            <div className="col-md-6">
                              {card.details && card.details.length > 0 ? (
                                card.details.map((detail, detailIndex) => {
                                  return (
                                    <div
                                      className="d-flex justify-content-between align-items-center mb-2"
                                      key={detailIndex}
                                    >
                                      <strong>{detail.label}:</strong>

                                      <Badge colorScheme="purple">
                                        {detail.value}
                                      </Badge>
                                    </div>
                                  );
                                })
                              ) : (
                                <p>No details available</p>
                              )}
                            </div>

                            {/* Right Side: Balance */}
                            <div className="col-md-6 d-flex align-items-center justify-content-center">
                              <div className="text-center">
                                <h1
                                  style={{
                                    color: 'purple',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {card.balance}
                                </h1>
                                <p className="mb-0">Leave Balance</p>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                  <br />

                  {/* Right Panel */}
                  {getAssignedLeaves.length > 0 && (
                    <div className="col-md-8">
                      <div className="card shadow p-1 bg-white">
                        <div className="card-header bg-light">
                          <h5
                            style={{ color: 'purple', fontWeight: 'bold' }}
                            className="mb-0"
                          >
                            Accrual History
                          </h5>
                        </div>
                        <div className="card-body">
                          {/* Dropdown */}
                          <div className="mb-3">
                            <Select
                              options={getAssignedLeaves}
                              labelField="leave_type"
                              valueField="rule_id"
                              values={selectedLeaveForAccrualHistory}
                              onChange={(value) => {
                                if (value.length > 0 && value[0]?.rule_id) {
                                  getAccrualHistory(value[0].rule_id);
                                  setSelectedLeaveForAccrualHistory(value);
                                } else {
                                  setAccrualHistory([]);
                                  setMappedData([]);
                                  setSelectedLeaveForAccrualHistory([]);
                                }
                              }}
                            ></Select>
                          </div>

                          {/* Table */}
                          {accrualHistory.length > 0 && (
                            <div style={{ overflowX: 'auto' }}>
                              <table className="table table-bordered table-responsive text-center">
                                <thead className="table-light">
                                  <tr>
                                    <th>Details</th>
                                    {allMonths.map((month) => (
                                      <th key={month}>{month}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {[
                                    'credited_leaves',
                                    'applied_leaves',
                                    'penalty_leaves',
                                    'carry_forward_leaves',
                                    'closing_balance',
                                  ].map((field) => (
                                    <tr key={field}>
                                      <td>
                                        {field
                                          .replace(/_/g, ' ')
                                          .replace(/\b\w/g, (char) =>
                                            char.toUpperCase(),
                                          )}
                                      </td>
                                      {mappedData.map((record, index) => (
                                        <td key={index}>{record[field]}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <Empty />
            </div>
          )}
          <LeaveApplyModal
            getLeavesDetails={getLeavesDetails}
            getAssignedLeaves={getAssignedLeaves}
            showForm={showForm}
            setShowForm={setShowForm}
          />
        </div>
      )}
    </React.Fragment>
  );
};

export default ApplyLeave;
