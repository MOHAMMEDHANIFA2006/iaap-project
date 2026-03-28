import { useState, useEffect } from "react";
import { CheckCircle, Paintbrush, Moon, Sun, Bell, Clock } from "lucide-react";

export default function ThemeSettings() {
  const [currentTheme, setCurrentTheme] = useState("default");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [timeFormat, setTimeFormat] = useState("12h");

  useEffect(() => {
    setCurrentTheme(localStorage.getItem("theme") || "default");
    setIsDarkMode(localStorage.getItem("darkMode") !== "false");
    setNotificationsEnabled(localStorage.getItem("notifications") !== "false");
    setTimeFormat(localStorage.getItem("timeFormat") || "12h");
  }, []);

  const handleThemeChange = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    setCurrentTheme(theme);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleNotifications = () => {
    const newNotif = !notificationsEnabled;
    setNotificationsEnabled(newNotif);
    localStorage.setItem("notifications", newNotif);
  };

  const toggleTimeFormat = () => {
    const newFormat = timeFormat === "12h" ? "24h" : "12h";
    setTimeFormat(newFormat);
    localStorage.setItem("timeFormat", newFormat);
  };

  const themes = [
    { id: "default", name: "Midnight", colors: "from-indigo-600 to-purple-600" },
    { id: "emerald", name: "Emerald", colors: "from-teal-600 to-emerald-600" },
    { id: "rose", name: "Crimson", colors: "from-pink-600 to-rose-600" },
    { id: "amber", name: "Sunset", colors: "from-amber-600 to-orange-600" }
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto w-full">
      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Color Theme (Shortened) */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-outfit font-bold text-white flex items-center gap-2">
            <Paintbrush className="w-5 h-5 text-indigo-400" />
            Theme Color
          </h3>
          <div className="flex flex-wrap gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                title={t.name}
                onClick={() => handleThemeChange(t.id)}
                className={`relative w-12 h-12 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center ${
                  currentTheme === t.id 
                    ? "ring-4 ring-white/30 scale-110" 
                    : "ring-1 ring-white/10 hover:scale-105 hover:ring-white/30 opacity-80"
                }`}
              >
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${t.colors} ${currentTheme === t.id ? 'opacity-100' : 'opacity-80'}`} />
                {currentTheme === t.id && (
                  <CheckCircle className="w-5 h-5 text-white drop-shadow-md relative z-10" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Appearance (Dark/Light Mode) */}
        <div className="space-y-4">
          <h3 className="text-lg font-outfit font-bold text-white flex items-center gap-2">
            {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
            Appearance
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/20 group hover:bg-white/5 transition-colors">
            <div className="flex flex-col">
              <span className="text-white font-medium">Dark Mode</span>
              <span className="text-slate-400 text-xs">Switch between light and dark</span>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center shadow-inner
                ${isDarkMode ? 'bg-indigo-500' : 'bg-slate-600'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out
                ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-outfit font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            Notifications
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/20 group hover:bg-white/5 transition-colors">
            <div className="flex flex-col">
              <span className="text-white font-medium">Push Alerts</span>
              <span className="text-slate-400 text-xs">Stay updated on your progress</span>
            </div>
            <button 
              onClick={toggleNotifications}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center shadow-inner
                ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out
                ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Time Format */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-outfit font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-400" />
            Time Format
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/20 group hover:bg-white/5 transition-colors">
            <div className="flex flex-col">
              <span className="text-white font-medium">Clock Format</span>
              <span className="text-slate-400 text-xs">Choose 12-hour or 24-hour display</span>
            </div>
            <button 
              onClick={toggleTimeFormat}
              className="flex items-center bg-slate-800 rounded-lg p-1 border border-white/10"
            >
              <div className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${timeFormat === '12h' ? 'bg-white/20 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
                12h
              </div>
              <div className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${timeFormat === '24h' ? 'bg-white/20 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
                24h
              </div>
            </button>
          </div>
        </div>

      </div>
      
      <p className="text-slate-400 text-sm italic mt-6 text-center border-t border-white/10 pt-6">
        Settings are automatically saved and applied across your dashboard.
      </p>
    </div>
  );
}
