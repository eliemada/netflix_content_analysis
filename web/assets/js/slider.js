// slider.js

export function createSlider(yearMin, yearMax, updateDashboardCallback) {
    const slider = document.getElementById("slider");

    // Create the multi-cursor slider with two cursors
    noUiSlider.create(slider, {
        start: [yearMin, yearMax],
        connect: true,
        range: {
            min: yearMin,
            max: yearMax,
        },
        tooltips: true,
        format: {
            to: value => Math.round(value),
            from: value => value,
        },
        step: 1,
    });

    slider.noUiSlider.on("update", function (values) {
        const minYear = parseInt(values[0]);
        const maxYear = parseInt(values[1]);
        updateDashboardCallback(minYear, maxYear);
    });
}
