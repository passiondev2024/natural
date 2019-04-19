'use strict';

var gulp = require('gulp');

gulp.task('copy:themes', function() {
    return gulp.src(['projects/natural/src/lib/_natural.theme.scss'])
               .pipe(gulp.dest('dist/natural/theming'));
});
