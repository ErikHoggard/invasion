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
  map: map.IMap;
  mapName: string;
  subMap: map.MapCoords;
  pos: geom.Point;

  getMap(): map.IMap;
  getMapName(): string;
  getSubMap(): map.MapCoords;
  getPos(): geom.Point;
}

export class Player implements Actor, ILocatable {
  mapName: string;
  map: map.IMap;
  subMap: map.MapCoords;
  pos: geom.Point;

  visiblePoints: geom.Point[];
  fov: fov.Fov;
  hp: number;
  speed: number;

  constructor(hp, speed, map) {
    this.setVisiblePoint = this.setVisiblePoint.bind(this);
    this.map = map;
    this.mapName = this.map.getMapType();
    this.subMap = new MapCoords(1, 1, 0); //TODO: don't hardcode this
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

  getSubMap(): map.MapCoords {
    return this.subMap;
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
