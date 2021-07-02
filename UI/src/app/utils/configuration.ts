import { IArrowCache } from '@models/arrow-cache';
import { State } from '@models/state';
import { ConfigurationOptions } from '@models/configuration';
import { IConstantCache } from '@models/constant-cache';

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

  return JSON.stringify(options)
}
