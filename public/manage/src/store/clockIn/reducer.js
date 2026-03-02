import {
    CLOCK_IN_SUCCESS,
    CLOCK_OUT_SUCCESS,
    CLOCK_IN_FAILURE,
    CLOCK_OUT_FAILURE
} from './actionTypes';

const INITIAL_STATE = {
    clockInData: null,
    clockOutData: null,
    error: null,
};

// Reducer function to handle clock-in and clock-out actions
const clockInReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case CLOCK_IN_SUCCESS:
            return {
                ...state,
                clockInData: action.payload,
                error: null,
            };
        case CLOCK_IN_FAILURE:
            return {
                ...state,
                error: action.payload,
            };
        case CLOCK_OUT_SUCCESS:
            return {
                ...state,
                clockOutData: action.payload,
                // Ensure we clear any active clock-in on successful clock-out
                clockInData: null,
                error: null,
            };
        case CLOCK_OUT_FAILURE:
            return {
                ...state,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default clockInReducer;