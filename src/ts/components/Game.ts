import { MSS_IN_SEC, statuses } from '../constants';
import { ICarObj } from '../models';

export default class Game {
  async startCar(id: number): Promise<void> {
    const startResult = await window.app.dataBase.createEnginePromise(id, statuses.started);
    this.driveCar(id, startResult);
  }

  async driveCar(id: number, startResult: Response, isRace?: boolean, indexCarInArr?: number): Promise<void> {
    const startVal = await startResult.json();
    const time = startVal.distance / startVal.velocity;

    this.prepareAnimation(time, id);

    const drivePromise = window.app.dataBase.createEnginePromise(id, statuses.drive);

    this.startAnimation(id);

    const indexCarInCarsArr = typeof indexCarInArr === 'undefined' ? -1 : indexCarInArr;
    window.app.dataBase.driveCar(drivePromise, indexCarInCarsArr, id, time, isRace);
  }

  async stopCar(id: number): Promise<void> {
    await window.app.dataBase.createEnginePromise(id, statuses.stopped);
  }

  async race(carsArr: ICarObj[]): Promise<void> {
    const startPromisesArr = carsArr.map((car) => {
      return window.app.dataBase.createEnginePromise(car.id, statuses.started);
    });

    window.app.dataBase.winner = -1;

    const startResponseArr = await Promise.all(startPromisesArr);
    startResponseArr.forEach(async (startResponse, i) => {
      this.driveCar(carsArr[i].id, startResponse, true, i);
    });
  }

  prepareAnimation(animationTime: number, id: number): void {
    const carImage = window.app.view.carElemsArr[`img_${id}`];
    carImage.style.animationDuration = `${Math.round(animationTime / MSS_IN_SEC)}s`;
  }

  startAnimation(id: number): void {
    const carImage = window.app.view.carElemsArr[`img_${id}`];
    carImage.classList.add('drive');
  }
}
