// dataLoader.js

export async function loadData() {
    const movieGenreCountsFile = "./src/dataset/pre_processing/movies_genre_counts.csv";
    const tvShowsGenreCountsFile = "./src/dataset/pre_processing/tv_shows_genre_counts.csv";
    const genrePercentagesFile = "./src/dataset/pre_processing/genre_percentages.csv";
    const cleanedNetflixDataFile = "./src/dataset/cleaned_netflix_data.csv";
    const worldMapDataFile = "./src/dataset/countries-50m.json"; // The JSON file path for world map data
    const countryAvailabilityFile = "./src/dataset/pre_processing/all_content_country_availability.csv";

    try {
        const [movieAndTvData, cleanedNetflixData, genrePercentagesData, worldMapData, countryAvailabilityData] = await Promise.all([
            Promise.all([d3.csv(movieGenreCountsFile), d3.csv(tvShowsGenreCountsFile)]),
            d3.csv(cleanedNetflixDataFile),
            d3.csv(genrePercentagesFile),
            d3.json(worldMapDataFile), // Load the JSON file
            d3.csv(countryAvailabilityFile) // Load the country availability CSV file
        ]);

        return {
            movieAndTvGenreCounts: movieAndTvData, // More descriptive name for movie and TV genre counts
            cleanedNetflixData: cleanedNetflixData, // Cleaned Netflix data
            genrePercentagesData: genrePercentagesData, // Genre percentages data
            worldMapData: worldMapData, // World map data from JSON
            countryAvailabilityData: countryAvailabilityData, // Include the country availability data
        };
    } catch (error) {
        console.error("Error loading files:", error);
        throw error; // Rethrow the error to handle it in main.js
    }
}
