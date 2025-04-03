import p5 from 'p5';
import Vehicle from './Vehicle';
import Collectable from './Collectable';

let playPauseButton = document.getElementById("playPauseBtn");
let restartButton = document.getElementById("resetBtn");
let mutationRateInput = document.getElementById("mutationRateSlider") as HTMLInputElement;
let foodAmountInput = document.getElementById("numFoodsSlider") as HTMLInputElement;
let poisonAmountInput = document.getElementById("numPoisonsSlider") as HTMLInputElement;
let vehicleCountInput = document.getElementById("numVehiclesSlider") as HTMLInputElement;
export let displayDebug = document.getElementById("debugMode") as HTMLInputElement;

const generationDisplayDiv = document.getElementById("generationValue");
const vehicleDisplayDiv = document.getElementById("bestFitnessValue");
const foodDisplayDiv = document.getElementById("avgFitnessValue");
const timeDisplayDiv = document.getElementById("elapsedTimeValue");

export let p: p5; // Declare p as a global variable
let matingPool: Vehicle[];
let vehicles: Vehicle[];
let food: Collectable[];
let poison: Collectable[];
let generation = 1;
let timeElapsed = 0;
export let mutationRate = Number(mutationRateInput.value);
let foodAmount: number = Number(foodAmountInput.value); //number of foods
let poisonAmount: number = Number(poisonAmountInput.value); //number of poisons
let vehicleCount: number = Number(vehicleCountInput.value)

let width: number = document.getElementById("visualizationCanvas")?.offsetWidth || 670;
let height: number = document.getElementById("visualizationCanvas")?.offsetHeight || 570;
let running: boolean = true;

playPauseButton?.addEventListener("click", () => {
  if (running)
    p.noLoop();
  else
    p.loop();

  running = !running;
  console.log(running)
})

restartButton?.addEventListener("click", () => restart())

mutationRateInput.addEventListener("change", () => mutationRate = Number(mutationRateInput.value))
foodAmountInput.addEventListener("change", () => foodAmount = Number(foodAmountInput.value))
poisonAmountInput.addEventListener("change", () => poisonAmount = Number(poisonAmountInput.value))
vehicleCountInput.addEventListener("change", () => vehicleCount = Number(vehicleCountInput.value))




const sketch = (_p: p5) => {
  p = _p; // Assign the p5 instance to the global variable
  let poisonAmountP = p.createP("Poison Amount:");

  p.setup = () => {
    let cnv = p.createCanvas(width, height - 80);
    cnv.parent("visualizationCanvas");
    food = [];
    poison = [];
    matingPool = [];

    //Initialize all the foods and poisons
    for (let index = 0; index < foodAmount; index++) {
      food.push(new Collectable(true));
    }
    for (let index = 0; index < poisonAmount; index++) {
      poison.push(new Collectable(false));
    }

    //Initialize the vehicles
    vehicles = [];
    for (let i = 0; i < vehicleCount; i++) {
      vehicles[i] = new Vehicle();
    }


  };

  p.mouseClicked = () => {
    console.log(matingPool)
  }

  p.draw = () => {
    p.background(1);
    poisonAmountP.html("Poisons: " + poison.length)

    timeElapsed++;

    if (vehicleDisplayDiv) vehicleDisplayDiv.innerText = vehicles.length.toString();
    if (foodDisplayDiv) foodDisplayDiv.innerText = food.length.toString();
    if (generationDisplayDiv) generationDisplayDiv.innerText = generation.toString();
    if (timeDisplayDiv) timeDisplayDiv.innerText = formatTime(p.floor(timeElapsed / 1000 * p.deltaTime));


    //Display all the collectables
    food.forEach(e => e.display())
    poison.forEach(e => e.display())

    //Generate new collectables 5% of the time
    if (p.random(1) < 0.1)
      GenerateNewCollectable(true)
    if (p.random(1) < 0.03 && poison.length < 200)
      GenerateNewCollectable(false)

    vehicles.forEach((vehicle, index) => {
      vehicle.update(food, poison);

      if (p.random(1) < 0.002) {
        let newVehicle = vehicle.clone();
        vehicles.push(newVehicle);
        if (matingPool.length > 4) {
          matingPool.splice(0, 1);
        }
        matingPool.push(newVehicle);
      }

      //check and handle if vehicle dies
      if (vehicle.health <= 0) {
        vehicle.health = -1;
        let currentPos = vehicle.position;
        vehicles.splice(index, 1);
        GenerateNewCollectable(true, currentPos.x, currentPos.y)
      }

      if (vehicles.length == 0)
        generate(matingPool);
    })


    // vehicle.update(food, poison);
    // if (vehicle.health <= 0) {
    //   vehicle.health = -1;
    //   let currentPos = vehicle.position;
    //   vehicle.position = new p5.Vector(p.width / 2, p.height / 2);
    //   vehicle.maxSpeed = 0;
    //   GenerateNewCollectable(true, currentPos.x, currentPos.y)
    // }
  };


  const GenerateNewCollectable = (isGood: boolean, positionX: number = p.random(p.width), positionY: number = p.random(p.height)) => {
    let newTreat = new Collectable(isGood);
    newTreat.position = p.createVector(positionX, positionY);
    if (isGood)
      food.push(newTreat);
    else
      poison.push(newTreat)
  };

  const generate = (matingArray: Vehicle[]) => {
    let newPopulation = [];

    // const totalFitness = matingArray.reduce((a, data) => a + data.fitness, 0);
    // const avg = totalFitness / matingArray.length;
    // console.log(avg)

    for (let i = 0; i < vehicleCount; i++) {
      let parent = pickOne(matingArray);
      let child = new Vehicle(parent.dna);
      newPopulation.push(child);
    }

    vehicles = newPopulation;
    generation++;
  }

  const pickOne = (matingArray: Vehicle[]) => {
    const totalFitness = matingArray.reduce((a, data) => a + data.fitness, 0);

    let index = 0;
    let r = p.random(totalFitness);
    while (true) {
      // console.log(r)
      r -= matingArray[index].fitness;
      if (r <= 0)
        return matingArray[index]
      index++;
    }

  }
};

const restart = () => {
  p.loop();
  running = true;
  generation = 1;
  food = []
  poison = []

  for (let index = 0; index < foodAmount; index++) {
    food.push(new Collectable(true));
  }
  for (let index = 0; index < poisonAmount; index++) {
    poison.push(new Collectable(false));
  }

  //Initialize the vehicles
  vehicles = [];
  for (let i = 0; i < vehicleCount; i++) {
    vehicles[i] = new Vehicle();
  }

}

function formatTime(seconds: number): string {
  // const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  // return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

new p5(sketch);
