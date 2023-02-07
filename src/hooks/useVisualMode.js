import { useState } from "react";

export default function useVisualMode(initial) {
  const [mode, setMode] = useState(initial);
  const [history, setHistory] = useState([initial]);

  const transition = (newMode, replace = false) => {
    // If replace is true, remove the last element from the array before pushing the new mode into the array
    if (replace === true) {
      let newArray = [...history];
      newArray.pop();
      setHistory([...newArray, newMode]);
    } else {
      setHistory((prev) => [...prev, newMode]);
    }
    setMode(newMode);
  };

  const back = () => {
    let newArray = [...history]; // Temp array with current history
    newArray.pop(); // Remove the last element of history
    setHistory([...newArray]);

    // If there is more than one item in the history array, set the current mode to the one before the last
    if (history.length > 1) {
      setMode(history[history.length - 2]);
    }
  };

  return { mode, transition, back };
}
