"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const through2 = require('through2');
const PluginError = require("plugin-error");
const XLSX = require("xlsx");
const PLUGIN_NAME = 'gulp-etl-tap-spreadsheet';
const loglevel = require("loglevel");
const log = loglevel.getLogger(PLUGIN_NAME);
log.setLevel((process.env.DEBUG_LEVEL || 'warn'));
function createRecord(recordObject, streamName) {
    return { type: "RECORD", stream: streamName, record: recordObject };
}
function createLines(linesArr, streamName) {
    let returnErr = null;
    let tempArr = [];
    for (let lineIdx in linesArr) {
        try {
            let lineObj = linesArr[lineIdx];
            let tempLine;
            tempLine = createRecord(lineObj, streamName);
            if (tempLine) {
                let tempStr = JSON.stringify(tempLine);
                log.debug(tempStr);
                tempArr.push(tempStr);
            }
        }
        catch (err) {
            returnErr = new PluginError(PLUGIN_NAME, err);
        }
    }
    return tempArr;
}
function tapSpreadSheet(configObj) {
    if (!configObj)
        configObj = {};
    if (!configObj.columns)
        configObj.columns = true;
    const strm = through2.obj(function (file, enc, callback) {
        let returnErr = null;
        if (file.isNull()) {
            //return empty file
            return callback(returnErr, file);
        }
        else if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, 'Trying to stream from unstreamable file');
        }
        else if (file.isBuffer()) {
            let workbook = XLSX.read(file.contents, { type: "buffer" });
            let linesArr = [];
            let sheetLines = [];
            var resultArray = [];
            for (let sheetIdx in workbook.SheetNames) {
                linesArr = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[sheetIdx]]);
                sheetLines = createLines(linesArr, workbook.SheetNames[sheetIdx]);
                resultArray = resultArray.concat(sheetLines);
            }
            let data = resultArray.join('\n');
            file.contents = Buffer.from(data);
            log.debug('calling callback');
            callback(returnErr, file);
        }
    });
    return strm;
}
exports.tapSpreadSheet = tapSpreadSheet;
//# sourceMappingURL=plugin.js.map