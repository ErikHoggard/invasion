import * as geom from "./geom";
import * as mapGenerator from "./mapGenerator";

export interface IMap {
  getWidth(): number;
  getHeight(): number;
  getLayer(): number;

  getTiles(): any[];
  getMapType(): string; //type, ie dungeon, forest, etc.
  getTileType(point: geom.Point): string;
  getEmptyTile(): geom.Point;
  setVisibleTile(point: geom.Point): void;
  isTileVisible(point: geom.Point): boolean;
  lastSeenTile(point: geom.Point): string;
  resetVisibility(): void;
  blocksLight(x: number, y: number): boolean;
}

export class TileMap implements IMap {
  visibleTiles: boolean[][];
  seenTiles: string[][];
  constructor(
    private tiles: any[],
    private layer: number,
    private type: string
  ) {
    this.type = type;
    this.layer = layer;
    this.blocksLight = this.blocksLight.bind(this);
    this.getTileType = this.getTileType.bind(this);
    this.setVisibleTile = this.setVisibleTile.bind(this);
    this.lastSeenTile = this.lastSeenTile.bind(this);
    this.isTileVisible = this.isTileVisible.bind(this);

    this.visibleTiles = [];
    this.seenTiles = [];

    this.resetVisibility();

    for (let y = 0; y < this.getHeight(); y++) {
      this.seenTiles[y] = [];
      for (let x = 0; x < this.getWidth(); x++) {
        this.seenTiles[y].push("");
      }
    }
  }

  public getTileType(point: geom.Point): string {
    if (this.tiles != undefined && this.tiles[point.getY()] != undefined) {
      return this.tiles[point.getY()][point.getX()];
    } else {
      return "#";
    }
  }

  public getMapType(): string {
    return this.type;
  }

  public getLayer(): number {
    return this.layer;
  }

  public getWidth(): number {
    return this.tiles[0].length;
  }

  public getHeight(): number {
    return this.tiles.length;
  }

  public getTileID(row: number, column: number): number {
    return row * this.getWidth() + column;
  }

  public getTiles(): any[] {
    return this.tiles;
  }

  public resetVisibility(): void {
    for (let y = 0; y < this.getHeight(); y++) {
      this.visibleTiles[y] = [];
      for (let x = 0; x < this.getWidth(); x++) {
        this.visibleTiles[y].push(false);
      }
    }
  }

  public setVisibleTile(point: geom.Point): void {
    if (this.inBounds(point)) {
      this.visibleTiles[point.getY()][point.getX()] = true;
      this.setLastSeenTile(point, this.getTileType(point));
    }
  }
  private setLastSeenTile(point: geom.Point, tile: string) {
    if (this.inBounds(point)) {
      this.seenTiles[point.getY()][point.getX()] = this.getTileType(point);
    }
  }

  public isTileVisible(point: geom.Point): boolean {
    if (this.inBounds(point)) {
      return this.visibleTiles[point.getY()][point.getX()];
    }
  }

  public lastSeenTile(point: geom.Point): string {
    if (this.inBounds(point)) {
      return this.seenTiles[point.getY()][point.getX()];
    }
  }

  private inBounds(point: geom.Point): boolean {
    return (
      point.getX() >= 0 &&
      point.getY() >= 0 &&
      point.getX() < this.getWidth() &&
      point.getY() < this.getHeight()
    );
    // return true;
  }

  public getEmptyTile(): geom.Point {
    let isEmpty: boolean = false;
    let point: geom.Point = new geom.Point(0, 0);
    while (!isEmpty) {
      let x = Math.floor(Math.random() * this.getWidth());
      let y = Math.floor(Math.random() * this.getHeight());
      point = new geom.Point(x, y);

      if (this.getTileType(point) === " ") {
        isEmpty = true;
      }
    }

    return point;
  }

  public blocksLight(x: number, y: number): boolean {
    let tile: string = this.getTileType(new geom.Point(x, y));
    if (tile === "#") {
      return true;
    } else {
      return false;
    }
  }
}

export class Branch {
  maps: IMap[];
  generator: mapGenerator.MapGenerator;
  name: string;
  width: number;
  height: number;
  depth: number;
  constructor(
    width: number,
    height: number,
    depth: number,
    generator: mapGenerator.MapGenerator
  ) {
    this.generator = generator;
    this.name = this.generator.getName();
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.maps = [];

    this.addFloor();
  }

  public getName(): string {
    return this.name;
  }

  public getMap(level: number): IMap {
    return this.maps[level];
  }

  public addFloor(): void {
    let firstFloor: TileMap;

    let tiles = this.generator.buildMap(this.width, this.height, 4);

    this.maps.push(
      new TileMap(tiles, this.maps.length, this.generator.getName())
    ); //+1
  }
}

export class World {
  branches: Branch[];
  constructor() {
    this.branches = [];
    this.branches.push(
      new Branch(60, 60, 4, new mapGenerator.ForestMapBuilder())
    );
  }

  public getBranch(name: string): Branch {
    for (let i = 0; i < this.branches.length; i++) {
      if (this.branches[i].getName() === name) {
        return this.branches[i];
      }
    }
  }

  public getMap(name: string, level: number): IMap {
    for (let i = 0; i < this.branches.length; i++) {
      if (this.branches[i].getName() === name) {
        return this.branches[i].getMap(level);
      }
    }
  }
}