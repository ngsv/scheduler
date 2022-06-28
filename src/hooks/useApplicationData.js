import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useApplicationData() {

  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {}
  });

  const setDay = day => setState({ ...state, day });


  // Makes an HTTP request to book an interview and updates the state
  function bookInterview(id, interview) {
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
      .then(() => setState({ ...state, appointments }));
  }

  // Makes an HTTP request to delete an interview and updates the state
  function cancelInterview(id) {
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
      .then(() => setState({ ...state, appointments }))
  }

  // Retrieve data from API
  useEffect(() => {
    Promise.all([
      axios.get('/api/days'),
      axios.get('/api/appointments'),
      axios.get('/api/interviewers')
    ]).then((all) => {
      console.log(all);
      setState(prev => ({ ...prev, days: all[0].data, appointments: all[1].data, interviewers: all[2].data}))
    })
  }, []);

  return (
    {state, setDay, bookInterview, cancelInterview}
  );
}
