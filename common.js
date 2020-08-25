
export function get(elmId){
  return document.querySelector('#'+elmId);
}

export function create(name){
  return document.createElement(name);
}

export function add(parent, child){
  parent.appendChild(child);
}

export class Emitter{
  constructor(){
    this.handlers = [];
  }
  add(handler){
    this.handlers.push(handler);
  }
  emit(value){
    for(let handler of this.handlers)
      queueMicrotask(()=>handler(value));
  }
}