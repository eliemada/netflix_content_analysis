// Variables to store elements for updates
let mapGroup;
let pathSelection;
let availabilityByCountry = new Map();
let colorScale;
let countryNameCorrections;
let legendGroup;
let selectedCountry = null; // Add this variable to keep track of the selected country
let tooltip; // Tooltip for country names

export function createChoroplethMap(worldMapData, countryAvailabilityData,containerId, minYear, maxYear) {

    // Clear previous choropleth map
    d3.select(containerId).selectAll("*").remove();

    // Get the actual dimensions of the container
    const container = d3.select(containerId);
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;


    tooltip = d3.select(containerId)
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "rgba(0,0,0,0.7)")
        .style("color", "#fff")
        .style("padding", "5px 10px")
        .style("border-radius", "5px")
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "12px")
        .style("pointer-events", "none");

    // Set up margins
    const margin = {top: 20, right: 20, bottom: 50, left: 20};

    // Create SVG with a background color
    const svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "#221F1F");

    // Create a group for the map
    mapGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process the map data
    const countries = topojson.feature(worldMapData, worldMapData.objects.countries);

    // Filter out Antarctica
    const filteredCountries = {
        ...countries,
        features: countries.features.filter(d => d.properties.name !== "Antarctica")
    };

    // Create a map projection
    const projection = d3.geoMercator()
        .fitSize([width - margin.left - margin.right, height - margin.top - margin.bottom], filteredCountries);

    // Create a path generator
    const path = d3.geoPath().projection(projection);

    // Add zoom functionality
    const zoom = d3.zoom()
        .scaleExtent([2, 8])
        .on("zoom", (event) => {
            mapGroup.attr("transform", event.transform);
        });

    // Initial zoom and translation
    const initialScale = 2;
    const initialX = -width / 2.5;
    const initialY = -height / 2.75;

    svg.call(zoom)
        .call(zoom.transform, d3.zoomIdentity.translate(initialX, initialY).scale(initialScale));

    // Map TopoJSON country names to availability data country names
    countryNameCorrections = {
        "United States of America": "United States",
        "Republic of Korea": "South Korea",
        "Russian Federation": "Russia",
        "Hong Kong S.A.R.": "Hong Kong",
        "Czechia": "Czech Republic",
        "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
        "Democratic Republic of the Congo": "Congo (Kinshasa)",
        "Republic of the Congo": "Congo (Brazzaville)",
        "North Macedonia": "Macedonia",
        "Syrian Arab Republic": "Syria",
        "Viet Nam": "Vietnam",
        "Iran (Islamic Republic of)": "Iran",
        "Tanzania, United Republic of": "Tanzania",
        "Lao People's Democratic Republic": "Laos",
        "Moldova (Republic of)": "Moldova",
        "Venezuela (Bolivarian Republic of)": "Venezuela",
        "Bolivia (Plurinational State of)": "Bolivia",
        "Brunei Darussalam": "Brunei",
        "Palestine": "Palestine",
        "Cape Verde": "Cabo Verde",
        "Timor-Leste": "East Timor",
        "Myanmar": "Myanmar",
        "Libyan Arab Jamahiriya": "Libya",
        "Eswatini": "Swaziland",
        "Korea": "South Korea",
        // Add other corrections as needed
    };

    // Prepare the data: create a mapping from country name to availability value
    availabilityByCountry = new Map();
    countryAvailabilityData.forEach(d => {
        const countryName = d.Country;
        let totalAvailability = 0;
        for (let year = minYear; year <= maxYear; year++) {
            totalAvailability += +d[String(year)] || 0;
        }
        availabilityByCountry.set(countryName, totalAvailability);
    });

    const availabilityValues = Array.from(availabilityByCountry.values());
    console.log("Availability Values:", availabilityValues);

    let minAvailability = d3.min(availabilityValues);
    let maxAvailability = d3.max(availabilityValues);
    console.log("Min Availability:", minAvailability);
    console.log("Max Availability:", maxAvailability);

// Handle cases where minAvailability or maxAvailability is undefined
    if (minAvailability === undefined || maxAvailability === undefined) {
        console.warn("No data available for the selected year range.");
        // Set default values to prevent errors
        minAvailability = 0;
        maxAvailability = 1;
    }

// Handle cases where minAvailability and maxAvailability are equal
    if (minAvailability === maxAvailability) {
        maxAvailability += 1; // Prevent zero range in domain
    }

// Create a color scale using a sequential color interpolator
    colorScale = d3.scaleSequential()
        .domain([minAvailability, maxAvailability])
        .interpolator(d3.interpolateReds);

// **Check if colorScale is defined**
//     console.log("Color Scale:", colorScale);
    // Draw the map with data coloring
    pathSelection = mapGroup.selectAll("path")
        .data(filteredCountries.features)
        .join("path")
        .attr("d", path)
        .attr("fill", d => {
            let countryName = d.properties.name;
            // Correct country names if necessary
            if (countryNameCorrections[countryName]) {
                countryName = countryNameCorrections[countryName];
            }
            const availability = availabilityByCountry.get(countryName);
            if (availability !== undefined) {
                return colorScale(availability);
            } else {
                return "#ccc"; // Default color for countries with no data
            }
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        // Add interactions
        .on("mouseover", function (event, d) {
            // Highlight the country on hover
            d3.select(this)
                .attr("stroke", "#FFD700") // Gold color
                .attr("stroke-width", 2);

            // Show tooltip with country name
            let countryName = d.properties.name;
            if (countryNameCorrections[countryName]) {
                countryName = countryNameCorrections[countryName];
            }
            tooltip.style("visibility", "visible")
                .text(countryName);
        })
        .on("mousemove", function (event) {
            // Move the tooltip with the mouse
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function (event, d) {
            // Reset the style if it's not the selected country
            if (selectedCountry !== this) {
                d3.select(this)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 0.5);
            }
            // Hide tooltip
            tooltip.style("visibility", "hidden");
        })
        .on("click", function (event, d) {
            let countryName = d.properties.name;
            if (countryNameCorrections[countryName]) {
                countryName = countryNameCorrections[countryName];
            }
            // Deselect the currently selected country
            if (selectedCountry && selectedCountry !== this) {
                d3.select(selectedCountry)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 0.5)
                    .attr("stroke-dasharray", null)
                    .attr("stroke-dashoffset", null)
                    .interrupt(); // Stop ongoing animations
            }
            // Toggle selection
            if (selectedCountry === this) {
                // Deselect the country
                d3.select(this)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 0.5)
                    .attr("stroke-dasharray", null)
                    .attr("stroke-dashoffset", null)
                    .interrupt();
                selectedCountry = null;
            } else {
                // // Emit a custom event with the country name
                const event = new CustomEvent('countrySelected', {
                    detail: { country: countryName}
                });
                document.dispatchEvent(event);
                // Select the country
                selectedCountry = this;
                d3.select(this)
                    .attr("stroke", "#FFD700") // Gold color
                    .attr("stroke-width", 0.75);
                animateStroke(d3.select(this));
            }
        });

    function animateStroke(selection) {
        selection
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-dashoffset", 0)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 10)
            .on("end", function () {
                // Continue the animation if the country is still selected
                if (selectedCountry === this) {
                    animateStroke(selection);
                }
            });
    }

    // **Add the legend**
    // Dimensions and positioning for the legend
    const legendWidth = 200;
    const legendHeight = 10;
    const legendMargin = 10; // Margin from the edges

    // Create a group for the legend
    const legendGroupX = legendMargin;
    const legendGroupY = height - margin.bottom - legendHeight - legendMargin - 15;
    legendGroup = svg.append("g")
        .attr("transform", `translate(${legendGroupX}, ${legendGroupY})`);

    // Define the gradient and blur filter within a single <defs> section
    const defs = svg.append("defs");

    // Define the gradient for the legend
    const legendGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");

    // Define gradient stops
    const numStops = 10;
    const legendStops = d3.range(numStops).map(i => {
        const value = minAvailability + i * (maxAvailability - minAvailability) / (numStops - 1);
        return {offset: (i / (numStops - 1) * 100) + "%", color: colorScale(value)};
    });

    legendGradient.selectAll("stop")
        .data(legendStops)
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // Define the blur filter
    const blurFilter = defs.append("filter")
        .attr("id", "blur-filter");

    blurFilter.append("feGaussianBlur")
        .attr("stdDeviation", 5); // Adjust the blur intensity

    // Adjust background rectangle dimensions
    const backgroundRectX = -legendMargin;
    const backgroundRectY = -legendMargin - 25;
    const backgroundRectWidth = legendWidth + legendMargin * 2;
    const backgroundRectHeight = legendHeight + legendMargin * 2 + 55 + 30; // Adjusted height

    // Add a background rectangle behind the legend with blur filter
    legendGroup.append("rect")
        .attr("x", backgroundRectX)
        .attr("y", backgroundRectY)
        .attr("width", backgroundRectWidth)
        .attr("height", backgroundRectHeight)
        .attr("fill", "rgba(0, 0, 0, 0.6)") // Semi-transparent black background
        .attr("filter", "url(#blur-filter)") // Apply blur filter
        .attr("rx", 5) // Rounded corners
        .attr("ry", 5)
        .lower(); // Ensure the background is behind other legend elements

    // Draw the rectangle for the legend gradient
    legendGroup.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    // Create a scale for the legend axis
    const legendAxisScale = d3.scaleLinear()
        .domain([minAvailability, maxAvailability])
        .range([0, legendWidth]);

    // Add the legend axis
    const legendAxis = d3.axisBottom(legendAxisScale)
        .ticks(5)
        .tickFormat(d3.format("d"));

    const axisGroup = legendGroup.append("g")
        .attr("class", "legend-axis")
        .attr("transform", `translate(0, ${legendHeight + 5})`)
        .call(legendAxis);

    // Style the axis line and ticks
    axisGroup.selectAll("path")
        .style("stroke", "#fff"); // Axis line color

    axisGroup.selectAll("line")
        .style("stroke", "#fff"); // Tick lines color

    // Style the tick labels
    axisGroup.selectAll("text")
        .attr("dy", "1em") // Adjust vertical position of tick labels
        .style("fill", "#fff")
        .style("font-size", "12px")
        .style("font-family", "Netflix_font");

    // Add legend title
    legendGroup.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .text("Availability")
        .style("fill", "#fff")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font-family", "Netflix_font");

    // Add 'No Data' indicator
    const noDataX = 0;
    const noDataY = legendHeight + 35; // Position below the axis labels

    legendGroup.append("rect")
        .attr("x", noDataX)
        .attr("y", noDataY)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#ccc") // Same color used for countries with no data
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);

    legendGroup.append("text")
        .attr("x", noDataX + 20)
        .attr("y", noDataY + 12)
        .text("No data")
        .style("fill", "#fff")
        .style("font-size", "12px")
        .style("font-family", "Netflix_font");

    // Optional: Add a border around the legend
    legendGroup.append("rect")
        .attr("x", backgroundRectX)
        .attr("y", backgroundRectY)
        .attr("width", backgroundRectWidth)
        .attr("height", backgroundRectHeight)
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .lower();
}


export function updateChoroplethMap(countryAvailabilityData, minYear, maxYear) {
    // Update the availabilityByCountry map with new data
    availabilityByCountry.clear();
    countryAvailabilityData.forEach(d => {
        const countryName = d.Country;
        let totalAvailability = 0;
        for (let year = minYear; year <= maxYear; year++) {
            totalAvailability += +d[String(year)] || 0;
        }
        availabilityByCountry.set(countryName, totalAvailability);
    });

    // Recalculate min and max availability
    const availabilityValues = Array.from(availabilityByCountry.values());
    const minAvailability = d3.min(availabilityValues);
    const maxAvailability = d3.max(availabilityValues);

    // Update the color scale domain
    colorScale.domain([minAvailability, maxAvailability]);

    // Update the fills of the map paths
    pathSelection
        .transition()
        .duration(500)
        .attr("fill", d => {
            let countryName = d.properties.name;
            // Correct country names if necessary
            if (countryNameCorrections[countryName]) {
                countryName = countryNameCorrections[countryName];
            }
            const availability = availabilityByCountry.get(countryName);
            if (availability !== undefined) {
                return colorScale(availability);
            } else {
                return "#ccc"; // Default color for countries with no data
            }
        });

    // Update the legend gradient
    const numStops = 10;
    const legendGradient = d3.select("#legend-gradient");

    const legendStops = d3.range(numStops).map(i => {
        const value = minAvailability + i * (maxAvailability - minAvailability) / (numStops - 1);
        return {offset: (i / (numStops - 1) * 100) + "%", color: colorScale(value)};
    });

    legendGradient.selectAll("stop")
        .data(legendStops)
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // Update the legend axis
    const legendAxisScale = d3.scaleLinear()
        .domain([minAvailability, maxAvailability])
        .range([0, 200]); // Use the same legendWidth as before

    const legendAxis = d3.axisBottom(legendAxisScale)
        .ticks(5)
        .tickFormat(d3.format("d"));

    legendGroup.select(".legend-axis")
        .call(legendAxis)
        .selectAll("text")
        .attr("dy", "1em")
        .style("fill", "#fff")
        .style("font-size", "12px")
        .style("font-family", "Netflix_font");

    // Update the 'No Data' indicator if necessary (optional)
    // ...
}
