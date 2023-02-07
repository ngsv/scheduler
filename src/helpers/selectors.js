// Get all the appointments for a provided day
export function getAppointmentsForDay(state, day) {
  const appointments = [];

  if (state.days.length > 1) {
    // Checks if days data is empty
    const obj = state.days.find((days) => days.name === day); // Find object in state.days array who's name matches provided day

    if (obj) {
      // Checks if the provided day is in the days data (state.days array)
      for (let i = 0; i < obj.appointments.length; i++) {
        // Creates an array of all the appointments of the provided day
        appointments.push(state.appointments[obj.appointments[i]]);
      }
    }
  }
  return appointments;
}

// Get all the interviewers available for a provided day
export function getInterviewersForDay(state, day) {
  const interviewers = [];

  if (state.days.length > 1) {
    // Checks if days data is empty
    const obj = state.days.find((days) => days.name === day); // Find object in state.days array who's name matches provided day

    if (obj) {
      // Checks if the provided day is in the days data (state.days array)
      for (let i = 0; i < obj.interviewers.length; i++) {
        // Creates an array of all the available interviewers of the provided day
        interviewers.push(state.interviewers[obj.interviewers[i]]);
      }
    }
  }
  return interviewers;
}

// Get an interview if it exists or return null if it does not exist
export function getInterview(state, interview) {
  if (interview) {
    return {
      student: interview.student,
      interviewer: state.interviewers[interview.interviewer],
    };
  } else {
    return null;
  }
}
