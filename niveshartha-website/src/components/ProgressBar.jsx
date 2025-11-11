import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ProgressBar = () => {
  const [width, setWidth] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setWidth(25);
    const timer = setTimeout(() => setWidth(70), 400);
    const complete = setTimeout(() => setWidth(100), 600);
    const reset = setTimeout(() => setWidth(0), 900);

    return () => {
      clearTimeout(timer);
      clearTimeout(complete);
      clearTimeout(reset);
    };
  }, [location]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "5px",
        background: "#00BFFF",
        width: `${width}%`,
        transition: "width 0.1s",
        zIndex: 9999,
      }}
    />
  );
};

export default ProgressBar;