"use client";

import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
    const [currentTime, setCurrentTime] = useState<string>("");
    const [currentDate, setCurrentDate] = useState<string>("");
    const [isTimeLoaded, setIsTimeLoaded] = useState(false);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            setCurrentTime(`${hours}:${minutes}`);

            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const dayName = days[now.getDay()];
            const monthName = months[now.getMonth()];
            const date = now.getDate();
            setCurrentDate(`${dayName}, ${monthName} ${date}`);

            setIsTimeLoaded(true);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-right">
            <div className="text-6xl font-thin" aria-label="Current Time">
                {isTimeLoaded ? currentTime : "--:--"}
            </div>
            <div className="text-xl font-light">
                {isTimeLoaded ? currentDate : "Loading..."}
            </div>
        </div>
    );
};

export default Clock;
