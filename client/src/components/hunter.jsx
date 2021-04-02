import React, { useState } from 'react';
import { chain } from 'lodash';
import axios from 'axios';
import useSound from 'use-sound';
import { toast } from 'react-toastify';
import Ding from '../assets/ding.mp3';
import SearchCriteriaPicker from './searchCriteriaPicker';
import SearchResults from './searchResults';

const searchCriteriaLocalStorageKey = `searchCriteria`;

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

    const savedSearchCriteriaString = window.localStorage.getItem(searchCriteriaLocalStorageKey);
    const [searchCriteria, setSearchCriteria] = useState((savedSearchCriteriaString && JSON.parse(savedSearchCriteriaString)) || {
        ignoreSecondDoseOnly: false,
        lat: 41.76591144742395,
        lng: -88.08859844292297,
        maxDistance: 150,
        state: `IL`,
    });

    const onUpdateSearchCriteria = (updatedSearchCriteria) => {
        const combinedSearchCriteria = Object.assign({}, searchCriteria, updatedSearchCriteria);

        // persist state
        window.localStorage.setItem(searchCriteriaLocalStorageKey, JSON.stringify(combinedSearchCriteria));

        setSearchCriteria(combinedSearchCriteria);
    };

    const run = async () => {
        try {
            const { data: locations } = await getAllLocationsWithAppointments(searchCriteria.state);

            const closeLocationsWithAppointments =
                chain(locations)
                    .filter((location) => location.appointments_available)
                    .map((location) => {
                        if (!searchCriteria.ignoreSecondDoseOnly) {
                            return location;
                        }

                        const appointments = location.appointments.filter(appointment => {
                            return !(appointment.appointment_types && appointment.appointment_types.length && appointment.appointment_types.find(i => i === '2nd_dose_only'));
                        });

                        return { ...location, appointments };
                    })
                    .filter((location) => location.appointments.length > 0 || location.brand === `cvs`) // CVS doesn't return appointment details
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
                <nav className="navbar navbar-expand-md navbar-dark bg-dark mb-4">
                    <a className="navbar-brand" href="/">Vaccine Hunter</a>
                </nav>
            </header>

            <main className="container">
                <div className="jumbotron py-4 my-4">
                    <h1>Vaccine Hunter</h1>
                    <p>
                        <a href="#search">Less reading, more hunting!</a>
                    </p>
                    <p>
                        COVID-19 vaccines are exceptionally difficult to find right now because new appointments pop up at seemingly random
                        times and lucky seekers snap them up very quickly. This application will notify you as soon as it finds available
                        appointments in your area if you keep it running. It is free and I do not collect any personal information.
                    </p>
                    <p>
                        Click on the map to set your location. Please also set maximum distance and state, then start the hunt. This application leverages{' '}
                        <a href="https://www.vaccinespotter.org/" target="__blank">https://www.vaccinespotter.org/</a> and refreshes every 5 minutes to alert you to
                        new appointments as they become available.
                    </p>
                    <p>
                        If you're interested in donating to support this project, please{` `}
                        <a href="https://givebutter.com/vaccinespotter" target="__blank">donate to the original author of the Vaccine Spotter</a>. He did all the hard work to produce this data and
                        make it available, I just wrote an app on top of it.
                    </p>
                    <p>
                        Happy hunting!
                    </p>
                </div>

                <SearchCriteriaPicker
                    {...{
                        hunt,
                        onUpdateSearchCriteria,
                        searchCriteria,
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
                            <strong>Hunting for an appointment near you...</strong>
                            <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
                        </div>
                    </>
                )}

                <SearchResults
                    {...{
                        isHunting: !!hunt,
                        locationsWithAppointments
                    }} />

                {lastHunt && (
                    <div className="d-flex align-items-center">
                        Last checked for appointments: { lastHunt.toLocaleDateString()} { lastHunt.toLocaleTimeString()}
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
