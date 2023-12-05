// Define a function to run when the page loads
function onPageLoad() {
  // Get the elements from the HTML file
  const loginButton = document.getElementById("login-button");
  const profileContainer = document.getElementById("profile-container");
  const profileImage = document.getElementById("profile-image");
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const topTracksContainer = document.getElementById("top-tracks-container");
  const playlistButton = document.getElementById("playlist-button");
  const playlistContainer = document.getElementById("playlist-container");
  const playlistLink = document.getElementById("playlist-link");

  // Define the Spotify API endpoints
  const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
  const SPOTIFY_ME_ENDPOINT = `${SPOTIFY_API_BASE_URL}/me`;
  const SPOTIFY_TOP_TRACKS_ENDPOINT = `${SPOTIFY_API_BASE_URL}/me/top/tracks`;
  const SPOTIFY_CREATE_PLAYLIST_ENDPOINT = `${SPOTIFY_API_BASE_URL}/users/{user_id}/playlists`;
  const SPOTIFY_ADD_TRACKS_ENDPOINT = `${SPOTIFY_API_BASE_URL}/playlists/{playlist_id}/tracks`;

  // Define a function to generate a random string for the state parameter
  function generateRandomString(length) {
    // Define the possible characters
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // Initialize an empty string
    let result = "";

    // Loop through the length
    for (let i = 0; i < length; i++) {
      // Append a random character from the possible characters
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Return the result
    return result;
  }

  // Define a function to handle the login button click
  function handleLoginButtonClick() {
    // Generate a random string for the state parameter
    const state = generateRandomString(16);

    // Store the state value in the local storage
    localStorage.setItem("spotify_auth_state", state);

    // Get the environment variables
    const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
    const SPOTIFY_SCOPE = process.env.SPOTIFY_SCOPE;

    // Redirect the user to the Spotify authorization endpoint
    window.location = "https://accounts.spotify.com/authorize" +
      "?response_type=token" +
      "&client_id=" + encodeURIComponent(SPOTIFY_CLIENT_ID) +
      "&scope=" + encodeURIComponent(SPOTIFY_SCOPE) +
      "&redirect_uri=" + encodeURIComponent(SPOTIFY_REDIRECT_URI) +
      "&state=" + encodeURIComponent(state);
  }

  // Define a function to handle the page load
  function handlePageLoad() {
    // Get the access token from the URL hash
    const accessToken = getAccessTokenFromUrl();

    // Check if the access token is not null
    if (accessToken) {
      // Get the user profile data from the Spotify API
      getUserProfile(accessToken);

      // Get the user's top tracks from the Spotify API
      getUserTopTracks(accessToken);

      // Enable the playlist button
      playlistButton.disabled = false;

      // Add a click event listener to the playlist button
      playlistButton.addEventListener("click", function () {
        // Create a playlist with the user's top tracks
        createPlaylistWithTopTracks(accessToken);
      });
    }
  }

  // Define a function to get the access token from the URL hash
  function getAccessTokenFromUrl() {
    // Get the hash part of the URL
    const hash = window.location.hash;

    // Check if the hash is not empty
    if (hash) {
      // Parse the hash into an object
      const params = new URLSearchParams(hash.substring(1));

      // Get the access token from the object
      const accessToken = params.get("access_token");

      // Return the access token
      return accessToken;
    }

    // Return null if the hash is empty
    return null;
  }

  // Define a function to get the user profile data from the Spotify API
  function getUserProfile(accessToken) {
    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // Set the request method and the endpoint URL
    xhr.open("GET", SPOTIFY_ME_ENDPOINT);

    // Set the authorization header with the access token
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

    // Set the response type to JSON
    xhr.responseType = "json";

    // Define a function to handle the response
    xhr.onload = function () {
      // Check if the status code is 200 (OK)
      if (xhr.status === 200) {
        // Get the response data
        const data = xhr.response;

        // Display the user profile data
        displayUserProfile(data);
      } else {
        // Display an error message
        alert("Something went wrong");
      }
    };

    // Send the request
    xhr.send();
  }

  // Define a function to display the user profile data
  function displayUserProfile(data) {
    // Get the user image, name, and email from the data
    const image = data.images[0].url;
    const name = data.display_name;
    const email = data.email;

    // Set the source, alt, and title attributes of the profile image element
    profileImage.src = image;
    profileImage.alt = name;
    profileImage.title = name;

    // Set the text content of the profile name and email elements
    profileName.textContent = name;
    profileEmail.textContent = email;

    // Show the profile container element
    profileContainer.style.display = "block";
  }

  // Define a function to get the user's top tracks from the Spotify API
  function getUserTopTracks(accessToken) {
    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // Set the request method and the endpoint URL
    xhr.open("GET", SPOTIFY_TOP_TRACKS_ENDPOINT);

    // Set the authorization header with the access token
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

    // Set the response type to JSON
    xhr.responseType = "json";

    // Define a function to handle the response
    xhr.onload = function () {
      // Check if the status code is 200 (OK)
      if (xhr.status === 200) {
        // Get the response data
        const data = xhr.response;

        // Display the user's top tracks
        displayUserTopTracks(data);
      } else {
        // Display an error message
        alert("Something went wrong");
      }
    };

    // Send the request
    xhr.send();
  }

  // Define a function to display the user's top tracks
  function displayUserTopTracks(data) {
    // Get the items array from the data
    const items = data.items;

    // Loop through the items array
    for (let i = 0; i < items.length; i++) {
      // Get the track object from the item
      const track = items[i];

      // Get the track name, artist name, and preview URL from the track object
      const trackName = track.name;
      const artistName = track.artists[0].name;
      const previewUrl = track.preview_url;

      // Create a new div element for the track
      const trackDiv = document.createElement("div");

      // Set the class name of the track div element
      trackDiv.className = "track";

      // Set the data attribute of the track div element with the preview URL
      trackDiv.dataset.previewUrl = previewUrl;

      // Create a new span element for the track name
      const trackNameSpan = document.createElement("span");

      // Set the class name of the track name span element
      trackNameSpan.className = "track-name";

      // Set the text content of the track name span element
      trackNameSpan.textContent = trackName;

      // Append the track name span element to the track div element
      trackDiv.appendChild(trackNameSpan);

      // Create a new span element for the artist name
      const artistNameSpan = document.createElement("span");

      // Set the class name of the artist name span element
      artistNameSpan.className = "artist-name";

      // Set the text content of the artist name span element
      artistNameSpan.textContent = artistName;

      // Append the artist name span element to the track div element
      trackDiv.appendChild(artistNameSpan);

      // Append the track div element to the top tracks container element
      topTracksContainer.appendChild(trackDiv);

      // Add a click event listener to the track div element
      trackDiv.addEventListener("click", function () {
        // Play or pause the track preview
        playOrPauseTrackPreview(this);
      });
    }

    // Show the top tracks container element
    topTracksContainer.style.display = "block";
  }

  // Define a function to play or pause the track preview
  function playOrPauseTrackPreview(trackDiv) {
    // Get the preview URL from the data attribute of the track div element
    const previewUrl = trackDiv.dataset.previewUrl;

    // Check if the preview URL is not null
    if (previewUrl) {
      // Create a new audio element
      const audio = new Audio(previewUrl);

      // Check if the track div element has the playing class
      if (trackDiv.classList.contains("playing")) {
        // Pause the audio
        audio.pause();

        // Remove the playing class from the track div element
        trackDiv.classList.remove("playing");
      } else {
        // Play the audio
        audio.play();

        // Add the playing class to the track div element
        trackDiv.classList.add("playing");
      }
    } else {
      // Display a message that the track preview is not available
      alert("Track preview is not available");
    }
  }

  // Define a function to create a playlist with the user's top tracks
  function createPlaylistWithTopTracks(accessToken) {
    // Get the user ID from the profile name element
    const userId = document.getElementById("profile-name").textContent;

    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // Set the request method and the endpoint URL
    xhr.open("POST", "https://api.spotify.com/v1/users/" + userId + "/playlists");

    // Set the authorization header with the access token
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

    // Set the content type header to JSON
    xhr.setRequestHeader("Content-Type", "application/json");

    // Set the response type to JSON
    xhr.responseType = "json";

    // Define a function to handle the response
    xhr.onload = function () {
      // Check if the status code is 201 (Created)
      if (xhr.status === 201) {
        // Get the response data
        const data = xhr.response;

        // Get the playlist ID and URL from the data
        const playlistId = data.id;
        const playlistUrl = data.external_urls.spotify;

        // Add the user's top tracks to the playlist
        addUserTopTracksToPlaylist(accessToken, playlistId, playlistUrl);
      } else {
        // Display an error message
        alert("Something went wrong");
      }
    };

    // Define the request body with the playlist name and description
    const requestBody = JSON.stringify({
      name: "My Top Tracks",
      description: "A playlist created by Bing with my top tracks from Spotify"
    });

    // Send the request with the request body
    xhr.send(requestBody);
  }

  // Define a function to add the user's top tracks to the playlist
  function addUserTopTracksToPlaylist(accessToken, playlistId, playlistUrl) {
    // Get the track div elements from the top tracks container element
    const trackDivs = document.getElementById("top-tracks-container").getElementsByClassName("track");

    // Initialize an empty array for the track URIs
    const trackUris = [];

    // Loop through the track div elements
    for (let i = 0; i < trackDivs.length; i++) {
      // Get the track div element
      const trackDiv = trackDivs[i];

      // Get the preview URL from the data attribute of the track div element
      const previewUrl = trackDiv.dataset.previewUrl;

      // Check if the preview URL is not null
      if (previewUrl) {
        // Extract the track ID from the preview URL
        const trackId = previewUrl.split("/")[4];

        // Construct the track URI from the track ID
        const trackUri = "spotify:track:" + trackId;

        // Push the track URI to the track URIs array
        trackUris.push(trackUri);
      }
    }

    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // Set the request method and the endpoint URL
    xhr.open("POST", "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks");

    // Set the authorization header with the access token
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

    // Set the content type header to JSON
    xhr.setRequestHeader("Content-Type", "application/json");

    // Set the response type to JSON
    xhr.responseType = "json";

    // Define a function to handle the response
    xhr.onload = function () {
      // Check if the status code is 201 (Created)
      if (xhr.status === 201) {
        // Get the response data
        const data = xhr.response;

        // Display the playlist link
        displayPlaylistLink(playlistUrl);
      } else {
        // Display an error message
        alert("Something went wrong");
      }
    };

    // Define the request body with the track URIs array
    const requestBody = JSON.stringify({
      uris: trackUris
    });

    // Send the request with the request body
    xhr.send(requestBody);
  }

  // Define a function to display the playlist link
  function displayPlaylistLink(playlistUrl) {
    // Set the href and text content of the playlist link element
    document.getElementById("playlist-link").href = playlistUrl;
    document.getElementById("playlist-link").textContent = playlistUrl;

    // Show the playlist container element
    document.getElementById("playlist-container").style.display = "block";
  }

  // Add a click event listener to the login button
  document.getElementById("login-button").addEventListener("click", handleLoginButtonClick);

    // Call the handle page load function
    handlePageLoad();
}

// Call the handle page load function when the page loads
window.addEventListener("load", onPageLoad);
