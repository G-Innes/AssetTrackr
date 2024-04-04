/* eslint-disable class-methods-use-this */
import { ValueTransformer } from 'typeorm'

export class NumericTransformer implements ValueTransformer {
  to(data: number): number {
    return data
  }

  from(data: string): number {
    return parseFloat(data)
  }
}
