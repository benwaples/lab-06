require('dotenv').config();
const express = require('express');
const request = require('superagent');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const {
    GEOCODE_API_KEY,
    WEATHERBIT_KEY,
    HIKING_KEY
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
    const response = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}3&key=${WEATHERBIT_KEY}`);

    const city = response.body.data;
    const forecast = city.map(weather => {
        return {
            forecast: weather.weather.description,
            time: new Date(weather.ts * 1000)
        };
    });

    return forecast.slice(0, 3);
}

app.get('/weather', async(req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLon = req.query.longitude;

        const mungedData = await getWeather(userLat, userLon);

        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
    
});

async function getHike(lat, lon) {
    const response = await request.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${HIKING_KEY}`);

    const hikes = response.body.trails;
    
    const allHikes = hikes.map(hike => {
        return {
            trail_url: hike.trail_url,
            name: hike.name,
            location: hike.location,
            length: hike.length,
            condition_date: new Date(hike.conditionDate).toDateString(),
            condition_time: new Date(hike.conditionDate).toTimeString(),
            conditions: hike.conditionStatus,
            stars: hike.stars,
            star_votes: hike.starVotes,
            summary: hike.summary
        };
    });
    
    return allHikes;
}

app.get('/trails', async(req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLon = req.query.longitude;

        const mungedData = await getHike(userLat, userLon);
        console.log(mungedData, 'city repsonse');
        res.json(mungedData);
        

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
    
});


app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
}); 