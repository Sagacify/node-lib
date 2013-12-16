/*!
*
* This script crawls the public/js directory and searches for .HTML files
* with data-i18n attributes that are duplicates or not present in the
* translation files.
*
*/

var fs = require('fs');
var async = require('async');

var ROOT_DIR = '../../..';
var STATIC_DIR = 'public/development';
var PROJECT_DIR = 'js';
var TRANSLATION_DIR = 'languages';


function find_data_i18n (data) {
	return data.match(/(data\-i18n="[^"]+")/g);
}

function parse_html_file (filename, callback) {
	fs.readFile(filename, function (e, data) {
		if(e) {
			callback(e);
		}
		else {
			var data_i18n = find_data_i18n(data);
			var i18n_keys = data_i18n.map(function (i18n) {
				return i18n.replace('data-i18n=', '').replace(/\"/g, '');
			});
			callback(null, i18n_keys);
		}
	});
}

function read_translation_files (path) {
	var filenames = fs.readdirSync(path);
	var translations = {};
	var filename;
	for(var i = 0, len = filenames.length; i < len; i++) {
		filename = filenames[i].split('.');
		if(fs.lstatSync(path + '/' + filename).isFile() && filename.pop().toLowerCase() === 'json') {
			filename = filename.join('');
			translations[filename] = require(path + '/' + filename);
		}
	}
	return translations;
}

function search_translation (translations, key) {
	key = key.replace(/\[[^\]]+\]/, '');
	var languages = Object.keys(translations);
	var len = languages.length;
	var matches = {};
	var match = true;
	var lang;
	while(len--) {
		lang = languages[len];
		translation = translations[lang].disassemble_Object(key);
		matches[lang] = translation;
		if(!translation) {
			match = false;
			break;
		}
	}
	return match;
}

function search_all_translations (i18n_attrs) {
	var path = ROOT_DIR + '/' + STATIC_DIR + '/' + TRANSLATION_DIR;
	var translations = read_translation_files();
	var report = [];
	var i18n_attr;
	var hasMatch;
	for(var i = 0, len = i18n_attrs.length; i < len; i++) {
		i18n_attr = i18n_attrs[i];
		hasMatch = search_translation(translations, i18n_attr);
		if(hasMatch !== true) {
			report.push(i18n_attr);
		}
	}
	return report;
}

function recursive_crawler (path, callback) {
	var filenames = fs.readdirSync(path);
	console.log(filenames);
	async.each(filenames, function (filename, cb) {
		if(fs.lstatSync(path + '/' + filename).isFile() && filename.split('.').pop().toLowerCase() === 'html') {
			console.log('Reading ' + filename + ' ...');
			parse_html_file(filename, cb);
		}
		else if(fs.lstatSync(path + '/' + filename).isDirectory()) {
			recursive_crawler(path + '/' + filename);
		}
	}, function (e, results) {
		if(e) {
			console.log(e);
		}
		else {
			var i18n_attrs = results.reduce(function (base, item) {
				return item ? base.concat() : base;
			}, []);
			var report = search_all_translations(i18n_attrs);
			console.log(report);
		}
	});
}

recursive_crawler(ROOT_DIR + '/' + STATIC_DIR + '/' + PROJECT_DIR);
