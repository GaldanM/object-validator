export interface IInputProperties {
	[key: string]: InputPropertyValue;
}

export type InputPropertyValue = string | number | boolean | Date | IInputProperties | InputPropertyValue[];

