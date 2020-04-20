import * as geom from "./geom";
import * as renderer from "./renderer";
import * as map from "./map";
import * as mapSelector from "./mapSelector";
import * as actor from "./actor";
import * as input from "./input";

export class Game {
  invalid: boolean = true;
  renderer: renderer.IMapRenderer;
  input: input.Input;
  world: map.World;
  currentMap: map.IMap;
  mapSelector: mapSelector.MapSelector;
  tiles: any[];
  player: actor.Player;
  constructor(public display: HTMLCanvasElement) {
    this.renderer = new renderer.CanvasMapRenderer(
      this.display,
      new geom.Rectangle(0, 0, 20, 20)
    );
    this.input = new input.Input();
    this.world = new map.World();
    this.player = new actor.Player(10, 1.0, this.world.getMap("forest", 0));
    console.log(this.player.getMap());
    console.log(this.player.getMapLevel());
    console.log(this.player.getMapName());
    this.currentMap = this.world.getMap(
      this.player.getMap().getMapType(),
      this.player.getMap().getLayer()
    );
    this.mapSelector = new mapSelector.MapSelector(this.currentMap);

    var gameloop = () => {
      this.update();
      requestAnimationFrame(gameloop);
    };
    gameloop();
  }

  update(): void {
    if (this.input.newDirection) {
      this.invalid = this.player.move(this.input.newDirection);
      this.input.clear();
    }
    if (this.invalid) {
      this.draw();
    }
  }

  draw(): void {
    let viewRadius: number = 20;
    let subMapTiles: any[] = this.mapSelector.getSubMapTiles(
      viewRadius,
      this.player.getPos().getX(),
      this.player.getPos().getY()
    );
    let seenSubMap: any[] = this.mapSelector.getSubMapTiles(
      viewRadius,
      this.player.getPos().getX(),
      this.player.getPos().getY()
    );
    // console.log(subMapTiles);
    let topLeft: number[] = [
      this.player.getPos().getX() - viewRadius,
      this.player.getPos().getY() - viewRadius,
    ];
    let countY = 0;
    let countX = 0;

    for (
      let y = Math.max(this.player.getPos().getY() - viewRadius, 0);
      y < this.player.getPos().getY() + viewRadius + 1;
      y++
    ) {
      for (
        let x = Math.max(this.player.getPos().getX() - viewRadius, 0);
        x < this.player.getPos().getX() + viewRadius + 1;
        x++
      ) {
        let point: geom.Point = new geom.Point(x, y);
        if (this.currentMap.isTileVisible(point) === true) {
          //okay cool
        } else {
          subMapTiles[y - (this.player.getPos().getY() - viewRadius)][
            x - (this.player.getPos().getX() - viewRadius)
          ] = "";
        }

        if (this.currentMap.lastSeenTile(point) !== "") {
          seenSubMap[y - (this.player.getPos().getY() - viewRadius)][
            x - (this.player.getPos().getX() - viewRadius)
          ] = this.currentMap.lastSeenTile(point);
        } else {
          seenSubMap[y - (this.player.getPos().getY() - viewRadius)][
            x - (this.player.getPos().getX() - viewRadius)
          ] = "";
        }

        countX++;
      }
      countY++;
    }

    // this.renderer.draw(seenSubMap, true)
    this.renderer.draw([
      new renderer.RenderLayer(seenSubMap, [1]),
      new renderer.RenderLayer(subMapTiles, []),
    ]);

    this.renderer.drawTile(viewRadius, viewRadius, "@", []); // draw the player in the center.  Probably change this later
    this.invalid = false;
  }
}
