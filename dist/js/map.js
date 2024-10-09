// Escapes HTML characters in a template literal string to prevent XSS.
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
    const jsonLink = mapDiv.getAttribute('data-link');
    const panelId = mapId.replace('map-', 'panel-'); // Assuming panel ID is related to map ID
    const key = mapDiv.getAttribute('data-key');
    const unit = mapDiv.getAttribute('data-format');

    // Create the map
    const map = new google.maps.Map(document.getElementById(mapId), {
      zoom: 7, // Initial zoom, will change based on locations
      center: { lat: 43.7376857, lng: -87.7226079 } // Initial center, will also change
    });

    const infoWindow = new google.maps.InfoWindow();
    const bounds = new google.maps.LatLngBounds();

    // Load GeoJSON and adjust the map bounds
    map.data.loadGeoJson(jsonLink, { idPropertyName: 'storeid' }, (features) => {
      features.forEach((feature) => {
        const geometry = feature.getGeometry();
        if (geometry.getType() === 'Point') {
          const coordinates = geometry.get();
          bounds.extend(coordinates);
        }
      });

      map.fitBounds(bounds);
      map.maxDefaultZoom = 15;

      google.maps.event.addListenerOnce(map, "bounds_changed", function () {
        this.setZoom(Math.min(this.getZoom(), this.maxDefaultZoom));
      });

      // Display stores in the panel
      const allStores = features.map((feature) => ({
        storeid: feature.getId(),
        distanceText: '', // Initialize distance
        distanceVal: 0 // Initialize distance value
      }));
      showStoresList(map.data, allStores, panelId, map, infoWindow, key, unit);
    });

    // Handle marker clicks
    map.data.addListener('click', (event) => {
      const storeid = event.feature.getId();
      showInfoWindowForStore(storeid, map, infoWindow, key);
    });

    // Create and add the search bar
    const searchContainerId = mapDiv.getAttribute('data-search'); // Get the related search div ID
    const searchContainer = document.getElementById(searchContainerId);

    if (searchContainer) {
      const card = document.createElement('div');
      const input = document.createElement('input');
      const options = { types: ['address'] };

      card.setAttribute('id', 'pac-card');
      input.setAttribute('id', 'pac-input');
      input.setAttribute('type', 'text');
      input.setAttribute('placeholder', 'Find a location');
      input.classList.add('form-control');
      card.appendChild(input);

      // Append the search bar to the searchContainer div
      searchContainer.appendChild(card);

      const autocomplete = new google.maps.places.Autocomplete(input, options);
      autocomplete.setFields(['address_components', 'geometry', 'name']);

      const originMarker = new google.maps.Marker({ map: map });
      originMarker.setVisible(false);
      let originLocation = map.getCenter();

      // Handle place changes
      autocomplete.addListener('place_changed', async () => {
        if (originMarker) {
          originMarker.setMap(null);
        }

        originLocation = map.getCenter();
        const place = autocomplete.getPlace();

        if (!place.geometry) {
          window.alert(`No address available for input: '${place.name}'`);
          return;
        }

        originLocation = place.geometry.location;
        map.setCenter(originLocation);

        const rankedStores = await calculateDistances(map.data, originLocation, unit);
        const maxRadiusMeters = 96560;
        const filteredStores = rankedStores.filter(store => store.distanceVal <= maxRadiusMeters);

        showStoresList(map.data, filteredStores, panelId, map, infoWindow, key, unit);

        const bounds = new google.maps.LatLngBounds();
        bounds.extend(originLocation);

        filteredStores.forEach((store) => {
          const storeFeature = map.data.getFeatureById(store.storeid);
          const storeLocation = storeFeature.getGeometry().get();
          bounds.extend(storeLocation);
        });

        map.fitBounds(bounds);

        map.maxDefaultZoom = 15;
        google.maps.event.addListenerOnce(map, "bounds_changed", function () {
          this.setZoom(Math.min(this.getZoom(), this.maxDefaultZoom));
        });
      });
    } else {
      console.error(`Search container with ID ${searchContainerId} not found.`);
    }
  });
}

// Calculate distances using Distance Matrix API
async function calculateDistances(data, origin, unit) {
  const stores = [];
  const destinations = [];

  data.forEach((store) => {
    const storeNum = store.getProperty('storeid');
    const storeLoc = store.getGeometry().get();
    stores.push(storeNum);
    destinations.push(storeLoc);
  });

  const service = new google.maps.DistanceMatrixService();

  const getDistanceMatrix = (service, parameters) => new Promise((resolve, reject) => {
    service.getDistanceMatrix(parameters, (response, status) => {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
        reject(response);
      } else {
        const distances = [];
        const results = response.rows[0].elements;

        results.forEach((element, j) => {
          if (element.distance) {
            distances.push({
              storeid: stores[j],
              distanceText: element.distance.text,
              distanceVal: element.distance.value
            });
          } else {
            console.log(`Distance not available for store ${stores[j]}`);
          }
        });

        resolve(distances);
      }
    });
  });

  const distancesList = await getDistanceMatrix(service, {
    origins: [origin],
    destinations: destinations,
    travelMode: 'DRIVING',
    unitSystem: unit === 'IMPERIAL' ? google.maps.UnitSystem.IMPERIAL : google.maps.UnitSystem.METRIC
  });

  distancesList.sort((a, b) => a.distanceVal - b.distanceVal);
  return distancesList;
}

function populateStoreData(store) {
  const storeData = {
    category: '',
    hours: '',
    description: '',
    name: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    storeid: '',
    
  };

  if (store) {
    if (store.getProperty('category')) {
      storeData.category = decodeHTMLEntities(store.getProperty('category'));
    }
    if (store.getProperty('hours')) {
      storeData.hours = decodeHTMLEntities(store.getProperty('hours'));
      // Remove extra quotes from hours
      if (storeData.hours.startsWith('"') && storeData.hours.endsWith('"')) {
        storeData.hours = storeData.hours.slice(1, -1);
      }
    }
    if (store.getProperty('description')) {
      storeData.description = decodeHTMLEntities(store.getProperty('description'));
      // Remove extra quotes from description
      if (storeData.description.startsWith('"') && storeData.description.endsWith('"')) {
        storeData.description = storeData.description.slice(1, -1);
      }
    }
    if (store.getProperty('name')) {
      storeData.name = decodeHTMLEntities(store.getProperty('name'));
    }
    if (store.getProperty('phone')) {
      storeData.phone = decodeHTMLEntities(store.getProperty('phone'));
    }
    if (store.getProperty('email')) {
      storeData.email = decodeHTMLEntities(store.getProperty('email'));
    }
    if (store.getProperty('website')) {
      storeData.website = decodeHTMLEntities(store.getProperty('website'));
    }
    if (store.getProperty('address')) {
      storeData.address = decodeHTMLEntities(store.getProperty('address'));
    }
    if (store.getProperty('storeid')) {
      storeData.storeid = decodeHTMLEntities(store.getProperty('storeid'));
    }
  } else {
    console.log('Properties object is undefined for store:', store);
  }

  return storeData;
}

// Function to show the info window for a store
function showInfoWindowForStore(storeId, map, infoWindow, key) {
  const store = map.data.getFeatureById(storeId);
  if (!store) {
    console.log('Store not found for ID:', storeID);
    return;
  }

  const storeLocation = store.getGeometry().get();
  const storeData = populateStoreData(store);

  let content = `
    <div class="info-window">
      <h4>${storeData.name}</h4>
  `;

  if (storeData.address) {
    content += `<p><b>Address:</b> <br>${storeData.address} <br><a href="https://www.google.com/maps/dir//${encodeURIComponent(storeData.address)}" target="_blank">Get directions</a></p>`;
  }

  if (storeData.description) {
    content += `<p>${storeData.description}</p>`;
  }

  if (storeData.category) {
    content += `<p><b>Category:</b> ${storeData.category}</p>`;
  }

  if (storeData.hours) {
    content += `<p><b>Open:</b> ${storeData.hours}</p>`;
  }

  if (storeData.phone) {
    content += `<p><b>Phone:</b> ${storeData.phone}</p>`;
  }

  content += `
      <p><img src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${storeLocation.lat()},${storeLocation.lng()}&key=${key}"></p>
    </div>
  `;

  map.setCenter(storeLocation);
  infoWindow.setContent(content);
  infoWindow.setPosition(storeLocation);
  infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) });
  infoWindow.open(map);
}

// Show the list of stores in the specified panel
function showStoresList(data, stores, panelId, map, infoWindow, key, unit) {
  if (stores.length === 0) {
    console.log('No stores found');
    return;
  }

  const panel = document.getElementById(panelId);

  if (panel) {
    while (panel.lastChild) {
      panel.removeChild(panel.lastChild);
    }

    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group');

    stores.forEach((store) => {
      const currentStore = data.getFeatureById(store.storeid);
      const storeData = populateStoreData(currentStore);

      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item');
      
      const name = document.createElement('h5');
      name.classList.add('place');
      
      name.textContent = storeData.name;
      listItem.appendChild(name);

      const address = document.createElement('p');
      address.classList.add('place-address');
      address.textContent = storeData.address;
      listItem.appendChild(address);

      if (store.distanceText) {
        const distanceText = document.createElement('p');
        distanceText.classList.add('distanceText');
        distanceText.textContent = store.distanceText;
        listItem.appendChild(distanceText);
      }

      listGroup.appendChild(listItem);

      listItem.addEventListener('click', () => {
        showInfoWindowForStore(store.storeid, map, infoWindow, key);
      });
    });
    panel.appendChild(listGroup);

  } else {
    console.log(`Panel with ID ${panelId} not found`);
  }
}

function decodeHTMLEntities(encodedString) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = encodedString;
  return textarea.value;
}