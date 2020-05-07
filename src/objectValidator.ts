import moment from 'moment';
import {
	ObjecPropertyTuple, HandleTypeFunctions,
	IObjectProperties, IOutputProperties,
	ISchemaOptions, ISchema,
	ObjectPropertyValue, OutputPropertyValue, SchemaAllowedTypes,
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

function handleArray(schema: ISchemaOptions, pValue: ObjectPropertyValue | ObjectPropertyValue[], pName: string): OutputPropertyValue[] {
	const pArray = Array.isArray(pValue) ? pValue : [pValue];
	const [itemType] = schema.type as SchemaAllowedTypes[];
	const itemSchema = { ...schema, type: itemType };

	return pArray.map((value, index) => handleProperty(itemSchema, value, `${pName}[${index}]`));
}

function handleProperty(schema: ISchemaOptions, pValue: ObjectPropertyValue, pName: string): OutputPropertyValue | OutputPropertyValue[] {
	if (Array.isArray(schema.type)) {
		return handleArray(schema, pValue, pName);
	}

	const newValue: OutputPropertyValue = pValue;

	const typesToHandle: HandleTypeFunctions = {
		string: handleString,
		number: handleNumber,
		boolean: handleBoolean,
		date: handleDate,
	};

	return typesToHandle[schema.type](newValue, pName);
}

function objectValidator(schemaParams: ISchema, routeParams: IObjectProperties): IOutputProperties {
	const params = Object.entries(routeParams);

	const checkedParams: ObjecPropertyTuple[] = params.map(([pName, pValue]) => {
		const schema = schemaParams[pName];

		const newValue = handleProperty(schema, pValue, pName);

		return [pName, newValue];
	});

	return checkedParams.reduce((acc: IObjectProperties, [cName, cValue]) => {
		acc[cName] = cValue;
		return acc;
	}, {});
}

export default objectValidator;
