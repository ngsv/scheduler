import React from "react";

import DayList from './DayList';
import Appointment from './Appointment/index';

import { getAppointmentsForDay, getInterviewersForDay } from '../helpers/selectors.js';
import useApplicationData from '../hooks/useApplicationData.js';

import "components/Application.scss";


export default function Application(props) {

  // State object
  const {
    state,
    setDay,
    bookInterview,
    cancelInterview
  } = useApplicationData();

  const dailyAppointments = getAppointmentsForDay(state, state.day); // Get all appointments for the provided day
  const dailyInterviewers = getInterviewersForDay(state, state.day); // Get all interviewers available for the provided day

  // Map through all the appointments for the provided day and create Appointment components for each appointment
  const newAppointments = dailyAppointments.map((appointment) => {
    // Get interviewer name (or null if there is no appointment)
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
