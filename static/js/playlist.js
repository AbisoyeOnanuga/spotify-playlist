// Define the activity parameters
const criteria_dict = {
study: {
    min_tempo: 60,
    max_tempo: 120,
    min_energy: 0.6,
    max_energy: 0.9,
    min_valence: 0.5,
    max_valence: 0.8,
},
workout: {
    min_tempo: 120,
    max_tempo: 180,
    min_energy: 0.8,
    max_energy: 1.0,
    min_valence: 0.6,
    max_valence: 1.0,
},
running: {
    min_tempo: 140,
    max_tempo: 180,
    min_energy: 0.8,
    max_energy: 1.0,
    min_valence: 0.6,
    max_valence: 1.0,
},
dancing: {
    min_tempo: 100,
    max_tempo: 160,
    min_energy: 0.7,
    max_energy: 1.0,
    min_valence: 0.7,
    max_valence: 1.0,
},
cooking: {
    min_tempo: 80,
    max_tempo: 140,
    min_energy: 0.6,
    max_energy: 0.9,
    min_valence: 0.6,
    max_valence: 0.9,
},
relaxing: {
    min_tempo: 40,
    max_tempo: 100,
    min_energy: 0.0,
    max_energy: 0.6,
    min_valence: 0.0,
    max_valence: 0.6,
},
pop: {
    min_tempo: 80,
    max_tempo: 160,
    min_energy: 0.6,
    max_energy: 0.9,
    min_valence: 0.6,
    max_valence: 0.9,
},
rock: {
    min_tempo: 100,
    max_tempo: 180,
    min_energy: 0.7,
    max_energy: 1.0,
    min_valence: 0.4,
    max_valence: 0.8,
},
mindfulness: {
    min_tempo: 40,
    max_tempo: 80,
    min_energy: 0.0,
    max_energy: 0.4,
    min_valence: 0.0,
    max_valence: 0.4,
},
wakeup: {
    min_tempo: 80,
    max_tempo: 140,
    min_energy: 0.7,
    max_energy: 0.9,
    min_valence: 0.7,
    max_valence: 1.0,
},
LoFi: {
    min_tempo: 60,
    max_tempo: 120,
    min_energy: 0.4,
    max_energy: 0.7,
    min_valence: 0.4,
    max_valence: 0.7,
},
"R&B & chill": {
    min_tempo: 80,
    max_tempo: 140,
    min_energy: 0.5,
    max_energy: 0.8,
    min_valence: 0.5,
    max_valence: 0.8,
},
"Drum & Bass": {
    min_tempo: 140,
    max_tempo: 200,
    min_energy: 0.8,
    max_energy: 1.0,
    min_valence: 0.4,
    max_valence: 0.8,
},
Indie: {
    min_tempo: 80,
    max_tempo: 160,
    min_energy: 0.5,
    max_energy: 0.8,
    min_valence: 0.5,
    max_valence: 0.8,
},
Summer: {
    min_tempo: 100,
    max_tempo: 160,
    min_energy: 0.7,
    max_energy: 0.9,
    min_valence: 0.7,
    max_valence: 1.0,
},
Jazz: {
    min_tempo: 60,
    max_tempo: 140,
    min_energy: 0.4,
    max_energy: 0.7,
    min_valence: 0.4,
    max_valence: 0.7,
},
};

// Define the API route handler as the default export
export default async function handler(req, res) {
    // Get the session data from the request
    const session = getSession(req, res);

    // Check if the user is logged in or not
    if (!session || !session.user) {
        // If not, return a 401 Unauthorized response
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the access token from the session
    const accessToken = session.accessToken;

    // Get the activity from the query parameter
    const activity = req.query.activity;

    // Check if the activity is valid or not
    if (!activity || !criteria_dict[activity]) {
        // If not, return a 400 Bad Request response
        return res.status(400).json({ error: 'Invalid activity' });
    }

    // Get the criteria for the activity
    const criteria = criteria_dict[activity];

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
        )}&min_tempo=${criteria.min_tempo}&max_tempo=${
        criteria.max_tempo
        }&min_energy=${criteria.min_energy}&max_energy=${
        criteria.max_energy
        }&min_valence=${criteria.min_valence}&max_valence=${
        criteria.max_valence
        }&limit=10`,
        {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        }
    );

    // Parse the response as JSON
    const recommendationsData = await recommendationsResponse.json();

    // Get the track URIs from the data
    const trackUris = recommendationsData.tracks.map((track) => track.uri);

    // Make a request to the Spotify API endpoint to create a playlist for the user
    const createPlaylistResponse = await fetch(
        `https://api.spotify.com/v1/users/${session.user.sub}/playlists`,
        {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: `Playlist for ${activity}`,
            description: `A playlist generated by Next.js app based on your top tracks and the activity ${activity}`,
            public: true,
        }),
        }
    );

    // Parse the response as JSON
    const createPlaylistData = await createPlaylistResponse.json();

    // Get the playlist ID from the data
    const playlistId = createPlaylistData.id;

    // Make a request to the Spotify API endpoint to add the tracks to the playlist
    const addTracksResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: trackUris,
        }),
        }
    );

    // Parse the response as JSON
    const addTracksData = await addTracksResponse.json();

    // Return the playlist ID and the track URIs as the response
    return res.status(200).json({
        playlistId,
        trackUris,
    });
}
