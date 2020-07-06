import { IInputProperties } from './input';

export type SchemaAllowedTypes = 'string' | 'number' | 'boolean' | 'date' | 'object';

interface SchemaOptionsObject {
	type: 'object' | ['object'];
	properties: ISchema;
	required?: boolean;
	default?: IInputProperties;
	expected?: IInputProperties[];
}
interface SchemaOptionsString {
	type: 'string' | ['string'];
	required?: boolean;
	default?: string | string[];
	expected?: string[];
}
interface SchemaOptionsNumber {
	type: 'number' | ['number'];
	required?: boolean;
	default?: number | number[];
	expected?: number[];
}
interface SchemaOptionsBoolean {
	type: 'boolean' | ['boolean'];
	required?: boolean;
	default?: boolean | boolean[];
	expected?: boolean[];
}
interface SchemaOptionsDate {
	type: 'date' | ['date'];
	required?: boolean;
	default?: string | string[] | Date | Date[];
	expected?: string[];
}

export type SchemaOptions = SchemaOptionsString | SchemaOptionsNumber |
	SchemaOptionsBoolean | SchemaOptionsDate | SchemaOptionsObject;

export interface ISchema {
	[key: string]: SchemaOptions;
}
