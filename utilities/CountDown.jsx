import { useEffect, useState } from "react";

export function CountDown(initialSeconds = 60) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const startCountdown = () => {
    setSecondsLeft(initialSeconds);
    setIsActive(true);
  };

  return { secondsLeft, isActive, startCountdown };
}
