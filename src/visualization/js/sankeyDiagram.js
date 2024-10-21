
// const color = d3.scaleOrdinal(d3.schemeDark2);
const customColors = [
    "lightblue", "red", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666",
    "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5",
    "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"
];
const color = d3.scaleOrdinal(customColors);

// const color = d3.scaleOrdinal(d3.schemePaired);
// const color = d3.scaleOrdinal(d3.schemeSet3);
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


    });
}



export async function updateSankeyDiagram(yearMin, yearMax, threadholdSankey,dataForSankey, countByYear,countByYearandCoutryNetflixData,movieCountryGenreAvailabilityData,serieCountryGenreAvailabilityData, selectedCountryForSankey) {

    var sankeyElement = document.getElementById("sankey");
    d3.select("#sankey").select("svg").remove();

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

    d3.select("#legend").select("svg").remove();
    
    var legendElement = document.getElementById("legend");
    var widthLegend = legendElement.offsetWidth;
    var heightLegend = legendElement.offsetHeight;
    var svgLegend = d3.select("#legend").append("svg")
    .attr("width", widthLegend)
    .attr("height", heightLegend)
    .append("g");

        
        
    var nodes = [{"node": 0, "name": "Movies"}, {"node": 1, "name": "TV shows"}];
    var hiddenNodes = []
    var links = []
    var hiddenLinks = []
    var count = 2
    var otherValueMovie = 0
    var otherValueTVshow = 0
    var totalValueMovie = 0
    var totalValueTVshow = 0
    var filteredData = countByYearandCoutryNetflixData.filter(function(d) {
        return d["Country_Availability"] == selectedCountryForSankey;
    });


    //There is not DATA
    if (filteredData.length == 0 && selectedCountryForSankey != null) {
        console.log("No data available in "+ selectedCountryForSankey);

        svg.append("text")
            .attr("x", width / 2) // Use the width variable
            .attr("y", height / 2) // Use the height variable
            .attr("text-anchor", "middle")
            .attr("font-size", "30px")
            .attr("fill", "white") // Use fill instead of color
            .attr("font-family", "Netflix_font")
            .text("No Data Available in "+ selectedCountryForSankey);

        return;
    }

    if(selectedCountryForSankey != null) {
        filteredData.forEach(function(d) {
            var year = parseInt(d["Year"]);
            
            if (year >= yearMin && year <= yearMax) {
                var movieValue = parseFloat(d.Movies_Count);
                var tvShowValue = parseFloat(d.TVShows_Count);
                totalValueMovie += movieValue;
                totalValueTVshow += tvShowValue;
            }
        });
    }else {
        countByYear.forEach(function (d) {
        var year = parseInt(d.Year);
        if (year >= yearMin && year <= yearMax) {
            var movieValue = parseFloat(d.Movies_Count) || 0;
            var tvShowValue = parseFloat(d.TVShows_Count) || 0;
            totalValueMovie += movieValue;
            totalValueTVshow += tvShowValue;
            }
        });
    }

    //add the nodes for movies
    if (selectedCountryForSankey != null) {
        otherValueMovie = 0;    
        otherValueTVshow = 0;
        // Filter data for the selected country
        var filteredData = movieCountryGenreAvailabilityData.filter(function(d) {
            return d["Country_Availability"] == selectedCountryForSankey;
        });
    
        // Aggregate data by genre for the specified year range
        var aggregatedData = {};
        filteredData.forEach(function(d) {
            var year = parseInt(d["Year"]);
            if (year >= yearMin && year <= yearMax) {
                Object.keys(d).forEach(function(key) {
                    if (key != "Country_Availability" && key != "Year") {
                        var genreValue = parseFloat(d[key]);
                        if (!aggregatedData[key]) {
                            aggregatedData[key] = 0;
                        }
                        otherValueMovie += genreValue;
                        aggregatedData[key] += genreValue;
                    }
                });
            }
        });

        // Add the aggregated data to the nodes and links
        Object.keys(aggregatedData).forEach(function(key) {
            var genreValue = aggregatedData[key];
            nodes.push({"node": count, "name": key});
            // if (genreValue/totalValueMovie > 0.15) {
                links.push({"source": 0, "target": nodes.findIndex(node => node.name === key), "value": genreValue});
            // }
            count += 1;
        });

    } else {
        dataForSankey[0].forEach(function(d) {
            var movieValue = 0;
            for (var year = yearMin; year <= yearMax; year++) {
                movieValue += parseFloat(d[String(year)]) || 0;
            }
            nodes.push({"node": count, "name": d.Genre});
            // if (movieValue / totalValueTVshow > 0.15) {
                links.push({"source": 0, "target": nodes.findIndex(node => node.name === d.Genre), "value": movieValue});
            // }
            count += 1;
        });
    }
    //add the nodes and links for TV shows
    count = 2;
    if (selectedCountryForSankey != null) {
        otherValueTVshow = 0;
        otherValueTVshow = 0;
        // Filter data for the selected country
        var filteredData = serieCountryGenreAvailabilityData.filter(function(d) {
            return d["Country_Availability"] == selectedCountryForSankey;
        });

        // Aggregate data by genre for the specified year range
        var aggregatedData = {};
        filteredData.forEach(function(d) {
            var year = parseInt(d["Year"]);
            if (year >= yearMin && year <= yearMax) {
                Object.keys(d).forEach(function(key) {
                    if (key != "Country_Availability" && key != "Year") {
                        var genreValue = parseFloat(d[key]) || 0;
                        if (!aggregatedData[key]) {
                            aggregatedData[key] = 0;
                        }
                        otherValueTVshow += genreValue;
                        aggregatedData[key] += genreValue;
                    }
                });
            }
        });
        // Add the aggregated data to the nodes and links
        Object.keys(aggregatedData).forEach(function(key) {
            var genreValue = aggregatedData[key];
            if (nodes.findIndex(node => node.name === key) == -1) {
                nodes.push({"node": count, "name": key});
            }
            const targetIndex = nodes.findIndex(node => node.name === key);
            // if (genreValue/totalValueTVshow > 0.05 || links.some(link => link.target === targetIndex)) {
                    links.push({"source": 1, "target": targetIndex, "value": genreValue});
            // }
            count += 1;
        });
    } else {
    dataForSankey[1].forEach(function (d) {
        var TVshowValue = 0;
        for (var year = yearMin; year <= yearMax; year++) {
            TVshowValue += parseFloat(d[String(year)]) || 0;
        }
        if (nodes.findIndex(node => node.name === d.Genre) == -1) {
            nodes.push({"node": count, "name": d.Genre});
        }
        const targetIndex = nodes.findIndex(node => node.name === d.Genre);
        // if (TVshowValue/totalValueTVshow > 0.05 || links.some(link => link.target === targetIndex)) {
            links.push({"source": 1, "target": nodes.findIndex(node => node.name === d.Genre), "value": TVshowValue});
        // }
        count += 1
    });
    }

    // Filter Movie links based on the threshold
    const movieLinks = links.filter(d => d.source === 0 && d.value / totalValueMovie > threadholdSankey / 100);
    
    // Track genres that have been added for Movies
    const addedGenres = new Set(movieLinks.map(d => d.target));
    
    // Filter TV Show links based on the threshold and added genres
    const tvShowLinks = links.filter(d => {
        if (d.source === 1) {
            return d.value / totalValueTVshow > threadholdSankey / 100 || addedGenres.has(d.target);
        }
        return false;
    });
    
    // Combine Movie and TV Show links
    links = movieLinks.concat(tvShowLinks);

    const nodeHasLinks = new Set();
    links.forEach(link => {
        nodeHasLinks.add(link.source);
        nodeHasLinks.add(link.target);
    });
    

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

    
    var tooltip = d3.select("#map").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "4px")
    .style("font-size", "14px")
    .style("font-family", "Netflix_font")
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
        .style("stroke", function (d) {
            if (d.source.name == "Movies") {
                return "lightblue";
            } else {   
                return "#ff0000";
        }})
        // .sort(function (a, b) {
        //     console.log("test",a.source.name, a.target,a.value );
        //     return a.target.value < (b.target.value);
        // })
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
            .style("opacity", 0.0);
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
    
    node = node.sort((a,b) => a.value < (b.value)).filter(d => nodeHasLinks.has(d.node));

    
        
        // add the rectangles for the nodes
    node
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
        .style("font-family", "Netflix_font")
        .text(function (d) {
            return d.name + "\n" + "There is " + d.value + " stuff in this node";
        });


        // add in the title for the nodes
    node
        .filter(d => d.name === "Movies" || d.name === "TV shows")
        .append("text")
        .attr("x", function (d) {
            return (d.x1 - d.x0) / 2; 
        })
        .attr("y", function (d) {
            return (d.y1 - d.y0) / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("font-family", "Netflix_font")
        .style("fill", "white")
        .text(function (d) {
            return d.name
        });
    
    node
        .filter(d => d.name === "Movies" || d.name === "TV shows")
        .append("text")
        .attr("x", function (d) {
            return (d.x1 - d.x0) / 2; 
        })
        .attr("y", function (d) {
            return (d.y1 - d.y0) / 2 + 15;
        })
        .attr("dy", ".35em")
        .style("font-family", "Netflix_font")
        .style("fill", "white")
        .attr("text-anchor", "middle")
        .text(function (d) {
            if (d.node == 0) {
                return totalValueMovie;
            } else  {
                return totalValueTVshow;
        }});
        
        const filteredLegendNodes = node.filter(d => d.name !== "Movies" && d.name !== "TV shows" && d.name !=="Other");
        const legendSpacing = 22;  // Space between legend items
        d3.select("#legend").select("svg").remove();
    
        var legendElement = document.getElementById("legend");
        var widthLegend = legendElement.offsetWidth;
        var heightLegend = legendElement.offsetHeight;
        var svgLegend = d3.select("#legend").append("svg")
        .attr("width", widthLegend)
        .attr("height", filteredLegendNodes.size() * legendSpacing)
        .append("g");
    


        const legendGroup = svgLegend.append("g")
        .attr("class", "legend-group")
    
        const legendSize = 10;  // Size of the legend dots


        // Loop through each node and add a corresponding legend entry
        filteredLegendNodes
        .filter((d, i) => {
            // Add the color dot
            legendGroup.append("circle")
                .attr("cx", 10)
                .attr("cy", i * legendSpacing + 10)  // Vertical spacing for each legend item
                .attr("r", legendSize)
                .style("fill", color(d.name));  // Use the same color as the node

            // Add the name label next to the dot
            legendGroup.append("text")
                .attr("x", legendSize * 2 + 10)  // Place text a bit to the right of the dot
                .attr("y", i * legendSpacing + 10)  // Center the text vertically
                .attr("dy", ".35em")  // Align the text properly
                .style("font-family", "Netflix_font")
                .style("font-size", "15px")
                .style("fill", "white")  // Use white text color
                .text(d.name);

            // Add the value label with additional spacing
            legendGroup.append("text")
                .attr("x", legendSize * 2 + 100)  // Adjust this value for proper spacing from d.name
                .attr("y", i * legendSpacing + 10)  // Center the text vertically
                .attr("dy", ".35em")  // Align the text properly
                .style("font-family", "Netflix_font")
                .style("font-size", "15px")
                .style("fill", "white")  // Use white text color
                .text(d.value);
        }); 


}