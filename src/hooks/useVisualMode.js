import { useState } from 'react';

export default function useVisualMode(initial) {
  const [mode, setMode] = useState(initial);
  const [history, setHistory] = useState([initial]);

  const transition = (newMode, replace = false) => { // default parameter syntax
    if (replace === true) {
      let newArray = [...history];
      newArray.pop();
      setHistory([...newArray, newMode]);
    } else {
      setHistory([...history, newMode]);
    }
    setMode(newMode);
  }

  const back = () => {
    let newArray = [...history]; // Temp array with current history
    newArray.pop(); // Remove the last element of history
    setHistory([...newArray]);
    if (history.length > 1) {
      setMode(history[history.length-2]);
    }
  }

  return (
    {mode, transition, back}
  );
}
