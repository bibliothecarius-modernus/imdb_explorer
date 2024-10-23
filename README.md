# IMDb Explorer

IMDb Explorer is a modern web application that allows users to search and explore movie information using the OMDb API. The application provides an intuitive interface for searching movies, viewing detailed information, and visualizing movie data through interactive charts.

## Features

- 🔍 Quick movie search functionality
- 📊 Interactive data visualizations using D3.js
- 📱 Responsive design for various screen sizes
- 🎬 Detailed movie information display
- 📈 Visual representations of movie ratings, genres, and release timeline

## User Guide

### Getting Started

1. Access the application through your web browser at `http://localhost:5001`
2. Enter a movie title in the search bar
3. Press Enter or click the "Search" button to find movies
4. Click on any movie card to view detailed information

### Features Overview

#### Search Results
- Displays movie titles, release years, and types
- Click any result to view more details

#### Movie Details
- Comprehensive movie information including:
  - Title and Release Year
  - Director and Cast
  - Genre
  - Runtime
  - IMDb Rating
  - Plot Summary

#### Visualizations
The application provides three types of visualizations:
1. **IMDb Ratings Distribution**: Visual representation of the movie's rating
2. **Genre Distribution**: Pie chart showing the movie's genres
3. **Release Year Timeline**: Timeline visualization of the movie's release year

## Developer Documentation

### Technical Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Visualization**: D3.js
- **API**: OMDb API

### Project Structure

```
imdb_explorer/
├── app.py              # Flask application main file
├── static/
│   ├── css/
│   │   └── styles.css  # Application styling
│   └── js/
│       └── main.js     # Frontend JavaScript logic
├── templates/
│   └── index.html      # Main HTML template
└── README.md           # Project documentation
```

### Setup and Installation

1. Clone the repository
2. Install required Python packages:
   ```bash
   pip install flask requests python-dotenv
   ```
3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your OMDb API key: `OMDB_API_KEY=your_api_key`

### API Endpoints

#### 1. Search Movies
- **Endpoint**: `/search`
- **Method**: POST
- **Body**: JSON with `query` parameter
- **Returns**: List of movies matching the search query

#### 2. Movie Details
- **Endpoint**: `/movie/<imdb_id>`
- **Method**: GET
- **Returns**: Detailed information about a specific movie

### Frontend Components

#### JavaScript Functions
- `searchMovies()`: Handles movie search functionality
- `displaySearchResults()`: Renders search results
- `getMovieDetails()`: Fetches and displays detailed movie information
- `updateVisualizations()`: Manages D3.js visualizations

#### Visualization Components
- Rating Chart: `updateRatingChart()`
- Genre Chart: `updateGenreChart()`
- Timeline Chart: `updateTimelineChart()`

### Error Handling

The application includes comprehensive error handling:
- API request failures
- Invalid search queries
- Missing data handling
- CORS handling for cross-origin requests

### Development Guidelines

1. **Code Style**
   - Follow PEP 8 guidelines for Python code
   - Use ES6+ features for JavaScript
   - Maintain consistent indentation

2. **API Usage**
   - Implement rate limiting for API calls
   - Cache frequent requests when possible
   - Handle API errors gracefully

3. **Testing**
   - Test API endpoints with different query parameters
   - Verify visualization rendering with various data types
   - Ensure responsive design works across devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OMDb API for providing movie data
- D3.js community for visualization tools
- Flask and Python communities