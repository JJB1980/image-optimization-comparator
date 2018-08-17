# Image optimization comparator app.

An app to compare the size of source images to the output of an optimization plugin run at build time.
FOr example, pair with [copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin) and [imagemin-webpack-plugin](https://github.com/Klathmon/imagemin-webpack-plugin)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

npm:
```
npm i --save-dev image-optimization-comparator
```

yarn:
```
yarn add -D image-optimization-comparator
```

See example.js for an example of running the app.  Alternatively run from the command line.
```
node [script] [file size range e.g. 100-400] [preview switch: -p on -x off] [sort=file/size/percent] [src directory] [web directory]
```
e.g.
```
node example 100-400 -p file /src/ /web/
```

## Authors

* **John Bowden** - [JJB1980](https://github.com/JJB1980)
