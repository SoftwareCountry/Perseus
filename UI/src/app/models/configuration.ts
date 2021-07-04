import { ArrowCache, ArrowCachePlain, IArrowCache } from './arrow-cache';
import { IRow, Row } from './row';
import { ITable, Table } from './table';
import { TargetConfig } from '@models/state';
import { TableConcepts } from '@models/concept-transformation/concept';
import { ConstantCache, ConstantCachePlain, IConstantCache } from '@models/constant-cache';
import { classToPlain, plainToClass, Type } from 'class-transformer';
import { ClassTransformOptions } from 'class-transformer/types/interfaces';
import { Clones, IClones } from '@models/clones';
import { Concepts, IConcepts } from '@models/concepts';

/**
 * Mapping object used for reading and writing to json file
 */
export interface IConfiguration {
  name?: string;
  tablesConfiguration?: TargetConfig;
  mappingsConfiguration?: IArrowCache;
  source?: Table[];
  target?: Table[];
  report?: string;
  version?: string;
  filtered?: string;
  constants?: IConstantCache;
  targetClones?: IClones;
  sourceSimilar?: IRow[];
  targetSimilar?: IRow[];
  recalculateSimilar?: boolean;
  concepts?: IConcepts;
}

export class Configuration implements IConfiguration {
  name?: string;
  tablesConfiguration?: TargetConfig;

  @Type(() => ArrowCache)
  mappingsConfiguration?: ArrowCache;

  @Type(() => Table)
  source?: Table[];

  @Type(() => Table)
  target?: Table[];

  report?: string;
  version?: string;
  filtered?: string;

  constants?: ConstantCache;
  targetClones?: Clones;
  sourceSimilar?: Row[];
  targetSimilar?: Row[];
  recalculateSimilar?: boolean;
  concepts?: Concepts;
}

/**
 * Flyweight copy of IConfiguration
 */
export class ConfigurationWrapper {

  get arrows(): ArrowCache {
    return plainToClass(ArrowCache, this.mappingsConfiguration, transformOptions)
  }

  get tables(): TargetConfig {
    return this.tablesConfiguration
  }

  get sourceTables(): Table[] {
    return this.source?.map(plain => plainToClass(Table, plain, transformOptions))
  }

  get targetTables(): Table[] {
    return this.target?.map(plain => plainToClass(Table, plain, transformOptions))
  }

  get reportName(): string {
    return this.report
  }

  get cdmVersion(): string {
    return this.version
  }

  get constantsCache(): ConstantCache {
    return plainToClass(ConstantCache, this.constants, transformOptions)
  }

  get targetClones(): Clones {
    return plainToClass(Clones, this.targetTablesClones, transformOptions)
  }

  get targetSimilarRows(): Row[] {
    return this.targetSimilar?.map(plain => plainToClass(Row, plain, transformOptions))
  }

  get sourceSimilarRows(): Row[] {
    return this.sourceSimilar?.map(plain => plainToClass(Row, plain, transformOptions))
  }

  get recalculateSimilarTables(): boolean {
    return this.recalculateSimilar
  }

  get tableConcepts(): Concepts {
    return plainToClass(Concepts, this.concepts, transformOptions)
  }

  get filteredString(): string {
    return this.filtered
  }

  private readonly name: string;
  private readonly mappingsConfiguration: ArrowCachePlain;
  private readonly tablesConfiguration: TargetConfig;
  private readonly source: Record<string, Table>[];
  private readonly target: Record<string, Table>[];
  private readonly report: string;
  private readonly version: string;
  private readonly filtered: string;
  private readonly constants: ConstantCachePlain;
  private readonly targetTablesClones: TargetTablesClonesPlain;
  private readonly sourceSimilar: Record<string, Row>[];
  private readonly targetSimilar: Record<string, Row>[];
  private readonly recalculateSimilar: boolean;
  private readonly concepts: ConceptsPlain;

  constructor(options: IConfiguration = {}) {
    this.name = options.name
    this.mappingsConfiguration = new ArrowCachePlain(options.mappingsConfiguration)
    this.tablesConfiguration = options.tablesConfiguration
    this.source = options.source?.map(table => classToPlain<Table>(table))
    this.target = options.target?.map(table => classToPlain<Table>(table))
    this.report = options.report
    this.version = options.version
    this.filtered = options.filtered
    this.constants = new ConstantCachePlain(options.constants)
    this.targetTablesClones = new TargetTablesClonesPlain(options.targetClones)
    this.sourceSimilar = options.sourceSimilar?.map(row => classToPlain<Row>(row as Row))
    this.targetSimilar = options.targetSimilar?.map(row => classToPlain<Row>(row as Row))
    this.recalculateSimilar = options.recalculateSimilar
    this.concepts = new ConceptsPlain(options.concepts)
  }
}

class TargetTablesClonesPlain {
  [key: string]: Record<string, Table>[]

  constructor(targetTablesClones: { [key: string]: ITable[] }) {
    if (targetTablesClones) {
      Object.keys(targetTablesClones).forEach(key => {
        const value = targetTablesClones[key]
        this[key] = value.map(table => classToPlain<Table>(table))
      });
    }
  }
}

class ConceptsPlain {
  [key: string]: Record<string, TableConcepts>

  constructor(concepts: { [key: string]: TableConcepts }) {
    if (concepts) {
      Object.keys(concepts).forEach(key => {
        const value = concepts[key]
        this[key] = classToPlain<TableConcepts>(value)
      });
    }
  }
}

const transformOptions: ClassTransformOptions = { excludeExtraneousValues: true }

export class ConfigurationPlain {
  name: string;
  mappingsConfiguration: ArrowCachePlain;
  tablesConfiguration: TargetConfig;
  source: Record<string, Table>[];
  target: Record<string, Table>[];
  report: string;
  version: string;
  filtered: string;
  constants: ConstantCachePlain;
  targetTablesClones: TargetTablesClonesPlain;
  sourceSimilar: Record<string, Row>[];
  targetSimilar: Record<string, Row>[];
  recalculateSimilar: boolean;
  concepts: ConceptsPlain;
}
