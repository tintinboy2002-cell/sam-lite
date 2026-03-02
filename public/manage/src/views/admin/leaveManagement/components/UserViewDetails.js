import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Row, Button, Badge } from 'reactstrap';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import { Empty } from 'antd';
 
const UserDetailView = ({ username, userId, onBackClick }) => {
  const [leaveDetails, setLeaveDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // index of card being edited
  const [editedDetails, setEditedDetails] = useState(null); // card being edited
 
  const getLeavesDetails = async () => {
    setLoading(true);
    try {
      // First try detailed API
      const response = await httpInjectorService.getUserLeaveDetails(userId);
      if (response.status === 'success') {
        setLeaveDetails(response.data);
      } else {
        // Fallback to assigned leaves if detailed fails
        const fallback = await httpInjectorService.getUserAssignedLeaves(
          userId,
        );
        setLeaveDetails(
          fallback.status === 'success'
            ? fallback.data.map((item) => ({
                leave_type: item.leave_type,
                rule_id: item.rule_id,
                balance: item.leave_balance,
                details: [
                  { label: 'Credited Leaves', value: 0 },
                  { label: 'Total Leaves', value: 0 },
                  { label: 'Applied Leaves', value: 0 },
                  { label: 'Penalty Deduction', value: 0 },
                  { label: 'Carry Forwards', value: 0 },
                ],
              }))
            : [],
        );
      }
    } catch (error) {
      toast.error('Failed to load leaves');
      setLeaveDetails([]);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    if (userId) {
      getLeavesDetails();
    }
  }, [userId]);
 
  const handleEditClick = (leave, index) => {
    setEditing(index);
    setEditedDetails(JSON.parse(JSON.stringify(leave))); // deep clone
  };
 
  const handleCancel = () => {
    setEditing(null);
    setEditedDetails(null);
  };
 
  const handleInputChange = (e, label) => {
    const updated = editedDetails.details.map((detail) =>
      detail.label === label ? { ...detail, value: e.target.value } : detail,
    );
    setEditedDetails({ ...editedDetails, details: updated });
  };
 
  const handleSave = async () => {
    const { details, rule_id } = editedDetails;
    const data = details
      .filter((detail) =>
        ['Credited Leaves', 'Applied Leaves', 'Carry Forwards'].includes(
          detail.label,
        ),
      )
      .reduce((acc, detail) => {
        const key = detail.label.toLowerCase().replace(/ /g, '_');
        acc[key] = parseFloat(detail.value) || 0;
        return acc;
      }, {});
    data.rule_id = rule_id;
    data.user_id = userId;
 
    try {
      const response = await httpInjectorService.updateLeaveDetails(data);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        getLeavesDetails(); // Refresh
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
      }
    } catch (error) {
      toast.error(error.message, {
        position: 'top-right',
        autoClose: 1000,
      });
    }
 
    setEditing(null);
    setEditedDetails(null);
  };
 
  if (loading) return <div>Loading user details...</div>;
 
  return (
    <div className="container-fluid">
      <Row>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <h5 className="fw-bold">{username}</h5>
          <Button color="primary" onClick={onBackClick}>
            Back
          </Button>
        </div>
 
        {leaveDetails.length > 0 ? (
          <div className="row mt-4">
            {leaveDetails.map((leave, index) => {
              const isEditing = editing === index;
              const cardToRender = isEditing ? editedDetails : leave;
 
              return (
                <div className="col-md-6" key={index}>
                  <Card className="shadow mb-4 rounded">
                    <CardHeader
                      className="d-flex justify-content-between align-items-center"
                      style={{ backgroundColor: '#f9f9f9' }}
                    >
                      <h6
                        className="text-capitalize fw-bold"
                        style={{ color: '#7b2cbf' }}
                      >
                        {cardToRender.leave_type}
                      </h6>
                      <div>
                        {isEditing ? (
                          <>
                            <button
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                marginLeft: '10px',
                              }}
                              onClick={handleSave}
                            >
                              <i
                                className="bx bx-check-circle"
                                style={{
                                  fontSize: '1.5rem',
                                  color: 'green',
                                }}
                              ></i>
                            </button>
                            <button
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                marginLeft: '10px',
                              }}
                              onClick={handleCancel}
                            >
                              <i
                                className="bx bx-x-circle"
                                style={{
                                  fontSize: '1.5rem',
                                  color: 'red',
                                }}
                              ></i>
                            </button>
                          </>
                        ) : (
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleEditClick(leave, index)}
                          >
                            <i
                              className="bx bx-edit"
                              style={{
                                fontSize: '1.5rem',
                                color: 'purple',
                              }}
                            ></i>
                          </button>
                        )}
                      </div>
                    </CardHeader>
 
                    <CardBody>
                      {cardToRender.details.map((detail, idx) => {
                        const isEditable = [
                          'Credited Leaves',
                          'Applied Leaves',
                          'Carry Forwards',
                        ].includes(detail.label);
                        return (
                          <div
                            key={idx}
                            className="d-flex justify-content-between align-items-center mb-2"
                          >
                            <span className="fw-medium">{detail.label}:</span>
                            {isEditing && isEditable ? (
                              <input
                                type="number"
                                value={detail.value}
                                onChange={(e) =>
                                  handleInputChange(e, detail.label)
                                }
                                className="form-control"
                                style={{
                                  width: '70px',
                                  textAlign: 'center',
                                  padding: '3px 8px',
                                  borderRadius: '15px',
                                  border: '1px solid #ccc',
                                }}
                              />
                            ) : (
                              <span
                                className="badge rounded-pill text-purple px-3 py-2"
                                style={{
                                  fontWeight: '500',
                                  backgroundColor: '#e0bbff',
                                  color: '#4b0082',
                                }}
                              >
                                {detail.value}
                              </span>
                            )}
                          </div>
                        );
                      })}
 
                      <div className="text-end mt-3">
                        <h2 className="fw-bold" style={{ color: '#7b2cbf' }}>
                          {cardToRender.balance}
                        </h2>
                        <p className="mb-0 text-muted">Leave Balance</p>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="d-flex justify-content-center">
            <Empty />
          </div>
        )}
      </Row>
    </div>
  );
};
 
export default UserDetailView;