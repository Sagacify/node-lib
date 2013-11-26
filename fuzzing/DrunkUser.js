var special_Strings = [
	'',
	'.',
	'_',
	'-',
	'+',
	'˙',
	'"',
	'<',
	'>',
	';',
	'&',
	'@',
	'\\',
	'\n',
	'\r',
	'\'',
	'\n\r',
	'%00',
	'\x00',
	'\u0000',
	'\0',
	'null',
	'ﬂ∂∏ı',
	'void',
	'void "a"',
	'void 1',
	new String()
];

var special_Numbers = [
	0,
	-1,
	1,
	Infinity,
	Number.NaN,
	Number.NEGATIVE_INFINITY,
	Number.POSITIVE_INFINITY,
	Number.MAX_VALUE,
	Number.MAX_VALUE + Number.MAX_VALUE,
	Number.MIN_VALUE - Number.MIN_VALUE,
	Number.MIN_VALUE + Number.MAX_VALUE,
	Number.MAX_VALUE - Number.MIN_VALUE
];

var special_Booleans = [
	true,
	false,
	new Boolean()
];

function primitive_undefined () {
	return;
}

var special_Primitives = [
	null,
	undefined,
	primitive_undefined(),
	void 1
];

// DATES
var special_Dates = [
	new Date(8640000000000000),
	new Date(8640000000000001),
	new Date(-8640000000000001)
];

var special_Objects = [
	{},
	new Object(),
	new Object(null),
	new Object(undefined)
];

var special_Arrays = [
	[],
	new Array()
];

function get_filled_Objects () {
	var filled_Objects = [];
	var object;
	for(var i = 0; i < special_Strings; i++) {
		object = {};
		object[special_Strings[i]] = true;
		filled_Objects[i].push(object);
	}
	return filled_Objects;
}

function get_filled_Array () {
	var filled_Array = [];
	var array;
	for(var i = 0; i < special_Numbers; i++) {
		array = [];
		array[special_Numbers[i]] = true;
		filled_Array[i].push(object);
	}
	return filled_Array;
}

var results = {
	'Array': special_Arrays.concat(get_filled_Array()),
	'String': special_Strings,
	'Number': special_Numbers,
	'Object': special_Objects.concat(get_filled_Objects()),
	'Boolean': special_Booleans,
	'Primitives': special_Primitives
};

var json_types = Object.keys(results);

function gen_all_special_Values () {
	var all_values = [];
	var keys = Object.keys(results);
	var len = keys.length;
	var i;
	while(len--) {
		i = keys[len];
		all_values = all_values.concat(results[i]);
	}
	return all_values;
}

results.all_special_values = gen_all_special_Values();
results.too_long_string = new Buffer(0xFFFD).toString();
results.json_types = json_types;

module.exports = results;
