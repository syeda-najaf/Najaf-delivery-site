const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        if (error.code === 1) {
          reject(new Error("Location permission was denied. Please allow location access in your browser."));
        } else if (error.code === 2) {
          reject(new Error("Your location could not be determined. Please try again."));
        } else if (error.code === 3) {
          reject(new Error("Location request timed out. Please try again."));
        } else {
          reject(new Error("Unable to read your location."));
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
        ...options,
      }
    );
  });
}

export async function reverseGeocode(lat, lng) {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to fetch your address right now.");
  }

  const data = await response.json();
  return {
    displayName: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    address: data.address || {},
  };
}

export async function getDrivingRoute(from, to) {
  if (!from || !to) return null;

  const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = `${OSRM_URL}/${coordinates}?overview=full&geometries=geojson&steps=false`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to calculate the route right now.");
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes || !data.routes.length) {
    return null;
  }

  const route = data.routes[0];

  return {
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    coordinates: (route.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]),
  };
}

export function saveLocation(location) {
  localStorage.setItem("najaf_location", JSON.stringify(location));
}

export function getSavedLocation() {
  try {
    return JSON.parse(localStorage.getItem("najaf_location") || "null");
  } catch {
    return null;
  }
}

export function clearSavedLocation() {
  localStorage.removeItem("najaf_location");
}
