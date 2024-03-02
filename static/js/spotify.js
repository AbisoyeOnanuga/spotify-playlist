// Import the crypto module
const crypto = require("crypto");

// Define the Spotify credentials and scope
const clientId = "your_spotify_client_id";
const clientSecret = "your_spotify_client_secret";
const redirectUri = "http://localhost:3000/callback";
const scope = "user-library-read user-top-read playlist-modify-public";

// Generate a random string for the state parameter
const state = crypto.randomBytes(16).toString("hex");

// Create a URL for the authorization request
const authUrl = "https://accounts.spotify.com/authorize" +
  "?response_type=code" +
  "&client_id=" + clientId +
  "&scope=" + encodeURIComponent(scope) +
  "&redirect_uri=" + encodeURIComponent(redirectUri) +
  "&state=" + state;

// Get the login button element
const loginButton = document.getElementById("login-button");

// Add an event listener to the login button
loginButton.addEventListener("click", function() {
  // Redirect the user to the authorization URL
  window.location = authUrl;
});

// After the user grants permission, get the authorization code from the URL
const code = new URLSearchParams(window.location.search).get("code");

// Exchange the authorization code for an access token and a refresh token
fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret
  }),
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  }
}).then(response => response.json())
  .then(data => {
    // Get the access token and the refresh token from the data
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    // Store the access token and the refresh token in the local storage
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // Use the access token to make API requests to the Spotify Web API
    // For example, get the user profile from Spotify
    fetch("https://api.spotify.com/v1/me", {
      headers: {
        "Authorization": "Bearer " + accessToken
      }
    }).then(response => response.json())
      .then(data => {
        // Get the user profile data from the data
        const displayName = data.display_name;
        const id = data.id;
        const email = data.email;
        const uri = data.uri;
        const avatar = data.images[0].url;

        // Display the user profile data in the HTML elements
        document.getElementById("displayName").textContent = displayName;
        document.getElementById("id").textContent = id;
        document.getElementById("email").textContent = email;
        document.getElementById("uri").href = uri;
        document.getElementById("uri").textContent = uri;
        document.getElementById("avatar").src = avatar;

        // Show the user profile element and hide the login button element
        document.getElementById("user-profile").style.display = "block";
        document.getElementById("login-button").style.display = "none";
      });
  });
