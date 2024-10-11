// main.js

import { loadData } from './dataLoader.js';
import { createSankeyDiagram, updateSankeyDiagram } from './sankeyDiagram.js';
import { createSlider } from './slider.js';
import { createChoroplethMap, updateChoroplethMap } from './map.js'; // Import the update function

let dataForSankey;
let worldMapData;
let cleanedNetflix;
let countryAvailabilityData;
let countByYearNetflixData;
let movieCountryGenreAvailabilityData;
let dataIsLoaded = false;
let nbrOfMovie = 0;
let nbrOfTvShow = 0;
let yearMin = 2015;
let yearMax = 2021;
let selectedCountryForSankey = null;

async function createVisualization() {
    try {
        const {
            movieAndTvGenreCounts,
            cleanedNetflixData,
            worldMapData: mapData,
            countryAvailabilityData: availabilityData,
            countByYearData: countByYear,
            movieCountryGenreAvailabilityData : movieCountryGenreAvailability
        } = await loadData();

        console.log("Data loaded successfully:", countByYear);

        dataForSankey = movieAndTvGenreCounts;
        worldMapData = mapData;
        countryAvailabilityData = availabilityData;
        countByYearNetflixData = countByYear;
        cleanedNetflix = cleanedNetflixData;
        movieCountryGenreAvailabilityData = movieCountryGenreAvailability;

        dataIsLoaded = true;

        // **Create the choropleth map first**
        createChoroplethMap(worldMapData, countryAvailabilityData, '#map', yearMin, yearMax);

        // Create the Sankey diagram
        createSankeyDiagram(dataForSankey, nbrOfMovie, nbrOfTvShow);

        // Create the slider for the year range
        createSlider(yearMin, yearMax, updateDashboard);

    } catch (error) {
        console.error("Visualization could not be created:", error);
    }
}

// Listen for the countrySelected event
document.addEventListener('countrySelected', function(event) {
    selectedCountryForSankey = event.detail.country;
    // If you want to trigger an update right after a country is selected:
    updateSankeyDiagram(yearMin, yearMax, dataForSankey, countByYearNetflixData,movieCountryGenreAvailabilityData, selectedCountryForSankey);
});


function updateDashboard(minYear, maxYear) {
    if (!dataIsLoaded) return;
    yearMin = minYear;
    yearMax = maxYear;

    // Update the Sankey diagram
    updateSankeyDiagram(yearMin, yearMax, dataForSankey, countByYearNetflixData,movieCountryGenreAvailabilityData, selectedCountryForSankey);

    // Update the choropleth map
    updateChoroplethMap(countryAvailabilityData, yearMin, yearMax);
}

// Initialize the visualization when the window loads
window.onload = createVisualization;
