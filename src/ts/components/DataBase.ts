import { headers, paths, queryParameters, serverBaseUrl } from '../constants';
import { EMethod, ERespStatusCode, ICar, ICarObj, ICars } from '../models';

export default class DataBase {
  winner = -1;

  async getCars(page?: number, limit?: number): Promise<ICars> {
    const queryParams = new URLSearchParams();
    if (page) {
      queryParams.set(queryParameters.page, `${page}`);
    }
    if (limit) {
      queryParams.set(queryParameters.limit, `${limit}`);
    }
    const queryParamsStr = queryParams.toString();

    let url = `${serverBaseUrl}${paths.garage}`;
    if (queryParamsStr) {
      url += `?${queryParamsStr}`;
    }

    try {
      const response = await fetch(url);
      const carsTotalStr = response.headers.get('X-Total-Count');
      const carsTotalAmount = carsTotalStr ? +carsTotalStr : 0;
      const cars = await response.json();

      const carsObj = {
        total: carsTotalAmount,
        carsArr: cars,
      };
      return carsObj;
    } catch (error) {
      console.error(error);
      const carsObj = {
        total: 0,
        carsArr: [],
      };
      return carsObj;
    }
  }

  async getCar(id: number): Promise<ICarObj | null> {
    const url = `${serverBaseUrl}${paths.garage}/${id}`;

    try {
      const response = await fetch(url);
      const car = await response.json();
      return car;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async createCar(name: string, color: string): Promise<ICar | null> {
    const newCar: ICar = {
      name: name,
      color: color,
    };

    try {
      const response = await fetch(`${serverBaseUrl}${paths.garage}`, {
        method: EMethod.Post,
        headers: {
          'Content-Type': headers.json,
        },
        body: JSON.stringify(newCar),
      });
      const car = await response.json();
      return car;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async deleteCar(id: number): Promise<void> {
    try {
      await fetch(`${serverBaseUrl}${paths.garage}/${id}`, {
        method: EMethod.Delete,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async updateCar(id: number, name: string, color: string): Promise<void> {
    const updateCar: ICar = {
      name: name,
      color: color,
    };

    try {
      await fetch(`${serverBaseUrl}${paths.garage}/${id}`, {
        method: EMethod.Put,
        headers: {
          'Content-Type': headers.json,
        },
        body: JSON.stringify(updateCar),
      });
    } catch (error) {
      console.error(error);
    }
  }

  async createEnginePromise(id: number, status: string): Promise<Response> {
    const queryParams = new URLSearchParams();
    queryParams.set(queryParameters.id, `${id}`);
    queryParams.set(queryParameters.status, status);
    const url = `${serverBaseUrl}${paths.engine}?${queryParams.toString()}`;

    const promise = fetch(url, {
      method: EMethod.Patch,
    });
    return promise;
  }

  async driveCar(
    promise: Promise<Response>,
    idxCarInCarsArr: number,
    carImage: HTMLElement,
    time?: number,
    isRace?: boolean
  ): Promise<void> {
    const response = await promise;
    if (!response) return;

    switch (response.status) {
      case ERespStatusCode.Ok: {
        if (time && isRace && !(this.winner + 1)) {
          this.winner = idxCarInCarsArr;
          this.showWinner(time);
        }
        break;
      }
      case ERespStatusCode.Broken:
        this.brokenEngine(carImage);
        break;
      default:
        break;
    }
  }

  brokenEngine(carImage: HTMLElement) {
    carImage.classList.add('pause');
  }

  showWinner(time: number): void {
    const winnerObj = window.app.view.cars.find((car, index) => index === this.winner);
    if (winnerObj) {
      window.app.view.showWinner(winnerObj.name, time);
    }
  }
}
