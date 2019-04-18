const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/js/app.js', 'public/js')
   .sass('resources/sass/app.scss', 'public/css');

mix.webpackConfig({
   resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue'],
      alias: {
         '@': __dirname + '/resources/js'
      }
   },
})

mix.ts('resources/js/test.tsx', 'public/js');

mix.extend(
   'overwriteRuleForTsx',
   new class {
      webpackConfig(webpackConfig) {
         webpackConfig.module.rules.forEach(function(rule, index){
            if ('' + rule.test === '' + /\.tsx?$/) {
               if (rule.loader) {
                  delete rule['loader'];
               }
               if (rule.options) {
                  delete rule['options'];
               }
               rule.use = [
                  {
                     loader: 'babel-loader'
                  },
                  {
                     loader: 'ts-loader'
                  }
               ];
            }
         }) ;
      }
   }()
)

mix.overwriteRuleForTsx();
