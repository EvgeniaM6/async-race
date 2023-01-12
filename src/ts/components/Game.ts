import { path, serverBaseUrl } from '../constants';
import { EMethod, ICar } from '../models';

export default class Game {
  constructor() {
    console.log('Game works');
    // console.log('garage=', path.garage);
    // this.createCar('New Red Car', '#000000');
    // this.updateCar(6, 'New Red Car', '#ffffff');
  }

  async createCar(name: string, color: string): Promise<void> {
    console.log('createCar', 'name=', name, 'color=', color);
    const newCar: ICar = {
      name: name,
      color: color,
    };
    console.log('newCar=', newCar);

    const response = await fetch(`${serverBaseUrl}${path.garage}`, {
      method: EMethod.Post,
      headers: {
        'Content-Type': 'application/json',
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

  async updateCar(id: number, name: string, color: string): Promise<void> {
    console.log('updateCar', 'id=', id, 'name=', name, 'color=', color);
    const updateCar: ICar = {
      name: name,
      color: color,
    };
    console.log('updateCar=', updateCar);

    const response = await fetch(`${serverBaseUrl}${path.garage}/${id}`, {
      method: EMethod.Put,
      headers: {
        'Content-Type': 'application/json',
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
}
