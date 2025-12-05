import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WeatherData {
    location: string;
    temp: number;
    condition: string;
    high: number;
    low: number;
    icon: string;
}

const WeatherWidget = () => {
    const [weather, setWeather] = useState<WeatherData>({
        location: "Detectando...",
        temp: 0,
        condition: "Cargando...",
        high: 0,
        low: 0,
        icon: "..."
    });

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // 1. Get City Name (Reverse Geocoding)
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const geoData = await geoRes.json();
                    const city = geoData.address.city || geoData.address.town || geoData.address.village || "Ubicación desconocida";
                    const country = geoData.address.country_code?.toUpperCase();

                    // 2. Get Weather Data
                    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
                    const weatherData = await weatherRes.json();

                    const current = weatherData.current_weather;
                    const daily = weatherData.daily;

                    // Map WMO codes to conditions/icons
                    const getCondition = (code: number) => {
                        if (code === 0) return { text: "Despejado", icon: "☀️" };
                        if (code >= 1 && code <= 3) return { text: "Parcialmente Nublado", icon: "⛅" };
                        if (code >= 45 && code <= 48) return { text: "Niebla", icon: "🌫️" };
                        if (code >= 51 && code <= 67) return { text: "Llovizna", icon: "🌦️" };
                        if (code >= 71 && code <= 77) return { text: "Nieve", icon: "❄️" };
                        if (code >= 80 && code <= 82) return { text: "Lluvia", icon: "🌧️" };
                        if (code >= 95 && code <= 99) return { text: "Tormenta", icon: "⛈️" };
                        return { text: "Desconocido", icon: "❓" };
                    };

                    const condition = getCondition(current.weathercode);

                    setWeather({
                        location: `${city}, ${country}`,
                        temp: Math.round(current.temperature),
                        condition: condition.text,
                        high: Math.round(daily.temperature_2m_max[0]),
                        low: Math.round(daily.temperature_2m_min[0]),
                        icon: condition.icon
                    });

                } catch (error) {
                    console.error("Error fetching weather:", error);
                    setWeather(prev => ({ ...prev, location: "Error de conexión", condition: "Sin datos" }));
                }
            }, (error) => {
                console.error("Geolocation error:", error);
                setWeather(prev => ({ ...prev, location: "Ubicación denegada", condition: "Habilita GPS" }));
            });
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 mt-6 bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10"
        >
            <span className="text-4xl filter drop-shadow-lg">{weather.icon}</span>
            <div className="flex flex-col">
                <div className="text-sm font-medium opacity-90">{weather.location}</div>
                <div className="text-3xl font-light leading-none">{weather.temp}°</div>
                <div className="text-xs font-medium opacity-80 mt-1">{weather.condition}</div>
                <div className="text-[10px] opacity-60 mt-0.5">H: {weather.high}° L: {weather.low}°</div>
            </div>
        </motion.div>
    );
};

export default WeatherWidget;
