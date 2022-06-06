import { useState, useEffect } from "react";

export default function Progress() {
  const [time, setTime] = useState(0);
  useEffect(() => {
    setInterval(() => {
      setTime((prev) => prev + 10);
    }, 10);
  }, []);

  return (
    <div className="h-full flex items-center justify-center">
      <div style={{ marginLeft: "10rem", marginRight: "10rem" }}>
        <div className="font-bold text-3xl mb-8">Loading Visualization...</div>
        <div
          className="w-full bg-gray-200 h-5"
        >
          <div
            className="bg-blue-600 h-5"
            style={{ width: `${(time / 3000) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
