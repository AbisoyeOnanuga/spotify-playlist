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
const generateButton = document.getElementById("generate-button"); // The playlist button element
const playlistContainer = document.getElementById("playlist-container"); // The playlist container element
// Remove the let keyword from the playlistLink variable
playlistLink = document.getElementById("playlist-link"); // The playlist link element
const progress = document.getElementById("progress"); // The progress element

// Define the event listeners
loginButton.addEventListener("click", () => {
  // Redirect to the authorization url when the login button is clicked
  window.location = AUTH_URL;
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

function msToMMSS(ms) {
  // Convert milliseconds to mm:ss format
  let minutes = Math.floor(ms / 60000);
  let seconds = Math.floor((ms % 60000) / 1000);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function getUserProfile() {
  // Get the user profile from Spotify
  fetch(`${API_URL}/me`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    // Save the user profile data
    userProfile = data;
    // Display the user profile data
    displayUserProfile();
  })
  .catch(error => {
    // Handle the error
    console.error(error);
  });
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

function getUserTopTracks() {
  // Get the user's top tracks from Spotify
  fetch(`${API_URL}/me/top/tracks?limit=5`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    // Save the user's top tracks
    topTracks = data.items;
    // Display the user's top tracks
    displayTopTracks();
  })
  .catch(error => {
    // Handle the error
    console.error(error);
  });
}

// Define a function to display the user's top tracks
function displayTopTracks() {
  let topTracksContainer = document.getElementById("top-tracks-container");
  let heading = document.createElement("h2");
  heading.textContent = "Your Top Tracks";
  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let tbody = document.createElement("tbody");
  let tfoot = document.createElement("tfoot");
  let colgroup = document.createElement("colgroup");
  let col1 = document.createElement("col");
  let col2 = document.createElement("col");
  let col3 = document.createElement("col");
  let headerRow = document.createElement("tr");
  let headerCell1 = document.createElement("th");
  let headerCell2 = document.createElement("th");
  let headerCell3 = document.createElement("th");
  let footerRow = document.createElement("tr");
  let footerCell = document.createElement("th");
  let totalDuration = 0;
  headerCell1.textContent = "#";
  headerCell2.textContent = "Track";
  headerCell3.textContent = "Duration";
  footerCell.textContent = "Total Duration";
  footerCell.colSpan = 3;
  headerRow.appendChild(headerCell1);
  headerRow.appendChild(headerCell2);
  headerRow.appendChild(headerCell3);
  thead.appendChild(headerRow);
  for (let i = 0; i < topTracks.length; i++) {
    let track = topTracks[i];
    let bodyRow = document.createElement("tr");
    let bodyCell1 = document.createElement("td");
    let bodyCell2 = document.createElement("td");
    let bodyCell3 = document.createElement("td");
    let trackName = track.name;
    let trackArtists = track.artists.map(artist => artist.name).join(", ");
    let trackDuration = msToMMSS(track.duration_ms);
    bodyCell1.textContent = i + 1;
    bodyCell2.textContent = `${trackName} by ${trackArtists}`;
    bodyCell3.textContent = trackDuration;
    bodyRow.appendChild(bodyCell1);
    bodyRow.appendChild(bodyCell2);
    bodyRow.appendChild(bodyCell3);
    tbody.appendChild(bodyRow);
    totalDuration += track.duration_ms;
  }
  footerCell.textContent += ` ${msToMMSS(totalDuration)}`;
  footerRow.appendChild(footerCell);
  tfoot.appendChild(footerRow);
  colgroup.appendChild(col1);
  colgroup.appendChild(col2);
  colgroup.appendChild(col3);
  table.appendChild(colgroup);
  table.appendChild(thead);
  table.appendChild(tbody);
  table.appendChild(tfoot);
  topTracksContainer.appendChild(heading);
  topTracksContainer.appendChild(table);
}

// Define a function to generate a playlist based on the activity, top tracks, and criteria
function generatePlaylist() {
  let activity = document.getElementById("activity-select").value;
  let numberOfSongs = document.getElementById("length-slider").value;
  let criteria = criteriaDict[activity];
  let seeds = topTracks.slice(0, 5).map(track => track.id).join(",");
  getPlaylistItems(seeds, criteria, numberOfSongs);
}

// Define a function to get the playlist items from the Spotify API
function getPlaylistItems(seeds, criteria, numberOfSongs) {
  let queryParams = new URLSearchParams({
    limit: numberOfSongs,
    seed_tracks: seeds,
    ...criteria
  });
  fetch(`${API_URL}/recommendations?${queryParams.toString()}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    playlistItems = data;
    createPlaylist(activity);
  })
  .catch(error => {
    console.error(error);
  });
}

// Define a function to create a playlist on the user's Spotify account
function createPlaylist(activity) {
  playlistName = `Kora - ${activity}`;
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
    playlistId = data.id;
    playlistLink = data.external_urls.spotify;
    let playlistTracks = playlistItems.tracks.map(track => track.uri);
    addPlaylistTracks(playlistId, playlistTracks);
  })
  .catch(error => {
    console.error(error);
  });
}

// Define a function to add the playlist items to the playlist
function addPlaylistTracks(playlistId, playlistTracks) {
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
    displayPlaylistNameAndLink();
    displayPlaylistTracks();
  })
  .catch(error => {
    console.error(error);
  });
}

// Define a function to display the playlist name and link
function displayPlaylistNameAndLink() {
  let heading = document.createElement("h1");
  heading.textContent = playlistName;
  let anchor = document.createElement("a");
  anchor.href = playlistLink;
  anchor.textContent = playlistLink;
  playlistLink.appendChild(heading);
  playlistLink.appendChild(anchor);
}

// Define a function to display the playlist tracks
function displayPlaylistTracks() {
  let list = document.createElement("ul");
  for (let track of playlistItems.tracks) {
    let item = document.createElement("li");
    let trackName = track.name;
    let trackArtists = track.artists.map(artist => artist.name).join(", ");
    let trackDuration = msToMMSS(track.duration_ms);
    item.textContent = `${trackName} by ${trackArtists} (${trackDuration})`;
    if (track.preview_url) {
      let audio = document.createElement("audio");
      audio.src = track.preview_url;
      audio.controls = true;
      item.appendChild(audio);
    }
    list.appendChild(item);
  }
  playlistContainer.appendChild(list);
}

// Define a function to run the main logic of the web app
function main() {
  let hashParams = getHashParams();
  if (hashParams.access_token) {
    accessToken = hashParams.access_token;
    loginButton.style.display = "none";
    getUserProfile();
    getUserTopTracks();
    // Get the playlist generator elements by ID
    let activitySelect = document.getElementById("activity-select");
    let lengthSlider = document.getElementById("length-slider");
    let lengthValue = document.getElementById("length-value");
    let generateButton = document.getElementById("generate-button");
    // Add an event listener to the length slider to update the value
    lengthSlider.addEventListener("input", function() {
      lengthValue.textContent = lengthSlider.value;
    });
    // Add an event listener to the generate button to generate a playlist
    generateButton.addEventListener("click", generatePlaylist);
  } else {
    loginButton.style.display = "block";
  }
}

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

// Run the main function when the window loads
window.onload = main;
