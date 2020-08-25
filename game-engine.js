
import { Emitter } from "./common.js";

export class GameEngine {
  constructor() {
    this.cells = [];
    this.height = 10;
    this.width = 10;
    this.mines = 10;
    this.flags = 10;
    this.superman = false;
    this.stopwatch = new Stopwatch();
    this.onStart = new Emitter();
    this.onInit = new Emitter();
    this.onWin = new Emitter();
    this.onLose = new Emitter();
    this.onFlag = new Emitter();
    this.onChange = new Emitter();
    this.view = new Viewport(this);
  }

  init() {
    this.stopwatch.stop();
    this.initCells();
    this.onInit.emit();
  }

  start() {
    this.flags = this.mines;
    this.initCells();
    this.initMines();
    this.initNumbers();
    this.stopwatch.start();
    this.onChange.emit();
    this.onStart.emit();
  }

  initCells() {
    this.cells = [];
    for (let top = 0; top < this.height; top++) {
      for (let left = 0; left < this.width; left++)
        this.cells.push(new Cell(top, left, this.superman));
    }
    this.view.init();
  }

  initMines() {
    for (let i = 0; i < this.mines; i++) {
      let tryAgain = true;
      while (tryAgain) {
        const ind = Math.floor(Math.random() * (this.cells.length - 1));
        if (this.cells[ind].isMine) tryAgain = true;
        else {
          this.cells[ind].isMine = true;
          tryAgain = false;
        }
      }
    }
  }

  initNumbers() {
    for (let cell of this.cells) {
      if (cell.isMine) {
        for (let neighbor of this.neighborsOf(cell))
          neighbor.number++;
      }
    }
  }

  openCell(cell) {
    if (cell.isOpen || cell.isFlag) return;
    cell.isOpen = true;
    if (cell.isMine) {
      this.lose();
      this.onChange.emit();
      return;
    }
    if (cell.isEmpty) this.openNeighborsOf(cell);
    if (this.isDemined) this.win();
    this.onChange.emit();
  }

  putFlag(cell) {
    if (cell.isOpen) return;
    if (cell.isFlag) {
      cell.isFlag = false;
      this.flags++;
    }
    else {
      if (this.flags === 0) {
        this.onFlag.emit();
      } else {
        cell.isFlag = true;
        this.flags--;
        if (!this.cells.some(cell => cell.isMine && !cell.isFlag))
          this.win();
      }
    }
    this.onChange.emit();
  }

  getCell(top, left) {
    if (top < 0 || top >= this.height || left < 0 || left >= this.width) return null;
    return this.cells[top * this.width + left];
  }

  *neighborsOf(cell) {
    for (let top = cell.top - 1; top <= cell.top + 1; top++) {
      for (let left = cell.left - 1; left <= cell.left + 1; left++) {
        const neighbor = this.getCell(top, left);
        if (neighbor === null || neighbor === cell || neighbor.isMine || neighbor.isFlag) continue;
        yield neighbor;
      }
    }
  }

  openNeighborsOf(cell) {
    var stack = [];
    stack.push(cell);
    while (stack.length) {
      cell = stack.pop();
      for (let nbr of this.neighborsOf(cell)) {
        if (!nbr.isOpen) {
          nbr.isOpen = true;
          if (nbr.isEmpty)
            stack.push(nbr);
        }
      }
    }
  }

  get isDemined() {
    const opened = this.cells.filter(cell => cell.isOpen).length;
    return opened === (this.height * this.width - this.mines) ? true : false;
  }

  lose() {
    for (let cell of this.cells)
      cell.isOpen = true;
    this.stopwatch.stop();
    this.onLose.emit();
  }

  win() {
    for (let cell of this.cells) {
      cell.isOpen = true;
      if (cell.isMine) cell.isFlag = true;
    }
    this.stopwatch.stop();
    this.onWin.emit();
  }
}

class Viewport {
  constructor(engine) {
    this.engine = engine;
    this.cells = [];
    this.height = this.width = 0;
    this.top = this.bottom = this.left = this.right = 0;
    this.onUpdate = new Emitter();
    this.init();
  }

  init() {
    this.height = this.engine.height < 10 ? this.engine.height : 10;
    this.width = this.engine.width < 10 ? this.engine.width : 10;
    this.top = this.left = 0;
    this.bottom = this.top + this.height - 1;
    this.right = this.left + this.width - 1;
    this.update();
  }

  update() {
    this.cells = [];
    for (let top = this.top; top <= this.bottom; top++) {
      for (let left = this.left; left <= this.right; left++) {
        this.cells.push(this.engine.getCell(top, left));
      }
    }
    this.onUpdate.emit();
  }

  moveRight() {
    if (this.right + 1 >= this.engine.width) return;
    this.left++;
    this.right++;
    this.update();
  }

  moveLeft() {
    if (this.left - 1 < 0) return;
    this.left--;
    this.right--;
    this.update();
  }

  moveDown() {
    if (this.bottom + 1 >= this.engine.height) return;
    this.top++;
    this.bottom++;
    this.update();
  }

  moveUp() {
    if (this.top - 1 < 0) return;
    this.top--;
    this.bottom--;
    this.update();
  }
}

export class Cell {
  static CLOSED = 0;
  static FLAG = 1;
  static EMPTY = 2;
  static NUMBER = 3;
  static MINE = 4;
  static HINT = 5;

  constructor(top = 0, left = 0, superman = false) {
    this.top = top;
    this.left = left;
    this.number = 0;
    this.isOpen = false;
    this.isMine = false;
    this.isFlag = false;
    this.superman = superman;
  }

  get isEmpty() {
    return !this.isMine && !this.isNumber;
  }

  get isNumber() {
    return this.number > 0;
  }

  get value() {
    if (this.isFlag) return Cell.FLAG;
    if (!this.isOpen){ 
      if(this.isMine && this.superman) return Cell.HINT;
      else return Cell.CLOSED;
    }
    if (this.isEmpty) return Cell.EMPTY;
    if (this.isNumber) return Cell.NUMBER;
    if (this.isMine) return Cell.MINE;
  }
}

export class Stopwatch {
  interval = 0;
  time = 0;
  onTick = null;

  start() {
    this.stop();
    this.time = 0;
    this.interval = window.setInterval(() => {
      this.time++;
      if (typeof this.onTick === 'function') this.onTick(this.time);
    }, 1000);
  }

  stop() {
    if (this.interval != 0) {
      window.clearInterval(this.interval);
      this.interval = 0;
    }
  }
}
