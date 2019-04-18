# Vue.js + TSX on Laravel Mix

Setting up laravel mix + Vue.js + TypeScript + TSX

# Overview

To use Vue.js + TSX on Laravel Mix, you need to do

- install plugins for JSX transpile.
- create a few config files for ts-loader and babel-loader.
- overwrite webpack.config.js to use appropriate loader for TSX


# Detail

## create laravel project
`composer create-project --prefer-dist laravel/laravel Vue-TSX-LaravelMix`


## install node_modules
`cd Vue-TSX-LaravelMix`

```
npm install
npm install --save-dev @babel/plugin-syntax-jsx
npm install --save-dev @vue/babel-plugin-transform-vue-jsx
npm install --save-dev @vue/babel-helper-vue-jsx-merge-props

npm install --save-dev vue-property-decorator
```


## create babel config file
create file named '.babelrc'

```
{
    "plugins": ["@vue/babel-plugin-transform-vue-jsx"]
}
```



## create ts config file
create file named 'tsconfig.json'

```
{
  "compilerOptions": {
    "target": "es5",
    "module": "esnext",
    "strict": true,
    "jsx": "preserve",
    "importHelpers": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "baseUrl": ".",
    "types": [
      "node",
      "jquery"
    ],
    "paths": {
      "@/*": [
        "resources/js/*"
      ]
    },
    "lib": [
      "esnext",
      "dom",
      "dom.iterable",
      "scripthost"
    ]
  },
  "include": [
    "resources/js/**/*"
  ],
  "exclude": [
    "node_modules"
  ]
}
```



## create route for test page
modify ./routes/web.php

```
Route::get('/', function () {
    return view('welcome');
});

// append this part
Route::get('/test', function () {
    return view('test');
});
```



## create view for test page
create file ./resources/views/test.blade.php

```
<!DOCTYPE html>
<html>
    <head>
        <script src="{{ asset('js/test.js') }}" defer></script>
    </head>
    <body>
        <div id="app-root">
            APP-ROOT-DIV
        </div>
    </body>
</html>
```


## create type definition file for JSX
create file ./resources/js/shims-tsx.d.ts

```
import Vue, { VNode } from 'vue';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
```




## create Vue app
create file ./resources/js/test.tsx

```
import { Component, Vue } from 'vue-property-decorator';
import { CreateElement, VNode } from 'vue';

@Component({
})
class Tmp extends Vue {
  render(h: CreateElement): VNode {
    return (
      <div id="first">
        First Div
        <div id="second">
            Second Div
          <div id="third">
            Third Div
          </div>
        </div>
      </div>
    );
  }
}

new Vue({
  render: (h: CreateElement) => <Tmp></Tmp>,
}).$mount('#app-root');
```



## modify webpack config for mix
modify ./webpack.mix.js

```
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
```




## transpile assets
`npm run dev`


## run server
`php artisan serve`

## check result

http://localhost:8000/test



## notice 1. set "jsx" to "preserve"
It's important to set "jsx" to "preserve" in tsconfig.json.
```
{
    "compilerOptions": {
        "jsx": "preserve"
    }
}
```
If you set "jsx" to "react", and "jsxFactory" to "h", only first div is transpiled and children disappear.


## notice 2. overwrite webpack's rule for tsx
laravel mix has only one loader 'ts-loader' for 'tsx' file.

`./node_modules/laravel-mix/src/components/TypeScript.js`

```
    /**
     * webpack rules to be appended to the master config.
     */
    webpackRules() {
        return [].concat(super.webpackRules(), {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            options: {
                appendTsSuffixTo: [/\.vue$/]
            }
        });
    }

```

laravel mix doesn't use 'babel-loader' after applying 'ts-loader'
We have to replace module.rules for 'tsx' to use both 'babel-loader' and 'ts-loader'.


## notice 3. wrong setting example of webpack.mix.js
this is a wrong example of webpack.mix.js

```
mix.webpackConfig({
   module: {
      rules: [
         {
            test: /\.tsx$/,
            use: [
               {
                  loader: 'babel-loader'
               },
               {
                  loader: 'ts-loader'
               }
            ]
         }
      ]
   }
})
```

laravel mix just **appends** custom config, so if you write custom config just like above, webpack will use following loaders.

```
1. ts-loader (custom config written by you)
2. babel-loader (custom config written by you)
3. ts-loader (again! this is written in ./node_modules/laravel-mix/src/components/TypeScript.js)
```

after 1., code is transpiled from ts to js, so every type information disappear.
when loading the code with no type information by step 3, you can get a storm of warnings and errors.
(but code itself works fine.)


# Finally
I hope everyone have a fun of constructing typed frontend application.
