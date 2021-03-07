import GoogleMap from 'google-map-react';
import { Icon } from '@iconify/react'
import locationIcon from '@iconify/icons-mdi/map-marker'

const LocationPin = ({ text }) => (
    <div className="pin">
        <Icon icon={locationIcon} className="pin-icon" />
        <p className="pin-text">{text}</p>
    </div>
)

const states = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC",
    "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA",
    "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE",
    "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];

const SearchCriteriaPicker = (props) => {
    const { onUpdateSearchCriteria, searchCriteria } = props;

    return (
        <div>
            <input
                defaultValue={searchCriteria.maxDistance}
                onChange={(e) => {
                    const maxDistance = +e.target.value;
                    onUpdateSearchCriteria({ maxDistance });
                }}
                type="number" />
            <select
                defaultValue={searchCriteria.state}
                onChange={(e) => {
                    const state = e.target.value;
                    onUpdateSearchCriteria({ state });
                }}>
                {states.map((state, index) => (
                    <option key={index} value={state}>
                        {state}
                    </option>
                ))}
            </select>
            <div style={{ height: '500px', position: 'relative', width: '100%' }}>
                <GoogleMap
                    bootstrapURLKeys={{ key: 'AIzaSyBQpW_Jyx7vrUVk4T3P4NZl6oPPlhzpl6s' }}
                    center={{
                        lat: searchCriteria.lat,
                        lng: searchCriteria.lng,
                    }}
                    defaultZoom={11}
                    yesIWantToUseGoogleMapApiInternals
                    onClick={(e) => {
                        const { lat, lng } = e;
                        onUpdateSearchCriteria({ lat, lng });
                    }}
                >
                    <LocationPin
                        lat={searchCriteria.lat}
                        lng={searchCriteria.lng}
                        text="Selected location" />
                </GoogleMap>
            </div>
        </div>
    );
}

export default SearchCriteriaPicker;
