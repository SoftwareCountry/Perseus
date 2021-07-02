import { TableConcepts } from '@models/concept-transformation/concept';

export interface IConcepts {
  [key: string]: TableConcepts
}

export class Concepts implements IConcepts {
  [key: string]: TableConcepts
}
