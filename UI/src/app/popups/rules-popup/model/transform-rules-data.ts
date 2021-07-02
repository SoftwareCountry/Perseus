import { IConnector } from 'src/app/models/connector.interface';
import { IArrowCache } from '@models/arrow-cache';

export interface TransformRulesData {
  connector: IConnector;
  arrowCache: IArrowCache;
}
