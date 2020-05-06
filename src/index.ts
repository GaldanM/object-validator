import moment from 'moment';
import {
	HandleParamsTuple, HandleTypeFunctions,
	IRouteParams, IRouteParamsOutput,
	ISchemaRouteParam, ISchemaRouteParams,
	ParamValue, ParamValueOutput, SchemaRouteParamsAllowedTypes,
} from '../types/ObjectValidator';

function handleString(pValue: ParamValue, pName: string): string {
	if (typeof pValue === 'string') {
		return pValue;
	}

	throw new Error(`"${pName}": expected String but received "${typeof pValue}"`);
}
function handleNumber(pValue: ParamValue, pName: string): number {
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
function handleBoolean(pValue: ParamValue, pName: string): boolean {
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
function handleDate(pValue: ParamValue, pName: string): moment.Moment {
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

function handleArray(schema: ISchemaRouteParam, pValue: ParamValue | ParamValue[], pName: string): ParamValueOutput[] {
	const pArray = Array.isArray(pValue) ? pValue : [pValue];
	const [itemType] = schema.type as SchemaRouteParamsAllowedTypes[];
	const itemSchema = { ...schema, type: itemType };

	return pArray.map((value, index) => handleParam(itemSchema, value, `${pName}[${index}]`));
}

function handleParam(schema: ISchemaRouteParam, pValue: ParamValue, pName: string): ParamValueOutput | ParamValueOutput[] {
	if (Array.isArray(schema.type)) {
		return handleArray(schema, pValue, pName);
	}

	const newValue: ParamValueOutput = pValue;

	const typesToHandle: HandleTypeFunctions = {
		string: handleString,
		number: handleNumber,
		boolean: handleBoolean,
		date: handleDate,
	};

	return typesToHandle[schema.type](newValue, pName);
}

export default function(schemaParams: ISchemaRouteParams, routeParams: IRouteParams): IRouteParamsOutput {
	const params = Object.entries(routeParams);

	const checkedParams: HandleParamsTuple[] = params.map(([pName, pValue]) => {
		const schema = schemaParams[pName];

		const newValue = handleParam(schema, pValue, pName);

		return [pName, newValue];
	});

	return checkedParams.reduce((acc: IRouteParams, [cName, cValue]) => {
		acc[cName] = cValue;
		return acc;
	}, {});
}
