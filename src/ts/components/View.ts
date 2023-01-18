import { carActs, carTemplate, inputTypes, limitCarsPerPage, mssInSec, pages, statuses } from '../constants';
import { ICarObj, IUpdInputElements } from '../models';
import { createElem } from '../utilities';

export default class View {
  main: HTMLElement = createElem('main', 'main');
  page = '';
  selectedId = 0;
  garageTotal = createElem('span', 'garage__title') as HTMLElement;
  garagePageNum = createElem('span', 'garage__page-num') as HTMLElement;
  carsBlock = createElem('div', 'garage__cars cars') as HTMLElement;
  currentPage = 1;
  totalCars = 0;
  cars: ICarObj[] = [];
  updateInputs: IUpdInputElements = {};
  carImageArr: HTMLElement[] = [];

  start(): void {
    this.drawApp();
    this.drawGarage();
  }

  drawApp(): void {
    const body = document.querySelector('body');
    const appContainer = createElem('div', 'app', body);

    const header = createElem('header', 'header', appContainer);
    const navigationBlock = createElem('nav', 'nav', header);
    const garageBtn = createElem('button', 'nav__button btn-garage', navigationBlock, 'to garage') as HTMLButtonElement;
    const winnersBtn = createElem(
      'button',
      'nav__button btn-winners',
      navigationBlock,
      'to winners'
    ) as HTMLButtonElement;
    garageBtn.addEventListener('click', () => this.drawGarage());
    winnersBtn.addEventListener('click', () => this.drawWinners());

    appContainer?.append(this.main);
  }

  clearPage(): void {
    this.main.innerHTML = '';
  }

  drawGarage(): void {
    if (this.page === pages.garage) return;
    this.page = pages.garage;
    this.clearPage();

    const manageBlock = createElem('div', 'manage', this.main) as HTMLElement;
    Object.values(carActs).forEach((titleBlock) => {
      this.drawFormElement(titleBlock, manageBlock);
    });

    this.drawManageButtons(manageBlock);

    const garageBlock = createElem('div', 'garage', this.main) as HTMLElement;
    const garageTitle = createElem('div', 'garage__title', garageBlock) as HTMLElement;
    createElem('span', 'garage__title', garageTitle, 'Garage (') as HTMLElement;
    garageTitle.append(this.garageTotal);
    createElem('span', 'garage__title', garageTitle, ')') as HTMLElement;

    const garagePage = createElem('div', 'garage__page', garageBlock) as HTMLElement;
    createElem('span', 'garage__page-text', garagePage, 'Page #') as HTMLElement;
    garagePage.append(this.garagePageNum);

    garageBlock.append(this.carsBlock);

    const pageBtnsBlock = createElem('div', 'page-btns', this.main) as HTMLElement;
    const pageBtnPrev = createElem('button', 'page-btns__prev page-btn', pageBtnsBlock, 'prev ←') as HTMLButtonElement;
    pageBtnPrev.addEventListener('click', () => this.changePage());
    const pageBtnNext = createElem('button', 'page-btns__next page-btn', pageBtnsBlock, '→ next') as HTMLButtonElement;
    pageBtnNext.addEventListener('click', () => this.changePage(true));

    this.updateGarage();
  }

  drawFormElement(blockTitle: string, parent: HTMLElement): void {
    const block = createElem('div', `manage__${blockTitle} ${blockTitle}`, parent) as HTMLElement;
    const form = createElem('form', `${blockTitle}-form`, block) as HTMLFormElement;

    const titleInput = createElem('input', `${blockTitle}-form__title`, form) as HTMLInputElement;
    titleInput.type = inputTypes.text;
    if (blockTitle === carActs.update) {
      titleInput.disabled = !this.selectedId;
      this.updateInputs.textInput = titleInput;
    }

    const colorInput = createElem('input', `${blockTitle}-form__color`, form) as HTMLInputElement;
    colorInput.type = inputTypes.color;
    if (blockTitle === carActs.update) {
      colorInput.disabled = !this.selectedId;
      if (this.selectedId) {
        window.app.dataBase.getCar(this.selectedId).then((resp) => {
          if (!resp) return;
          titleInput.value = resp.name;
          colorInput.value = resp.color;
        });
      }
      this.updateInputs.colorInput = colorInput;
    }

    const button = createElem('button', `${blockTitle}__button`, block, blockTitle) as HTMLButtonElement;
    if (blockTitle === carActs.update) {
      if (this.selectedId) {
        button.classList.add('active');
      }
      this.updateInputs.button = button;
    }
    const isCreate = blockTitle === carActs.create;
    button.addEventListener('click', () => this.setCar(form, isCreate));
  }

  drawManageButtons(parent: HTMLElement): void {
    const manageBtns = createElem('div', 'manage__buttons mng-btns') as HTMLElement;

    const manageAllCarsBlock = createElem('div', 'mng-btns__all', manageBtns) as HTMLElement;
    const raceBtn = createElem('button', `btn-race`, manageAllCarsBlock, 'race') as HTMLButtonElement;
    raceBtn.addEventListener('click', () => this.race());
    const resetBtn = createElem('button', `btn-reset`, manageAllCarsBlock, 'reset') as HTMLButtonElement;
    resetBtn.addEventListener('click', () => this.reset());

    const generateBtn = createElem('button', `mng-btns-generate`, manageBtns, 'generate') as HTMLButtonElement;
    generateBtn.addEventListener('click', () => this.generateCars());

    parent.append(manageBtns);
  }

  drawCars(): void {
    this.carsBlock.innerHTML = '';
    this.carImageArr = [];
    this.cars.forEach((car) => {
      const carBlock = createElem('div', 'car') as HTMLElement;
      if (car.id === this.selectedId) {
        carBlock.classList.add('selected');
      }

      const settingsBlock = createElem('div', 'car__settings', carBlock) as HTMLElement;
      const settingsBtns = createElem('div', 'car__settings-btns car-btns', settingsBlock) as HTMLElement;
      const selectBtn = createElem('button', 'car-btns__select', settingsBtns, 'select') as HTMLElement;
      selectBtn.addEventListener('click', () => this.selectCar(car, carBlock));
      const removeBtn = createElem('button', 'car-btns__remove', settingsBtns, 'remove') as HTMLElement;
      removeBtn.addEventListener('click', () => this.removeCar(car.id));
      createElem('div', 'car__title', settingsBlock, car.name) as HTMLElement;

      const manageBlock = createElem('div', 'car__manage', carBlock) as HTMLElement;
      const manageBtns = createElem('div', 'car__manage-btns drive-btns', manageBlock) as HTMLElement;
      const startBtn = createElem('button', 'drive-btns__start', manageBtns, 'go!') as HTMLElement;
      const stopBtn = createElem('button', 'drive-btns__stop', manageBtns, 'return') as HTMLElement;

      const carImageBlock = createElem('div', 'car__image-block', manageBlock);
      const carImage = createElem('div', 'car__image', carImageBlock);
      carImage.innerHTML = carTemplate;
      const svg = carImage.querySelector('.car-svg') as SVGElement;
      if (svg) {
        svg.style.fill = car.color;
        startBtn.addEventListener('click', () => this.startCar(car, carImage));
        stopBtn.addEventListener('click', () => this.stopCar(car, carImage));
      }

      this.carImageArr.push(carImage);
      this.carsBlock.append(carBlock);
    });
  }

  selectCar(car: ICarObj, carBlock: HTMLElement): void {
    this.selectedId = car.id;
    if (this.updateInputs.textInput && this.updateInputs.colorInput && this.updateInputs.button) {
      this.updateInputs.textInput.disabled = this.updateInputs.colorInput.disabled = false;
      this.updateInputs.textInput.value = car.name;
      this.updateInputs.colorInput.value = car.color;
      this.updateInputs.button.classList.add('active');
    }
    carBlock.classList.add('selected');
  }

  removeCar(carId: number): void {
    window.app.dataBase.deleteCar(carId).then(() => this.updateGarage());
  }

  startCar(car: ICarObj, carImage: HTMLElement): void {
    window.app.game.startCar(car.id, carImage);
  }

  stopCar(car: ICarObj, carImage: HTMLElement): void {
    carImage.classList.remove('drive');
    carImage.classList.remove('pause');
    window.app.dataBase.createEnginePromise(car.id, statuses.stopped);
  }

  drawWinners(): void {
    if (this.page === pages.winners) return;
    this.page = pages.winners;
    this.clearPage();
  }

  setCar(formEl: HTMLFormElement, isCreate: boolean): void {
    const [titleInputEl, colorInputEl] = Object.values(formEl.elements) as HTMLInputElement[];
    const [titleValue, colorValue] = [titleInputEl, colorInputEl].map(
      (inputEl): string => (inputEl as HTMLInputElement).value
    );

    if (isCreate) {
      this.createCar(titleValue, colorValue, titleInputEl);
    } else if (this.selectedId) {
      this.updateCar(titleValue, colorValue, titleInputEl, colorInputEl);
    }
  }

  createCar(name: string, color: string, titleInputEl: HTMLInputElement): void {
    window.app.dataBase.createCar(name, color).then(() => {
      this.updateGarage();
      titleInputEl.value = '';
    });
  }

  updateCar(name: string, color: string, titleInputEl: HTMLInputElement, colorInputEl: HTMLInputElement): void {
    window.app.dataBase.updateCar(this.selectedId, name, color).then(() => {
      this.updateGarage();
      titleInputEl.value = '';
      colorInputEl.value = '#000000';
      this.selectedId = 0;
      titleInputEl.disabled = true;
      colorInputEl.disabled = true;
      if (this.updateInputs.button) {
        this.updateInputs.button.classList.remove('active');
      }
    });
  }

  updateGarage(): void {
    window.app.dataBase.getCars(this.currentPage, limitCarsPerPage).then((resp) => {
      this.cars = resp.carsArr;
      this.totalCars = resp.total;
      this.garageTotal.textContent = `${resp.total}`;
      this.garagePageNum.textContent = `${this.currentPage}`;
      this.drawCars();
    });
  }

  race(): void {
    window.app.game.race(this.cars);
  }

  reset(): void {
    this.cars.forEach((car, index) => {
      this.stopCar(car, this.carImageArr[index]);
    });
  }

  generateCars(): void {
    //
  }

  changePage(isNext?: boolean): void {
    if (isNext) {
      const pagesAmount = Math.ceil(this.totalCars / limitCarsPerPage);
      if (this.currentPage + 1 > pagesAmount) return;
      this.currentPage++;
    } else if (this.currentPage > 1) {
      this.currentPage--;
    } else {
      return;
    }
    this.updateGarage();
  }

  showWinner(carTitle: string, time: number): void {
    const messageBckgr = createElem('div', 'message');

    const messageWrapper = createElem('div', 'message__wrapper', messageBckgr);
    const messageWindow = createElem('div', 'message__window mssg', messageWrapper);
    const message = `Your fastest car is ${carTitle}! Time: ${(time / mssInSec).toFixed(3)} sec`;
    createElem('div', 'mssg__text', messageWindow, message);

    createElem('button', 'mssg__btn', messageWindow, 'Super!');
    messageBckgr.addEventListener('click', (e) => this.closeMessage(e));

    document.body.append(messageBckgr);
  }

  closeMessage(event: Event): void {
    event.stopPropagation();
    if (!event.target || !event.currentTarget) return;
    if ((event.target as HTMLElement).classList.contains('mssg__btn')) {
      (event.currentTarget as HTMLElement).remove();
    }
  }
}
