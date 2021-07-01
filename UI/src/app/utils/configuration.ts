import { ArrowCache, ArrowCacheState, ConstantCache, ConstantCacheState } from '@models/arrow-cache';
import { State } from '@models/state';
import { ConfigurationOptions } from '@models/configuration';
import { ConnectorState, IConnector } from '@models/connector.interface';
import { IRow, Row, RowState } from '@models/row';
import { Arrow } from '@models/arrow';

export function mappingStateToJsonConfiguration(configurationName: string,
                                                state: State,
                                                arrowCache: ArrowCache,
                                                constantsCache: ConstantCache): string {
  const options: ConfigurationOptions = {
    name: configurationName,
    mappingsConfiguration: arrowCacheToState(arrowCache),
    tablesConfiguration: state.targetConfig,
    source: state.source,
    target: state.target,
    report: state.report,
    version: state.version,
    filtered: state.filtered,
    constants: constantsCacheToState(constantsCache),
    targetClones: state.targetClones,
    sourceSimilar: state.sourceSimilar,
    targetSimilar: state.targetSimilar,
    recalculateSimilar: state.recalculateSimilar,
    concepts: state.concepts
  }

  return JSON.stringify(options)
}

function arrowCacheToState(arrowCache: ArrowCache): ArrowCacheState {
  const result = {}
  Object.keys(arrowCache).forEach(key => {
    const {source, target, connector, transforms, lookup, type, sql} = arrowCache[key]
    result[key] = {
      source: rowToState(source),
      target: rowToState(target),
      connector: connectorToState(connector),
      transforms,
      lookup,
      type,
      sql
    }
  })
  return result
}

function rowToState(row: IRow): RowState {
  const copy = {...row}
  delete copy.htmlElement

  return copy as RowState
}

function connectorToState(connector: IConnector): ConnectorState {
  const {id, source, target, selected, type} = connector
  return {
    id,
    source: rowToState(source),
    target: rowToState(target),
    selected,
    type
  }
}

export function stateToArrowCache(state: ArrowCacheState): ArrowCache {
  const result: ArrowCache = {}
  Object.keys(state).forEach(key => {
    const value = state[key]
    result[key] = {
      ...value,
      source: stateToRow(value.source),
      target: stateToRow(value.target),
      connector: stateToConnector(value.connector)
    }
  })
  return result
}

function stateToConnector(state: ConnectorState): IConnector {
  const obj = {
    ...state,
    source: stateToRow(state.source),
    target: stateToRow(state.target),
  }
  return Object.setPrototypeOf(obj, Arrow.prototype)
}

function stateToRow(state: RowState): IRow {
  const obj = {
    ...state,
    grouppedFields: state.grouppedFields.map(it => stateToRow(it)),
  }
  return Object.setPrototypeOf(obj, Row.prototype)
}

function constantsCacheToState(constantsCache: ConstantCache): ConstantCacheState {
  const result = {}
  Object.keys(constantsCache).forEach(key => {
    const value = constantsCache[key]
    result[key] = rowToState(value)
  })
  return result
}

export function stateToConstantCache(state: ConstantCacheState): ConstantCache {
  const result = {}
  Object.keys(state).forEach(key => {
    const value = state[key]
    result[key] = stateToRow(value)
  })
  return result
}
