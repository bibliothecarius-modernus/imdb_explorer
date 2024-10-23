from flask import Flask, render_template, request, jsonify
import requests
import os
import logging
from dotenv import load_dotenv
import sqlite3
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)

# Database setup
def get_db():
    db = sqlite3.connect('movies.db')
    db.row_factory = sqlite3.Row
    return db

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

# OMDb API Key (using the free API key for development)
OMDB_API_KEY = '756abb2f'  # This is a free API key for development purposes

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search_movies():
    try:
        data = request.get_json()
        logger.debug(f"Received search request with data: {data}")
        
        if not data:
            logger.error("No JSON data in request")
            return jsonify({"error": "No data provided"}), 400
            
        query = data.get('query', '')
        if not query:
            logger.error("No query parameter in request")
            return jsonify({"error": "No query provided"}), 400
            
        url = "http://www.omdbapi.com/"
        
        params = {
            "s": query,
            "apikey": OMDB_API_KEY,
            "type": "movie",
            "r": "json"
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        logger.debug(f"Making API request with params: {params}")
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        data = response.json()
        logger.debug(f"API response: {data}")
        return jsonify(data)
        
    except requests.exceptions.RequestException as e:
        logger.error(f"API request error: {str(e)}")
        return jsonify({"error": f"API request failed: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/movie/<imdb_id>')
def get_movie_details(imdb_id):
    url = "http://www.omdbapi.com/"
    
    params = {
        "i": imdb_id,
        "apikey": OMDB_API_KEY,
        "plot": "full",
        "r": "json"
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        logger.error(f"Error getting movie details: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/movie/watch', methods=['POST'])
def add_watched_movie():
    try:
        data = request.get_json()
        watch_date = data.get('watchDate')
        movie_data = data.get('movieData')

        if not watch_date or not movie_data:
            return jsonify({"error": "Missing required data"}), 400

        # Convert runtime to minutes
        runtime = movie_data.get('Runtime', '0 min').split()[0]
        runtime = int(runtime) if runtime.isdigit() else 0

        db = get_db()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO watched_movies (
                imdb_id, title, year, director, writers, actors,
                genre, runtime, rating, plot, poster_url, watch_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            movie_data.get('imdbID'),
            movie_data.get('Title'),
            int(movie_data.get('Year', '0')),
            movie_data.get('Director'),
            movie_data.get('Writer'),
            movie_data.get('Actors'),
            movie_data.get('Genre'),
            runtime,
            float(movie_data.get('imdbRating', '0')),
            movie_data.get('Plot'),
            movie_data.get('Poster'),
            watch_date
        ))
        db.commit()
        return jsonify({"success": True})
    except Exception as e:
        logger.error(f"Error adding watched movie: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/movies/watched')
def get_watched_movies():
    try:
        db = get_db()
        cursor = db.cursor()
        movies = cursor.execute("""
            SELECT * FROM watched_movies 
            ORDER BY watch_date DESC
        """).fetchall()
        
        return jsonify([dict(movie) for movie in movies])
    except Exception as e:
        logger.error(f"Error getting watched movies: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/visualizations/data')
def get_visualization_data():
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Get all needed data for visualizations
        movies = cursor.execute("""
            SELECT * FROM watched_movies 
            ORDER BY watch_date
        """).fetchall()
        
        # Process data for various visualizations
        movies_data = [dict(movie) for movie in movies]
        
        # Directors and writers network
        creators_data = process_creators_network(movies_data)
        
        # Viewing patterns over time
        viewing_patterns = process_viewing_patterns(movies_data)
        
        # Runtime distribution by genre
        runtime_distribution = process_runtime_distribution(movies_data)
        
        return jsonify({
            "creators_network": creators_data,
            "viewing_patterns": viewing_patterns,
            "runtime_distribution": runtime_distribution
        })
    except Exception as e:
        logger.error(f"Error getting visualization data: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Add this new route to your Flask app

@app.route('/movie/watch/<int:id>', methods=['DELETE'])
def delete_watched_movie(id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('DELETE FROM watched_movies WHERE id = ?', (id,))
        db.commit()
        return jsonify({"success": True})
    except Exception as e:
        logger.error(f"Error deleting movie: {str(e)}")
        return jsonify({"error": str(e)}), 500

def process_creators_network(movies):
    creators = {}
    collaborations = {}
    
    for movie in movies:
        directors = [d.strip() for d in movie['director'].split(',') if d.strip()]
        writers = [w.strip() for w in movie['writers'].split(',') if w.strip()]
        
        # Add nodes
        for creator in directors + writers:
            if creator not in creators:
                creators[creator] = {
                    'name': creator,
                    'role': 'director' if creator in directors else 'writer',
                    'movies': []
                }
            creators[creator]['movies'].append(movie['title'])
        
        # Add edges (collaborations)
        all_creators = directors + writers
        for i in range(len(all_creators)):
            for j in range(i + 1, len(all_creators)):
                pair = tuple(sorted([all_creators[i], all_creators[j]]))
                if pair not in collaborations:
                    collaborations[pair] = {
                        'source': pair[0],
                        'target': pair[1],
                        'movies': []
                    }
                collaborations[pair]['movies'].append(movie['title'])
    
    return {
        'nodes': list(creators.values()),
        'links': list(collaborations.values())
    }

def process_viewing_patterns(movies):
    patterns = {}
    for movie in movies:
        watch_date = datetime.strptime(movie['watch_date'], '%Y-%m-%d')
        year_week = watch_date.strftime('%Y-%W')
        if year_week not in patterns:
            patterns[year_week] = 0
        patterns[year_week] += 1
    
    return [{'date': k, 'count': v} for k, v in patterns.items()]

def process_runtime_distribution(movies):
    distribution = {}
    for movie in movies:
        genres = [g.strip() for g in movie['genre'].split(',')]
        for genre in genres:
            if genre not in distribution:
                distribution[genre] = []
            distribution[genre].append(movie['runtime'])
    
    return distribution

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5001)