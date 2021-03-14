import React, { useState } from 'react';
import { chain } from 'lodash';
import axios from 'axios';
import useSound from 'use-sound';
import { ToastContainer, toast } from 'react-toastify';
import Ding from '../assets/ding.mp3';
import SearchCriteriaPicker from './searchCriteriaPicker';

import 'react-toastify/dist/ReactToastify.css';

const getAllWalgreens = async (state) => await axios.get(`/api/locationsWithAppointments?state=${state}`);

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
    const [play] = useSound(Ding);
    const [locationsWithAppointments, setLocationsWithAppointments] = useState([]);
    const [searchCriteria, setSearchCriteria] = useState({
        lat: 41.76591144742395,
        lng: -88.08859844292297,
        maxDistance: 300,
        state: `IL`,
    });

    const onUpdateSearchCriteria = (updatedSearchCriteria) => setSearchCriteria({
        ...searchCriteria,
        ...updatedSearchCriteria,
    });

    const run = async () => {
        try {
            const { data: walgreens } = await getAllWalgreens(searchCriteria.state);

            const closeWalgreensWithAppointments =
                chain(walgreens)
                    .filter((walgreen) => walgreen.appointments.length > 0)
                    .map((walgreen) => Object.assign(walgreen, { distance: +calculateDistance(searchCriteria.lat, searchCriteria.lng, walgreen.latitude, walgreen.longitude, 'M').toFixed(1) }))
                    .filter((walgreen) => walgreen.distance <= searchCriteria.maxDistance)
                    .sortBy((walgreen) => walgreen.distance)
                    .value();

            setLocationsWithAppointments(closeWalgreensWithAppointments);

            if (closeWalgreensWithAppointments.length > 0) {
                play();
            }
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
                    Please input your location and maximum distance and start the hunt. This application leverages{' '}
                    <a href="https://www.vaccinespotter.org/">https://www.vaccinespotter.org/</a>, additionally
                    letting you filter and sort by your location and maximum distance. It refreshes every 5 minutes to alert you to
                    new appointments as they become available.
                </p>

                <SearchCriteriaPicker
                    {...{
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

                        <div class="d-flex align-items-center">
                            <strong>Hunting...</strong>
                            <div class="spinner-border ml-auto" role="status" aria-hidden="true"></div>
                        </div>
                    </>
                )}

                <div>
                    <ToastContainer />
                    <div>
                        {locationsWithAppointments.length > 0 ? (
                            <>
                                <p>Found appointments at 6 locations</p>
                                <p>
                                    Book here:{' '}
                                    <a href="https://www.walgreens.com/findcare/vaccination/covid-19/location-screening">
                                        https://www.walgreens.com/findcare/vaccination/covid-19/location-screening
                                </a>
                                </p>
                            </>
                        ) : (
                            hunt && (
                                <p>No appointments found</p>
                            )
                        )}
                    </div>
                    {locationsWithAppointments.map((location, index) => (
                        <p key={index}>
                            {location.name}{' '}
                        - {location.address}, {location.city}, {location.state} {location.postal_code} ({location.distance} miles){' '}
                        - {location.appointments.length} appointments
                        </p>
                    ))}
                </div>
            </main>
        </div>
    )
};

export default Hunter;
