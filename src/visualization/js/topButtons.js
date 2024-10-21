import { updateList } from "./list.js";

export function createTopButtons(yearMin, yearMax, selectedCountryForSankey) {
    var buttonTVShows = document.getElementById("TV Shows");
    var buttonMovies = document.getElementById("Movies");
    
    console.log("exist: ");

    buttonTVShows.onclick = function() {
        updateList(yearMin, yearMax, selectedCountryForSankey, "TV Show");
    }
    buttonMovies.onclick = function() {
        updateList(yearMin, yearMax, selectedCountryForSankey, "Movie");
    }
}