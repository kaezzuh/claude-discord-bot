import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const WEATHER_CODES = {
  0: ['Clear sky', '☀️'],
  1: ['Mainly clear', '🌤️'],
  2: ['Partly cloudy', '⛅'],
  3: ['Overcast', '☁️'],
  45: ['Foggy', '🌫️'],
  48: ['Foggy', '🌫️'],
  51: ['Light drizzle', '🌦️'],
  53: ['Drizzle', '🌦️'],
  55: ['Heavy drizzle', '🌧️'],
  61: ['Light rain', '🌧️'],
  63: ['Rain', '🌧️'],
  65: ['Heavy rain', '🌧️'],
  71: ['Light snow', '🌨️'],
  73: ['Snow', '🌨️'],
  75: ['Heavy snow', '❄️'],
  80: ['Rain showers', '🌦️'],
  81: ['Heavy showers', '🌧️'],
  82: ['Violent showers', '⛈️'],
  95: ['Thunderstorm', '⛈️'],
  96: ['Thunderstorm with hail', '⛈️'],
  99: ['Severe thunderstorm', '⛈️'],
};

async function geocode(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  const json = await res.json();
  return json.results?.[0] ?? null;
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&temperature_unit=celsius`;
  const res = await fetch(url);
  return res.json();
}

export default {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get current weather for a city')
    .addStringOption((opt) =>
      opt.setName('city').setDescription('City name').setRequired(true).setMaxLength(100),
    ),

  async execute(interaction) {
    const city = interaction.options.getString('city');
    await interaction.deferReply();

    try {
      const place = await geocode(city);
      if (!place) {
        await interaction.editReply(`Could not find a city called "${city}".`);
        return;
      }

      const data = await fetchWeather(place.latitude, place.longitude);
      const c = data.current;
      const [desc, emoji] = WEATHER_CODES[c.weather_code] ?? ['Unknown', '❔'];

      const embed = new EmbedBuilder()
        .setTitle(`${emoji} Weather in ${place.name}, ${place.country}`)
        .setColor(0x5865f2)
        .addFields(
          { name: 'Conditions', value: desc, inline: true },
          { name: 'Temperature', value: `${c.temperature_2m}°C`, inline: true },
          { name: 'Humidity', value: `${c.relative_humidity_2m}%`, inline: true },
          { name: 'Wind', value: `${c.wind_speed_10m} km/h`, inline: true },
        )
        .setFooter({ text: 'Powered by Open-Meteo' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('/weather error:', error);
      await interaction.editReply('Weather lookup failed. Try again later.');
    }
  },
};
