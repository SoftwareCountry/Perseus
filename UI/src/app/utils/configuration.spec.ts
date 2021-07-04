import { testMapping } from '@test/test-mapping';
import { plainToClass } from 'class-transformer';
import { ArrowCache } from '@models/arrow-cache';
import * as testMappingJson from '@test/test.json'
import { parse } from 'flatted';
import { IConnection } from '@models/connector.interface';
import { SqlFunction } from '@popups/rules-popup/transformation-input/model/sql-string-functions';
import { Row } from '@models/row';

describe('Concept Util', () => {
  it('should read mapping from json file', () => {
    const json = testMappingJson
    const toJson = JSON.parse(testMapping)
    const rows = parse(toJson.mappingsConfiguration);
    Object.values(rows).forEach((row: IConnection) => {
      const { source, target, transforms } = row;
      row.source = Object.setPrototypeOf(source, Row.prototype);
      row.target = Object.setPrototypeOf(target, Row.prototype);
      row.transforms = transforms.map(t => new SqlFunction(t));
    });
    return rows;
    const arrowCache = plainToClass(ArrowCache, toJson.mappingsConfiguration)
    console.log(arrowCache)
  })
})
