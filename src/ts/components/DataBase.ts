import { headers, paths, queryParameters, serverBaseUrl, statuses } from '../constants';
import { EMethod, ICar } from '../models';

export default class DataBase {
  constructor() {
    // console.log('garage=', paths.garage);
    // this.createCar('New Red Car', '#000000');
    // this.updateCar(6, 'New Red Car', '#ffffff');
    // this.getCars(1, 5);
    // this.getCar(1);
    // this.deleteCar(5);
    // this.getCars(1, 5);
    // this.startOrStopCar(1, statuses.drive);
  }

  async getCars(page?: number, limit?: number): Promise<void> {
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

    const response = await fetch(url, {
      method: EMethod.Get,
    });

    try {
      const cars = await response.json();
      console.log('cars=', cars);
    } catch (error) {
      console.error(error);
    }
  }

  async getCar(id: number): Promise<void> {
    const url = `${serverBaseUrl}${paths.garage}/${id}`;

    const response = await fetch(url, {
      method: EMethod.Get,
    });

    try {
      const car = await response.json();
      console.log('car=', car);
    } catch (error) {
      console.error(error);
    }
  }

  async createCar(name: string, color: string): Promise<void> {
    const newCar: ICar = {
      name: name,
      color: color,
    };

    const response = await fetch(`${serverBaseUrl}${paths.garage}`, {
      method: EMethod.Post,
      headers: {
        'Content-Type': headers.json,
      },
      body: JSON.stringify(newCar),
    });

    try {
      const car = await response.json();
      console.log('car=', car);
    } catch (error) {
      console.error(error);
    }
  }

  async deleteCar(id: number): Promise<void> {
    const response = await fetch(`${serverBaseUrl}${paths.garage}/${id}`, {
      method: EMethod.Delete,
    });

    try {
      const car = await response.json();
      console.log('car=', car);
    } catch (error) {
      console.error(error);
    }
  }

  async updateCar(id: number, name: string, color: string): Promise<void> {
    const updateCar: ICar = {
      name: name,
      color: color,
    };

    const response = await fetch(`${serverBaseUrl}${paths.garage}/${id}`, {
      method: EMethod.Put,
      headers: {
        'Content-Type': headers.json,
      },
      body: JSON.stringify(updateCar),
    });

    try {
      const car = await response.json();
      console.log('car=', car);
    } catch (error) {
      console.error(error);
    }
  }

  async startOrStopCar(id: number, status: string): Promise<void> {
    const queryParams = new URLSearchParams();
    queryParams.set(queryParameters.id, `${id}`);
    queryParams.set(queryParameters.status, status);
    const url = `${serverBaseUrl}${paths.engine}?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        method: EMethod.Patch,
      });
      const carProps = await response.json();
      console.log('carProps=', carProps);
    } catch (error) {
      console.error(error);
    }
  }
}
