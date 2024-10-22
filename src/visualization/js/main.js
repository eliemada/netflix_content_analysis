// main.js

import { loadData } from './dataLoader.js';
import { createSankeyDiagram, updateSankeyDiagram } from './sankeyDiagram.js';
import { createSlider } from './slider.js';
import { createChoroplethMap, updateChoroplethMap } from './map.js';
import { createList, updateList } from './list.js'; // Import updateList
import { createSliderLegend } from './sliderLegend.js';
import {createTopButtons} from './topButtons.js';

let dataForSankey;
let worldMapData;
let cleanedNetflix;
let countryAvailabilityData;
let countByYearNetflixData;
let countByYearandCoutryNetflixData;
let movieCountryGenreAvailabilityData;
let serieCountryGenreAvailabilityData;
let threadholdSankey = 7;
let dataIsLoaded = false;
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
            movieCountryGenreAvailabilityData: movieCountryGenreAvailability,
            serieCountryGenreAvailabilityData: serieCountryGenreAvailability
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

        yearMin = 2015;
        yearMax = 2021;

        dataIsLoaded = true;

        // Create the choropleth map first
        createChoroplethMap(worldMapData, countryAvailabilityData, '#map', yearMin, yearMax);

        // Create the Sankey diagram
        createSankeyDiagram(yearMin, yearMax, dataForSankey, countByYearNetflixData, countByYearandCoutryNetflixData, movieCountryGenreAvailabilityData, serieCountryGenreAvailabilityData);

        // Create the list
        createList(cleanedNetflix, yearMin, yearMax);

        // Create the slider for the year range
        createSlider(yearMin, yearMax, updateDashboard);

        createTopButtons(yearMin, yearMax, selectedCountryForSankey);

        createSliderLegend(updateSankeyDiagram, yearMin, yearMax, dataForSankey, countByYearNetflixData, countByYearandCoutryNetflixData, movieCountryGenreAvailabilityData, serieCountryGenreAvailabilityData, selectedCountryForSankey);

        // Hide preloader and show main content with transition
        document.getElementById('preloader').style.display = 'none';
        document.getElementById('topBar').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'flex';
        document.getElementById('rightSide').style.display = 'flex';
        document.getElementById('rightSide').style.opacity = '1';
        document.getElementById('topBar').style.opacity = '1';
        document.getElementById('dashboard').style.opacity = '1';

    } catch (error) {
        console.error("Visualization could not be created:", error);
    }
}


// Listen for the countrySelected event
document.addEventListener('countrySelected', function(event) {
    selectedCountryForSankey = event.detail.country;
    // Update the Sankey diagram
    updateSankeyDiagram(yearMin, yearMax, threadholdSankey,dataForSankey, countByYearNetflixData, countByYearandCoutryNetflixData, movieCountryGenreAvailabilityData, serieCountryGenreAvailabilityData, selectedCountryForSankey);
    // Update the list
    updateList(yearMin, yearMax, selectedCountryForSankey);
});

// Listen for the countryDeselected event
document.addEventListener('countryDeselected', function(event) {
    selectedCountryForSankey = null;
    // Update the Sankey diagram
    updateSankeyDiagram(yearMin, yearMax, threadholdSankey,dataForSankey, countByYearNetflixData, countByYearandCoutryNetflixData, movieCountryGenreAvailabilityData, serieCountryGenreAvailabilityData, selectedCountryForSankey);
    // Update the list
    updateList(yearMin, yearMax, selectedCountryForSankey);
});


document.addEventListener('updateSliderSankey', function(event) {
    threadholdSankey = event.detail.value;

    // Now use the new slider value to update the Sankey diagram
    updateSankeyDiagram(
        yearMin,
        yearMax,
        threadholdSankey,
        dataForSankey,
        countByYearNetflixData,
        countByYearandCoutryNetflixData,
        movieCountryGenreAvailabilityData,
        serieCountryGenreAvailabilityData,
        selectedCountryForSankey
    );
});

function updateDashboard(minYear, maxYear) {
    if (!dataIsLoaded) return;
    yearMin = minYear;
    yearMax = maxYear;


    // Update the Sankey diagram
    updateSankeyDiagram(yearMin, yearMax, threadholdSankey,dataForSankey, countByYearNetflixData, countByYearandCoutryNetflixData, movieCountryGenreAvailabilityData, serieCountryGenreAvailabilityData, selectedCountryForSankey);

    // Update the choropleth map
    updateChoroplethMap(countryAvailabilityData, yearMin, yearMax);

    // Update the list
    updateList(yearMin, yearMax, selectedCountryForSankey);

}

// Initialize the visualization when the window loads
window.onload = createVisualization();
