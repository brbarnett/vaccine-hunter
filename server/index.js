const axios = require('axios');
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

const supportedPharmacies = [`cvs`, `walgreens`, `walmart`];

app.use(express.static('build'));
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
})

app.get(`/api/locationsWithAppointments`, async (req, res) => {
    try {
        const { state } = req.query;

        const locations = [];
        for (const pharmacy of supportedPharmacies) {
            try {
                const { data } = await axios.get(`https://www.vaccinespotter.org/api/v0/stores/${state}/${pharmacy}.json`);

                locations.push(...data);
            } catch { }
        }

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