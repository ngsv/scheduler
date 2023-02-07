import axios from "axios";
import { useEffect, useReducer } from "react";

import { getInterview } from "helpers/selectors";

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";
const SET_SPOTS = "SET_SPOTS";

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

  useEffect(() => {
    const webSocket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    webSocket.onopen = () => {
      webSocket.send("ping");
    };
    // The server will send a message to every connected client when we book or delete an interview
    // This message contains the data needed to create or delete interview records.
    webSocket.onmessage = (event) => {
      console.log(event.data);
      const messageReceived = JSON.parse(event.data);

      if (messageReceived.type === "SET_INTERVIEW") {
        const id = messageReceived.id; // Appointment id (str)

        const days = [...state.days];

        for (let i = 0; i < days.length; i++) {
          if (days[i].appointments.includes(id)) {
            if (
              // Compare current appointments state with message received from server to see if an interview was booked or deleted
              state.appointments[id].interview &&
              messageReceived.interview === null
            ) {
              days[i].spots += 1;
            } else if (
              state.appointments[id].interview === null &&
              messageReceived.interview
            ) {
              days[i].spots -= 1;
            }
          }
        }
        dispatch({ type: SET_SPOTS, payload: { days } });

        // Update appointments
        const appointment = {
          ...state.appointments[id],
          interview: messageReceived.interview,
        };
        const appointments = {
          ...state.appointments,
          [id]: appointment,
        };
        dispatch({ type: SET_INTERVIEW, payload: { appointments } });
      }
    };

    return () => {
      webSocket.close();
    };
  }, [state]);

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
  // const updateSpots = (id, addSpot = false) => {
  //   const edit = getInterview(state, state.appointments[`${id}`].interview); // null if creating an appointment
  //   const days = [...state.days];

  //   for (let i = 0; i < days.length; i++) {
  //     if (days[i].appointments.includes(id)) {
  //       if (addSpot) {
  //         days[i].spots += 1;
  //       } else if (!edit) {
  //         days[i].spots -= 1;
  //       }
  //     }
  //   }
  //   dispatch({ type: SET_SPOTS, payload: { days } });
  // };

  // Makes an HTTP request to book an interview and updates the state
  const bookInterview = (id, interview) => {
    // Replace null with interview object in the interview key of appointments
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview },
    };
    // Update the appointments list with the newly created interview
    const appointments = {
      ...state.appointments,
      [id]: appointment,
    };
    return axios.put(`/api/appointments/${id}`, appointment).then(() => {
      // updateSpots(id);
      // dispatch({ type: SET_INTERVIEW, payload: { appointments } });
    });
  };

  // Makes an HTTP request to delete an interview and updates the state
  const cancelInterview = (id) => {
    // Replace the interview object with null
    const appointment = {
      ...state.appointments[id],
      interview: null,
    };
    // Update the appointments list with the deleted interview
    const appointments = {
      ...state.appointments,
      [id]: appointment,
    };
    return axios.delete(`/api/appointments/${id}`, appointment).then(() => {
      // updateSpots(id, true);
      // dispatch({ type: SET_INTERVIEW, payload: { appointments } });
    });
  };

  return { state, setDay, bookInterview, cancelInterview };
}
