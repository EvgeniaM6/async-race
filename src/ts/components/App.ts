import DataBase from './DataBase';
import Game from './Game';
import View from './View';

export default class App {
  dataBase: DataBase;
  game: Game;
  view: View;

  constructor() {
    this.dataBase = new DataBase();
    this.game = new Game();
    this.view = new View();
  }

  start(): void {
    this.view.start();
  }
}
