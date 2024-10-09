// Helper to create and append elements
function createElement(tag, classNames, textContent = '') {
  const element = document.createElement(tag);
  if (classNames) element.className = classNames;
  if (textContent) element.textContent = textContent;
  return element;
}

// Escapes HTML characters in a string to prevent XSS
function escapeHTML(str) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, (char) => entities[char]);
}

// Function to replace line breaks with <br> tags
function formatWithLineBreaks(text) {
  return text ? text.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
}

// Decodes any HTML entities in the string
function decodeHTMLEntities(encodedString) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = encodedString;
  return textarea.value;
}

// Removes any leading or trailing double quotes from the string
function stripDoubleQuotes(text) {
  return text ? text.replace(/^"(.*)"$/, '$1') : '';
}

// Populates store data from a GeoJSON feature and formats text fields
function populateStoreData(store) {
  const properties = ['category', 'hours', 'description', 'store_name', 'phone', 'email', 'website', 'full_address', 'address', 'address_2', 'city', 'state', 'postal_code', 'country', 'storeid'];
  const storeData = {};

  properties.forEach(prop => {
      let value = store?.getProperty(prop);
      if (prop === 'hours' || prop === 'description') {
          // Apply line break formatting for hours and description, and strip quotes
          storeData[prop] = value ? stripDoubleQuotes(formatWithLineBreaks(decodeHTMLEntities(value))) : '';
      } else {
          storeData[prop] = value ? decodeHTMLEntities(value) : '';
      }
  });

  return storeData;
}

// Displays info window for a selected store
function showInfoWindowForStore(storeId, map, infoWindow, key) {
  const store = map.data.getFeatureById(storeId);
  if (!store) {
      console.error('Store not found for ID:', storeId);
      return;
  }

  const storeLocation = store.getGeometry().get();
  const storeData = populateStoreData(store);

  // Start building the content with mandatory fields
  let content = `
      <div class="info-window">
          <h4>${storeData.store_name}</h4>
  `;

  // Conditionally add other fields only if they exist
  if (storeData.full_address) {
      content += `
          <p><b>Address:</b><br> ${storeData.full_address}
          <br><a href="https://www.google.com/maps/dir//${encodeURIComponent(storeData.full_address)}" target="_blank">Get directions</a></p>
      `;
  }

  if (storeData.description) {
      // Use innerHTML to render the HTML tags correctly and ensure quotes are stripped
      content += `<p>${storeData.description}</p>`;
  }

  if (storeData.category) {
      content += `<p><b>Category:</b> ${storeData.category}</p>`;
  }

  if (storeData.hours) {
      // Ensure quotes are stripped
      content += `<p><b>Open:</b> ${storeData.hours}</p>`;
  }

  if (storeData.phone) {
      content += `<p><b>Phone:</b> ${storeData.phone}</p>`;
  }

  // Street View image (assumed to always be present)
  content += `
      <p><img src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${storeLocation.lat()},${storeLocation.lng()}&key=${key}"></p>
  `;

  // Close the content div
  content += `</div>`;

  // Set the content in the info window and display it
  map.setCenter(storeLocation);
  infoWindow.setContent(content);
  infoWindow.setPosition(storeLocation);
  infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) });
  infoWindow.open(map);
}

// Displays a list of stores in a panel
function showStoresList(data, stores, panelId, map, infoWindow, key, unit) {
  const panel = document.getElementById(panelId);
  if (!panel) {
      console.error(`Panel with ID ${panelId} not found`);
      return;
  }

  // Clear the previous content
  panel.innerHTML = '';

  const listGroup = createElement('ul', 'list-group');

  stores.forEach(store => {
      const currentStore = data.getFeatureById(store.storeid);
      const storeData = populateStoreData(currentStore);

      // Create list item for each store
      const listItem = createElement('li', 'list-group-item');

      // Store name
      const name = createElement('h5', 'place', storeData.store_name);
      listItem.appendChild(name);

      // Build address display and decode HTML entities
      let addressContent = decodeHTMLEntities(storeData.address);
      if (storeData.address_2) {
          addressContent += `, ${decodeHTMLEntities(storeData.address_2)}`;
      }
      addressContent += `<br>${decodeHTMLEntities(storeData.city)}, ${decodeHTMLEntities(storeData.state)} ${decodeHTMLEntities(storeData.postal_code)}`;
      if (storeData.country) {
          addressContent += `<br>${decodeHTMLEntities(storeData.country).toUpperCase()}`;
      }

      // Create the address <p> element and set innerHTML to render the <br> tags correctly
      const address = document.createElement('p');
      address.classList.add('place-address');
      address.innerHTML = addressContent;

      listItem.appendChild(address);

      // Create a <p> for distanceText if it exists
      if (store.distanceText) {
          const distanceText = document.createElement('p');
          distanceText.classList.add('distanceText');
          distanceText.textContent = store.distanceText;
          listItem.appendChild(distanceText);
      }

      // Directions button in a <p> tag
      if (storeData.full_address) {
          const directionsWrapper = createElement('p', 'contact-directions');
          const directionsButton = createElement('a', 'btn btn-lg btn-light', 'Get Directions');
          const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeData.full_address)}&travelmode=driving`;
          directionsButton.href = googleMapsLink;
          directionsButton.target = '_blank'; // Open in a new tab
          directionsWrapper.appendChild(directionsButton);
          listItem.appendChild(directionsWrapper);
      }

      // Add click event to show info window on click
      listItem.addEventListener('click', () => {
          showInfoWindowForStore(store.storeid, map, infoWindow, key);
      });

      listGroup.appendChild(listItem);
  });

  // Append the list group to the panel
  panel.appendChild(listGroup);
}

// Initializes the map and loads GeoJSON data
function initMap() {
  const mapDivs = document.querySelectorAll('div[id^="map-"]');
  mapDivs.forEach(mapDiv => {
      const mapId = mapDiv.id;
      const jsonLink = mapDiv.getAttribute('data-link');
      const panelId = mapId.replace('map-', 'panel-');
      const key = mapDiv.getAttribute('data-key');
      const unit = mapDiv.getAttribute('data-format');
      const searchContainerId = mapDiv.getAttribute('data-search');

      const map = createMap(mapId);
      const infoWindow = new google.maps.InfoWindow();
      const bounds = new google.maps.LatLngBounds();

      loadGeoJson(map, jsonLink, bounds).then(features => {
          map.fitBounds(bounds);
          map.maxDefaultZoom = 15;

          google.maps.event.addListenerOnce(map, "bounds_changed", () => {
              map.setZoom(Math.min(map.getZoom(), map.maxDefaultZoom));
          });

          const allStores = features.map(feature => ({
              storeid: feature.getId(),
              distanceText: '',
              distanceVal: 0
          }));
          showStoresList(map.data, allStores, panelId, map, infoWindow, key, unit);
      });

      map.data.addListener('click', event => {
          showInfoWindowForStore(event.feature.getId(), map, infoWindow, key);
      });

      createSearchBar(map, searchContainerId, panelId, key, unit, infoWindow);
  });
}

// Creates and returns a Google Map instance
function createMap(mapId) {
  return new google.maps.Map(document.getElementById(mapId), {
      zoom: 7,
      center: { lat: 43.7376857, lng: -87.7226079 }
  });
}

// Loads GeoJSON and adjusts map bounds
function loadGeoJson(map, jsonLink, bounds) {
  return new Promise(resolve => {
      map.data.loadGeoJson(jsonLink, { idPropertyName: 'storeid' }, features => {
          features.forEach(feature => {
              const geometry = feature.getGeometry();
              if (geometry.getType() === 'Point') {
                  bounds.extend(geometry.get());
              }
          });
          resolve(features);
      });
  });
}

// Creates and adds a search bar to the map
function createSearchBar(map, searchContainerId, panelId, key, unit, infoWindow) {
  const searchContainer = document.getElementById(searchContainerId);
  if (!searchContainer) {
      console.error(`Search container with ID ${searchContainerId} not found.`);
      return;
  }

  const card = createElement('div', 'pac-card');
  const input = createElement('input', 'form-control');
  input.id = 'pac-input';
  input.type = 'text';
  input.placeholder = 'Find a location';

  card.appendChild(input);
  searchContainer.appendChild(card);

  const autocomplete = new google.maps.places.Autocomplete(input, { types: ['address'] });
  autocomplete.setFields(['address_components', 'geometry', 'name']);
  const originMarker = new google.maps.Marker({ map: map, visible: false });
  let originLocation = map.getCenter();

  autocomplete.addListener('place_changed', async () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
          alert(`No address available for input: '${place.name}'`);
          return;
      }

      originLocation = place.geometry.location;
      map.setCenter(originLocation);
      const rankedStores = await calculateDistances(map.data, originLocation, unit);
      const maxRadiusMeters = 96560;
      const filteredStores = rankedStores.filter(store => store.distanceVal <= maxRadiusMeters);
      showStoresList(map.data, filteredStores, panelId, map, infoWindow, key, unit);
      adjustMapBounds(map, originLocation, filteredStores);
  });
}

// Adjusts the map bounds based on store locations
function adjustMapBounds(map, originLocation, stores) {
  const bounds = new google.maps.LatLngBounds();
  bounds.extend(originLocation);
  stores.forEach(store => {
      const storeFeature = map.data.getFeatureById(store.storeid);
      bounds.extend(storeFeature.getGeometry().get());
  });
  map.fitBounds(bounds);
  map.maxDefaultZoom = 15;
  google.maps.event.addListenerOnce(map, "bounds_changed", () => {
      map.setZoom(Math.min(map.getZoom(), map.maxDefaultZoom));
  });
}

// Calculates distances to stores using Google Distance Matrix API
async function calculateDistances(data, origin, unit) {
  const stores = [];
  const destinations = [];

  data.forEach(store => {
      stores.push(store.getProperty('storeid'));
      destinations.push(store.getGeometry().get());
  });

  const service = new google.maps.DistanceMatrixService();
  const parameters = {
      origins: [origin],
      destinations: destinations,
      travelMode: 'DRIVING',
      unitSystem: unit === 'IMPERIAL' ? google.maps.UnitSystem.IMPERIAL : google.maps.UnitSystem.METRIC
  };

  return new Promise((resolve, reject) => {
      service.getDistanceMatrix(parameters, (response, status) => {
          if (status !== 'OK') {
              reject(response);
          } else {
              const distances = response.rows[0].elements.map((element, index) => ({
                  storeid: stores[index],
                  distanceText: element.distance?.text || '',
                  distanceVal: element.distance?.value || 0
              }));
              resolve(distances.sort((a, b) => a.distanceVal - b.distanceVal));
          }
      });
  });
}
