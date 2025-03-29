import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import crimesData from './crimes.json';
import './App.css';

const center = { lat: 21.0000, lng: 57.0000 };
// dark map theme
const darkMapStyles = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const formatDateTime = (dateTime) => {
  try {
    // Handle both formats:
    // 1. The format from crimes.json (YYYY-MM-DD-HH-mm)
    // 2. The ISO format from new submissions
    
    let date;
    if (dateTime.includes('-') && dateTime.split('-').length >= 5) {
      // Format: YYYY-MM-DD-HH-mm
      const [year, month, day, hour, minute] = dateTime.split('-');
      date = new Date(year, month - 1, day, hour, minute);
    } else {
      // Try to parse as ISO string or other formats
      date = new Date(dateTime);
    }
    
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "Invalid date";
  }
};
  // Google Maps API 
function CrimeMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyDJlgkHsDAzlwDLv_mscFxLjLZEE0G3RKI',
  });
  // State vairables
  const [map, setMap] = useState(null);
  const [crimes, setCrimes] = useState([]);
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [newCrime, setNewCrime] = useState({
    crime_type: '',
    report_details: '',
    report_date_time: '',
    report_status: 'Pending',
    national_id: '',
    lat: 0,
    lng: 0,
  });
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load Crime data from .json
  useEffect(() => {
    try {
      setCrimes(crimesData.crimes);
    } catch (error) {
      console.error('Error loading crimes data:', error);
    }
  }, []);

  // Adjust map bounds to show all crimes
  useEffect(() => {
    if (map && crimes.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      crimes.forEach((crime) => bounds.extend({ lat: crime.lat, lng: crime.lng }));
      map.fitBounds(bounds);
    }
  }, [map, crimes]);
  // Form submission handle
  const handleReportClick = () => {
    setShowReportForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Get current date and format it as YYYY-MM-DD-HH-mm
    const now = new Date();
    const formattedDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;

    const newCrimeWithId = {
      ...newCrime,
      id: crimes.length + 1,
      report_date_time: formattedDateTime,
      report_status: 'Pending',
    };

    setCrimes([...crimes, newCrimeWithId]);
    setShowReportForm(false);
    setNewCrime({
      crime_type: '',
      report_details: '',
      report_date_time: '',
      report_status: 'Pending',
      national_id: '',
      lat: 0,
      lng: 0,
    });
    setIsSelectingLocation(false);
    setSelectedLocation(null);
  };
  //Other handlers ( Map click, Confirm location, Search)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCrime({ ...newCrime, [name]: value });
  };

  const handleMapClick = (e) => {
    if (isSelectingLocation) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedLocation({ lat, lng });
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      setNewCrime({ ...newCrime, lat: selectedLocation.lat, lng: selectedLocation.lng });
      setIsSelectingLocation(false);
      setSelectedLocation(null);
      setShowReportForm(true);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredCrimes = crimes.filter((crime) => {
    return (
      crime.crime_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crime.report_date_time.includes(searchQuery) ||
      crime.id.toString().includes(searchQuery)
    );
  });

  if (loadError) {
    return <p>Error loading Google Maps. Please try again later.</p>;
  }

  return isLoaded ? (
    <div className="app-container">
      <h1 className="mainheader">SHADOW WATCH PROGRAM</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by type, date, or ID..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="map-container" role="application" aria-label="Interactive map showing crime locations">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          onLoad={(map) => setMap(map)}
          onUnmount={() => setMap(null)}
          options={{ streetViewControl: false, mapTypeControl: false, styles: darkMapStyles }}
          onClick={handleMapClick}
        >
          {filteredCrimes.map((crime) => (
            <MarkerF
              key={crime.id}
              position={{ lat: crime.lat, lng: crime.lng }}
              title={crime.crime_type}
              onClick={() => setSelectedCrime(crime)}
              aria-label={`Crime: ${crime.crime_type} at ${crime.lat}, ${crime.lng}`}
            />
          ))}

          {selectedLocation && (
            <MarkerF
              position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              }}
            />
          )}

          {selectedCrime && (
            <InfoWindowF
              position={{ lat: selectedCrime.lat, lng: selectedCrime.lng }}
              onCloseClick={() => setSelectedCrime(null)}
            >
              <div className="info-window" onClick={(e) => e.stopPropagation()}>
                <h3>{selectedCrime.crime_type}</h3>
                <p><strong>Details:</strong> {selectedCrime.report_details}</p>
                <p><strong>Date & Time:</strong> {formatDateTime(selectedCrime.report_date_time)}</p>
                <p><strong>Status:</strong> {selectedCrime.report_status}</p>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>

      <div className="buttons-container">
        <button className="report-button" onClick={handleReportClick}>
          Report A Crime
        </button>

        <div className="location-buttons">
          {selectedLocation ? (
            <button className="confirm-location-button" onClick={handleConfirmLocation}>
              Confirm Selection
            </button>
          ) : (
            <button
              className="select-location-button"
              onClick={() => setIsSelectingLocation(!isSelectingLocation)}
            >
              Select Crime Location
            </button>
          )}
        </div>
      </div>

      {showReportForm && (
        <div className="report-form-overlay">
          <div className="report-form">
            <h2>Report a Crime</h2>
            <form onSubmit={handleFormSubmit}>
              <label>
                Crime Type:
                <select
                  name="crime_type"
                  value={newCrime.crime_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a crime type</option>
                  <option value="Assault">Assault</option>
                  <option value="Robbery">Robbery</option>
                  <option value="Homicide">Homicide</option>
                  <option value="Kidnapping">Kidnapping</option>
                </select>
              </label>
              <label>
                National ID:
                <input
                  type="text"
                  name="national_id"
                  value={newCrime.national_id}
                  onChange={handleInputChange}
                  pattern="[0-9]*"
                  required
                />
              </label>
              <label>
                Details:
                <textarea
                  name="report_details"
                  value={newCrime.report_details}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Latitude:
                <input
                  type="number"
                  name="lat"
                  value={newCrime.lat}
                  onChange={handleInputChange}
                  required
                  step="any"
                />
              </label>
              <label>
                Longitude:
                <input
                  type="number"
                  name="lng"
                  value={newCrime.lng}
                  onChange={handleInputChange}
                  required
                  step="any"
                />
              </label>
              <div className="form-buttons">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowReportForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  ) : (
    <p className="loading-message">Loading...</p>
  );
}

export default React.memo(CrimeMap);