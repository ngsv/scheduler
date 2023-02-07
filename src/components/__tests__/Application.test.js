import React from "react";
import axios from "axios";

import {
  render,
  cleanup,
  waitForElement,
  fireEvent,
  getByText,
  getAllByTestId,
  getByAltText,
  getByPlaceholderText,
  queryByText,
  queryByAltText,
  getByDisplayValue,
} from "@testing-library/react";

import Application from "components/Application";

describe("Application", () => {
  afterEach(cleanup);

  it("defaults to Monday and changes the schedule when a new day is selected", async () => {
    const { getByText } = render(<Application />);

    await waitForElement(() => getByText("Monday"));
    fireEvent.click(getByText("Tuesday"));
    expect(getByText("Leopold Silvers")).toBeInTheDocument();
  });

  it("loads data, books an interview and reduces the spots remaining for the first day by 1", async () => {
    // 1. Render the Application
    const { container } = render(<Application />);

    // 2. Wait until the text "Archie Cohen" is displayed
    await waitForElement(() => getByText(container, "Archie Cohen"));

    // 3. Click the "Add" button on the first scheduled appointment
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];
    fireEvent.click(getByAltText(appointment, "Add"));

    // 4. Update the name to "Lydia Miller-Jones" in the input field
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });

    // 5. Click on the first interviewer in the list
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));

    // 6. Click on the "Save" button on that same appointment
    fireEvent.click(getByText(appointment, "Save"));

    // 7. Check that the element with the text "Saving" is displayed
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    // 8. Wait for the element with the text "Lydia Miller-Jones" is displayed
    await waitForElement(() => getByText(appointment, "Lydia Miller-Jones"));

    // 9. Check that the DayListItem with the text "Monday" also has the text "no spots remaining"
    const days = getAllByTestId(container, "day");
    const day = days.find((day) => {
      return queryByText(day, "Monday");
    });

    expect(getByText(day, /no spots remaining/i)).toBeInTheDocument();
  });

  xit("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
    // 1. Render the Application
    const { container } = render(<Application />);

    // 2. Wait until the text "Archie Cohen" is displayed
    await waitForElement(() => getByText(container, "Archie Cohen"));

    // 3. Click the "Delete" button on the first scheduled appointment
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments.find((appointment) => {
      return queryByText(appointment, "Archie Cohen");
    });
    fireEvent.click(queryByAltText(appointment, "Delete"));

    // 4. Check that the confirmation message is shown
    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();

    // 5. Click the "Confirm" button
    fireEvent.click(queryByText(appointment, "Confirm"));

    // 6. Check that the element with the text "Deleting" is displayed
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    // 7. Wait until the element with the "Add" button is displayed
    await waitForElement(() => getByAltText(appointment, "Add"));

    // 8. Check that the DayListItem with the text "Monday" also has the text "2 spots remaining"
    const days = getAllByTestId(container, "day");
    const day = days.find((day) => {
      return queryByText(day, "Monday");
    });

    expect(getByText(day, /2 spots remaining/i)).toBeInTheDocument();
  });

  xit("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
    // 1. Render the Application
    const { container } = render(<Application />);

    // 2. Wait until the text "Archie Cohen" is displayed
    await waitForElement(() => getByText(container, "Archie Cohen"));

    // 3. Click the "Edit" button on the scheduled appointment
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments.find((appointment) => {
      return queryByText(appointment, "Archie Cohen");
    });
    fireEvent.click(queryByAltText(appointment, "Edit"));

    // 4. Update the name to "Lydia Miller-Jones" in the input field
    fireEvent.change(getByDisplayValue(appointment, "Archie Cohen"), {
      target: { value: "Lydia Miller-Jones" },
    });

    // 5. Change to the second interviewer in the list
    fireEvent.click(getByAltText(appointment, "Tori Malcolm"));

    // 6. Click the "Save" button on that same appointment
    fireEvent.click(getByText(appointment, "Save"));

    // 7. Check that the element with the text "Saving" is displayed
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    // 8. Wait for the element with the text "Lydia Miller-Jones" is displayed
    await waitForElement(() => getByText(appointment, "Lydia Miller-Jones"));

    // 9. Check that the DayListItem with the text "Monday" also has the text "1 spot remaining"
    const days = getAllByTestId(container, "day");
    const day = days.find((day) => {
      return queryByText(day, "Monday");
    });

    expect(getByText(day, /1 spot remaining/i)).toBeInTheDocument();
  });

  xit("shows the save error when failing to save an appointment", async () => {
    // 1. Render the Application
    const { container } = render(<Application />);

    // 2. Wait until the text "Archie Cohen" is displayed
    await waitForElement(() => getByText(container, "Archie Cohen"));

    // 3. Click the "Add" button on the first empty appointment
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];
    fireEvent.click(getByAltText(appointment, "Add"));

    // 4. Enter the name "Lydia Miller-Jones" into the input with the placeholder "Enter Student Name"
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });

    // 5. Click the first interviewer in the list
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));

    // 6. Fakes an error saving the appointment
    axios.put.mockRejectedValueOnce();

    // 7. Click the "Save" button on that same appointment
    fireEvent.click(getByText(appointment, "Save"));

    // 8. Check that the element with the text "Saving" is displayed
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    // 9. Wait for the element with the text "Error" is displayed
    await waitForElement(() => getByText(appointment, "Error"));

    // 10. Click the "Close" button
    fireEvent.click(getByAltText(appointment, "Close"));

    // 11. Check that the appointment is still empty and we have returned to the "Show" view
    expect(getByAltText(appointment, "Add"));
  });

  xit("shows the delete error when failing to delete an existing appointment", async () => {
    // 1. Render the Application
    const { container } = render(<Application />);

    // 2. Wait until the text "Archie Cohen" is displayed
    await waitForElement(() => getByText(container, "Archie Cohen"));

    // 3. Click the "Delete" button on the first scheduled appointment
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments.find((appointment) => {
      return queryByText(appointment, "Archie Cohen");
    });
    fireEvent.click(getByAltText(appointment, "Delete"));

    // 4. Check that the confirmation message is shown
    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();

    // 5. Fakes an error deleting the appointment
    axios.delete.mockRejectedValueOnce();

    // 6. Click the "Confirm" button
    fireEvent.click(queryByText(appointment, "Confirm"));

    // 7. Check that the element with the text "Deleting" is displayed
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    // 9. Wait for the element with the text "Error" is displayed
    await waitForElement(() => getByText(appointment, "Error"));

    // 10. Click the "Close" button
    fireEvent.click(getByAltText(appointment, "Close"));

    // 11. Check that the appointment is still booked and we have returned to the "Show" view
    expect(getByText(appointment, "Archie Cohen"));
  });
});
