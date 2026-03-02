import React, { useEffect, useState } from 'react';
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Card,
  CardBody,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
} from 'reactstrap';
import {
  Box,
  Flex,
  Button,
  Input,
  Tooltip,
  Tbody,
  Text,
} from '@chakra-ui/react';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BulletList } from 'react-content-loader';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import AssignWork from './Assignworkweek';

const CreateWorkWeek = ({
  togglePopUp,
  popUp,
  formData,
  handleChange,
  errors,
  handleSaveRule,
  savedRules,
  viewRulesCalender,
  deleteworkweek,
  renderRules,
  calendar,
  modall,
  toggle,
  daysOfWeek,
  handleClick,
  updateWorkWeek,
}) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [loading, setLoading] = useState(true);

  const openDeleteModal = (ruleId) => {
    setSelectedRuleId(ruleId);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedRuleId(null);
    setIsDeleteOpen(false);
  };

  const confirmDelete = () => {
    if (selectedRuleId) {
      deleteworkweek(selectedRuleId);
    }
    closeDeleteModal();
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  });

  return (
    <React.Fragment>
      <Card style={{ margin: '20px' }}>
        <CardBody>
          <Row>
            <Col md={12}>
              <Button colorScheme="purple" onClick={togglePopUp}>
                <FontAwesomeIcon icon={faPlus} />
                <span style={{ marginLeft: '5px' }}>Create Rule</span>
              </Button>
            </Col>
          </Row>

          <Modal isOpen={isDeleteOpen} toggle={closeDeleteModal}>
            <ModalHeader toggle={closeDeleteModal}>
              Confirm Deletion
            </ModalHeader>
            <ModalBody>
              Are you sure you want to delete this Work Week Rule?
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="purple" onClick={closeDeleteModal}>
                No
              </Button>
              <Button colorScheme="red" onClick={confirmDelete}>
                Yes
              </Button>
            </ModalFooter>
          </Modal>

          <Modal isOpen={popUp} toggle={togglePopUp} className="custom-modal">
            <ModalHeader style={{ backgroundColor: '#E5DEF7' }}>
              Create Rule
            </ModalHeader>
            <ModalBody>
              <div>
                <label htmlFor="ruleName">Rule Name</label>
                <Input
                  type="text"
                  id="ruleName"
                  name="ruleName"
                  value={formData.ruleName}
                  onChange={handleChange}
                  placeholder="Enter rule name"
                  isInvalid={!!errors.ruleName}
                />
                {errors.ruleName && (
                  <span style={{ color: 'red' }}>{errors.ruleName}</span>
                )}
              </div>
              <div style={{ marginTop: '20px' }}>
                <label htmlFor="description">Description</label>
                <Input
                  type="textarea"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  isInvalid={!!errors.description}
                />
                {errors.description && (
                  <span style={{ color: 'red' }}>{errors.description}</span>
                )}
              </div>
            </ModalBody>

            <ModalFooter style={{ backgroundColor: '#E5DEF7' }}>
              <Button
                colorScheme="purple"
                onClick={handleSaveRule}
                isDisabled={errors.ruleName || errors.description}
              >
                Save
              </Button>
              <Button colorScheme="red" onClick={togglePopUp}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          {/* {/* Display Saved Rules */}
          <Row style={{ marginTop: '20px' }}>
            {savedRules.map((rule, index) => (
              <Col md={4} key={index}>
                {loading ? (
                  <BulletList />
                ) : (
                  <Card
                    style={{
                      marginBottom: '20px',
                      backgroundColor: '#E1D1F4',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // Increased shadow density
                    }}
                    className="shadow p-1 mb-3"
                  >
                    <CardBody>
                      <div style={{ marginBottom: '10px' }}>
                        <label>
                          <strong>Rule Name</strong> {rule.work_week_rule_name}
                        </label>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <label>
                          <strong>Description:</strong> {rule.description}
                        </label>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <label>
                          <strong>Employees:</strong> {rule.user_count}
                        </label>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}
                      >
                        <Button
                          colorScheme="purple"
                          onClick={() => viewRulesCalender(rule.id)}
                          style={{ marginLeft: '10px' }}
                        >
                          Edit
                        </Button>
                        <Tooltip
                          label="Delete work week"
                          aria-label="A tooltip"
                        >
                          <Button
                            colorScheme="red"
                            style={{ marginLeft: '10px' }}
                            onClick={() => openDeleteModal(rule.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </Tooltip>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </Col>
            ))}
          </Row>

          {renderRules && calendar && (
            <Modal
              isOpen={modall}
              toggle={toggle}
              style={{
                maxWidth: '1200px',
                width: '100%',
                height: '1000px',
              }}
            >
              <Row>
                <Col md={12}>
                  <h2 style={{ textAlign: 'center', marginTop: '20px' }}>
                    Rules
                  </h2>
                </Col>
                <Col md={12}>
                  <div>
                    <Table
                      striped
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      <thead>
                        <tr>
                          <th>Week No</th>
                          {daysOfWeek.map((day) => (
                            <th key={day}>{day}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...Array(5)].map((_, week) => (
                          <tr key={week}>
                            <td>{week + 1}</td>
                            {[...Array(7)].map((_, day) => {
                              const index = week * 7 + day;
                              const status = calendar[index]?.is_working;

                              let buttonColor;
                              if (status === 'fullday') {
                                buttonColor = 'green';
                              } else if (status === 'halfday') {
                                buttonColor = 'yellow';
                              } else {
                                buttonColor = 'red';
                              }
                              return (
                                <td
                                  key={index}
                                  style={{ verticalAlign: 'middle' }}
                                >
                                  <button
                                    onClick={() => {
                                      handleClick(index);
                                    }}
                                    style={{
                                      width: '30px',
                                      height: '30px',
                                      display: 'block',
                                      margin: '0 auto',
                                      backgroundColor: buttonColor,
                                    }}
                                  ></button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <Flex justify="center" align="center" mt={4}>
                      <Button
                        colorScheme="purple"
                        onClick={() => {
                          updateWorkWeek(calendar);
                          toggle();
                        }}
                        mr={4}
                      >
                        Save
                      </Button>
                      <Button colorScheme="red" onClick={() => toggle()}>
                        Cancel
                      </Button>
                    </Flex>
                    <Flex
                      align="center"
                      flex="1"
                      justify="flex-start"
                      marginBottom={4}
                    >
                      <Flex align="center" marginLeft={6}>
                        <button
                          style={{
                            backgroundColor: 'green',
                            width: '16px',
                            height: '16px',
                            border: 'none',
                          }}
                        />
                        <span
                          style={{
                            marginLeft: '4px',
                            fontSize: '14px',
                            lineHeight: '16px',
                          }}
                        >
                          Working Day
                        </span>
                      </Flex>
                      <Flex align="center" marginLeft={6}>
                        <button
                          style={{
                            backgroundColor: 'yellow',
                            width: '16px',
                            height: '16px',
                            border: 'none',
                          }}
                        />
                        <span
                          style={{
                            marginLeft: '4px',
                            fontSize: '14px',
                            lineHeight: '16px',
                          }}
                        >
                          Half Day
                        </span>
                      </Flex>
                      <Flex align="center" marginLeft={6}>
                        <button
                          style={{
                            backgroundColor: 'red',
                            width: '16px',
                            height: '16px',
                            border: 'none',
                          }}
                        />
                        <span
                          style={{
                            marginLeft: '4px',
                            fontSize: '14px',
                            lineHeight: '16px',
                          }}
                        >
                          Holiday
                        </span>
                      </Flex>
                    </Flex>
                  </div>
                </Col>
              </Row>
            </Modal>
          )}
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default CreateWorkWeek;
