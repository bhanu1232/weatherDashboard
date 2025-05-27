import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { weatherService } from '../services/weatherService';
import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import ForecastList from '../components/ForecastList';
import ErrorMessage from '../components/ErrorMessage';

export default function WeatherDashboard() {
    const [city, setCity] = useState(() => {
        const savedCity = localStorage.getItem('lastCity');
        return savedCity || 'London';
    });

    const { data: weatherData, error: weatherError, isLoading: weatherLoading } = useQuery({
        queryKey: ['weather', city],
        queryFn: () => weatherService.getCurrentWeather(city),
    });

    const { data: forecastData, error: forecastError, isLoading: forecastLoading } = useQuery({
        queryKey: ['forecast', city],
        queryFn: () => weatherService.getForecast(city),
    });

    const handleSearch = (searchCity: string) => {
        setCity(searchCity);
        localStorage.setItem('lastCity', searchCity);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Weather Dashboard</h1>
            </div>

            <SearchBar onSearch={handleSearch} />

            {weatherError && <ErrorMessage message={weatherError.message} />}
            {forecastError && <ErrorMessage message={forecastError.message} />}

            {(weatherLoading || forecastLoading) ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : weatherData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <WeatherCard data={weatherData} />
                    {forecastData && <ForecastList data={forecastData} />}
                </div>
            ) : null}
        </div>
    );
} 