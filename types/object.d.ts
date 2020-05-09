export interface IInputProperties {
	[key: string]: ObjectPropertyValue;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectPropertyValue = any | any[] | IInputProperties;

