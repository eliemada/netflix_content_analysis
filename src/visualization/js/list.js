// Function to create an interactive list
function createList(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }

    const ul = document.createElement('ul');
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.addEventListener('click', () => {
            alert(`You clicked on ${item}`);
        });
        ul.appendChild(li);
    });

    container.appendChild(ul);
}

// Function to update the interactive list
function updateList(containerId, newItems) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }

    const ul = container.querySelector('ul');
    if (!ul) {
        console.error('No list found to update.');
        return;
    }

    // Clear existing list items
    ul.innerHTML = '';

    // Add new items
    newItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.addEventListener('click', () => {
            alert(`You clicked on ${item}`);
        });
        ul.appendChild(li);
    });
}