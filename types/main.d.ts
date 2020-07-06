import { Moment } from 'moment';
import { ISchema } from './schema';
import { InputPropertyValue } from './input';

export interface IHandleFunctionMap {
	string: (pValue: InputPropertyValue, pName: string) => OutputPropertyValue;
	number: (pValue: InputPropertyValue, pName: string) => OutputPropertyValue;
	boolean: (pValue: InputPropertyValue, pName: string) => OutputPropertyValue;
	date: (pValue: InputPropertyValue, pName: string) => OutputPropertyValue;
	object: (pValue: InputPropertyValue, pName: string, schema: ISchema) => OutputPropertyValue;
}
export interface IOutputProperties {
	[key: string]: OutputPropertyValue;
}
export type OutputPropertyValue = string | number | boolean | Moment | object;
