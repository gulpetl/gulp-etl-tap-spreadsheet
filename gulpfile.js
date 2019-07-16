var gulp = require("gulp");
var tapSpreadSheet = require("./src/plugin").tapSpreadSheet;

function runTapSpreadSheet(callback) {
    return gulp
        .src(["./testdata/*", "!./testdata/ignore", "!./testdata/processed"])
        .pipe(tapSpreadSheet({ type: "buffer" }, { raw: false }))
        .pipe(gulp.dest("./testdata/processed"));
}

exports["default"] = gulp.series(runTapSpreadSheet);
