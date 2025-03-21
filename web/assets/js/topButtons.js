import { updateList } from "./list.js";
import { updateChoroplethMap } from './map.js';

export function createTopButtons(yearMin, yearMax, getSelectedCountry, movieCountryAvailabilityData, TVShowCountryAvailabilityData ) {
    var buttonTVShows = document.getElementById("TV Shows");
    var buttonMovies = document.getElementById("Movies");

    // Function to update the type-select dropdown
    function updateTypeSelect(value) {
        const typeSelect = document.getElementById('type-select');
        typeSelect.value = value;  // Programmatically set the value of the dropdown

        // Manually trigger the 'change' event
        const event = new Event('change');
        typeSelect.dispatchEvent(event);  // This will trigger the listener attached to the typeSelect
    }

    buttonTVShows.onclick = function() {
        const selectedCountryForSankey = getSelectedCountry();  // Call the getter function to get the latest value
        updateList(yearMin, yearMax, selectedCountryForSankey, "TV Show");
        updateChoroplethMap(TVShowCountryAvailabilityData, yearMin, yearMax);
        updateTypeSelect("TV Show");  // Update the type-select to "TV Show"
    }

    buttonMovies.onclick = function() {
        const selectedCountryForSankey = getSelectedCountry();  // Call the getter function to get the latest value
        updateList(yearMin, yearMax, selectedCountryForSankey, "Movie");
        updateChoroplethMap(movieCountryAvailabilityData, yearMin, yearMax);
        updateTypeSelect("Movie");  // Update the type-select to "Movie"
    }
}
