
async function updateSankeyDiagram(){

    var sankeyElement = document.getElementById("sankey");

    // Get the width and height of the element
    var elementWidth = sankeyElement.offsetWidth;
    var elementHeight = sankeyElement.offsetHeight;    

    // Select the SVG element and clear its contents
    d3.select("#sankey").select("svg").remove();

    // append the svg object to the body of the page
    var svg = d3.select("#sankey").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");


        var nodes =[{"node":0,"name":"Movies"},{"node":1, "name":"TV shows"}];
        var hiddenNodes = []
        var links = []
        var hiddenLinks = []
        var count = 2
        var otherValueMovie = 0
        var otherValueTVshow = 0
        console.log(dataForSankey[0])

        console.log(dataForSankey)

        dataForSankey[0].forEach(function(d){
            var movieValue = parseFloat(d[String(yearMin)]);
            console.log("Movie  "+d.Genre+"  "+movieValue);
            nodes.push({"node":count,"name":d.Genre});
            if (movieValue > 100) {
                links.push({"source":0, "target":count, "value":movieValue});
            }
            count += 1
        })
        count =2;
        dataForSankey[1].forEach(function(d){
            var TVshowValue =parseFloat(d[String(yearMin)]);
            console.log("TVshow  "+d.Genre+"  "+TVshowValue);
            if (TVshowValue > 10){
                links.push({"source":1, "target":count, "value":TVshowValue});
            }
            count += 1
        })

        // data.forEach(function(d){
        //     d.forEach(function(d){
        //         var movieValue = parseFloat(d.Movies);
        //         var tvShowValue = parseFloat(d.TvShows);
        //         nodes.push({"node":count,"name":d.Genre});
        //         if (d.Percentage > 4) {
        //             links.push({"source":0, "target":count, "value":movieValue});
        //             links.push({"source":1, "target":count, "value":tvShowValue});
        //         }else{
        //             hiddenLinks.push({"source":0, "target":count, "value":movieValue});
        //             hiddenLinks.push({"source":1, "target":count, "value":tvShowValue});
        //             otherValueMovie += movieValue
        //             otherValueTVshow += tvShowValue
        //         }
        //         count += 1
        //     })
        // })
        
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
        
        // Log the graph data to inspect it
        console.log("Graph nodes:", graph.nodes);
        console.log("Graph links:", graph.links);

        // Validate the data
        graph.links.forEach(link => {
            if (isNaN(link.width)) {
                console.error("Invalid link width:", link);
            }
            if (isNaN(link.source.x0) || isNaN(link.source.x1) || isNaN(link.target.x0) || isNaN(link.target.x1)) {
                console.error("Invalid link coordinates:", link);
            }
        });
        
        // add in the links
        var link = svg.append("g")
        .selectAll(".link")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal() )
        .style("stroke-width", function(d) { 
            console.log("Link width:", d.width);
            return Math.max(1, d.width); })
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
    
}