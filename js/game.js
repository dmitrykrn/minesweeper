import { GameEngine, Cell } from './game-engine.js';
import { get, create, add, Emitter } from "./common.js";

export class Game {
  constructor(engine) {
    this.engine = engine;
    this.cells = [];
    this.cellClass = ['closed', 'flag', 'empty', 'number', 'mine', 'hint'];

    this.engine.stopwatch.onTick = (time)=>this.tick(time);
    this.engine.onStart.call(()=>this.start());
    this.engine.onInit.call(()=>this.start());
    this.engine.onChange.call(()=>this.updateField());
    this.engine.view.onChange.call(()=>this.updateField());

    this.field = get('field');
    this.flags = get('flags');
    this.time = get('time');
    get('new').onclick = () => engine.init();
  }

  start() {
    this.initField();
    this.updateField();
  }

  initField() {
    this.cells = [];
    this.field.innerHTML = '';
    const view = this.engine.view;
    for (let top = view.top; top <= view.bottom; top++) {
      const row = create('div');
      row.style.display = 'flex';
      add(this.field, row);
      for (let left = view.left; left <= view.right; left++) {
        const cell = create('div');
        const ind = this.cells.push(cell) - 1;
        cell.className = 'cell';
        cell.onclick = this.cellClick.bind(this, ind);
        cell.oncontextmenu = this.cellClick.bind(this, ind);
        cell.onselectstart = () => event.preventDefault();
        add(row, cell);
      }
    }
  }

  cellClick(ind) {
    const model = this.engine.view.cells[ind];
    event.preventDefault();
    if (event.button === 0 && event.shiftKey || event.button === 2)
      this.engine.putFlag(model);
    else
      this.engine.openCell(model);
  }

  updateField() {
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      const model = this.engine.view.cells[i];
      cell.className = this.cellClass[model.value];
      cell.innerHTML = model.value === Cell.NUMBER ? model.number : '';
    }
    this.flags.innerHTML = this.engine.flags;
  }

  tick(time) {
    const date = new Date(0, 0, 0, 0, 0, time);
    const options = { minute: 'numeric', second: 'numeric' };
    this.time.innerHTML = new Intl.DateTimeFormat("en-US", options).format(date);
  }
}
