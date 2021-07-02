import { Connection, IConnection } from '@models/connector.interface';
import { classToPlain } from 'class-transformer';

/*
 * key - `${sourceTableId}-${sourceRowId}/${targetTableId}-${targetRowId}`
**/
export interface IArrowCache {
  [key: string]: IConnection;
}

export class ArrowCache implements IArrowCache {
  [key: string]: Connection;
}

/*
 * Flyweight copy of ArrowCache
**/
export class ArrowCachePlain {
  [key: string]: Record<string, Connection>

  constructor(cache: IArrowCache) {
    Object.keys(cache).forEach(key => {
      const value = cache[key]
      this[key] = classToPlain<Connection>(value)
    })
  }
}
