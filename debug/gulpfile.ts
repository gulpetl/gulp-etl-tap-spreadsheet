let gulp = require("gulp");
import { tapSpreadSheet } from "../src/plugin";
import Vinyl = require("vinyl");
const errorHandler = require("gulp-error-handle"); // handle all errors in one handler, but still stop the stream if there are errors
import * as loglevel from "loglevel";
const log = loglevel.getLogger("gulpfile");
log.setLevel((process.env.DEBUG_LEVEL || "warn") as loglevel.LogLevelDesc);
const pkginfo = require("pkginfo")(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;

function runTapSpreadSheet(callback: any) {
    log.info("gulp task starting for " + PLUGIN_NAME);
    return gulp
        .src(["../testdata/*", "!../testdata/ignore", "!../testdata/processed"])
        .pipe(
            errorHandler(function(err: any) {
                log.error("Error: " + err);
                callback(err);
            })
        )
        .on("data", function(file: Vinyl) {
            log.info("Starting processing on " + file.basename);
        })
        .pipe(
            tapSpreadSheet({
                type: "buffer"
            })
        )
        .pipe(gulp.dest("../testdata/processed"))
        .on("data", function(file: Vinyl) {
            log.info("Finished processing on " + file.basename);
        })
        .on("end", function() {
            log.info("gulp task complete");
            callback();
        });
}

function tapHeaders(callback: any) {
    log.info("gulp task starting for " + PLUGIN_NAME);
    return gulp
        .src(["../testdata/*", "!../testdata/ignore", "!../testdata/processed"])
        .pipe(
            errorHandler(function(err: any) {
                log.error("Error: " + err);
                callback(err);
            })
        )
        .on("data", function(file: Vinyl) {
            log.info("Starting processing on " + file.basename);
        })
        .pipe(
            tapSpreadSheet(
                { type: "buffer" },
                { header: "A" } //The headers become the alphabet
            )
        )
        .pipe(gulp.dest("../testdata/processed"))
        .on("data", function(file: Vinyl) {
            log.info("Finished processing on " + file.basename);
        })
        .on("end", function() {
            log.info("gulp task complete");
            callback();
        });
}

function tapRowArrays(callback: any) {
    log.info("gulp task starting for " + PLUGIN_NAME);
    return gulp
        .src(["../testdata/*", "!../testdata/ignore", "!../testdata/processed"])
        .pipe(
            errorHandler(function(err: any) {
                log.error("Error: " + err);
                callback(err);
            })
        )
        .on("data", function(file: Vinyl) {
            log.info("Starting processing on " + file.basename);
        })
        .pipe(
            tapSpreadSheet(
                { type: "buffer" },
                { header: 1 } //This changes it to where each line is an array
            )
        )
        .pipe(gulp.dest("../testdata/processed"))
        .on("data", function(file: Vinyl) {
            log.info("Finished processing on " + file.basename);
        })
        .on("end", function() {
            log.info("gulp task complete");
            callback();
        });
}

exports.default = gulp.series(runTapSpreadSheet);
exports.headers = gulp.series(tapHeaders);
exports.arrays = gulp.series(tapRowArrays);
