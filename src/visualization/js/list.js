// list.js

let cleanedNetflixData;
let minYearGlobal;
let maxYearGlobal;
let numLines = 5;
const maxLines = 15;
const minLines = 5;
let typeFilter = 'All';
let selectedCountryGlobal = null;
let titleElement;
// Function to create the list UI
export function createList(data, minYear, maxYear) {
    cleanedNetflixData = data;
    minYearGlobal = minYear;
    maxYearGlobal = maxYear;

    // Select the 'yourTop' div
    const container = d3.select('#yourTop')
        .style('font-family', 'Netflix_font')
        .style('color', '#FFFFFF');

    // Clear any existing content
    container.selectAll('*').remove();

    // Add the title
    titleElement = container.append('h2')
        .style('text-align', 'center')
        .style('margin', '10px 0 5px 0'); // Adjust the top and bottom margins
    // container.append('h2')
    //     .text('YOUR TOP')
    //     .style('text-align', 'center');

    updateTitle(); // Call the function to set the initial title


    // Create the filters container
    const filters = container.append('div')
        .attr('class', 'filters')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('justify-content', 'center')
        .style('margin-bottom', '10px');

    // Create the Type filter
    filters.append('label')
        .text('Type: ')
        .style('margin-right', '5px');

    const typeSelect = filters.append('select')
        .attr('id', 'type-select')
        .style('margin-right', '20px');

    // Add options to the typeSelect
    typeSelect.selectAll('option')
        .data(['All', 'Movie', 'TV Show'])
        .enter()
        .append('option')
        .text(d => d);

    // Event listener for typeSelect
    typeSelect.on('change', function() {
        typeFilter = this.value;
        updateTable();
        updateTitle()
    });

    // Create the + and - buttons with updated styles
    filters.append('button')
        .attr('id', 'add-line')
        .text('+')
        .style('margin-right', '5px')
        // Remove existing padding
        .style('padding', '5px 10px')
        // Apply new styles
        .style('background-color', '#444')
        .style('color', 'white')
        .style('font-family', 'Netflix_font')
        .style('font-size', '18px')
        .style('border', 'none')
        .style('border-radius', '10px')
        .style('cursor', 'pointer')
        .style('transition', 'background-color 0.3s ease')
        .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')
        // Change hover effect to red
        .on('mouseover', function() {
            d3.select(this).style('background-color', 'red');
        })
        .on('mouseout', function() {
            d3.select(this).style('background-color', '#444');
        });

    filters.append('button')
        .attr('id', 'remove-line')
        .text('-')
         .style('padding', '5px 10px')
        .style('background-color', '#444')
        .style('color', 'white')
        .style('font-family', 'Netflix_font')
        .style('font-size', '18px')
        .style('border', 'none')
        .style('border-radius', '10px')
        .style('cursor', 'pointer')
        .style('transition', 'background-color 0.3s ease')
        .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')
        .on('mouseover', function() {
            d3.select(this).style('background-color', 'red');
        })
        .on('mouseout', function() {
            d3.select(this).style('background-color', '#444');
        });

    // Create a wrapper div for the table to handle scrolling
    const tableWrapper = container.append('div')
        .attr('id', 'table-wrapper')
        .style('width', '100%')
        .style('overflow-y', 'auto')
        .style('max-height', '520px')
        .style('margin', '0 auto') // Center the table wrapper

    // Create the table
    const table = tableWrapper.append('table')
        .attr('id', 'top-list-table')
        .style('margin', '0 auto') // Center the table
        .style('border-collapse', 'collapse')
        .style('table-layout', 'fixed')
        .style('width', '100%'); // Adjusted to fit within the container

    // Add headers with adjusted widths
    const thead = table.append('thead');
    thead.append('tr')
        .selectAll('th')
        .data(['', 'Title', 'Actor Names', 'Metrics']) // Added 'Metrics' column
        .enter()
        .append('th')
        .text((d, i) => d)
        .style('border', '1px solid #ddd')
        .style('padding', '8px')
        .style('background-color', '#444')
        .style('text-align', 'center')  // Center align headers
        .style('width', (d, i) => {
            if (i === 0) return '8%'; // Image column, reduced width
            else if (i === 3) return '30%'; // Metrics column
            else return '31%'; // Other columns
        });

    // Create tbody
    const tbody = table.append('tbody');

    // Initial table update
    updateTable();

    // Add event listeners to buttons
    d3.select('#add-line').on('click', function() {
        if (numLines < maxLines) {
            numLines++;
            updateTable();
            updateTitle();
        }
    });

    d3.select('#remove-line').on('click', function() {
        if (numLines > minLines) {
            numLines--;
            updateTable();
            updateTitle(); // Update the title when numLines changes
        }
    });
}

// Function to update the table rows
function updateTable() {
    // Filter data according to selected type and year range
    let filteredData = cleanedNetflixData;

    // Map filter values to data values
    const typeMapping = {
        'All': null,
        'Movie': 'Movie',
        'TV Show': 'Series'  // Map 'TV Show' to 'Series'
    };

    if (typeFilter !== 'All') {
        const dataType = typeMapping[typeFilter];
        filteredData = filteredData.filter(d => d.Series_or_Movie === dataType);
    }

    filteredData = filteredData.filter(d => {
        const releaseYear = +d.Release_Date.slice(-4);
        return releaseYear >= minYearGlobal && releaseYear <= maxYearGlobal;
    });

    // **Filter by selected country if any**
    if (selectedCountryGlobal) {
        filteredData = filteredData.filter(d => {
            // The Country_Availability field may contain multiple countries separated by commas
            // We'll check if the selected country is included in the list
            const countries = d.Country_Availability.split(',').map(c => c.trim());
            return countries.includes(selectedCountryGlobal);
        });
    }

    // Sort data by Average_Score in descending order
    filteredData.sort((a, b) => +b.Average_Score - +a.Average_Score);

    // Get the top numLines entries
    const data = filteredData.slice(0, numLines);

    // Bind data to rows
    const tbody = d3.select('#top-list-table tbody');

    const rows = tbody.selectAll('tr')
        .data(data, d => d.Title);

    // Exit selection: remove rows that are no longer needed
    rows.exit().remove();

    // Enter selection: create new rows as necessary
    const newRows = rows.enter()
        .append('tr');

    // Append cells to the new rows

    // Image cell
    newRows.append('td')
        .attr('class', 'image-cell')
        .style('border', '1px solid #ddd')
        .style('padding', '8px')
        .style('text-align', 'center')  // Center align cell content
        .append('img')
        .attr('src', d => d.Local_Image)
        .attr('alt', d => d.Title)
        .style('width', '50px') // Reduced image size
        .style('height', 'auto')
        .style('display', 'block')      // Center the image
        .style('margin', '0 auto')      // Center the image
        .style('cursor', 'pointer')
        .on('click', function(event, d) {
            // Enlarge the image when clicked
            showImageModal(d.Local_Image, d.Title);
        });

    // Title cell
    newRows.append('td')
        .attr('class', 'title-cell')
        .style('border', '1px solid #ddd')
        .style('padding', '8px')
        .text(d => truncateText(d.Title, 25)); // Truncate title

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
    // Actors cell
    newRows.append('td')
        .attr('class', 'actors-cell')
        .style('border', '1px solid #ddd')
        .style('padding', '8px')
        .text(d => truncateText(d.Actors, 25)) // Truncate actors if needed
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            // Show tooltip with full actors list
            tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);

            tooltip.html(`<strong>Actors:</strong> ${d.Actors}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    // Metrics cell - Small multiple bar chart
    newRows.append('td')
        .attr('class', 'metrics-cell')
        .style('border', '1px solid #ddd')
        .style('padding', '8px')
        .each(function(d) {
            createBarChart(d, this);
        });

    // Update selection: update existing rows
    const allRows = newRows.merge(rows);

    // Update image cell
    allRows.select('td.image-cell img')
        .attr('src', d => d.Local_Image)
        .attr('alt', d => d.Title)
        .style('width', '50px') // Adjust image size
        .style('height', 'auto');

    // Update title and actors cells
    allRows.select('td.title-cell')
        .text(d => truncateText(d.Title, 25));

    allRows.select('td.actors-cell')
        .text(d => truncateText(d.Actors, 25));

    // Update metrics cell
    allRows.select('td.metrics-cell')
        .each(function(d) {
            d3.select(this).selectAll('*').remove(); // Clear previous content
            createBarChart(d, this);
        });
    updateTitle();
}

function updateTitle() {
    // Map 'All' to 'Titles' for the title
    const typeMapping = {
        'All': 'Titles',
        'Movie': 'Movies',
        'TV Show': 'Series'
    };

    const typeText = typeMapping[typeFilter] || 'Titles';
    const countryText = selectedCountryGlobal ? `in ${selectedCountryGlobal}` : 'in the world';

    // Update the title text
    titleElement.text(`TOP ${numLines} ${typeText.toUpperCase()} ${countryText}`);
}
// Function to create the bar chart for each row
function createBarChart(d, cell) {
    // Data for the bar chart
    const chartData = [
        { label: 'Score', value:  Math.round(+d.Average_Score) },
        { label: 'Countries', value: d.Country_Availability.split(',').length },
        { label: 'Languages', value: d.Languages.split(',').length }
    ];

    const maxValue = d3.max(chartData, d => d.value);

    const svgWidth = 180;
    const svgHeight = 50;
    const barHeight = 10;
    const barPadding = 5;

    const svg = d3.select(cell)
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .style('cursor', 'pointer') // Indicate clickability
        .on('click', function() {
            // Show the bar chart in a modal when clicked
            showBarChartModal(d);
        });

    const xScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, svgWidth - 80]); // Leave space for labels

    const barGroup = svg.selectAll('.bar-group')
        .data(chartData)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('transform', (d, i) => `translate(0, ${i * (barHeight + barPadding)})`);

    // Add labels
    barGroup.append('text')
        .attr('x', 0)
        .attr('y', barHeight / 2 + 4)
        .text(d => d.label)
        .style('font-size', '10px')
        .style('fill', '#FFFFFF')
        .style('font-family', 'Netflix_font'); // Use Netflix font

    // Add bars
    barGroup.append('rect')
        .attr('x', 50)
        .attr('y', 0)
        .attr('width', d => xScale(d.value))
        .attr('height', barHeight)
        .attr('fill', '#ff6b6b');

    // Add values at the end of bars
    barGroup.append('text')
        .attr('x', d => 50 + xScale(d.value) + 5)
        .attr('y', barHeight / 2 + 4)
        .text(d => d.value)
        .style('font-size', '10px')
        .style('fill', '#FFFFFF')
        .style('font-family', 'Netflix_font'); // Use Netflix font
}

// Function to show the bar chart in a modal
function showBarChartModal(d) {
    // Remove existing modal if any
    d3.select('#bar-chart-modal').remove();

    // Data for the bar chart
    const chartData = [
        { label: 'Score', value:  Math.round(+d.Average_Score) },
        { label: 'Countries', value: d.Country_Availability.split(',').length },
        { label: 'Languages', value: d.Languages.split(',').length }
    ];

    const maxValue = d3.max(chartData, d => d.value);

    // Create a modal overlay
    const modal = d3.select('body')
        .append('div')
        .attr('id', 'bar-chart-modal')
        .style('position', 'fixed')
        .style('top', '0')
        .style('left', '0')
        .style('width', '100%')
        .style('height', '100%')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('z-index', '1000')
        .style('font-family', 'Netflix_font') // Set Netflix font
        .on('click', function() {
            // Remove modal when clicked outside the chart
            d3.select('#bar-chart-modal').remove();
        });

    const svgWidth = 400;
    const svgHeight = 200;
    const barHeight = 30;
    const barPadding = 15;

    const svg = modal.append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .style('font-family', 'Netflix_font') // Set Netflix font
        .on('click', function(event) {
            // Prevent the modal from closing when clicking on the chart
            event.stopPropagation();
        });

    const xScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, svgWidth - 150]); // Leave space for labels

    const barGroup = svg.selectAll('.bar-group')
        .data(chartData)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('transform', (d, i) => `translate(0, ${i * (barHeight + barPadding) + 20})`);

    // Add labels
    barGroup.append('text')
        .attr('x', 0)
        .attr('y', barHeight / 2 + 5)
        .text(d => d.label)
        .style('font-size', '16px')
        .style('fill', '#FFFFFF');

    // Add bars
    barGroup.append('rect')
        .attr('x', 100)
        .attr('y', 0)
        .attr('width', d => xScale(d.value))
        .attr('height', barHeight)
        .attr('fill', '#ff6b6b');

    // Add values at the end of bars
    barGroup.append('text')
        .attr('x', d => 100 + xScale(d.value) + 10)
        .attr('y', barHeight / 2 + 5)
        .text(d => d.value)
        .style('font-size', '16px')
        .style('fill', '#FFFFFF');
}

// Function to show the image in a modal
function showImageModal(imageSrc, title) {
    // Remove existing modal if any
    d3.select('#image-modal').remove();

    // Create a modal overlay
    const modal = d3.select('body')
        .append('div')
        .attr('id', 'image-modal')
        .style('position', 'fixed')
        .style('top', '0')
        .style('left', '0')
        .style('width', '100%')
        .style('height', '100%')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('z-index', '1000')
        .on('click', function() {
            // Remove modal when clicked outside the image
            d3.select('#image-modal').remove();
        });

    // Add the image to the modal
    modal.append('img')
        .attr('src', imageSrc)
        .attr('alt', title)
        .style('max-width', '80%')
        .style('max-height', '80%')
        .style('box-shadow', '0 0 10px #fff')
        .on('click', function(event) {
            // Prevent the modal from closing when clicking on the image
            event.stopPropagation();
        });
}

// Function to truncate text to a maximum length
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.slice(0, maxLength - 3) + '...';
    } else {
        return text;
    }
}

// Function to update the list when minYear, maxYear, or selectedCountry change
export function updateList(minYear, maxYear, selectedCountry, selectedType = null) {
    if (selectedType) {
        typeFilter = selectedType;
    }

    minYearGlobal = minYear;
    maxYearGlobal = maxYear;
    selectedCountryGlobal = selectedCountry;
    updateTable();
}
