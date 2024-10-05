var dataForSankey;
var dataForSankey2;
var data;
var color = d3.scaleOrdinal(d3.schemeCategory10);
var nbrOfMovie = 0;
var nbrOfTvShow = 0;
var yearMin;
var yearMax;
var parsedData;

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


async function createVisualization(){

    function importFiles(file1, file2, file3, file4){
        return Promise.all([Promise.all([d3.csv(file1), d3.csv(file2)]), d3.csv(file3), d3.csv(file4)])
    }

    const file1 = "../dataset/pre_processing/movies_genre_counts.csv";
    const file2 = "../dataset/pre_processing/tv_shows_genre_counts.csv";
    const file3 = "../dataset/cleaned_netflix_data.csv";
    const file4 = "../dataset/pre_processing/genre_percentages.csv";

    try {
        const results = await importFiles(file1, file2, file3, file4);
        dataForSankey = results[0];
        parsedData = results[1];
        dataForSankey2 = results[2];
    } catch (error) {
        console.error("Error loading files:", error);
    }



        parsedData.forEach(function(row){
            let elem = row.Series_or_Movie;
            if (elem === "Movie") {
                nbrOfMovie += 1;
            } else {
                nbrOfTvShow += 1;
            }
    })


    // try {
    //     // Await the loading of CSV file
    //     parsedData = await d3.csv("../dataset/cleaned_netflix_data.csv");

    //     // Process the data

    //     // Print the updated values
    //     console.log("Number of Movies: " + nbrOfMovie);
    //     console.log("Number of TV Shows: " + nbrOfTvShow);

    // } catch (error) {
    //     console.error("Error loading the CSV file:", error);
    // }

    // dataForSankey = [d3.csv("../dataset/pre_processing/movies_genre_counts.csv"),d3.csv("../dataset/pre_processing/tv_shows_genre_counts.csv")]

    createSankeyDiagram()
    createSlider()
}

function updateDashboard(){
    updateSankeyDiagram();
}

function createSlider (){
    // Get references to the slider container and value elements
    var slider = document.getElementById("slider");
    
    yearMin = 2015;
    yearMax = 2021;

    // Create the multi-cursor slider with three cursors
    noUiSlider.create(slider, {
        start: [2014, 2021], // Initial positions of the three handles
        connect: true, // Connect all handles with colored bars
        range: {
            min: 2015,
            max: 2021,
        },
        tooltips: true,
        format: {
            to: function(value) {
                return Math.round(value);
            },
            from: function (value) {
                return value;
            }
        },

        step:1,
    });

    // Update the values as the handles are moved
    slider.noUiSlider.on("update", function (values, handle) {
        yearMin = values[0];
        yearMax = values[1];
        updateDashboard();
    }); 

    // var sliderHandleYear = slider.querySelector(".noUi-handle[data-handle='1']");
    var sliderHandleMin = slider.querySelector(".noUi-handle[data-handle='0']");
    var sliderHandleMax = slider.querySelector(".noUi-handle[data-handle='1']");


    // sliderHandleMin.addEventListener("mouseup",function (event) {
    //     filterData();
    //     updateIdioms(true);
    // });
    // sliderHandleMax.addEventListener("mouseup",function (event) {
    //     filterData();
    //     updateIdioms(true);
    // });
    // // Play flag to indicate if the animation is running
    // var isPlaying = false;
    // var playIntervalId;

    // slider.addEventListener("click", function (event) {
    //     if (isPlaying) {
    //       clearInterval(playIntervalId); // Pause the animation
    //       isPlaying = false;
    //     }
    //     updateIdioms();
    //   });
    
    var playButton = d3.select("#play-button");

    // Function to update the slider's value
    function updateSliderValue(newValue) {
        var currentValues = slider.noUiSlider.get();
        currentValues[1] = newValue;
        slider.noUiSlider.set(currentValues);
        updateIdioms(); // Call your function to update the visualizations
    }


    // Function to handle the play functionality
    function playSlider() {
        if (isPlaying) {
            // If animation is running, stop it
            clearInterval(playIntervalId);
            isPlaying = false;
        } else {
            var currentValue = parseInt(slider.noUiSlider.get()[1]);
            var maxValue = yearMax; // Maximum value of the slider
            var playInterval = 500; // 500 milliseconds (half a second)

            function incrementValue() {
                currentValue += 5; // Increment the value
                if (currentValue <= maxValue) {
                    updateSliderValue(currentValue); // Update the slider
                } else {
                    currentValue = yearMin;
                }
            }

            playIntervalId = setInterval(incrementValue, playInterval); // Start playing
            isPlaying = true;
        }
    }

    // Add a click event listener to the play button
    playButton.on("click", function() {
        playSlider(); // Start/stop playing the slider
    });

  
}

function createSankeyDiagram(){


    var sankeyElement = document.getElementById("sankey");

    // Get the width and height of the element
    var elementWidth = sankeyElement.offsetWidth;
    var elementHeight = sankeyElement.offsetHeight;

    console.log(elementHeight)

    // var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = elementWidth ;
    height = elementHeight;
    
    // append the svg object to the body of the page
    var svg = d3.select("#sankey").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");



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
            if (d.Percentage > 4) {
                
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
        .size([elementWidth, elementHeight]);  // Set the size of the layout

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
                .style("top", (event.pageY) + "px");  // Use event.pageY for the y-coordinate
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
