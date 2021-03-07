const axios = require('axios');
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.get('/', function (req, res) {
    res.send('hello world')
})

app.get(`/api/locationsWithAppointments`, async (req, res) => {
    const { state } = req.query;
    const { data: walgreens } = await axios.get(`https://www.vaccinespotter.org/api/v0/stores/${state}/walgreens.json`);

    const walgreensWithAppointments = walgreens
        .filter((walgreen) => walgreen.appointments.length > 0);

    res.send(walgreensWithAppointments);
});

app.listen(port, () => {
    console.log(`Running on port ${port}`);
});