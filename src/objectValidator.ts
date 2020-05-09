import moment from 'moment';
import {
	IHandleFunctionMap, IInputProperties, IOutputProperties,
	ISchema, ObjectPropertyValue, OutputPropertyValue,
	SchemaAllowedTypes, SchemaOptions, SchemaOptionsObject,
} from '../index';

function handleString(pValue: ObjectPropertyValue, pName: string): string {
	if (typeof pValue === 'string') {
		return pValue;
	}

	throw new Error(`"${pName}": expected String but received "${typeof pValue}"`);
}
function handleNumber(pValue: ObjectPropertyValue, pName: string): number {
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
function handleBoolean(pValue: ObjectPropertyValue, pName: string): boolean {
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
function handleDate(pValue: ObjectPropertyValue, pName: string): moment.Moment {
	if (typeof pValue === 'boolean') {
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
function handleObject(pValue: ObjectPropertyValue, pName: string, innerSchema: ISchema): object {
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

	return objectValidator(innerSchema, receivedObject);
}

function handleArray(schema: SchemaOptions, pValue: ObjectPropertyValue | ObjectPropertyValue[], pName: string): OutputPropertyValue[] {
	const pArray = Array.isArray(pValue) ? pValue : [pValue];
	const [itemType] = schema.type as SchemaAllowedTypes[];
	const itemSchema = { ...schema, type: itemType } as SchemaOptions;

	return pArray.map((value, index) => handleProperty(itemSchema, value, `${pName}[${index}]`));
}

function handleProperty(schemaOptions: SchemaOptions, pValue: ObjectPropertyValue, pName: string): OutputPropertyValue | OutputPropertyValue[] {
	if (Array.isArray(schemaOptions.type)) {
		return handleArray(schemaOptions, pValue, pName);
	}

	const newValue: OutputPropertyValue = pValue;

	const typesToHandle: IHandleFunctionMap = {
		string: handleString,
		number: handleNumber,
		boolean: handleBoolean,
		date: handleDate,
		object: handleObject,
	};

	return typesToHandle[schemaOptions.type](newValue, pName, (schemaOptions as SchemaOptionsObject).properties);
}

function validateSchema(schema: ISchema, propertyName = ''): void {
	// eslint-disable-next-line guard-for-in
	for (const currentPropertyName in schema) {
		const currentProperty = schema[currentPropertyName];
		const deepCurrentPropertyName = `${propertyName === '' ? '' : `${propertyName}.`}${currentPropertyName}`;

		if (typeof currentProperty !== 'object') {
			throw new Error(`${deepCurrentPropertyName}: expected object but got "${typeof currentProperty}" instead`);
		}

		if (!currentProperty.hasOwnProperty('type')) {
			throw new Error(`${deepCurrentPropertyName}: missing "type" property in schema options`);
		}

		if (currentProperty.type === 'object') {
			if (currentProperty.hasOwnProperty('properties')) {
				const currentOptionsObject = currentProperty as SchemaOptionsObject;
				const nestedSchema = currentOptionsObject.properties;
				if (typeof nestedSchema === 'object') {
					validateSchema(nestedSchema, deepCurrentPropertyName);
				} else {
					throw new Error(`${deepCurrentPropertyName}: incorrect property "properties", expected SchemaOptionsObject`);
				}
			} else {
				throw new Error(`${deepCurrentPropertyName}: missing "properties" property in schema options`);
			}
		}
	}
}
function objectValidator(baseSchema: ISchema, inputObject: IInputProperties): IOutputProperties {
	return Object.entries(inputObject).reduce((acc: IInputProperties, [pName, pValue]) => {
		acc[pName] = handleProperty(baseSchema[pName], pValue, pName);
		return acc;
	}, {});
}

export default (baseSchema: ISchema, inputObject: IInputProperties): IOutputProperties => {
	validateSchema(baseSchema);

	return objectValidator(baseSchema, inputObject);
};
