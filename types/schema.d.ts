export type SchemaAllowedTypes = 'string' | 'number' | 'boolean' | 'date' | 'object';

interface SchemaOptionsObject {
	type: 'object' | ['object'];
	properties: ISchema;
	required?: boolean;
	default?: object | [object];
}
interface SchemaOptionsString {
	type: 'string' | ['string'];
	required?: boolean;
	default?: string | [string];
}
interface SchemaOptionsNumber {
	type: 'number' | ['number'];
	required?: boolean;
	default?: number | [number];
}
interface SchemaOptionsBoolean {
	type: 'boolean' | ['boolean'];
	required?: boolean;
	default?: boolean | [boolean];
}
interface SchemaOptionsDate {
	type: 'date' | ['date'];
	required?: boolean;
	default?: string | [string];
}

type SchemaOptions = SchemaOptionsString | SchemaOptionsNumber |
	SchemaOptionsBoolean | SchemaOptionsDate | SchemaOptionsObject;

export interface ISchema {
	[key: string]: SchemaOptions;
}
