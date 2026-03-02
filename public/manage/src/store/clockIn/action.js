import {
    CLOCK_IN_SUCCESS,
    CLOCK_OUT_SUCCESS,
    CLOCK_IN_FAILURE,
    CLOCK_OUT_FAILURE
} from './actionTypes';

export const clockInSuccess = (data) => ({
    type: CLOCK_IN_SUCCESS,
    payload: data,
});

export const clockInFailure = (error) => ({
    type: CLOCK_IN_FAILURE,
    payload: error,
});

export const clockOutSuccess = (data) => ({
    type: CLOCK_OUT_SUCCESS,
    payload: data,
});
export const clockOutFailure = (error) => ({
    type: CLOCK_OUT_FAILURE,
    payload: error,
});