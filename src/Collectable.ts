import p5 from "p5";
import { p } from "./main";

export default class Collectable {
    isGood: boolean;
    hpModified: number;
    position: p5.Vector;
    // foodImg: p5.Image;
    // poisonImg: p5.Image;

    constructor(isFood: boolean) {
        this.isGood = isFood;
        this.hpModified = this.isGood ? 0.3 : -0.75;
        this.position = p.createVector(p.floor(p.random(p.width)), p.floor(p.random(p.height)))
        // this.foodImg = p.loadImage("/food.png")
        // this.poisonImg = p.loadImage("/poison.png");
        // this.display();
    }

    display() {
        p.push();
        p.noStroke
        // p.translate(this.position.x, this.position.y)
        p.fill(this.isGood ? p.color(0, 255, 0) : p.color(255, 0, 0));
        p.circle(this.position.x, this.position.y, 6);
        // p.image((this.isGood ? this.foodImg : this.poisonImg), 0, 0, 10, 10);
        p.pop();
    }
}