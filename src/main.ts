import { Game } from "./rogue/game";
window.onload = () => {
  var canvas = <HTMLCanvasElement>document.getElementById("display");
  var rogueTS = new Game(canvas);
};
