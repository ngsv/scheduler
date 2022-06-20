export function getAppointmentsForDay(state, day) {

  const appointments = [];

  if (state.days.length > 1) { // Checks if days data is empty
    const obj = state.days.find((days) => days.name === day); // Find object in state.days array who's name matches provided day

    if (obj) { // Checks if the provided day is in the days days data (state.days array)
      for (let i = 0; i < obj.appointments.length; i++) {
        appointments.push(state.appointments[obj.appointments[i]]);
      }
    }
  }

  return appointments;
}
