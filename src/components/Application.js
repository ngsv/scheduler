import React, { useState, useEffect } from "react";
import axios from 'axios';

import DayList from './DayList';
import Appointment from './Appointment/index';

import { getAppointmentsForDay, getInterviewersForDay } from '../helpers/selectors.js';

import useApplicationData from '../hooks/useApplicationData.js';

import "components/Application.scss";


export default function Application(props) {

  // const [state, setState] = useState({
  //   day: "Monday",
  //   days: [],
  //   appointments: {},
  //   interviewers: {}
  // });
  //
  // const setDay = day => setState({ ...state, day });


  // function bookInterview(id, interview) {
  //   const appointment = { // Replace null with interview object in the interview key of appointments
  //     ...state.appointments[id],
  //     interview: { ...interview }
  //   };
  //   const appointments = { // Update the appointments list with the newly created interview
  //     ...state.appointments,
  //     [id]: appointment
  //   };
  //
  //   return axios
  //     .put(`/api/appointments/${id}`, { interview })
  //     .then(() => setState({ ...state, appointments }));
  // }

  // function cancelInterview(id) {
  //   const appointment = {
  //     ...state.appointments[id],
  //     interview: null
  //   };
  //   const appointments = {
  //     ...state.appointments,
  //     [id]: appointment
  //   };
  //
  //   return axios
  //     .delete(`/api/appointments/${id}`, appointments[id])
  //     .then(() => setState({ ...state, appointments }))
  // }

  // useEffect(() => {
  //   Promise.all([
  //     axios.get('/api/days'),
  //     axios.get('/api/appointments'),
  //     axios.get('/api/interviewers')
  //   ]).then((all) => {
  //     console.log(all);
  //     setState(prev => ({ ...prev, days: all[0].data, appointments: all[1].data, interviewers: all[2].data}))
  //   })
  // }, []);

  const {
    state,
    setDay,
    bookInterview,
    cancelInterview
  } = useApplicationData();

  const dailyAppointments = getAppointmentsForDay(state, state.day);
  const dailyInterviewers = getInterviewersForDay(state, state.day);

  const newAppointments = dailyAppointments.map((appointment) => {
    // Passes interviewer name as props (or null if there is no appointment)
    let interviewerName = null;
    if (appointment.interview !== null) {
      const interviewerObj = dailyInterviewers.find(interviewer => interviewer.id === appointment.interview.interviewer);
      interviewerName = interviewerObj.name;
    }

    return (
      <Appointment
        key={appointment.id}
        {...appointment}
        interviewers={dailyInterviewers}
        interviewer={interviewerName}
        bookInterview={bookInterview}
        cancelInterview={cancelInterview}
      />
    );
  })

  return (
    <main className="layout">
      <section className="sidebar">
        <img
          className="sidebar--centered"
          src="images/logo.png"
          alt="Interview Scheduler"
        />
        <hr className="sidebar__separator sidebar--centered" />
        <nav className="sidebar__menu">
        <DayList
          days={state.days}
          value={state.day}
          onChange={setDay}
        />
        </nav>
        <img
          className="sidebar__lhl sidebar--centered"
          src="images/lhl.png"
          alt="Lighthouse Labs"
        />
      </section>
      <section className="schedule">
        {newAppointments}
        <Appointment key="last" time="5pm" />
      </section>
    </main>
  );
}
