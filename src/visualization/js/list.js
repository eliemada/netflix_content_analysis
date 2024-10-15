// list.js

let cleanedNetflixData;
let minYearGlobal;
let maxYearGlobal;
let numLines = 3;
const maxLines = 15;
const minLines = 3;
let typeFilter = 'All';
let selectedCountryGlobal = null;

// Function to create the list UI
export function createList(data, minYear, maxYear) {
    cleanedNetflixData = data;
    minYearGlobal = minYear;
    maxYearGlobal = maxYear;

    // Select the 'yourTop' div instead of 'body'
    const container = d3.select('#yourTop')
        .style('font-family', 'Netflix_font')
        .style('color', '#FFFFFF');

    // Clear any existing content
    container.selectAll('*').remove();

    // Add the title
    container.append('h2')
        .text('YOUR TOP')
        .style('text-align', 'center');

    // Create the filters container
    const filters = container.append('div')
        .attr('class', 'filters')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('justify-content', 'center')
        .style('margin-bottom', '20px');

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
    });

    // Create the + and - buttons
    filters.append('button')
        .attr('id', 'add-line')
        .text('+')
        .style('margin-right', '5px')
        .style('padding', '5px 10px');

    filters.append('button')
        .attr('id', 'remove-line')
        .text('-')
        .style('padding', '5px 10px');

    // Create the table
    const table = container.append('table')
        .attr('id', 'top-list-table')
        .style('margin', '0 auto')
        .style('border-collapse', 'collapse')
        .style('table-layout', 'fixed')
        .style('width', '600px');

    // Adjust the thead
    const thead = table.append('thead')
        .style('display', 'block');

    const tbody = table.append('tbody')
        .style('display', 'block')
        .style('max-height', '300px')
        .style('overflow-y', 'auto');

    // Add headers with fixed widths
    thead.append('tr')
        .selectAll('th')
        .data(['', 'Title', 'Actor Names'])
        .enter()
        .append('th')
        .text((d, i) => d)
        .style('border', '1px solid #ddd')
        .style('padding', '8px')
        .style('background-color', '#444')
        .style('text-align', 'center')  // Center align headers
        .style('width', (d, i) => i === 0 ? '100px' : '250px');

    // Initial table update
    updateTable();

    // Add event listeners to buttons
    d3.select('#add-line').on('click', function() {
        if (numLines < maxLines) {
            numLines++;
            updateTable();
        }
    });

    d3.select('#remove-line').on('click', function() {
        if (numLines > minLines) {
            numLines--;
            updateTable();
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

    // Append cells to the new rows with fixed widths
    // Image cell
    newRows.append('td')
        .attr('class', 'image-cell')
        .style('border', '1px solid #ddd')
        .style('padding', '8px')
        .style('width', '100px')
        .style('text-align', 'center')  // Center align cell content
        .append('img')
        .attr('src', d => d.Image)
        .attr('alt', d => d.Title)
        .style('width', '80px')
        .style('height', 'auto')
        .style('display', 'block')      // Center the image
        .style('margin', '0 auto')      // Center the image
        .style('cursor', 'pointer')
        .on('click', function(event, d) {
            // Enlarge the image when clicked
            showImageModal(d.Image, d.Title);
        });

    // Title cell
    newRows.append('td')
        .style('border', '1px solid #ddd')
        .style('padding', '8px')
        .style('width', '250px')
        .text(d => d.Title);

    // Actors cell
    newRows.append('td')
        .style('border', '1px solid #ddd')
        .style('padding', '8px')
        .style('width', '250px')
        .text(d => d.Actors);

    // Update selection: update existing rows
    const allRows = newRows.merge(rows);

    // Update image cell
    allRows.select('td.image-cell')
        .style('text-align', 'center'); // Ensure cell is center-aligned

    allRows.select('td.image-cell img')
        .attr('src', d => d.Image)
        .attr('alt', d => d.Title)
        .style('display', 'block')      // Center the image
        .style('margin', '0 auto');     // Center the image

    // Update title and actors cells
    allRows.select('td:nth-child(2)')
        .text(d => d.Title);

    allRows.select('td:nth-child(3)')
        .text(d => d.Actors);
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

// Function to update the list when minYear, maxYear, or selectedCountry change
export function updateList(minYear, maxYear, selectedCountry) {
    minYearGlobal = minYear;
    maxYearGlobal = maxYear;
    selectedCountryGlobal = selectedCountry;
    updateTable();
}
