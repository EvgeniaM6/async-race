import './sass/style.scss';
import App from './ts/App';

declare global {
  interface Window {
    app: App;
  }
}

console.log('hello');
window.app = new App();
