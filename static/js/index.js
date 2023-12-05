// Define a function to generate a random string for the state parameter
function generateRandomString(length) {
  let text = '';
  let possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Define a function to get the access token from the URL fragment
function getAccessToken() {
  let hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce(function (initial, item) {
      if (item) {
        var parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
      }
      return initial;
    }, {});
  window.location.hash = '';
  return hash.access_token;
}

// Define a function to log in with Spotify
function loginWithSpotify() {
  // Generate a random state value
  let state = generateRandomString(16);

  // Store the state value in the local storage
  localStorage.setItem('spotify_auth_state', state);

  /*
  // Redirect the user to the Spotify authorization endpoint
  let url = "{{ url_for('spotify_auth') }}";
  url += '?response_type=token';
  url += '&state=' + encodeURIComponent(state);
  window.location = url;
  */
  // Redirect the user to the Flask view function that handles the Spotify authorization
  let url = "{{ url_for('spotify_auth') }}";
  url += "?state=" + encodeURIComponent(state);
  window.location = url;
}

// Define a function to log out
function logout() {
  // Clear the local storage
  localStorage.clear();

  // Reload the page
  window.location.reload();
}

// Define a function to show the progress indicator
function showProgress() {
  // Get the progress element
  let progress = document.getElementById('progress');

  // Set the display style to block
  progress.style.display = 'block';
}

// Define a function to hide the progress indicator
function hideProgress() {
  // Get the progress element
  let progress = document.getElementById('progress');

  // Set the display style to none
  progress.style.display = 'none';
}

// Define a function to fetch the heroes data
async function fetchHeroes() {
  // Get the access token from the local storage
  let accessToken = localStorage.getItem('spotify_access_token');

  // Make a request to the Spotify API endpoint for the user's top tracks
  const topTracksResponse = await fetch(
    'https://api.spotify.com/v1/me/top/tracks?limit=5',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // Parse the response as JSON
  const topTracksData = await topTracksResponse.json();

  // Get the track IDs from the data
  const trackIds = topTracksData.items.map((item) => item.id);

  // Make a request to the Spotify API endpoint for the recommendations based on the track IDs and the criteria
  const recommendationsResponse = await fetch(
    `https://api.spotify.com/v1/recommendations?seed_tracks=${trackIds.join(
      ','
    )}&min_tempo=100&max_tempo=150&min_energy=0.4&max_energy=0.8&min_valence=0.5&max_valence=0.9&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // Parse the response as JSON
  const recommendationsData = await recommendationsResponse.json();

  // Get the track data from the data
  const tracks = recommendationsData.tracks;

  // Map the track data to the heroes data
  const heroes = tracks.map((track) => ({
    id: track.id,
    name: track.name,
    image: track.album.images[0].url,
    description: track.artists.map((artist) => artist.name).join(', '),
  }));

  // Return the heroes data
  return heroes;
}

// Define a function to render the heroes list
function renderHeroes(heroes) {
  // Get the heroes element
  let heroesElement = document.getElementById('heroes');

  // Clear the previous content
  heroesElement.innerHTML = '';

  // Loop through the heroes data
  for (let hero of heroes) {
    // Create a div element for the hero
    let heroElement = document.createElement('div');

    // Set the class name to hero
    heroElement.className = 'hero';

    // Set the inner HTML to the hero content
    heroElement.innerHTML = `
      <img src="${hero.image}" alt="${hero.name}" />
      <h3>${hero.name}</h3>
      <p>${hero.description}</p>
    `;

    // Append the hero element to the heroes element
    heroesElement.appendChild(heroElement);
  }
}

// Check if there is an access token in the URL fragment
let accessToken = getAccessToken();

// If there is an access token, store it in the local storage and remove it from the URL
if (accessToken) {
  localStorage.setItem('spotify_access_token', accessToken);
  window.history.pushState('', document.title, window.location.pathname);
}

// Check if there is an access token in the local storage
accessToken = localStorage.getItem('spotify_access_token');

// If there is an access token, show the logout and refresh buttons
if (accessToken) {
  document.getElementById('login').style.display = 'none';
  document.getElementById('logout').style.display = 'block';
  document.getElementById('refresh').style.display = 'block';
}

// Add an event listener to the refresh button
document.getElementById('refresh').addEventListener('click', async () => {
  // Show the progress indicator
  showProgress();

  // Fetch the heroes data
  let heroes = await fetchHeroes();

  // Hide the progress indicator
  hideProgress();

  // Render the heroes list
  renderHeroes(heroes);
});
/*
// Add an event listener to the login button
document.getElementById('login').addEventListener('click', () => {
  // Log in with Spotify
  loginWithSpotify();
});
*/
// Get the login button element by its id
let loginButton = document.getElementById("login");

// Add a click event listener to the button
loginButton.addEventListener("click", function() {
  // Call the loginWithSpotify function
  loginWithSpotify();
});

// Add an event listener to the logout button
document.getElementById('logout').addEventListener('click', () => {
  // Log out
  logout();
});
