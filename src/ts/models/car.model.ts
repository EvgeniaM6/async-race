export interface ICar {
  name: string;
  color: string;
}

export interface ICarObj extends ICar {
  id: number;
}

export interface ICars {
  total: number;
  carsArr: ICarObj[];
}

export interface ICarProps {
  velocity: number;
  distance: number;
}

export interface ICarDriveResult {
  success: boolean;
}
