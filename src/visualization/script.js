
var data
const genre = [
    "Action",
    "Adventure",
    "Animation",
    "Biography",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "Film-Noir",
    "History",
    "Horror",
    "Music",
    "Musical",
    "Mystery",
    "Reality-TV",
    "Romance",
    "Sci-Fi",
    "Short",
    "Sport",
    "Thriller",
    "War",
    "Western",
]

const country = [
    "Argentina",
    "Australia",
    "Belgium",
    "Brazil",
    "Canada",
    "Colombia",
    "Czech Republic",
    "France",
    "Germany",
    "Greece",
    "Hong Kong",
    "Hungary",
    "Iceland",
    "India",
    "Israel",
    "Italy",
    "Japan",
    "Lithuania",
    "Luxembourg",
    "Malaysia",
    "Mexico",
    "Netherlands",
    "Poland",
    "Portugal",
    "Romania",
    "Russia",
    "Singapore",
    "Slovakia",
    "South Africa",
    "South Korea",
    "Spain",
    "Sweden",
    "Switzerland",
    "Thailand",
    "Turkey",
    "United Kingdom",
    "United States",
]

function importFiles(file1) {
    return d3.csv(file1);
}

async function createStanleyDiagram(){
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var nbrOfMovie = 0;
    var nbrOfTvShow = 0;

    try {
        // Await the loading of CSV file
        const parsedData = await d3.csv("../dataset/cleaned_netflix_data.csv");

        // Process the data
        parsedData.forEach(function(row){
            let elem = row.Series_or_Movie;
            if (elem === "Movie") {
                nbrOfMovie += 1;
            } else {
                nbrOfTvShow += 1;
            }
        });

        // Print the updated values
        console.log("Number of Movies: " + nbrOfMovie);
        console.log("Number of TV Shows: " + nbrOfTvShow);

    } catch (error) {
        console.error("Error loading the CSV file:", error);
    }


    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    var svg = d3.select("#stanley").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");


    // load the data
    d3.csv("../dataset/pre_processing/genre_percentages.csv").then(function(data) {


        var nodes =[{"node":0,"name":"Movies"},{"node":1, "name":"TV shows"}];
        var hiddenNodes = []
        var links = []
        var hiddenLinks = []
        var count = 2
        var otherValueMovie = 0
        var otherValueTVshow = 0
        data.forEach(function(d){
            var movieValue = parseFloat(d.Movies);
            var tvShowValue = parseFloat(d.TvShows);
            nodes.push({"node":count,"name":d.Genre});
            if (d.Percentage > 3) {
                
                links.push({"source":0, "target":count, "value":movieValue});
                links.push({"source":1, "target":count, "value":tvShowValue});
            }else{
                hiddenLinks.push({"source":0, "target":count, "value":movieValue});
                hiddenLinks.push({"source":1, "target":count, "value":tvShowValue});
                otherValueMovie += movieValue
                otherValueTVshow += tvShowValue
            }
            count += 1
        })
        nodes.push({"node":count,"name": "Other"})
        links.push({"source":0, "target":count, "value":otherValueMovie});
        links.push({"source":1, "target":count, "value":otherValueTVshow});

        const nodeHasLinks = new Set();
        links.forEach(link => {
            nodeHasLinks.add(link.source);
            nodeHasLinks.add(link.target);
        });
        
        // Filter the nodes array to only include nodes that have links
        const filteredNodes = nodes.filter(node => nodeHasLinks.has(node.node));
        // Set up the Sankey generator
        var sankey = d3.sankey()
        .nodeWidth(70)  // Set node width
        .nodePadding(0)  // Set padding between nodes
        .size([950, 490]);  // Set the size of the layout

        // Generate the Sankey layout
        var graph = sankey({
            nodes: nodes.map(d => Object.assign({}, d)),  // Deep copy nodes
            links: links.map(d => Object.assign({}, d))  // Deep copy links
        });

        
        // add in the links
        var link = svg.append("g")
        .selectAll(".link")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal() )
        .style("stroke-width", function(d) { return Math.max(1, d.width); })
        .sort(function(a, b) { return b.width - a.width; })
        .on("mouseover", function(event, d) {
            // Show the value on hover
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
        
            // Update the tooltip content and position
            tooltip.html(`${d.value} ${d.target.name} ← ${d.source.name}`)
                .style("left", (event.pageX) + "px")   // Use event.pageX for the x-coordinate
                .style("top", (event.pageY - 28) + "px");  // Use event.pageY for the y-coordinate
        })
        .on("mouseout", function() {
            // Hide the tooltip on mouseout
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

        // Create a tooltip div
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    

        
        // add in the nodes
        var node = svg.append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
        .on("click", function(event, d) {
            if (d.name == "Other") {
                // Show hidden genres when "Other" is clicked
                console.log("hasbeenclicked")
                showHiddenGenres(event.pageX, event.pageY); // Pass mouse position for positioning
            }
        });
        
        // add the rectangles for the nodes
        node
        .filter(d => nodeHasLinks.has(d.node))
        .append("rect")
        .attr("height", function(d) { return d.y1 - d.y0; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { return d.color = color(d.name); })
        .style("stroke", function(d) { return d3.rgb(d.color); })
        // Add hover text
        .append("title")
        .text(function(d) { return d.name + "\n" + "There is " + d.value + " stuff in this node"; });
        
        // add in the title for the nodes
        node
        .filter(d => nodeHasLinks.has(d.node))
        .append("text")
        .attr("x", function(d) { return d.dx/5; })
        .attr("y", function(d) { return (d.y1 - d.y0) / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name})
        .attr("text-anchor", "start");

        node
        .filter(d => nodeHasLinks.has(d.node))
        .append("text")
        .attr("x", function(d) { return d.dx/5; })
        .attr("y", function(d) { return (d.y1 - d.y0) / 2 + 15; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { 
            if(d.node == 0){
                return nbrOfMovie
            }else if(d.node == 1){
                return nbrOfTvShow
            }else return d.value
            })
        .attr("text-anchor", "start");

        
        // Function to show hidden genres in a popup
        function showHiddenGenres(x, y) {
            const hiddenGenresContainer = d3.select("#hidden-genres");
            hiddenGenresContainer.html(''); // Clear previous content
            hiddenNodes = nodes.filter(d => !nodeHasLinks.has(d.node))
    
            hiddenNodes.forEach(hiddenNode => {
                hiddenGenresContainer.append("div")
                    .text(hiddenNode.name)
                    .style("cursor", "pointer")
                    .on("click", function() {
                        // Optional: Action on genre click
                        console.log("Clicked on genre:", hiddenNode.name);
                    });
            });
    
            // Position the container
            hiddenGenresContainer.style("left", (x + 10) + "px") // Offset for visibility
                .style("top", (y + 10) + "px") // Offset for visibility
                .style("display", "block"); // Show the container
        }
    
        // Hide the genres container when clicking elsewhere
        d3.select("body").on("click", function(event) {
            const hiddenGenresContainer = d3.select("#hidden-genres");
            if (!hiddenGenresContainer.node().contains(event.target)) {
                hiddenGenresContainer.style("display", "none"); // Hide if clicked outside
            }
        });
    });
}
