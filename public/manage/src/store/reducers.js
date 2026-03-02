import { combineReducers } from "redux";
import Authentication from './Authentication/reducer';
import clockIn from './clockIn/reducer';
// import { thunk } from "redux-thunk";

const appReducer = combineReducers({
    Authentication,
    clockIn, // added clockIn reducer function
})

const rootReducer = (state, action) => {
  // if(action.type === RESET_REDUX) {
  //   state = undefined
  // }
  return appReducer(state, action)
}

export default rootReducer;



