const website = {
    "cvs": "https://www.cvs.com/immunizations/covid-19-vaccine",
    "walgreens": "https://www.walgreens.com/findcare/vaccination/covid-19?ban=covid_vaccine_landing_schedule",
    "walmart": "https://www.walmart.com/pharmacy/clinical-services/immunization/scheduled?imzType=covid",
};

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
                        - {location.appointments.length > 0 ? location.appointments.length : `unknown`} appointments{' '}
                    <a href={website[location.brand]} target="__blank">click here</a>
                </p>
            ))}
        </div>
    );
}

export default SearchResults;
