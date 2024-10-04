
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

function createStanleyDiagram(){

    console.log(d3.version)

    //Load the CSV file using a callback function
    d3.csv("../dataset/cleaned_netflix_data.csv").then(function(parsedData) {

        // Log parsedData to ensure it's what we expect
        console.log("Parsed Data:", parsedData);

        // Check if parsedData is an array (which it should be if CSV is loaded correctly)
        if (Array.isArray(parsedData)) {
            // Data is now available as an array of objects
            parsedData.forEach(function(row) {
                console.log(row.Series);  // Access and log the Genre attribute
            });
        } else {
            console.error("Error: Parsed data is not an array.");
        }
    }).catch(function(error) {
        console.error("Error loading the CSV file:", error);
    });


  


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
    
    // Color scale used
    //var color = d3.scaleOrdinal(d3.schemeCategory20);
    
    // Set the sankey diagram properties
    var sankey = d3.sankey()
    .nodeWidth(100)
    .nodePadding(29)
    .size([width, height]);
    
    var nbrOfMovie = 0;
    var nbrOfTvShow = 0;

    // data.Serie.filter(function(d) {
    //     if (d.Serie == "Movie"){
    //         nbrOfMovie += 1;
    //     }else{
    //         nbrOfTvShow += 1;
    //     }
    // })
    // console.log(nbrOfMovie);
    // console.log(nbrOfTvShow);

    // load the data
    d3.json("testStanley.json", function(error, graph) {
        
        // Constructs a new Sankey generator with the default settings.
        sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(1);
        
        // add in the links
        var link = svg.append("g")
        .selectAll(".link")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", sankey.link() )
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; })
        .on("mouseover", function(d){
            // Show the value on hover
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.value+" "+d.target.name+" "+d.source.name)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
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
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        // .call(d3.drag()
        // .subject(function(d) { return d; })
        // .on("start", function() { this.parentNode.appendChild(this); })
        // .on("drag", dragmove));
        
        // add the rectangles for the nodes
        node
        .append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
        // Add hover text
        .append("title")
        .text(function(d) { return d.name + "\n" + "There is " + d.value + " stuff in this node"; });
        
        // add in the title for the nodes
        node
        .append("text")
        .attr("x", function(d) { return d.dx/5; })
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name})
        .attr("text-anchor", "start");

        node
        .append("text")
        .attr("x", function(d) { return d.dx/5; })
        .attr("y", function(d) { return d.dy / 2+ 20; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.value})
        .attr("text-anchor", "start");
        // .filter(function(d) { return d.x < width / 2; })
        // .attr("x", 6 + sankey.nodeWidth())

        
        // the function for moving the nodes
        function dragmove(d) {
            d3.select(this)
            .attr("transform",
            "translate("
            + d.x + ","
            + (d.y = Math.max(
                0, Math.min(height - d.dy, d3.event.y))
            ) + ")");
            sankey.relayout();
            link.attr("d", sankey.link() );
        }
        
    });
}