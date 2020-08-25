import { get, create, add, Emitter } from "./common.js";

export class Alert{
  constructor(engine) {
    this.engine = engine;
    this.alert = get('alert');
    this.msg = get('msg');
    this.engine.onWin.add(this.win.bind(this));
    this.engine.onLose.add(this.lose.bind(this));
    this.engine.onFlag.add(this.flag.bind(this));
  }

  win(){
    this.open();
    this.msg.innerText = `Congratulations, you WIN!`;
  }

  lose(){
    this.open();
    this.msg.innerText = 'Sorry, you LOST.';
  }

  flag(){
    this.open();
    this.msg.innerText = 'Sorry, no flags left.';
  }

  validation(){
    this.open();
    this.msg.innerText = 'Sorry, your input is not valid!';
  }

  open(){
    this.alert.style.display = 'flex';
    setTimeout(()=>{
      this.alert.style.display = 'none';
    }, 2000);
  }
}