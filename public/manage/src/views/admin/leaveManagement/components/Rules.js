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
import { BulletList } from 'react-content-loader';
import Cookies from 'js-cookie';
import LeaveApplyModal from './LeaveApplyModal';
import { Empty } from 'antd';
import { MdEditSquare } from 'react-icons/md';
import { FaCheckCircle } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';
import LeaveRules from './LeaveRules';
import AssignLeaveRules from './AssignLeaveRules';
import { decryptData } from 'utils/crypto';

const Rules = ({ activeTabMain }) => {
  const role_id = decryptData(Cookies.get('role_id'));
  const [activeTab, setActiveTab] = useState('1');
  const [showForm, setShowForm] = useState(false);
  const [isDeleteLeaveRuleModal, setIsDeleteLeaveRuleModal] = useState(false);
  const [isloading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [assignRules, setAssignRules] = useState([]);
  const [newLeaveRule, setNewLeaveRule] = useState('');

  const [leaveRules, setLeaveRules] = useState([]);
  const [selectedLeaveRule, setSelectedLeaveRule] = useState('');
  const [isAssignModal, setIsAssignModal] = useState(false);
  const [selectedAssignedRules, setSelectedAssignedRules] = useState([]);
  const [ruleEffectiveDate, setRuleEffectiveDate] = useState('');
  const [selectedDeleteAssignIds, setSelectedDeleteAssignIds] = useState({});
  const [isDeleteAssignedLeaveRuleModal, setIsDeleteAssignedLeaveRuleModal] =
    useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [getLeaveDetails, setLeaveDetails] = useState([]);
  const [getAssignedLeaves, setAssignedLeaves] = useState([]);
  const user_role = decryptData(Cookies.get('userRole'));
  const [editing, setEditing] = useState(null);
  const [editedDetails, setEditedDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedLeaveForAccrualHistory, setSelectedLeaveForAccrualHistory] =
    useState([]);
  const [accrualHistory, setAccrualHistory] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [username, setSelectedUserName] = useState('');
  const [leaveRuleTypes, setLeaveRuleTypes] = useState([
    {
      id: 1,
      type_name: 'Earned Leave',
    },
    {
      id: 2,
      type_name: 'Comp Off',
    },
    {
      id: 3,
      type_name: 'Loss Of Pay',
    },
    {
      id: 4,
      type_name: 'Custom',
    },
  ]);

  const onButtonClick = () => {
    setShowForm(true);
  };

  const getLeavesDetails = async () => {
    try {
      const response = await httpInjectorService.getUserLeaveDetails(
        selectedUserId,
      );
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

  useEffect(() => {
    getLeavesDetails();
    getLeaveTypes();
  }, [selectedUserId]);

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

  const createNewLeaveRule = async () => {
    setShowForm(true);
    setNewLeaveRule({
      rule_name:
        'Sample Leave ' +
        (leaveRules.length > 0 ? leaveRules[leaveRules.length - 1].id + 1 : ''),
      rule_description:
        'This is a default description for the Leave Type. You can customise this.',
      leave_rule_type_id: '1',
      leaves_allowed_in_a_year: 0,
      weekends_between_leave: 0,
      holidays_between_leaves: 0,
      is_accrual: 1,
      accrual_frequency: 'Monthly',
      is_leave_encash: 0,
      is_all_leave_encashable: 0,
      is_carry_forward: 0,
      max_carry_forward_leaves: '10',
      max_leaves_allowed_in_month: 31,
      continuous_leaves_allowed: 0,
      max_leaves_encashable: 0,
      is_carry_all_remaining_leaves: 0,
    });
  };

  const getAssignedRuleUsers = async () => {
    setIsLoading(true);
    try {
      const response = await httpInjectorService.getAssignedRuleUsers();
      if (response.status === 'success') {
        setAssignRules(response.data);
        setIsLoading(false);
      } else {
        console.error(
          'Error fetching data:',
          response.message || 'Unknown error',
        );
      }
    } catch (error) {
      console.error('API call failed:', error.message || error);
    }
  };

  const submitNewCreateRule = async () => {
    setIsLoading(true);
    try {
      const response = await httpInjectorService.createNewLeaveRule(
        newLeaveRule,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setNewLeaveRule('');
        setShowForm(!showForm);
        getListLeave();
        setIsLoading(false);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.debug(error);
    }
  };

  const updateLeaveRule = async () => {
    setIsLoading(true);
    try {
      const response = await httpInjectorService.updateLeaveRule(
        selectedLeaveRule,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        getListLeave();
        getAssignedRuleUsers();
        setIsEdit(false);
        setIsLoading(false);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.debug(error);
    }
  };

  const getListLeave = async () => {
    try {
      const response = await httpInjectorService.getLeaveRules();
      if (response.status === 'success') {
        setLeaveRules(response.data);
        if (response.data.length > 0) {
          setSelectedLeaveRule(response.data[0]);
          setIsLoading(false);
        }
      } else {
        setLeaveRules([]);
        setSelectedLeaveRule('');
        console.error(
          'Error fetching data:',
          response.message || 'Unknown error',
        );
      }
    } catch (error) {
      console.error('API call failed:', error.message || error);
    }
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  useEffect(() => {
    if (activeTabMain === '3') {
      getListLeave();
      getAssignedRuleUsers();
    }
  }, [activeTabMain]);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const toggleAllSelection = () => {
    const allUserIds = assignRules.map((item) => item.user_id);

    setSelectedUsers((prevSelectedUsers) => {
      if (allSelected) {
        return [];
      } else {
        return allUserIds;
      }
    });

    setAllSelected((prevAllSelected) => !prevAllSelected);
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
        Cell: ({ row }) => (
          <Checkbox
            colorScheme="purple"
            isChecked={selectedUsers?.includes(row.original.user_id)}
            onChange={() => toggleRowSelection(row.original.user_id)}
          />
        ),
      },
      {
        Header: 'Employee Id',
        accessor: 'employee_id',
      },
      {
        Header: 'Employee Name',
        accessor: 'full_name',
        Cell: ({ row }) => (
          <Label
            style={{ color: 'purple', cursor: 'pointer' }}
            onClick={() => {
              setSelectedUserId(row.original.user_id);
              setSelectedUserName(row.original.full_name);
            }}
          >
            <b>{row.original.full_name}</b>
          </Label>
        ),
      },
      {
        Header: 'Department',
        accessor: 'Department',
      },
      {
        Header: 'Designation',
        accessor: 'Designation',
      },
      {
        Header: 'Rules Applied',
        accessor: 'rules',
        Cell: ({ row }) =>
          row.original.rules.map((rule) =>
            rule.rule_id != null ? (
              <Badge
                colorScheme="purple"
                display="inline-flex"
                alignItems="center"
                borderRadius="md"
                gap={2}
                px={2}
                py={1}
              >
                {rule.rule_name}
                <CloseButton
                  size="sm"
                  onClick={() => {
                    setSelectedDeleteAssignIds({
                      user_id: row.original.user_id,
                      rule_id: rule.rule_id,
                    });
                    setIsDeleteAssignedLeaveRuleModal(
                      !isDeleteAssignedLeaveRuleModal,
                    );
                  }}
                />
              </Badge>
            ) : (
              <></>
            ),
          ),
      },
    ],
    [isDeleteAssignedLeaveRuleModal, selectedUsers, allSelected, assignRules],
  );

  const toggleRowSelection = (id) => {
    setSelectedUsers((prevState) => {
      // Check if the id already exists in the array
      if (prevState.includes(id)) {
        // Remove the id from the array
        return prevState.filter((rowId) => rowId !== id);
      } else {
        // Add the id to the array
        return [...prevState, id];
      }
    });
  };

  const onDeleteLeaveRule = async () => {
    try {
      const response = await httpInjectorService.deleteLeaveRule(
        selectedLeaveRule.id,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        getListLeave();
        setIsDeleteLeaveRuleModal(!isDeleteLeaveRuleModal);
        getAssignedRuleUsers();
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.debug(error);
    }
  };

  const onHandleDeleteRuleModal = () => {
    setIsDeleteLeaveRuleModal(!isDeleteLeaveRuleModal);
  };

  const onAssignLeaveRule = async () => {
    const reqBody = {
      leaveRules: selectedAssignedRules,
      users: selectedUsers,
      effectiveDate: ruleEffectiveDate,
    };
    try {
      const response = await httpInjectorService.assignLeaveRules(reqBody);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        getListLeave();
        getAssignedRuleUsers();
        setIsAssignModal(!isAssignModal);
        setSelectedAssignedRules([]);
        setRuleEffectiveDate('');
        setSelectedUsers([]);
        setAllSelected(false);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setAllSelected(false);
      }
    } catch (error) {
      console.debug(error);
    }
  };

  const onDeleteAssignedLeaveRule = async () => {
    try {
      const response = await httpInjectorService.deleteAssignedLeaveRules(
        selectedDeleteAssignIds,
      );
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        getListLeave();
        getAssignedRuleUsers();
        setIsDeleteAssignedLeaveRuleModal(!isDeleteAssignedLeaveRuleModal);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.debug(error);
    }
  };

  // manage user leaves start
  const getAccrualHistory = async (rule_id) => {
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
      } else {
        setAccrualHistory([]);
        toast.error(response.data.message, {
          position: 'top-right',
          autoClose: 1000,
        });
      }
    } catch (err) {
      setAccrualHistory([]);
      toast.error('Accrual History Not Found', {
        position: 'top-right',
        autoClose: 1000,
      });
    }
  };
  const handleCancel = () => {
    setEditing(null);
    setEditedDetails({});
  };

  const handleEdit = (index) => {
    setEditing(index);
    setEditedDetails({ ...getLeaveDetails[index] });
  };

  const handleChangeDetail = (e, key) => {
    setEditedDetails({
      ...editedDetails,
      details: editedDetails.details.map((detail, index) =>
        index === key ? { ...detail, value: e.target.value } : detail,
      ),
    });
  };

  const handleSave = async (index) => {
    const updatedLeaveDetails = [...getLeaveDetails];
    updatedLeaveDetails[index] = editedDetails;
    const { details, rule_id } = updatedLeaveDetails[index];
    const data = details
      .filter((detail) =>
        ['Credited Leaves', 'Applied Leaves', 'Carry Forwards'].includes(
          detail.label,
        ),
      )
      .reduce((acc, detail) => {
        const key = detail.label.toLowerCase().replace(' ', '_');
        acc[key] = parseFloat(detail.value) || 0;
        return acc;
      }, {});
    data.rule_id = rule_id;
    data.user_id = selectedUserId;
    try {
      const response = await httpInjectorService.updateLeaveDetails(data);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        getLeavesDetails();
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        getLeavesDetails();
      }
    } catch (error) {
      toast.error(error.message, {
        position: 'top-right',
        autoClose: 1000,
      });
      getLeavesDetails();
    }

    setEditing(null);
  };

  const getLeaveTypes = async () => {
    try {
      const response = await httpInjectorService.getUserAssignedLeaves(
        selectedUserId,
      );
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
  // manage user leaves end

  return (
<React.Fragment>
  {isloading ? (
    <div>
      <BulletList />
    </div>
  ) : (
    <div
      className="page-content"
      style={{ borderRadius: '10px', marginTop: '10px' }}
    >
      <div>
        <div className="d-flex justify-content-between align-items-center">
          <Nav tabs className="nav-tabs">
            <NavItem>
              <NavLink
                className={activeTab === '1' ? 'active' : ''}
                onClick={() => {
                  toggleTab('1');
                }}
                style={{
                  color: activeTab === '1' ? 'purple' : 'inherit', // Set purple for active tab
                  textDecoration: 'none', // Optional: Prevent underline
                }}
              >
                Leave Rules
              </NavLink>
            </NavItem>
            {role_id < 3 && (
              <NavItem>
                <NavLink
                  className={activeTab === '2' ? 'active' : ''}
                  onClick={() => {
                    toggleTab('2');
                  }}
                  style={{
                    color: activeTab === '2' ? 'purple' : 'inherit', // Set purple for active tab
                    textDecoration: 'none', // Optional: Prevent underline
                  }}
                >
                  Assign Leave Rules
                </NavLink>
              </NavItem>
            )}
          </Nav>

          {/* Conditionally render the button based on active tab */}
          {activeTab === '1' && role_id < 3 && (
            <Button colorScheme="purple" rounded="2" onClick={createNewLeaveRule}>
              Create Rule
            </Button>
          )}
        </div>

        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <LeaveRules
              leaveRules={leaveRules}
              setSelectedLeaveRule={setSelectedLeaveRule}
              selectedLeaveRule={selectedLeaveRule}
              role_id={role_id}
              onHandleDeleteRuleModal={onHandleDeleteRuleModal}
              isEdit={isEdit}
              setIsEdit={setIsEdit}
              leaveRuleTypes={leaveRuleTypes}
              newLeaveRule={newLeaveRule}
              updateLeaveRule={updateLeaveRule}
            />
          </TabPane>
          <TabPane tabId="2">
            <AssignLeaveRules
              selectedUserId={selectedUserId}
              dropdownOpen={dropdownOpen}
              toggle={toggle}
              isAssignModal={isAssignModal}
              setIsAssignModal={setIsAssignModal}
              selectedUsers={selectedUsers}
              columns={columns}
              assignRules={assignRules}
              toggleRowSelection={toggleRowSelection}
              username={username}
              setSelectedUserId={setSelectedUserId}
              getLeaveDetails={getLeaveDetails}
              role_id={role_id}
              user_role={user_role}
              handleSave={handleSave}
              handleCancel={handleCancel}
              handleEdit={handleEdit}
              editing={editing}
              editedDetails={editedDetails}
              handleChangeDetail={handleChangeDetail}
              getAssignedLeaves={getAssignedLeaves}
              getAccrualHistory={getAccrualHistory}
              setSelectedLeaveForAccrualHistory={setSelectedLeaveForAccrualHistory}
              setAccrualHistory={setAccrualHistory}
              setMappedData={setMappedData}
              accrualHistory={accrualHistory}
              allMonths={allMonths}
              showForm={showForm}
              setShowForm={setShowForm}
              newLeaveRule={newLeaveRule}
              setNewLeaveRule={setNewLeaveRule}
              isDeleteLeaveRuleModal={isDeleteLeaveRuleModal}
              setIsDeleteLeaveRuleModal={setIsDeleteLeaveRuleModal}
              onDeleteLeaveRule={onDeleteLeaveRule}
              setSelectedAssignedRules={setSelectedAssignedRules}
              setRuleEffectiveDate={setRuleEffectiveDate}
              selectedAssignedRules={selectedAssignedRules}
              ruleEffectiveDate={ruleEffectiveDate}
              onAssignLeaveRule={onAssignLeaveRule}
              isDeleteAssignedLeaveRuleModal={isDeleteAssignedLeaveRuleModal}
              submitNewCreateRule={submitNewCreateRule}
              selectedLeaveRule={selectedLeaveRule}
              leaveRules={leaveRules}
              onDeleteAssignedLeaveRule={onDeleteAssignedLeaveRule}
              selectedLeaveForAccrualHistory={selectedLeaveForAccrualHistory}
              mappedData={mappedData}
              getLeavesDetails={getLeavesDetails}
              leaveRuleTypes={leaveRuleTypes}
            />
          </TabPane>
        </TabContent>
      </div>
    </div>
  )}
</React.Fragment>
  );
};

export default Rules;