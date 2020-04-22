import * as geom from "./geom";
import * as map from "./map";
import { MapCoords } from "./map";
import * as fov from "./fov";
import { MapSelector } from "./mapSelector";

export interface Actor {
  move(newDirection: geom.Point): boolean;
  getFov(): geom.Point[];
  setVisiblePoint(x: number, y: number): void;

  fov: fov.Fov;
  visiblePoints: geom.Point[];
  hp: number;
  speed: number;
}

interface ILocatable {
  subMap: map.IMap;
  subMapCoords: map.MapCoords;
  mapName: string;
  pos: geom.Point;

  getSubMap(): map.IMap;
  getMapName(): string;
  getSubMapCoords(): map.MapCoords;
  getPos(): geom.Point;
  move(newPos: geom.Point): boolean;
}

export class Player implements Actor, ILocatable {
  world: map.World;
  branchName: string;
  mapName: string;
  subMap: map.IMap;
  subMapCoords: map.MapCoords;
  pos: geom.Point;

  visiblePoints: geom.Point[];
  fov: fov.Fov;
  fovDistance: number;
  hp: number;
  speed: number;

  constructor(hp, speed, world, branchName, subMapCoords) {
    this.setVisiblePoint = this.setVisiblePoint.bind(this);
    this.world = world;
    this.branchName = branchName;
    this.subMapCoords = subMapCoords;
    this.subMap = this.world.getBranch(branchName).getMap(subMapCoords);
    this.mapName = this.subMap.getMapType();
    this.hp = hp;
    this.speed = speed;
    this.fov = new fov.Fov(
      this.subMap.blocksLight,
      this.setVisiblePoint,
      this.getDistance
    );
    this.visiblePoints = [];
    this.pos = this.subMap.getEmptyTile();
    this.fovDistance = 7;
    this.fov.compute(this.pos, this.fovDistance);
  }

  getPos(): geom.Point {
    return this.pos;
  }

  getSubMap(): map.IMap {
    return this.subMap;
  }

  getSubMapCoords(): map.MapCoords {
    return this.subMapCoords;
  }

  getFov(): geom.Point[] {
    return this.visiblePoints;
  }

  setVisiblePoint(x: number, y: number): void {
    let point: geom.Point = new geom.Point(x, y);
    this.visiblePoints.push(point);
    this.subMap.setVisibleTile(point); //for player only
  }

  getDistance(x: number, y: number): number {
    return Math.floor(Math.sqrt(x * x + y * y));
  }

  //check if the new subMap exists, return true and set it if it does
  setSubMap(coords: map.MapCoords): boolean {
    //this only updates the coords for now, since there's only one branch
    const branch = this.world.getBranch(this.branchName);
    if (branch.getMap(coords, this.subMapCoords)) {
      const settedMap = branch.getMap(coords, this.subMapCoords);
      if (settedMap !== this.subMap) {
        this.subMapCoords = coords;
        this.subMap = settedMap;
        return true;
      }
      return false;
    } else {
      console.log("There's nowhere to go");
      return false;
    }
  }

  getMapName(): string {
    return this.mapName;
  }

  move(newDirection: geom.Point): boolean {
    this.visiblePoints = [];
    this.subMap.resetVisibility();
    let tmpPoint: geom.Point = this.pos.clone();
    tmpPoint.x += newDirection.x;
    tmpPoint.y += newDirection.y;
    console.log(tmpPoint);

    let tile: string = this.subMap.getTileType(tmpPoint);
    switch (tile) {
      case " ":
        this.pos = tmpPoint;
        this.fov.compute(this.pos, this.fovDistance);
        return true;
      case "OFFSCREEN":
        this.enterNewSubMap(newDirection.x, newDirection.y, tmpPoint);
    }
    return false;
  }

  enterNewSubMap(newX, newY, tmpPoint: geom.Point) {
    const [dx, dy] = [
      tmpPoint.getX() - this.getPos().x,
      tmpPoint.getY() - this.getPos().y,
    ];
    const x = this.getSubMapCoords().x;
    const y = this.getSubMapCoords().y;
    const smc = this.getSubMapCoords();
    if (newX > 0 && this.pos.x === this.subMap.getWidth() - 1) {
      //right
      const nm = this.setSubMap(new map.MapCoords(smc.x + 1, smc.y, smc.z));
      if (nm) {
        this.pos = new geom.Point(0, this.pos.getY() + dy);
      }
    } else if (newX < 0 && this.pos.x === 0) {
      //left
      const nm = this.setSubMap(new map.MapCoords(smc.x - 1, smc.y, smc.z));
      if (nm) {
        this.pos = new geom.Point(
          this.getSubMap().getWidth() - 1,
          this.pos.getY() + dy
        );
      }
    } else if (newY < 0 && this.pos.y === 0) {
      //up
      const nm = this.setSubMap(new map.MapCoords(smc.x, smc.y - 1, smc.z));
      if (nm) {
        this.pos = new geom.Point(
          this.pos.getX() + dx,
          this.getSubMap().getHeight() - 1
        );
      }
    } else if (newY > 0 && this.pos.y === this.subMap.getHeight() - 1) {
      //down
      const nm = this.setSubMap(new map.MapCoords(smc.x, smc.y + 1, smc.z));
      if (nm) {
        this.pos = new geom.Point(this.pos.getX() + dx, 0);
      }
    }

    this.fov = new fov.Fov(
      this.subMap.blocksLight,
      this.setVisiblePoint,
      this.getDistance
    );
    this.fov.compute(this.pos, this.fovDistance);

    console.log(
      `new subMap entered: ${this.getSubMapCoords().x}, ${
        this.getSubMapCoords().y
      } ${this.getSubMapCoords().z}}`
    );
    console.log(`position: ${this.pos.getX()}, ${this.getPos().y}`);
  }
}
