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
  Button,
  ButtonGroup,
  Checkbox,
  CloseButton,
  Heading,
  Text,
  Textarea,
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

const LeaveRules = ({
  leaveRules,
  setSelectedLeaveRule,
  selectedLeaveRule,
  role_id,
  onHandleDeleteRuleModal,
  isEdit,
  setIsEdit,
  leaveRuleTypes,
  newLeaveRule,
  updateLeaveRule,
}) => {
  return (
    <React.Fragment>
      <div
        className="page-content"
        style={{
          borderRadius: '10px',
          marginTop: '20px',
        }}
      >
        <h4>Rule List</h4>
        <hr />
        <Row>
          <Col md="4">
            {leaveRules.length === 0 ? (
              <div className="text-center">
                <Text></Text>
              </div>
            ) : (
              leaveRules.map((rule, index) => (
                <Card
                  className="shadow bg-white hover-card mb-3"
                  key={index}
                  onClick={() => setSelectedLeaveRule(rule)}
                  style={{
                    borderLeft:
                      selectedLeaveRule?.rule_name === rule.rule_name
                        ? '6px solid purple'
                        : '6px solid #666666',
                    cursor: 'pointer',
                  }}
                >
                  <CardBody>
                    <Row>
                      <Col md="8">
                        <h5
                          className="fw-medium"
                          style={{
                            color:
                              selectedLeaveRule?.rule_name === rule.rule_name
                                ? 'purple'
                                : '#666666',
                            fontWeight: 'bold',
                          }}
                        >
                          {rule.rule_name}
                        </h5>
                      </Col>
                      <Col md="4">
                        {role_id < 3 && (
                          <Button
                            float="right"
                            onClick={() => onHandleDeleteRuleModal(rule.id)}
                          >
                            <i className="bx bx-trash"></i>
                          </Button>
                        )}
                      </Col>
                    </Row>
                    <p className="mb-0 text-muted">
                      {rule.total_employees ? rule.total_employees : 'No'}{' '}
                      Employees
                    </p>
                  </CardBody>
                </Card>
              ))
            )}
          </Col>

          <Col md="8">
            {selectedLeaveRule !== '' ? (
              <Card className="shadow bg-white">
                <CardBody>
                  <Row>
                    <Col md="10">
                      <Heading color="purple" size="md">
                        {selectedLeaveRule?.rule_name}
                      </Heading>
                    </Col>
                    <Col md="2">
                      {!isEdit && role_id < 3 && (
                        <Button
                          colorScheme="purple"
                          float="right"
                          onClick={() => setIsEdit(true)}
                        >
                          edit
                        </Button>
                      )}
                    </Col>
                  </Row>

                  <hr />
                  <Label>Name</Label>
                  <Input
                    className="mb-2"
                    value={selectedLeaveRule.rule_name}
                    onChange={(e) =>
                      setSelectedLeaveRule((prevState) => ({
                        ...prevState,
                        rule_name: e.target.value,
                      }))
                    }
                    disabled={!isEdit}
                  />
                  <Label>Description</Label>
                  <Textarea
                    className="mb-2"
                    value={selectedLeaveRule.rule_description}
                    onChange={(e) =>
                      setSelectedLeaveRule((prevState) => ({
                        ...prevState,
                        rule_description: e.target.value,
                      }))
                    }
                    isDisabled={!isEdit}
                  ></Textarea>
                  <Label>Rule Type</Label>
                  <Input
                    type="select"
                    disabled
                    value={selectedLeaveRule.leave_rule_type_id}
                    onChange={(e) => {
                      console.log(e);
                      setSelectedLeaveRule((prevState) => ({
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
                        value={selectedLeaveRule.leaves_allowed_in_a_year}
                        onChange={(e) =>
                          setSelectedLeaveRule((prevState) => ({
                            ...prevState,
                            leaves_allowed_in_a_year: e.target.value,
                          }))
                        }
                        disabled={!isEdit}
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
                          selectedLeaveRule.weekends_between_leave === 0
                            ? false
                            : true
                        }
                        onChange={(e) =>
                          setSelectedLeaveRule((prevState) => ({
                            ...prevState,
                            weekends_between_leave:
                              prevState.weekends_between_leave === 0 ? 1 : 0,
                          }))
                        }
                        disabled={!isEdit}
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
                          selectedLeaveRule.holidays_between_leaves === 0
                            ? false
                            : true
                        }
                        onChange={(e) =>
                          setSelectedLeaveRule((prevState) => ({
                            ...prevState,
                            holidays_between_leaves:
                              prevState.holidays_between_leaves === 0 ? 1 : 0,
                          }))
                        }
                        disabled={!isEdit}
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
                        value={selectedLeaveRule.max_leaves_allowed_in_month}
                        onChange={(e) =>
                          setSelectedLeaveRule((prevState) => ({
                            ...prevState,
                            max_leaves_allowed_in_month: e.target.value,
                          }))
                        }
                        disabled={!isEdit}
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
                        value={selectedLeaveRule.continuous_leaves_allowed}
                        onChange={(e) =>
                          setSelectedLeaveRule((prevState) => ({
                            ...prevState,
                            continuous_leaves_allowed: e.target.value,
                          }))
                        }
                        disabled={!isEdit}
                      />
                    </Col>
                  </Row>
                  {newLeaveRule.leave_rule_type_id === '1' && <hr />}

                  {selectedLeaveRule.leave_rule_type_id?.toString() === '1' && (
                    <Row className="mb-4">
                      <Col md="4">
                        <Label>Accrual</Label>
                      </Col>
                      <Col md="4">Creaditable on Accrual Basis</Col>
                      <Col md="4">
                        <Input
                          type="checkbox"
                          checked={
                            selectedLeaveRule.is_accrual === 0 ? false : true
                          }
                          onChange={(e) =>
                            setSelectedLeaveRule((prevState) => ({
                              ...prevState,
                              is_accrual: prevState.is_accrual === 0 ? 1 : 0,
                            }))
                          }
                          disabled={!isEdit}
                        />{' '}
                        Enable/Disable
                      </Col>
                    </Row>
                  )}
                  {selectedLeaveRule.leave_rule_type_id?.toString() === '1' && (
                    <Row className="mb-4">
                      <Col md="4"></Col>
                      <Col md="4">
                        <Label>Accrual Frequency</Label>
                      </Col>
                      <Col md="4">
                        <Input
                          type="select"
                          disabled={
                            isEdit === true
                              ? selectedLeaveRule.is_accrual === 0
                                ? true
                                : false
                              : true
                          }
                          value={selectedLeaveRule.accrual_frequency}
                          onChange={(e) =>
                            setSelectedLeaveRule((prevState) => ({
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
                  {selectedLeaveRule.leave_rule_type_id?.toString() === '1' && (
                    <Row className="mb-4">
                      <Col md="4">
                        <Label>Leave Encash</Label>
                      </Col>
                      <Col md="4">Leave Encash Enabled</Col>
                      <Col md="4">
                        <Input
                          type="checkbox"
                          checked={
                            selectedLeaveRule.is_leave_encash === 0
                              ? false
                              : true
                          }
                          onChange={(e) =>
                            setSelectedLeaveRule((prevState) => ({
                              ...prevState,
                              is_leave_encash:
                                prevState.is_leave_encash === 0 ? 1 : 0,
                            }))
                          }
                          disabled={!isEdit}
                        />
                      </Col>
                    </Row>
                  )}
                  {selectedLeaveRule.leave_rule_type_id?.toString() === '1' && (
                    <Row className="mb-4">
                      <Col md="4"></Col>
                      <Col md="4">All Leave Encashable</Col>
                      <Col md="4">
                        <Input
                          type="checkbox"
                          disabled={
                            isEdit === true
                              ? selectedLeaveRule.is_leave_encash === 0
                                ? true
                                : false
                              : true
                          }
                          checked={
                            selectedLeaveRule.is_all_leave_encashable === 0
                              ? false
                              : true
                          }
                          onChange={(e) =>
                            setSelectedLeaveRule((prevState) => ({
                              ...prevState,
                              is_all_leave_encashable:
                                prevState.is_all_leave_encashable === 0 ? 1 : 0,
                            }))
                          }
                        />
                      </Col>
                    </Row>
                  )}
                  {selectedLeaveRule.leave_rule_type_id?.toString() === '1' && (
                    <Row className="mb-4">
                      <Col md="4"></Col>
                      <Col md="4">Max. Leaves Encashable</Col>
                      <Col md="4">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          disabled={
                            isEdit === true
                              ? selectedLeaveRule.is_leave_encash === 0
                                ? true
                                : selectedLeaveRule.is_all_leave_encashable ===
                                  1
                                ? true
                                : false
                              : true
                          }
                          value={selectedLeaveRule.max_leaves_encashable}
                          onChange={(e) =>
                            setSelectedLeaveRule((prevState) => ({
                              ...prevState,
                              max_leaves_encashable: e.target.value,
                            }))
                          }
                        />
                      </Col>
                    </Row>
                  )}
                  {newLeaveRule.leave_rule_type_id === '1' && <hr />}
                  {selectedLeaveRule.leave_rule_type_id?.toString() === '1' && (
                    <Row className="mb-4">
                      <Col md="4">
                        <Label>Carry Forward</Label>
                      </Col>
                      <Col md="4">Carry Forward Enabled</Col>
                      <Col md="4">
                        <Input
                          type="checkbox"
                          checked={
                            selectedLeaveRule.is_carry_forward === 0
                              ? false
                              : true
                          }
                          onChange={(e) =>
                            setSelectedLeaveRule((prevState) => ({
                              ...prevState,
                              is_carry_forward:
                                prevState.is_carry_forward === 0 ? 1 : 0,
                            }))
                          }
                          disabled={!isEdit}
                        />
                      </Col>
                    </Row>
                  )}
                  {selectedLeaveRule.leave_rule_type_id?.toString() === '1' && (
                    <Row className="mb-4">
                      <Col md="4">
                        <Label></Label>
                      </Col>
                      <Col md="4">All Remaining Leaves</Col>
                      <Col md="4">
                        <Input
                          type="checkbox"
                          disabled={
                            isEdit === true
                              ? selectedLeaveRule.is_carry_forward === 0
                                ? true
                                : false
                              : true
                          }
                          checked={
                            selectedLeaveRule.is_carry_all_remaining_leaves ===
                            0
                              ? false
                              : true
                          }
                          onChange={(e) =>
                            setSelectedLeaveRule((prevState) => ({
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
                  {selectedLeaveRule.leave_rule_type_id?.toString() === '1' && (
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
                            isEdit === true
                              ? selectedLeaveRule.is_carry_forward === 0
                                ? true
                                : selectedLeaveRule.is_carry_all_remaining_leaves ===
                                  1
                                ? true
                                : false
                              : true
                          }
                          value={selectedLeaveRule.max_carry_forward_leaves}
                          onChange={(e) =>
                            setSelectedLeaveRule((prevState) => ({
                              ...prevState,
                              max_carry_forward_leaves: e.target.value,
                            }))
                          }
                        />
                      </Col>
                    </Row>
                  )}
                  {isEdit && (
                    <Row style={{ float: 'right' }}>
                      <Col md="4">
                        <ButtonGroup>
                          <Button
                            colorScheme="red"
                            onClick={() => setIsEdit(false)}
                            rounded="2"
                          >
                            Cancel
                          </Button>
                          <Button
                            colorScheme="purple"
                            type="submit"
                            onClick={() => updateLeaveRule()}
                            rounded="2"
                          >
                            Save
                          </Button>
                        </ButtonGroup>
                      </Col>
                    </Row>
                  )}
                </CardBody>
              </Card>
            ) : (
              <p></p>
            )}
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
};

export default LeaveRules;
