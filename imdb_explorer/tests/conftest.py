import os
import tempfile
import pytest
from app import app, init_db

@pytest.fixture
def client():
    """Create a test client for the application."""
    db_fd, app.config['DATABASE'] = tempfile.mkstemp()
    app.config['TESTING'] = True

    with app.test_client() as client:
        with app.app_context():
            init_db()
        yield client

    os.close(db_fd)
    os.unlink(app.config['DATABASE'])

@pytest.fixture
def sample_movie_data():
    """Sample movie data for testing."""
    return {
        "Title": "The Matrix",
        "Year": "1999",
        "imdbID": "tt0133093",
        "Director": "Lana Wachowski, Lilly Wachowski",
        "Writer": "Lana Wachowski, Lilly Wachowski",
        "Actors": "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
        "Plot": "A computer programmer discovers a mysterious world...",
        "Genre": "Action, Sci-Fi",
        "Runtime": "136 min",
        "imdbRating": "8.7",
        "Poster": "https://example.com/matrix.jpg"
    }

@pytest.fixture
def sample_watch_data():
    """Sample watch history data for testing."""
    return {
        "movieData": {
            "Title": "The Matrix",
            "Year": "1999",
            "imdbID": "tt0133093",
            "Director": "Lana Wachowski, Lilly Wachowski",
            "Writer": "Lana Wachowski, Lilly Wachowski",
            "Actors": "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
            "Plot": "A computer programmer discovers a mysterious world...",
            "Genre": "Action, Sci-Fi",
            "Runtime": "136 min",
            "imdbRating": "8.7",
            "Poster": "https://example.com/matrix.jpg"
        },
        "watchDate": "2024-10-23"
    }