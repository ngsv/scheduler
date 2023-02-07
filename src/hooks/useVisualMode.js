import { useState } from "react";

export default function useVisualMode(initial) {
  const [mode, setMode] = useState(initial);
  const [history, setHistory] = useState([initial]);

  const transition = (newMode, replace = false) => {
    // If replace is true, remove the last element from the array before pushing the new mode into the array
    if (replace === true) {
      setHistory((prev) => [...prev.slice(0, -1), newMode]);
    } else {
      setHistory((prev) => [...prev, newMode]);
    }
    setMode(newMode);
  };

  const back = () => {
    // > 1 because we don't want to go back on the EMPTY or SHOW modes
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);

      const previousMode = newHistory[newHistory.length - 1];
      setMode(previousMode);
    }
  };

  return { mode, transition, back };
}
