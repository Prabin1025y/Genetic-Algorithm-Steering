import p5 from "p5";
import { displayDebug, mutationRate, p } from "./main";
import Collectable from "./Collectable";

export default class Vehicle {
    health: number;
    position: p5.Vector;
    velocity: p5.Vector;
    acceleration: p5.Vector;
    dna: number[];
    fitness: number;
    maxSpeed: number;
    maxForce: number;

    constructor(dna?: number[]) {

        this.health = 1;
        this.fitness = 0;
        this.position = p.createVector(p.random(p.width), p.random(p.height));
        this.velocity = p.createVector(p.random(2), p.random(2));
        this.acceleration = p.createVector(0, 0);
        this.dna = [];

        if (dna) {
            this.dna = dna;

            if (p.random(1) < mutationRate)
                this.dna[0] += p.random(-0.1, 0.1)
            if (p.random(1) < mutationRate)
                this.dna[1] += p.random(-0.1, 0.1)
            if (p.random(1) < mutationRate)
                this.dna[2] += p.random(-5, 5)
            if (p.random(1) < mutationRate)
                this.dna[3] += p.random(-5, 5)

        }
        else {
            this.dna[0] = p.random(-2, 2) //attraction towards food
            this.dna[1] = p.random(-2, 2) //attraction towards poison
            this.dna[2] = p.random(5, 150) //radius of detecting food
            this.dna[3] = p.random(5, 150) //radius of detecting poison
        }

        this.maxSpeed = 5;
        this.maxForce = 0.4;
    }

    update(foodList: Collectable[], poisonList: Collectable[]) {

        this.seekTowardsClosest(foodList);
        this.seekTowardsClosest(poisonList);

        // Update velocity
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed)

        // Update position
        this.position.add(this.velocity);

        // Reset acceleration to zero each cycle
        this.acceleration.mult(0);

        this.fitness++;

        //decrease health overtime
        this.health -= 0.005;

        this.BoundaryAvoid();

        //display the graphics of vehicle
        this.display();

    }

    clone() {
        return new Vehicle(this.dna)
    }

    seekTowardsClosest(targetList: Collectable[]) {
        //closest target to eat and seek are separated as it can eat a target even if it is not seeking it
        let closestDistanceIndexToSeek = -1;
        let closestDistanceIndexToEat = -1;
        let closestDistance = Infinity;

        //check for the closest target and its index
        targetList.forEach((target, index) => {
            let distance = p5.Vector.dist(target.position, this.position);
            //also ensure the target is within detection range
            if (distance < closestDistance) {
                closestDistance = distance;
                closestDistanceIndexToEat = index;

                if (distance < (target.isGood ? this.dna[2] : this.dna[3]))
                    closestDistanceIndexToSeek = index
            }
        })

        //if target exists seek towards it
        if (targetList[closestDistanceIndexToSeek])
            this.seek(targetList[closestDistanceIndexToSeek]);


        //if target is too close eat it
        if (closestDistance < 5) {
            this.health += targetList[closestDistanceIndexToEat].hpModified;
            if (this.health > 1)
                this.health = 1
            targetList.splice(closestDistanceIndexToEat, 1);
        }
    }

    seek(target: Collectable) {
        // create the desired vector towards target position
        let desired = p.createVector(target.position.x, target.position.y).sub(this.position);

        // Normalize and scale to max speed
        desired.normalize();
        desired.mult(this.maxSpeed);

        // Calculate steering force
        let steer = p5.Vector.sub(desired, this.velocity);

        // Limit the magnitude of steering force
        steer.limit(this.maxForce);

        // Apply steering force to acceleration according to weight of dna
        this.weightedSteer(target, steer);
    }

    weightedSteer(target: Collectable, steer: p5.Vector) {
        if (target.isGood) {
            steer.mult(this.dna[0])
        } else {
            steer.mult(this.dna[1])
        }

        steer.limit(this.maxForce)
        this.applyForce(steer);
    }

    applyForce(force: p5.Vector) {
        // Add force to acceleration
        this.acceleration.add(force);
    }

    BoundaryAvoid() {
        let d = 30;
        let desired = null;
        if (this.position.x < d)
            desired = p.createVector(this.maxSpeed, this.velocity.y);
        else if (this.position.x > p.width - d)
            desired = p.createVector(-this.maxSpeed, this.velocity.y)

        if (this.position.y < d)
            desired = p.createVector(this.velocity.x, this.maxSpeed);
        else if (this.position.y > p.height - d)
            desired = p.createVector(this.velocity.x, -this.maxSpeed)

        if (desired) {
            desired.normalize();
            desired.mult(this.maxSpeed);

            let steer = p5.Vector.sub(desired, this.velocity);
            steer.limit(this.maxForce);
            this.applyForce(steer);
        }
    }

    display() {
        p.push();

        // Translate to vehicle's position
        p.translate(this.position.x, this.position.y);

        // Rotate to face movement direction
        let angle = this.velocity.heading();
        p.rotate(angle);
        p.fill(0, 0, 0, 0);

        if (displayDebug.checked) {
            p.stroke(0, 255, 0);
            p.line(0, 0, this.dna[0] * 20, 0);
            p.circle(0, 0, 2 * this.dna[2]);

            p.stroke(255, 0, 0);
            p.line(0, 0, this.dna[1] * 20, 0);
            p.circle(0, 0, 2 * this.dna[3]);
        }

        p.stroke(0, 0, 0, 0)
        // Draw triangle representing vehicle
        p.fill(p.lerpColor(p.color(0, 255, 0), p.color(255, 0, 0), 1 - this.health));
        p.triangle(
            -10, -5,  // Left point
            20, 0,    // Nose point
            -10, 5    // Right point
        );
        // p.image(this.vehicleImage,0,0,20,20,0,0);

        p.pop();
    }
}