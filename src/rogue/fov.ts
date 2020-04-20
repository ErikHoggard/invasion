//see  http://www.adammil.net/blog/v125_Roguelike_Vision_Algorithms.html#mycode
import * as geom from "./geom";

export class Fov {
  _blocksLight: Function;
  _setVisible: Function;
  getDistance: Function;
  constructor(
    blocksLight: Function,
    setVisible: Function,
    getDistance: Function
  ) {
    this._blocksLight = blocksLight;
    this._setVisible = setVisible;
    this.getDistance = getDistance;
  }

  public compute(
    origin: geom.Point,
    rangeLimit: number,
    octant?: number,
    x?: number,
    top?: Slope,
    bottom?: Slope
  ): void {
    //I think TS supports some sort of method overloading, but this if statement works for now ig
    if (!octant && !x && !top && !bottom) {
      this._setVisible(origin.getX(), origin.getY());
      for (let octant: number = 0; octant < 8; octant++) {
        this.compute(
          origin,
          rangeLimit,
          octant,
          1,
          new Slope(1, 1),
          new Slope(0, 1)
        );
      }
    } else {
      for (; x <= rangeLimit; x++) {
        let topY: number;
        if (top.getX() === 1) {
          topY = x;
        } else {
          topY = Math.floor(
            ((x * 2 - 1) * top.getY() + top.getX()) / (top.getX() * 2)
          );
          if (this.blocksLight(x, topY, octant, origin)) {
            if (
              top.greaterOrEqual(topY * 2 + 1, x * 2) &&
              !this.blocksLight(x, topY + 1, octant, origin)
            ) {
              topY++;
            }
          } else {
            let ax: number = x * 2;
            if (this.blocksLight(x + 1, topY + 1, octant, origin)) {
              ax++;
            }
            if (top.greater(topY * 2 + 1, ax)) {
              topY++;
            }
          }
        }

        let bottomY: number;
        if (bottom.getY() === 0) {
          bottomY = 0;
        } else {
          bottomY = Math.floor(
            ((x * 2 - 1) * bottom.getY() + bottom.getX()) / (bottom.getX() * 2)
          );
          if (
            bottom.greaterOrEqual(bottomY * 2 + 1, x * 2) &&
            this.blocksLight(x, bottomY, octant, origin) &&
            !this.blocksLight(x, bottomY + 1, octant, origin)
          ) {
            bottomY++;
          }
        }

        let wasOpaque: number = -1; //0:false, 1:true, -1:n/a
        for (let y: number = topY; y >= bottomY; y--) {
          if (rangeLimit < 0 || this.getDistance(x, y) <= rangeLimit) {
            let isOpaque: boolean = this.blocksLight(x, y, octant, origin);
            let isVisible: boolean =
              isOpaque ||
              ((y != topY || top.greater(y * 4 - 1, x * 4 + 1)) &&
                (y != bottomY || bottom.less(y * 4 + 1, x * 4 - 1)));
            if (isVisible === true) {
              this.setVisible(x, y, octant, origin);
            }
            if (x != rangeLimit) {
              if (isOpaque === true) {
                if (wasOpaque === 0) {
                  let nx: number = x * 2;
                  let ny: number = y * 2 + 1;
                  if (this.blocksLight(x, y + 1, octant, origin)) {
                    nx--;
                  }
                  if (top.greater(ny, nx)) {
                    if (y === bottomY) {
                      bottom = new Slope(ny, nx);
                      break;
                    } else {
                      this.compute(
                        origin,
                        rangeLimit,
                        octant,
                        x + 1,
                        top,
                        new Slope(ny, nx)
                      );
                    }
                  } else {
                    if (y === bottomY) {
                      return; //end of recursion
                    }
                  }
                }
                wasOpaque = 1;
              } else {
                if (wasOpaque > 0) {
                  let nx: number = x * 2;
                  let ny: number = y * 2 + 1;
                  if (this.blocksLight(x + 1, y + 1, octant, origin)) {
                    nx++;
                  }
                  if (bottom.greaterOrEqual(ny, nx)) {
                    return;
                  }
                  top = new Slope(ny, nx);
                }
                wasOpaque = 0;
              }
            }
          }
        }
        if (wasOpaque !== 0) {
          break;
        }
      }
    }
  }

  private blocksLight(
    x: number,
    y: number,
    octant: number,
    origin: geom.Point
  ): boolean {
    let nx: number = origin.getX();
    let ny: number = origin.getY();

    switch (octant) {
      case 0:
        nx += x;
        ny -= y;
        break;
      case 1:
        nx += y;
        ny -= x;
        break;
      case 2:
        nx -= y;
        ny -= x;
        break;
      case 3:
        nx -= x;
        ny -= y;
        break;
      case 4:
        nx -= x;
        ny += y;
        break;
      case 5:
        nx -= y;
        ny += x;
        break;
      case 6:
        nx += y;
        ny += x;
        break;
      case 7:
        nx += x;
        ny += y;
        break;
    }
    return this._blocksLight(nx, ny);
  }

  private setVisible(
    x: number,
    y: number,
    octant: number,
    origin: geom.Point
  ): void {
    let nx: number = origin.getX();
    let ny: number = origin.getY();

    switch (octant) {
      case 0:
        nx += x;
        ny -= y;
        break;
      case 1:
        nx += y;
        ny -= x;
        break;
      case 2:
        nx -= y;
        ny -= x;
        break;
      case 3:
        nx -= x;
        ny -= y;
        break;
      case 4:
        nx -= x;
        ny += y;
        break;
      case 5:
        nx -= y;
        ny += x;
        break;
      case 6:
        nx += y;
        ny += x;
        break;
      case 7:
        nx += x;
        ny += y;
        break;
    }
    return this._setVisible(nx, ny);
  }
}

class Slope {
  x: number;
  y: number;
  constructor(y: number, x: number) {
    this.x = x;
    this.y = y;
  }

  public greater(y: number, x: number): boolean {
    return this.y * x > this.x * y;
  }
  public greaterOrEqual(y: number, x: number) {
    return this.y * x >= this.x * y;
  }
  public less(y: number, x: number) {
    return this.y * x < this.x * y;
  }
  public getX(): number {
    return this.x;
  }
  public getY(): number {
    return this.y;
  }
}
