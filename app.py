import os
# Import flask and dotenv
from flask import Flask, render_template, request, session, redirect
from dotenv import load_dotenv
# Import the requests library
import requests

# Load the environment variables from the .env file
load_dotenv()

# Get the environment variables
SPOTIFY_CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID")
SPOTIFY_REDIRECT_URI = os.environ.get("SPOTIFY_REDIRECT_URI")
SPOTIFY_SCOPE = os.environ.get("SPOTIFY_SCOPE")

# Create the flask app
app = Flask(__name__)

# Set the secret key for the app
app.secret_key = os.environ.get("FLASK_SECRET_KEY")

# Define the index route
@app.route("/")
def index():
    # Render the index.html file
    return render_template("index.html")

@app.route("/spotify_auth")
def spotify_auth():
    # Get the state value from the request
    state = request.args.get("state")

    # Get the state value from the local storage
    stored_state = session.get("spotify_auth_state")

    # Check if the state values match
    if state is None or state != stored_state:
        # Return an error message
        return "State mismatch"

    # Get the environment variables
    SPOTIFY_CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID")
    SPOTIFY_REDIRECT_URI = os.environ.get("SPOTIFY_REDIRECT_URI")
    SPOTIFY_SCOPE = os.environ.get("SPOTIFY_SCOPE")

    # Define the parameters for the redirect URL
    params = {
    "response_type": "token",
    "client_id": SPOTIFY_CLIENT_ID,
    "scope": SPOTIFY_SCOPE,
    "redirect_uri": SPOTIFY_REDIRECT_URI,
    "state": state
    }

    # Build the redirect URL with the requests library
    url = requests.Request("GET", "https://accounts.spotify.com/authorize", params=params).prepare().url

    # Redirect the user to the Spotify authorization endpoint
    return redirect(url)
    '''
    # Redirect the user to the Spotify authorization endpoint
    url = "https://accounts.spotify.com/authorize"
    url += "?response_type=token"
    url += "&client_id=" + urllib.parse.quote(SPOTIFY_CLIENT_ID)
    url += "&scope=" + urllib.parse.quote(SPOTIFY_SCOPE)
    url += "&redirect_uri=" + urllib.parse.quote(SPOTIFY_REDIRECT_URI)
    url += "&state=" + urllib.parse.quote(state)
    return redirect(url)
    '''
'''
# Define the callback route
@app.route("/callback")
def callback():
    # Render the callback.html file
    return render_template("callback.html")
'''
# Define the callback route
@app.route("/callback")
def callback():
    # Handle the response from the Spotify authorization endpoint
    # Get the access token, token type, expires in, and state from the URL hash
    hash = request.args.get("hash")
    params = params
    access_token = params.get("access_token")
    token_type = params.get("token_type")
    expires_in = params.get("expires_in")
    state = params.get("state")

    # Use the access token to make requests to the Spotify API
    # For example, get the user profile data
    headers = {"Authorization": f"{token_type} {access_token}"}
    response = requests.get("https://api.spotify.com/v1/me", headers=headers)
    data = response.json()

    return "Callback"
    
# Run the app in debug mode
if __name__ == "__main__":
    app.run(debug=True)

# Run the Flask app with debug mode and extra files to watch for changes
app.config["DEBUG"] = True
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["EXTRA_FILES"] = ["templates/index.html", "static/js/script.js", "static/css/style.css"]
app.run(port=8000)