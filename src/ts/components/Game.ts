import { statuses } from '../constants';
import { ICarObj } from '../models';

export default class Game {
  constructor() {
    setTimeout(() => {
      // this.startCar(10);
      this.race(window.app.dataBase.cars);
      // this.startCar(1);
      setTimeout(() => {
        //   this.stopCar(1);
        this.reset(window.app.dataBase.cars);
      }, 11000);
    }, 3000);
  }

  async startCar(id: number): Promise<void> {
    console.log('startCar id=', id);
    const startResult = await window.app.dataBase.createEnginePromise(id, statuses.started);
    this.driveCar(id, startResult);
  }

  async driveCar(id: number, startResult: Response, isRace?: boolean, indexCarInArr?: number): Promise<void> {
    const startVal = await startResult.json();
    console.log('startVal=', startVal);
    const time = startVal.distance / startVal.velocity;
    console.log('time=', time);

    this.prepareAnimation(time);

    const drivePromise = window.app.dataBase.createEnginePromise(id, statuses.drive);

    this.startAnimation();

    const indexCarInCarsArr = typeof indexCarInArr === 'undefined' ? -1 : indexCarInArr;
    window.app.dataBase.driveCar(drivePromise, indexCarInCarsArr, time, isRace);
  }

  async stopCar(id: number): Promise<void> {
    const stopResult = await window.app.dataBase.createEnginePromise(id, statuses.stopped);
    console.log('stopResult=', stopResult);
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

  async reset(carsArr: ICarObj[]): Promise<void> {
    carsArr.forEach((car) => this.stopCar(car.id));
  }

  prepareAnimation(animationTime: number) {
    // console.log('animationTime=', animationTime);
  }

  startAnimation() {
    console.log('start animation');
  }
}
