let gulp = require('gulp')
import { tapSpreadSheet } from '../src/plugin-tap-xlsx'
import * as rename from 'gulp-rename'
import Vinyl = require('vinyl') 
const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;
const errorHandler = require('gulp-error-handle'); // handle all errors in one handler, but still stop the stream if there are errors
import * as loglevel from 'loglevel'
const log = loglevel.getLogger('gulpfile')
log.setLevel((process.env.DEBUG_LEVEL || 'warn') as log.LogLevelDesc)
// if needed, you can control the plugin's logging level separately from 'gulpfile' logging above
// const pluginLog = loglevel.getLogger(PLUGIN_NAME)
// pluginLog.setLevel('debug')

function runTapSpreadSheet(callback: any) {
  log.info('gulp task starting for ' + PLUGIN_NAME)
  return gulp.src(['../testdata/*', '!../testdata/ignore', '!../testdata/processed'])
    .pipe(errorHandler(function(err:any) {
      log.error('Error: ' + err)
      callback(err)
    }))
    .on('data', function (file:Vinyl) {
      log.info('Starting processing on ' + file.basename)
    })    
    .pipe(tapSpreadSheet({columns:true/*, info:true */}))
    .pipe(rename({ extname: ".ndjson" }))
    .pipe(gulp.dest('../testdata/processed'))
    .on('data', function (file:Vinyl) {
      log.info('Finished processing on ' + file.basename)
    })    
    .on('end', function () {
      log.info('gulp task complete')
      callback()
    })
}

exports.default = gulp.series(runTapSpreadSheet)