import moment from 'moment';
import objectValidator, { ISchema } from '../index';

jest.spyOn(console, 'warn').mockImplementation();

const schema = {
	str: { type: 'string' },
	nbr: { type: 'number' },
	bool: { type: 'boolean' },
	date: { type: 'date' },
	strs: { type: ['string'] },
	obj: {
		type: 'object',
		properties: {
			nbr: { type: 'number' },
		},
	},
	objDeep: {
		type: 'object',
		properties: {
			nested: {
				type: 'object',
				properties: {
					nestedField: { type: 'number' },
				},
			},
		},
	},
} as ISchema;

describe('schemas', () => {
	it('good schema', () => {
		expect.assertions(1);

		expect(() => objectValidator(schema, { nbr: 2 })).not.toThrow(Error);
	});
	describe('wrong schema', () => {
		it('missing required properties', () => {
			expect.assertions(1);

			const wrongSchema = {
				nbr: {},
			};

			// @ts-expect-error
			expect(() => objectValidator(wrongSchema, { nbr: 2 })).toThrow(Error);
		});
		it('wrong schema options type', () => {
			expect.assertions(1);

			const wrongSchema = {
				nbr: 'number',
			};

			// @ts-expect-error
			expect(() => objectValidator(wrongSchema, { nbr: 2 })).toThrow(Error);
		});
		it('missing "properties" in object definition', () => {
			expect.assertions(1);

			const wrongSchema = {
				obj: { type: 'object' },
			};

			// @ts-expect-error
			expect(() => objectValidator(wrongSchema, { nbr: 2 })).toThrow(Error);
		});
		it('wrong "properties" type in object definition', () => {
			expect.assertions(1);

			const wrongSchema = {
				obj: {
					type: 'object',
					properties: 'nbr: 2',
				},
			};

			// @ts-expect-error
			expect(() => objectValidator(wrongSchema, { obj: { nbr: 2 } })).toThrow(Error);
		});
		it('wrong "properties" type in deep object definition', () => {
			expect.assertions(1);

			const wrongSchema = {
				obj: {
					type: 'object',
					properties: {
						deepObj: {
							type: 'object',
							properties: 'nbr: 2',
						},
					},
				},
			};

			// @ts-expect-error
			expect(() => objectValidator(wrongSchema, { obj: { nbr: 2 } })).toThrow(Error);
		});
	});
});
describe('types', () => {
	describe('string', () => {
		it('good type', () => {
			expect.assertions(1);

			const params = { str: 'tata' };
			expect(objectValidator(schema, params)).toMatchObject(params);
		});
		it('wrong type', () => {
			expect.assertions(1);

			expect(() => objectValidator(schema, { str: 2 })).toThrow(Error);
		});
	});
	describe('number', () => {
		describe('good types', () => {
			it('number', () => {
				expect.assertions(1);

				const params = { nbr: 2 };
				expect(objectValidator(schema, params)).toMatchObject(params);
			});
			it('number string', () => {
				expect.assertions(1);

				expect(objectValidator(schema, { nbr: '2' })).toMatchObject({ nbr: 2 });
			});
		});
		describe('wrong types', () => {
			it('non-number string', () => {
				expect.assertions(1);

				expect(() => objectValidator(schema, { nbr: 'tata' })).toThrow(Error);
			});
			it('non-numberable types', () => {
				expect.assertions(2);

				expect(() => objectValidator(schema, { nbr: true })).toThrow(Error);
				expect(() => objectValidator(schema, { nbr: new Date() })).toThrow(Error);
			});
		});
	});
	describe('boolean', () => {
		describe('good types', () => {
			it('boolean', () => {
				expect.assertions(2);

				let params = { bool: false };
				expect(objectValidator(schema, params)).toMatchObject(params);

				params = { bool: true };
				expect(objectValidator(schema, params)).toMatchObject(params);
			});
			it('boolean strings', () => {
				expect.assertions(2);

				expect(objectValidator(schema, { bool: 'false' })).toMatchObject({ bool: false });
				expect(objectValidator(schema, { bool: 'true' })).toMatchObject({ bool: true });
			});
		});
		describe('wrong types', () => {
			it('non-boolean string', () => {
				expect.assertions(1);

				expect(() => objectValidator(schema, { bool: 'tata' })).toThrow(Error);
			});
			it('non-booleanable type', () => {
				expect.assertions(1);

				expect(() => objectValidator(schema, { bool: 2 })).toThrow(Error);
			});
		});
	});
	describe('date', () => {
		describe('good types', () => {
			it('number', () => {
				expect.assertions(1);

				const date = 0;
				const result = objectValidator(schema, { date }).date as moment.Moment;

				expect(result.toISOString()).toBe(moment(date).toISOString());
			});
			it('date object', () => {
				expect.assertions(1);

				const date = new Date(0);
				const result = objectValidator(schema, { date }).date as moment.Moment;

				expect(result.toISOString()).toBe(moment(0).toISOString());
			});
			it('date string', () => {
				expect.assertions(3);

				const date = {
					formatted: Date(),
					ISO: moment(0).toISOString(),
					number: '1234567890',
				};
				let result = objectValidator(schema, { date: date.formatted }).date as moment.Moment;
				expect(result.toISOString()).toBe(moment(date.formatted).toISOString());

				result = objectValidator(schema, { date: date.ISO }).date as moment.Moment;
				expect(result.toISOString()).toBe(moment(0).toISOString());

				result = objectValidator(schema, { date: date.number }).date as moment.Moment;
				expect(result.toISOString()).toBe(moment(Number(date.number)).toISOString());
			});
		});
		describe('wrong types', () => {
			// Non-date objects are not tested because "moment" ignores non-date objects
			it('non-date number', () => {
				expect.assertions(2);

				expect(() => objectValidator(schema, { date: 9999999999999999 })).toThrow(Error);
				expect(() => objectValidator(schema, { date: -9999999999999999 })).toThrow(Error);
			});
			it('non-date string', () => {
				expect.assertions(1);

				expect(() => objectValidator(schema, { date: 'tata' })).toThrow(Error);
			});
			it('non-dateable type', () => {
				expect.assertions(1);

				expect(() => objectValidator(schema, { date: true })).toThrow(Error);
			});
		});
	});
	describe('object', () => {
		describe('good types', () => {
			describe('object', () => {
				it('simple field', () => {
					expect.assertions(1);

					const params = { obj: { nbr: 2 } };

					expect(objectValidator(schema, params)).toMatchObject(params);
				});
				it('complex field', () => {
					expect.assertions(1);

					const params = { obj: { nbr: '2' } };

					expect(objectValidator(schema, params)).toMatchObject({ obj: { nbr: 2 } });
				});
				it('deep', () => {
					expect.assertions(1);

					const params = { objDeep: { nested: { nestedField: '2' } } };

					expect(objectValidator(schema, params)).toMatchObject({ objDeep: { nested: { nestedField: 2 } } });
				});
			});
			it('json-string object', () => {
				expect.assertions(1);

				const params = { obj: JSON.stringify({ nbr: 2 }) };

				expect(objectValidator(schema, params)).toMatchObject({ obj: { nbr: 2 } });
			});
		});
		describe('wrong types', () => {
			it('json-string array', () => {
				expect.assertions(1);

				const params = { obj: JSON.stringify([{ nbr: 2 }]) };

				expect(() => objectValidator(schema, params)).toThrow(Error);
			});
			it('non json-string', () => {
				expect.assertions(1);

				expect(() => objectValidator(schema, { obj: 'nbr: 2' })).toThrow(Error);
			});
			it('any other types', () => {
				expect.assertions(1);

				expect(() => objectValidator(schema, { obj: 2 })).toThrow(Error);
			});
		});
	});
	describe('array', () => {
		describe('single value', () => {
			it('good type', () => {
				expect.assertions(3);

				const params = { strs: 'hello' };

				const strs = objectValidator(schema, params).strs as string[];
				expect(strs).toHaveLength(1);
				expect(typeof strs[0]).toBe('string');
				expect(strs[0]).toStrictEqual(params.strs);
			});
			it('wrong type', () => {
				expect.assertions(1);

				expect(() => objectValidator(schema, { strs: 1 })).toThrow(Error);
			});
		});
		describe('multiple values', () => {
			it('good type', () => {
				expect.assertions(3);

				const params = { strs: ['hello', 'world'] };

				const result = objectValidator(schema, params);
				const strs = result.strs as string[];
				expect(strs).toHaveLength(params.strs.length);
				strs.forEach(str => expect(typeof str).toBe('string'));
			});
			it('wrong type', () => {
				expect.assertions(1);

				expect(() => objectValidator(schema, { strs: [1, 2] })).toThrow(Error);
			});
		});
	});
});
describe('extra features', () => {
	describe('required', () => {
		const schemaRequired = { reqNbr: { type: 'number', required: true } } as ISchema;

		it('required not missing', () => {
			expect.assertions(1);

			const params = { reqNbr: 2 };

			expect(objectValidator(schemaRequired, params)).toMatchObject(params);
		});
		it('required missing', () => {
			expect.assertions(1);

			expect(() => objectValidator(schemaRequired, {})).toThrow(Error);
		});
		it('required nested missing', () => {
			expect.assertions(1);

			const schemaRequiredDeep = {
				reqObj: {
					type: 'object',
					properties: {
						reqNestedNbr: {
							type: 'number',
							required: true,
						},
					},
				},
			} as ISchema;

			expect(() => objectValidator(schemaRequiredDeep, { reqObj: {} })).toThrow(Error);
		});
	});
	describe('default', () => {
		const schemaRequired = { reqNbr: { type: 'number', default: 1 } } as ISchema;

		it('field not missing', () => {
			expect.assertions(1);

			const params = { reqNbr: 2 };

			expect(objectValidator(schemaRequired, params)).toMatchObject(params);
		});
		it('field missing', () => {
			expect.assertions(1);

			expect(objectValidator(schemaRequired, {})).toMatchObject({ reqNbr: 1 });
		});
		it('field nested missing', () => {
			expect.assertions(1);

			const schemaRequiredDeep = {
				reqObj: {
					type: 'object',
					properties: {
						reqNestedNbr: {
							type: 'number',
							default: 1,
						},
					},
				},
			} as ISchema;

			expect(objectValidator(schemaRequiredDeep, { reqObj: {} }))
				.toMatchObject({ reqObj: { reqNestedNbr: 1 } });
		});
	});
});
