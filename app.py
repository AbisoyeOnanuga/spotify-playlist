import os
# Import flask and dotenv
from flask import Flask, render_template, request, session, redirect
from dotenv import load_dotenv
import urllib

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

    # Redirect the user to the Spotify authorization endpoint
    url = "https://accounts.spotify.com/authorize"
    url += "?response_type=token"
    url += "&client_id=" + urllib.parse.quote(SPOTIFY_CLIENT_ID)
    url += "&scope=" + urllib.parse.quote(SPOTIFY_SCOPE)
    url += "&redirect_uri=" + urllib.parse.quote(SPOTIFY_REDIRECT_URI)
    url += "&state=" + urllib.parse.quote(state)
    return redirect(url)

# Define the callback route
@app.route("/callback")
def callback():
    # Render the callback.html file
    return render_template("callback.html")

# Run the app in debug mode
if __name__ == "__main__":
    app.run(debug=True)

# Run the Flask app with debug mode and extra files to watch for changes
app.config["DEBUG"] = True
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["EXTRA_FILES"] = ["static/index.html", "static/js/script.js", "static/css/style.css"]
app.run(port=8000)