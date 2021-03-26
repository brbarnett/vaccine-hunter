import React, { useState } from 'react';
import { chain } from 'lodash';
import axios from 'axios';
import useSound from 'use-sound';
import { ToastContainer, toast } from 'react-toastify';
import Ding from '../assets/ding.mp3';
import SearchCriteriaPicker from './searchCriteriaPicker';

import 'react-toastify/dist/ReactToastify.css';
import SearchResults from './searchResults';

const getAllLocationsWithAppointments = async (state) => await axios.get(`/api/locationsWithAppointments?state=${state}`);

// adapted from https://www.geodatasource.com/developers/javascript
const calculateDistance = (lat1, lon1, lat2, lon2, unit) => {
    if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0;
    }
    else {
        const radlat1 = Math.PI * lat1 / 180;
        const radlat2 = Math.PI * lat2 / 180;
        const theta = lon1 - lon2;
        const radtheta = Math.PI * theta / 180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit === "K") { dist = dist * 1.609344 }
        if (unit === "N") { dist = dist * 0.8684 }
        return dist;
    }
};

const Hunter = () => {
    const pollingInterval = 5 * 60 * 1000;

    const [hunt, setHunt] = useState(undefined);
    const [lastHunt, setLastHunt] = useState(undefined);
    const [play] = useSound(Ding);
    const [locationsWithAppointments, setLocationsWithAppointments] = useState([]);
    const [searchCriteria, setSearchCriteria] = useState({
        lat: 41.76591144742395,
        lng: -88.08859844292297,
        maxDistance: 200,
        state: `IL`,
        ignoreSecondDoseOnly: false,
    });

    const onUpdateSearchCriteria = (updatedSearchCriteria) => setSearchCriteria({
        ...searchCriteria,
        ...updatedSearchCriteria,
    });

    const run = async () => {
        try {
            const { data: locations } = await getAllLocationsWithAppointments(searchCriteria.state);

            const closeLocationsWithAppointments =
                chain(locations)
                    .map((location) => {
                        if(!searchCriteria.ignoreSecondDoseOnly) {
                            return location;
                        }
                        const appointments = location.appointments.filter(appointment => {
                            return !(appointment.appointment_types && appointment.appointment_types.length && appointment.appointment_types.find(i => i === '2nd_dose_only'));
                        });
                        console.log({
                            original: location.appointments.length,
                            revised: appointments.length,
                            appointments
                        })
                        return { ...location, appointments };
                    })
                    .filter((location) => location.appointments.length > 0)
                    .map((location) => Object.assign(location, { distance: +calculateDistance(searchCriteria.lat, searchCriteria.lng, location.latitude, location.longitude, 'M').toFixed(1) }))
                    .filter((location) => location.distance <= searchCriteria.maxDistance)
                    .sortBy((location) => location.distance)
                    .value();

            setLocationsWithAppointments(closeLocationsWithAppointments);

            if (closeLocationsWithAppointments.length > 0) {
                play();
            }
            setLastHunt(new Date());
        } catch (error) {
            toast.error('Something went wrong!');
        }
    }

    const stopHunting = () => {
        if (hunt) {
            clearInterval(hunt);
            setHunt(undefined);
        }
    }

    const startHunting = async () => {
        stopHunting();

        await run();
        setHunt(setInterval(run, pollingInterval));
    }

    return (
        <div>
            <header>
                <h1>Vaccine Hunter</h1>
            </header>

            <main>
                <p>
                    Click on the map to set your location. Please also set maximum distance and state, then start the hunt. This application leverages{' '}
                    <a href="https://www.vaccinespotter.org/" target="__blank">https://www.vaccinespotter.org/</a> and refreshes every 5 minutes to alert you to
                    new appointments as they become available.
                </p>

                <SearchCriteriaPicker
                    {...{
                        onUpdateSearchCriteria,
                        searchCriteria,
                        hunt
                    }} />
                <button
                    className="btn btn-primary m-3"
                    onClick={startHunting}>
                    Start hunting!
                </button>
                {hunt && (
                    <>
                        <button
                            className="btn btn-danger m-3"
                            onClick={stopHunting}>
                            Stop the hunt
                        </button>

                        <div className="d-flex align-items-center">
                            <strong>Hunting...</strong>
                            <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
                        </div>
                    </>
                )}

                <ToastContainer />
                <SearchResults
                    {...{
                        isHunting: !!hunt,
                        locationsWithAppointments
                    }} />

                {lastHunt && (
                    <div className="d-flex align-items-center">
                        Last checked for appointments: { lastHunt.toLocaleDateString() } { lastHunt.toLocaleTimeString() }
                    </div>
                )}
            </main>
            <footer className="m-5">
                This project lives here: <a href="https://github.com/brbarnett/vaccine-hunter" target="__blank">https://github.com/brbarnett/vaccine-hunter</a>. Feel free to contribute.
            </footer>
        </div>
    )
};

export default Hunter;
