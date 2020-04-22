import * as geom from "./geom";
import * as mapGenerator from "./mapGenerator";

export interface IMap {
  getWidth(): number;
  getHeight(): number;

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
  constructor(private tiles: any[], private type: string) {
    this.type = type;
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
    if (
      this.tiles != undefined &&
      this.tiles[point.getY()] !== undefined &&
      this.tiles[point.getY()][point.getX()] !== undefined
    ) {
      return this.tiles[point.getY()][point.getX()];
    } else {
      return "OFFSCREEN";
    }
  }

  public getMapType(): string {
    return this.type;
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
    if (tile === "#" || tile === "OFFSCREEN") {
      return true;
    } else {
      return false;
    }
  }
}

export class MapCoords {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

export class Branch {
  maps: IMap[][][];
  generator: mapGenerator.MapGenerator;
  name: string;
  dimensions: MapCoords;
  tileWidth: number;
  tileHeight: number;
  depth: number;
  constructor(
    dimensions: MapCoords,
    width: number,
    height: number,
    generator: mapGenerator.MapGenerator
  ) {
    this.generator = generator;
    this.name = this.generator.getName();
    this.dimensions = dimensions;
    this.tileWidth = width;
    this.tileHeight = height;

    //create a 3D array of TileMaps based on the dimensions parameter
    this.maps = [...Array(dimensions.x + 1)].map((x) =>
      Array(dimensions.y + 1)
        .fill(this.createFloor())
        .map((x) => Array(dimensions.z + 1).fill(this.createFloor()))
    );

    //TODO: Connect the maps with doors/stairs
  }

  public getName(): string {
    return this.name;
  }

  public getMap(coords: MapCoords, currentCoords?: MapCoords): IMap {
    if (
      this.maps[coords.x] &&
      this.maps[coords.x][coords.y] &&
      this.maps[coords.x][coords.y][coords.z]
    ) {
      return this.maps[coords.x][coords.y][coords.z];
    } else if (currentCoords) {
      return this.maps[currentCoords.x][currentCoords.y][currentCoords.z];
    } else {
      throw new Error(
        "map.getMap returned undefined, and no currentCoords were passed."
      );
    }
  }

  public createFloor(): TileMap {
    let firstFloor: TileMap;

    let tiles = this.generator.buildMap(this.tileWidth, this.tileHeight, 3);

    return new TileMap(tiles, this.generator.getName());
  }
}

export class World {
  branches: Branch[];
  constructor() {
    this.branches = [];
    this.branches.push(
      new Branch(
        new MapCoords(2, 2, 0),
        50,
        50,
        new mapGenerator.ForestMapBuilder()
      )
    );
  }

  public getBranch(name: string): Branch {
    return this.branches.find((x) => x.getName() === name);
  }

  public getMap(name: string, coords: MapCoords): IMap {
    console.log(coords);
    console.log(this.branches.find((x) => x.getName() === name));
    return this.branches.find((x) => x.getName() === name).getMap(coords);
  }
}
