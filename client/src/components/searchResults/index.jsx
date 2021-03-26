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
            try {
                return new Date(a.time).toLocaleString() + ' - ' + a.type;
            }
            catch {
                return a.time + ' - ' + a.type;
            }
        }).join('\n');
    }
    catch {
        return '<unable to understand appointments>';
    }
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
                <p key={index}>
                    <span className="badge badge-success m-2">{location.brand}</span>
                    {location.name}{' '}
                        - {location.address}, {location.city}, {location.state} {location.postal_code} ({location.distance} miles){' '}
                        - <span title={getAppointmentInfo(location.appointments)}>{location.appointments.length > 0 ? location.appointments.length : `unknown`} appointments{' '}</span>
                    <a href={website[location.brand]} target="__blank">click here</a>
                </p>
            ))}
        </div>
    );
}

export default SearchResults;
