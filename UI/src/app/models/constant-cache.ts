/*
 * key - `${sourceTableId}/${targetTableId}-${targetRowId}`
**/
import { IRow, Row } from '@models/row';
import { classToPlain } from 'class-transformer';

export interface IConstantCache {
  [key: string]: IRow;
}

export class ConstantCache implements IConstantCache {
  [key: string]: Row
}

/*
 * Flyweight copy of ConstantCache
**/
export class ConstantCachePlain {
  [key: string]: Record<string, Row>;

  constructor(cache: IConstantCache) {
    Object.keys(cache).forEach(key => {
      const value = cache[key] as Row;
      this[key] = classToPlain<Row>(value)
    });
  }
}
