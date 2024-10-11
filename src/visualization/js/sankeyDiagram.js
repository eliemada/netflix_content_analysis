
const color = d3.scaleOrdinal(d3.schemeCategory10);

export function createSankeyDiagram(data, nbrOfMovie, nbrOfTvShow) {

    var sankeyElement = document.getElementById("sankey");

    // Get the width and height of the element
    var elementWidth = sankeyElement.offsetWidth;
    var elementHeight = sankeyElement.offsetHeight;


    // var margin = {top: 10, right: 10, bottom: 10, left: 10},
    // Get the width and height of the element
    const width = sankeyElement.offsetWidth;
    const height = sankeyElement.offsetHeight;

    // append the svg object to the body of the page
    var svg = d3.select("#sankey").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");


    // load the data
    d3.csv("./src/dataset/pre_processing/genre_percentages.csv").then(function (data) {

        var nodes = [{"node": 0, "name": "Movies"}, {"node": 1, "name": "TV shows"}];
        var hiddenNodes = []
        var links = []
        var hiddenLinks = []
        var count = 2
        var otherValueMovie = 0
        var otherValueTVshow = 0
        data.forEach(function (d) {
            var movieValue = parseFloat(d.Movies);
            var tvShowValue = parseFloat(d.TvShows);
            nodes.push({"node": count, "name": d.Genre});
            if (d.Percentage > 4) {

                links.push({"source": 0, "target": count, "value": movieValue});
                links.push({"source": 1, "target": count, "value": tvShowValue});
            } else {
                hiddenLinks.push({"source": 0, "target": count, "value": movieValue});
                hiddenLinks.push({"source": 1, "target": count, "value": tvShowValue});
                otherValueMovie += movieValue
                otherValueTVshow += tvShowValue
            }
            count += 1
        })
        nodes.push({"node": count, "name": "Other"})
        links.push({"source": 0, "target": count, "value": otherValueMovie});
        links.push({"source": 1, "target": count, "value": otherValueTVshow});

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
            .attr("d", d3.sankeyLinkHorizontal())
            .style("stroke-width", function (d) {
                return Math.max(1, d.width);
            })
            .sort(function (a, b) {
                return b.width - a.width;
            })
            .on("mouseover", function (event, d) {
                // Show the value on hover
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);

                // Update the tooltip content and position
                tooltip.html(`${d.value} ${d.target.name} ← ${d.source.name}`)
                    .style("left", (event.pageX) + "px")   // Use event.pageX for the x-coordinate
                    .style("top", (event.pageY) + "px");  // Use event.pageY for the y-coordinate
            })
            .on("mouseout", function () {
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
            .attr("transform", function (d) {
                return "translate(" + d.x0 + "," + d.y0 + ")";
            })
            .on("click", function (event, d) {
                if (d.name == "Other") {
                    // Show hidden genres when "Other" is clicked
                    showHiddenGenres(event.pageX, event.pageY); // Pass mouse position for positioning
                }
            });

        // add the rectangles for the nodes
        node
            .filter(d => nodeHasLinks.has(d.node))
            .append("rect")
            .attr("height", function (d) {
                return d.y1 - d.y0;
            })
            .attr("width", sankey.nodeWidth())
            .style("fill", function (d) {
                return d.color = color(d.name);
            })
            .style("stroke", function (d) {
                return d3.rgb(d.color);
            })
            // Add hover text
            .append("title")
            .text(function (d) {
                return d.name + "\n" + "There is " + d.value + " stuff in this node";
            });

        // add in the title for the nodes
        node
            .filter(d => nodeHasLinks.has(d.node))
            .append("text")
            .attr("x", function (d) {
                return d.dx / 5;
            })
            .attr("y", function (d) {
                return (d.y1 - d.y0) / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function (d) {
                return d.name
            })
            .attr("text-anchor", "start");

        node
            .filter(d => nodeHasLinks.has(d.node))
            .append("text")
            .attr("x", function (d) {
                return d.dx / 5;
            })
            .attr("y", function (d) {
                return (d.y1 - d.y0) / 2 + 15;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function (d) {
                if (d.node == 0) {
                    return nbrOfMovie
                } else if (d.node == 1) {
                    return nbrOfTvShow
                } else return d.value
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
                    .on("click", function () {
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
        d3.select("body").on("click", function (event) {
            const hiddenGenresContainer = d3.select("#hidden-genres");
            if (!hiddenGenresContainer.node().contains(event.target)) {
                hiddenGenresContainer.style("display", "none"); // Hide if clicked outside
            }
        });
    });
}



export async function updateSankeyDiagram(yearMin, yearMax, dataForSankey, countByYear,movieCountryGenreAvailabilityData, selectedCountryForSankey) {

    var sankeyElement = document.getElementById("sankey");

    // Get the width and height of the element
    var elementWidth = sankeyElement.offsetWidth;
    var elementHeight = sankeyElement.offsetHeight;

    var width = elementWidth;
    var height = elementHeight;

    // Select the SVG element and clear its contents
    
    // append the svg object to the body of the page
    var svg = d3.select("#sankey").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");
        
        
        var nodes = [{"node": 0, "name": "Movies"}, {"node": 1, "name": "TV shows"}];
    var hiddenNodes = []
    var links = []
    var hiddenLinks = []
    var count = 2
    var otherValueMovie = 0
    var otherValueTVshow = 0
    
    countByYear.forEach(function (d) {
        var year = parseInt(d.Year);
        if (year >= yearMin && year <= yearMax) {
            console.log(d)
            var movieValue = parseFloat(d.Movies_Count) || 0;
            var tvShowValue = parseFloat(d.TVShows_Count) || 0;
            otherValueMovie += movieValue;
            otherValueTVshow += tvShowValue;
        }
    });
    


    function parseYear(dateString) {
        // Split the date string by '/'
        var parts = dateString.split('/');
        // Return the year part (the third part)
        return parseInt(parts[2], 10);
    }

    if(selectedCountryForSankey != null){
    movieCountryGenreAvailabilityData.forEach(function (d) {   
        console.log(selectedCountryForSankey) 
        
            if (d["Country Availability"] == selectedCountryForSankey) {
                nodes.push({"node": count, "name": d.Genre});
                links.push({"source": 0, "target": count, "value": parseFloat(d.Movies) || 0});
                count += 1;
            }
        });
    }else{
            dataForSankey[0].forEach(function (d) {
                var movieValue = 0;
                for (var year = yearMin; year <= yearMax; year++) {
                    movieValue += parseFloat(d[String(year)]) || 0;
                }
                // var movieValue = parseFloat(d[String(yearMin)]);
                nodes.push({"node": count, "name": d.Genre});
                if (movieValue/otherValueMovie > 0.15) {
                    links.push({"source": 0, "target": count, "value": movieValue});
                }
                count += 1
            }) 
    }
    


    count = 2;
    dataForSankey[1].forEach(function (d) {
        var TVshowValue = 0;
        for (var year = yearMin; year <= yearMax; year++) {
            TVshowValue += parseFloat(d[String(year)]) || 0;
        }
        if (TVshowValue/otherValueTVshow > 0.15) {
            links.push({"source": 1, "target": count, "value": TVshowValue});
        }
        count += 1
    });




    nodes.push({"node": count, "name": "Other"})
    links.push({"source": 0, "target": count, "value": otherValueMovie});
    links.push({"source": 1, "target": count, "value": otherValueTVshow});

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

    // Validate the data
    graph.links.forEach(link => {
        if (isNaN(link.width)) {
            console.error("Invalid link width:", link);
        }
        if (isNaN(link.source.x0) || isNaN(link.source.x1) || isNaN(link.target.x0) || isNaN(link.target.x1)) {
            console.error("Invalid link coordinates:", link);
        }
    });
    
    var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "4px")
    .style("box-shadow", "0px 0px 10px rgba(0, 0, 0, 0.1)");
    
    // add in the links
    var link = svg.append("g")
        .selectAll(".link")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .style("stroke-width", function (d) {
            return Math.max(1, d.width);
        })
        .sort(function (a, b) {
            return b.width - a.width;
        })
        .on("mouseover", function (event, d) {
            // Show the value on hover
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);

            // Update the tooltip content and position
            tooltip.html(`Value: ${d.value}<br>Source: ${d.source.name}<br>Target: ${d.target.name}`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            // Hide the tooltip on mouseout
            tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });
        

    
    // add in the nodes
    var node = svg.append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x0 + "," + d.y0 + ")";
        });
        // .on("click", function (event, d) {
        //     console.log("Node clicked:", d.name);
        //     if (d.name == "Other") {
        //         console.log("Other clicked");
        //         // Show hidden genres when "Other" is clicked
        //         showHiddenGenres(event.pageX, event.pageY); // Pass mouse position for positioning
        //     }
        // });
        
        
        // add the rectangles for the nodes
    node
        .filter(d => nodeHasLinks.has(d.node))
        .append("rect")
        .attr("height", function (d) {
            return d.y1 - d.y0;
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) {
            return d.color = color(d.name);
        })
        .style("stroke", function (d) {
            return d3.rgb(d.color);
        })
        // Add hover text
        .append("title")
        .text(function (d) {
            return d.name + "\n" + "There is " + d.value + " stuff in this node";
        });


        // add in the title for the nodes
        node
        .filter(d => nodeHasLinks.has(d.node))
        .append("text")
        .attr("x", function (d) {
            return d.dx / 5;
        })
        .attr("y", function (d) {
            return (d.y1 - d.y0) / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function (d) {
            return d.name
        })
        .attr("text-anchor", "start");

    node
        .filter(d => nodeHasLinks.has(d.node))
        .append("text")
        .attr("x", function (d) {
            return d.dx / 5;
        })
        .attr("y", function (d) {
            return (d.y1 - d.y0) / 2 + 15;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function (d) {
            if (d.node == 0) {
                return otherValueMovie
            } else if (d.node == 1) {
                return otherValueTVshow
            } else return d.value
        })
        .attr("text-anchor", "start");
        
    d3.select("#sankey").select("svg").remove();
    // Function to show hidden genres in a popup
    function showHiddenGenres(x, y) {
        const hiddenGenresContainer = d3.select("#hidden-genres");
        hiddenGenresContainer.html(''); // Clear previous content
        hiddenNodes = nodes.filter(d => !nodeHasLinks.has(d.node))

        hiddenNodes.forEach(hiddenNode => {
            hiddenGenresContainer.append("div")
                .text(hiddenNode.name)
                .style("cursor", "pointer")
                .on("click", function () {
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
    d3.select("body").on("click", function (event) {
        const hiddenGenresContainer = d3.select("#hidden-genres");
        if (!hiddenGenresContainer.node().contains(event.target)) {
            hiddenGenresContainer.style("display", "none"); // Hide if clicked outside
        }
    });

}