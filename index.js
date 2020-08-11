require('dotenv').config();
const express = require('express');
const request = require('superagent');
const cors = require('cors');
const weatherData = require('./data/weather.js');const app = express();
const PORT = process.env.PORT || 3000;

const {
    GEOCODE_API_KEY
} = process.env;

app.use(cors());

app.use(express.static('public'));

async function getLatLong(cityName) {
    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${cityName}&format=json`);

    const city = response.body[0];

    
    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon,
    };
}

app.get('/location', async(req, res) => {
    try {
        const userInput = req.query.search;

        const mungedData = await getLatLong(userInput);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

async function getWeather(lat, lon) {
    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${cityName}&format=json`);

    const city = response.body[0];

    const forecastArray = city.map(weatherItem => {
        return {
            forecast: weatherItem.weather.description,
            date: new Date(weatherItem.ts * 1000)
        };
    });
    
    return forecastArray;
}

app.get('/weather', (req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLon = req.query.longitude;

        const mungedData = getWeather(userLat, userLon);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
    
});


app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
}); 