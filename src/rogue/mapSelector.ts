import * as map from "./map";
import * as geom from "./geom";

export class MapSelector {
  map: map.IMap;
  mapWidth: number;
  mapHeight: number;
  tiles: any[];
  constructor(map: map.IMap) {
    this.map = map;
    this.mapWidth = this.map.getWidth();
    this.mapHeight = this.map.getHeight();
    this.tiles = this.map.getTiles();
  }

  //TODO load multiple maps, only display the active map

  public getSubMapTiles(
    radius: number,
    centerX: number,
    centerY: number
  ): any[] {
    let subMapTiles: any[] = [];
    for (let y = centerY - radius; y < centerY + radius + 1; y++) {
      let subMapRow: any[] = [];
      if (y < 0 || y >= this.mapHeight) {
        //a whole row of wall tiles
        for (let i = 0; i < 2 * radius + 1; i++) {
          subMapRow.push("");
        }
      } else {
        for (let x = centerX - radius; x < centerX + radius + 1; x++) {
          if (x < 0 || x >= this.mapWidth) {
            subMapRow.push("");
          } else {
            let tilePoint = new geom.Point(x, y);
            subMapRow.push(this.map.getTileType(tilePoint));
          }
        }
      }
      subMapTiles.push(subMapRow);
    }
    return subMapTiles;
  }

  //TODO get relative positions of other entities ??? or maybe not in this class
}
