export function createChoroplethMap(worldMapData, containerId) {
    // Clear previous choropleth map
    d3.select(containerId).selectAll("*").remove();

    // Get the actual dimensions of the container
    const container = d3.select(containerId);
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;

    // Set up margins, but ensure the map scales correctly to the container
    const margin = { top: 20, right: 20, bottom: 50, left: 80 };

    // Create SVG with a background color
    const svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "#221F1F"); // Set the background color here

    // Create a group for the map and transformations
    const mapGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process the map data passed as `worldMapData`
    const countries = topojson.feature(worldMapData, worldMapData.objects.countries);

    // Filter out Antarctica by removing its geometry (ISO country code is usually "AQ")
    const filteredCountries = {
        ...countries,
        features: countries.features.filter(d => d.properties.name !== "Antarctica")
    };

    // Create a map projection that fits the container's size
    const projection = d3.geoMercator()
        .fitSize([width - margin.left - margin.right, height - margin.top - margin.bottom], filteredCountries);

    // Create a path generator
    const path = d3.geoPath().projection(projection);

    // Add zoom functionality
    const zoom = d3.zoom()
        .scaleExtent([2, 8]) // Set the min and max zoom levels
        .on("zoom", (event) => {
            mapGroup.attr("transform", event.transform); // Apply zoom transform
        });

    // Set an initial zoom and translation to focus on Europe, Africa, and Asia
    const initialScale = 2; // Zoom level (adjust as needed)
    const initialX = -width / 2.5; // Horizontal translation (adjust as needed)
    const initialY = -height / 2.75; // Vertical translation (adjust as needed)

    svg.call(zoom)
        .call(zoom.transform, d3.zoomIdentity.translate(initialX, initialY).scale(initialScale));

    // Draw the map without data coloring
    mapGroup.selectAll("path")
        .data(filteredCountries.features)
        .join("path")
        .attr("d", path)
        .attr("fill", "#ccc") // Default fill color for the countries
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);
}
