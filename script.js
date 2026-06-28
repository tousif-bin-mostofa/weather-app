// script.js

/*
  script.js — All behaviour and API logic for the Weather App.

  How this file is organised:
  ┌─────────────────────────────────────────────────┐
  │ 1. Configuration (API key & base URLs)          │
  │ 2. DOM element references                       │
  │ 3. Core weather functions                       │
  │    ├─ showLoading()                             │
  │    ├─ hideLoading()                             │
  │    ├─ showError(message)                        │
  │    ├─ clearError()                              │
  │    ├─ displayWeather(data)                      │
  │    └─ fetchWeather(city)                        │
  │ 4. City autocomplete / suggestions              │
  │    ├─ fetchSuggestions(query)                   │
  │    ├─ showSuggestions(cities)                   │
  │    ├─ hideSuggestions()                         │
  │    └─ selectSuggestion(cityName)                │
  │ 5. handleSearch() — orchestrator                │
  │ 6. Event listeners (search + autocomplete)      │
  │ 7. Initialisation                               │
  └─────────────────────────────────────────────────┘

  We use async/await to handle the API call cleanly,
  and try/catch to deal with any errors gracefully.
*/


/* ─────────────────────────────────────────────
   1. CONFIGURATION
───────────────────────────────────────────── */

// Replace 'YOUR_API_KEY_HERE' with your free API key from https://openweathermap.org/api const API_KEY = 'YOUR_NEW_KEY_HERE';
const API_KEY = 'ffedd8052fd12a1bf2f06c880f7d12da';
/*
  The OpenWeatherMap Current Weather endpoint.
  We will append the city name and API key when we make a request.
  `units=metric` tells the API to return temperatures in Celsius.
*/
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/*
  Geocoding API — returns up to N city matches for a partial name.
  We use this to power the live city suggestions dropdown.
  Docs: https://openweathermap.org/api/geocoding-api
*/
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';

/*
  Icon URL template.
  OpenWeatherMap returns an icon code like "10d" (day rain).
  We append @2x.png to get the double-resolution (Retina) version.
*/
const ICON_URL = 'https://openweathermap.org/img/wn/';


/* ─────────────────────────────────────────────
   2. DOM ELEMENT REFERENCES
   We cache references to the elements we'll need
   to read from or write to so we don't have to
   query the DOM repeatedly.
───────────────────────────────────────────── */
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');
const weatherCard = document.getElementById('weather-card');
const loadingState = document.getElementById('loading-state');
const weatherContent = document.getElementById('weather-content');

// Elements inside the weather card that we'll populate with data
const cityNameEl = document.getElementById('city-name');
const countryCodeEl = document.getElementById('country-code');
const weatherIconEl = document.getElementById('weather-icon');
const conditionEl = document.getElementById('condition-desc');
const temperatureEl = document.getElementById('temperature');
const feelsLikeEl = document.getElementById('feels-like');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const visibilityEl = document.getElementById('visibility');

// The suggestions dropdown <ul> element
const suggestionsEl = document.getElementById('suggestions-list');


/* ─────────────────────────────────────────────
   3. CORE FUNCTIONS
───────────────────────────────────────────── */

/**
 * showLoading
 * -----------
 * Reveals the weather card and shows the spinning
 * loading indicator while hiding the actual results.
 *
 * We also clear any previous error message so the
 * UI doesn't show stale information.
 */
function showLoading() {
  clearError();

  // Make the card visible (adds the .show class which triggers CSS animation)
  weatherCard.classList.add('show');

  // Show the spinner section
  loadingState.classList.add('active');

  // Hide the weather data section (it's shown once data arrives)
  weatherContent.classList.remove('active');
}


/**
 * hideLoading
 * -----------
 * Hides the loading spinner and reveals the weather
 * content section with the fetched data.
 */
function hideLoading() {
  loadingState.classList.remove('active');
  weatherContent.classList.add('active');
}


/**
 * showError
 * ---------
 * Displays a friendly error message inside the UI.
 * Also hides the weather card so stale data isn't shown.
 *
 * @param {string} message - The human-readable error text to display.
 */
function showError(message) {
  // Write the error text into the element
  errorMessage.textContent = message;

  // Add the .visible class so CSS changes `display: none` → `display: block`
  errorMessage.classList.add('visible');

  // Hide the weather card (we don't want to show old/stale data)
  weatherCard.classList.remove('show');
}


/**
 * clearError
 * ----------
 * Removes any currently displayed error message.
 */
function clearError() {
  errorMessage.textContent = '';
  errorMessage.classList.remove('visible');
}


/**
 * displayWeather
 * --------------
 * Takes the raw JSON response from the OpenWeatherMap API
 * and populates the weather card with formatted values.
 *
 * @param {Object} data - The parsed JSON response object from the API.
 *
 * Key fields we use from the response:
 *   data.name               → city name
 *   data.sys.country        → 2-letter country code (e.g. "GB")
 *   data.main.temp          → temperature in °C (because we used units=metric)
 *   data.main.feels_like    → feels-like temperature in °C
 *   data.main.humidity      → humidity as a percentage (0–100)
 *   data.weather[0].description → human-readable condition (e.g. "light rain")
 *   data.weather[0].icon    → icon code string (e.g. "10d")
 *   data.wind.speed         → wind speed in m/s — we convert to km/h
 *   data.visibility         → visibility in metres — we convert to km
 */
function displayWeather(data) {
  // ── Location ──
  cityNameEl.textContent = data.name;
  countryCodeEl.textContent = data.sys.country;

  // ── Weather icon ──
  // Build the full icon URL using the icon code from the API
  weatherIconEl.src = `${ICON_URL}${data.weather[0].icon}@2x.png`;
  // Update the alt text for screen readers (describes the condition)
  weatherIconEl.alt = data.weather[0].description;

  // ── Condition description ──
  // The API returns lowercase (e.g. "light rain"); CSS capitalises the first letter
  conditionEl.textContent = data.weather[0].description;

  // ── Temperature ──
  // Math.round removes the decimal for a cleaner display
  temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;

  // ── Stats ──

  // Feels like temperature
  feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;

  // Humidity — already a whole number percentage
  humidityEl.textContent = `${data.main.humidity}%`;

  /*
    Wind speed: the API returns metres per second (m/s).
    Multiply by 3.6 to convert to kilometres per hour (km/h).
    Math.round keeps the display tidy.
  */
  windSpeedEl.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;

  /*
    Visibility: the API returns metres.
    Divide by 1000 to convert to kilometres.
    toFixed(1) shows one decimal place (e.g. "9.5 km").
  */
  visibilityEl.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

  // ── Reveal the results ──
  hideLoading();
}


/**
 * fetchWeather
 * ------------
 * Makes the API call to OpenWeatherMap.
 *
 * Accepts an options object with ONE of two forms:
 *   { query }       → search by city name (used when the user types manually)
 *   { lat, lon }    → search by exact coordinates (used when a suggestion is
 *                     selected, so "Moscow, Idaho" and "Moscow, Russia" get
 *                     completely different results)
 *
 * Why coordinates fix the bug:
 *   Searching by name (q=Moscow) lets OWM choose which Moscow to return —
 *   it always picks the most prominent one (Russia). Searching by lat/lon
 *   is unambiguous: every point on Earth is unique.
 *
 * @param {{ query?: string, lat?: number, lon?: number }} options
 */
async function fetchWeather({ query = null, lat = null, lon = null } = {}) {
  // Build the URL differently depending on whether we have coordinates
  let url;
  if (lat !== null && lon !== null) {
    // Coordinate-based lookup — precise, no ambiguity
    url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  } else {
    // Name-based lookup — used for manual text searches
    url = `${BASE_URL}?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric`;
  }

  try {
    // Show the spinner while we wait for the API response
    showLoading();

    // Make the HTTP request and wait for the server to respond
    const response = await fetch(url);

    // Parse the JSON body of the response
    const data = await response.json();

    // Check if the server returned an error status code
    if (!response.ok) {
      /*
        response.status 404 means the city name wasn't recognised by the API.
        Any other non-OK status is treated as a generic server error.
      */
      if (response.status === 404) {
        showError('City not found. Please check the spelling and try again.');
      } else {
        showError(`Something went wrong (Error ${response.status}). Please try again.`);
      }

      // Hide the card since we have no valid data to show
      weatherCard.classList.remove('show');
      return; // Exit the function early
    }

    // 🎉 Success — populate the card with the weather data
    displayWeather(data);

  } catch (error) {
    /*
      The catch block runs when there's a network-level problem:
      e.g. the user is offline, a CORS issue, a DNS failure.
      We show a friendly message instead of crashing.
    */
    showError('Something went wrong. Please check your internet connection and try again.');

    // Hide the card in case it was partially shown
    weatherCard.classList.remove('show');
  }
}


/* ─────────────────────────────────────────────
   4. HANDLE SEARCH — ORCHESTRATOR FUNCTION
   This function validates the user's input and
   then kicks off the API call.
───────────────────────────────────────────── */

/**
 * handleSearch
 * ------------
 * Called when the user clicks the search button OR presses Enter.
 * Validates the input field, then calls fetchWeather if valid.
 */
function handleSearch() {
  /*
    .trim() removes leading and trailing whitespace so that a user
    typing only spaces doesn't count as a valid city name.
  */
  const city = cityInput.value.trim();

  // Guard: don't proceed if the input is empty
  if (city === '') {
    showError('Please enter a city name.');
    return;
  }

  // Input is valid — start the fetch
  fetchWeather(city);
}


/* ─────────────────────────────────────────────
   4. CITY AUTOCOMPLETE — SUGGESTION FUNCTIONS
───────────────────────────────────────────── */

/*
  debounceTimer — holds the ID returned by setTimeout.
  We clear and restart it every time the user types a character
  so the API is only called after they pause for 350ms.
  This prevents firing a network request on every single keystroke.
*/
let debounceTimer = null;

/*
  highlightedIndex — tracks which suggestion row is currently
  highlighted via keyboard arrows (-1 = none).
*/
let highlightedIndex = -1;


/**
 * fetchSuggestions
 * ----------------
 * Calls the OpenWeatherMap Geocoding API with the user's partial
 * city name and passes the results to showSuggestions().
 *
 * The Geocoding API endpoint:
 *   GET /geo/1.0/direct?q={query}&limit=5&appid={API_KEY}
 *
 * It returns an array of matching locations, each with:
 *   .name     — city name
 *   .country  — 2-letter country code (e.g. "GB")
 *   .state    — state / region (not always present)
 *
 * @param {string} query — The text typed by the user.
 */
async function fetchSuggestions(query) {
  // Don't fire the API for very short queries — not useful
  if (query.length < 2) {
    hideSuggestions();
    return;
  }

  try {
    const url = `${GEO_URL}?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) { hideSuggestions(); return; }

    const cities = await response.json();
    showSuggestions(cities);
  } catch {
    // Network error — silently hide the dropdown (don't block typing)
    hideSuggestions();
  }
}


/**
 * showSuggestions
 * ---------------
 * Builds the list of <li> suggestion items from the API results
 * and makes the dropdown visible.
 *
 * @param {Array} cities — Array of city objects from the Geocoding API.
 */
function showSuggestions(cities) {
  // Clear whatever was in the list before
  suggestionsEl.innerHTML = '';
  highlightedIndex = -1;

  // If the API returned no matches, hide the dropdown
  if (!cities || cities.length === 0) {
    hideSuggestions();
    return;
  }

  // Build one <li> per city result
  cities.forEach((city) => {
    const li = document.createElement('li');
    li.className = 'suggestion-item';
    li.setAttribute('role', 'option');

    /*
      Build the sub-label: "State, Country" if state exists,
      otherwise just "Country". This helps disambiguate cities
      with the same name in different countries (e.g. "Springfield").
    */
    const subLabel = city.state
      ? `${city.state}, ${city.country}`
      : city.country;

    /*
      Store lat, lon, and name directly on the DOM element as data attributes.
      This lets us retrieve the exact coordinates when the user selects this
      row via mouse click OR keyboard — without needing a separate data array.
    */
    li.dataset.lat = city.lat;
    li.dataset.lon = city.lon;
    li.dataset.name = city.name;

    // SVG location-pin icon — purely decorative (aria-hidden)
    li.innerHTML += `
      <svg class="suggestion-pin-icon" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round"
           stroke-linejoin="round" aria-hidden="true" focusable="false">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      <span class="suggestion-text">
        <span class="suggestion-name">${city.name}</span>
        <span class="suggestion-sub">${subLabel}</span>
      </span>
    `;

    /*
      Use mousedown instead of click so the event fires BEFORE
      the input loses focus (blur). This prevents the dropdown
      from disappearing before the click is registered.

      Pass the full city object (with lat/lon) so fetchWeather can
      use coordinates — not just the name.
    */
    li.addEventListener('mousedown', (e) => {
      e.preventDefault();               // stop the input from blurring
      selectSuggestion(city);           // pass full city object
    });

    suggestionsEl.appendChild(li);
  });

  // Update aria-expanded on the input to inform screen readers
  cityInput.setAttribute('aria-expanded', 'true');

  // Show the dropdown
  suggestionsEl.classList.add('visible');
}


/**
 * hideSuggestions
 * ---------------
 * Hides the suggestions dropdown and resets keyboard state.
 */
function hideSuggestions() {
  suggestionsEl.classList.remove('visible');
  suggestionsEl.innerHTML = '';
  highlightedIndex = -1;
  cityInput.setAttribute('aria-expanded', 'false');
}


/**
 * selectSuggestion
 * ----------------
 * Called when the user clicks or keyboard-selects a city suggestion.
 * Fills the input with the city name, closes the dropdown, and
 * fetches weather using the city's EXACT COORDINATES — not the name.
 *
 * This is the key fix for the "wrong city" bug:
 *   Previously: fetchWeather('Moscow') → OWM always returns Moscow, Russia
 *   Now:        fetchWeather({ lat: 46.73, lon: -116.99 }) → Moscow, Idaho ✓
 *
 * @param {{ name: string, lat: number, lon: number }} city
 *   The full city object from the Geocoding API, containing coordinates.
 */
function selectSuggestion(city) {
  // Show the city name in the input box for user feedback
  cityInput.value = city.name;
  hideSuggestions();

  // Use coordinates so the correct city is always fetched
  fetchWeather({ lat: city.lat, lon: city.lon });
}


/**
 * moveHighlight
 * -------------
 * Moves the keyboard highlight up or down through the suggestion items.
 * Wraps around: going past the last item returns to -1 (input focused),
 * and pressing up from -1 wraps to the last item.
 *
 * @param {number} direction — +1 to move down, -1 to move up.
 */
function moveHighlight(direction) {
  const items = suggestionsEl.querySelectorAll('.suggestion-item');
  if (items.length === 0) return;

  // Remove highlight from the previously highlighted item
  if (highlightedIndex >= 0) {
    items[highlightedIndex].classList.remove('highlighted');
  }

  // Calculate the next index, wrapping around
  highlightedIndex += direction;

  if (highlightedIndex >= items.length) {
    // Went past the bottom — jump back to input (no highlight)
    highlightedIndex = -1;
  } else if (highlightedIndex < -1) {
    // Went past the top — wrap to the last item
    highlightedIndex = items.length - 1;
  }

  if (highlightedIndex >= 0) {
    // Apply highlight class and scroll into view if the list is scrollable
    items[highlightedIndex].classList.add('highlighted');
    items[highlightedIndex].scrollIntoView({ block: 'nearest' });
  }
}


/* ─────────────────────────────────────────────
   5. HANDLE SEARCH — ORCHESTRATOR FUNCTION
   This function validates the user's input and
   then kicks off the API call.
───────────────────────────────────────────── */

/**
 * handleSearch
 * ------------
 * Called when the user clicks the search button OR presses Enter.
 * Validates the input field, then calls fetchWeather if valid.
 */
function handleSearch() {
  /*
    .trim() removes leading and trailing whitespace so that a user
    typing only spaces doesn't count as a valid city name.
  */
  const city = cityInput.value.trim();

  // Guard: don't proceed if the input is empty
  if (city === '') {
    showError('Please enter a city name.');
    return;
  }

  hideSuggestions();
  // Manual text search — use the name-based query (no coordinates available)
  fetchWeather({ query: city });
}


/* ─────────────────────────────────────────────
   6. EVENT LISTENERS
   We attach all event listeners here in JavaScript,
   keeping the HTML completely free of `onclick` attributes.
───────────────────────────────────────────── */

// Listen for a click on the search button
searchBtn.addEventListener('click', handleSearch);

/*
  Keydown listener on the search input handles three cases:
  • ArrowDown / ArrowUp → navigate the suggestion dropdown
  • Escape             → close the dropdown
  • Enter              → select the highlighted suggestion OR run a search
*/
cityInput.addEventListener('keydown', (event) => {
  const dropdownOpen = suggestionsEl.classList.contains('visible');

  if (event.key === 'ArrowDown') {
    event.preventDefault();       // stop the cursor jumping to end of input
    if (dropdownOpen) moveHighlight(+1);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (dropdownOpen) moveHighlight(-1);
    return;
  }

  if (event.key === 'Escape') {
    hideSuggestions();
    return;
  }

  if (event.key === 'Enter') {
    // If a suggestion is highlighted, select it using its stored coordinates
    if (dropdownOpen && highlightedIndex >= 0) {
      const items = suggestionsEl.querySelectorAll('.suggestion-item');
      const el = items[highlightedIndex];
      /*
        Read lat/lon from the data attributes we stored when building the list.
        This ensures keyboard selection also gets the correct city — not the
        most prominent OWM match for that name.
      */
      selectSuggestion({
        name: el.dataset.name,
        lat: parseFloat(el.dataset.lat),
        lon: parseFloat(el.dataset.lon),
      });
    } else {
      // Otherwise, run a normal name-based search
      handleSearch();
    }
  }
});

/*
  Input event — fires on every character the user types.
  We:
  1. Clear any existing error message
  2. Start (or restart) the debounce timer so fetchSuggestions is
     called 350ms after the user stops typing — not on every keystroke.
*/
cityInput.addEventListener('input', () => {
  // Clear stale error messages as the user corrects their input
  if (errorMessage.classList.contains('visible')) {
    clearError();
  }

  const query = cityInput.value.trim();

  // Clear the previous debounce timer and start a new one
  clearTimeout(debounceTimer);

  if (query.length < 2) {
    // Too short — hide the dropdown immediately without an API call
    hideSuggestions();
    return;
  }

  /*
    Wait 350ms after the user stops typing before hitting the API.
    This avoids sending a request for every single keystroke and
    reduces unnecessary API usage.
  */
  debounceTimer = setTimeout(() => {
    fetchSuggestions(query);
  }, 350);
});

/*
  Close the dropdown when the user clicks anywhere outside
  the search area (input, button, or suggestions list).
*/
document.addEventListener('click', (event) => {
  const searchWrapper = document.querySelector('.search-wrapper');
  if (!searchWrapper.contains(event.target)) {
    hideSuggestions();
  }
});


/* ─────────────────────────────────────────────
   7. INITIALISATION
   Code that runs once when the page first loads.
───────────────────────────────────────────── */

/*
  Auto-focus the search input so the user can start
  typing immediately without having to click the field first.
  This improves the user experience, especially on desktop.
*/
cityInput.focus();
