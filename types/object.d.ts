export interface IObjectProperties {
	[key: string]: ObjectPropertyValue;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectPropertyValue = any | any[] | IObjectProperties;
export type ObjecPropertyTuple = [string, ObjectPropertyValue];

