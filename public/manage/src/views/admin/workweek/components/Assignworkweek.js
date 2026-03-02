import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Input,
  useDisclosure,
  Spinner,
  Box,
  IconButton,
  Select,
} from '@chakra-ui/react';
import { FaTrash, FaSearch } from 'react-icons/fa'; // Import trash icon
import { Card, CardBody } from 'reactstrap';
import { BulletList } from 'react-content-loader';

const AssignWork = ({ getworkweeks, activeTab }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState(''); // Search state
  const [isAnyRuleSelected, setIsAnyRuleSelected] = useState(false); // Track if any rule is selected
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page state
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteRuleOpen,
    onOpen: onDeleteRuleOpen,
    onClose: onDeleteRuleClose,
  } = useDisclosure();
  const [ruleUserId, setRuleUserId] = useState(null);
  const [ruleWorkId, setRuleWorkId] = useState(null);

  const getUsers = async () => {
    setIsLoading(true);
    try {
      const response = await httpInjectorService.getUsersandrules();
      if (response.status === 'success') {
        setUsers(response.data);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.log(err, 'assignwork');
    } finally {
      setIsLoading(false);
    }
  };

  const getorgworkrule = async () => {
    setIsLoading(true);
    try {
      const response = await httpInjectorService.getorgworkrule();
      if (response.status === 'success') {
        setRules(response.data);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserCheckboxChange = (userId) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };

  const handleRuleCheckboxChange = (ruleId) => {
    setSelectedRules((prevSelected) => {
      let updatedSelectedRules;
      if (prevSelected.includes(ruleId)) {
        updatedSelectedRules = prevSelected.filter((id) => id !== ruleId);
      } else {
        updatedSelectedRules = [...prevSelected, ruleId];
      }

      if (updatedSelectedRules.length === 0) {
        setIsAnyRuleSelected(false);
      } else {
        setIsAnyRuleSelected(true);
      }

      return updatedSelectedRules;
    });
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(e.target.value);
  };

  const deleteRuleForUser = async () => {
    try {
      const payload = {
        userId: ruleUserId,
        work_week_rule_id: ruleWorkId,
      };
      const response = await httpInjectorService.deleteUserRule(payload);
      if (response.status === 'success') {
        toast.success('Rule deleted successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === ruleUserId
              ? { ...user, work_week_rule_name: ' ' }
              : user,
          ),
        );
        getUsers();
        setRuleUserId(null);
        setRuleWorkId(null);
        onDeleteClose();
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setRuleUserId(null);
        setRuleWorkId(null);
        onDeleteClose();
      }
    } catch (err) {
      toast.error('Error deleting rule.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setRuleUserId(null);
      setRuleWorkId(null);
      onDeleteClose();
    } finally {
      getworkweeks();
    }
  };

  useEffect(() => {
    if (activeTab === '2') getUsers();
  }, [activeTab]);

  const openModal = () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user to assign work.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } else {
      getorgworkrule();
      onOpen();
    }
  };

  const handleAssignWork = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user to assign work.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    if (selectedRules.length === 0) {
      toast.error('Please select at least one rule to assign work.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a date to assign work.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      const usersObj = selectedUsers.reduce((obj, userId) => {
        obj[userId] = true;
        return obj;
      }, {});

      const payload = {
        usersID: usersObj,
        ruleID: selectedRules,
        date: selectedDate,
      };

      const response = await httpInjectorService.Assignwork(payload);
      if (response.status === 'success') {
        toast.success('Workweek assigned successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        onClose();
        setSelectedUsers([]);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.error('Error while assigning work.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      getUsers();
      getworkweeks();
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allUserIds = filteredUsers.map((user) => user.user_id);
      setSelectedUsers(allUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const filteredUsers = users.filter((user) => {
    const username = user.Name ? user.Name.toLowerCase() : '';
    const employeeId = user.Employee_id ? user.Employee_id.toString() : '';
    const department = user.department_name
      ? user.department_name.toLowerCase()
      : '';
    const designation = user.designations
      ? user.designations.toLowerCase()
      : '';

    return (
      username.includes(searchQuery.toLowerCase()) ||
      employeeId.includes(searchQuery.toLowerCase()) ||
      department.includes(searchQuery.toLowerCase()) ||
      designation.includes(searchQuery.toLowerCase())
    );
  });

  const WorkweekModalOpen = (user_id, work_id) => {
    setRuleUserId(user_id);
    setRuleWorkId(work_id);
    onDeleteOpen();
  };

  return (
    <React.Fragment>
      <Card style={{ margin: '20px' }}>
        <CardBody>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              marginTop: '15px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                style={{ marginLeft: '0px', height: '35px' }}
              >
                <option value={10}>Show 10 </option>
                <option value={20}>Show 20 </option>
                <option value={30}>Show 30 </option>
                <option value={40}>Show 40 </option>
              </Select>

              <label
                htmlFor="search-bar-0"
                className="search-label"
                style={{ width: '100%', position: 'relative' }}
              >
                <i
                  className="bx bx-search-alt search-icon"
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                  }}
                ></i>
                <input
                  onChange={handleSearchChange}
                  id="search-bar-0"
                  type="text"
                  className="form-control"
                  placeholder="Search by Name, Employee ID, Department, Designation"
                  value={searchQuery || ''}
                  style={{
                    paddingRight: '2.5rem',
                    textIndent: '1.5rem',
                    width: '200px',
                    height: '35px',
                    marginLeft: '8px',
                  }}
                />
              </label>
            </div>

            <Button
              onClick={openModal}
              colorScheme="purple"
              style={{
                padding: '10px 20px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Assign Work week
            </Button>
          </div>

          {isLoading ? (
            <Box>
              <BulletList />
            </Box>
          ) : (
            <Table
              variant="simple"
              borderColor="#c0c0c0"
              borderWidth="1px"
              borderStyle="solid"
              style={{ marginTop: '3px' }}
            >
              <Thead backgroundColor="#B58EE4">
                <Tr>
                  <Th border="1px solid #ddd" fontWeight="bold" color="black">
                    <Checkbox
                      isChecked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onChange={handleSelectAll}
                      style={{ marginLeft: '7px' }}
                    />
                  </Th>
                  <Th border="1px solid #ddd" fontWeight="bold" color="black">
                    Username
                  </Th>
                  <Th border="1px solid #ddd" fontWeight="bold" color="black">
                    Employee ID
                  </Th>
                  <Th border="1px solid #ddd" fontWeight="bold" color="black">
                    Designation
                  </Th>
                  <Th border="1px solid #ddd" fontWeight="bold" color="black">
                    Department
                  </Th>
                  <Th border="1px solid #ddd" fontWeight="bold" color="black">
                    Work Week Rule Name
                  </Th>
                  <Th border="1px solid #ddd" fontWeight="bold" color="black">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers?.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <Tr key={index}>
                      <Td
                        border="1px solid #ddd"
                        style={{ marginTop: '1px', marginBottom: '1px' }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.user_id)}
                          onChange={() =>
                            handleUserCheckboxChange(user.user_id)
                          }
                        />
                      </Td>
                      <Td
                        border="1px solid #ddd"
                        color="black"
                        style={{ marginTop: '1px', marginBottom: '1px' }}
                      >
                        {user.Name}
                      </Td>
                      <Td
                        border="1px solid #ddd"
                        color="black"
                        style={{ marginTop: '1px', marginBottom: '1px' }}
                      >
                        {user.Employee_id}
                      </Td>
                      <Td
                        border="1px solid #ddd"
                        color="black"
                        style={{ marginTop: '1px', marginBottom: '1px' }}
                      >
                        {user.designations}
                      </Td>
                      <Td
                        border="1px solid #ddd"
                        color="black"
                        style={{ marginTop: '1px', marginBottom: '1px' }}
                      >
                        {user.department_name}
                      </Td>
                      <Td
                        border="1px solid #ddd"
                        color="black"
                        style={{ marginTop: '1px', marginBottom: '1px' }}
                      >
                        {user.work_week_rule_name || ' '}
                      </Td>
                      <Td
                        border="1px solid #ddd"
                        style={{ marginTop: '1px', marginBottom: '1px' }}
                      >
                        {user.work_week_rule_name && (
                          <IconButton
                            icon={<FaTrash />}
                            onClick={() =>
                              WorkweekModalOpen(
                                user.user_id,
                                user.work_week_configId,
                              )
                            }
                            colorScheme="red"
                            size="sm"
                            aria-label="Delete Rule"
                          />
                        )}
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td
                      colSpan="7"
                      style={{
                        textAlign: 'center',
                        marginTop: '1px',
                        marginBottom: '1px',
                      }}
                    >
                      No users found
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Assign Work</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <div>
                  <h4>Select Work Rules</h4>
                  {isLoading ? (
                    <Box display="flex" justifyContent="center">
                      <Spinner size="lg" />
                    </Box>
                  ) : rules?.length > 0 ? (
                    rules.map((rule) => (
                      <div key={rule.id}>
                        <Checkbox
                          isChecked={selectedRules.includes(rule.id)}
                          onChange={() => handleRuleCheckboxChange(rule.id)}
                          isDisabled={
                            isAnyRuleSelected &&
                            !selectedRules.includes(rule.id)
                          } // Disable if any rule is selected
                        >
                          {rule.work_week_rule_name}
                        </Checkbox>
                      </div>
                    ))
                  ) : (
                    <p>No rules available</p>
                  )}
                </div>

                <div style={{ marginTop: '10px' }}>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    placeholder="Select a date"
                  />
                </div>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="purple" onClick={handleAssignWork}>
                  Assign Work week
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </CardBody>
      </Card>
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this assign workweek?
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDeleteClose} colorScheme="purple" mr={3}>
              No
            </Button>
            <Button colorScheme="red" onClick={deleteRuleForUser}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default AssignWork;
