export const DATA_API_CONSTANT = {
  // Authentication
  LOGIN: 'api/auth/login',
  GET_OTP: 'api/auth/getOtp',
  VERIFY_OTP: 'api/auth/verifyOtp',
  REGISTER: 'api/auth/organizationRegister',
  FORGOT_PASSWORD_OTP: 'api/auth/getOtpForgotPassword',
  RESET_PASSWORD: 'api/auth/ResetPassword',
  SIGN_IN_OTP: 'api/auth/getOtpForEmail',
  LIST_ORGANIZATION_USERS: 'api/auth/OrganizationUsers',
    GET_ORGANIZATION_DETAILS_ID: 'api/auth/OrgUserDetailById/',
  UPDATE_USER: 'api/auth/editUser',
  ADD_EMPLOYEE: 'api/auth/CreateUser',
  GET_EMPLOYEE: 'api/auth/getprofiledetails/',
  UPDATE_PROFILE: 'api/auth/updateprofiledetails',
  CLOCK_IN: 'api/attendence/clock-in',
  GET_CLOCKIN: 'api/attendence/getclockin',
  PUT_CLOCKOUT: 'api/attendence/clock-out',
  DAILY_LOGS: 'api/attendence/dailylogs',
  MONTHLY_LOGS: 'api/attendence/monthlylogs',
  ADMIN_DAILY_LOGS: 'api/attendence/orgDailylogs',
  ADMIN_MONTHLY_LOGS: 'api/attendence/adminmonthlLogs',
  ADMIN_USER_TIME_UPDATE: 'api/attendence/users_timeupdate',
  POST_IMAGE: 'api/auth/saveimage',
  UPLOAD_DOCUMENTS: 'api/auth/uploadDocs',
  GET_DOCUMENTS: 'api/auth/getdocuments/',
  GET_DOCUMENTS_FOR_ADMIN: 'api/auth/getdocumentsadmin/',
  POST_COMPANY_OVERVIEW: 'api/company/update_companyoverview',
  GET_COMPANY_OVERVIEW: 'api/company/getcompanyoverview',
  PUT_STATUTORY: 'api/company/companyStatutory',
  POST_DEPARTMENT: 'api/company/add_department',
  GET_PROFILE_IMAGE: 'api/auth/getimage/',
  GET_DESIGNATIONS: 'api/company/getorg_designations',
  GET_DEPARTMENT: 'api/company/getorg_departments',
  DELETE_DEPARTMENT: 'api/company/delete_department',
  UPDATE_DEPARTMENT: 'api/company/update_department',
  DELETE_DOCS: 'api/auth/deletedocs',
  GET_DROPDOWNS: 'api/company/getdropdowns',
  ADD_DESIGNATION: 'api/company/addDesignations',
  DELETE_DESIGNATION: 'api/company/deletedesignation',
  CREATE_WORKWEEK_RULE: 'api/workweek/create_workrule',
  GET_WORKWEEK_RULE: 'api/workweek/getorgworkweek_rule',
  ASSIGN_WORKWEEK: 'api/workweek/assignwork_week',
  DELETE_WORKWEEK: 'api/workweek/delete_rule',
  LIST_ORGRULES: 'api/workweek/listworkweek_rules',
  ASSIGN_WORKRULE: 'api/workweek/assignwork_week',
  LIST_USERS_RULES: 'api/workweek/getusers_rules',
  GET_ASSIGNED_LEAVES: 'api/leaves/getassigned-leaves',
  APPLY_LEAVE: 'api/leaves/apply-leave',
  GET_EMPLOYEE_LOGS: 'api/leaves/getemployeelogs',
  GET_WORK_WEEK_CALENDER: 'api/workweek/getworkweekcalender/',
  UPDATE_WORK_WEEK_RULES: 'api/workweek/update_workweekrules',
  DELETE_USER_RULE: 'api/workweek/deleteuser_rule',
  GET_USER_WORK_WEEK_CALENDER: 'api/workweek/getuserworkweekrule/',
  GET_LEAVE_DETAILS: 'api/leaves/getleave-details',
  UPDATE_LEAVE_DETAILS: 'api/leaves/update-leavedetails',
  GET_ASSIGNED_USER_LEAVES: 'api/leaves/get-assigned-leave-types/',
  GET_USER_LEAVE_DETAILS: 'api/leaves/get-leave-details/',
  GET_LEAVE_VIEW_DETAILS: 'api/leaves/getleave-view-details',
  DELETE_LEAVE_APPLICATION: 'api/leaves/delete-leave-application',
  VERIFY_DOCUMENT: 'api/auth/verifydocument',
  LOGOUT_USER: 'api/auth/logout',
  GET_USERS_DETAILS: 'api/auth/getUserDetails',
  LEAVE_RECORDS_DATA: 'api/leaves/adminleave-summary',
  UPDATE_USER_STATUS: 'api/auth/updateUserStatus',
  GET_ACTIVE_USERS:'api/auth/Directory/ActiveUsers',

    //Attendance
  GET_ATTENDANCE_ISSUES: 'api/attendence/get-attendance-issues',
  POST_RAISE_REQUEST: 'api/attendence/raise-issue',
  GET_PENDING_REQUESTS: 'api/attendence/get-attendance-pending-issues',
  POST_REQUEST_STATUS: 'api/attendence/approve-raise-issue',
  GET_VIEW_DETAILS:'api/attendence/get-attendance-view',

  //Rules start
  GET_LEAVES_RULES: 'api/leaves/get-leave-rules',
  CREATE_LEAVES_RULES: 'api/leaves/create-new-leave-rule',
  UPDATE_LEAVE_RULE: 'api/leaves/update-leave-rule',
  DELETE_LEAVE_RULE: 'api/leaves/delete-leave-rule/',
  GET_ASSIGNED_RULE_USERS: 'api/leaves/assigned-rule-users',
  ASSIGN_LEAVE_RULE: 'api/leaves/assign-leave-rules',
  DELETE_ASSIGNED_LEAVE_RULE: 'api/leaves/delete-assigned-leave-rule',
  UPDATE_LEAVE_APPLICATION: 'api/leaves/update-leave-application',
  GET_ACCRUAL_HISTORY: 'api/leaves/get-accrual-history/',
  //Rules end

  // Payroll Analytics
  CREATE_PAYROLL_STRUCTURE: 'api/payroll/create-payroll-structure',
  GET_PAYROLE_STRUCTURE: 'api/payroll/get-payroll-structure',
  UPDATE_PAYROLE_STRUCTURE: 'api/payroll/update-payroll-structure',
  DELETE_PAYROLE_STRUCTURE: 'api/payroll/delete-payroll-structure/',
  GET_PAYROLL_STRUCTURE_DETAILS: 'api/payroll/get-payroll-details',
  ASSIGN_PAYROLL_STRUCTURE: 'api/payroll/assign-payroll-structure',
  DELETE_ASSIGNED_PAYROLL_STRUCTURE:
    'api/payroll/remove-assigned-payroll-structure/',
  UPDATE_EMPLOYEE_PAYROLL_DETAILS: 'api/payroll/update-payroll-details',
  GET_ADOC_AND_VARIABLE_DETAILS: 'api/payroll/get-adoc-and-variable-details',
  CREATE_ADOC_AND_VARIABLE: 'api/payroll/create-adoc-and-variable',
  UPDATE_ADOC_AND_VARIABLE: 'api/payroll/update-adoc-and-variable',
  DELETE_ADOC_AND_VARIABLE: 'api/payroll/delete-adoc-and-variable/',
  GET_SALARY_HOLD_USERS: 'api/payroll/get-hold-salary-users',
  HOLD_SALARY_OF_USERS: 'api/payroll/hold-salary',
  RELEASE_SALARY_USERS: 'api/payroll/release-salary/',
  GET_RUNPAYROLL_DETAILS: 'api/payroll/get-run-payroll',
  RUN_PAYOUT: 'api/payroll/create-payout',
  GET_PAYOUT_DETAILS: 'api/payroll/get-payout-details',
  UPDATE_BANK_DETAILS: 'api/payroll/update-bank-details',
  GET_BANK_DETAILS: 'api/payroll/get-bank-details/',
  GENERATE_PAYSLIP: 'api/payroll/generate-payslip',
  UPDATE_PAYOUT_DETAILS: 'api/payroll/update-payout-details',
  GET_PAYSLIP_DETAILS: 'api/payroll/get-payslip-details',
  GET_SALARY_STRUCTURE_DETAILS: 'api/payroll/get-salary-structure-details',
  GET_PAYROLL_OVERVIEW: 'api/payroll/get-payroll-overview',
  GET_PAYROLL_LOGS: 'api/payroll/get-payroll-logs',
  FETCH_PAYROLL_USERDETAILS: 'api/payroll/fetch-usersdetails-for-payroll-logs',
  FETCH_USERS_FOR_PAYSLIP:'api/payroll/fetch-users-for-payslip',
  VIEW_PAYSLIP_DETAILS:'api/payroll/view-payslip-details',
    // Attendence export
   DOWNLOAD_MONTHLY_LOG: 'api/attendence/historical_logs_download',
   DOWNLOAD_DAILY_LOGS:'api/attendence/daily_logs_download',

  //holiday
  ADD_HOLIDAY: 'api/holiday/addholiday',
  LIST_HOLIDAY: 'api/holiday/listholidays',
  DELETE_HOLIDAY: 'api/holiday/deleteholiday',
  UPDATE_HOLIDAY: 'api/holiday/updateholiday',

  // user management
  DELETE_USER: 'api/auth/delete_user',
  APPLY_RESIGNATION: 'api/company/apply_resignation',
  RESIGNED_USERS: 'api/company/resigned_users',
  OFFBOARD_USERS: 'api/company/offboard_users',

  // superadminaccess
  LIST_ORGANIZATIONS: 'api/auth/list-organizations',
  UPDATE_ORGANIZATION: 'api/auth/updateorganization',
  DELETE_ORGANIZATION: 'api/auth/delete-organization',

  // Dashbaord
  UPCOMING_FESTIVALS: 'api/dashboard/upcoming-festivals',
  TODAYS_LEAVE_MEMBERS: 'api/dashboard/today-leave-members',
  BIRTHDAY_LIST: 'api/dashboard/birthday-list',
  WORK_ANNIVERSARY: 'api/dashboard/work-anniversary-list',
  NEW_JOINERS_LIST: 'api/dashboard/new-joiners-list',
  SEND_BIRTHDAY_WISH: 'api/dashboard/send-birthday-mail',
  GET_DAILY_THOUGHTS: 'api/dashboard/daily-thoughts',


  // Task Management
  TASK_MANAGEMENT_LIST_PROJECTS: 'api/Task-Management/admin-projects-details',
  TASK_MANAGEMENT_ADD_PROJECT: 'api/Task-Management/admin-addproject',
  TASK_MANAGEMENT_GET_DEPARTMENTS:
    'api/Task-Management/admin-alldepartmentlist',
  TASK_MANAGEMENT_GET_USERS_BY_DEPARTMENT:
    'api/Task-Management/admin-allemployeelist',
  TASK_MANAGEMENT_DEACTIVATE_PROJECT: 'api/Task-Management/deactivate-project/',

  ADD_TASK_WITHOUT_EPIC: 'api/Task-Management/tasks-add-without-epic',
  GET_CURRENT_SPRINT_TASKDETAILS:
    'api/Task-Management/task-board-details-current-sprint/',
  GET_PROJECT_ASIGNED_EMPLOYEELIST:
    'api/Task-Management/project-assigned-employees/',
  GET_TASK_BOARD_DETAILS: 'api/Task-Management/task-board-details/',
  TASK_UPDATE_STATUS: 'api/Task-Management/tasks-update-status',
  LIST_TASK_BOARD_STATUS: 'api/Task-Management/all-board-status/',
  TASK_UPDATE_TITLE_ASSIGNEE:
    'api/Task-Management/tasks-update-title-or-assignee',
  DELETE_TASK: 'api/Task-Management/delete-task',
  LIST_LABEL: 'api/Task-Management/label-list/',
  CREATE_LABEL: 'api/Task-Management/create-and-update-task-labels',
  SUBTASK_DELETE: 'api/Task-Management/delete-subtask',
  UPDATE_SUBTASK_FIELDS: 'api/Task-Management/subtask-edit',
  DELETE_STATUS_COLUMN: 'api/Task-Management/board-status-delete',
  GET_TASK_BOARD_DEATILS_BY_EPICID:
    'api/Task-Management/task-board-details-by-epic',
  GET_TASK_BOARD_WITHOUT_EPIC:
    'api/Task-Management/task-board-details-without-epic',
  //  UPDATE_LABEL:"api/Task-Management/update-task-labels",
  TASK_EDIT: 'api/Task-Management/tasks-edit',
  GET_TASK_DATA: 'api/Task-Management/tasks-details',
  GET_SPRINT_LIST: 'api/Task-Management/sprint-list/',
  ADD_TASK_COMMENTS: 'api/Task-Management/add-comment',
  GET_TASK_COMMENTS: 'api/Task-Management/get-task-comments',
  ADD_SUBTASK: 'api/Task-Management/subtask-add-under-task',
  GET_SUBTASK_LIST: 'api/Task-Management/subtasks-list-by-task-id',
  UPDATE_SUBTASK: 'api/Task-Management/subtask-update-fields',
  ADD_BOARD_STATUS: 'api/Task-Management/board-status-add',
  UPDATE_BOARD_STATUS_ORDER: 'api/Task-Management/update-board-status-order',

  //Task management-Backlog PAge
  TASK_MGMT_CREATE_SPRINT: 'api/Task-Management/create-sprint',
  TASK_MGMT_START_SPRINT: 'api/Task-Management/start-sprint',
  TASK_MGMT_UPDATE_SPRINT: 'api/Task-Management/update-sprint',
  GET_SPRINT_BACKLOG_DATA: 'api/Task-Management/get-sprint-backlog-data',
  DELETE_SPRINT: 'api/Task-Management/delete-sprint',
  CREATE_TASK_SPRINT: 'api/Task-Management/tasks-add-with-sprintId',
  CREATE_TASK_TO_BACKLOG: 'api/Task-Management/tasks-add-without-epic',
  UPDATE_TASK_FROM_SPRINT: 'api/Task-Management/tasks-update-with-sprintId',
  UPDATE_TASK_FROM_BACKLOG:
    'api/Task-Management/tasks-update-title-or-assignee',
  COMPLETE_SPRINT: 'api/Task-Management/complete-sprint',
  GET_TASK_SUMMARY: 'api/Task-Management/getSprintTaskSummary',
  Task_UPDATE_WITH_SPRINTID: 'api/Task-Management/tasks-update-sprint',
  MOVE_TASK_TO_SPRINT: 'api/Task-Management/tasks-update-sprint',
  GET_PROJECT_ASSIGNEE_LIST: 'api/Task-Management/project-assigned-employees/',
  GET_EPIC_LIST: 'api/Task-Management/epics-list/',
  GET_LABEL_LIST: 'api/Task-Management/label-list/',
  GET_STATUS_LIST: 'api/Task-Management/board-status-list/',
  BACKLOG_PAGE_FILTER: 'api/Task-Management/filter-backlog-tasks',

  TASK_MANAGEMENT_BOARD_FILTER: 'api/Task-Management/board-Filter-details', //post
  BOARD_FILTER_SPRINTS: 'api/Task-Management/sprint-list/', //get
  GET_PROJECT_ASIGNED_EMPLOYEELIST:
    'api/Task-Management/project-assigned-employees/',

  // BOARD_FILTER_ASSIGNEES:'api/Task-Management/project-assigned-employees',  //get
  BOARD_FILTER_LABELS: 'api/Task-Management/label-list/', // get
  BOARD_FILTER_STATUS: 'api/Task-Management/all-board-status/', // post
  BOARD_FILTER_EPICS: 'api/Task-Management/board-epics-list?project_id=', //get

  TASK_MANAGEMENT_EDIT_PROJECT: 'api/Task-Management/admin-Editproject',
  TASK_MANAGEMENT_DELETE_PROJECT: 'api/Task-Management/delete-project/',
  TASK_MANAGEMENT_GET_UNSELECTED_EMPLOYEES:
    'api/Task-Management/admin-get-unselected-employees',
  TASK_MANAGEMENT_UPDATE_PROJECT_DEPARTMENTS:
    'api/Task-Management/admin-update-project-departments',
  TASK_MANAGEMENT_ADD_PROJECT_MEMBERS:
    'api/Task-Management/admin-add-project-members',
  TASK_MANAGEMENT_GET_PROJECT_DETAILS: 'api/Task-Management/project-details/',
  TASK_MANAGEMENT_REMOVE_PROJECT_MEMBERS:
    'api/Task-Management/admin-remove-project-members',
  GET_EPIC: 'api/Task-Management/epics-list',
  GET_SELECTED_PROJECT_ROLE_PERMISSION:
    'api/Task-Management/user-project-role-permissions/',
  GET_ALL_PROJECT_ROLE_PERMISSIONS:
    'api/Task-Management/user-projects-role-permissions/',
  ADD_WORK_ITEM: 'api/Task-Management/workitem-add',
  TAST_MANAGEMENT_ADD_EPIC: 'api/Task-Management/admin-add-epic',

  EXPORT_TASK_DATA: 'api/Task-Management/export-project-data',

 
  //chatbot api
  CHAT_BOT: 'api/chatbot/ask-chatbot',

  TIMELINE_SPRINT_LIST: 'api/Task-Management/get-timeline-sprints',
  TIMELINE_GETEPIC_LIST: 'api/Task-Management/get-epics-by-project',
  TIMELINE_TASK_LIST: 'api/Task-Management/get-epic-tasks-with-sprints',
  UPDATE_TIMELINE_TASKEPIC:'api/Task-Management/change-task-epic',
  UPDATE_EPIC_DETAILS:'api/Task-Management/admin-edit-epic',
  UPDATE_SPRINTS_DETAILS:'api/Task-Management/update-sprint',
  ADD_TASK_WITH_EPIC:'api/Task-Management/tasks-add-with-epic',

   // Features 
  FEATURE_LIST: 'api/auth/getFeatures',
  ADD_FEATURE: 'api/auth/add-feature',
  ASSIGN_FEATURE: 'api/auth/assign-features',
  ASSIGNED_FEATURE_ORG: 'api/auth/getAssignedFeatureOrg',
  DELETE_FEATURE: 'api/auth/delete-feature',
  DELETE_ASSIGNED_FEATURE: 'api/auth/delete-assigned-feature',

   //education api's
  ADD_EDUCATION: 'api/auth/add-education',

  GET_EDUCATION: 'api/auth/education/',

  DOWNLOAD_EDUCATION:'api/auth/education/download/',

  UPDATE_EDUCATION: 'api/auth/update_education',
  
  DELETE_EDUCATION: 'api/auth/delete_education',

  //family api's
  GET_FAMILY_EMERGENCY_CONTACT: 'api/auth/emergency_contact/',

  ADD_FAMILY_EMERGENCY_CONTACT: 'api/auth/add_emergency_contact',

  DELETE_FAMILY_EMERGENCY_CONTACT: 'api/auth/delete_emergency_contact',

  UPDATE_FAMILY_EMERGENCY_CONTACT: 'api/auth/update_emergency_contact',

  //fcm token api's
  SAVE_FCM_TOKEN: 'api/auth/save_fcm_token',
  DELETE_DEVICE_TOKEN: 'api/auth/delete_device_token',

  // announcement api's
  ADD_ANNOUNCEMENT: 'api/announcement/create_announcement',
  GET_ANNOUNCEMENT: 'api/announcement/get_announcement',
  UPDATE_ANNOUNCEMENT: 'api/announcement/update_announcement',
  DELETE_ANNOUNCEMENT: 'api/announcement/delete_announcement',
  DOWNLOAD_ANNOUNCEMENT : '/api/announcement/download_announcment/:announcement_id',

  // Audit Logs apis
  GET_PROFILE_AUDIT_LOGS: 'api/auth/get-profile-audit-logs',

  // Config Module
  GET_ORG_ROLES: 'api/config/getroles',
  CREATE_ORG_ROLE: 'api/config/create-role',
  UPDATE_ORG_ROLE: 'api/config/update-role',
  DELETE_ORG_ROLE: 'api/config/delete-role',

    //Work From Home api's (wfhrequest)
  ADD_WFH_REQUEST: 'api/remote-work/add-Wfh-Request',
  GET_WFH_REQUEST: 'api/remote-work/get_wfh_request',
  UPDATE_WFH_REQUEST: 'api/remote-work/edit_wfh_request',
  DELETE_WFH_REQUEST: 'api/remote-work/remove_wfh_request',
  ADMIN_STATUS_UPDATE: 'api/remote-work/update-wfh-status', // update api for admin side (Approved/ rejected)

// Reporting manager api's
GET_USERS_REPORTING_LIST: 'api/auth/get-users-reporting-list',
GET_MANAGER_LIST: 'api/auth/get-managers-list',
ADD_MANAGER: 'api/auth/add-manager',
ASSIGN_MANAGER: 'api/auth/assign-reporting-manager',
UPDATE_REPORTING_MANAGER: 'api/auth/updateUserReportingManager',
DELETE_REPORTING_MANAGER: 'api/auth/deleteReportingManager/:manager_id',
REMOVE_USER_REPORTING_MANAGER: 'api/auth/removeUserReportingManager'
};
