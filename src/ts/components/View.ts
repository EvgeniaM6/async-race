import {
  carActs,
  garageBtns,
  inputTypes,
  LIMIT_CARS_PER_PAGE,
  LIMIT_WINNERS_PER_PAGE,
  MSS_IN_SEC,
  pages,
  statuses,
} from '../constants';
import { ICarElemObj, ICarObj, IUpdInputElements, IWinner } from '../models';
import { carTemplate, createElem } from '../utilities';

export default class View {
  main: HTMLElement = createElem('main', 'main');
  garageBtn = createElem('button', 'nav__button btn-garage', null, 'to garage') as HTMLButtonElement;
  winnersBtn = createElem('button', 'nav__button btn-winners', null, 'to winners') as HTMLButtonElement;
  page = '';
  selectedId = 0;
  garageTotal = createElem('span', 'garage__title') as HTMLElement;
  garagePageNum = createElem('span', 'garage__page-num') as HTMLElement;
  winnersTotal = createElem('span', 'winners__title') as HTMLElement;
  winnersPageNum = createElem('span', 'winners__page-num') as HTMLElement;
  carsBlock = createElem('div', 'garage__cars cars') as HTMLElement;
  winnersBlock = createElem('div', 'winners__cars') as HTMLElement;
  raceBtn = createElem('button', `btn-race`, null, 'race') as HTMLButtonElement;
  resetBtn = createElem('button', `btn-reset unable`, null, 'reset') as HTMLButtonElement;
  currentGaragePage = 1;
  currentWinnersPage = 1;
  totalCars = 0;
  totalWinners = 0;
  cars: ICarObj[] = [];
  winners: IWinner[] = [];
  updateInputs: IUpdInputElements = {};
  carElemsArr: ICarElemObj = {};

  start(): void {
    this.drawApp();
    this.drawGarage();
  }

  drawApp(): void {
    const body = document.querySelector('body');
    const appContainer = createElem('div', 'app', body);

    const header = createElem('header', 'header', appContainer);
    const navigationBlock = createElem('nav', 'nav', header);
    navigationBlock.append(this.garageBtn);
    navigationBlock.append(this.winnersBtn);
    this.garageBtn.addEventListener('click', () => this.drawGarage());
    this.winnersBtn.addEventListener('click', () => this.drawWinners());

    appContainer?.append(this.main);
  }

  clearPage(): void {
    this.main.innerHTML = '';
  }

  drawGarage(): void {
    if (this.page === pages.garage) return;
    this.page = pages.garage;
    this.clearPage();
    this.garageBtn.classList.add('active');
    this.winnersBtn.classList.remove('active');

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

    this.drawPageBtns(this.main);

    this.updateGarage();
  }

  drawFormElement(blockTitle: string, parent: HTMLElement): void {
    const block = createElem('div', `manage__block ${blockTitle}`, parent) as HTMLElement;
    const form = createElem('form', `manage__form form`, block) as HTMLFormElement;

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

    const button = createElem('button', `${blockTitle}__button form__btn`, block, blockTitle) as HTMLButtonElement;
    if (blockTitle === carActs.update) {
      if (!this.selectedId) {
        button.classList.add('unable');
      }
      this.updateInputs.button = button;
    }
    const isCreate = blockTitle === carActs.create;
    button.addEventListener('click', () => this.setCar(form, isCreate));
  }

  drawManageButtons(parent: HTMLElement): void {
    const manageBtns = createElem('div', 'manage__buttons mng-btns') as HTMLElement;

    const manageAllCarsBlock = createElem('div', 'mng-btns__all', manageBtns) as HTMLElement;
    manageAllCarsBlock.append(this.raceBtn);
    this.raceBtn.addEventListener('click', () => this.race());
    manageAllCarsBlock.append(this.resetBtn);
    this.resetBtn.addEventListener('click', () => this.reset());

    const generateBtn = createElem('button', `mng-btns-generate`, manageBtns, 'generate') as HTMLButtonElement;
    generateBtn.addEventListener('click', () => this.generateCars());

    parent.append(manageBtns);
  }

  drawCars(): void {
    this.carsBlock.innerHTML = '';
    this.carElemsArr = {};
    this.raceBtn.classList.remove('unable');

    this.cars.forEach((car) => {
      this.drawCar(car);
    });
  }

  drawCar(car: ICarObj): void {
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

    this.drawManageCarBlock(car, carBlock);

    this.carsBlock.append(carBlock);
  }

  drawManageCarBlock(car: ICarObj, parentElem: HTMLElement): void {
    const manageBlock = createElem('div', 'car__manage') as HTMLElement;
    const manageBtns = createElem('div', 'car__manage-btns drive-btns', manageBlock) as HTMLElement;
    garageBtns.forEach((btnData) => {
      const btnElem = createElem(
        'button',
        `drive-btns__${btnData.btnType} car__btn-manage`,
        manageBtns,
        btnData.txtContent
      ) as HTMLButtonElement;

      this.carElemsArr[`btn_${btnData.btnType}_${car.id}`] = btnElem;

      if (btnData.btnType === 'stop') {
        btnElem.classList.add('unable');
        btnElem.addEventListener('click', () => this.stopCar(car));
      } else {
        btnElem.addEventListener('click', () => this.startCar(car));
      }
    });

    const carImageBlock = createElem('div', 'car__image-block', manageBlock);
    const carImage = createElem('div', 'car__image', carImageBlock);
    carImage.innerHTML = carTemplate(car.color);
    this.carElemsArr[`img_${car.id}`] = carImage;

    parentElem.append(manageBlock);
  }

  drawPageBtns(parent: HTMLElement): void {
    const pageBtnsBlock = createElem('div', 'page-btns') as HTMLElement;
    const pageBtnPrev = createElem('button', 'page-btns__prev page-btn', pageBtnsBlock, 'prev ←') as HTMLButtonElement;
    pageBtnPrev.addEventListener('click', () => this.changePage());
    const pageBtnNext = createElem('button', 'page-btns__next page-btn', pageBtnsBlock, '→ next') as HTMLButtonElement;
    pageBtnNext.addEventListener('click', () => this.changePage(true));

    parent.append(pageBtnsBlock);
  }

  selectCar(car: ICarObj, carBlock: HTMLElement): void {
    this.selectedId = car.id;
    if (this.updateInputs.textInput && this.updateInputs.colorInput && this.updateInputs.button) {
      this.updateInputs.textInput.disabled = this.updateInputs.colorInput.disabled = false;
      this.updateInputs.textInput.value = car.name;
      this.updateInputs.colorInput.value = car.color;
      this.updateInputs.button.classList.remove('unable');
    }
    carBlock.classList.add('selected');
  }

  removeCar(carId: number): void {
    window.app.dataBase.deleteCar(carId).then(() => this.updateGarage());
  }

  startCar(car: ICarObj): void {
    const startBtnElem = this.carElemsArr[`btn_start_${car.id}`];

    if (!startBtnElem.classList.contains('unable')) {
      window.app.game.startCar(car.id);

      startBtnElem.classList.add('unable');
      this.carElemsArr[`btn_stop_${car.id}`].classList.remove('unable');

      if (!this.raceBtn.classList.contains('unable')) {
        this.raceBtn.classList.add('unable');
      }
      this.resetBtn.classList.remove('unable');
    }
  }

  stopCar(car: ICarObj): void {
    window.app.dataBase.createEnginePromise(car.id, statuses.stopped);

    const carImage = this.carElemsArr[`img_${car.id}`];
    carImage.classList.remove('drive');
    carImage.classList.remove('pause');

    const stopBtnElem = this.carElemsArr[`btn_stop_${car.id}`];
    if (!stopBtnElem.classList.contains('unable')) {
      stopBtnElem.classList.add('unable');
    }
    this.carElemsArr[`btn_start_${car.id}`].classList.remove('unable');

    const canRace = this.cars.every((car) => {
      const startBtnElem = this.carElemsArr[`btn_start_${car.id}`];
      return !startBtnElem.classList.contains('unable');
    });
    if (canRace) {
      this.raceBtn.classList.remove('unable');
    }
  }

  drawWinners(): void {
    if (this.page === pages.winners) return;
    this.page = pages.winners;
    this.clearPage();
    this.garageBtn.classList.remove('active');
    this.winnersBtn.classList.add('active');

    const winnersContainer = createElem('div', 'winners', this.main) as HTMLElement;

    const winnersTitles = createElem('div', 'winners__titles', winnersContainer) as HTMLElement;
    const winnersTitle = createElem('div', 'winners__title', winnersTitles) as HTMLElement;
    createElem('span', 'winners__title', winnersTitle, 'Winners (') as HTMLElement;
    winnersTitle.append(this.winnersTotal);
    createElem('span', 'winners__title', winnersTitle, ')') as HTMLElement;

    const winnersPage = createElem('div', 'winners__page', winnersTitles) as HTMLElement;
    createElem('span', 'winners__page-text', winnersPage, 'Page #') as HTMLElement;
    winnersPage.append(this.winnersPageNum);

    winnersContainer.append(this.winnersBlock);

    this.drawPageBtns(this.main);

    this.updateWinners();
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
        if (!this.updateInputs.button.classList.contains('unable')) {
          this.updateInputs.button.classList.add('unable');
        }
      }
    });
  }

  updateGarage(): void {
    console.log('this.currentGaragePage=', this.currentGaragePage);
    window.app.dataBase.getCars(this.currentGaragePage, LIMIT_CARS_PER_PAGE).then((resp) => {
      this.cars = resp.carsArr;
      this.totalCars = resp.total;
      this.garageTotal.textContent = `${resp.total}`;
      this.garagePageNum.textContent = `${this.currentGaragePage}`;
      this.drawCars();
    });
  }

  race(): void {
    if (this.raceBtn.classList.contains('unable')) return;
    window.app.game.race(this.cars);

    this.cars.forEach((car) => {
      const startBtnElem = this.carElemsArr[`btn_start_${car.id}`];
      if (!startBtnElem.classList.contains('unable')) {
        startBtnElem.classList.add('unable');
      }
      this.carElemsArr[`btn_stop_${car.id}`].classList.remove('unable');
    });

    if (!this.raceBtn.classList.contains('unable')) {
      this.raceBtn.classList.add('unable');
    }
    this.resetBtn.classList.remove('unable');
  }

  reset(): void {
    this.cars.forEach((car) => {
      this.stopCar(car);
    });

    if (!this.resetBtn.classList.contains('unable')) {
      this.resetBtn.classList.add('unable');
    }
    this.raceBtn.classList.remove('unable');
  }

  generateCars(): void {
    //
  }

  changePage(isNext?: boolean): void {
    const isGaragePage = this.page === pages.garage;
    const currPageNum = isGaragePage ? this.currentGaragePage : this.currentWinnersPage;

    if (isNext) {
      const pagesAmountFraction = isGaragePage
        ? this.totalCars / LIMIT_CARS_PER_PAGE
        : this.totalWinners / LIMIT_WINNERS_PER_PAGE;
      const pagesAmount = Math.ceil(pagesAmountFraction);
      const nextPageNum = isGaragePage ? this.currentGaragePage + 1 : this.currentWinnersPage + 1;
      if (nextPageNum > pagesAmount) return;
      if (isGaragePage) {
        this.currentGaragePage++;
      } else {
        this.currentWinnersPage++;
      }
    } else if (currPageNum > 1) {
      if (isGaragePage) {
        this.currentGaragePage--;
      } else {
        this.currentWinnersPage--;
      }
    } else {
      return;
    }

    if (isGaragePage) {
      this.updateGarage();
    } else {
      this.updateWinners();
    }
  }

  showWinner(carTitle: string, time: number): void {
    const messageBckgr = createElem('div', 'message');

    const messageWrapper = createElem('div', 'message__wrapper', messageBckgr);
    const messageWindow = createElem('div', 'message__window mssg', messageWrapper);
    const message = `Your fastest car is ${carTitle}! Time: ${(time / MSS_IN_SEC).toFixed(3)} sec`;
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

  updateWinners(): void {
    console.log('this.currentWinnersPage=', this.currentWinnersPage);
    window.app.dataBase.getWinners(this.currentWinnersPage, LIMIT_WINNERS_PER_PAGE).then((resp) => {
      this.winners = resp.winnersArr;
      this.totalWinners = resp.total;
      this.winnersTotal.textContent = `${resp.total}`;
      this.winnersPageNum.textContent = `${this.currentWinnersPage}`;
      this.drawWinnersTable(resp.winnersArr);
    });
  }

  drawWinnersTable(winnersArr: IWinner[]): void {
    console.log('winnersArr=', winnersArr);
  }
}
