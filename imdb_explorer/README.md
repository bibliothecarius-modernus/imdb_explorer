# IMDb Explorer

IMDb Explorer is a modern web application that helps users track their movie-watching history and analyze their viewing patterns over time. Using the OMDb API, the application provides an intuitive interface for searching movies, logging watched movies, and visualizing watching patterns through interactive charts.

## Features

- 🔍 Quick movie search functionality with comprehensive movie details
- 📝 Personal movie watch history tracking with dates
- 📊 Advanced data visualizations using D3.js:
  - IMDb Ratings Distribution
  - Genre Distribution
  - Release Year Timeline
  - Directors & Writers Network
  - Viewing Patterns Over Time
  - Runtime Distribution by Genre
- 🎯 Movie filtering and sorting capabilities
- 📱 Responsive design for various screen sizes
- 🎬 Detailed movie information display
- 📈 In-depth analysis of watching patterns

## User Guide

### Getting Started

1. Access the application through your web browser at `http://localhost:5001`
2. The interface is divided into three main sections:
   - Search: Find and add movies to your watch history
   - History: View and manage your watched movies
   - Analytics: Explore visualizations of your viewing patterns

### Search and Add Movies

1. Click the "Search" tab if not already active
2. Enter a movie title in the search bar
3. Press Enter or click the "Search" button to find movies
4. Click any movie card to view detailed information
5. In the movie details, use the date picker to select when you watched the movie
6. Click "Add to Watch History" to save the movie to your collection

### Managing Watch History

1. Navigate to the "History" tab
2. View all your watched movies in a grid layout
3. Use the filters to sort and filter movies by:
   - Genre
   - Year watched
   - Search by title
4. Click any movie card to view full details

### Analyzing Your Movie Watching

The "Analytics" tab provides six interactive visualizations:

1. **IMDb Ratings Distribution**
   - View the distribution of IMDb ratings across your watched movies
   - Identify your preference for highly-rated vs lower-rated movies

2. **Genre Distribution**
   - Pie chart showing the breakdown of movie genres you watch
   - Understand your genre preferences

3. **Release Year Timeline**
   - See the distribution of movie release years
   - Identify your preference for newer vs classic films

4. **Directors & Writers Network**
   - Interactive network graph showing collaborations
   - Discover common creative teams in your watched movies
   - Hover over nodes to see more details

5. **Viewing Patterns Over Time**
   - Heatmap showing when you watch movies
   - Identify your most active movie-watching periods
   - Track your watching habits over time

6. **Runtime Distribution by Genre**
   - Violin plots showing movie length distributions by genre
   - Understand how movie lengths vary across genres
   - See your preferences for movie lengths in different genres

## Developer Documentation

### Technical Stack

- **Backend**: 
  - Flask (Python)
  - SQLite for data persistence
  - RESTful API design
- **Frontend**: 
  - HTML5 with semantic markup
  - CSS3 with modern features (Grid, Flexbox, Animations)
  - JavaScript (ES6+)
  - Flatpickr for date selection
- **Visualization**: 
  - D3.js for complex visualizations
  - Force-directed graph for network visualization
  - Heatmap and violin plots for pattern analysis
- **API**: 
  - OMDb API for movie data
  - Custom API endpoints for watch history

### Project Structure

```
imdb_explorer/
├── app.py              # Flask application main file
├── schema.sql          # Database schema definitions
├── static/
│   ├── css/
│   │   └── styles.css  # Application styling
│   └── js/
│       └── main.js     # Frontend JavaScript logic
├── templates/
│   └── index.html      # Main HTML template
├── README.md           # Project documentation
└── .env               # Environment variables

### Setup and Installation

1. Clone the repository
2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install required Python packages:
   ```bash
   pip install flask requests python-dotenv sqlite3
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your OMDb API key: `OMDB_API_KEY=your_api_key`
5. Initialize the database:
   ```bash
   export FLASK_APP=app.py
   flask init-db
   ```
6. Start the application:
   ```bash
   flask run --port=5001
   ```

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