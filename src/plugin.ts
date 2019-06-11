const through2 = require('through2');
import PluginError= require('plugin-error')
import XLSX = require('xlsx')
const PLUGIN_NAME= 'gulp-etl-tap-spreadsheet'
import * as loglevel from 'loglevel'
const log = loglevel.getLogger(PLUGIN_NAME)
log.setLevel((process.env.DEBUG_LEVEL || 'warn') as log.LogLevelDesc)

function createRecord(recordObject:Object, streamName: string) : any {
    return {type:"RECORD", stream:streamName, record:recordObject}
}

function createLines(linesArr: any, streamName: any){
    let returnErr: any = null
    let tempArr = []
    for (let lineIdx in linesArr) {
        try{
            let lineObj:any = linesArr[lineIdx]
            let tempLine: any
            tempLine = createRecord(lineObj, streamName)
            if (tempLine) {
                let tempStr = JSON.stringify(tempLine)
                log.debug(tempStr)
                tempArr.push(tempStr)
            }
        }
        catch (err){
            returnErr = new PluginError(PLUGIN_NAME, err)
        }
    }
    return tempArr
}

export function tapSpreadSheet(configObj:any){
    if (!configObj) configObj = {}
    if (!configObj.columns) configObj.columns = true

    const strm = through2.obj( function (file: any, enc:any, callback:any ){
        let returnErr: any = null
        if ( file.isNull() ){
            //return empty file
            return callback(returnErr, file)
        }
        else if ( file.isStream() ){
            throw new PluginError(PLUGIN_NAME, 'Trying to stream from unstreamable file')
        }
        else if ( file.isBuffer() ){
            let workbook = XLSX.read(file.contents, {type:"buffer"})
            let linesArr: any = []
            let sheetLines = []
            var resultArray: any= [];
            for( let sheetIdx in workbook.SheetNames){
                linesArr = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[sheetIdx]])
                sheetLines = createLines(linesArr, workbook.SheetNames[sheetIdx])
                resultArray = resultArray.concat(sheetLines)
            }
            let data: string = resultArray.join('\n')
            file.contents = Buffer.from(data);
            log.debug('calling callback');
            callback(returnErr, file)
        }
    })

    return strm;
}