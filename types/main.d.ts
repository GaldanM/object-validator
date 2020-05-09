import { Moment } from 'moment';
import { ISchema } from './schema';
import { ObjectPropertyValue } from './object';

export interface IHandleFunctionMap {
	string: (pValue: ObjectPropertyValue, pName: string) => OutputPropertyValue;
	number: (pValue: ObjectPropertyValue, pName: string) => OutputPropertyValue;
	boolean: (pValue: ObjectPropertyValue, pName: string) => OutputPropertyValue;
	date: (pValue: ObjectPropertyValue, pName: string) => OutputPropertyValue;
	object: (pValue: ObjectPropertyValue, pName: string, schema: ISchema) => OutputPropertyValue;
}
export interface IOutputProperties {
	[key: string]: OutputPropertyValue;
}
export type OutputPropertyValue = string | number | boolean | Moment | object | OutputPropertyValue[];
