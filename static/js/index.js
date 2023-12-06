// Define the global variables
let accessToken; // The access token for Spotify API
let userProfile; // The user profile data from Spotify
let topTracks; // The user's top tracks from Spotify
let playlistItems; // The playlist items based on the activity and criteria
let playlistId; // The playlist id for the new playlist
let playlistName; // The playlist name for the new playlist
let playlistLink; // The playlist link for the new playlist

// Define the constants
const CLIENT_ID = "07cf532190044f808358e604406e2bee"; // The client id for your Spotify app
const REDIRECT_URI = "https://dottymatrix.github.io/spotify-playlist/"; // The redirect uri for your Spotify app
const SCOPES = "user-read-private user-read-email user-top-read playlist-modify-public"; // The scopes for Spotify authorization
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}`; // The authorization url for Spotify
const API_URL = "https://api.spotify.com/v1"; // The base url for Spotify API

// Define the DOM elements
const loginButton = document.getElementById("login-button"); // The login button element
const userProfileContainer = document.getElementById("user-profile"); // The user profile container element
const avatar = document.getElementById("avatar"); // The avatar image element
const displayName = document.getElementById("displayName"); // The display name span element
const id = document.getElementById("id"); // The id span element
const topTracksContainer = document.getElementById("top-tracks-container"); // The top tracks container element
const playlistButton = document.getElementById("playlist-button"); // The playlist button element
const playlistContainer = document.getElementById("playlist-container"); // The playlist container element
// Remove the let keyword from the playlistLink variable
playlistLink = document.getElementById("playlist-link"); // The playlist link element
const progress = document.getElementById("progress"); // The progress element

// Define the event listeners
loginButton.addEventListener("click", () => {
  // Redirect to the authorization url when the login button is clicked
  window.location = AUTH_URL;
});

playlistButton.addEventListener("click", () => {
  // Generate the playlist when the playlist button is clicked
  generatePlaylist();
});

// Define the helper functions
function getHashParams() {
  // Get the hash parameters from the url
  let hashParams = {};
  let e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
     hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

function displayUserProfile() {
  // Display the user profile data
  // Set the avatar image source
  avatar.src = userProfile.images[0].url;
  // Set the display name text
  displayName.textContent = userProfile.display_name;
  // Set the id text
  id.textContent = userProfile.id;
  // Show the user profile container
  userProfileContainer.style.display = "block";
}

function displayTopTracks() {
  // Display the user's top tracks from Spotify
  // Fetch the user's top tracks from Spotify API
  fetch(`${API_URL}/me/top/tracks?limit=5`, { // Change the limit parameter to 5
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    // Save the top tracks data
    topTracks = data;
    // Create a table element for the top tracks
    let table = document.createElement("table");
    // Create a table head element for the table header
    let thead = document.createElement("thead");
    // Create a table row element for the header row
    let tr = document.createElement("tr");
    // Create table header cells for the header columns
    let th1 = document.createElement("th");
    th1.textContent = "#"; // Set the text content of the first header cell to "#"
    let th2 = document.createElement("th");
    th2.textContent = "Title"; // Set the text content of the second header cell to "Title"
    let th3 = document.createElement("th");
    th3.textContent = "Duration"; // Set the text content of the third header cell to "Duration"
    // Append the header cells to the header row
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    // Append the header row to the table head
    thead.appendChild(tr);
    // Append the table head to the table
    table.appendChild(thead);
    // Create a table body element for the table body
    let tbody = document.createElement("tbody");
    // Loop through the top tracks
    for (let i = 0; i < topTracks.items.length; i++) {
      // Get the track object from the top tracks array
      let track = topTracks.items[i];
      // Create a table row element for each track
      let tr = document.createElement("tr");
      // Create table data cells for each track column
      let td1 = document.createElement("td");
      td1.textContent = i + 1; // Set the text content of the first data cell to the track number
      let td2 = document.createElement("td");
      td2.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(", ")}`; // Set the text content of the second data cell to the track name and artists
      let td3 = document.createElement("td");
      td3.textContent = msToMMSS(track.duration_ms); // Set the text content of the third data cell to the track duration
      // Append the data cells to the data row
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      // Append the data row to the table body
      tbody.appendChild(tr);
    }
    // Append the table body to the table
    table.appendChild(tbody);
    // Append the table element to the top tracks container element
    topTracksContainer.appendChild(table);
  })
  .catch(error => {
    // Handle the error
    console.error(error);
  });
}

function msToMMSS(ms) {
  // Convert milliseconds to mm:ss format
  let minutes = Math.floor(ms / 60000);
  let seconds = Math.floor((ms % 60000) / 1000);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function createSelectBox(label, options) {
  // Create a select box element with a label and options
  // Create a label element for the select box
  let selectLabel = document.createElement("label");
  selectLabel.textContent = label;
  // Create a select element for the select box
  let select = document.createElement("select");
  // Loop through the options
  for (let option of options) {
    // Create an option element for each option
    let optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.textContent = option;
    // Append the option element to the select element
    select.appendChild(optionElement);
  }
  // Append the label element and the select element to the playlist container
  playlistContainer.appendChild(selectLabel);
  playlistContainer.appendChild(select);
  // Return the select element
  return select;
}

function createSlider(label, min, max) {
  // Create a slider element with a label and a range
  // Create a label element for the slider
  let sliderLabel = document.createElement("label");
  sliderLabel.textContent = label;
  // Create a input element for the slider
  let slider = document.createElement("input");
  slider.type = "range";
  slider.min = min;
  slider.max = max;
  slider.value = min;
  // Create a span element for the slider value
  let sliderValue = document.createElement("span");
  sliderValue.textContent = min;
  // Add an event listener to the slider
  slider.addEventListener("input", () => {
    // Update the slider value text when the slider is changed
    sliderValue.textContent = slider.value;
  });
  // Append the label element, the slider element, and the span element to the playlist container
  playlistContainer.appendChild(sliderLabel);
  playlistContainer.appendChild(slider);
  playlistContainer.appendChild(sliderValue);
  // Return the slider element
  return slider;
}

function createButton(label) {
  // Create a button element with a label
  // Create a button element
  let button = document.createElement("button");
  button.textContent = label;
  // Append the button element to the playlist container
  playlistContainer.appendChild(button);
  // Return the button element
  return button;
}

function generatePlaylist() {
  // Generate the playlist based on the activity and criteria
  // Get the activity from the select box
  let activity = activitySelect.value;
  // Get the number of songs from the slider
  let numberOfSongs = lengthSlider.value;
  // Get the criteria from the criteria dictionary
  let criteria = criteriaDict[activity];
  // Get the user's top tracks as seeds
  let seeds = topTracks.slice(0, 5).map(track => track.id).join(",");
  // Get the playlist items based on the seeds and criteria
  getPlaylistItems(seeds, criteria, numberOfSongs);
}

function getPlaylistItems(seeds, criteria, numberOfSongs) {
  // Get the playlist items based on the seeds and criteria
  // Construct the query parameters
  let queryParams = new URLSearchParams({
    limit: numberOfSongs,
    seed_tracks: seeds,
    ...criteria
  });
  // Fetch the playlist items from Spotify API
  fetch(`${API_URL}/recommendations?${queryParams.toString()}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    // Save the playlist items
    playlistItems = data;
    // Create a new playlist for the activity
    createPlaylist(activity);
  })
  .catch(error => {
    // Handle the error
    console.error(error);
  });
}

function createPlaylist(activity) {
  // Create a new playlist for the activity
  // Construct the playlist name
  playlistName = `Kora - ${activity}`;
  // Fetch the playlist id from Spotify API
  fetch(`${API_URL}/users/${userProfile.id}/playlists`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: playlistName,
      public: true
    })
  })
  .then(response => response.json())
  .then(data => {
    // Save the playlist id and link
    playlistId = data.id;
    playlistLink = data.external_urls.spotify;
    // Get the playlist tracks as URIs
    let playlistTracks = playlistItems.tracks.map(track => track.uri);
    // Add the playlist tracks to the playlist
    addPlaylistTracks(playlistId, playlistTracks);
  })
  .catch(error => {
    // Handle the error
    console.error(error);
  });
}

function addPlaylistTracks(playlistId, playlistTracks) {
  // Add the playlist tracks to the playlist
  // Fetch the playlist snapshot id from Spotify API
  fetch(`${API_URL}/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      uris: playlistTracks
    })
  })
  .then(response => response.json())
  .then(data => {
    // Display the playlist name and link
    displayPlaylistNameAndLink();
    // Display the playlist tracks
    displayPlaylistTracks();
  })
  .catch(error => {
    // Handle the error
    console.error(error);
  });
}

function displayPlaylistNameAndLink() {
  // Display the playlist name and link
  // Create a heading element for the playlist name
  let heading = document.createElement("h1");
  heading.textContent = playlistName;
  // Create an anchor element for the playlist link
  let anchor = document.createElement("a");
  anchor.href = playlistLink;
  anchor.textContent = playlistLink;
  // Append the heading element and the anchor element to the playlist link element
  playlistLink.appendChild(heading);
  playlistLink.appendChild(anchor);
}

function displayPlaylistTracks() {
  // Display the playlist tracks
  // Create a list element for the playlist tracks
  let list = document.createElement("ul");
  // Loop through the playlist tracks
  for (let track of playlistItems.tracks) {
    // Create a list item element for each track
    let item = document.createElement("li");
    // Get the track name, artists, and duration
    let trackName = track.name;
    let trackArtists = track.artists.map(artist => artist.name).join(", ");
    let trackDuration = msToMMSS(track.duration_ms);
    // Set the list item text as formatted string
    item.textContent = `${trackName} by ${trackArtists} (${trackDuration})`;
    // Create an audio element for the track preview
    let audio = document.createElement("audio");
    audio.src = track.preview_url;
    audio.controls = true;
    // Append the audio element to the list item element
    item.appendChild(audio);
    // Append the list item element to the list element
    list.appendChild(item);
  }
  // Append the list element to the playlist container element
  playlistContainer.appendChild(list);
}

// Define the main function
function main() {
  // Get the hash parameters from the url
  let hashParams = getHashParams();
  // Check if the access token is present
  if (hashParams.access_token) {
    // Save the access token
    accessToken = hashParams.access_token;
    // Hide the login button
    loginButton.style.display = "none";
    // Get the user profile from Spotify
    getUserProfile();
    // Get the user's top tracks from Spotify
    getUserTopTracks();
    // Create a select box for the activity
    let activitySelect = createSelectBox("Select your activity", ["study", "workout", "running", "dancing", "cooking", "relaxing", "pop", "rock", "mindfulness", "wakeup", "LoFi", "R&B & chill", "Drum & Bass", "Indie", "Summer", "Jazz"]);
    // Create a slider for the playlist length
    let lengthSlider = createSlider("Select the number of songs", 1, 10);
    // Get the body element
    let body = document.body;
    // Create a div element
    let div = document.createElement("div");
    div.appendChild(activitySelect);
    // Append the slider to the div
    div.appendChild(lengthSlider);
    // Append the button to the div
    div.appendChild(generateButton);
    // Append the div to the body
    body.appendChild(div);
  } else {
    // Show the login button
    loginButton.style.display = "block";
  }
}

// Define the generatePlaylist function
function generatePlaylist() {
  // Get the selected activity from the select box
  let activity = activitySelect.value;
  // Get the selected number of songs from the slider
  let length = lengthSlider.value;
  // Generate the playlist based on the activity and length
  // Your code to generate the playlist
}

// Create a button to generate the playlist
let generateButton = createButton("Generate Playlist");

// Add a click event listener to the button element
generateButton.addEventListener("click", generatePlaylist());

// Define the criteria dictionary for each activity
let criteriaDict = {
  study: {
    min_tempo: 60,
    max_tempo: 120,
    min_energy: 0.6,
    max_energy: 0.9,
    min_valence: 0.5,
    max_valence: 0.8,
    acousticness: 0.8, 
    instrumentalness: 0.8, 
    danceability: 0.2
  },
  workout: {
    min_tempo: 120,
    max_tempo: 180,
    min_energy: 0.8,
    max_energy: 1.0,
    min_valence: 0.6,
    max_valence: 1.0,
    acousticness: 0.2, 
    instrumentalness: 0.2, 
    danceability: 0.8
  },
  running: {
    min_tempo: 140,
    max_tempo: 200,
    min_energy: 0.7,
    max_energy: 1.0,
    min_valence: 0.4,
    max_valence: 0.8,
    acousticness: 0.3, 
    instrumentalness: 0.3, 
    danceability: 0.6
  },
  dancing: {
    min_tempo: 100,
    max_tempo: 160,
    min_energy: 0.7,
    max_energy: 1.0,
    min_valence: 0.7,
    max_valence: 1.0,
    acousticness: 0.4, 
    instrumentalness: 0.4, 
    danceability: 0.9
  },
  cooking: {
    min_tempo: 80,
    max_tempo: 140,
    min_energy: 0.5,
    max_energy: 0.8,
    min_valence: 0.5,
    max_valence: 0.9,
    acousticness: 0.6, 
    instrumentalness: 0.6, 
    danceability: 0.6
  },
  relaxing: {
    min_tempo: 40,
    max_tempo: 100,
    min_energy: 0.1,
    max_energy: 0.4,
    min_valence: 0.1,
    max_valence: 0.4,
    acousticness: 0.9, 
    instrumentalness: 0.9, 
    danceability: 0.2
  },
  pop: {
    seed_genres: "pop",
    loudness: -6, // Pop songs are usually loud and clear
    speechiness: 0.1, // Pop songs are usually not very speechy
    liveness: 0.2, // Pop songs are usually not very live
  },
  rock: {
    seed_genres: "rock",
    loudness: -4, // Rock songs are usually very loud and distorted
    speechiness: 0.05, // Rock songs are usually not speechy at all
    liveness: 0.3, // Rock songs are usually somewhat live
  },
  mindfulness: {
    seed_genres: "meditation",
    loudness: -20, // Mindfulness songs are usually very quiet and soft
    speechiness: 0.2, // Mindfulness songs may have some speech or vocals
    liveness: 0.1, // Mindfulness songs are usually not live
  },
  wakeup: {
    seed_genres: "morning",
    loudness: -10, // Wakeup songs are usually not too loud or too quiet
    speechiness: 0.15, // Wakeup songs may have some speech or vocals
    liveness: 0.2, // Wakeup songs are usually not very live
  },
  LoFi: {
    seed_genres: "lo-fi",
    loudness: -12, // LoFi songs are usually quiet and muffled
    speechiness: 0.1, // LoFi songs are usually not very speechy
    liveness: 0.1, // LoFi songs are usually not live
  },
  "R&B & chill": {
    seed_genres: "r-n-b, chill",
    loudness: -8, // R&B & chill songs are usually moderately loud and smooth
    speechiness: 0.2, // R&B & chill songs may have some speech or vocals
    liveness: 0.2, // R&B & chill songs are usually not very live
  },
  "Drum & Bass": {
    seed_genres: "drum-and-bass",
    loudness: -6, // Drum & bass songs are usually loud and punchy
    speechiness: 0.05, // Drum & bass songs are usually not speechy at all
    liveness: 0.3, // Drum & bass songs are usually somewhat live
  },
  Indie: {
    seed_genres: "indie",
    loudness: -10, // Indie songs are usually not too loud or too quiet
    speechiness: 0.15, // Indie songs may have some speech or vocals
    liveness: 0.4, // Indie songs are usually more live
  },
  Summer: {
    seed_genres: "summer",
    loudness: -6, // Summer songs are usually loud and bright
    speechiness: 0.2, // Summer songs may have some speech or vocals
    liveness: 0.2, // Summer songs are usually not very live
  },
  Jazz: {
    seed_genres: "jazz",
    loudness: -12, // Jazz songs are usually quiet and mellow
    speechiness: 0.1, // Jazz songs are usually not very speechy
    liveness: 0.5, // Jazz songs are usually more live
  }
};

// Call the main function
main();
