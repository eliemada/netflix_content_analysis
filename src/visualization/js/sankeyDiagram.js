// const color = d3.scaleOrdinal(d3.schemeDark2);
const customColors = [
    "lightblue", "red", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666",
    "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5",
    "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"
];
const color = d3.scaleOrdinal(customColors);

let activeGenres = [];
let allGenres = [];


export async function updateSankeyDiagram(
    yearMin, yearMax, threadholdSankey, dataForSankey,
    countByYear, countByYearandCoutryNetflixData,
    movieCountryGenreAvailabilityData, serieCountryGenreAvailabilityData,
    selectedCountryForSankey
) {
    // Initialize activeGenres and allGenres if they're empty
    if (allGenres.length === 0) {
        initializeGenres(
            dataForSankey,
            movieCountryGenreAvailabilityData,
            serieCountryGenreAvailabilityData,
            selectedCountryForSankey,
            yearMin,
            yearMax
        );
        // Initially, all genres are active
        activeGenres = [...allGenres];
    }

    // Clear previous SVG elements
    d3.select("#sankey").select("svg").remove();
    d3.select("#legend").select("svg").remove();

// Set up dimensions
    const sankeyElement = document.getElementById("sankey");
    const elementWidth = sankeyElement.offsetWidth;
    const elementHeight = sankeyElement.offsetHeight;

    // Append the SVG object for the Sankey diagram
    const svg = d3.select("#sankey").append("svg")
        .attr("width", elementWidth)
        .attr("height", elementHeight)
        .append("g");


    d3.select("#legend").select("svg").remove();

    // var legendElement = document.getElementById("legend");
    // var widthLegend = legendElement.offsetWidth;
    // var heightLegend = legendElement.offsetHeight;
    // var svgLegend = d3.select("#legend")
    //     .append("svg")
    //     .attr("width", widthLegend)
    //     .attr("height", heightLegend)
    //     .append("g");


    var nodes = [
        {node: 0, name: "Movies"},
        {node: 1, name: "TV shows"}
    ];

    var links = [];
    var count = 2;
    var totalValueMovie = 0;
    var totalValueTVshow = 0;

    let genreValues = {};

    var filteredData = countByYearandCoutryNetflixData.filter(function (d) {
        return d["Country_Availability"] == selectedCountryForSankey;
    });

    //There is not DATA
    if (filteredData.length == 0 && selectedCountryForSankey != null) {
        console.log("No data available in " + selectedCountryForSankey);

        svg.append("text")
            .attr("x", width / 2) // Use the width variable
            .attr("y", height / 2) // Use the height variable
            .attr("text-anchor", "middle")
            .attr("font-size", "30px")
            .attr("fill", "white") // Use fill instead of color
            .attr("font-family", "Netflix_font")
            .text("No Data Available in " + selectedCountryForSankey);

        return;
    }

    if (selectedCountryForSankey != null) {
        filteredData.forEach(function (d) {
            var year = parseInt(d["Year"]);

            if (year >= yearMin && year <= yearMax) {
                var movieValue = parseFloat(d.Movies_Count);
                var tvShowValue = parseFloat(d.TVShows_Count);
                totalValueMovie += movieValue;
                totalValueTVshow += tvShowValue;
            }
        });
    } else {
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
// Add the nodes and links for movies
    if (selectedCountryForSankey != null) {
        // Filter data for the selected country
        var filteredMovieData = movieCountryGenreAvailabilityData.filter(function (d) {
            return d["Country_Availability"] == selectedCountryForSankey;
        });

        // Aggregate data by genre for the specified year range
        var aggregatedData = {};
        filteredMovieData.forEach(function (d) {
            var year = parseInt(d["Year"]);
            if (year >= yearMin && year <= yearMax) {
                Object.keys(d).forEach(function (key) {
                    if (key != "Country_Availability" && key != "Year") {
                        var genreValue = parseFloat(d[key]) || 0;

                        // Update genreValues for all genres
                        if (!genreValues[key]) {
                            genreValues[key] = 0;
                        }
                        genreValues[key] += genreValue;

                        // Aggregate data for active genres
                        if (activeGenres.includes(key)) {
                            if (!aggregatedData[key]) {
                                aggregatedData[key] = 0;
                            }
                            aggregatedData[key] += genreValue;
                        }
                    }
                });
            }
        });

        // Add the aggregated data to the nodes and links
        Object.keys(aggregatedData).forEach(function (key) {
            var genreValue = aggregatedData[key];
            let nodeIndex = nodes.findIndex(node => node.name === key);
            if (nodeIndex === -1) {
                nodes.push({ node: count, name: key });
                nodeIndex = nodes.length - 1;
                count += 1;
            }
            links.push({ source: 0, target: nodeIndex, value: genreValue });
        });
    } else {
        dataForSankey[0].forEach(function (d) {
            var movieValue = 0;
            for (var year = yearMin; year <= yearMax; year++) {
                movieValue += parseFloat(d[String(year)]) || 0;
            }
            // Update genreValues for all genres
            if (!genreValues[d.Genre]) {
                genreValues[d.Genre] = 0;
            }
            genreValues[d.Genre] += movieValue;

            if (activeGenres.includes(d.Genre)) {
                let nodeIndex = nodes.findIndex(node => node.name === d.Genre);
                if (nodeIndex === -1) {
                    nodes.push({ node: count, name: d.Genre });
                    nodeIndex = nodes.length - 1;
                    count += 1;
                }
                links.push({ source: 0, target: nodeIndex, value: movieValue });
            }
        });
    }

    // Add the nodes and links for TV shows
    if (selectedCountryForSankey != null) {
        // Filter data for the selected country
        var filteredSerieData = serieCountryGenreAvailabilityData.filter(function (d) {
            return d["Country_Availability"] == selectedCountryForSankey;
        });

        // Aggregate data by genre for the specified year range
        var aggregatedData = {};
        filteredSerieData.forEach(function (d) {
            var year = parseInt(d["Year"]);
            if (year >= yearMin && year <= yearMax) {
                Object.keys(d).forEach(function (key) {
                    if (key != "Country_Availability" && key != "Year") {
                        var genreValue = parseFloat(d[key]) || 0;

                        // Update genreValues for all genres
                        if (!genreValues[key]) {
                            genreValues[key] = 0;
                        }
                        genreValues[key] += genreValue;

                        // Aggregate data for active genres
                        if (activeGenres.includes(key)) {
                            if (!aggregatedData[key]) {
                                aggregatedData[key] = 0;
                            }
                            aggregatedData[key] += genreValue;
                        }
                    }
                });
            }
        });

        // Add the aggregated data to the nodes and links
        Object.keys(aggregatedData).forEach(function (key) {
            var genreValue = aggregatedData[key];
            let nodeIndex = nodes.findIndex(node => node.name === key);
            if (nodeIndex === -1) {
                nodes.push({ node: count, name: key });
                nodeIndex = nodes.length - 1;
                count += 1;
            }
            links.push({ source: 1, target: nodeIndex, value: genreValue });
        });
    } else {
        dataForSankey[1].forEach(function (d) {
            var TVshowValue = 0;
            for (var year = yearMin; year <= yearMax; year++) {
                TVshowValue += parseFloat(d[String(year)]) || 0;
            }
            // Update genreValues for all genres
            if (!genreValues[d.Genre]) {
                genreValues[d.Genre] = 0;
            }
            genreValues[d.Genre] += TVshowValue;

            if (activeGenres.includes(d.Genre)) {
                let nodeIndex = nodes.findIndex(node => node.name === d.Genre);
                if (nodeIndex === -1) {
                    nodes.push({ node: count, name: d.Genre });
                    nodeIndex = nodes.length - 1;
                    count += 1;
                }
                links.push({ source: 1, target: nodeIndex, value: TVshowValue });
            }
        });
    }


    // Filter Movie links based on the threshold
    const movieLinks = links.filter(
        d => d.source === 0 && d.value / totalValueMovie > threadholdSankey / 100
    );

    // Track genres that have been added for Movies
    const addedGenres = new Set(movieLinks.map(d => d.target));

    // Filter TV Show links based on the threshold and added genres
    const tvShowLinks = links.filter(d => {
        if (d.source === 1) {
            return (
                d.value / totalValueTVshow > threadholdSankey / 100 ||
                addedGenres.has(d.target)
            );
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


    const sankey = d3.sankey()
        .nodeWidth(70)
        .nodePadding(0)
        .size([elementWidth, elementHeight]);

    // Generate the Sankey layout
    const graph = sankey({
        nodes: nodes.map(d => Object.assign({}, d)),  // Deep copy nodes
        links: links.map(d => Object.assign({}, d))  // Deep copy links
    });


    const tooltip = d3.select("#map").append("div")
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
    const link = svg.append("g")
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
            }
        })
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
    let node = svg.append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x0 + "," + d.y0 + ")";
        });


    node = node.filter(d => nodeHasLinks.has(d.node));


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
            } else {
                return totalValueTVshow;
            }
        });

    let genreValueArray = Object.keys(genreValues).map(genre => {
        return { genre: genre, value: genreValues[genre] };
    });

    genreValueArray.sort((a, b) => b.value - a.value);
    // Build the legend
    const legendSpacing = 22;
    const legendElement = document.getElementById("legend");
    const widthLegend = legendElement.offsetWidth;
    const heightLegend = legendElement.offsetHeight;
    const svgLegend = d3.select("#legend").append("svg")
        .attr("width", widthLegend)
        .attr("height", genreValueArray.length * legendSpacing)
        .append("g");

    const legendGroup = svgLegend.append("g")
        .attr("class", "legend-group");

    const legendSize = 10;
    const legendItems = legendGroup.selectAll(".legend-item")
        .data(genreValueArray, d => d.genre)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * legendSpacing})`);

    // Add legend dots
    legendItems.append("circle")
        .attr("cx", 10)
        .attr("cy", 10)
        .attr("r", legendSize)
        .style("fill", d => activeGenres.includes(d.genre) ? color(d.genre) : "grey")
        .style("cursor", "pointer")
        .on("click", function (event, d) {
            const genre = d.genre;
            const genreIndex = activeGenres.indexOf(genre);
            if (genreIndex > -1) {
                // Remove genre from activeGenres
                activeGenres.splice(genreIndex, 1);
            } else {
                // Add genre to activeGenres
                activeGenres.push(genre);
            }
            // Redraw the Sankey diagram with updated activeGenres
            updateSankeyDiagram(
                yearMin, yearMax, threadholdSankey, dataForSankey,
                countByYear, countByYearandCoutryNetflixData,
                movieCountryGenreAvailabilityData, serieCountryGenreAvailabilityData,
                selectedCountryForSankey
            );
        });

    // Add genre labels
    legendItems.append("text")
        .attr("x", legendSize * 2 + 10)
        .attr("y", 10)
        .attr("dy", ".35em")
        .style("font-family", "Netflix_font")
        .style("font-size", "15px")
        .style("fill", "white")
        .text(d => d.genre);

    // Add value labels
    legendItems.append("text")
        .attr("x", legendSize * 2 + 150)
        .attr("y", 10)
        .attr("dy", ".35em")
        .style("font-family", "Netflix_font")
        .style("font-size", "15px")
        .style("fill", "white")
        .text(d => d.value);

    // Function to initialize genres (keep only one definition)
    function initializeGenres(
        dataForSankey,
        movieCountryGenreAvailabilityData,
        serieCountryGenreAvailabilityData,
        selectedCountryForSankey,
        yearMin,
        yearMax
    ) {
        let genresSet = new Set();

        if (selectedCountryForSankey != null) {
            // Collect genres from movie data
            movieCountryGenreAvailabilityData.forEach(function (d) {
                if (d["Country_Availability"] == selectedCountryForSankey) {
                    let year = parseInt(d["Year"]);
                    if (year >= yearMin && year <= yearMax) {
                        Object.keys(d).forEach(function (key) {
                            if (key != "Country_Availability" && key != "Year") {
                                genresSet.add(key);
                            }
                        });
                    }
                }
            });
            // Collect genres from TV show data
            serieCountryGenreAvailabilityData.forEach(function (d) {
                if (d["Country_Availability"] == selectedCountryForSankey) {
                    let year = parseInt(d["Year"]);
                    if (year >= yearMin && year <= yearMax) {
                        Object.keys(d).forEach(function (key) {
                            if (key != "Country_Availability" && key != "Year") {
                                genresSet.add(key);
                            }
                        });
                    }
                }
            });
        } else {
            dataForSankey[0].forEach(function (d) {
                genresSet.add(d.Genre);
            });
            dataForSankey[1].forEach(function (d) {
                genresSet.add(d.Genre);
            });
        }

        allGenres = Array.from(genresSet);
    }

    function initializeGenres(
        dataForSankey, movieCountryGenreAvailabilityData,
        serieCountryGenreAvailabilityData, selectedCountryForSankey,
        yearMin, yearMax
    ) {
        let genresSet = new Set();

        if (selectedCountryForSankey != null) {
            // Collect genres from movie data
            movieCountryGenreAvailabilityData.forEach(d => {
                if (d["Country_Availability"] == selectedCountryForSankey) {
                    let year = parseInt(d["Year"]);
                    if (year >= yearMin && year <= yearMax) {
                        Object.keys(d).forEach(key => {
                            if (key != "Country_Availability" && key != "Year") {
                                genresSet.add(key);
                            }
                        });
                    }
                }
            });
            // Collect genres from TV show data
            serieCountryGenreAvailabilityData.forEach(d => {
                if (d["Country_Availability"] == selectedCountryForSankey) {
                    let year = parseInt(d["Year"]);
                    if (year >= yearMin && year <= yearMax) {
                        Object.keys(d).forEach(key => {
                            if (key != "Country_Availability" && key != "Year") {
                                genresSet.add(key);
                            }
                        });
                    }
                }
            });
        } else {
            dataForSankey[0].forEach(d => genresSet.add(d.Genre));
            dataForSankey[1].forEach(d => genresSet.add(d.Genre));
        }

        allGenres = Array.from(genresSet);
    }
}
