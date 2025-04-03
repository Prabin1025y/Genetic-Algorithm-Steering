const vehicleInput = document.getElementById("numVehicles");
const vehicleSlider = document.getElementById("numVehiclesSlider");

const poisonInput = document.getElementById("numPoisons");
const poisonSlider = document.getElementById("numPoisonsSlider");

const foodInput = document.getElementById("numFoods");
const foodSlider = document.getElementById("numFoodsSlider");

const mutationRateInput = document.getElementById("mutationRate");
const mutationRateSlider = document.getElementById("mutationRateSlider");

function syncInputAndSlider(input: HTMLInputElement, slider: HTMLInputElement) {
    input.value = slider.value;
    slider.addEventListener("input", () => {
        input.value = slider.value;
    });
    input.addEventListener("input", () => {
        slider.value = input.value;
    });
}

if (vehicleInput instanceof HTMLInputElement && vehicleSlider instanceof HTMLInputElement) {
    syncInputAndSlider(vehicleInput, vehicleSlider);
}

if (poisonInput instanceof HTMLInputElement && poisonSlider instanceof HTMLInputElement) {
    syncInputAndSlider(poisonInput, poisonSlider);
}

if (foodInput instanceof HTMLInputElement && foodSlider instanceof HTMLInputElement) {
    syncInputAndSlider(foodInput, foodSlider);
}

if (mutationRateInput instanceof HTMLInputElement && mutationRateSlider instanceof HTMLInputElement) {
    syncInputAndSlider(mutationRateInput, mutationRateSlider);
}