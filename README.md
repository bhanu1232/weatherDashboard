# 🌤️ Weather Dashboard

A modern weather dashboard that provides real-time weather information and forecasts. Built with React, TypeScript, and OpenWeather API.

![Weather Dashboard Preview](public/preview.png)

## ✨ Features

- 🌡️ **Current Weather**: Real-time temperature, humidity, and conditions
- 📅 **5-Day Forecast**: Plan ahead with detailed weather predictions
- 🔄 **Unit Conversion**: Switch between Celsius and Fahrenheit
- 🔍 **City Search**: Find weather for any city worldwide
- 📱 **Responsive Design**: Works on all devices
- 🌙 **Dark Theme**: Easy on the eyes
- 🔐 **User Authentication**: Secure login with Supabase

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- OpenWeather API key ([Get it here](https://openweathermap.org/api))
- Supabase account ([Sign up here](https://supabase.com))

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd weather-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   # OpenWeather API Key
   VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here

   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

   To get your Supabase credentials:

   1. Go to your Supabase project dashboard
   2. Click on the "Settings" icon in the sidebar
   3. Click on "API" in the settings menu
   4. Copy the "Project URL" and "anon public" key
   5. Paste them in your `.env` file

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   Visit `http://localhost:5173`

## 📁 Project Structure

```
weather-dashboard/
├── src/
│   ├── components/     # React components
│   ├── lib/           # Utility functions
│   ├── App.tsx        # Main component
│   └── main.tsx       # Entry point
├── public/            # Static assets
├── index.html         # HTML template
└── package.json       # Dependencies
```

## 🛠️ Available Commands

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Start development server |
| `npm run build`      | Build for production     |
| `npm run preview`    | Preview production build |
| `npm run lint`       | Check code quality       |
| `npm run type-check` | Check TypeScript types   |

## 🛠️ Built With

- [React](https://reactjs.org/) - Frontend framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [OpenWeather API](https://openweathermap.org/api) - Weather data
- [React Query](https://tanstack.com/query/latest) - Data fetching
- [Lucide Icons](https://lucide.dev/) - Icons
- [Supabase](https://supabase.com) - Authentication & Database

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

If you have any questions or issues:

- Open an issue in the repository
- Contact the maintainers
- Check the documentation

---
