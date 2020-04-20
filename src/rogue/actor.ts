import * as geom from "./geom";
import * as map from "./map";
import * as fov from "./fov";

export interface Actor {
  move(newDirection: geom.Point): boolean;
  getPos(): geom.Point;
  getMap(): map.IMap;
  getFov(): geom.Point[];
  setVisiblePoint(x: number, y: number): void;

  map: map.IMap;
  mapName: string;
  fov: fov.Fov;
  visiblePoints: geom.Point[];
  pos: geom.Point;
  mapLevel: number;
  hp: number;
  speed: number;
}

export class Player implements Actor {
  map: map.IMap;
  mapName: string;
  visiblePoints: geom.Point[];
  pos: geom.Point;

  fov: fov.Fov;
  mapLevel: number;
  hp: number;
  speed: number;
  constructor(hp, speed, map) {
    this.setVisiblePoint = this.setVisiblePoint.bind(this);
    this.map = map;
    this.mapLevel = this.map.getLayer();
    this.mapName = this.map.getMapType();
    this.hp = hp;
    this.speed = speed;
    this.fov = new fov.Fov(
      this.map.blocksLight,
      this.setVisiblePoint,
      this.getDistance
    );
    this.visiblePoints = [];
    this.pos = this.map.getEmptyTile();
    this.fov.compute(this.pos, 10);
  }
  getPos(): geom.Point {
    return this.pos;
  }
  getMap(): map.IMap {
    return this.map;
  }

  getFov(): geom.Point[] {
    return this.visiblePoints;
  }

  setVisiblePoint(x: number, y: number): void {
    let point: geom.Point = new geom.Point(x, y);
    this.visiblePoints.push(point);
    this.map.setVisibleTile(point); //for player only
  }

  getDistance(x: number, y: number): number {
    return Math.floor(Math.sqrt(x * x + y * y));
  }

  getMapLevel(): number {
    return this.mapLevel;
  }

  getMapName(): string {
    return this.mapName;
  }

  move(newDirection: geom.Point): boolean {
    this.visiblePoints = [];
    this.map.resetVisibility();
    let tmpPoint: geom.Point = this.pos.clone();
    tmpPoint.x += newDirection.x;
    tmpPoint.y += newDirection.y;

    let tile: string = this.map.getTileType(tmpPoint);
    switch (tile) {
      case " ":
        this.pos = tmpPoint;
        this.fov.compute(this.pos, 10);
        return true;
        break;
    }
    return false;
  }
}
