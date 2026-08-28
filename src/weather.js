const WEATHER_CODES = {
  0: ["晴朗", "☀"], 1: ["大部晴朗", "🌤"], 2: ["局部多云", "⛅"], 3: ["阴天", "☁"],
  45: ["有雾", "🌫"], 48: ["雾凇", "🌫"], 51: ["毛毛雨", "🌦"], 53: ["小雨", "🌦"], 55: ["较强小雨", "🌧"],
  61: ["小雨", "🌧"], 63: ["中雨", "🌧"], 65: ["大雨", "🌧"], 71: ["小雪", "🌨"], 73: ["中雪", "🌨"],
  75: ["大雪", "❄"], 80: ["阵雨", "🌦"], 81: ["较强阵雨", "🌧"], 82: ["强阵雨", "⛈"],
  95: ["雷雨", "⛈"], 96: ["雷雨伴冰雹", "⛈"], 99: ["强雷雨伴冰雹", "⛈"]
};

function position() {
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 8000, maximumAge: 30 * 60 * 1000 }));
}

async function resolveLocation() {
  try {
    const { coords } = await position();
    return { latitude: coords.latitude, longitude: coords.longitude, name: "当前位置", source: "gps" };
  } catch {
    const response = await fetch("https://ipwho.is/");
    if (!response.ok) throw new Error("定位服务不可用");
    const data = await response.json();
    if (!data.success || !data.latitude) throw new Error("无法确定所在城市");
    return { latitude: data.latitude, longitude: data.longitude, name: data.city || data.region || "当前位置", source: "ip" };
  }
}

export async function fetchWeather() {
  const location = await resolveLocation();
  const query = `latitude=${location.latitude}&longitude=${location.longitude}`;
  const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${query}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`);
  if (!forecastResponse.ok) throw new Error("天气服务暂时不可用");
  const forecast = await forecastResponse.json();
  const [text, icon] = WEATHER_CODES[forecast.current.weather_code] || ["天气未知", "☁"];
  return {
    temperature: Math.round(forecast.current.temperature_2m), text, icon,
    min: Math.round(forecast.daily.temperature_2m_min[0]), max: Math.round(forecast.daily.temperature_2m_max[0]),
    location: location.name, source: location.source, updatedAt: Date.now()
  };
}
