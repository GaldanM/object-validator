export type SchemaAllowedTypes = 'string' | 'number' | 'boolean' | 'date' | 'object';

interface SchemaOptionsObject {
	type: 'object' | ['object'] ;
	properties: ISchema;
}
interface SchemaOptionsString {
	type: 'string' | ['string'] ;
}
interface SchemaOptionsNumber {
	type: 'number' | ['number'] ;
}
interface SchemaOptionsBoolean {
	type: 'boolean' | ['boolean'];
}
interface SchemaOptionsDate {
	type: 'date' | ['date'] ;
}

type SchemaOptions = SchemaOptionsString | SchemaOptionsNumber |
	SchemaOptionsBoolean | SchemaOptionsDate | SchemaOptionsObject;

export interface ISchema {
	[key: string]: SchemaOptions;
}
