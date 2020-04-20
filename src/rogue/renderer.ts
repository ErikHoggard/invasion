import * as geom from "./geom";

export interface IMapRenderer {
  draw(layers: any[]): void;
  drawTile(
    column: number,
    row: number,
    currentTile: string,
    effects: number[]
  ): void;
  clearMap(): void;
}

export class CanvasMapRenderer implements IMapRenderer {
  target: CanvasRenderingContext2D;
  constructor(
    private canvas: HTMLCanvasElement,
    private tileRect: geom.Rectangle
  ) {
    this.target = this.canvas.getContext("2d");
  }

  public draw(layers: RenderLayer[]): void {
    this.clearMap();
    for (let i in layers) {
      let layer: RenderLayer = layers[i];
      let tiles = layer.getTiles();
      let effects = layer.getEffects();

      let row: number;
      let column: number;
      let total: number = tiles.length;
      let rowWidth: number = tiles[0].length;
      let currentTile: string;

      for (row = 0; row < total; row++) {
        for (column = 0; column < rowWidth; column++) {
          currentTile = tiles[row][column];
          this.drawTile(column, row, currentTile, effects);
        }
      }
    }
  }

  public drawTile(
    column: number,
    row: number,
    currentTile: string,
    effects: number[]
  ): void {
    //change tileRect's x,y pos
    this.tileRect.x = column * this.tileRect.width;
    this.tileRect.y = row * this.tileRect.height;
    //draw tile to canvas
    if (currentTile !== "") {
      this.target.fillStyle = this.tileColor(currentTile);

      if (effects.length > 0) {
        for (let j in effects) {
          let effect: number = effects[j];
          switch (effect) {
            case Effects.Fog:
              this.target.fillStyle = this.shadeColor2(
                this.target.fillStyle,
                -0.65
              );
              break;
          }
        }
      }

      this.target.fillRect(
        this.tileRect.x,
        this.tileRect.y,
        this.tileRect.width,
        this.tileRect.height
      );
      //draw outline
      this.target.strokeStyle = "black";
      this.target.strokeRect(
        this.tileRect.x,
        this.tileRect.y,
        this.tileRect.width,
        this.tileRect.height
      );
    }
  }

  public clearMap(): void {
    this.canvas.width = this.canvas.width;
  }

  private tileColor(value: string): string {
    switch (value) {
      case "#":
        return "#2b303b";
        break;
      case " ":
        return "#e4e4e4";
        break;
      case "@":
        return "#ff503a";
        break;
      default:
        return "#000000";
    }
  }

  private shadeColor2(color, percent): string {
    var f = parseInt(color.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent,
      R = f >> 16,
      G = (f >> 8) & 0x00ff,
      B = f & 0x0000ff;
    return (
      "#" +
      (
        0x1000000 +
        (Math.round((t - R) * p) + R) * 0x10000 +
        (Math.round((t - G) * p) + G) * 0x100 +
        (Math.round((t - B) * p) + B)
      )
        .toString(16)
        .slice(1)
    );
  }

  private blendColors(c0, c1, p): string {
    var f = parseInt(c0.slice(1), 16),
      t = parseInt(c1.slice(1), 16),
      R1 = f >> 16,
      G1 = (f >> 8) & 0x00ff,
      B1 = f & 0x0000ff,
      R2 = t >> 16,
      G2 = (t >> 8) & 0x00ff,
      B2 = t & 0x0000ff;
    return (
      "#" +
      (
        0x1000000 +
        (Math.round((R2 - R1) * p) + R1) * 0x10000 +
        (Math.round((G2 - G1) * p) + G1) * 0x100 +
        (Math.round((B2 - B1) * p) + B1)
      )
        .toString(16)
        .slice(1)
    );
  }
}

export class RenderLayer {
  tiles: any[];
  effects: number[];
  constructor(tiles: any[], effects: number[]) {
    this.tiles = tiles;
    this.effects = effects;
  }

  public getTiles(): any[] {
    return this.tiles;
  }

  public getEffects(): number[] {
    return this.effects;
  }
}

export enum Effects {
  Fog = 1,
}
