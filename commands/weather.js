const axios = require('axios');

const WEATHER_API_KEY = '';//Veuillez insérer une clés api

const weatherEmoji = (desc) => {
    const d = desc.toLowerCase();
    if (d.includes('thunder')) return '⛈️';
    if (d.includes('drizzle')) return '🌦️';
    if (d.includes('rain')) return '🌧️';
    if (d.includes('snow')) return '❄️';
    if (d.includes('mist') || d.includes('fog') || d.includes('haze')) return '🌫️';
    if (d.includes('clear')) return '☀️';
    if (d.includes('cloud')) return '☁️';
    return '🌡️';
};

const windDirection = (deg) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return dirs[Math.round(deg / 45) % 8];
};

module.exports = async function (sock, chatId, message, city) {
    if (!city || !city.trim()) {
        return await sock.sendMessage(chatId, {
            text: `❌ Précise une ville !\n💡 Exemple : *.météo Yaoundé*\n\n> BRINDI-XMD`
        }, { quoted: message });
    }

    try {
        const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=fr`
        );
        const w = res.data;

        const emoji = weatherEmoji(w.weather[0].description);
        const feelsLike = Math.round(w.main.feels_like);
        const temp = Math.round(w.main.temp);
        const tempMin = Math.round(w.main.temp_min);
        const tempMax = Math.round(w.main.temp_max);
        const humidity = w.main.humidity;
        const wind = (w.wind.speed * 3.6).toFixed(1); // m/s → km/h
        const windDir = windDirection(w.wind.deg || 0);
        const visibility = w.visibility ? `${(w.visibility / 1000).toFixed(1)} km` : 'N/A';
        const sunrise = new Date(w.sys.sunrise * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(w.sys.sunset * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const description = w.weather[0].description.charAt(0).toUpperCase() + w.weather[0].description.slice(1);

        const text =
`${emoji} *MÉTÉO — ${w.name.toUpperCase()}, ${w.sys.country}*

🌡️ *Température :* ${temp}°C (ressenti ${feelsLike}°C)
📉 *Min / Max :* ${tempMin}°C / ${tempMax}°C
🌤️ *Ciel :* ${description}

💧 *Humidité :* ${humidity}%
💨 *Vent :* ${wind} km/h ${windDir}
👁️ *Visibilité :* ${visibility}

🌅 *Lever :* ${sunrise}
🌇 *Coucher :* ${sunset}

> BRINDI-XMD`;

        await sock.sendMessage(chatId, { text }, { quoted: message });

    } catch (error) {
        const status = error.response?.status;
        let msg = '❌ Impossible de récupérer la météo.';
        if (status === 404) msg = `❌ Ville *"${city}"* introuvable. Vérifie l'orthographe.`;
        else if (status === 401) msg = '❌ Clé API invalide.';

        await sock.sendMessage(chatId, {
            text: `${msg}\n\n> BRINDI-XMD`
        }, { quoted: message });
    }
};
