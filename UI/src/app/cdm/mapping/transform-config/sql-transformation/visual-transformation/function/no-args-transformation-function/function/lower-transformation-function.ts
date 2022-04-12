import { NoArgsTransformationFunction } from '@mapping/transform-config/sql-transformation/visual-transformation/function/no-args-transformation-function/no-args-transformation-function';

export class LowerTransformationFunction extends NoArgsTransformationFunction {

  sql(): (arg: string) => string {
    return arg => `LOWER(${arg})`
  }
}
