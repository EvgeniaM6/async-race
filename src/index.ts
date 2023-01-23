import './sass/style.scss';
import App from './ts/components/App';

declare global {
  interface Window {
    app: App;
  }
}

window.app = new App();
window.app.start();
