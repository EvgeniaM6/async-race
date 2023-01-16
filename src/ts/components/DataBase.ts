import { headers, paths, queryParameters, serverBaseUrl } from '../constants';
import { EMethod, ERespStatusCode, ICar, ICarDriveResult, ICarObj, ICarProps } from '../models';

export default class DataBase {
  cars: ICarObj[] = [];
  winner = -1;

  constructor() {
    // console.log('garage=', paths.garage);
    // this.createCar('New Red Car', '#000000');
    // this.updateCar(6, 'New Red Car', '#ffffff');
    this.getCars(1, 7).then((respose) => (this.cars = respose));
    // this.getCar(1);
    // this.deleteCar(5);
    // this.getCars(1, 7).then((respose) => (this.cars = respose));
    // this.startOrStopCar(1, statuses.started);
    // this.startOrStopCar(1, statuses.drive);
  }

  async getCars(page?: number, limit?: number): Promise<ICarObj[]> {
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
      console.log('getCars response=', response);
      console.log('total=', response.headers.get('X-Total-Count'));
      const cars = await response.json();
      console.log('cars=', cars);
      return cars;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getCar(id: number): Promise<ICarObj | null> {
    const url = `${serverBaseUrl}${paths.garage}/${id}`;

    try {
      const response = await fetch(url);
      const car = await response.json();
      console.log('car=', car);
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
      console.log('create car=', car);
      return car;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async deleteCar(id: number): Promise<void> {
    try {
      const response = await fetch(`${serverBaseUrl}${paths.garage}/${id}`, {
        method: EMethod.Delete,
      });
      const car = await response.json();
      console.log('delete car=', car);
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
      const response = await fetch(`${serverBaseUrl}${paths.garage}/${id}`, {
        method: EMethod.Put,
        headers: {
          'Content-Type': headers.json,
        },
        body: JSON.stringify(updateCar),
      });
      const car = await response.json();
      console.log('car=', car);
    } catch (error) {
      console.error(error);
    }
  }

  async createEnginePromise(id: number, status: string): Promise<Response> {
    console.log('status=', status);
    const queryParams = new URLSearchParams();
    queryParams.set(queryParameters.id, `${id}`);
    queryParams.set(queryParameters.status, status);
    const url = `${serverBaseUrl}${paths.engine}?${queryParams.toString()}`;

    const promise = fetch(url, {
      method: EMethod.Patch,
    });
    return promise;
  }

  async driveCar(promise: Promise<Response>, i: number, time?: number, isRace?: boolean): Promise<void> {
    const response = await promise;
    console.log('i=', i, 'time=', time, 'isRace=', isRace);
    // console.log('i=', i, 'response=', response, 'time=', time, 'isRace=', isRace);
    if (!response) return;
    console.log('status=', response.status);

    switch (response.status) {
      case ERespStatusCode.Ok: {
        if (time && isRace && !(this.winner + 1)) {
          this.winner = i;
          this.showWinner(time);
        }
        const respObj = await response.json();
        this.drive(respObj);
        break;
      }
      case ERespStatusCode.Broken:
        this.brokenEngine();
        break;
      default:
        break;
    }
  }

  brokenEngine() {
    console.log('brokenEngine! stop animation!');
  }

  drive(respObj: ICarProps | ICarDriveResult) {
    // console.log('respObj=', respObj);
  }

  showWinner(time: number): void {
    const winnerObj = this.cars.find((car, index) => index === this.winner);
    console.log(1, 'winner=', winnerObj, `${time / 1000}s`);
  }
}
