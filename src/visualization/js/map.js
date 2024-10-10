// map.js

export function createChoroplethMap(worldMapData, countryAvailabilityData, containerId) {
    // Clear previous choropleth map
    d3.select(containerId).selectAll("*").remove();

    // Get the actual dimensions of the container
    const container = d3.select(containerId);
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;

    // Set up margins
    const margin = { top: 20, right: 20, bottom: 50, left: 80 };

    // Create SVG with a background color
    const svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "#221F1F");

    // Create a group for the map
    const mapGroup = svg.append("g")
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

    // Prepare the data: create a mapping from country name to availability value
    const availabilityByCountry = new Map();
    countryAvailabilityData.forEach(d => {
        const countryName = d.Country;
        const overallAvailability = +d.Overall;
        availabilityByCountry.set(countryName, overallAvailability);
    });

    // Map TopoJSON country names to availability data country names
    const countryNameCorrections = {
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

    // Calculate min and max availability
    const minAvailability = d3.min(countryAvailabilityData, d => +d.Overall);
    const maxAvailability = d3.max(countryAvailabilityData, d => +d.Overall);

    // Create a color scale using a sequential color interpolator
    const colorScale = d3.scaleSequential()
        .domain([minAvailability, maxAvailability])
        .interpolator(d3.interpolateReds);

    // Draw the map with data coloring
    mapGroup.selectAll("path")
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
        .attr("stroke-width", 0.5);

    // **Add the legend**
    // Dimensions and positioning for the legend
    const legendWidth = 200;
    const legendHeight = 10;
    const legendMargin = 10; // Margin from the edges

    // Create a group for the legend
    const legendGroupY = height - margin.bottom - legendHeight - legendMargin - 20;
    const legendGroup = svg.append("g")
        .attr("transform", `translate(${legendMargin}, ${height - 0.7 * margin.bottom - legendHeight - legendMargin})`);

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
        return { offset: (i / (numStops - 1) * 100) + "%", color: colorScale(value) };
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

    // Add a background rectangle behind the legend with blur filter
    legendGroup.append("rect")
        .attr("x", -legendMargin)
        .attr("y", -legendMargin - 25)
        .attr("width", legendWidth + legendMargin * 2)
        .attr("height", legendHeight + legendMargin * 2 + 55)
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
// Add the legend axis
    const legendAxis = d3.axisBottom(legendAxisScale)
        .ticks(5)
        .tickFormat(d3.format("d"));

    const axisGroup = legendGroup.append("g")
        .attr("transform", `translate(0, ${legendHeight + 5})`)
        .call(legendAxis);

// Change the color of the axis line and ticks to white
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

    // **Optional: Add a border around the legend**
    legendGroup.append("rect")
        .attr("x", -legendMargin / 2)
        .attr("y", -legendMargin / 2 - 20)
        .attr("width", legendWidth + legendMargin)
        .attr("height", legendHeight + legendMargin + 50)
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);

    const noDataX = 0;
    const noDataY = legendHeight - 30; // Position below the axis labels

// Add a rectangle for 'No Data' color
    legendGroup.append("rect")
        .attr("x", noDataX)
        .attr("y", noDataY)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#ccc") // Color for no data
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);

// Add text label for 'No Data'
    legendGroup.append("text")
        .attr("x", noDataX + 20)
        .attr("y", noDataY + 12)
        .text("No data")
        .style("fill", "#fff")
        .style("font-size", "12px")
        .style("font-family", "Netflix_font");
}
