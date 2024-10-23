let currentMovieData = null;  // Variable to store the currently displayed movie

// Initialize flatpickr for date inputs
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date picker
    flatpickr("#watchDate", {
        defaultDate: "today",
        dateFormat: "Y-m-d"
    });

    // Initialize tabs
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${target}-tab`) {
                    content.classList.add('active');
                }
            });

            // Load data if needed
            if (target === 'analytics') {
                loadAndDisplayVisualizations();
            } else if (target === 'history') {
                loadWatchHistory();
            }
        });
    });
});

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
        const response = await fetch(`http://localhost:5001/movie/${imdbId}`);
        const data = await response.json();
        
        currentMovieData = data;  // Store the current movie data
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

// Function to add movie to watch history
async function addToWatchHistory() {
    if (!currentMovieData) {
        alert('Please select a movie first');
        return;
    }

    const watchDate = document.getElementById('watchDate').value;
    if (!watchDate) {
        alert('Please select a watch date');
        return;
    }

    try {
        const response = await fetch('http://localhost:5001/movie/watch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                watchDate: watchDate,
                movieData: currentMovieData
            })
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Movie added to watch history successfully!');
            // If we're on the history tab, refresh it
            if (document.querySelector('[data-tab="history"]').classList.contains('active')) {
                loadWatchHistory();
            }
            // Clear the details section
            document.querySelector('.details-container').classList.add('hidden');
            currentMovieData = null;
        } else {
            throw new Error(data.error || 'Failed to add movie to watch history');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error adding movie to watch history: ${error.message}`);
    }
}

// Function to load watch history
async function loadWatchHistory() {
    try {
        const response = await fetch('http://localhost:5001/movies/watched');
        const movies = await response.json();
        
        const historyContainer = document.getElementById('watchHistory');
        historyContainer.innerHTML = '';
        
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <h3>${movie.title} (${movie.year})</h3>
                <p><strong>Watched on:</strong> ${new Date(movie.watch_date).toLocaleDateString()}</p>
                <p><strong>Rating:</strong> ${movie.rating}/10</p>
                <p><strong>Runtime:</strong> ${movie.runtime} min</p>
            `;
            historyContainer.appendChild(movieCard);
        });
    } catch (error) {
        console.error('Error loading watch history:', error);
        document.getElementById('watchHistory').innerHTML = 
            '<p>Error loading watch history. Please try again later.</p>';
    }
}

// Function to load and display visualizations
async function loadAndDisplayVisualizations() {
    try {
        // First, clear all charts and show loading state
        document.querySelectorAll('.chart').forEach(chart => {
            const title = chart.querySelector('h3').textContent;
            chart.innerHTML = `<h3>${title}</h3><p>Loading...</p>`;
        });

        // Load watched movies data
        const moviesResponse = await fetch('http://localhost:5001/movies/watched');
        const movies = await moviesResponse.json();

        if (!movies || movies.length === 0) {
            document.querySelectorAll('.chart').forEach(chart => {
                const title = chart.querySelector('h3').textContent;
                chart.innerHTML = `<h3>${title}</h3><p>No movies in watch history yet</p>`;
            });
            return;
        }

        // Create basic visualizations
        createRatingsDistribution(movies);
        createGenreDistribution(movies);
        
        // Load network data
        const networkResponse = await fetch('http://localhost:5001/visualizations/data');
        const networkData = await networkResponse.json();

        // Create network visualizations if data exists
        if (networkData.creators_network && networkData.creators_network.nodes) {
            createCreatorsNetwork(networkData.creators_network);
        }
        
        if (networkData.viewing_patterns) {
            createViewingPatterns(networkData.viewing_patterns);
        }
        
        if (networkData.runtime_distribution) {
            createRuntimeDistribution(networkData.runtime_distribution);
        }

    } catch (error) {
        console.error('Error loading visualization data:', error);
        document.querySelectorAll('.chart').forEach(chart => {
            const title = chart.querySelector('h3').textContent;
            chart.innerHTML = `<h3>${title}</h3><p>Error loading data. Please try again later.</p>`;
        });
    }
}

// Re-run visualizations when window is resized
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        loadAndDisplayVisualizations();
    }, 250);
});

// Function to create drag behavior
function createDragBehavior(simulation) {
    return d3.drag()
        .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        })
        .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
        })
        .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        });
}

// Function to create creators network
function createCreatorsNetwork(data) {
    if (!data.nodes || !data.links || data.nodes.length === 0) {
        const container = document.getElementById('creatorsNetwork');
        container.innerHTML = '<h3>Directors & Writers Network</h3><p>No network data available</p>';
        return;
    }

    const container = document.getElementById('creatorsNetwork');
    const width = container.clientWidth;
    const height = 400;

    // Clear previous visualization
    container.innerHTML = '<h3>Directors & Writers Network</h3>';

    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create force simulation
    const simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).id(d => d.name))
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(width / 2, height / 2));

    // Create links
    const links = svg.append('g')
        .selectAll('line')
        .data(data.links)
        .enter()
        .append('line')
        .style('stroke', '#999')
        .style('stroke-opacity', 0.6)
        .style('stroke-width', d => Math.sqrt(d.movies.length));

    // Create node groups
    const nodeGroups = svg.append('g')
        .selectAll('g')
        .data(data.nodes)
        .enter()
        .append('g')
        .call(createDragBehavior(simulation));

    // Add circles to node groups
    nodeGroups.append('circle')
        .attr('r', d => 5 + d.movies.length)
        .style('fill', d => d.role === 'director' ? '#ff7f0e' : '#1f77b4');

    // Add labels to node groups
    nodeGroups.append('text')
        .text(d => d.name)
        .attr('dx', 12)
        .attr('dy', 4)
        .style('font-size', '12px')
        .style('font-family', 'Arial');

    // Add tooltips
    nodeGroups.append('title')
        .text(d => `${d.name}\nRole: ${d.role}\nMovies: ${d.movies.join(', ')}`);

    // Update positions
    simulation.on('tick', () => {
        links
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        nodeGroups.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 100}, 20)`);

    legend.append('circle')
        .attr('r', 5)
        .attr('cx', 0)
        .attr('cy', 0)
        .style('fill', '#ff7f0e');

    legend.append('text')
        .attr('x', 10)
        .attr('y', 4)
        .text('Director')
        .style('font-size', '12px');

    legend.append('circle')
        .attr('r', 5)
        .attr('cx', 0)
        .attr('cy', 20)
        .style('fill', '#1f77b4');

    legend.append('text')
        .attr('x', 10)
        .attr('y', 24)
        .text('Writer')
        .style('font-size', '12px');
}

// Add these new functions to handle the ratings and genre distributions
function createRatingsDistribution(movies) {
    const container = document.getElementById('ratingChart');
    const width = container.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // Clear previous visualization
    container.innerHTML = '<h3>IMDb Ratings Distribution</h3>';

    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Process data
    const ratings = movies.map(m => parseFloat(m.rating));
    const binWidth = 0.5;
    const bins = d3.bin()
        .domain([0, 10])
        .thresholds(20)
        (ratings);

    // Create scales
    const x = d3.scaleLinear()
        .domain([0, 10])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Create bars
    svg.append('g')
        .selectAll('rect')
        .data(bins)
        .join('rect')
        .attr('x', d => x(d.x0))
        .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr('y', d => y(d.length))
        .attr('height', d => y(0) - y(d.length))
        .attr('fill', 'steelblue');

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(10));

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}

function createGenreDistribution(movies) {
    const container = document.getElementById('genreChart');
    const width = container.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 70, left: 40 };

    // Clear previous visualization
    container.innerHTML = '<h3>Genre Distribution</h3>';

    // Process data
    const genreCounts = {};
    movies.forEach(movie => {
        movie.genre.split(', ').forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
    });

    const data = Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count);

    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.genre))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Create bars
    svg.append('g')
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => x(d.genre))
        .attr('y', d => y(d.count))
        .attr('height', d => y(0) - y(d.count))
        .attr('width', x.bandwidth())
        .attr('fill', 'steelblue');

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}
// Add these missing functions to your main.js file

function createViewingPatterns(data) {
    if (!data || data.length === 0) {
        const container = document.getElementById('viewingPatterns');
        container.innerHTML = '<h3>Viewing Patterns Over Time</h3><p>No viewing pattern data available</p>';
        return;
    }

    const container = document.getElementById('viewingPatterns');
    const width = container.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // Clear previous visualization
    container.innerHTML = '<h3>Viewing Patterns Over Time</h3>';

    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Parse dates
    const parseDate = d3.timeParse('%Y-%W');
    const formatDate = d3.timeFormat('%b %Y');
    
    const formattedData = data.map(d => ({
        date: parseDate(d.date),
        count: d.count
    })).sort((a, b) => a.date - b.date);

    // Create scales
    const x = d3.scaleTime()
        .domain(d3.extent(formattedData, d => d.date))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.count)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Create line generator
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.count))
        .curve(d3.curveMonotoneX);

    // Add the line path
    svg.append('path')
        .datum(formattedData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line);

    // Add dots
    svg.selectAll('circle')
        .data(formattedData)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.count))
        .attr('r', 4)
        .attr('fill', 'steelblue');

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(formatDate))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5));

    // Add labels
    svg.append('text')
        .attr('class', 'y-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0)
        .attr('x', -height/2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Movies Watched');
}

function createRuntimeDistribution(data) {
    if (!data || Object.keys(data).length === 0) {
        const container = document.getElementById('runtimeDistribution');
        container.innerHTML = '<h3>Runtime Distribution by Genre</h3><p>No runtime data available</p>';
        return;
    }

    const container = document.getElementById('runtimeDistribution');
    const width = container.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };

    // Clear previous visualization
    container.innerHTML = '<h3>Runtime Distribution by Genre</h3>';

    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Process data for box plots
    const processedData = Object.entries(data).map(([genre, runtimes]) => {
        const sorted = runtimes.sort(d3.ascending);
        return {
            genre,
            min: d3.min(sorted),
            q1: d3.quantile(sorted, 0.25),
            median: d3.quantile(sorted, 0.5),
            q3: d3.quantile(sorted, 0.75),
            max: d3.max(sorted),
            mean: d3.mean(sorted)
        };
    });

    // Create scales
    const x = d3.scaleBand()
        .domain(processedData.map(d => d.genre))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.max)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Draw box plots
    const boxWidth = x.bandwidth();

    processedData.forEach(d => {
        // Draw box
        svg.append('rect')
            .attr('x', x(d.genre))
            .attr('y', y(d.q3))
            .attr('height', y(d.q1) - y(d.q3))
            .attr('width', boxWidth)
            .attr('fill', 'steelblue')
            .attr('stroke', 'black');

        // Draw median line
        svg.append('line')
            .attr('x1', x(d.genre))
            .attr('x2', x(d.genre) + boxWidth)
            .attr('y1', y(d.median))
            .attr('y2', y(d.median))
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

        // Draw whiskers
        svg.append('line')
            .attr('x1', x(d.genre) + boxWidth/2)
            .attr('x2', x(d.genre) + boxWidth/2)
            .attr('y1', y(d.min))
            .attr('y2', y(d.q1))
            .attr('stroke', 'black');

        svg.append('line')
            .attr('x1', x(d.genre) + boxWidth/2)
            .attr('x2', x(d.genre) + boxWidth/2)
            .attr('y1', y(d.q3))
            .attr('y2', y(d.max))
            .attr('stroke', 'black');

        // Draw whisker caps
        svg.append('line')
            .attr('x1', x(d.genre) + boxWidth/4)
            .attr('x2', x(d.genre) + boxWidth * 3/4)
            .attr('y1', y(d.min))
            .attr('y2', y(d.min))
            .attr('stroke', 'black');

        svg.append('line')
            .attr('x1', x(d.genre) + boxWidth/4)
            .attr('x2', x(d.genre) + boxWidth * 3/4)
            .attr('y1', y(d.max))
            .attr('y2', y(d.max))
            .attr('stroke', 'black');
    });

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Add y-axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', margin.left - 40)
        .attr('x', -height/2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Runtime (minutes)');
}

function createReleaseYearTimeline(movies) {
    if (!movies || movies.length === 0) {
        const container = document.getElementById('timelineChart');
        container.innerHTML = '<h3>Release Year Timeline</h3><p>No release year data available</p>';
        return;
    }

    const container = document.getElementById('timelineChart');
    const width = container.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // Clear previous visualization
    container.innerHTML = '<h3>Release Year Timeline</h3>';

    // Process data
    const yearCounts = {};
    movies.forEach(movie => {
        const year = movie.year;
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    const data = Object.entries(yearCounts)
        .map(([year, count]) => ({ year: parseInt(year), count }))
        .sort((a, b) => a.year - b.year);

    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create scales
    const x = d3.scaleTime()
        .domain([
            new Date(d3.min(data, d => d.year), 0, 1),
            new Date(d3.max(data, d => d.year), 11, 31)
        ])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Create area generator
    const area = d3.area()
        .x(d => x(new Date(d.year, 0, 1)))
        .y0(y(0))
        .y1(d => y(d.count))
        .curve(d3.curveMonotoneX);

    // Add area
    svg.append('path')
        .datum(data)
        .attr('fill', 'steelblue')
        .attr('fill-opacity', 0.6)
        .attr('d', area);

    // Add line
    const line = d3.line()
        .x(d => x(new Date(d.year, 0, 1)))
        .y(d => y(d.count))
        .curve(d3.curveMonotoneX);

    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', line);

    // Add dots
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => x(new Date(d.year, 0, 1)))
        .attr('cy', d => y(d.count))
        .attr('r', 4)
        .attr('fill', 'steelblue')
        .append('title')
        .text(d => `${d.year}: ${d.count} movies`);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .ticks(d3.timeYear.every(1))
            .tickFormat(d3.timeFormat('%Y')));

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)
            .ticks(5)
            .tickFormat(d => Math.round(d)));

    // Add labels
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', margin.left - 40)
        .attr('x', -height/2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Number of Movies');
}

// Update the loadAndDisplayVisualizations function to include the timeline
async function loadAndDisplayVisualizations() {
    try {
        // First, clear all charts and show loading state
        document.querySelectorAll('.chart').forEach(chart => {
            const title = chart.querySelector('h3').textContent;
            chart.innerHTML = `<h3>${title}</h3><p>Loading...</p>`;
        });

        // Load watched movies data
        const moviesResponse = await fetch('http://localhost:5001/movies/watched');
        const movies = await moviesResponse.json();

        if (!movies || movies.length === 0) {
            document.querySelectorAll('.chart').forEach(chart => {
                const title = chart.querySelector('h3').textContent;
                chart.innerHTML = `<h3>${title}</h3><p>No movies in watch history yet</p>`;
            });
            return;
        }

        // Create all visualizations
        createRatingsDistribution(movies);
        createGenreDistribution(movies);
        createReleaseYearTimeline(movies);  // Add this line
        
        // Load network data
        const networkResponse = await fetch('http://localhost:5001/visualizations/data');
        const networkData = await networkResponse.json();

        // Create network visualizations if data exists
        if (networkData.creators_network && networkData.creators_network.nodes) {
            createCreatorsNetwork(networkData.creators_network);
        }
        
        if (networkData.viewing_patterns) {
            createViewingPatterns(networkData.viewing_patterns);
        }
        
        if (networkData.runtime_distribution) {
            createRuntimeDistribution(networkData.runtime_distribution);
        }

    } catch (error) {
        console.error('Error loading visualization data:', error);
        document.querySelectorAll('.chart').forEach(chart => {
            const title = chart.querySelector('h3').textContent;
            chart.innerHTML = `<h3>${title}</h3><p>Error loading data. Please try again later.</p>`;
        });
    }
}