import { updateList } from "./list.js";

export function createTopButtons(yearMin, yearMax, selectedCountryForSankey) {
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
        updateList(yearMin, yearMax, selectedCountryForSankey, "TV Show");
        updateTypeSelect("TV Show");  // Update the type-select to "TV Show"
    }

    buttonMovies.onclick = function() {
        updateList(yearMin, yearMax, selectedCountryForSankey, "Movie");
        updateTypeSelect("Movie");  // Update the type-select to "Movie"
    }
}
