import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();
      
      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const formatTimeUnit = (value, unit) => {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-500">{unit}</div>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2 bg-blue-50 p-4 rounded-lg">
      <Clock className="h-5 w-5 text-blue-600" />
      <span className="text-sm font-medium text-blue-600">Time remaining:</span>
      <div className="flex gap-4">
        {formatTimeUnit(timeLeft.days, "Days")}
        {formatTimeUnit(timeLeft.hours, "Hours")}
        {formatTimeUnit(timeLeft.minutes, "Minutes")}
        {formatTimeUnit(timeLeft.seconds, "Seconds")}
      </div>
    </div>
  );
};

export default CountdownTimer; 
