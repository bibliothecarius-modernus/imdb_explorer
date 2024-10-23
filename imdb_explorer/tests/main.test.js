/**
 * @jest-environment jsdom
 */

import '../static/js/main.js';

describe('IMDb Explorer Frontend', () => {
    let fetchMock;
    
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="container">
                <nav class="tabs">
                    <button class="tab-button" data-tab="search">Search</button>
                    <button class="tab-button" data-tab="history">History</button>
                    <button class="tab-button" data-tab="analytics">Analytics</button>
                </nav>
                <div id="search-tab" class="tab-content">
                    <input type="text" id="searchInput">
                    <div id="movieResults"></div>
                    <div id="movieDetails"></div>
                </div>
                <div id="history-tab" class="tab-content">
                    <div id="watchHistory"></div>
                </div>
                <div id="analytics-tab" class="tab-content">
                    <div id="creatorsNetwork"></div>
                    <div id="viewingPatterns"></div>
                    <div id="runtimeDistribution"></div>
                </div>
            </div>
        `;
        
        // Mock fetch
        fetchMock = jest.fn();
        global.fetch = fetchMock;
    });
    
    afterEach(() => {
        jest.resetAllMocks();
    });
    
    describe('Movie Search', () => {
        test('displays error when search input is empty', async () => {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = '';
            
            await searchMovies();
            
            const results = document.getElementById('movieResults');
            expect(results.innerHTML).toContain('Please enter a search term');
        });
        
        test('handles successful movie search', async () => {
            const mockResponse = {
                Search: [{
                    Title: 'The Matrix',
                    Year: '1999',
                    imdbID: 'tt0133093',
                    Type: 'movie',
                    Poster: 'https://example.com/matrix.jpg'
                }]
            };
            
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });
            
            const searchInput = document.getElementById('searchInput');
            searchInput.value = 'Matrix';
            
            await searchMovies();
            
            const results = document.getElementById('movieResults');
            expect(results.innerHTML).toContain('The Matrix');
            expect(results.innerHTML).toContain('1999');
        });
        
        test('handles API error during search', async () => {
            fetchMock.mockRejectedValueOnce(new Error('API Error'));
            
            const searchInput = document.getElementById('searchInput');
            searchInput.value = 'Matrix';
            
            await searchMovies();
            
            const results = document.getElementById('movieResults');
            expect(results.innerHTML).toContain('Error fetching results');
        });
    });
    
    describe('Movie Details', () => {
        test('displays movie details on successful fetch', async () => {
            const mockMovie = {
                Title: 'The Matrix',
                Year: '1999',
                Director: 'Lana Wachowski, Lilly Wachowski',
                Actors: 'Keanu Reeves, Laurence Fishburne',
                Plot: 'A computer programmer discovers...',
                Genre: 'Action, Sci-Fi',
                Runtime: '136 min',
                imdbRating: '8.7'
            };
            
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMovie
            });
            
            await getMovieDetails('tt0133093');
            
            const details = document.getElementById('movieDetails');
            expect(details.innerHTML).toContain('The Matrix');
            expect(details.innerHTML).toContain('Lana Wachowski, Lilly Wachowski');
            expect(details.innerHTML).toContain('Keanu Reeves');
        });
    });
    
    describe('Watch History', () => {
        test('adds movie to watch history', async () => {
            const mockResponse = { success: true };
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });
            
            window._currentMovie = {
                Title: 'The Matrix',
                Year: '1999'
            };
            
            document.body.innerHTML += '<input type="text" id="watchDate" value="2024-10-23">';
            
            await addToWatchHistory();
            
            expect(fetchMock).toHaveBeenCalledWith('/movie/watch', expect.any(Object));
        });
        
        test('displays watch history', async () => {
            const mockHistory = [{
                title: 'The Matrix',
                watch_date: '2024-10-23',
                rating: '8.7',
                poster_url: 'https://example.com/matrix.jpg'
            }];
            
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockHistory
            });
            
            await loadWatchHistory();
            
            const history = document.getElementById('watchHistory');
            expect(history.innerHTML).toContain('The Matrix');
            expect(history.innerHTML).toContain('2024-10-23');
        });
    });
    
    describe('Visualizations', () => {
        test('loads and displays visualization data', async () => {
            const mockData = {
                creators_network: {
                    nodes: [{ name: 'Lana Wachowski', role: 'director' }],
                    links: []
                },
                viewing_patterns: [{ date: '2024-W42', count: 1 }],
                runtime_distribution: { 'Action': [136] }
            };
            
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });
            
            await loadAndDisplayVisualizations();
            
            // Since D3 is mocked, we just verify the function was called
            expect(fetchMock).toHaveBeenCalledWith('/visualizations/data');
        });
    });
    
    describe('Tab Navigation', () => {
        test('switches tabs correctly', () => {
            const tabs = document.querySelectorAll('.tab-button');
            const contents = document.querySelectorAll('.tab-content');
            
            // Click history tab
            tabs[1].click();
            
            expect(tabs[1].classList.contains('active')).toBe(true);
            expect(contents[1].classList.contains('active')).toBe(true);
            expect(contents[0].classList.contains('active')).toBe(false);
        });
    });
});