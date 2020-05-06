import { Moment } from 'moment';

// ---------------------------- SCHEMA ----------------------------

export type SchemaRouteParamsAllowedTypes = 'string' | 'number' | 'boolean' | 'date';
export interface ISchemaRouteParams {
	[key: string]: ISchemaRouteParam;
}
export interface ISchemaRouteParam {
	type: SchemaRouteParamsAllowedTypes | SchemaRouteParamsAllowedTypes[];
}

// ---------------------------- PARAMS ----------------------------

export interface IRouteParams {
	[key: string]: ParamValue;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ParamValue = any | any[] | IRouteParams;
export type HandleParamsTuple = [string, ParamValue];

// ---------------------------- MAIN ----------------------------

export type HandleTypeFunctions = {
	[T in SchemaRouteParamsAllowedTypes]: (pValue: ParamValue, pName: string) => ParamValueOutput;
};
export interface IRouteParamsOutput {
	[key: string]: ParamValueOutput;
}
export type ParamValueOutput = string | number | boolean | Moment | ParamValueOutput[];
