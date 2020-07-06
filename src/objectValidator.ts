import moment from 'moment';
import {
	IHandleFunctionMap, IInputProperties, IOutputProperties,
	ISchema, InputPropertyValue, OutputPropertyValue,
	SchemaAllowedTypes, SchemaOptions, SchemaOptionsObject,
} from '../index';

function handleString(pValue: InputPropertyValue, pName: string): string {
	if (typeof pValue === 'string') {
		return pValue;
	}

	throw new Error(`"${pName}": expected String but received "${typeof pValue}"`);
}
function handleNumber(pValue: InputPropertyValue, pName: string): number {
	if (typeof pValue === 'number') {
		return pValue;
	} else if (typeof pValue === 'string') {
		const realNumber = Number(pValue.replace(/,/g, '.'));
		if (!Number.isNaN(realNumber)) {
			return realNumber;
		}
	}

	throw new Error(`"${pName}": expected Number but received "${typeof pValue}" which is not considered as a Number`);
}
function handleBoolean(pValue: InputPropertyValue, pName: string): boolean {
	if (typeof pValue === 'boolean') {
		return pValue;
	} else if (typeof pValue === 'string') {
		if (pValue === 'true') {
			return true;
		} else if (pValue === 'false') {
			return false;
		}
	}
	throw new Error(`"${pName}": expected Boolean but received "${typeof pValue}" which is not considered as a Boolean`);
}
function handleDate(pValue: InputPropertyValue, pName: string): moment.Moment {
	if (typeof pValue === 'boolean' || (typeof pValue === 'object' && !(pValue instanceof Date))) {
		throw new Error(`"${pName}": expected Date but received a "${typeof pValue}" which cannot be cast to a valid Date`);
	}

	let date = moment(pValue);
	if (!date.isValid()) {
		const cleanValue = typeof pValue === 'string' ? pValue.replace(/,/g, '.') : pValue;
		date = moment(Number(cleanValue));
		if (!date.isValid()) {
			throw new Error(`"${pName}": expected Date but received a "${typeof pValue}" which cannot be cast to a valid Date`);
		}
	}
	return date;
}
function handleObject(pValue: InputPropertyValue, pName: string, innerSchema: ISchema): object {
	let receivedObject = pValue;
	if (typeof receivedObject === 'string') {
		try {
			receivedObject = JSON.parse(receivedObject);
		} catch (err) {
			throw new Error(`"${pName}": expected JSON object but got non-JSON string`);
		}
	}
	if (Array.isArray(receivedObject)) {
		throw new Error(`"${pName}": expected object but got array`);
	}
	if (typeof receivedObject !== 'object') {
		throw new Error(`"${pName}": expected Object but got "${typeof receivedObject}"`);
	}
	if (receivedObject instanceof Date) {
		throw new Error(`"${pName}": expected Object but got "Date"`);
	}

	return objectValidator(innerSchema, receivedObject, pName);
}
function handleArray(schema: SchemaOptions, pValue: InputPropertyValue | InputPropertyValue[], pName: string): OutputPropertyValue[] {
	const pArray = Array.isArray(pValue) ? pValue : [pValue];
	const [itemType] = schema.type as SchemaAllowedTypes[];
	const itemSchema = { ...schema, type: itemType } as SchemaOptions;

	return pArray.map((value, index) => handleProperty(itemSchema, value, `${pName}[${index}]`));
}

function checkExpected(expectedValues: InputPropertyValue[], pValue: OutputPropertyValue, pName: string): void {
	let allowedValues = expectedValues;
	let valueToCheck = pValue;

	if (typeof valueToCheck === 'object') {
		if (moment.isMoment(valueToCheck)) {
			allowedValues = allowedValues.map(date => moment(date as string | Date | number).toISOString());
			valueToCheck = valueToCheck.toISOString();
		} else {
			allowedValues = allowedValues.map(obj => JSON.stringify(obj));
			valueToCheck = JSON.stringify(valueToCheck);
		}
	}

	if (!allowedValues.includes(valueToCheck)) {
		// Eslint error due to Boolean not declaring "toString()", so waiting for TS to implement it in their next version
		// https://github.com/typescript-eslint/typescript-eslint/issues/1655
		// https://github.com/microsoft/TypeScript/issues/38347
		// https://github.com/microsoft/TypeScript/pull/37839
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		throw new Error(`"${pName}": unexpected value "${valueToCheck}", expected [${allowedValues.map(val => `"${val}"`).join(' OR ')}]`);
	}
}
function handleProperty(schemaOptions: SchemaOptions, pValue: InputPropertyValue, pName: string): OutputPropertyValue | OutputPropertyValue[] {
	if (Array.isArray(schemaOptions.type)) {
		return handleArray(schemaOptions, pValue, pName);
	}

	const typesToHandle: IHandleFunctionMap = {
		string: handleString,
		number: handleNumber,
		boolean: handleBoolean,
		date: handleDate,
		object: handleObject,
	};

	const newValue = typesToHandle[schemaOptions.type](pValue, pName, (schemaOptions as SchemaOptionsObject).properties);

	if (schemaOptions.hasOwnProperty('expected') && Array.isArray(schemaOptions.expected) && schemaOptions.expected.length > 0) {
		checkExpected(schemaOptions.expected, newValue, pName);
	}

	return newValue;
}

function validateSchema(schema: ISchema, parentSchemaOptionsName = ''): void {
	for (const currentSchemaOptionsName in schema) {
		const currentSchemaOptions = schema[currentSchemaOptionsName];
		const deepCurrentSchemaOptionsName = `${parentSchemaOptionsName === '' ? '' : `${parentSchemaOptionsName}.`}${currentSchemaOptionsName}`;

		if (Array.isArray(currentSchemaOptions.type)) {

		}
		if (currentType === 'date') {
			currentType = 'string';
		}

		if (typeof currentSchemaOptions !== 'object') {
			throw new Error(`${deepCurrentSchemaOptionsName}: expected object but got "${typeof currentSchemaOptions}" instead`);
		}

		if (!currentSchemaOptions.hasOwnProperty('type')) {
			throw new Error(`${deepCurrentSchemaOptionsName}: missing "type" property in schema options`);
		}
		if (currentType === 'object') {
			if (currentSchemaOptions.hasOwnProperty('properties')) {
				const currentOptionsObject = currentSchemaOptions as SchemaOptionsObject;
				const nestedSchema = currentOptionsObject.properties;
				if (typeof nestedSchema === 'object') {
					validateSchema(nestedSchema, deepCurrentSchemaOptionsName);
				} else {
					throw new Error(`${deepCurrentSchemaOptionsName}: incorrect property "properties", expected SchemaOptionsObject`);
				}
			} else {
				throw new Error(`${deepCurrentSchemaOptionsName}: missing "properties" property in schema options`);
			}
		}

		if (currentSchemaOptions.hasOwnProperty('required')) {
			if (typeof currentSchemaOptions.required !== 'boolean') {
				throw new Error(`"${deepCurrentSchemaOptionsName}": expected "required" to be of type boolean`);
			}
		}

		if (currentSchemaOptions.hasOwnProperty('default')) {
			let defaultOk = true;
			if (Array.isArray(currentSchemaOptions.default)) {
				defaultOk = (currentSchemaOptions.default as InputPropertyValue[])
					.every(def => typeof def === currentType);
			} else {
				defaultOk = typeof currentSchemaOptions.default === currentType;
			}
			if (!defaultOk) {
				throw new Error(`"${deepCurrentSchemaOptionsName}": expected "default" to be of type "${currentType}"`);
			}
		}

		if (currentSchemaOptions.hasOwnProperty('expected') && currentSchemaOptions.expected) {
			if ((currentSchemaOptions.expected as InputPropertyValue[])
				.some(exp => typeof exp !== currentType)) {
				throw new Error(`"${deepCurrentSchemaOptionsName}": expected "expected" to be an array of "${currentType}"`);
			}
		}
	}
}

function checkRequiredDefault(schema: ISchema, inputObject: IInputProperties, parentName: string): void {
	const fieldsToCheck = Object.entries(schema)
		.filter(([, value]) => value.hasOwnProperty('required') || value.hasOwnProperty('default'))
		.map(([key, value]) => ({
			name: key,
			...value.hasOwnProperty('default') && { default: value.default },
		}));

	fieldsToCheck.forEach(fieldToCheck => {
		const fullName = parentName === '' ? fieldToCheck.name : `${parentName}.${fieldToCheck.name}`;
		if (!inputObject.hasOwnProperty(fieldToCheck.name)) {
			if (fieldToCheck.default) {
				inputObject[fieldToCheck.name] = fieldToCheck.default;
			} else {
				throw Error(`"${fullName}": is required`);
			}
		}
	});
}

function objectValidator(schema: ISchema, inputObject: IInputProperties, parentName = ''): IOutputProperties {
	checkRequiredDefault(schema, inputObject, parentName);

	return Object.entries(inputObject).reduce((acc: IOutputProperties, [pName, pValue]) => {
		const fullName = parentName === '' ? pName : `${parentName}.${pName}`;
		acc[pName] = handleProperty(schema[pName], pValue, fullName);
		return acc;
	}, {});
}

export default (baseSchema: ISchema, inputObject: IInputProperties): IOutputProperties => {
	validateSchema(baseSchema);

	return objectValidator(baseSchema, inputObject);
};
