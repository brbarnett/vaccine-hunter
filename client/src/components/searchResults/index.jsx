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
                        - {location.appointments.length > 0 ? location.appointments.length : `unknown`} appointments
                </p>
            ))}
        </div>
    );
}

export default SearchResults;
