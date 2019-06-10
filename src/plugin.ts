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

function convertToJson(file:any){
    let workbook = XLSX.read(file.contents, {type:"buffer"}) 
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
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
            let sheetArr = convertToJson(file)
            
            let tempLine: any;
            let resultArray= [];
            for (let dataIdx in sheetArr) {
                try{
                    let lineObj:any = sheetArr[dataIdx]
                    tempLine = createRecord(lineObj, 'tap-spreadsheet')
                    if (tempLine) {
                        let tempStr = JSON.stringify(tempLine)
                        log.debug(tempStr)
                        resultArray.push(tempStr)
                    }
                }
                catch (err){
                    returnErr = new PluginError(PLUGIN_NAME, err)
                }
            }
            let data: string = resultArray.join('\n')
            file.contents = Buffer.from(data);
            log.debug('calling callback');
            callback(returnErr, file)
        }
    })

    return strm;
}