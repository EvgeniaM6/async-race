import { headers, MSS_IN_SEC, pages, paths, queryParameters, SERVER_BASE_URL } from '../constants';
import { EMethod, ERespStatusCode, ICar, ICarObj, ICars, IWinner, IWinners } from '../models';

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

    let url = `${SERVER_BASE_URL}${paths.garage}`;
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
    const url = `${SERVER_BASE_URL}${paths.garage}/${id}`;

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
      const response = await fetch(`${SERVER_BASE_URL}${paths.garage}`, {
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
      await fetch(`${SERVER_BASE_URL}${paths.garage}/${id}`, {
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
      await fetch(`${SERVER_BASE_URL}${paths.garage}/${id}`, {
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
    const url = `${SERVER_BASE_URL}${paths.engine}?${queryParams.toString()}`;

    const promise = fetch(url, {
      method: EMethod.Patch,
    });
    return promise;
  }

  async driveCar(
    promise: Promise<Response>,
    idxCarInCarsArr: number,
    carId: number,
    time?: number,
    isRace?: boolean
  ): Promise<void> {
    const response = await promise;
    if (!response) return;

    switch (response.status) {
      case ERespStatusCode.Ok: {
        const notSwithToAnoterPage = window.app.view.page === pages.garage;
        if (time && isRace && !(this.winner + 1) && notSwithToAnoterPage) {
          this.winner = idxCarInCarsArr;
          this.showWinner(time);
          this.addWinner(carId, time);
        }
        break;
      }
      case ERespStatusCode.Broken:
        this.brokenEngine(carId);
        break;
      default:
        break;
    }
  }

  brokenEngine(carId: number) {
    const carImage = window.app.view.carElemsArr[`img_${carId}`];
    carImage.classList.add('pause');
  }

  showWinner(time: number): void {
    const winnerObj = window.app.view.cars.find((car, index) => index === this.winner);
    if (winnerObj) {
      window.app.view.showWinner(winnerObj.name, time);
    }
  }

  async getWinners(page?: number, limit?: number, sort?: string, order?: string): Promise<IWinners> {
    const queryParams = new URLSearchParams();
    if (page) {
      queryParams.set(queryParameters.page, `${page}`);
    }
    if (limit) {
      queryParams.set(queryParameters.limit, `${limit}`);
    }
    if (sort) {
      queryParams.set(queryParameters.sort, `${sort}`);
    }
    if (order) {
      queryParams.set(queryParameters.order, `${order}`);
    }
    const queryParamsStr = queryParams.toString();

    let url = `${SERVER_BASE_URL}${paths.winners}`;
    if (queryParamsStr) {
      url += `?${queryParamsStr}`;
    }

    try {
      const response = await fetch(url);
      const winnersTotalStr = response.headers.get('X-Total-Count');
      const winners = await response.json();
      const winnersTotalAmount = winnersTotalStr ? +winnersTotalStr : winners.length;

      const winnersObj = {
        total: winnersTotalAmount,
        winnersArr: winners,
      };
      return winnersObj;
    } catch (error) {
      console.error(error);
      const winnersObj = {
        total: 0,
        winnersArr: [],
      };
      return winnersObj;
    }
  }

  async addWinner(id: number, time: number): Promise<void> {
    const url = `${SERVER_BASE_URL}${paths.winners}/${id}`;
    const timeInSec = +(time / MSS_IN_SEC).toFixed(2);

    const response = await fetch(url);
    switch (response.status) {
      case ERespStatusCode.Ok:
        {
          const winner: IWinner = await response.json();
          const minTime = Math.min(timeInSec, winner.time);
          const updateWinner = {
            wins: winner.wins + 1,
            time: minTime,
          };
          const respUpd = await fetch(url, {
            method: EMethod.Put,
            headers: {
              'Content-Type': headers.json,
            },
            body: JSON.stringify(updateWinner),
          });
        }
        break;
      case ERespStatusCode.NotFound:
        {
          const url = `${SERVER_BASE_URL}${paths.winners}`;
          const createWinner = {
            id: id,
            wins: 1,
            time: timeInSec,
          };
          const respCrt = await fetch(url, {
            method: EMethod.Post,
            headers: {
              'Content-Type': headers.json,
            },
            body: JSON.stringify(createWinner),
          });
        }
        break;

      default:
        break;
    }
  }
}
