// main.js

import { loadData } from './dataLoader.js';
import { createSankeyDiagram, updateSankeyDiagram } from './sankeyDiagram.js';
import { createSlider } from './slider.js';
import { createChoroplethMap, updateChoroplethMap } from './map.js'; // Import the update function
// import { createList, updateList } from './list.js';

let dataForSankey;
let worldMapData;
let cleanedNetflix;
let countryAvailabilityData;
let countByYearNetflixData;
let countByYearandCoutryNetflixData;
let movieCountryGenreAvailabilityData;
let serieCountryGenreAvailabilityData;
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
            countByYearandCoutryData: countByYearandCoutry,
            movieCountryGenreAvailabilityData : movieCountryGenreAvailability,
            serieCountryGenreAvailabilityData : serieCountryGenreAvailability

        } = await loadData();

        console.log("Data loaded successfully:", countByYear);

        dataForSankey = movieAndTvGenreCounts;
        worldMapData = mapData;
        countryAvailabilityData = availabilityData;
        countByYearNetflixData = countByYear;
        countByYearandCoutryNetflixData = countByYearandCoutry;
        cleanedNetflix = cleanedNetflixData;
        movieCountryGenreAvailabilityData = movieCountryGenreAvailability;
        serieCountryGenreAvailabilityData = serieCountryGenreAvailability;

        yearMin= 2015;
        yearMax= 2021;

        dataIsLoaded = true;

        // **Create the choropleth map first**
        createChoroplethMap(worldMapData, countryAvailabilityData, '#map', yearMin, yearMax);

        // Create the Sankey diagram
        createSankeyDiagram(2015, 2021, dataForSankey, countByYearNetflixData,countByYearandCoutryNetflixData,movieCountryGenreAvailabilityData, serieCountryGenreAvailabilityData);

        // Create the slider for the year range
        createSlider(yearMin, yearMax, updateDashboard);

        createList('#yourTop', ["Top 10 Movies", "Top 10 TV Shows"]);

    } catch (error) {
        console.error("Visualization could not be created:", error);
    }
}

// Listen for the countrySelected event
document.addEventListener('countrySelected', function(event) {
    selectedCountryForSankey = event.detail.country;
    // If you want to trigger an update right after a country is selected:
    updateSankeyDiagram(yearMin, yearMax, dataForSankey, countByYearNetflixData,countByYearandCoutryNetflixData,movieCountryGenreAvailabilityData, serieCountryGenreAvailabilityData, selectedCountryForSankey);
});

document.addEventListener('countryDeselected', function(event) {
    selectedCountryForSankey = null;
    // If you want to trigger an update right after a country is unselected:
    updateSankeyDiagram(yearMin, yearMax, dataForSankey, countByYearNetflixData,countByYearandCoutryNetflixData,movieCountryGenreAvailabilityData, serieCountryGenreAvailabilityData, selectedCountryForSankey);
});


function updateDashboard(minYear, maxYear) {
    if (!dataIsLoaded) return;
    yearMin = minYear;
    yearMax = maxYear;

    // Update the Sankey diagram
    updateSankeyDiagram(yearMin, yearMax, dataForSankey, countByYearNetflixData,countByYearandCoutryNetflixData,movieCountryGenreAvailabilityData,serieCountryGenreAvailabilityData, selectedCountryForSankey);

    // Update the choropleth map
    updateChoroplethMap(countryAvailabilityData, yearMin, yearMax);

    updateList('#yourTop', ["Top 10 Movies", "Top 10 TV Shows"]);
}

// Initialize the visualization when the window loads
window.onload = createVisualization();
