import React, { useState, useEffect, useMemo } from 'react';
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Input,
  Label,
  Row,
  Col,
  Card,
  CardTitle,
  CardHeader,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  ButtonDropdown,
} from 'reactstrap';
import { FcBriefcase } from 'react-icons/fc';
// import TableContainer from 'components/Common/TableContainer';
import {
  Badge,
  ButtonGroup,
  Checkbox,
  CloseButton,
  Heading,
  Text,
  Textarea,
  Button,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import Select from 'react-dropdown-select';
import TableContainer from 'components/common/TableContainer';
import Spinner from 'components/common/Spinner';
import Cookies from 'js-cookie';
import LeaveApplyModal from './LeaveApplyModal';
import { Empty } from 'antd';
import { MdEditSquare } from 'react-icons/md';
import { FaCheckCircle } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';
import LeaveRules from './LeaveRules';

const AssignLeaveRules = ({
  selectedUserId,
  dropdownOpen,
  toggle,
  isAssignModal,
  setIsAssignModal,
  selectedUsers,
  columns,
  assignRules,
  toggleRowSelection,
  username,
  setSelectedUserId,
  getLeaveDetails,
  role_id,
  user_role,
  handleSave,
  handleCancel,
  handleEdit,
  editing,
  editedDetails,
  handleChangeDetail,
  getAssignedLeaves,
  getAccrualHistory,
  setSelectedLeaveForAccrualHistory,
  setAccrualHistory,
  setMappedData,
  accrualHistory,
  allMonths,
  showForm,
  setShowForm,
  newLeaveRule,
  setNewLeaveRule,
  isDeleteLeaveRuleModal,
  setIsDeleteLeaveRuleModal,
  onDeleteLeaveRule,
  setSelectedAssignedRules,
  setRuleEffectiveDate,
  selectedAssignedRules,
  ruleEffectiveDate,
  onAssignLeaveRule,
  isDeleteAssignedLeaveRuleModal,
  submitNewCreateRule,
  selectedLeaveRule,
  leaveRules,
  setIsDeleteAssignedLeaveRuleModal,
  onDeleteAssignedLeaveRule,
  selectedLeaveForAccrualHistory,
  mappedData,
  getLeavesDetails,
  leaveRuleTypes,
}) => {
  // Component logic here

  return (
    <div>
      <div>
        {selectedUserId == +'' ? (
          <div className="page-content" style={{ borderRadius: '10px' }}>
            <div className="container-fluid">
              <div className="text-sm-end">
                <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
                  <Button
                    onClick={() => setIsAssignModal(!isAssignModal)}
                    isDisabled={selectedUsers.length > 0 ? false : true}
                    colorScheme="purple"
                    rounded="2"
                  >
                    Assign Rules
                  </Button>
                </ButtonDropdown>
              </div>
              <TableContainer
                columns={columns}
                data={assignRules}
                isGlobalFilter={true}
                customPageSize={10}
                className="custom-header-css"
                selectedUsers={selectedUsers}
                toggleRowSelection={toggleRowSelection}
              />
            </div>
          </div>
        ) : (
          <div className="container-fluid">
            <Row>
              <div
                className="d-flex justify-content-between align-items-center"
                style={{ borderRadius: '10px', marginTop: '10px' }}
              >
                <CardTitle className="fw-bolder h5 mx-1">{username}</CardTitle>
                <Button
                  colorScheme="red"
                  rounded="2"
                  onClick={() => setSelectedUserId('')}
                >
                  Back
                </Button>
              </div>
              {getLeaveDetails && getLeaveDetails.length > 0 ? (
                <div className="container mt-4">
                  <div className="row">
                    {/* Left Panel */}
                    <div className="col-md-4">
                      {getLeaveDetails && getLeaveDetails.length > 0 ? (
                        getLeaveDetails.map((card, index) => (
                          <Card
                            key={index}
                            className="shadow p-1 bg-white mb-3"
                          >
                            <CardHeader
                              style={{ color: 'purple' }}
                              className="card-header bg-light"
                            >
                              {card.leave_type}
                              {role_id === 2 && user_role === 'Admin' && (
                                <span style={{ float: 'right' }}>
                                  {editing === index ? (
                                    <>
                                      <button
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          marginLeft: '10px',
                                        }}
                                        onClick={() => handleSave(index)}
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
                                    <>
                                      <button
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                        }}
                                        onClick={() => handleEdit(index)}
                                      >
                                        <i
                                          className="bx bx-edit"
                                          style={{
                                            fontSize: '1.5rem',
                                            color: 'purple',
                                          }}
                                        ></i>
                                      </button>
                                    </>
                                  )}
                                </span>
                              )}
                            </CardHeader>
                            <CardBody>
                              <div className="row">
                                {/* Left Side: Details */}
                                <div className="col-md-6">
                                  {card.details && card.details.length > 0 ? (
                                    card.details.map((detail, detailIndex) => {
                                      const isEditableField = [
                                        'Credited Leaves',
                                        'Applied Leaves',
                                        'Carry Forwards',
                                      ].includes(detail.label);

                                      return (
                                        <div
                                          className="d-flex justify-content-between align-items-center mb-2"
                                          key={detailIndex}
                                        >
                                          <strong>{detail.label}:</strong>
                                          {editing === index &&
                                          isEditableField ? (
                                            <Input
                                              value={
                                                editedDetails.details[
                                                  detailIndex
                                                ]?.value
                                              }
                                              onChange={(e) => {
                                                const floatValue =
                                                  e.target.value;
                                                if (
                                                  /^(\d+(\.\d{0,2})?|)$/.test(
                                                    floatValue,
                                                  )
                                                ) {
                                                  handleChangeDetail(
                                                    e,
                                                    detailIndex,
                                                  );
                                                }
                                              }}
                                              style={{
                                                width: '60px',
                                                textAlign: 'center',
                                                border: 'none',
                                                borderBottom: '1px solid #000',
                                                borderRadius: '0',
                                                outline: 'none',
                                              }}
                                            />
                                          ) : (
                                            <Badge colorScheme="purple">
                                              {detail.value}
                                            </Badge>
                                          )}
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
                        ))
                      ) : (
                        <></>
                      )}
                    </div>
                    <br />

                    {/* Right Panel */}
                    {getAssignedLeaves.length > 0 && (
                      <div className="col-md-8">
                        <div className="card shadow p-1 bg-white">
                          <div className="card-header bg-light">
                            <h5
                              style={{
                                color: 'purple',
                                fontWeight: 'bold',
                              }}
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
              ) : (
                <div className="d-flex justify-content-center">
                  <Empty />
                </div>
              )}
              <LeaveApplyModal
                getLeavesDetails={getLeavesDetails}
                getAssignedLeaves={getAssignedLeaves}
                showForm={showForm}
                setShowForm={setShowForm}
              />
            </Row>
          </div>
        )}
      </div>
      <div>
        <Modal
          isOpen={showForm}
          toggle={() => setShowForm(!showForm)}
          backdrop="static"
          size="lg"
        >
          <ModalHeader className="py-1" toggle={() => setShowForm(!showForm)}>
            Create Rule
          </ModalHeader>
          <ModalBody>
            <Form>
              {newLeaveRule ? (
                <Card>
                  <CardBody>
                    <Label>Name</Label>
                    <Input
                      className="mb-2"
                      value={newLeaveRule.rule_name}
                      onChange={(e) =>
                        setNewLeaveRule((prevState) => ({
                          ...prevState,
                          rule_name: e.target.value,
                        }))
                      }
                    />
                    <Label>Description</Label>
                    <Textarea
                      className="mb-2"
                      value={newLeaveRule.rule_description}
                      onChange={(e) =>
                        setNewLeaveRule((prevState) => ({
                          ...prevState,
                          rule_description: e.target.value,
                        }))
                      }
                    ></Textarea>
                    <Label>Rule Type</Label>
                    <Input
                      type="select"
                      value={newLeaveRule.leave_rule_type_id}
                      onChange={(e) => {
                        console.log(e);
                        setNewLeaveRule((prevState) => ({
                          ...prevState,
                          leave_rule_type_id: e.target.value,
                        }));
                      }}
                    >
                      {leaveRuleTypes.map((rule_type) => (
                        <option value={rule_type.id}>
                          {rule_type.type_name}
                        </option>
                      ))}
                    </Input>
                    <hr></hr>

                    <Row className="mb-4">
                      <Col md="4">
                        <Label>Leaves Count</Label>
                      </Col>
                      <Col md="4">
                        <Label>Leaves Allowed in a Year</Label>
                      </Col>
                      <Col md="4">
                        <Input
                          type="number"
                          min="0"
                          value={newLeaveRule.leaves_allowed_in_a_year}
                          onChange={(e) =>
                            setNewLeaveRule((prevState) => ({
                              ...prevState,
                              leaves_allowed_in_a_year: e.target.value,
                            }))
                          }
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Col md="4"></Col>
                      <Col md="4">
                        <Label>Weekends Between Leave</Label>
                      </Col>
                      <Col md="4">
                        <Input
                          type="checkbox"
                          checked={
                            newLeaveRule.weekends_between_leave === 0
                              ? false
                              : true
                          }
                          onChange={(e) =>
                            setNewLeaveRule((prevState) => ({
                              ...prevState,
                              weekends_between_leave:
                                prevState.weekends_between_leave === 0 ? 1 : 0,
                            }))
                          }
                        />{' '}
                        Count as Leave
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Col md="4"></Col>
                      <Col md="4">
                        <Label>Holidays Between Leave</Label>
                      </Col>
                      <Col md="4">
                        <Input
                          type="checkbox"
                          checked={
                            newLeaveRule.holidays_between_leaves === 0
                              ? false
                              : true
                          }
                          onChange={(e) =>
                            setNewLeaveRule((prevState) => ({
                              ...prevState,
                              holidays_between_leaves:
                                prevState.holidays_between_leaves === 0 ? 1 : 0,
                            }))
                          }
                        />{' '}
                        Count as Leave
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Col md="4"></Col>
                      <Col md="4">
                        <Label>Max. Leaves Allowed in a Month</Label>
                      </Col>
                      <Col md="4">
                        <Input
                          type="number"
                          min="0"
                          max="31"
                          value={newLeaveRule.max_leaves_allowed_in_month}
                          onChange={(e) =>
                            setNewLeaveRule((prevState) => ({
                              ...prevState,
                              max_leaves_allowed_in_month: e.target.value,
                            }))
                          }
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Col md="4"></Col>
                      <Col md="4">
                        <Label>Continuous Leaves Allowed</Label>
                      </Col>
                      <Col md="4">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={newLeaveRule.continuous_leaves_allowed}
                          onChange={(e) =>
                            setNewLeaveRule((prevState) => ({
                              ...prevState,
                              continuous_leaves_allowed: e.target.value,
                            }))
                          }
                        />
                      </Col>
                    </Row>
                    {newLeaveRule.leave_rule_type_id === '1' && <hr />}
                    {newLeaveRule.leave_rule_type_id === '1' && (
                      <Row className="mb-4">
                        <Col md="4">
                          <Label>Accrual</Label>
                        </Col>
                        <Col md="4">Creaditable on Accrual Basis</Col>
                        <Col md="4">
                          <Input
                            type="checkbox"
                            checked={
                              newLeaveRule.is_accrual === 0 ? false : true
                            }
                            onChange={(e) =>
                              setNewLeaveRule((prevState) => ({
                                ...prevState,
                                is_accrual: prevState.is_accrual === 0 ? 1 : 0,
                              }))
                            }
                          />{' '}
                          Enable/Disable
                        </Col>
                      </Row>
                    )}
                    {newLeaveRule.leave_rule_type_id === '1' && (
                      <Row className="mb-4">
                        <Col md="4"></Col>
                        <Col md="4">
                          <Label>Accrual Frequency</Label>
                        </Col>
                        <Col md="4">
                          <Input
                            type="select"
                            disabled={
                              newLeaveRule.is_accrual === 0 ? true : false
                            }
                            value={newLeaveRule.accrual_frequency}
                            onChange={(e) =>
                              setNewLeaveRule((prevState) => ({
                                ...prevState,
                                accrual_frequency: e.target.value,
                              }))
                            }
                          >
                            {' '}
                            <option>Monthly</option>
                            <option>Quarterly</option>{' '}
                          </Input>
                        </Col>
                      </Row>
                    )}
                    {newLeaveRule.leave_rule_type_id === '1' && <hr />}
                    {newLeaveRule.leave_rule_type_id === '1' && (
                      <Row className="mb-4">
                        <Col md="4">
                          <Label>Leave Encash</Label>
                        </Col>
                        <Col md="4">Leave Encash Enabled</Col>
                        <Col md="4">
                          <Input
                            type="checkbox"
                            checked={
                              newLeaveRule.is_leave_encash === 0 ? false : true
                            }
                            onChange={(e) =>
                              setNewLeaveRule((prevState) => ({
                                ...prevState,
                                is_leave_encash:
                                  prevState.is_leave_encash === 0 ? 1 : 0,
                              }))
                            }
                          />
                        </Col>
                      </Row>
                    )}
                    {newLeaveRule.leave_rule_type_id === '1' && (
                      <Row className="mb-4">
                        <Col md="4"></Col>
                        <Col md="4">All Leave Encashable</Col>
                        <Col md="4">
                          <Input
                            type="checkbox"
                            disabled={
                              newLeaveRule.is_leave_encash === 0 ? true : false
                            }
                            checked={
                              newLeaveRule.is_all_leave_encashable === 0
                                ? false
                                : true
                            }
                            onChange={(e) =>
                              setNewLeaveRule((prevState) => ({
                                ...prevState,
                                is_all_leave_encashable:
                                  prevState.is_all_leave_encashable === 0
                                    ? 1
                                    : 0,
                              }))
                            }
                          />
                        </Col>
                      </Row>
                    )}
                    {newLeaveRule.leave_rule_type_id === '1' && (
                      <Row className="mb-4">
                        <Col md="4"></Col>
                        <Col md="4">Max. Leaves Encashable</Col>
                        <Col md="4">
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            disabled={
                              newLeaveRule.is_leave_encash === 0
                                ? true
                                : newLeaveRule.is_all_leave_encashable === 1
                                ? true
                                : false
                            }
                            value={newLeaveRule.max_leaves_encashable}
                            onChange={(e) =>
                              setNewLeaveRule((prevState) => ({
                                ...prevState,
                                max_leaves_encashable: e.target.value,
                              }))
                            }
                          />
                        </Col>
                      </Row>
                    )}
                    {newLeaveRule.leave_rule_type_id === '1' && <hr />}
                    {newLeaveRule.leave_rule_type_id === '1' && (
                      <Row className="mb-4">
                        <Col md="4">
                          <Label>Carry Forward</Label>
                        </Col>
                        <Col md="4">Carry Forward Enabled</Col>
                        <Col md="4">
                          <Input
                            type="checkbox"
                            checked={
                              newLeaveRule.is_carry_forward === 0 ? false : true
                            }
                            onChange={(e) =>
                              setNewLeaveRule((prevState) => ({
                                ...prevState,
                                is_carry_forward:
                                  prevState.is_carry_forward === 0 ? 1 : 0,
                              }))
                            }
                          />
                        </Col>
                      </Row>
                    )}
                    {newLeaveRule.leave_rule_type_id === '1' && (
                      <Row className="mb-4">
                        <Col md="4">
                          <Label></Label>
                        </Col>
                        <Col md="4">All Remaining Leaves</Col>
                        <Col md="4">
                          <Input
                            type="checkbox"
                            disabled={
                              newLeaveRule.is_carry_forward === 0 ? true : false
                            }
                            checked={
                              newLeaveRule.is_carry_all_remaining_leaves === 0
                                ? false
                                : true
                            }
                            onChange={(e) =>
                              setNewLeaveRule((prevState) => ({
                                ...prevState,
                                is_carry_all_remaining_leaves:
                                  prevState.is_carry_all_remaining_leaves === 0
                                    ? 1
                                    : 0,
                              }))
                            }
                          />
                        </Col>
                      </Row>
                    )}
                    {newLeaveRule.leave_rule_type_id === '1' && (
                      <Row className="mb-4">
                        <Col md="4">
                          <Label></Label>
                        </Col>
                        <Col md="4">Max. Leaves to Carry Forward</Col>
                        <Col md="4">
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            disabled={
                              newLeaveRule.is_carry_forward === 0
                                ? true
                                : newLeaveRule.is_carry_all_remaining_leaves ===
                                  1
                                ? true
                                : false
                            }
                            value={newLeaveRule.max_carry_forward_leaves}
                            onChange={(e) =>
                              setNewLeaveRule((prevState) => ({
                                ...prevState,
                                max_carry_forward_leaves: e.target.value,
                              }))
                            }
                          />
                        </Col>
                      </Row>
                    )}
                    <Row style={{ float: 'right' }}>
                      <Col md="4">
                        <ButtonGroup>
                          <Button
                            colorScheme="red"
                            rounded="2"
                            size="sm"
                            onClick={() => setShowForm(!showForm)}
                          >
                            Cancel
                          </Button>
                          <Button
                            colorScheme="purple"
                            rounded="2"
                            size="sm"
                            onClick={() => submitNewCreateRule()}
                          >
                            Submit
                          </Button>
                        </ButtonGroup>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              ) : (
                <p></p>
              )}
              <div></div>
            </Form>
          </ModalBody>
        </Modal>
        <Modal
          isOpen={isDeleteLeaveRuleModal}
          toggle={() => setIsDeleteLeaveRuleModal(!isDeleteLeaveRuleModal)}
        >
          <ModalHeader>Delete: {selectedLeaveRule?.rule_name} Rule</ModalHeader>
          <ModalBody>
            <Label>
              <b>Are you sure to delete the Leave Rule?</b>
            </Label>
            <p>
              <strong>Note:</strong> The rule will be deleted if assigned to the
              user and from all records from the system.
            </p>
            <Row>
              <Col md="12">
                <Button
                  float="right"
                  className="mx-2"
                  colorScheme="red"
                  onClick={() => onDeleteLeaveRule()}
                >
                  Delete
                </Button>
                <Button
                  float="right"
                  colorScheme="gray"
                  onClick={() =>
                    setIsDeleteLeaveRuleModal(!isDeleteLeaveRuleModal)
                  }
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </ModalBody>
        </Modal>
        <Modal
          isOpen={isAssignModal}
          toggle={() => setIsAssignModal(!isAssignModal)}
        >
          <ModalHeader
            toggle={() => {
              setSelectedAssignedRules([]);
              setRuleEffectiveDate('');
              setIsAssignModal(!isAssignModal);
            }}
          >
            Assign Rules
          </ModalHeader>
          <ModalBody>
            <Label>Select Rules</Label>
            <Select
              options={leaveRules}
              labelField="rule_name"
              valueField="id"
              className="mb-2"
              multi={true}
              values={selectedAssignedRules}
              onChange={(selectedRules) => {
                setSelectedAssignedRules(selectedRules);
              }}
            ></Select>
            <Label>Effective Date</Label>
            <Input
              type="date"
              className="mb-2"
              value={ruleEffectiveDate}
              onChange={(e) => {
                setRuleEffectiveDate(e.target.value);
              }}
            />
            <Row>
              <Col md="12">
                <Button
                  float="right"
                  className="mx-2"
                  rounded="2"
                  colorScheme="purple"
                  onClick={() => {
                    onAssignLeaveRule();
                  }}
                  isDisabled={
                    selectedAssignedRules.length > 0 && ruleEffectiveDate !== ''
                      ? false
                      : true
                  }
                >
                  Add Rule
                </Button>
                <Button
                  float="right"
                  colorScheme="red"
                  rounded="2"
                  onClick={() => {
                    setSelectedAssignedRules([]);
                    setRuleEffectiveDate('');
                    setIsAssignModal(!isAssignModal);
                  }}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </ModalBody>
        </Modal>
        <Modal
          isOpen={isDeleteAssignedLeaveRuleModal}
          toggle={() =>
            setIsDeleteAssignedLeaveRuleModal(!isDeleteAssignedLeaveRuleModal)
          }
          size="md"
        >
          <ModalHeader>Remove Assigned Rule</ModalHeader>
          <ModalBody>
            <Label>Are you sure to remove the rule?</Label>
            <Row>
              <Col md="12">
                <Button
                  float="right"
                  className="mx-2"
                  colorScheme="red"
                  onClick={() => onDeleteAssignedLeaveRule()}
                >
                  Remove
                </Button>
                <Button
                  float="right"
                  colorScheme="gray"
                  onClick={() =>
                    setIsDeleteAssignedLeaveRuleModal(
                      !isDeleteAssignedLeaveRuleModal,
                    )
                  }
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default AssignLeaveRules;
