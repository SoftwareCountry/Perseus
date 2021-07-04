import { IArrowCache } from '@models/arrow-cache';
import { State } from '@models/state';
import { Configuration, ConfigurationWrapper, IConfiguration } from '@models/configuration';
import { IConstantCache } from '@models/constant-cache';
import { plainToClass } from 'class-transformer';

export function mappingStateToJsonConfiguration(configurationName: string,
                                                state: State,
                                                arrowCache: IArrowCache,
                                                constantsCache: IConstantCache): string {
  const options: IConfiguration = {
    name: configurationName,
    mappingsConfiguration: arrowCache,
    tablesConfiguration: state.targetConfig,
    source: state.source,
    target: state.target,
    report: state.report,
    version: state.version,
    filtered: state.filtered,
    constants: constantsCache,
    targetClones: state.targetClones,
    sourceSimilar: state.sourceSimilar,
    targetSimilar: state.targetSimilar,
    recalculateSimilar: state.recalculateSimilar,
    concepts: state.concepts
  }
  const plain = new ConfigurationWrapper(options)
  return JSON.stringify(plain)
}

export function jsonToConfiguration(json: {}): Configuration {
  const result = plainToClass(Configuration, json, {excludeExtraneousValues: true})
  return result
}
