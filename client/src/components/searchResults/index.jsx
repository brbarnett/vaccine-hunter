import _ from 'lodash';

const website = {
    "cvs": "https://www.cvs.com/immunizations/covid-19-vaccine",
    "walgreens": "https://www.walgreens.com/findcare/vaccination/covid-19?ban=covid_vaccine_landing_schedule",
    "walmart": "https://www.walmart.com/pharmacy/clinical-services/immunization/scheduled?imzType=covid",
};

// add some basic information about the appointments to hover
//   some of the backend APIs occasionally return weird time data for a few minutes (which don't end up being bookable)
const getAppointmentInfo = (appointments) => {
    if (!appointments || !appointments.length) {
        return '';
    }
    try {
        appointments.sort((a, b) => a.time < b.time ? -1 : 1);
        return appointments.slice(0, 5).map(a => {
            const parts = [];
            try {
                parts.push(new Date(a.time).toLocaleString());
            }
            catch {
                parts.push(a.time);
            }
            if (a.type) {
                parts.push(a.type);
            }
            return parts.join(' - ');
        }).join('\n');
    }
    catch {
        return '<unable to understand appointments>';
    }
}

const renderVaccineTypes = (appointments) => {
    const vaccineTypes = _(appointments)
        .flatMap(appointment => appointment.type.split(','))
        .uniq()
        .sort()
        .value();

    return vaccineTypes.map((vaccineType, index) => (
        <p key={index}>
            <span className="badge badge-secondary">{vaccineType}</span>
        </p>
    ));
}

const SearchResults = (props) => {
    const { isHunting, locationsWithAppointments } = props;

    return (
        <div>
            <div>
                {locationsWithAppointments.length > 0 ? (
                    <>
                        <p>Found appointments at {locationsWithAppointments.length} locations!</p>
                    </>
                ) : (
                    isHunting && (
                        <p>No appointments found...</p>
                    )
                )}
            </div>
            {locationsWithAppointments.map((location, index) => (
                <div className="row border-bottom my-5" key={index}>
                    <div className="col-3 col-sm-3 col-md-2">
                        <p>
                            <span className="badge badge-success">{location.brand}</span>
                        </p>
                        <p>
                            <span title={getAppointmentInfo(location.appointments)}>
                                <strong>{location.appointments.length > 0 ? location.appointments.length : `unknown`}</strong>
                                {' '}appts
                            </span>
                        </p>
                    </div>
                    <div className="col-6 col-sm-6 col-md-4">
                        <p>{location.name}</p>
                        <p>{location.address}</p>
                        <p>{location.city}, {location.state} {location.postal_code}</p>
                    </div>
                    <div className="d-none d-md-block col-md-4">
                        {renderVaccineTypes(location.appointments)}
                    </div>
                    <div className="col-3 col-sm-3 col-md-2">
                        <p>{location.distance} miles</p>
                        <a className="btn btn-secondary" href={website[location.brand]} target="__blank">Book</a>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SearchResults;
