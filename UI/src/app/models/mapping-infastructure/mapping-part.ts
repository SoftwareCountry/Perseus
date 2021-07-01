import { MappingStateVisitor, MappingVisitor } from '@models/mapping-infastructure/mapping-visitor';

export interface MappingPart<T extends MappingPartState<MappingPart<T>>> {
  toState(visitor: MappingVisitor): T
}

export interface MappingPartState<T extends MappingPart<MappingPartState<T>>> {
  toComponent(visitor: MappingStateVisitor): T
}
