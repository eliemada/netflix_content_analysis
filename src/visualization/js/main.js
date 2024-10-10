// main.js

// import { genre, country } from './constants.js';
import { loadData } from './dataLoader.js';
import { createSankeyDiagram, updateSankeyDiagram } from './sankeyDiagram.js';
import { createSlider } from './slider.js';
import { createChoroplethMap } from './map.js'; // Import the choropleth map function

let dataForSankey;
let worldMapData;
let dataIsLoaded = false;
let nbrOfMovie = 0;
let nbrOfTvShow = 0;
let yearMin = 2015;
let yearMax = 2021;

async function createVisualization() {
    try {
        const {
            movieAndTvGenreCounts, // Updated from dataForSankey
            cleanedNetflixData, // Updated from parsedData
            worldMapData: mapData,
            countryAvailabilityData
        } = await loadData(); // Destructure the loaded data
        dataForSankey = movieAndTvGenreCounts; // Use the updated variable name
        worldMapData = mapData; // Assign world map data to a variable

        // Count movies and TV shows
        cleanedNetflixData.forEach(row => {
            if (row.Series_or_Movie === "Movie") {
                nbrOfMovie += 1;
            } else {
                nbrOfTvShow += 1;
            }
        });

        dataIsLoaded = true;

        // Create the Sankey diagram
        createSankeyDiagram(dataForSankey, nbrOfMovie, nbrOfTvShow);

        // Create the slider for the year range
        createSlider(yearMin, yearMax, updateDashboard);

        // Create the choropleth map using world map data and availability data
        createChoroplethMap(worldMapData, countryAvailabilityData, '#map');

    } catch (error) {
        console.error("Visualization could not be created:", error);
    }
}

function updateDashboard(minYear, maxYear) {
    if (!dataIsLoaded) return;
    yearMin = minYear;
    yearMax = maxYear;
    updateSankeyDiagram(yearMin, yearMax, dataForSankey, nbrOfMovie, nbrOfTvShow);
}

// Initialize the visualization when the window loads
window.onload = createVisualization;
