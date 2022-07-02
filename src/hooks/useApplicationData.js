import { useState, useEffect, useReducer } from 'react';
import axios from 'axios';

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";

const reducer = (state, action) => {
  switch (action.type) {
    case SET_DAY: {
      return { ...state, day: action.day }
    }
    case SET_APPLICATION_DATA: {
      return { ...state, days: action.days, appointments: action.appointments, interviewers: action.interviewers }
    }
    case SET_INTERVIEW: {
      return { ...state, appointments: action.appointments }
    }
    default:
      throw new Error(`Tried to reduce with unsupported action type: ${action.type}`);
  }
}

export default function useApplicationData() {

  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {}
  });

  const setDay = day => dispatch({ type: SET_DAY, day });


  // Retrieve data from API
  useEffect(() => {
    Promise.all([
      axios.get('/api/days'),
      axios.get('/api/appointments'),
      axios.get('/api/interviewers')
    ]).then((all) => {
      console.log(all);
      dispatch({type: SET_APPLICATION_DATA, days: all[0].data, appointments: all[1].data, interviewers: all[2].data});
    })
  }, []);


  // Updates the number of appointment spots remaining in the DayList
  const updateSpots = (appointmentId, cancel = false) => {
    const interviews = state.appointments;
    const days = state.days;
    let dayUpdate = days.find(day => day.appointments.find(appointmentNum => appointmentNum === appointmentId)); // Finds the appointment id from the appointments array from the days object (/api/days)

    if (interviews[appointmentId].interview === null) {
      dayUpdate.spots = dayUpdate.spots - 1;
    } else if (cancel) {
      dayUpdate.spots = dayUpdate.spots + 1;
    }
  }


  // Makes an HTTP request to book an interview and updates the state
  const bookInterview = (id, interview) => {
    const appointment = { // Replace null with interview object in the interview key of appointments
      ...state.appointments[id],
      interview: { ...interview }
    };
    const appointments = { // Update the appointments list with the newly created interview
      ...state.appointments,
      [id]: appointment
    };

    return axios
      .put(`/api/appointments/${id}`, { interview })
      .then(() => {
        updateSpots(id);
        dispatch({ type: SET_INTERVIEW, appointments });
      })
      .catch(err => console.log(err.message));
  }

  // Makes an HTTP request to delete an interview and updates the state
  const cancelInterview = (id) => {
    const appointment = {
      ...state.appointments[id],
      interview: null
    };
    const appointments = {
      ...state.appointments,
      [id]: appointment
    };

    return axios
      .delete(`/api/appointments/${id}`, appointments[id])
      .then(() => {
        updateSpots(id, true);
        dispatch({ type: SET_INTERVIEW, appointments });
      })
      .catch(err => console.log(err.message));
  }


  return (
    {state, setDay, bookInterview, cancelInterview}
  );
}
