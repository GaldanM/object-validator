export type SchemaAllowedTypes = 'string' | 'number' | 'boolean' | 'date';
export interface ISchema {
	[key: string]: ISchemaOptions;
}
export interface ISchemaOptions {
	type: SchemaAllowedTypes | SchemaAllowedTypes[];
}
