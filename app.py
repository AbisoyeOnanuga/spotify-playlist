# Import the necessary modules
from flask import Flask, render_template, request
import os
import json
from flask_cors import CORS, cross_origin

# Create a Flask app object and specify the static_folder argument
app = Flask(__name__, static_folder="static")

# Enable CORS for all domains and all routes
cors = CORS(app, resources={r"/generate": {"origins": ["http://localhost:8000"]}})

# Define a route for rendering the index.html file
@app.route('/')
def index():
    return render_template('index.html')

# Run the Flask app with debug mode and extra files to watch for changes
app.config["DEBUG"] = True
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["EXTRA_FILES"] = ["static/index.html", "static/js/script.js", "static/css/style.css"]
app.run(port=8000)