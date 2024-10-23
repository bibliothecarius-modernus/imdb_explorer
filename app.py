from flask import Flask, render_template, request, jsonify
import requests
import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)

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

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5001)