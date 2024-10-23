// Store movie data globally
let movieData = [];

// Function to search movies
async function searchMovies() {
    const searchInput = document.getElementById('searchInput').value;
    if (!searchInput) {
        document.getElementById('movieResults').innerHTML = '<p>Please enter a search term</p>';
        return;
    }

    try {
        console.log('Sending search request for:', searchInput);
        const response = await fetch('http://localhost:5001/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ query: searchInput })
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.Search) {
            movieData = data.Search;
            displaySearchResults(data.Search);
        } else if (data.error) {
            document.getElementById('movieResults').innerHTML = `<p>Error: ${data.error}</p>`;
        } else {
            document.getElementById('movieResults').innerHTML = '<p>No results found</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('movieResults').innerHTML = `<p>Error fetching results: ${error.message}</p>`;
    }
}

// Function to display search results
function displaySearchResults(movies) {
    const resultsContainer = document.getElementById('movieResults');
    resultsContainer.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <h3>${movie.Title} (${movie.Year})</h3>
            <p>Type: ${movie.Type}</p>
        `;
        movieCard.onclick = () => getMovieDetails(movie.imdbID);
        resultsContainer.appendChild(movieCard);
    });
}

// Function to get movie details
async function getMovieDetails(imdbId) {
    try {
        const response = await fetch(`/movie/${imdbId}`);
        const data = await response.json();
        
        displayMovieDetails(data);
        updateVisualizations(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to display movie details
function displayMovieDetails(movie) {
    const detailsContainer = document.querySelector('.details-container');
    detailsContainer.classList.remove('hidden');
    
    document.getElementById('movieDetails').innerHTML = `
        <h3>${movie.Title}</h3>
        <p><strong>Year:</strong> ${movie.Year}</p>
        <p><strong>Director:</strong> ${movie.Director}</p>
        <p><strong>Cast:</strong> ${movie.Actors}</p>
        <p><strong>Genre:</strong> ${movie.Genre}</p>
        <p><strong>Runtime:</strong> ${movie.Runtime}</p>
        <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
        <p><strong>Plot:</strong> ${movie.Plot}</p>
    `;
}

// Function to update visualizations
function updateVisualizations(movieData) {
    updateRatingChart(movieData);
    updateGenreChart(movieData);
    updateTimelineChart(movieData);
}

// Rating Chart
function updateRatingChart(movie) {
    const width = document.getElementById('ratingChart').clientWidth - 40;
    const height = 250;
    
    // Clear previous chart
    d3.select('#ratingChart').select('svg').remove();
    
    const svg = d3.select('#ratingChart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
        
    // Create simple bar for the rating
    const rating = parseFloat(movie.imdbRating);
    
    svg.append('rect')
        .attr('x', 0)
        .attr('y', height - (rating * height/10))
        .attr('width', width)
        .attr('height', rating * height/10)
        .attr('fill', '#3498db');
        
    svg.append('text')
        .attr('x', width/2)
        .attr('y', height - (rating * height/10) - 5)
        .attr('text-anchor', 'middle')
        .text(`Rating: ${rating}/10`);
}

// Genre Chart
function updateGenreChart(movie) {
    const width = document.getElementById('genreChart').clientWidth - 40;
    const height = 250;
    const radius = Math.min(width, height) / 2;
    
    // Clear previous chart
    d3.select('#genreChart').select('svg').remove();
    
    const genres = movie.Genre.split(', ');
    const data = genres.map(genre => ({
        genre: genre,
        value: 1
    }));
    
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    
    const pie = d3.pie()
        .value(d => d.value);
    
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
    
    const svg = d3.select('#genreChart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`);
    
    const arcs = svg.selectAll('arc')
        .data(pie(data))
        .enter()
        .append('g');
    
    arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.genre));
        
    arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .text(d => d.data.genre);
}

// Timeline Chart
function updateTimelineChart(movie) {
    const width = document.getElementById('timelineChart').clientWidth - 40;
    const height = 250;
    
    // Clear previous chart
    d3.select('#timelineChart').select('svg').remove();
    
    const svg = d3.select('#timelineChart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const year = parseInt(movie.Year);
    
    svg.append('line')
        .attr('x1', 0)
        .attr('y1', height/2)
        .attr('x2', width)
        .attr('y2', height/2)
        .style('stroke', '#ddd');
    
    svg.append('circle')
        .attr('cx', width/2)
        .attr('cy', height/2)
        .attr('r', 5)
        .style('fill', '#3498db');
        
    svg.append('text')
        .attr('x', width/2)
        .attr('y', height/2 - 20)
        .attr('text-anchor', 'middle')
        .text(year);
}

// Event listener for search input (Enter key)
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchMovies();
    }
});