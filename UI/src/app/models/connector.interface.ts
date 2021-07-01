import { IRow, RowState } from './row';
import { EventEmitter } from '@angular/core';
import { SqlFunction } from '@popups/rules-popup/transformation-input/model/sql-string-functions';
import { MappingPart, MappingPartState } from '@models/mapping-infastructure/mapping-part';
import { MappingStateVisitor } from '@models/mapping-infastructure/mapping-visitor';

export interface IConnector extends MappingPart<ConnectorState> {
  id: string;
  canvas?: any;
  svgPath?: Element;
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

/*
 * Flyweight copy of IConnector
**/
export class ConnectorState implements MappingPartState<IConnector> {
  readonly id: string;
  readonly source: RowState;
  readonly target: RowState;
  readonly selected: boolean;
  readonly type: ConnectorType;

  toComponent(visitor: MappingStateVisitor): IConnector {
    return visitor.connectorFromState(this)
  }
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

/*
 * Flyweight copy of IConnection
**/
export interface IConnectionState {
  readonly source: RowState;
  readonly target: RowState;
  readonly connector: ConnectorState,
  readonly transforms?: SqlFunction[];
  readonly lookup?: {};
  readonly type?: string;
  readonly sql?: {};
}
