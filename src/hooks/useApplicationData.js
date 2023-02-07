import axios from "axios";
import { useEffect, useReducer } from "react";

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";
const SET_SPOTS = "SET_SPOTS";

// const reducer = (state, action) => {
//   switch (action.type) {
//     case SET_DAY: {
//       return { ...state, day: action.day };
//     }
//     case SET_APPLICATION_DATA: {
//       return {
//         ...state,
//         days: action.days,
//         appointments: action.appointments,
//         interviewers: action.interviewers,
//       };
//     }
//     case SET_INTERVIEW: {
//       return { ...state, appointments: action.appointments };
//     }
//     default:
//       throw new Error(
//         `Tried to reduce with unsupported action type: ${action.type}`
//       );
//   }
// };

const reducer = (state, action) => {
  switch (action.type) {
    case SET_DAY: {
      return { ...state, day: action.payload.day };
    }
    case SET_APPLICATION_DATA: {
      return {
        ...state,
        days: action.payload.days,
        appointments: action.payload.appointments,
        interviewers: action.payload.interviewers,
      };
    }
    case SET_INTERVIEW: {
      return { ...state, appointments: action.payload.appointments };
    }
    case SET_SPOTS: {
      return { ...state, days: action.payload.days };
    }
    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
};

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
  });

  const setDay = (day) => dispatch({ type: SET_DAY, payload: { day } });

  // Retrieve data from API and update state
  useEffect(() => {
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers"),
    ]).then((results) => {
      dispatch({
        type: SET_APPLICATION_DATA,
        payload: {
          days: results[0].data,
          appointments: results[1].data,
          interviewers: results[2].data,
        },
      });
    });
  }, []);

  // Updates the number of appointment spots remaining in the DayList
  const updateSpots = (appointmentId, cancel = false) => {
    const interviews = state.appointments;
    const days = state.days;
    // Gets the day object by finding the appointment id from the appointments array from the days object (/api/days)
    let dayUpdate = days.find((day) =>
      day.appointments.find(
        (appointmentNum) => appointmentNum === appointmentId
      )
    );

    // If the interview is initially null, an appointment has been created/edited, so decrease the spots by 1
    if (interviews[appointmentId].interview === null) {
      dayUpdate.spots = dayUpdate.spots - 1;
    } else if (cancel) {
      dayUpdate.spots = dayUpdate.spots + 1;
    }
  };

  // Makes an HTTP request to book an interview and updates the state
  const bookInterview = (id, interview) => {
    const appointment = {
      // Replace null with interview object in the interview key of appointments
      ...state.appointments[id],
      interview: { ...interview },
    };

    const appointments = {
      // Update the appointments list with the newly created interview
      ...state.appointments,
      [id]: appointment,
    };

    // return axios.put(`/api/appointments/${id}`, { interview }).then(() => {
    //   updateSpots(id);
    //   dispatch({ type: SET_INTERVIEW, appointments });
    // });
    return axios.put(`/api/appointments/${id}`, appointment).then(() => {
      updateSpots(id);
      dispatch({ type: SET_INTERVIEW, payload: { appointments } });
    });
  };

  // Makes an HTTP request to delete an interview and updates the state
  const cancelInterview = (id) => {
    const appointment = {
      // Replace the interview object with null
      ...state.appointments[id],
      interview: null,
    };

    const appointments = {
      // Update the appointments list with the deleted interview
      ...state.appointments,
      [id]: appointment,
    };

    return axios.delete(`/api/appointments/${id}`, appointment).then(() => {
      updateSpots(id, true);
      dispatch({ type: SET_INTERVIEW, payload: { appointments } });
    });
  };

  return { state, setDay, bookInterview, cancelInterview };
}
