import { statuses } from '../constants';
import { ICarObj } from '../models';

export default class Game {
  async startCar(id: number, carImage: HTMLElement): Promise<void> {
    const startResult = await window.app.dataBase.createEnginePromise(id, statuses.started);
    this.driveCar(id, startResult, carImage);
  }

  async driveCar(
    id: number,
    startResult: Response,
    carImage: HTMLElement,
    isRace?: boolean,
    indexCarInArr?: number
  ): Promise<void> {
    const startVal = await startResult.json();
    const time = startVal.distance / startVal.velocity;

    this.prepareAnimation(time, carImage);

    const drivePromise = window.app.dataBase.createEnginePromise(id, statuses.drive);

    this.startAnimation(carImage);

    const indexCarInCarsArr = typeof indexCarInArr === 'undefined' ? -1 : indexCarInArr;
    window.app.dataBase.driveCar(drivePromise, indexCarInCarsArr, carImage, time, isRace);
  }

  async stopCar(id: number): Promise<void> {
    await window.app.dataBase.createEnginePromise(id, statuses.stopped);
  }

  async race(carsArr: ICarObj[]): Promise<void> {
    const startPromisesArr = carsArr.map((car) => {
      return window.app.dataBase.createEnginePromise(car.id, statuses.started);
    });

    window.app.dataBase.winner = -1;

    const carImgArr = Array.from(document.querySelectorAll('.car__image')) as HTMLElement[];
    const startResponseArr = await Promise.all(startPromisesArr);
    startResponseArr.forEach(async (startResponse, i) => {
      this.driveCar(carsArr[i].id, startResponse, carImgArr[i], true, i);
    });
  }

  async reset(carsArr: ICarObj[]): Promise<void> {
    carsArr.forEach((car) => this.stopCar(car.id));
  }

  prepareAnimation(animationTime: number, carImage: HTMLElement): void {
    carImage.style.animationDuration = `${Math.round(animationTime / 1000)}s`;
  }

  startAnimation(carImage: HTMLElement): void {
    carImage.classList.add('drive');
  }
}
