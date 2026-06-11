async function getWeather(destination) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(destination)}&appid=${apiKey}&units=metric&cnt=5`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API failed: ${res.status}`);
    const data = await res.json();

    return data.list.map(item => ({
      date: item.dt_txt,
      temp: Math.round(item.main.temp),
      feels_like: Math.round(item.main.feels_like),
      description: item.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
      humidity: item.main.humidity,
      wind: item.wind.speed
    }));
  } catch (err) {
    console.error('[Weather] Error:', err.message);
    return null;
  }
}

module.exports = { getWeather };
