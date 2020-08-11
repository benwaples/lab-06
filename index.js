require('dotenv').config();
const express = require('express');
const cors = require('cors');
const geoData = require('./data/geo.js');
const weatherData = require('./data/weather.js');const app = express();
const port = process.env.port || 3000;

app.use(cors());

app.use(express.static('public'));

function getLatLong(cityName) {
    const city = geoData[0];

    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon,
    };
}

app.get('/location', (req, res) => {
    try {
        const userInput = req.query.search;

        const mungedData = getLatLong(userInput);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
};
});

function getWeather(lat, lon) {
    const data = weatherData.data;

    const forecastArray = data.map(weatherItem => {
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


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
}); 