var env,
	DRAFTS = [
		"draft-00",
		"draft-01",
		"draft-02",
		"draft-03"
	],
	curDraftId;

//calls ok(true) if no error is thrown
function okNoError(func, msg) {
	try {
		func();
		ok(true, msg);
	} catch (e) {
		ok(false, msg + ': ' + JSON.stringify(e));
	}
}

//calls ok(true) if an error is thrown
function okError(func, msg) {
	try {
		func();
		ok(false, msg);
	} catch (e) {
		ok(true, msg + ': ' + JSON.stringify(e));
	}
}

//
//
// Tests
//
//

for (curDraftId = 0; curDraftId < DRAFTS.length; ++curDraftId) {

module(DRAFTS[curDraftId]);

(function (id) {
test("Acquire Validator", function () {
	JSV = require('../lib/jsv').JSV;
	env = null;
	
	ok(JSV, "JSV is loaded");
	
	env = JSV.createEnvironment("json-schema-draft-03");
	
	env.setOption("defaultSchemaURI", "http://json-schema.org/" + id + "/hyper-schema#");
	env.setOption("latestJSONSchemaSchemaURI", "http://json-schema.org/" + id + "/schema#");
	env.setOption("latestJSONSchemaHyperSchemaURI", "http://json-schema.org/" + id + "/hyper-schema#");
	env.setOption("latestJSONSchemaLinksURI", "http://json-schema.org/" + id + "/links#");
	
	ok(env, "Environment created");
	
});
}(DRAFTS[curDraftId]));

test("Primitive Validation", function () {
	equal(env.validate({}).errors.length, 0, "Object");
	equal(env.validate([]).errors.length, 0, "Array");
	equal(env.validate('').errors.length, 0, "String");
	equal(env.validate(00).errors.length, 0, "Number");
	equal(env.validate(false).errors.length, 0, "Boolean");
	equal(env.validate(null).errors.length, 0, "Null");
});
	
test("Type Validation", function () {
	//simple type
	equal(env.validate({}, { type : 'object' }).errors.length, 0, "Object");
	equal(env.validate([], { type : 'array' }).errors.length, 0, "Array");
	equal(env.validate('', { type : 'string' }).errors.length, 0, "String");
	equal(env.validate(00, { type : 'number' }).errors.length, 0, "Number");
	equal(env.validate(00, { type : 'integer' }).errors.length, 0, "Integer");
	equal(env.validate(false, { type : 'boolean' }).errors.length, 0, "Boolean");
	equal(env.validate(null, { type : 'null' }).errors.length, 0, "Null");
	equal(env.validate(true, { type : 'any' }).errors.length, 0, "Any");
	
	notEqual(env.validate(null, { type : 'object' }).errors.length, 0, "Object");
	notEqual(env.validate(null, { type : 'array' }).errors.length, 0, "Array");
	notEqual(env.validate(null, { type : 'string' }).errors.length, 0, "String");
	notEqual(env.validate(null, { type : 'number' }).errors.length, 0, "Number");
	notEqual(env.validate(0.1, { type : 'integer' }).errors.length, 0, "Integer");
	notEqual(env.validate(null, { type : 'boolean' }).errors.length, 0, "Boolean");
	notEqual(env.validate(false, { type : 'null' }).errors.length, 0, "Null");
	
	//union type
	equal(env.validate({}, { type : ['null', 'boolean', 'number', 'integer', 'string', 'array', 'object'] }).errors.length, 0, "Object");
	notEqual(env.validate({}, { type : ['null', 'boolean', 'number', 'integer', 'string', 'array'] }).errors.length, 0, "Object");
	
	//schema union type
	equal(env.validate({}, { type : [{ type : 'string' }, { type : 'object' }] }).errors.length, 0, "Object");
	equal(env.validate(55, { type : [{ type : 'string' }, { type : 'object' }, 'number'] }).errors.length, 0, "Object");
	notEqual(env.validate([], { type : ['string', { type : 'object' }] }).errors.length, 0, "Array");
});

test("Properties Validation", function () {
	equal(env.validate({}, { type : 'object', properties : {} }).errors.length, 0);
	equal(env.validate({ a : 1 }, { type : 'object', properties : { a : {}} }).errors.length, 0);
	equal(env.validate({ a : 1 }, { type : 'object', properties : { a : { type : 'number' }} }).errors.length, 0);
	equal(env.validate({ a : { b : 'two' } }, { type : 'object', properties : { a : { type : 'object', properties : { b : { type : 'string' } } }} }).errors.length, 0);
	
	notEqual(env.validate({ a : 1 }, { type : 'object', properties : { a : { type : 'string' }} }).errors.length, 0);
	notEqual(env.validate({ a : { b : 'two' } }, { type : 'object', properties : { a : { type : 'object', properties : { b : { type : 'number' } } }} }).errors.length, 0);
});

if (curDraftId > 2) {
test("PatternProperties Validation", function () {
	equal(env.validate(null, { patternProperties : {} }).errors.length, 0);
	equal(env.validate({}, { patternProperties : {} }).errors.length, 0);
	equal(env.validate({ a : 1 }, { patternProperties : { '[a-z]' : {}} }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2, cc : '3' }, { patternProperties : { '^[a-z]$' : { type : 'number' }} }).errors.length, 0);
	equal(env.validate({ a : { b : 'two' } }, { patternProperties : { '[a-z]' : { patternProperties : { '[a-z]' : { type : 'string' } } }} }).errors.length, 0);
		
	notEqual(env.validate({ a : 1, b : 2, c : '3' }, { patternProperties : { '^[a-z]$' : { type : 'number' }} }).errors.length, 0);
	notEqual(env.validate({ a : { b : 'two' } }, { patternProperties : { '[a-z]' : { patternProperties : { '[a-z]' : { type : 'number' } } }} }).errors.length, 0);
});
}

test("AdditionalProperties Validation", function () {
	//object tests
	equal(env.validate({ a : 1, b : 2, c : 3 }, {}).errors.length, 0);
	equal(env.validate({ a : 1, b : 2, c : 3 }, { additionalProperties : true }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2, c : 3 }, { properties : { a : {}, b : {} }, additionalProperties : true }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2, c : 3 }, { properties : { a : {}, b : {}, c : {} }, additionalProperties : false }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2, c : 3 }, { additionalProperties : { type : 'number' } }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2, c : 3 }, { properties : { a : {}, b : {} }, additionalProperties : { type : 'number' } }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2, c : 3 }, { properties : { a : {}, b : {}, c : {} }, additionalProperties : { type : 'string' } }).errors.length, 0);
	
	notEqual(env.validate({ a : 1, b : 2, c : 3 }, { properties : { a : {}, b : {} }, additionalProperties : false }).errors.length, 0);
	notEqual(env.validate({ a : 1, b : 2, c : 3 }, { properties : { a : {}, b : {} }, additionalProperties : { type : 'string' } }).errors.length, 0);
	
	//array tests
	equal(env.validate([1, 2, 3], {}).errors.length, 0);
	equal(env.validate([1, 2, 3], { additionalProperties : true }).errors.length, 0);
	equal(env.validate([1, 2, 3], { additionalProperties : false }).errors.length, 0);
	equal(env.validate([1, 2, 3], { additionalProperties : { type : 'number' } }).errors.length, 0);
	equal(env.validate([1, 2, 3], { additionalProperties : { type : 'string' } }).errors.length, 0);
	equal(env.validate(['1', '2'], { items : { type : 'string' }, additionalProperties : false }).errors.length, 0);
	equal(env.validate(['1', '2'], { items : [ { type : 'string' }, { type : 'string' } ], additionalProperties : false }).errors.length, 0);
	equal(env.validate(['1', '2', 3], { items : [ { type : 'string' }, { type : 'string' } ], additionalProperties : { type : 'number' } }).errors.length, 0);
	equal(env.validate(['1', '2', '3'], { items : [ { type : 'string' }, { type : 'string' }, { type : 'string' } ], additionalProperties : { type : 'number' } }).errors.length, 0);
	
	if (curDraftId < 3) {
	notEqual(env.validate(['1', '2', '3'], { items : [ { type : 'string' }, { type : 'string' } ], additionalProperties : false }).errors.length, 0);
	notEqual(env.validate(['1', '2', '3'], { items : [ { type : 'string' }, { type : 'string' } ], additionalProperties : { type : 'number' } }).errors.length, 0);
	}
});

test("Items Validation", function () {
	equal(env.validate([], { type : 'array', items : { type : 'string' } }).errors.length, 0);
	equal(env.validate(['foo'], { type : 'array', items : { type : 'string' } }).errors.length, 0);
	equal(env.validate(['foo', 2], { type : 'array', items : [{ type : 'string' }, { type : 'number' }] }).errors.length, 0);
	
	notEqual(env.validate([1], { type : 'array', items : { type : 'string' } }).errors.length, 0);
	notEqual(env.validate(['foo', 'two'], { type : 'array', items : [{ type : 'string' }, { type : 'number' }] }).errors.length, 0);
});

if (curDraftId > 2) {
test("AdditionalItems Validation", function () {
	//array tests
	equal(env.validate([1, 2, 3], {}).errors.length, 0);
	equal(env.validate([1, 2, 3], { additionalItems : true }).errors.length, 0);
	equal(env.validate([1, 2, 3], { additionalItems : { type : 'number' } }).errors.length, 0);
	equal(env.validate(['1', '2'], { items : { type : 'string' }, additionalItems : false }).errors.length, 0);
	equal(env.validate(['1', '2'], { items : [ { type : 'string' }, { type : 'string' } ], additionalItems : false }).errors.length, 0);
	equal(env.validate(['1', '2', 3], { items : [ { type : 'string' }, { type : 'string' } ], additionalItems : { type : 'number' } }).errors.length, 0);
	equal(env.validate(['1', '2', '3'], { items : [ { type : 'string' }, { type : 'string' }, { type : 'string' } ], additionalItems : { type : 'number' } }).errors.length, 0);
	
	notEqual(env.validate([1, 2, 3], { additionalItems : false }).errors.length, 0);
	notEqual(env.validate([1, 2, 3], { additionalItems : { type : 'string' } }).errors.length, 0);
	notEqual(env.validate(['1', '2', '3'], { items : [ { type : 'string' }, { type : 'string' } ], additionalItems : false }).errors.length, 0);
	notEqual(env.validate(['1', '2', '3'], { items : [ { type : 'string' }, { type : 'string' } ], additionalItems : { type : 'number' } }).errors.length, 0);
});
}

(function (curDraftId) {
test("Optional Validation", function () {
	equal(env.validate({}, { properties : { a : { optional : true } } }).errors.length, 0);
	equal(env.validate({ a : false }, { properties : { a : { optional : true } } }).errors.length, 0);
	equal(env.validate({ a : false }, { properties : { a : { optional : false } } }).errors.length, 0);
	
	notEqual(env.validate({}, { properties : { a : { optional : false } } }).errors.length, 0);
	notEqual(env.validate({ b : true }, { properties : { a : { optional : false } } }).errors.length, 0);
	if (curDraftId < 3) {
	notEqual(env.validate({ b : true }, { properties : { a : {} } }).errors.length, 0);
	} else {
	equal(env.validate({ b : true }, { properties : { a : {} } }).errors.length, 0);
	}
});
}(curDraftId));

if (curDraftId > 2) {
test("Required Validation", function () {
	equal(env.validate({ b : true }, { properties : { a : {} } }).errors.length, 0);
	equal(env.validate({}, { properties : { a : { required : false } } }).errors.length, 0);
	equal(env.validate({ a : false }, { properties : { a : { required : false } } }).errors.length, 0);
	equal(env.validate({ a : false }, { properties : { a : { required : true } } }).errors.length, 0);
	
	notEqual(env.validate({}, { properties : { a : { required : true } } }).errors.length, 0);
	notEqual(env.validate({ b : true }, { properties : { a : { required : true } } }).errors.length, 0);
});
}

test("Requires Validation", function () {
	equal(env.validate({ a : 1 }, { properties : { a : { requires : 'a' } } }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2 }, { properties : { a : {}, b : { requires : 'a' } } }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2 }, { properties : { a : { requires : 'b' }, b : { requires : 'a' } } }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2 }, { properties : { b : { requires : { properties : { a : { type : 'number' } } } } } }).errors.length, 0);
	
	notEqual(env.validate({ b : 2 }, { properties : { b : { requires : 'a' } } }).errors.length, 0);
	notEqual(env.validate({ a : 1, b : 2 }, { properties : { a : { requires : 'b' }, b : { requires : 'c' } } }).errors.length, 0);
	notEqual(env.validate({ b : 2 }, { properties : { b : { requires : { properties : { b : { type : 'string' } } } } } }).errors.length, 0);
});

if (curDraftId > 2) {
test("Dependencies Validation", function () {
	equal(env.validate(null, { dependencies : {} }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2 }, { dependencies : {} }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2 }, { dependencies : { a : 'b' } }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2 }, { dependencies : { c : 'd' } }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2, c : 3 }, { dependencies : { a : ['b'], b : ['a', 'c'] } }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2 }, { dependencies : { a : { properties : { b : { type : 'number', required : true } } } } }).errors.length, 0);
	
	notEqual(env.validate({ a : 1, b : 2 }, { dependencies : { a : 'c' } }).errors.length, 0);
	notEqual(env.validate({ a : 1, b : 2, c : 3 }, { dependencies : { a : ['b'], b : ['a', 'd'] } }).errors.length, 0);
	notEqual(env.validate({ a : 1, b : 2 }, { dependencies : { a : { properties : { b : { type : 'string', required : true } } } } }).errors.length, 0);
});
}

test("Minimum/Maximum Validation", function () {
	equal(env.validate(0, {}).errors.length, 0);
	equal(env.validate(1, { minimum : 1, maximum : 10 }).errors.length, 0);
	equal(env.validate(5, { minimum : 1, maximum : 10 }).errors.length, 0);
	equal(env.validate(10, { minimum : 1, maximum : 10 }).errors.length, 0);
	equal(env.validate(1, { minimum : 1, maximum : 1 }).errors.length, 0);
	
	notEqual(env.validate(0, { minimum : 1, maximum : 10 }).errors.length, 0);
	notEqual(env.validate(11, { minimum : 1, maximum : 10 }).errors.length, 0);
});

test("MinimumCanEqual/MaximumCanEqual Validation", function () {
	//true
	notEqual(env.validate(0, { minimumCanEqual : true, maximumCanEqual : true }).errors.length, 0);  //illegal
	equal(env.validate(1, { minimum : 1, maximum : 10, minimumCanEqual : true, maximumCanEqual : true }).errors.length, 0);
	equal(env.validate(5, { minimum : 1, maximum : 10, minimumCanEqual : true, maximumCanEqual : true  }).errors.length, 0);
	equal(env.validate(10, { minimum : 1, maximum : 10, minimumCanEqual : true, maximumCanEqual : true  }).errors.length, 0);
	equal(env.validate(1, { minimum : 1, maximum : 1, minimumCanEqual : true, maximumCanEqual : true  }).errors.length, 0);
	
	notEqual(env.validate(0, { minimum : 1, maximum : 10, minimumCanEqual : true, maximumCanEqual : true  }).errors.length, 0);
	notEqual(env.validate(11, { minimum : 1, maximum : 10, minimumCanEqual : true, maximumCanEqual : true  }).errors.length, 0);
	
	//false
	notEqual(env.validate(0, { minimumCanEqual : false, maximumCanEqual : false }).errors.length, 0);  //illegal
	equal(env.validate(1.0001, { minimum : 1, maximum : 10, minimumCanEqual : false, maximumCanEqual : false  }).errors.length, 0);
	equal(env.validate(5, { minimum : 1, maximum : 10, minimumCanEqual : false, maximumCanEqual : false  }).errors.length, 0);
	equal(env.validate(9.9999, { minimum : 1, maximum : 10, minimumCanEqual : false, maximumCanEqual : false  }).errors.length, 0);
	
	notEqual(env.validate(1, { minimum : 1, maximum : 10, minimumCanEqual : false, maximumCanEqual : false }).errors.length, 0);
	notEqual(env.validate(10, { minimum : 1, maximum : 10, minimumCanEqual : false, maximumCanEqual : false  }).errors.length, 0);
	notEqual(env.validate(1, { minimum : 1, maximum : 1, minimumCanEqual : false, maximumCanEqual : false  }).errors.length, 0);
	notEqual(env.validate(0, { minimum : 1, maximum : 10, minimumCanEqual : false, maximumCanEqual : false  }).errors.length, 0);
	notEqual(env.validate(11, { minimum : 1, maximum : 10, minimumCanEqual : false, maximumCanEqual : false  }).errors.length, 0);
});

if (curDraftId > 2) {
test("ExclusiveMinimum/ExclusiveMaximum Validation", function () {
	//true
	notEqual(env.validate(0, { exclusiveMinimum : false, exclusiveMaximum : false }).errors.length, 0);  //illegal
	equal(env.validate(1, { minimum : 1, maximum : 10, exclusiveMinimum : false, exclusiveMaximum : false }).errors.length, 0);
	equal(env.validate(5, { minimum : 1, maximum : 10, exclusiveMinimum : false, exclusiveMaximum : false  }).errors.length, 0);
	equal(env.validate(10, { minimum : 1, maximum : 10, exclusiveMinimum : false, exclusiveMaximum : false  }).errors.length, 0);
	equal(env.validate(1, { minimum : 1, maximum : 1, exclusiveMinimum : false, exclusiveMaximum : false  }).errors.length, 0);
	
	notEqual(env.validate(0, { minimum : 1, maximum : 10, exclusiveMinimum : false, exclusiveMaximum : false  }).errors.length, 0);
	notEqual(env.validate(11, { minimum : 1, maximum : 10, exclusiveMinimum : false, exclusiveMaximum : false  }).errors.length, 0);
	
	//false
	notEqual(env.validate(0, { exclusiveMinimum : true, exclusiveMaximum : true }).errors.length, 0);  //illegal
	equal(env.validate(1.0001, { minimum : 1, maximum : 10, exclusiveMinimum : true, exclusiveMaximum : true  }).errors.length, 0);
	equal(env.validate(5, { minimum : 1, maximum : 10, exclusiveMinimum : true, exclusiveMaximum : true  }).errors.length, 0);
	equal(env.validate(9.9999, { minimum : 1, maximum : 10, exclusiveMinimum : true, exclusiveMaximum : true  }).errors.length, 0);
	
	notEqual(env.validate(1, { minimum : 1, maximum : 10, exclusiveMinimum : true, exclusiveMaximum : true }).errors.length, 0);
	notEqual(env.validate(10, { minimum : 1, maximum : 10, exclusiveMinimum : true, exclusiveMaximum : true  }).errors.length, 0);
	notEqual(env.validate(1, { minimum : 1, maximum : 1, exclusiveMinimum : true, exclusiveMaximum : true  }).errors.length, 0);
	notEqual(env.validate(0, { minimum : 1, maximum : 10, exclusiveMinimum : true, exclusiveMaximum : true  }).errors.length, 0);
	notEqual(env.validate(11, { minimum : 1, maximum : 10, exclusiveMinimum : true, exclusiveMaximum : true  }).errors.length, 0);
});
}

test("MinItems/MaxItems Validation", function () {
	equal(env.validate([], {}).errors.length, 0);
	equal(env.validate([1], { minItems : 1, maxItems : 1 }).errors.length, 0);
	equal(env.validate([1], { minItems : 1, maxItems : 3 }).errors.length, 0);
	equal(env.validate([1, 2], { minItems : 1, maxItems : 3 }).errors.length, 0);
	equal(env.validate([1, 2, 3], { minItems : 1, maxItems : 3 }).errors.length, 0);
	
	notEqual(env.validate([], { minItems : 1, maxItems : 0 }).errors.length, 0);
	notEqual(env.validate([], { minItems : 1, maxItems : 3 }).errors.length, 0);
	notEqual(env.validate([1, 2, 3, 4], { minItems : 1, maxItems : 3 }).errors.length, 0);
});

if (curDraftId > 1) {
test("UniqueItems Validation", function () {
	equal(env.validate([], {}).errors.length, 0);
	equal(env.validate([], { uniqueItems : true }).errors.length, 0);
	equal(env.validate([null], { uniqueItems : true }).errors.length, 0);
	equal(env.validate([true, false], { uniqueItems : true }).errors.length, 0);
	equal(env.validate([1, 2, 3], { uniqueItems : true }).errors.length, 0);
	equal(env.validate(['a', 'b'], { uniqueItems : true }).errors.length, 0);
	equal(env.validate([[], []], { uniqueItems : true }).errors.length, 0);
	equal(env.validate([{}, {}], { uniqueItems : true }).errors.length, 0);
	
	notEqual(env.validate([null, null], { uniqueItems : true }).errors.length, 0);
	notEqual(env.validate([false, false], { uniqueItems : true }).errors.length, 0);
	notEqual(env.validate([1, 2, 1], { uniqueItems : true }).errors.length, 0);
	notEqual(env.validate(['a', 'b', 'b'], { uniqueItems : true }).errors.length, 0);
});
}

test("Pattern Validation", function () {
	equal(env.validate('', {}).errors.length, 0);
	equal(env.validate('', { pattern : '^$' }).errors.length, 0);
	equal(env.validate('', { pattern : /^$/ }).errors.length, 0);
	equal(env.validate('today', { pattern : 'day' }).errors.length, 0);
	
	notEqual(env.validate('', { pattern : '^ $' }).errors.length, 0);
	notEqual(env.validate('', { pattern : /^ $/ }).errors.length, 0);
	notEqual(env.validate('today', { pattern : 'dam' }).errors.length, 0);
	notEqual(env.validate('aaaaa', { pattern : 'aa(a' }).errors.length, 0);
});

test("MinLength/MaxLength Validation", function () {
	equal(env.validate('', {}).errors.length, 0);
	equal(env.validate('1', { minLength : 1, maxLength : 1 }).errors.length, 0);
	equal(env.validate('1', { minLength : 1, maxLength : 3 }).errors.length, 0);
	equal(env.validate('12', { minLength : 1, maxLength : 3 }).errors.length, 0);
	equal(env.validate('123', { minLength : 1, maxLength : 3 }).errors.length, 0);
	
	notEqual(env.validate('', { minLength : 1, maxLength : 0 }).errors.length, 0);
	notEqual(env.validate('', { minLength : 1, maxLength : 3 }).errors.length, 0);
	notEqual(env.validate('1234', { minLength : 1, maxLength : 3 }).errors.length, 0);
});

test("Enum Validation", function () {
	equal(env.validate(null, {}).errors.length, 0);
	equal(env.validate(true, { 'enum' : [false, true] }).errors.length, 0);
	equal(env.validate(2, { 'enum' : [1, 2, 3] }).errors.length, 0);
	equal(env.validate('a', { 'enum' : ['a'] }).errors.length, 0);
	equal(env.validate({}, { 'properties' : { 'a' : { 'enum' : ['a'], 'optional' : true, 'required' : false } } }).errors.length, 0);
	
	notEqual(env.validate(true, { 'enum' : ['false', 'true'] }).errors.length, 0);
	notEqual(env.validate(4, { 'enum' : [1, 2, 3, '4'] }).errors.length, 0);
	notEqual(env.validate('', { 'enum' : [] }).errors.length, 0);
	notEqual(env.validate({}, { 'properties' : { 'a' : { 'enum' : ['a'], 'optional' : false, 'required' : true } } }).errors.length, 0);
});

test("Format Validation", function () {
	//TODO
});

test("MaxDecimal Validation", function () {
	equal(env.validate(0, {}).errors.length, 0);
	equal(env.validate(0, { maxDecimal : 0 }).errors.length, 0);
	equal(env.validate(0, { maxDecimal : 1 }).errors.length, 0);
	equal(env.validate(0.22, { maxDecimal : 2 }).errors.length, 0);
	equal(env.validate(0.33, { maxDecimal : 3 }).errors.length, 0);
	
	notEqual(env.validate(0.1, { maxDecimal : 0 }).errors.length, 0);
	notEqual(env.validate(0.111, { maxDecimal : 1 }).errors.length, 0);
});

if (curDraftId > 1) {
test("DivisibleBy Validation", function () {
	equal(env.validate(0, {}).errors.length, 0);
	equal(env.validate(0, { divisibleBy : 1 }).errors.length, 0);
	equal(env.validate(10, { divisibleBy : 5 }).errors.length, 0);
	equal(env.validate(10, { divisibleBy : 10 }).errors.length, 0);
	equal(env.validate(0, { divisibleBy : 2.5 }).errors.length, 0);
	equal(env.validate(5, { divisibleBy : 2.5 }).errors.length, 0);
	equal(env.validate(7.5, { divisibleBy : 2.5 }).errors.length, 0);
	
	notEqual(env.validate(0, { divisibleBy : 0 }).errors.length, 0);
	notEqual(env.validate(7, { divisibleBy : 5 }).errors.length, 0);
	notEqual(env.validate(4.5, { divisibleBy : 2 }).errors.length, 0);
	notEqual(env.validate(7.5, { divisibleBy : 1.8 }).errors.length, 0);
});
}

test("Disallow Validation", function () {
	equal(env.validate({}, { disallow : ['null', 'boolean', 'number', 'integer', 'string', 'array'] }).errors.length, 0, "Object");
	equal(env.validate([], { disallow : ['null', 'boolean', 'number', 'integer', 'string', 'object'] }).errors.length, 0, "Array");
	equal(env.validate('', { disallow : ['null', 'boolean', 'number', 'integer', 'array', 'object'] }).errors.length, 0, "String");
	equal(env.validate(0.1, { disallow : ['null', 'boolean', 'integer', 'string', 'array', 'object'] }).errors.length, 0, "Number");
	equal(env.validate(00, { disallow : ['null', 'boolean', 'string', 'array', 'object'] }).errors.length, 0, "Integer");
	equal(env.validate(false, { disallow : ['null', 'number', 'integer', 'string', 'array', 'object'] }).errors.length, 0, "Boolean");
	equal(env.validate(null, { disallow : ['boolean', 'number', 'integer', 'string', 'array', 'object'] }).errors.length, 0, "Null");
	
	notEqual(env.validate({}, { disallow : 'object' }).errors.length, 0, "Object");
	notEqual(env.validate([], { disallow : 'array' }).errors.length, 0, "Array");
	notEqual(env.validate('', { disallow : 'string' }).errors.length, 0, "String");
	notEqual(env.validate(00, { disallow : 'integer' }).errors.length, 0, "Number");
	notEqual(env.validate(0.1, { disallow : 'number' }).errors.length, 0, "Integer");
	notEqual(env.validate(false, { disallow : 'boolean' }).errors.length, 0, "Boolean");
	notEqual(env.validate(null, { disallow : 'null' }).errors.length, 0, "Null");
	notEqual(env.validate(null, { disallow : 'any' }).errors.length, 0, "Any");
});

test("Extends Validation", function () {
	equal(env.validate({}, { 'extends' : {} }).errors.length, 0);
	equal(env.validate({}, { 'extends' : { type : 'object' } }).errors.length, 0);
	equal(env.validate(1, { type : 'integer', 'extends' : { type : 'number' } }).errors.length, 0);
	equal(env.validate({ a : 1, b : 2 }, { properties : { a : { type : 'number' } }, additionalProperties : false, 'extends' : { properties : { b : { type : 'number' } } } }).errors.length, 0);
	
	notEqual(env.validate(1, { type : 'number', 'extends' : { type : 'string' } }).errors.length, 0);
	
	//TODO: More tests
});

test("JSON Schema Validation", function () {
	var schema = env.findSchema(env.getOption("latestJSONSchemaSchemaURI"));
	var hyperSchema = env.findSchema(env.getOption("latestJSONSchemaHyperSchemaURI"));
	var links = env.findSchema(env.getOption("latestJSONSchemaLinksURI"));
	
	equal(schema.validate(schema).errors.length, 0, "schema.validate(schema)");
	equal(hyperSchema.validate(schema).errors.length, 0, "hyperSchema.validate(schema)");
	equal(hyperSchema.validate(hyperSchema).errors.length, 0, "hyperSchema.validate(hyperSchema)");
	equal(hyperSchema.validate(links).errors.length, 0, "hyperSchema.validate(links)");
});

(function(curDraftId){
test("Links Validation", function () {
	var schema, instance;
	//full
	equal(env.validate({ 'a' : {} }, { 'type' : 'object', 'additionalProperties' : { '$ref' : '#' } }).errors.length, 0);
	notEqual(env.validate({ 'a' : 1 }, { 'type' : 'object', 'additionalProperties' : { '$ref' : '#' } }).errors.length, 0);
	
	//describedby
	okNoError(function () {
		schema = env.createSchema({ "id" : "http://test.example.com/3", "properties" : { "test" : { "type" : "object" } }, "extends" : { "$ref" : "http://json-schema.org/draft-03/schema#" } }, null, "http://test.example.com/3");
		equal(env.validate({}, { "$schema" : "http://test.example.com/3", "test" : {} }).errors.length, 0);
		notEqual(env.validate({}, { "$schema" : "http://test.example.com/3", "test" : 0 }).errors.length, 0);
	}, "describedby schema");
	
	//self
	okNoError(function () {
		schema = env.createSchema({ "properties" : { "two" : { "id" : "http://test.example.com/2", "type" : "object" } } }, null, "http://not.example.com/2");
		equal(env.validate({}, { "$ref" : "http://test.example.com/2" }).errors.length, 0);
		notEqual(env.validate(null, { "$ref" : "http://test.example.com/2" }).errors.length, 0);
	}, "self schema");
	
	//links api
	okNoError(function () {
		schema = env.createSchema({ "links" : [ { "rel" : "bar", "href" : "http:" + (curDraftId < 3 ? "{-this}" : "{@}") + "#" } ] });
		instance = env.createInstance("foo");
		equal(schema.getLink("bar", instance), "http:foo#", "'bar' link and self reference");
	}, "links api schema");
	
	//invalid reference
	(env.getOption("validateReferences") ? okError : okNoError)(function () {
		schema = env.createSchema({ "$ref" : "asdf:qwerty" });  //should throw error
	}, "invalid reference");
});
}(curDraftId));

test("PathStart Validation", function () {
	var instance = env.createInstance({}, "http://test.example.com/4"),
		schema = env.createSchema({"pathStart" : "http://test.example.com"});
	
	equal(env.validate(instance, schema).errors.length, 0);
	
	instance = env.createInstance({});  //random URI
	
	notEqual(env.validate(instance, schema).errors.length, 0);
});

test("Register Schemas", function () {
	var schema = env.createSchema({'type' : 'string'}, null, 'http://test.example.com/1');
	equal(env.findSchema(env.getOption("latestJSONSchemaHyperSchemaURI")).validate(schema).errors.length, 0);
	equal(env.validate('', { '$ref' : 'http://test.example.com/1' }).errors.length, 0);
	notEqual(env.validate({}, { '$ref' : 'http://test.example.com/1' }).errors.length, 0);
});

test("Complex Examples", function () {
	//example 1
	env.createSchema({
	   "id":"Common#",
	   "type":"object",
	   "properties":{
	       "!":{"type":"string","enum":["Common"]}
	   },
	   "additionalProperties":false
	}, undefined, "Common#");
	
	var report = env.validate({
		  "!" : "List",
		  "list" : [
		    {
		      "!" : "Text",
		      "common" : {"!":"NotCommon"}
		    }
		  ],
		  "common" : {"!":"Common"}
		},
		
		{
		   "properties":{
		       "!":{"type":"string","enum":["List"]},
		       "list":{
		           "type":"array",
		           "items":{
		               "type":[
		                   {
		                       "type":"object",
		                       "properties":{
		                           "!":{"type":"string","enum":["Music"]},
		                           "common":{"$ref":"Common#"}
		                       }
		                   },
		                   {
		                       "type":"object",
		                       "properties":{
		                           "!":{"type":"string","enum":["Text"]},
		                           "common":{"$ref":"Common#"}
		                       }
		                   }
		               ]
		           }
		       },
		
		       "common":{"$ref":"Common#"}
		   }
		}
	);
	
	notEqual(report.errors.length, 0);
});

}