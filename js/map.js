import { GameEngine, Cell } from './game-engine.js';
import { get, create, add, Emitter } from "./common.js";

export class Map {
  constructor(engine) {
    this.engine = engine;
    this.visible = false;
    this.engine.onStart.call(()=>this.start());
    this.engine.onInit.call(()=>this.start());
    this.engine.onChange.call(()=>this.drawMap());
    this.engine.view.onChange.call(()=>this.drawView());

    this.arrows = [
      new Arrow('right', ()=> this.engine.view.moveRight()),
      new Arrow('left', ()=> this.engine.view.moveLeft()),
      new Arrow('up', ()=> this.engine.view.moveUp()),
      new Arrow('down', ()=> this.engine.view.moveDown())
    ];

    this.maxWidth = 2700;
    this.maxHeight = 2700;
    this.maxCellSize = 20;
    this.cellSize = 0;
    this.canvas = get("map");
    this.draw = this.canvas.getContext("2d");
    this.frame = get('map-frame');
    this.viewX = 0;
    this.viewY = 0;

    this.colors = [
      'rgb(150, 150, 250)', // closed
      'rgb(250, 0, 0)', // flag
      'rgb(200, 250, 200)', // empty
      'rgb(200, 250, 200)', // number
      'rgb(70, 70, 70)', // mine
      'rgb(110, 110, 250)'  // hint
    ];
  }

  start() {
    this.visible = this.engine.height > this.engine.view.height || this.engine.width > this.engine.view.width ? true : false;
    this.arrows.forEach(arr => arr.visible = this.visible);

    if(this.visible){
      this.frame.style.display = 'block';
      const cellWidth = this.maxWidth /this.engine.width;
      const cellHeight = this.maxHeight /this.engine.height;
      this.cellSize = Math.min(cellWidth, cellHeight, this.maxCellSize);
      this.canvas.height = this.engine.height * this.cellSize;
      this.canvas.width = this.engine.width * this.cellSize;
      this.frame.scrollTop = this.frame.scrollLeft = 0;
      this.drawMap();
      this.drawView();
    } else
      this.frame.style.display = 'none';
  }

  drawMap() {
    if(!this.visible) 
      return;
    this.draw.fillStyle = 'white';
    this.draw.fillRect(0, 0, this.canvas.width, this.canvas.height);
    //this.draw.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let top = 0; top < this.engine.height; top++) {
      for (let left = 0; left < this.engine.width; left++) {
        const cell =this.engine.getCell(top, left);
        this.draw.fillStyle = this.colors[cell.value];
        this.draw.fillRect(left * this.cellSize, top * this.cellSize, this.cellSize - 2, this.cellSize - 2);
      }
    }
    this.drawView();
  }

  drawView(){
    const width = this.engine.view.width * this.cellSize;
    const height = this.engine.view.height * this.cellSize;
    // clear view rectangle
    let line = 1.9;
    this.draw.beginPath();
    this.draw.lineWidth = line;
    this.draw.strokeStyle = 'white';
    this.draw.rect(this.viewX, this.viewY, width, height);
    this.draw.stroke();
    // draw view rectangle
    line = 1;
    this.viewX = this.engine.view.left * this.cellSize - 1;
    this.viewY = this.engine.view.top * this.cellSize - 1;
    this.draw.beginPath();
    this.draw.lineWidth = line;
    this.draw.strokeStyle = 'black';
    this.draw.rect(this.viewX, this.viewY, width, height);
    this.draw.stroke();
    // scroll
    if(this.viewY + height > this.frame.scrollTop + this.frame.clientHeight)
      this.frame.scrollTop += this.cellSize + line;
    if(this.viewY < this.frame.scrollTop)
      this.frame.scrollTop -= this.cellSize + line;
    if(this.viewX + height > this.frame.scrollLeft + this.frame.clientWidth)
      this.frame.scrollLeft += this.cellSize + line;
    if(this.viewX < this.frame.scrollLeft)
      this.frame.scrollLeft -= this.cellSize + line;
  }
}

class Arrow{
  constructor(id, action){
    this.id = id;
    this.action = action;
    this.btn = get(id);
    this.btn.onmousedown = ()=> this.mousedown();
    this.btn.onmouseup = ()=> clearInterval(this.timer);
    this.timer = 0;
    this.show = false;
  }

  mousedown() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.action();
    }, 50);
  }

  set visible(show){
    this.btn.style.display = show? 'flex':'none';
  }
}
