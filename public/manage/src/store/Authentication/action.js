import httpInjectorService from 'services/http-injector.service';
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  LOGIN_DATA,
  PROFILE_DATA,
  COMPANY_DATA,
  HOLIDAY_DATES,
  FETCH_attendence_REQUEST,
  FETCH_DailyLogs_SUCCESS,
  FETCH_DailyLogs_FAILURE,
  SET_EMPLOYEES_DAILY_LOGS,
  SET_EMPLOYEES_MONTHLY_LOGS,
  SET_USERNAME,
  SET_EMAIL,
  PROJECT_NAME,
  SET_TASK_BOARD_DETAILS_DATA,
  SET_TASK_STATUS_COUNT,
  SET_TASK_STATUS_LIST,
  SET_EPICLIST_DATA,
  SET_ASSIGNEE_LIST,
  SET_BACKLOG_DATA,
  SET_SPRINT_DATA,
  SET_LABEL_LIST
} from './actionTypes';
import { SET_FILTERED_BOARD_DATA } from './actionTypes';
 
 
export const setProjectName = (selectedOption) => ({
  type:PROJECT_NAME,
  payload:selectedOption,
})

export const setLogindata = (selectedOption) => ({
  type: LOGIN_DATA,
  payload: selectedOption,
});

export const setprofiledata = (selectedOption) => ({
  type: PROFILE_DATA,
  payload: selectedOption,
});

export const setcompanydetails = (selectedOption) => ({
  type: COMPANY_DATA,
  payload: selectedOption,
});

export const setholidaydates = (selectedOption) => ({
  type: HOLIDAY_DATES,
  payload: selectedOption,
});

export const setEmployeesDailyLogs = (selectedOption) => ({
  type: SET_EMPLOYEES_DAILY_LOGS,
  payload: selectedOption,
});

export const setEmployeesMonthlyLogs = (selectedOption) => ({
  type: SET_EMPLOYEES_MONTHLY_LOGS,
  payload: selectedOption,
})

// Action creators for setting username and email
export const setUsername = (selectedOption) => ({
  type: SET_USERNAME,
  payload: selectedOption,
})

export const setEmail = (email) => ({
  type: SET_EMAIL,
  payload: email,
});

export const setFilteredBoardData = (payload) => ({
  type: SET_FILTERED_BOARD_DATA,
   payload:payload,
});
 
export const settaskBoardDetails=(selectedoption)=>({
  type:SET_TASK_BOARD_DETAILS_DATA,
   payload:selectedoption,
 
})
export const settaskstatuscount=(selectedoption)=>({
  type:SET_TASK_STATUS_COUNT,
   payload:selectedoption,
 
})
export const setTaskstatuslist=(selectedoption)=>({
  type:SET_TASK_STATUS_LIST,
  payload:selectedoption,
})

export const setEpiclist=(selectOption)=>({
  type:SET_EPICLIST_DATA,
  payload:selectOption
})


export const setassigneelist=(selectedOption)=>({
  type:SET_ASSIGNEE_LIST,
  payload:selectedOption
})

export const setsprintdata=(selectedOption)=>({
  type:SET_SPRINT_DATA,
  payload:selectedOption
})

export const setbacklogdata=(selectedOption)=>({
  type:SET_BACKLOG_DATA,
  payload:selectedOption
})

export const setlabellist=(selectedOption)=>({
  type:SET_LABEL_LIST,
  payload:selectedOption
})

