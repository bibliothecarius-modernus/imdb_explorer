import json
import pytest
from unittest.mock import patch

def test_index_route(client):
    """Test the index route returns the main page."""
    response = client.get('/')
    assert response.status_code == 200
    assert b'IMDb Explorer' in response.data

def test_search_movies_no_data(client):
    """Test search endpoint with no data returns an error."""
    response = client.post('/search')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

def test_search_movies_no_query(client):
    """Test search endpoint with empty query returns an error."""
    response = client.post('/search', json={})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'No query provided'

@patch('requests.get')
def test_search_movies_success(mock_get, client, sample_movie_data):
    """Test successful movie search."""
    # Mock the OMDB API response
    mock_response = {
        'Search': [sample_movie_data],
        'totalResults': '1',
        'Response': 'True'
    }
    mock_get.return_value.json.return_value = mock_response
    mock_get.return_value.status_code = 200

    response = client.post('/search', json={'query': 'Matrix'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'Search' in data
    assert len(data['Search']) == 1
    assert data['Search'][0]['Title'] == 'The Matrix'

@patch('requests.get')
def test_get_movie_details(mock_get, client, sample_movie_data):
    """Test getting movie details."""
    mock_get.return_value.json.return_value = sample_movie_data
    mock_get.return_value.status_code = 200

    response = client.get('/movie/tt0133093')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['Title'] == 'The Matrix'
    assert data['Year'] == '1999'

def test_add_watched_movie_no_data(client):
    """Test adding a watched movie with no data returns an error."""
    response = client.post('/movie/watch')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

def test_add_watched_movie_success(client, sample_watch_data):
    """Test successfully adding a watched movie."""
    response = client.post('/movie/watch', 
                         json=sample_watch_data,
                         content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True

def test_get_watched_movies(client, sample_watch_data):
    """Test getting watch history after adding a movie."""
    # First add a movie
    client.post('/movie/watch', 
               json=sample_watch_data,
               content_type='application/json')
    
    # Then get the watch history
    response = client.get('/movies/watched')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 1
    assert data[0]['title'] == 'The Matrix'
    assert data[0]['watch_date'] == '2024-10-23'

def test_visualization_data(client, sample_watch_data):
    """Test getting visualization data."""
    # First add a movie
    client.post('/movie/watch', 
               json=sample_watch_data,
               content_type='application/json')
    
    # Then get the visualization data
    response = client.get('/visualizations/data')
    assert response.status_code == 200
    data = json.loads(response.data)
    
    # Check all visualization data is present
    assert 'creators_network' in data
    assert 'viewing_patterns' in data
    assert 'runtime_distribution' in data
    
    # Check creators network data
    assert 'nodes' in data['creators_network']
    assert 'links' in data['creators_network']
    
    # Check viewing patterns data
    assert len(data['viewing_patterns']) > 0
    assert 'date' in data['viewing_patterns'][0]
    assert 'count' in data['viewing_patterns'][0]
    
    # Check runtime distribution data
    assert 'Action' in data['runtime_distribution']
    assert 'Sci-Fi' in data['runtime_distribution']