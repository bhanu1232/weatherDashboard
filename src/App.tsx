import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import { Search, MapPin, Thermometer, Wind, Droplets, Sunrise, Sunset, Gauge, Eye, Clock, Save } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from './lib/supabase';
import { AuthModal } from './components/AuthModal';
import { AuthButton } from './components/AuthButton';
import { SavedLocations } from './components/SavedLocations';

interface WeatherData {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
  dt: number;
}

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    pressure: number;
  };
  weather: Array<{
    icon: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
  dt_txt: string;
}

interface ForecastData {
  list: ForecastItem[];
  city: { name: string };
}

interface SavedLocation {
  id: number;
  user_id: string;
  city: string;
  country: string;
  created_at: string;
}

const fetchWeatherData = async (cityName: string, unit: string, API_KEY: string): Promise<WeatherData> => {
  if (!API_KEY) {
    throw new Error('API key not found.');
  }
  if (!cityName) {
    throw new Error('City name is empty.');
  }
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${unit}`
  );
  return response.data;
};

const fetchForecastData = async (cityName: string, unit: string, API_KEY: string): Promise<ForecastData> => {
  if (!API_KEY) {
    throw new Error('API key not found.');
  }
  if (!cityName) {
    throw new Error('City name is empty.');
  }
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${unit}`
  );
  // Filter forecast to get one entry per day for the next 5 days (excluding today)
  const dailyForecastsMap = new Map();
  response.data.list.forEach((item: ForecastItem) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!dailyForecastsMap.has(date)) {
      dailyForecastsMap.set(date, item);
    } else { // Keep the entry closest to noon for a better daily representation
      const existingItem = dailyForecastsMap.get(date);
      const existingHour = new Date(existingItem.dt * 1000).getHours();
      const currentHour = new Date(item.dt * 1000).getHours();
      if (Math.abs(currentHour - 12) < Math.abs(existingHour - 12)) {
        dailyForecastsMap.set(date, item);
      }
    }
  });
  // Convert map values to array and take the next 5 days
  const dailyForecasts = Array.from(dailyForecastsMap.values()).slice(0, 5);
  return { ...response.data, list: dailyForecasts };
};

function App() {
  const [city, setCity] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [searchQuery, setSearchQuery] = useState('London');
  const [localError, setLocalError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Check for existing session
  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (mounted) {
          setLocalError('Failed to check authentication status');
        }
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error in handleSignOut:', error);
      setLocalError('Failed to sign out. Please try again.');
    }
  };

  // Fetch current weather using React Query
  const {
    data: weatherData,
    isLoading: isWeatherLoading,
    error: weatherError,
    isError: isWeatherError
  } = useQuery<WeatherData, Error>({
    queryKey: ['weather', searchQuery, unit],
    queryFn: () => fetchWeatherData(searchQuery, unit, API_KEY),
    enabled: !!searchQuery && !!API_KEY,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Fetch forecast data using React Query
  const {
    data: forecastData,
    isLoading: isForecastLoading,
    error: forecastError,
    isError: isForecastError
  } = useQuery<ForecastData, Error>({
    queryKey: ['forecast', searchQuery, unit],
    queryFn: () => fetchForecastData(searchQuery, unit, API_KEY),
    enabled: !!searchQuery && !!API_KEY,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const isLoading = isWeatherLoading || isForecastLoading;
  const isError = isWeatherError || isForecastError;
  const errorMessage = isError
    ? (weatherError?.message.includes('404') || forecastError?.message.includes('404')
      ? 'City not found. Please try again.'
      : 'An error occurred while fetching weather data.')
    : localError;

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    if (localError) setLocalError(null);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      setSearchQuery(city.trim());
      if (localError) setLocalError(null);
    } else {
      setLocalError('Please enter a city name.');
    }
  };

  // Get weather icon URL
  const getWeatherIcon = (iconCode: string | undefined) => {
    if (!iconCode) return '';
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // Format temperature with unit symbol
  const formatTemp = (temp: number | undefined) => {
    if (temp === undefined) return 'N/A';
    const symbol = unit === 'metric' ? '°C' : '°F';
    return `${Math.round(temp)}${symbol}`;
  };

  // Format wind speed with unit symbol
  const formatWind = (speed: number | undefined) => {
    if (speed === undefined) return 'N/A';
    const symbol = unit === 'metric' ? 'm/s' : 'mph';
    return `${speed.toFixed(1)} ${symbol}`;
  };

  // Format time (e.g., for sunrise/sunset)
  const formatTime = (timestamp: number | undefined) => {
    if (timestamp === undefined) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Get today's date string
  const getTodayDate = (timestamp: number | undefined) => {
    if (timestamp === undefined) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' });
  };

  // Get current time string (for header)
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Get daily forecasts
  const getDailyForecasts = () => {
    return forecastData?.list || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Weather Dashboard
            </h1>
            <div className="flex items-center gap-4">
              {/* Unit Switcher */}
              <div className="flex bg-slate-800 rounded-full p-1">
                <button
                  onClick={() => setUnit('metric')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${unit === 'metric'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setUnit('imperial')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${unit === 'imperial'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  °F
                </button>
              </div>

              {/* Auth Button */}
              <AuthButton
                user={user}
                onSignIn={() => setShowAuthModal(true)}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </header>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={() => {
            setShowAuthModal(false);
          }}
        />

        {/* Search Section */}
        <div className="mb-12">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={city}
                onChange={handleInputChange}
                placeholder="Search for a city..."
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 backdrop-blur-sm"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors duration-200"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-center">
            {errorMessage}
          </div>
        )}

        {/* Weather Content */}
        {weatherData && forecastData && !isLoading && !errorMessage && (
          <div className="space-y-8">
            {/* Current Weather Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Main Weather Info */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="flex items-center gap-2 text-slate-400 mb-4">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">{weatherData.name}{weatherData.sys?.country && `, ${weatherData.sys.country}`}</span>
                  </div>

                  {weatherData.weather?.[0]?.icon && (
                    <img
                      src={getWeatherIcon(weatherData.weather[0].icon)}
                      alt={weatherData.weather[0].description || 'weather icon'}
                      className="w-32 h-32 -mb-4"
                    />
                  )}

                  <div className="mt-4">
                    <p className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                      {formatTemp(weatherData.main?.temp)}
                    </p>
                    <p className="text-xl text-slate-300 capitalize mt-2">
                      {weatherData.weather?.[0]?.description || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Right Column - Weather Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Thermometer className="w-4 h-4" />
                      <span className="text-sm">Feels Like</span>
                    </div>
                    <p className="text-xl font-semibold">{formatTemp(weatherData.main?.feels_like)}</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Droplets className="w-4 h-4" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <p className="text-xl font-semibold">{weatherData.main?.humidity ?? 'N/A'}%</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Wind className="w-4 h-4" />
                      <span className="text-sm">Wind</span>
                    </div>
                    <p className="text-xl font-semibold">{formatWind(weatherData.wind?.speed)}</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Gauge className="w-4 h-4" />
                      <span className="text-sm">Pressure</span>
                    </div>
                    <p className="text-xl font-semibold">{weatherData.main?.pressure ?? 'N/A'} hPa</p>
                  </div>

                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Visibility</span>
                    </div>
                    <p className="text-xl font-semibold">
                      {weatherData.visibility !== undefined ? `${Math.round(weatherData.visibility / 1000)} km` : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Time</span>
                    </div>
                    <p className="text-xl font-semibold">
                      {weatherData.dt !== undefined
                        ? new Date(weatherData.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h3 className="text-xl font-semibold mb-6 text-slate-300">5-Day Forecast</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {getDailyForecasts().map((day) => (
                  <div
                    key={day.dt}
                    className="bg-slate-700/30 rounded-xl p-4 flex flex-col items-center"
                  >
                    <p className="text-sm text-slate-400 mb-2">
                      {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    {day.weather?.[0]?.icon && (
                      <img
                        src={getWeatherIcon(day.weather[0].icon)}
                        alt={day.weather[0].description || 'weather icon'}
                        className="w-12 h-12 mb-2"
                      />
                    )}
                    <p className="text-lg font-semibold">{formatTemp(day.main?.temp)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Locations */}
            <SavedLocations
              locations={[]}
              onLocationSelect={(city) => setSearchQuery(city)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;