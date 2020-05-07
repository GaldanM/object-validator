import { Moment } from 'moment';
import { SchemaAllowedTypes } from './schema';
import { ObjectPropertyValue } from './object';

export type HandleTypeFunctions = {
	[T in SchemaAllowedTypes]: (pValue: ObjectPropertyValue, pName: string) => OutputPropertyValue;
};
export interface IOutputProperties {
	[key: string]: OutputPropertyValue;
}
export type OutputPropertyValue = string | number | boolean | Moment | OutputPropertyValue[];
