const axios = require('axios');
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.static('build'));
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
})

app.get(`/api/locationsWithAppointments`, async (req, res) => {
    try {
        const { state } = req.query;
        const { data: cvs } = await axios.get(`https://www.vaccinespotter.org/api/v0/stores/${state}/cvs.json`);
        const { data: walgreens } = await axios.get(`https://www.vaccinespotter.org/api/v0/stores/${state}/walgreens.json`);
        const { data: walmarts } = await axios.get(`https://www.vaccinespotter.org/api/v0/stores/${state}/walmart.json`);

        const locations = [
            ...cvs,
            ...walgreens,
            ...walmarts,
        ];

        const locationsWithAppointments = locations
            .filter((location) => location.appointments_available);

        res.send(locationsWithAppointments);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.listen(port, () => {
    console.log(`Running on port ${port}`);
});