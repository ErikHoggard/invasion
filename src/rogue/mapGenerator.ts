export interface MapGenerator {
  buildMap(width: number, height: number, numberOfSteps: number): any[];
  getName(): string;
}

export class CaveMapBuilder implements MapGenerator {
  name: string;
  constructor() {
    this.name = "caves";
  }

  public getName(): string {
    return this.name;
  }

  public buildMap(
    width: number,
    height: number,
    numberOfSteps: number
  ): any[][] {
    let cellMap: any[][] = [];
    for (let i = 0; i < height; i++) {
      cellMap[i] = [];
      for (let j = 0; j < width; j++) {
        cellMap[i][j] = false;
      }
    }

    cellMap = this.initializeMap(width, height, cellMap);

    for (let i = 0; i < numberOfSteps; i++) {
      cellMap = this.doSimulationStep(width, height, cellMap);
    }

    for (let i in cellMap) {
      for (let j in cellMap[i]) {
        if (cellMap[i][j] === true) {
          cellMap[i][j] = "#";
        } else {
          cellMap[i][j] = " ";
        }
      }
    }
    return cellMap;
  }

  private initializeMap(
    width: number,
    height: number,
    map: boolean[][]
  ): boolean[][] {
    let chanceToStartAlive: number = 0.4;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (Math.random() < chanceToStartAlive) {
          map[x][y] = true;
        }
      }
    }
    return map;
  }

  private countAliveNeighbors(x: number, y: number, map: boolean[][]): number {
    let count = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        let neighbour_x: number = x + i;
        let neighbour_y: number = y + j;

        if (i === 0 && j === 0) {
          //don't do anything
        } else if (
          neighbour_x < 0 ||
          neighbour_y < 0 ||
          neighbour_x >= map.length ||
          neighbour_y >= map[0].length
        ) {
          count += 1;
        } else if (map[neighbour_x][neighbour_y]) {
          count += 1;
        }
      }
    }
    return count;
  }

  private doSimulationStep(
    width: number,
    height: number,
    oldMap: boolean[][]
  ): boolean[][] {
    let newMap: boolean[][] = [];
    let birthLimit: number = 4;
    let deathLimit: number = 3;

    for (let i = 0; i < height; i++) {
      newMap[i] = [];
      for (let j = 0; j < width; j++) {
        newMap[i][j] = false;
      }
    }

    for (let x = 0; x < oldMap.length; x++) {
      for (let y = 0; y < oldMap[0].length; y++) {
        let nbs: number = this.countAliveNeighbors(x, y, oldMap);

        if (oldMap[x][y] === true) {
          if (nbs < deathLimit) {
            newMap[x][y] = false;
          } else {
            newMap[x][y] = true;
          }
        } else {
          if (nbs > birthLimit) {
            newMap[x][y] = true;
          } else {
            newMap[x][y] = false;
          }
        }
      }
    }

    return newMap;
  }
}

export class ForestMapBuilder implements MapGenerator {
  name: string;
  constructor() {
    this.name = "forest";
  }

  public getName(): string {
    return this.name;
  }

  public buildMap(
    width: number,
    height: number,
    numberOfSteps: number
  ): any[][] {
    let cellMap: any[][] = [];
    for (let i = 0; i < height; i++) {
      cellMap[i] = [];
      for (let j = 0; j < width; j++) {
        cellMap[i][j] = false;
      }
    }

    cellMap = this.initializeMap(width, height, cellMap);

    for (let i = 0; i < numberOfSteps; i++) {
      cellMap = this.doSimulationStep(width, height, cellMap);
    }

    for (let i in cellMap) {
      for (let j in cellMap[i]) {
        if (cellMap[i][j] === true) {
          cellMap[i][j] = " ";
        } else {
          cellMap[i][j] = "#";
        }
      }
    }
    return cellMap;
  }

  private initializeMap(
    width: number,
    height: number,
    map: boolean[][]
  ): boolean[][] {
    let chanceToStartAlive: number = 0.4;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (Math.random() < chanceToStartAlive) {
          map[x][y] = true;
        }
      }
    }
    return map;
  }

  private countAliveNeighbors(x: number, y: number, map: boolean[][]): number {
    let count = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        let neighbour_x: number = x + i;
        let neighbour_y: number = y + j;

        if (i === 0 && j === 0) {
          //don't do anything
        } else if (
          neighbour_x < 0 ||
          neighbour_y < 0 ||
          neighbour_x >= map.length ||
          neighbour_y >= map[0].length
        ) {
          count += 1;
        } else if (map[neighbour_x][neighbour_y]) {
          count += 1;
        }
      }
    }
    return count;
  }

  private doSimulationStep(
    width: number,
    height: number,
    oldMap: boolean[][]
  ): boolean[][] {
    let newMap: boolean[][] = [];
    let birthLimit: number = 3;
    let deathLimit: number = 3;

    for (let i = 0; i < height; i++) {
      newMap[i] = [];
      for (let j = 0; j < width; j++) {
        newMap[i][j] = false;
      }
    }

    for (let x = 0; x < oldMap.length; x++) {
      for (let y = 0; y < oldMap[0].length; y++) {
        let nbs: number = this.countAliveNeighbors(x, y, oldMap);

        if (oldMap[x][y] === true) {
          if (nbs < deathLimit) {
            newMap[x][y] = false;
          } else {
            newMap[x][y] = true;
          }
        } else {
          if (nbs > birthLimit) {
            newMap[x][y] = true;
          } else {
            newMap[x][y] = false;
          }
        }
      }
    }

    return newMap;
  }
}
