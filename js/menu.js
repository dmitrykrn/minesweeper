import { get } from "./common.js";

export class Menu {
  constructor(engine){
    this.engine = engine;

    this.form = new VForm('start', 'highlight')
      .add('width', w => w >= 3 && w <= 300)
      .add('height', h => h >= 3 && h <= 300)
      .add('mines', m => m > 0 && m < this.form.height.val * this.form.width.val)
      .add('superman');
    this.form.onSubmit = ()=> this.submit();

    this.menu = get('menu');
    this.engine.onInit.add(()=> this.menu.style.display = 'flex');
  }

  submit(){
    this.engine.height = +this.form.height.val;
    this.engine.width = +this.form.width.val;
    this.engine.mines = +this.form.mines.val;
    this.engine.superman = this.form.superman.val;
    this.engine.start();
    this.menu.style.display = 'none';
  }
}

class VForm {
  constructor(submitId, highlight){
    this.fields = [];
    this.submit = get(submitId);
    this.highlight = highlight;
    this.onSubmit = ()=>{};
    this.submit.onclick = ()=> this.onSubmit();
    this.enabled = false;
  }

  add(id, predicate = ()=>true){
    const field = new VField(id, predicate);
    field.onChange = ()=> this.onChange();
    this.fields.push(field);
    this[id] = field;
    return this;
  }

  onChange(){
    this.enabled = true;
    for(let field of this.fields){
      if (!field.valid) 
        field.elm.className = this.highlight;
      else 
        field.elm.className = field.elm.className.replace(this.highlight, '');
      this.enabled = this.enabled && field.valid;
    }
    this.submit.disabled = !this.enabled;
  }

  val(id){
    return this.fields.find(field => field.id === id).val;
  }
}

class VField {
  constructor(id, predicate){
    this.id = id;
    this.predicate = predicate;
    this.onChange = ()=>{};
    this.elm = get(id);
    //this.elm.onchange = ()=> this.onChange();
    this.elm.oninput = ()=> this.onChange();
  }

  get valid(){
    return this.predicate(this.val);
  }

  get val(){
    if(this.elm.type == 'checkbox') return this.elm.checked;
    return this.elm.value;
  }
}
