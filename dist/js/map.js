// Escapes HTML characters in a template literal string, to prevent XSS.
// See https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content
function sanitizeHTML(strings, ...values) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' };
  return strings.reduce((result, string, i) => {
    const value = values[i - 1];
    const escapedValue = String(value).replace(/[&<>'"]/g, (char) => entities[char]);
    return result + escapedValue + string;
  });
}

function initMap() {
  const mapDivs = document.querySelectorAll('div[id^="map-"]');

  mapDivs.forEach((mapDiv) => {
    const mapId = mapDiv.id;
    const json_link = mapDiv.getAttribute('data-link');
    const panelId = mapId.replace('map-', 'panel-'); // Assuming panel ID is related to map ID
    const key = mapDiv.getAttribute('data-key');
    const unit = mapDiv.getAttribute('data-format');

    // Create the map.
    const map = new google.maps.Map(document.getElementById(mapId), {
      zoom: 7, // Initial zoom, this will change based on locations
      center: { lat: 43.7376857, lng: -87.7226079 }, // Initial center, this will also change
    });

    // Create a LatLngBounds object to calculate the map's bounds
    const bounds = new google.maps.LatLngBounds();

    // Load the stores GeoJSON onto the map.
    map.data.loadGeoJson(json_link, { idPropertyName: 'storeid' }, function (features) {
      features.forEach(function (feature) {
        const geometry = feature.getGeometry();
        if (geometry.getType() === 'Point') {
          const coordinates = geometry.get();
          bounds.extend(coordinates); // Extend the bounds to include this location
        }
      });
      map.fitBounds(bounds);

      map.maxDefaultZoom = 15;
      google.maps.event.addListenerOnce(map, "bounds_changed", function () {
        this.setZoom(Math.min(this.getZoom(), this.maxDefaultZoom));
      });
    });

    // Define the custom marker icons, using the store's "category".
    const apiKey = '$key';
    const infoWindow = new google.maps.InfoWindow();

    map.data.addListener('click', (event) => {
      const category = event.feature.getProperty('category');
      const name = event.feature.getProperty('name');
      const description = event.feature.getProperty('description') || ' ';
      const hours = event.feature.getProperty('hours') || 'Hours not available';
      const phone = event.feature.getProperty('phone') || 'Phone not available';
      const position = event.feature.getGeometry().get();

      const content = sanitizeHTML`
        <div style="margin-left:20px; margin-bottom:20px;">
          <h2>${name}</h2><p>${description}</p>
          <p><b>Category:</b> ${category}</p>
          <p><b>Open:</b> ${hours}<br/><b>Phone:</b> ${phone}</p>
          <p><img src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${key}&solution_channel=GMP_codelabs_simplestorelocator_v1_a"></p>
        </div>
      `;

      infoWindow.setContent(content);
      infoWindow.setPosition(position);
      infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) });
      infoWindow.open(map);
    });

    // Build and add the search bar
    const card = document.createElement('div');
    const titleBar = document.createElement('div');
    const title = document.createElement('div');
    const container = document.createElement('div');
    const input = document.createElement('input');
    const options = { types: ['address'] };

    card.setAttribute('id', 'pac-card');
    title.setAttribute('id', 'title');
    title.textContent = 'Find the nearest store';
    titleBar.appendChild(title);
    container.setAttribute('id', 'pac-container');
    input.setAttribute('id', 'pac-input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Enter an address');
    container.appendChild(input);
    card.appendChild(titleBar);
    card.appendChild(container);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

    const autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.setFields(['address_components', 'geometry', 'name']);

    const originMarker = new google.maps.Marker({ map: map });
    originMarker.setVisible(false);
    let originLocation = map.getCenter();

    autocomplete.addListener('place_changed', async () => {
      if (originMarker) {
        originMarker.setMap(null); // Remove the previous marker if relevant
      }

      originLocation = map.getCenter();
      const place = autocomplete.getPlace();

      if (!place.geometry) {
        window.alert(`No address available for input: '${place.name}'`);
        return;
      }

      // Recenter the map to the selected address
      originLocation = place.geometry.location;
      map.setCenter(originLocation);

      // Use the selected address as the origin to calculate distances
      const rankedStores = await calculateDistances(map.data, originLocation);

      // Filter stores by max radius of 60 miles (96,560 meters)
      const maxRadiusMeters = 96560;
      const filteredStores = rankedStores.filter(store => store.distanceVal <= maxRadiusMeters);

      // Show the filtered stores in the relevant panel
      showStoresList(map.data, filteredStores, panelId);

      // Create a new LatLngBounds object to adjust the map bounds
      const bounds = new google.maps.LatLngBounds();

      // Extend the bounds to include the user's searched location
      bounds.extend(originLocation);

      // Extend the bounds to include each store location within the max radius
      filteredStores.forEach((store) => {
        const storeFeature = map.data.getFeatureById(store.storeid);
        const storeLocation = storeFeature.getGeometry().get();
        bounds.extend(storeLocation);
      });

      // Adjust the map to fit all markers within the bounds
      map.fitBounds(bounds);

      map.maxDefaultZoom = 15;
      google.maps.event.addListenerOnce(map, "bounds_changed", function () {
        this.setZoom(Math.min(this.getZoom(), this.maxDefaultZoom));
      });

      return;
    });
  });
}

/**
 * Use Distance Matrix API to calculate distance from origin to each store.
 * @param {google.maps.Data} data The geospatial data object layer for the map
 * @param {google.maps.LatLng} origin Geographical coordinates in latitude
 * and longitude
 * @return {Promise<object[]>} A promise fulfilled by an array of objects with
 * a distanceText, distanceVal, and storeid property, sorted ascending
 * by distanceVal.
 */
async function calculateDistances(data, origin) {
  const stores = [];
  const destinations = [];

  // Build parallel arrays for the store IDs and destinations
  data.forEach((store) => {
    const storeNum = store.getProperty('storeid');
    const storeLoc = store.getGeometry().get();

    stores.push(storeNum);
    destinations.push(storeLoc);
  });

  // Retrieve the distances of each store from the origin
  // The returned list will be in the same order as the destinations list
  const service = new google.maps.DistanceMatrixService();
  const getDistanceMatrix = (service, parameters) => new Promise((resolve, reject) => {
    service.getDistanceMatrix(parameters, (response, status) => {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
        reject(response);
      } else {
        const distances = [];
        const results = response.rows[0].elements;

        for (let j = 0; j < results.length; j++) {
          const element = results[j];

          // Check if distance is available before accessing it
          if (element.distance) {
            const distanceText = element.distance.text;
            const distanceVal = element.distance.value;
            const distanceObject = {
              storeid: stores[j],
              distanceText: distanceText,
              distanceVal: distanceVal,
            };
            distances.push(distanceObject);
          } else {
            console.log(`Distance not available for store ${stores[j]}`);
          }
        }

        resolve(distances);
      }
    });
  });

  const distancesList = await getDistanceMatrix(service, {
    origins: [origin],
    destinations: destinations,
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.$unit,
  });

  distancesList.sort((first, second) => {
    return first.distanceVal - second.distanceVal;
  });

  return distancesList;
}

// Function to show the list of stores in the specified panel
function showStoresList(data, stores, panelId) {
  if (stores.length == 0) {
    console.log('No stores found');
    return;
  }

  let panel = document.getElementById(panelId);

  if (panel) {
    panel.style.display = 'block';

    while (panel.lastChild) {
      panel.removeChild(panel.lastChild);
    }

    stores.forEach((store) => {
      const name = document.createElement('p');
      name.classList.add('place');
      const currentStore = data.getFeatureById(store.storeid);
      name.textContent = currentStore.getProperty('name');
      panel.appendChild(name);

      const distanceText = document.createElement('p');
      distanceText.classList.add('distanceText');
      distanceText.textContent = store.distanceText;
      panel.appendChild(distanceText);
    });

    panel.classList.add('open');
  } else {
    console.log(`Panel with ID ${panelId} not found`);
  }
}
