import { ConnectorState, IConnection, IConnectionState, IConnector } from '@models/connector.interface';
import { Arrow } from '@models/arrow';
import { IRow, Row, RowState } from '@models/row';

export class MappingVisitor {
  rowToState(row: IRow): RowState {
    const copy = {...row}
    delete copy.htmlElement

    return Object.setPrototypeOf(copy, Row.prototype)
  }

  connectorToState(connector: IConnector): ConnectorState {
    const obj = {
      ...connector,
      source: connector.source,
      target: connector.target
    }
    return Object.setPrototypeOf(obj, ConnectorState.prototype)
  }

  connectionToState(connection: IConnection): IConnectionState {
    return
  }
}

export class MappingStateVisitor {

  rowFromState(state: RowState): IRow {
    return null
  }

  connectorFromState(state: ConnectorState): IConnector {
    const obj = {
      ...state,
      source: state.source,
      target: state.target,
    }
    return Object.setPrototypeOf(obj, Arrow.prototype)
  }
}
