// sliderLegned.js

export function createSliderLegend() {
    const slider = document.getElementById("sliderLegend");

    // Create the single-handle slider
    noUiSlider.create(slider, {
        start: 7, // Initial position of the handle
        range: {
            min: 0,
            max: 15,
        },
        tooltips: true,
        format: {
            to: value => Math.round(value),
            from: value => value,
        },
        step: 1,

        tooltipContainer: slider // Append tooltips to the slider container itself
    });

    slider.noUiSlider.on('update', function (values) {
        const sliderValue = parseInt(values[0]);

        // Create and dispatch the custom event
        const sliderEvent = new CustomEvent('updateSliderSankey', {
            detail: {value: sliderValue}, // Pass slider value as event detail
        });

        // Dispatch the event on the slider element (or document/body if needed)
        document.dispatchEvent(sliderEvent);
    });


}
