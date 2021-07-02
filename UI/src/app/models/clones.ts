import { ITable } from '@models/table';

export interface IClones {
  [key: string]: ITable[]
}

export class Clones implements IClones {
  [key: string]: ITable[]
}
