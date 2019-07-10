"use strict";
exports.__esModule = true;
var through2 = require('through2');
var PluginError = require("plugin-error");
var XLSX = require("xlsx");
var replaceExt = require('replace-ext');
var pkginfo = require('pkginfo')(module); // project package.json info into module.exports
var PLUGIN_NAME = module.exports.name;
var loglevel = require("loglevel");
var log = loglevel.getLogger(PLUGIN_NAME);
log.setLevel((process.env.DEBUG_LEVEL || 'warn'));

function createRecord(recordObject, streamName) {
    return {
        type: "RECORD",
        stream: streamName,
        record: recordObject
    };
}

function createLines(linesArr, streamName) {
    var returnErr = null;
    var tempArr = [];
    for (var lineIdx in linesArr) {
        try {
            var lineObj = linesArr[lineIdx];
            var tempLine = void 0;
            tempLine = createRecord(lineObj, streamName);
            if (tempLine) {
                var tempStr = JSON.stringify(tempLine);
                log.debug(tempStr);
                tempArr.push(tempStr);
            }
        } catch (err) {
            returnErr = new PluginError(PLUGIN_NAME, err);
        }
    }
    return tempArr;
}

function tapSpreadSheet(configObj) {
    if (!configObj)
        configObj = {};
    var strm = through2.obj(function (file, enc, callback) {
        var returnErr = null;
        if (file.isNull()) {
            //return empty file
            return callback(returnErr, file);
        } else if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, 'Does not support streaming');
        } else if (file.isBuffer()) {
            var workbook = XLSX.read(file.contents, configObj);
            var linesArr = [];
            var sheetLines = [];
            var resultArray = [];
            for (var sheetIdx in workbook.SheetNames) {
                linesArr = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[sheetIdx]]);
                sheetLines = createLines(linesArr, workbook.SheetNames[sheetIdx]);
                resultArray = resultArray.concat(sheetLines);
            }
            var data = resultArray.join('\n');
            file.contents = Buffer.from(data);
            file.path = replaceExt(file.path, '.ndjson');
            log.debug('calling callback');
            callback(returnErr, file);
        }
    });
    return strm;
}

exports.tapSpreadSheet = tapSpreadSheet;