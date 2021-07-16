import { BridgeService } from '@services/bridge.service';
import { ITable } from '@models/table';
import { AreaType } from '@models/area';
import { similarTableName } from '@app/app.constants';
import { StoreService } from '@services/store.service';

export function hasSourceAndTargetSimilar(bridgeService: BridgeService,
                                          storeService: StoreService): {source: boolean, target: boolean} {
  const mappedTables = storeService.getMappedTables()

  const source = hasSimilar(mappedTables['source'], 'source', bridgeService)
  const target = hasSimilar(mappedTables['target'], 'target', bridgeService)

  return {
    source,
    target
  }
}

export function hasSimilar(mappedTables: ITable[],
                           area: AreaType,
                           bridgeService: BridgeService): boolean {
  const similarRows = []
  const rows = []

  for (const table of mappedTables) {
    bridgeService.collectSimilarRows(table.rows, area, rows, similarRows)
    if (similarRows.length > 0) {
      return true;
    }
  }

  return false
}

export function deleteArrowForSimilar(area: AreaType, bridgeService: BridgeService) {
  Object.keys(bridgeService.arrowsCache).forEach(key => {
    const arrowFromCache = bridgeService.arrowsCache[key]
    if (arrowFromCache[area].tableName === similarTableName) {
      delete bridgeService.arrowsCache[key]
    }
  })
}
