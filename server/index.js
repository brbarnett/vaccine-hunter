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
        const { data: walgreens } = await axios.get(`https://www.vaccinespotter.org/api/v0/stores/${state}/walgreens.json`);

        const walgreensWithAppointments = walgreens
            .filter((walgreen) => walgreen.appointments && walgreen.appointments.length > 0);

        res.send(walgreensWithAppointments);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.listen(port, () => {
    console.log(`Running on port ${port}`);
});