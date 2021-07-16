import { TargetConfig } from '@models/state';

export function canLink(config, sourceTableName, targetTableName) {
  for (const item of config) {
    if (item.includes(sourceTableName) && item.includes(targetTableName)) {
      return true;
    }
  }
  return false;
}

export function removeDeletedLinksFromFields(conceptsCopy: any, linksToConceptFields: any, conceptFieldsDictionary: any) {
  conceptsCopy.conceptsList.forEach(conc => {
    Object.keys(conc.fields).forEach(type => {
      const sourceField = conc.fields[ type ].field;
      const linkExists = linksToConceptFields.filter(it => it.target.name === conceptFieldsDictionary[ type ] && it.source.name === sourceField);
      if (sourceField && !linkExists.length) {
        conc.fields[ type ].field = '';
      }
    })
  })
}

export function deleteConditionFuncForArrow(targetTableName: string,
                                            sourceTableName: string,
                                            tableCloneName?: string): (targetTableName: string, sourceTableName: string, tableCloneName?: string) => boolean {
  return tableCloneName ?
    (targetName: any, sourceName: any, cloneName: any) => targetName.toUpperCase() === targetTableName.toUpperCase() &&
      sourceName.toUpperCase() === sourceTableName.toUpperCase() &&
      tableCloneName.toUpperCase() === cloneName.toUpperCase()
    :
    (targetName: any, sourceName: any, cloneName: any) => targetName.toUpperCase() === targetTableName.toUpperCase() &&
      sourceName.toUpperCase() === sourceTableName.toUpperCase();
}

export function deleteConditionFuncForConst(targetTableName: string,
                                            tableCloneName?: string): (targetTableName: string, tableCloneName?: string) => boolean {
  return tableCloneName ?
    (targetName: string, cloneName: string) =>
      targetName.toUpperCase() === targetTableName.toUpperCase() &&
      tableCloneName.toUpperCase() === cloneName.toUpperCase()
    :
    (targetName: string, cloneName: string) =>
      targetName.toUpperCase() === targetTableName.toUpperCase()
}

export function isDeletedLastTablesLink(targetTableName: string,
                                        targetConfig: TargetConfig) {
  return targetConfig[targetTableName].data.length < 2
}
