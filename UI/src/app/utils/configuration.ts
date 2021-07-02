import { IArrowCache } from '@models/arrow-cache';
import { State } from '@models/state';
import { Configuration, ConfigurationOptions } from '@models/configuration';
import { IConstantCache } from '@models/constant-cache';
import { classToPlain, plainToClass } from 'class-transformer';

export function mappingStateToJsonConfiguration(configurationName: string,
                                                state: State,
                                                arrowCache: IArrowCache,
                                                constantsCache: IConstantCache): string {
  const options: ConfigurationOptions = {
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
  const configuration = new Configuration(options)
  const plain = classToPlain(configuration)
  return JSON.stringify(plain)
}

export function jsonToConfiguration(json: {}): Configuration {
  const result = plainToClass(Configuration, json, {excludeExtraneousValues: true})
  return result
}
