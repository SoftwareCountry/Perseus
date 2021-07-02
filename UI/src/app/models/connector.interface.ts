import { IRow, Row } from './row';
import { EventEmitter } from '@angular/core';
import { SqlFunction } from '@popups/rules-popup/transformation-input/model/sql-string-functions';
import { Arrow } from '@models/arrow';
import { Type } from 'class-transformer';

export interface IConnector {
  id: string;
  canvas?: any;
  path?: Element;
  source: IRow;
  target: IRow;
  selected: boolean;
  button?: Element;
  clicked?: EventEmitter<IConnector>;
  type: ConnectorType;

  draw(): void;
  remove(): void;
  adjustPosition(): void;
  attachButton(button): void;
  select(): void;
  deselect(): void;
  setEndMarkerType(type: string): void;
}

export type ConnectorType = 'L' | 'T' | 'M' | '';

export interface IConnection {
  source: IRow;
  target: IRow;
  connector: IConnector;
  transforms?: SqlFunction[];
  lookup?: {};
  type?: string;
  sql?: {};
}

export class Connection implements IConnection {

  @Type(() => Row)
  source: IRow;

  @Type(() => Row)
  target: IRow;

  @Type(() => Arrow)
  connector: IConnector;

  transforms?: SqlFunction[];
  lookup?: {};
  type?: string;
  sql?: {};
}
