import DataBase from './DataBase';
import Footer from './Footer';
import Game from './Game';
import View from './View';

export default class App {
  dataBase: DataBase;
  game: Game;
  view: View;
  footer: Footer;

  constructor() {
    this.dataBase = new DataBase();
    this.game = new Game();
    this.view = new View();
    this.footer = new Footer();
  }

  start(): void {
    this.view.start();
  }
}
