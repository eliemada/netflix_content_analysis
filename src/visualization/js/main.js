// main.js

import { loadData } from './dataLoader.js';
import { createSankeyDiagram, updateSankeyDiagram } from './sankeyDiagram.js';
import { createSlider } from './slider.js';
import { createChoroplethMap, updateChoroplethMap } from './map.js'; // Import the update function

let dataForSankey;
let worldMapData;
let countryAvailabilityData;
let dataIsLoaded = false;
let nbrOfMovie = 0;
let nbrOfTvShow = 0;
let yearMin = 2015;
let yearMax = 2021;

async function createVisualization() {
    try {
        const {
            movieAndTvGenreCounts,
            cleanedNetflixData,
            worldMapData: mapData,
            countryAvailabilityData: availabilityData
        } = await loadData();

        dataForSankey = movieAndTvGenreCounts;
        worldMapData = mapData;
        countryAvailabilityData = availabilityData;

        // Count movies and TV shows
        cleanedNetflixData.forEach(row => {
            if (row.Series_or_Movie === "Movie") {
                nbrOfMovie += 1;
            } else {
                nbrOfTvShow += 1;
            }
        });

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


function updateDashboard(minYear, maxYear) {
    if (!dataIsLoaded) return;
    yearMin = minYear;
    yearMax = maxYear;

    // Update the Sankey diagram
    updateSankeyDiagram(yearMin, yearMax, dataForSankey, nbrOfMovie, nbrOfTvShow);

    // Update the choropleth map
    updateChoroplethMap(countryAvailabilityData, yearMin, yearMax);
}

// Initialize the visualization when the window loads
window.onload = createVisualization;
