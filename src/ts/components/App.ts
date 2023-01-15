import DataBase from './DataBase';
import Game from './Game';

export default class App {
  dataBase: DataBase;
  game: Game;

  constructor() {
    this.dataBase = new DataBase();
    this.game = new Game();
  }
}
