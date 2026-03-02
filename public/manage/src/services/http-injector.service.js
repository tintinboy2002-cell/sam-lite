// import getapiService from './http-Get.service';
import { DATA_API_CONSTANT } from './constant/api.constant';
import httpGetService from './http-Get.service';
import httpPutService from './http-put.service';
import httpDeleteService from './http-delete.service';
import httpPostService from './http.Post.service';
import httpNewDeleteService from './http-newdelete.service';

const login = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.LOGIN, data);
};

const getOtp = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.GET_OTP, data);
};

const LogOut = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.LOGOUT_USER);
};

const verifyOtp = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.VERIFY_OTP, data);
};

const Register = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.REGISTER, data);
};

const forgotPasswordOtp = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.FORGOT_PASSWORD_OTP, data);
};

const resetPassword = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.RESET_PASSWORD, data);
};

const listorganizationusers = () => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.LIST_ORGANIZATION_USERS,
  );
};

const getOrganizationDetailsById = (id) => {
  const url = `${DATA_API_CONSTANT.GET_ORGANIZATION_DETAILS_ID}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const updateUser = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_USER, data);
};

const addUser = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADD_EMPLOYEE, data);
};

const getProfiledetails = (id) => {
  const url = `${DATA_API_CONSTANT.GET_EMPLOYEE}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const updateprofiledetails = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_PROFILE, data);
};

const clockin = () => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.CLOCK_IN);
};

const getclockin = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_CLOCKIN);
};

const clockout = () => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.PUT_CLOCKOUT);
};

const dailylogs = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.DAILY_LOGS);
};

const monthlylogs = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.MONTHLY_LOGS, data);
};

const admindailylogs = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.ADMIN_DAILY_LOGS);
};

const adminmonthlylogs = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADMIN_MONTHLY_LOGS, data);
};

const adminuserudpdate = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.ADMIN_USER_TIME_UPDATE,
    data,
  );
};

const getdocuments = (id) => {
  const url = `${DATA_API_CONSTANT.GET_DOCUMENTS}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const getdocumentsForAdmin = (id) => {
  const url = `${DATA_API_CONSTANT.GET_DOCUMENTS_FOR_ADMIN}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const uploadImage = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.POST_IMAGE, data);
};

const UploadDocs = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.UPLOAD_DOCUMENTS, data);
};

const getcompanyoverview = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_COMPANY_OVERVIEW);
};

const postcompanyoverview = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.POST_COMPANY_OVERVIEW, data);
};

const putstatutory = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.PUT_STATUTORY, data);
};

const postdepartment = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.POST_DEPARTMENT, data);
};

const getprofileimage = (id) => {
  const url = `${DATA_API_CONSTANT.GET_PROFILE_IMAGE}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const getdesignation = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_DESIGNATIONS);
};

const getdepartment = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_DEPARTMENT);
};

const deletedepartment = (data) => {
  return httpDeleteService.deleteDataFromAPI(
    DATA_API_CONSTANT.DELETE_DEPARTMENT,
    data,
  );
};

const updatedepartment = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_DEPARTMENT, data);
};

const deletedocs = (data) => {
  return httpDeleteService.deleteDataFromAPI(
    DATA_API_CONSTANT.DELETE_DOCS,
    data,
  );
};

const getdropdowns = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_DROPDOWNS);
};

const addDesignation = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADD_DESIGNATION, data);
};

const createworkweekrule = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.CREATE_WORKWEEK_RULE,
    data,
  );
};

const deleteworkweekrule = (id) => {
  return httpDeleteService.deleteDataFromAPI(
    DATA_API_CONSTANT.DELETE_WORKWEEK,
    id,
  );
};

const getworkweekrule = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_WORKWEEK_RULE);
};

const assignwork = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ASSIGN_WORKWEEK, data);
};

const getorgworkrule = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.LIST_ORGRULES);
};

const Assignwork = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ASSIGN_WORKRULE, data);
};

const getUsersandrules = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.LIST_USERS_RULES);
};

const getAssignedLeaveTypes = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_ASSIGNED_LEAVES);
};

const applyLeave = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.APPLY_LEAVE, data);
};

const getEmployeeLogs = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_EMPLOYEE_LOGS);
};

const getworkweekcalender = (id) => {
  const url = `${DATA_API_CONSTANT.GET_WORK_WEEK_CALENDER}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const updateRules = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.UPDATE_WORK_WEEK_RULES,
    data,
  );
};

const deleteUserRule = (data) => {
  return httpDeleteService.deleteDataFromAPI(
    DATA_API_CONSTANT.DELETE_USER_RULE,
    data,
  );
};

const getUserWorkweekRule = (id) => {
  const url = `${DATA_API_CONSTANT.GET_USER_WORK_WEEK_CALENDER}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const getLeaveDetails = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_LEAVE_DETAILS);
};

// Leave Rules start
const getLeaveRules = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_LEAVES_RULES);
};

const createNewLeaveRule = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.CREATE_LEAVES_RULES, data);
};

const updateLeaveRule = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_LEAVE_RULE, data);
};

const deleteLeaveRule = (data) => {
  return httpDeleteService.deleteDataFromAPI(
    DATA_API_CONSTANT.DELETE_LEAVE_RULE + data,
  );
};

const assignLeaveRules = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ASSIGN_LEAVE_RULE, data);
};

const deleteDesignation = (id) => {
  return httpDeleteService.deleteDataFromAPI(
    DATA_API_CONSTANT.DELETE_DESIGNATION,
    id,
  );
};

const deleteAssignedLeaveRules = (data) => {
  return httpDeleteService.deleteDataFromAPI(
    DATA_API_CONSTANT.DELETE_ASSIGNED_LEAVE_RULE,
    data,
  );
};

const getAssignedRuleUsers = () => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.GET_ASSIGNED_RULE_USERS,
  );
};
const addHoliday = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADD_HOLIDAY, data);
};
const getHolidays = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.LIST_HOLIDAY);
};
const deleteHoliday = (id) => {
  return httpDeleteService.deleteDataFromAPI(
    DATA_API_CONSTANT.DELETE_HOLIDAY,
    id,
  );
};

const updateHoliday = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_HOLIDAY, data);
};

const updateLeaveDetails = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_LEAVE_DETAILS, data);
};

const updateLeaveApplication = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.UPDATE_LEAVE_APPLICATION,
    data,
  );
};

const getAccrualHistory = (rule_id) => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.GET_ACCRUAL_HISTORY + rule_id,
  );
};

const getUserLeaveDetails = (user_id) => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.GET_USER_LEAVE_DETAILS + user_id,
  );
};

const getUserAssignedLeaves = (user_id) => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.GET_ASSIGNED_USER_LEAVES + user_id,
  );
};

const getLeaveViewDetails = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.GET_LEAVE_VIEW_DETAILS,
    data,
  );
};

const deleteLeaveApplication = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.DELETE_LEAVE_APPLICATION,
    data,
  );
};

const createPayrollStructure = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.CREATE_PAYROLL_STRUCTURE,
    data,
  );
};

const getPayrollStructure = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_PAYROLE_STRUCTURE);
};

const updatePayrollStructure = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.UPDATE_PAYROLE_STRUCTURE,
    data,
  );
};

const deletePayrollStructure = (id) => {
  const url = `${DATA_API_CONSTANT.DELETE_PAYROLE_STRUCTURE}${id}`;
  return httpDeleteService.deleteDataFromAPI(url);
};

const getPayrollStructureDetails = () => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.GET_PAYROLL_STRUCTURE_DETAILS,
  );
};

const assignPayrollStructure = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.ASSIGN_PAYROLL_STRUCTURE,
    data,
  );
};

const deleteAssignedPayrollStructure = (id) => {
  console.log(id, 'latest id');
  const url = `${DATA_API_CONSTANT.DELETE_ASSIGNED_PAYROLL_STRUCTURE}${id}`;
  return httpDeleteService.deleteDataFromAPI(url);
};

const updateEmployeePayrollDetails = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.UPDATE_EMPLOYEE_PAYROLL_DETAILS,
    data,
  );
};
const deleteUser = (id) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.DELETE_USER, id);
};

const resignation = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.APPLY_RESIGNATION, data);
};

const getResignedUsers = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.RESIGNED_USERS);
};

const offboardUsers = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.OFFBOARD_USERS, data);
};

const getAdocAndVariableDetails = () => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.GET_ADOC_AND_VARIABLE_DETAILS,
  );
};

const createAdocAndVariable = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.CREATE_ADOC_AND_VARIABLE,
    data,
  );
};

const updateAdocAndVariable = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.UPDATE_ADOC_AND_VARIABLE,
    data,
  );
};

const deleteAdocAndVariable = (id) => {
  const url = `${DATA_API_CONSTANT.DELETE_ADOC_AND_VARIABLE}${id}`;
  return httpDeleteService.deleteDataFromAPI(url);
};

const getHoldSalaryUsers = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_SALARY_HOLD_USERS);
};

const holdSalaryOfUser = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.HOLD_SALARY_OF_USERS,
    data,
  );
};

const releaseSalaryUser = (id) => {
  const url = `${DATA_API_CONSTANT.RELEASE_SALARY_USERS}${id}`;
  return httpDeleteService.deleteDataFromAPI(url);
};

const getRunPayrollDetails = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.GET_RUNPAYROLL_DETAILS,
    data,
  );
};

const runPayout = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.RUN_PAYOUT, data);
};

const getPayoutDetails = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.GET_PAYOUT_DETAILS, data);
};

const UpdatebankDetails = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.UPDATE_BANK_DETAILS, data);
};

const getBankDetails = (id) => {
  const url = `${DATA_API_CONSTANT.GET_BANK_DETAILS}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const generatePayslip = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.GENERATE_PAYSLIP, data);
};

const updatePayoutDetails = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_PAYOUT_DETAILS, data);
};

const getPayslipDetails = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.GET_PAYSLIP_DETAILS, data);
};

const listorganization = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.LIST_ORGANIZATIONS);
};

const updateorganization = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_ORGANIZATION, data);
};

const deleteorganization = (Id) => {
  return httpDeleteService.deleteDataFromAPI(
    DATA_API_CONSTANT.DELETE_ORGANIZATION,
    Id,
  );
};

const getSalaryStructureDetails = () => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.GET_SALARY_STRUCTURE_DETAILS,
  );
};

const getPayrollOverview = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.GET_PAYROLL_OVERVIEW,
    data,
  );
};

const verifyDocument = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.VERIFY_DOCUMENT, data);
};

const getPayrollLogs = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.GET_PAYROLL_LOGS, data);
};

const fetchUserDetailsForPayrollLogs = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.FETCH_PAYROLL_USERDETAILS,
    data,
  );
};

const getUsersDetails = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_USERS_DETAILS);
};

const signInwithotp = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.SIGN_IN_OTP, data);
};

const getLeaveRecordsData = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.LEAVE_RECORDS_DATA);
};

const updateUserStatus = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_USER_STATUS, data);
};

// taskmanagement api's

const getProjects = () => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.TASK_MANAGEMENT_LIST_PROJECTS,
  );
};

const addProject = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.TASK_MANAGEMENT_ADD_PROJECT,
    data,
  );
};

const getDepartmentsForTaskManagement = () => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.TASK_MANAGEMENT_GET_DEPARTMENTS,
  );
};

const getUsersByDepartment = (department_Id) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.TASK_MANAGEMENT_GET_USERS_BY_DEPARTMENT,
    department_Id,
  );
};

const AddTaskWithoutEpic = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.ADD_TASK_WITHOUT_EPIC,
    data,
  );
};

const getProjectAssignedEmployeelist = (id) => {
  const url = `${DATA_API_CONSTANT.GET_PROJECT_ASIGNED_EMPLOYEELIST}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const getTaskBoardDetails = (id) => {
  const url = `${DATA_API_CONSTANT.GET_TASK_BOARD_DETAILS}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const taskUpdateStatus = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.TASK_UPDATE_STATUS, data);
};

const ListBoardStatus = (id) => {
  const url = `${DATA_API_CONSTANT.LIST_TASK_BOARD_STATUS}${id}`;
  return httpGetService.getDataFromAPI(url);
  //  return httpPostService.postTOAPI(DATA_API_CONSTANT.LIST_TASK_BOARD_STATUS, id);
};

const TaskUpdateTitleAssignee = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.TASK_UPDATE_TITLE_ASSIGNEE,
    data,
  );
};

const deleteTask = (Id) => {
  return httpDeleteService.deleteDataFromAPI(DATA_API_CONSTANT.DELETE_TASK, Id);
};

const getlabelList = (id) => {
  const url = `${DATA_API_CONSTANT.LIST_LABEL}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const createLabel = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.CREATE_LABEL, data);
};

const updateLabel = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_LABEL, data);
};

const Taskedit = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.TASK_EDIT, data);
};

const gettaskdata = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.GET_TASK_DATA, data);
};

const getsprintList = (Id) => {
  const url = `${DATA_API_CONSTANT.GET_SPRINT_LIST}${Id}`;
  return httpGetService.getDataFromAPI(url);
};

const addComments = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADD_TASK_COMMENTS, data);
};

const gettaskcomments = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.GET_TASK_COMMENTS, data);
};

const addSubtask = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADD_SUBTASK, data);
};

const getsubtaskList = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.GET_SUBTASK_LIST, data);
};

const updateSubtask = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_SUBTASK, data);
};

const addBoardstatus = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADD_BOARD_STATUS, data);
};

const taskCreateSprint = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.TASK_MGMT_CREATE_SPRINT,
    data,
  );
};

const taskStartSprint = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.TASK_MGMT_START_SPRINT,
    data,
  );
};

const taskUpdateSprint = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.TASK_MGMT_UPDATE_SPRINT,
    data,
  );
};

const getSprintBacklogData = (project_id) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.GET_SPRINT_BACKLOG_DATA,
    project_id,
  );
};

const deleteSprint = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.DELETE_SPRINT, data);
};

const addTaskToSprint = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.CREATE_TASK_SPRINT, data);
};

const createTaskToBacklog = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.CREATE_TASK_TO_BACKLOG,
    data,
  );
};

const updateTaskFromSprint = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.UPDATE_TASK_FROM_SPRINT,
    data,
  );
};

const updateTaskFromBacklog = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.UPDATE_TASK_FROM_BACKLOG,
    data,
  );
};

const completeSprint = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.COMPLETE_SPRINT, data);
};

const getSprintTaskSummary = (Id) => {
  const url = `${DATA_API_CONSTANT.GET_TASK_SUMMARY}${Id}`;
  return httpGetService.getDataFromAPI(url);
};

const moveTaskToSprint = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.MOVE_TASK_TO_SPRINT, data);
};

const updateTaskwithSprint = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.Task_UPDATE_WITH_SPRINTID,
    data,
  );
};

const getProjectAssigneeList = (id) => {
  const url = `${DATA_API_CONSTANT.GET_PROJECT_ASSIGNEE_LIST}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const getEpicList = (projectId) => {
  const url = `${DATA_API_CONSTANT.GET_EPIC_LIST}?project_id=${projectId}`;
  return httpGetService.getDataFromAPI(url);
};

const taskManagementDeactivateProject = (id) => {
  const url = `${DATA_API_CONSTANT.TASK_MANAGEMENT_DEACTIVATE_PROJECT}${id}`;
  return httpPutService.putTOAPI(url);
};

const getLabelList = (id) => {
  const url = `${DATA_API_CONSTANT.GET_LABEL_LIST}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const getStatusList = (projectId) => {
  const url = `${DATA_API_CONSTANT.GET_STATUS_LIST}?project_id=${projectId}`;
  return httpGetService.getDataFromAPI(url);
};

const filteringBoardPage = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.TASK_MANAGEMENT_BOARD_FILTER,
    data,
  );
};

const boardFilterSprints = (id) => {
  const url = `${DATA_API_CONSTANT.BOARD_FILTER_SPRINTS}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const boardFilterAssignments = (id) => {
  const url = `${DATA_API_CONSTANT.GET_PROJECT_ASIGNED_EMPLOYEELIST}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const boardFilterLabels = (id) => {
  const url = `${DATA_API_CONSTANT.BOARD_FILTER_LABELS}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const boardFilterStatus = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.BOARD_FILTER_STATUS, data);
};

const boardFilterEpics = (id) => {
  const url = `${DATA_API_CONSTANT.BOARD_FILTER_EPICS}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const taskManagementEditProject = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.TASK_MANAGEMENT_EDIT_PROJECT,
    data,
  );
};

const taskManagementDeleteProject = (id) => {
  const url = `${DATA_API_CONSTANT.TASK_MANAGEMENT_DELETE_PROJECT}${id}`;
  return httpDeleteService.deleteDataFromAPI(url);
};

const taskManagementGetUnselectedEmployees = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.TASK_MANAGEMENT_GET_UNSELECTED_EMPLOYEES,
    data,
  );
};

const updateProjectDepartments = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.TASK_MANAGEMENT_UPDATE_PROJECT_DEPARTMENTS,
    data,
  );
};

const updateProjectTeamMembers = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.TASK_MANAGEMENT_ADD_PROJECT_MEMBERS,
    data,
  );
};
const gettaskDetailsbyEpicId = (Id) => {
  const url = `${DATA_API_CONSTANT.GET_TASK_BOARD_DEATILS_BY_EPICID}${Id}`;
  return httpGetService.getDataFromAPI(url);
};

const gettaskDetailswithoutepic = (Id) => {
  const url = `${DATA_API_CONSTANT.GET_TASK_BOARD_WITHOUT_EPIC}${Id}`;
  return httpGetService.getDataFromAPI(url);
};

const delete_subtask = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.SUBTASK_DELETE, data);
};
const delete_status_column = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.DELETE_STATUS_COLUMN,
    data,
  );
};

const update_subtask_fields = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_SUBTASK_FIELDS, data);
};

const taskManagementGetProjectDetails = (id) => {
  const url = `${DATA_API_CONSTANT.TASK_MANAGEMENT_GET_PROJECT_DETAILS}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const taskManagementRemoveTeamMembers = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.TASK_MANAGEMENT_REMOVE_PROJECT_MEMBERS,
    data,
  );
};

const get_epic = (id) => {
  const url = `${DATA_API_CONSTANT.GET_EPIC}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const getSingleProjectPermission = (id) => {
  const url = `${DATA_API_CONSTANT.GET_SELECTED_PROJECT_ROLE_PERMISSION}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const getALLProjectRolePermissions = (id) => {
  const url = `${DATA_API_CONSTANT.GET_ALL_PROJECT_ROLE_PERMISSIONS}${id}`;
  return httpGetService.getDataFromAPI(url);
};

const addWorkItem = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADD_WORK_ITEM, data);
};

const taskManagementAddEpic = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.TAST_MANAGEMENT_ADD_EPIC,
    data,
  );
};
const updateBoardStatusorder = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.UPDATE_BOARD_STATUS_ORDER,
    data,
  );
};

const filterBacklogTask = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.BACKLOG_PAGE_FILTER, data);
};

const getCurrentSprintTask = (Id) => {
  const url = `${DATA_API_CONSTANT.GET_CURRENT_SPRINT_TASKDETAILS}${Id}`;
  return httpGetService.getDataFromAPI(url);
};

const exportTaskData = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.EXPORT_TASK_DATA, data);
};

const getUpcomingFestivals = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.UPCOMING_FESTIVALS);
};

const getTodaysLeaveMembers = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.TODAYS_LEAVE_MEMBERS);
};

const getBirthDayList = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.BIRTHDAY_LIST);
};

const getWorkAnniversary = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.WORK_ANNIVERSARY);
};

const getNewJoinersList = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.NEW_JOINERS_LIST);
};

const sendBirthDayWish = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.SEND_BIRTHDAY_WISH, data);
};

const getDailyThoughts = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_DAILY_THOUGHTS);
};

const fetchUsersForPayslip = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.FETCH_USERS_FOR_PAYSLIP,
    data,
  );
};

const viewPayslipDetails = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.VIEW_PAYSLIP_DETAILS,
    data,
  );
};

// chatbot logic here
const getChatbotData = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.CHAT_BOT, data);
};

const downloadHistoricalsLog = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.DOWNLOAD_MONTHLY_LOG,
    data,
  );
};

const downloadDailyLogs = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.DOWNLOAD_DAILY_LOGS);
};

const getActiveUsers = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_ACTIVE_USERS);
};

const timeline_Sprintlist = (Id) => {
  const url = `${DATA_API_CONSTANT.TIMELINE_SPRINT_LIST}${Id}`;
  return httpGetService.getDataFromAPI(url);
};

const timeline_Epiclist = (Id) => {
  const url = `${DATA_API_CONSTANT.TIMELINE_GETEPIC_LIST}${Id}`;
  return httpGetService.getDataFromAPI(url);
};

const gettimelinetask = (Id) => {
  const url = `${DATA_API_CONSTANT.TIMELINE_TASK_LIST}${Id}`;
  return httpGetService.getDataFromAPI(url);
};

const UpdateTimelineTaskEpic = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.UPDATE_TIMELINE_TASKEPIC,
    data,
  );
};

const UpdateEpicDetails = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_EPIC_DETAILS, data);
};

const UpdatesprintsDetails = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.UPDATE_SPRINTS_DETAILS,
    data,
  );
};

const addtaskwithEpic = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADD_TASK_WITH_EPIC, data);
};

const getAttendanceissue = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_ATTENDANCE_ISSUES);
};

const submitRaiseRequest = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.POST_RAISE_REQUEST, data);
};

const getPendingRequestUsers = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_PENDING_REQUESTS);
};

const postRequestStatus = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.POST_REQUEST_STATUS, data);
};

const getFeatureList = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.FEATURE_LIST);
};

const addFeature = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADD_FEATURE, data);
};

const assignFeature = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ASSIGN_FEATURE, data);
};

const getAssignedFeatureOrg = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.ASSIGNED_FEATURE_ORG);
};

const deleteFeature = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.DELETE_FEATURE, data);
};

const deleteAssignedFeature = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.DELETE_ASSIGNED_FEATURE,
    data,
  );
};

const aprovalViewDetails = (id) => {
  const url = `${DATA_API_CONSTANT.GET_VIEW_DETAILS}?issue_id=${id}`;
  return httpGetService.getDataFromAPI(url);
};

const addEducationDetails = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADD_EDUCATION, data);
};

const getEducationDetails = (userId) => {
  const url = `${DATA_API_CONSTANT.GET_EDUCATION}${userId}`;
  return httpGetService.getDataFromAPI(url);
};

const downloadEducationFile = (education_id) => {
  const url = `${DATA_API_CONSTANT.DOWNLOAD_EDUCATION}${education_id}`;
  return httpGetService.getDataFromAPI(url, {
    responseType: 'blob',
  });
};

// here data will come from the form of education id and other details
const updateEducationDetails = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_EDUCATION, data);
};

const deleteEducationDetails = (data) => {
  return httpDeleteService.deleteDataFromAPI(
    DATA_API_CONSTANT.DELETE_EDUCATION,
    data,
  );
};
// End of education logic

// family logic here
const getFamilyContact = (user_id) => {
  const url = `${DATA_API_CONSTANT.GET_FAMILY_EMERGENCY_CONTACT}${user_id}`;
  return httpGetService.getDataFromAPI(url);
};

const addFamilyContact = (data) => {
  return httpPostService.postTOAPI(
    DATA_API_CONSTANT.ADD_FAMILY_EMERGENCY_CONTACT,
    data,
  );
};

const updateFamilyContact = (data) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.UPDATE_FAMILY_EMERGENCY_CONTACT,
    data,
  );
};

const deleteFamilyContact = (data) => {
  return httpDeleteService.deleteDataFromAPI(
    DATA_API_CONSTANT.DELETE_FAMILY_EMERGENCY_CONTACT,
    data,
  );
};
// End of family logic

// fcm token generation logic
const sendDeviceDetails = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.SAVE_FCM_TOKEN, data);
};

// device token logout
const deviceTokenLogout = (data) => {
  return httpNewDeleteService.deleteDeviceTokenFromAPI(
    DATA_API_CONSTANT.DELETE_DEVICE_TOKEN,
    data,
  );
};

// announcement api's
const getAnnouncement = (data) => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.GET_ANNOUNCEMENT,
    data,
  );
};

const createAnnouncement = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADD_ANNOUNCEMENT, data);
};

const updateAnnouncement = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_ANNOUNCEMENT, data);
};

const deleteAnnouncement = (data) => {
  return httpNewDeleteService.deleteDeviceTokenFromAPI(
    DATA_API_CONSTANT.DELETE_ANNOUNCEMENT,
    data,
  );
};

const downloadAnnouncementFile = (announcement_id) => {
  const url = `${DATA_API_CONSTANT.DOWNLOAD_ANNOUNCEMENT}${announcement_id}`;
  return httpGetService.getDataFromAPI(url, {
    responseType: 'blob',
  });
};

const getProfileAuditLogs = () => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.GET_PROFILE_AUDIT_LOGS,
  );
};

// config Module
const getOrganizationRoles = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_ORG_ROLES);
};

const createOrganizationRole = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.CREATE_ORG_ROLE, data);
};

const updateOrganizationRole = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_ORG_ROLE, data);
};

const deleteOrganizationRole = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.DELETE_ORG_ROLE, data);
};

// Work from home api's START
//WFH POST api
const createWfhRequest = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADD_WFH_REQUEST, data);
};

//WFH GET api
const getWfhRequset = () => {
  return httpGetService.getDataFromAPI(DATA_API_CONSTANT.GET_WFH_REQUEST);
};

//WFH UPDATE api
const updateWfhrequest = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_WFH_REQUEST, data);
};

//WFH DELETE API
const deleteWfhRequest = (id) => {
  return httpDeleteService.deleteDataFromAPI(
    `${DATA_API_CONSTANT.DELETE_WFH_REQUEST}/${id}`,
  );
};

//WFH Update (approved/rejected) api
const updateWfhStatus = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.ADMIN_STATUS_UPDATE, data);
};
// Work from home api's End

// Reporting manager api's
const getUsersReportingList = () => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.GET_USERS_REPORTING_LIST
  );
};

const getManagersList = () => {
  return httpGetService.getDataFromAPI(
    DATA_API_CONSTANT.GET_MANAGER_LIST
  );
};

const addReportingManager = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ADD_MANAGER, data);
}

const assignReportingManager = (data) => {
  return httpPostService.postTOAPI(DATA_API_CONSTANT.ASSIGN_MANAGER, data);
}

const updateReportingManager = (data) => {
  return httpPutService.putTOAPI(DATA_API_CONSTANT.UPDATE_REPORTING_MANAGER, data);
}

const deleteReportingManager = (id) => {
  return httpDeleteService.deleteDataFromAPI(
    `${DATA_API_CONSTANT.DELETE_REPORTING_MANAGER}/${id}`,
  );
};

const removeUserReportingManager = (payload) => {
  return httpPutService.putTOAPI(
    DATA_API_CONSTANT.REMOVE_USER_REPORTING_MANAGER,
    payload
  );
};

// Assign the object to a variable first
const authService = {
  login,
  getOtp,
  verifyOtp,
  Register,
  forgotPasswordOtp,
  resetPassword,
  listorganizationusers,
  getOrganizationDetailsById,
  updateUser,
  addUser,
  getProfiledetails,
  updateprofiledetails,
  clockin,
  getclockin,
  clockout,
  dailylogs,
  monthlylogs,
  admindailylogs,
  adminmonthlylogs,
  adminuserudpdate,
  getdocuments,
  uploadImage,
  UploadDocs,
  getcompanyoverview,
  postcompanyoverview,
  putstatutory,
  postdepartment,
  getprofileimage,
  getdesignation,
  deleteDesignation,
  getdepartment,
  deletedepartment,
  updatedepartment,
  deletedocs,
  getdropdowns,
  addDesignation,
  createworkweekrule,
  deleteworkweekrule,
  getworkweekrule,
  assignwork,
  getorgworkrule,
  Assignwork,
  getUsersandrules,
  getAssignedLeaveTypes,
  applyLeave,
  getEmployeeLogs,
  getworkweekcalender,
  updateRules,
  deleteUserRule,
  getUserWorkweekRule,
  getLeaveDetails,
  getLeaveRules,
  createNewLeaveRule,
  updateLeaveRule,
  deleteLeaveRule,
  assignLeaveRules,
  deleteAssignedLeaveRules,
  getAssignedRuleUsers,
  addHoliday,
  getHolidays,
  deleteHoliday,
  updateHoliday,
  updateLeaveDetails,
  updateLeaveApplication,
  getAccrualHistory,
  getUserLeaveDetails,
  getUserAssignedLeaves,
  getLeaveViewDetails,
  deleteLeaveApplication,
  createPayrollStructure,
  getPayrollStructure,
  updatePayrollStructure,
  deletePayrollStructure,
  getPayrollStructureDetails,
  assignPayrollStructure,
  deleteAssignedPayrollStructure,
  updateEmployeePayrollDetails,
  deleteUser,
  resignation,
  getResignedUsers,
  offboardUsers,
  getAdocAndVariableDetails,
  createAdocAndVariable,
  updateAdocAndVariable,
  deleteAdocAndVariable,
  getHoldSalaryUsers,
  holdSalaryOfUser,
  releaseSalaryUser,
  getRunPayrollDetails,
  runPayout,
  getPayoutDetails,
  UpdatebankDetails,
  getBankDetails,
  generatePayslip,
  updatePayoutDetails,
  getPayslipDetails,
  listorganization,
  updateorganization,
  deleteorganization,
  getSalaryStructureDetails,
  getPayrollOverview,
  getdocumentsForAdmin,
  verifyDocument,
  getPayrollLogs,
  fetchUserDetailsForPayrollLogs,
  LogOut,
  getUsersDetails,
  signInwithotp,
  getLeaveRecordsData,
  updateUserStatus,
  getProjects,
  addProject,
  getDepartmentsForTaskManagement,
  getUsersByDepartment,
  AddTaskWithoutEpic,
  getProjectAssignedEmployeelist,
  getTaskBoardDetails,
  taskUpdateStatus,
  ListBoardStatus,
  TaskUpdateTitleAssignee,
  deleteTask,
  getlabelList,
  createLabel,
  updateLabel,
  Taskedit,
  gettaskdata,
  getsprintList,
  addComments,
  gettaskcomments,
  addSubtask,
  getsubtaskList,
  updateSubtask,
  addBoardstatus,
  taskCreateSprint,
  taskStartSprint,
  taskUpdateSprint,
  getSprintBacklogData,
  deleteSprint,
  addTaskToSprint,
  createTaskToBacklog,
  updateTaskFromSprint,
  updateTaskFromBacklog,
  updateTaskwithSprint,
  taskManagementDeactivateProject,
  completeSprint,
  getSprintTaskSummary,
  moveTaskToSprint,
  getProjectAssigneeList,
  getEpicList,
  getLabelList,
  getStatusList,
  filteringBoardPage,
  boardFilterSprints,
  boardFilterAssignments,
  boardFilterLabels,
  boardFilterStatus,
  boardFilterEpics,
  taskManagementEditProject,
  taskManagementDeleteProject,
  taskManagementGetUnselectedEmployees,
  updateProjectDepartments,
  updateProjectTeamMembers,
  gettaskDetailsbyEpicId,
  gettaskDetailswithoutepic,
  delete_subtask,
  update_subtask_fields,
  delete_status_column,
  taskManagementGetProjectDetails,
  taskManagementRemoveTeamMembers,
  get_epic,
  getALLProjectRolePermissions,
  getSingleProjectPermission,
  addWorkItem,
  taskManagementAddEpic,
  filterBacklogTask,
  updateBoardStatusorder,
  getCurrentSprintTask,
  exportTaskData,
  timeline_Sprintlist,
  timeline_Epiclist,
  gettimelinetask,
  getUpcomingFestivals,
  getTodaysLeaveMembers,
  getBirthDayList,
  getWorkAnniversary,
  getNewJoinersList,
  sendBirthDayWish,
  getDailyThoughts,
  fetchUsersForPayslip,
  viewPayslipDetails,
  getChatbotData,
  downloadHistoricalsLog,
  downloadDailyLogs,
  getActiveUsers,
  timeline_Sprintlist,
  timeline_Epiclist,
  gettimelinetask,
  UpdateTimelineTaskEpic,
  UpdateEpicDetails,
  UpdatesprintsDetails,
  addtaskwithEpic,
  getAttendanceissue,
  submitRaiseRequest,
  getPendingRequestUsers,
  postRequestStatus,
  getFeatureList,
  addFeature,
  assignFeature,
  getAssignedFeatureOrg,
  deleteFeature,
  deleteAssignedFeature,
  aprovalViewDetails,
  updateEducationDetails,
  addFamilyContact,
  deleteEducationDetails,
  updateFamilyContact,
  deleteFamilyContact,
  addEducationDetails,
  getFamilyContact,
  getEducationDetails,
  downloadEducationFile,
  sendDeviceDetails, // fcm token generation function
  deviceTokenLogout, //device token logout
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  downloadAnnouncementFile,
  getProfileAuditLogs,
  getOrganizationRoles,
  createOrganizationRole,
  updateOrganizationRole,
  deleteOrganizationRole,
  createWfhRequest, // wfh request post api
  getWfhRequset, //wfh get api
  updateWfhrequest, // wfh update api
  deleteWfhRequest, // wfh delete api
  updateWfhStatus, // update status(approved/rejected) api

  getUsersReportingList,
  getManagersList,
  addReportingManager,
  assignReportingManager,
  updateReportingManager,
  removeUserReportingManager,
  deleteReportingManager
};

export default authService;
