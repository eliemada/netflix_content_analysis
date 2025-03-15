// dataLoader.js

export async function loadData() {
    const movieGenreCountsFile = "../data/initial_dataset/pre_processed/movies_genre_counts.csv";
    const tvShowsGenreCountsFile = "../data/initial_dataset/pre_processed/tv_shows_genre_counts.csv";
    const genrePercentagesFile = "../data/initial_dataset/pre_processed/genre_percentages.csv";
    const cleanedNetflixDataFile = "../data/initial_dataset/processed/cleaned_netflix_data.csv";
    const worldMapDataFile = "../data/initial_dataset/processed/countries-50m.json"; // The JSON file path for world map data
    const countryAvailabilityFile = "../data/initial_dataset/pre_processed/all_content_country_availability.csv";
    const countByYearFile = "../data/initial_dataset/pre_processed/count_by_year.csv";
    const countByYearandCoutryFile = "../data/initial_dataset/pre_processed/count_by_country_and_year.csv";
    const movieCountryGenreAvailabilityFile = "../data/initial_dataset/pre_processed/movies_country_genre_availability_by_year.csv";
    const serieCountryGenreAvailabilityFile = "../data/initial_dataset/pre_processed/tv_shows_country_genre_availability_by_year.csv";
    const movieCountryAvailabilityFile = "../data/initial_dataset/pre_processed/movies_country_availability.csv"
    const TVShowCountryAvailabilityFile = "../data/initial_dataset/pre_processed/tv_shows_country_availability.csv"
    try {
        const [movieAndTvData, cleanedNetflixData, genrePercentagesData, worldMapData, countryAvailabilityData, countByYearData,countByYearandCoutryData, movieCountryGenreAvailabilityData, serieCountryGenreAvailabilityData, movieCountryAvailabilityData,TVShowCountryAvailabilityData ] = await Promise.all([
            Promise.all([d3.csv(movieGenreCountsFile), d3.csv(tvShowsGenreCountsFile)]),
            d3.csv(cleanedNetflixDataFile),
            d3.csv(genrePercentagesFile),
            d3.json(worldMapDataFile), // Load the JSON file
            d3.csv(countryAvailabilityFile), // Load the country availability CSV file
            d3.csv(countByYearFile),
            d3.csv(countByYearandCoutryFile),
            d3.csv(movieCountryGenreAvailabilityFile),
            d3.csv(serieCountryGenreAvailabilityFile),
            d3.csv(movieCountryAvailabilityFile),
            d3.csv(TVShowCountryAvailabilityFile)
        ]);


        return {
            movieAndTvGenreCounts: movieAndTvData, // More descriptive name for movie and TV genre counts
            cleanedNetflixData: cleanedNetflixData, // Cleaned Netflix data
            genrePercentagesData: genrePercentagesData, // Genre percentages data
            worldMapData: worldMapData, // World map data from JSON
            countryAvailabilityData: countryAvailabilityData, // Include the country availability data
            countByYearData: countByYearData, 
            countByYearandCoutryData: countByYearandCoutryData, 
            movieCountryGenreAvailabilityData: movieCountryGenreAvailabilityData,
            serieCountryGenreAvailabilityData: serieCountryGenreAvailabilityData,
            movieCountryAvailabilityData: movieCountryAvailabilityData,
            TVShowCountryAvailabilityData: TVShowCountryAvailabilityData

        };
    } catch (error) {
        console.error("Error loading files:", error);
        throw error; // Rethrow the error to handle it in main.js
    }
}
