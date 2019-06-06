let gulp = require('gulp')
import { tapCsv } from '../src/plugin'
import { tapXlsx } from '../src/plugin-tap-xlsx'
import * as loglevel from 'loglevel'
const log = loglevel.getLogger('gulpfile')
log.setLevel((process.env.DEBUG_LEVEL || 'warn') as log.LogLevelDesc)
import XLSX =require('xlsx');
// if needed, you can control the plugin's logging level separately from 'gulpfile' logging above
// const pluginLog = loglevel.getLogger(PLUGIN_NAME)
// pluginLog.setLevel('debug')

import * as rename from 'gulp-rename'
const errorHandler = require('gulp-error-handle'); // handle all errors in one handler, but still stop the stream if there are errors

const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;

import Vinyl = require('vinyl') 

let gulpBufferMode = false;

function switchToBuffer(callback: any) {
  gulpBufferMode = true;

  callback();
}

function runTapCsv(callback: any) {
  log.info('gulp task starting for ' + PLUGIN_NAME)
  return gulp.src('../freshmen classes.xlsx')
  // return gulp.src('../testdata/*.csv',{buffer:gulpBufferMode})
    .pipe(errorHandler(function(err:any) {
      log.error('Error: ' + err)
      callback(err)
    }))
    .on('data', function (file:Vinyl) {
      log.info('Starting processing on ' + file.basename)
    })    
    // .pipe(tapCsv({columns:true/*, info:true */}))
    .pipe(tapXlsx({columns:true/*, info:true */}))
    .pipe(gulp.dest('../testdata/processed'))
    .on('data', function (file:Vinyl) {
      log.info('Finished processing on ' + file.basename)
    })    
    .on('end', function () {
      log.info('gulp task complete')
      callback()
    })

}

export function csvParseWithoutGulp(callback: any) {

  const parse = require('csv-parse')

  var parser = parse({delimiter: ',', columns:true});
  
  require('fs').createReadStream('../testdata/cars.csv').pipe(parser)
  .on("data",(data:any)=>{
    console.log(data)
  });
  
}

exports.default = gulp.series(runTapCsv)
exports.runTapCsvBuffer = gulp.series(switchToBuffer, runTapCsv)

//ADD TEST FILES / TAKE OUT CSV FILES
//CHANGE READ ME
//CHANGE DEBUG RUNNING ORDER/ GET RID OF SOME 
//OPTIONS ARE GONNA BE COMPLETELY DIFFERENT FOR EACH PROJECT
//INCLUDE BUNCH OF TEST FILES!!
//HAVE TO INCLUDE MULTIPLE DIFFERENT TYPES OF FILES
//COULD GIVE CHOICES ON WHICH SHEET TO LOOK AT, OR COULD GIVE NO OPTIONS
//IF THEY PASS IN WORKSHEET NAME, HAVE IT WHERE IT WILL TAKE IT, AND PASS IT INTO THE SHEETNAMES PART
//IF TIME
        //IF WE CAN SPILT EACH TAB INTO OWN FILE THAT WOULD BE IDEAL

// XLSX, XLS, DBF, CSV, HTML, ODS
//INCLUDE ABOVE TEST TYPES, AND TRY TO GET IT TO WHERE ITLL HANDLE THEM

//DATA.GOV OPEN DATA
//BASICALLY GET THESE TYPES OF TEST FILES