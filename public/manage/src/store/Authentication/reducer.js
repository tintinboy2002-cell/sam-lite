import { login } from './action';
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  LOGIN_DATA,
  PROFILE_DATA,
  COMPANY_DATA,
  HOLIDAY_DATES,
  FETCH_DailyLogs_FAILURE,
  FETCH_DailyLogs_SUCCESS,
  FETCH_attendence_REQUEST,
  SET_EMPLOYEES_DAILY_LOGS,
  SET_EMPLOYEES_MONTHLY_LOGS,
  SET_USERNAME,
  SET_EMAIL,
  PROJECT_NAME,
  SET_FILTERED_BOARD_DATA,
  SET_TASK_BOARD_DETAILS_DATA,
  SET_TASK_STATUS_COUNT,
  SET_TASK_STATUS_LIST,
  SET_EPICLIST_DATA,
  SET_ASSIGNEE_LIST,
   SET_SPRINT_DATA,
  SET_BACKLOG_DATA,
  SET_LABEL_LIST
} from './actionTypes';

const INIT_STATE = {
  data: {},
  isLoading: false,
  error: null,
  logindata: [],
  profiledata: [],
  companydata: [],
  holidaydata: [],
  employeesDailylogs: [],
  employeesMonthlyLogs: [],
   username: '',
   email:'',
  projectName: '',
  filteredBoard:[],
  taskBoardDetails:[],
  taskstatuscount:[],
  taskstatuslist:[],
  Epiclist:[],
  assigneelist:[],
    sprintdata: [],
  backlogdata: [],
  labellist: [],
};

const Authentication = (state = INIT_STATE, action) => {
  switch (action.type) {
    case LOGIN_DATA:
      return { ...state, logindata: action.payload, isLoading: false };
    case PROFILE_DATA:
      return { ...state, profiledata: action.payload, isLoading: false };
    case COMPANY_DATA:
      return { ...state, companydata: action.payload, isLoading: false };
    case HOLIDAY_DATES:
      return { ...state, holidaydata: action.payload, isLoading: false };
    case FETCH_attendence_REQUEST:
      return { ...state, isLoading: true };
    case FETCH_DailyLogs_SUCCESS:
      return { ...state, data: action.payload, isLoading: false };
    case FETCH_DailyLogs_FAILURE:
      return { ...state, error: action.payload, isLoading: false };
    case SET_EMPLOYEES_DAILY_LOGS:
      return {
        ...state,
        employeesDailylogs: [...action.payload],
        isLoading: false,
      };
    case SET_EMPLOYEES_MONTHLY_LOGS:
      return {
        ...state,
        employeesMonthlyLogs: [...action.payload],
        isLoading: false,
      };
    case SET_USERNAME:
      return { ...state, username: action.payload, isLoading: false };
      case SET_EMAIL:
        return { ...state, email: action.payload , isLoading: false};
 case PROJECT_NAME:
      return { ...state, projectName: action.payload, isLoading: false };
 
    case SET_FILTERED_BOARD_DATA:
      return { ...state, filteredBoard:action.payload, isLoading: false };
      case SET_TASK_BOARD_DETAILS_DATA:
      return { ...state, taskBoardDetails:action.payload, isLoading: false };
      case SET_TASK_STATUS_COUNT:
        return {...state, taskstatuscount:action.payload, isLoading:false};
         case SET_TASK_STATUS_LIST:
          return{...state, taskstatuslist:action.payload, isLoading:false};
          case SET_EPICLIST_DATA:
          return{...state, Epiclist:action.payload, isLoading:false};

     case SET_ASSIGNEE_LIST:
     return{...state, assigneelist:action.payload, isLoading:false};
      case SET_SPRINT_DATA:
      return { ...state, sprintdata: action.payload, isLoading: false };
    case SET_BACKLOG_DATA:
      return { ...state, backlogdata: action.payload, isLoading: false };
        case SET_LABEL_LIST:
      return { ...state, labellist: action.payload, isLoading: false };
    default:
      return state;
  }
};

export default Authentication;
