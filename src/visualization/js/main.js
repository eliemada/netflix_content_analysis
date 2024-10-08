// main.js

// import { genre, country } from './constants.js';
import { loadData } from './dataLoader.js';
import { createSankeyDiagram, updateSankeyDiagram } from './sankeyDiagram.js';
import { createSlider } from './slider.js';

let dataForSankey;
let dataForSankey2;
let dataIsLoaded = false;
let nbrOfMovie = 0;
let nbrOfTvShow = 0;
let yearMin = 2015;
let yearMax = 2021;

async function createVisualization() {
    try {
        const { dataForSankey: sankeyData, parsedData } = await loadData();
        dataForSankey = sankeyData;

        parsedData.forEach(row => {
            if (row.Series_or_Movie === "Movie") {
                nbrOfMovie += 1;
            } else {
                nbrOfTvShow += 1;
            }
        });

        dataIsLoaded = true;
        createSankeyDiagram(dataForSankey, nbrOfMovie, nbrOfTvShow);
        createSlider(yearMin, yearMax, updateDashboard);
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
