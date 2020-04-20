import * as geom from "./geom";

export enum Keyboard {
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40,
  H = 72,
  J = 74,
  K = 75,
  L = 76,
  Y = 89,
  U = 85,
  B = 66,
  N = 78,
}

export var Directions = {
  UP: new geom.Point(0, -1),
  DOWN: new geom.Point(0, 1),
  RIGHT: new geom.Point(1, 0),
  LEFT: new geom.Point(-1, 0),
  UPLEFT: new geom.Point(-1, -1),
  UPRIGHT: new geom.Point(1, -1),
  DOWNLEFT: new geom.Point(-1, 1),
  DOWNRIGHT: new geom.Point(1, 1),
};

//TODO input interface, then mouse and steering wheel support
export class Input {
  newDirection: geom.Point;
  constructor() {
    window.addEventListener("keydown", (event) => this.keypress(event), false);
  }

  keypress(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    let keyCode = event["keyCode"];

    switch (keyCode) {
      case Keyboard.UP:
      case Keyboard.K:
        this.newDirection = Directions.UP;
        break;
      case Keyboard.RIGHT:
      case Keyboard.L:
        this.newDirection = Directions.RIGHT;
        break;
      case Keyboard.DOWN:
      case Keyboard.J:
        this.newDirection = Directions.DOWN;
        break;
      case Keyboard.LEFT:
      case Keyboard.H:
        this.newDirection = Directions.LEFT;
        break;
      case Keyboard.Y:
        this.newDirection = Directions.UPLEFT;
        break;
      case Keyboard.U:
        this.newDirection = Directions.UPRIGHT;
        break;
      case Keyboard.B:
        this.newDirection = Directions.DOWNLEFT;
        break;
      case Keyboard.N:
        this.newDirection = Directions.DOWNRIGHT;
        break;
    }
  }

  clear(): void {
    this.newDirection = null;
  }
}
