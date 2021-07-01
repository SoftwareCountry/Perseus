import { ArrowCache, ArrowCacheState, ConstantCache, ConstantCacheState } from './arrow-cache';
import { IRow } from './row';
import { ITable, Table } from './table';
import { TargetConfig } from '@models/state';
import { TableConcepts } from '@models/concept-transformation/concept';
import { stateToArrowCache, stateToConstantCache } from '@utils/configuration';

/**
 * Flyweight mapping object for saving to a file
 */
export interface ConfigurationOptions {
  name?: string;
  tablesConfiguration?: TargetConfig;
  mappingsConfiguration?: ArrowCacheState;
  source?: Table[];
  target?: Table[];
  report?: string;
  version?: string;
  filtered?: string;
  constants?: ConstantCacheState;
  targetClones?: { [key: string]: ITable[] };
  sourceSimilar?: IRow[];
  targetSimilar?: IRow[];
  recalculateSimilar?: boolean;
  concepts?: { [key: string]: TableConcepts };
}

/**
 * Mapping object read from json mapping file
 */
export class Configuration {

  get arrows(): ArrowCache {
    return stateToArrowCache(this.mappingsConfiguration)
  }

  get tables() {
    return {...this.tablesConfiguration}
  }

  get sourceTables() {
    return [...this.source]
  }

  get targetTables() {
    return [...this.target]
  }

  get reportName() {
    return this.report
  }

  get cdmVersion() {
    return this.version
  }

  get constantsCache(): ConstantCache {
    return stateToConstantCache(this.constants)
  }

  get targetClones() {
    return {...this.targetTablesClones}
  }

  get targetSimilarRows() {
    return this.targetSimilar ? [...this.targetSimilar] : null
  }

  get sourceSimilarRows() {
    return this.sourceSimilar ? [...this.sourceSimilar] : null
  }

  get recalculateSimilarTables() {
    return this.recalculateSimilar
  }

  get tableConcepts() {
    return {...this.concepts}
  }

  get filteredString() {
    return this.filtered
  }

  private readonly name: string;
  private readonly mappingsConfiguration: ArrowCacheState;
  private readonly tablesConfiguration: TargetConfig;
  private readonly source: Table[];
  private readonly target: Table[];
  private readonly report: string;
  private readonly version: string;
  private readonly filtered: string;
  private readonly constants: ConstantCacheState;
  private readonly targetTablesClones: { [key: string]: ITable[] };
  private readonly sourceSimilar: IRow[];
  private readonly targetSimilar: IRow[];
  private readonly recalculateSimilar: boolean;
  private readonly concepts: { [key: string]: TableConcepts };

  constructor(options: ConfigurationOptions = {}) {
    this.name = options.name;
    this.mappingsConfiguration = options.mappingsConfiguration;
    this.tablesConfiguration = options.tablesConfiguration;
    this.source = options.source;
    this.target = options.target;
    this.report = options.report;
    this.version = options.version;
    this.filtered = options.filtered;
    this.constants = options.constants;
    this.targetTablesClones = options.targetClones;
    this.sourceSimilar = options.sourceSimilar;
    this.targetSimilar = options.targetSimilar;
    this.recalculateSimilar = options.recalculateSimilar;
    this.concepts = options.concepts;
  }
}
