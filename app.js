import { GameEngine } from './game-engine.js';
import { Menu } from './menu.js';
import { Game } from "./game.js";
import { Alert } from "./alert.js";
import { get, create, add, Emitter } from "./common.js";
import { Map } from "./map.js";

const engine = new GameEngine();
const game = new Game(engine);
const menu = new Menu(engine);
const alert = new Alert(engine);
const map = new Map(engine);

engine.init();


