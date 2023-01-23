import { getRandomArbitrary } from '.';
import { carBrands, carModels } from '../constants';

export function generateRandomColor(): string {
  let colorStr = '#';
  for (let idx = 0; idx < 6; idx++) {
    colorStr = colorStr + getRandomArbitrary(0, 16).toString(16);
  }
  return colorStr;
}

const carBrandsArrLeng = carBrands.length;
const carModelsArrLeng = carModels.length;

export function generateRandomCarName(): string {
  const randomBrandIdx = getRandomArbitrary(0, carBrandsArrLeng);
  const randomModelIdx = getRandomArbitrary(0, carModelsArrLeng);

  const randomBrand = carBrands[randomBrandIdx];
  const randomModel = carModels[randomModelIdx];

  const name = `${randomBrand} ${randomModel}`;
  return name;
}
