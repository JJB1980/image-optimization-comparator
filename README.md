# Image optimization comparator app.

An app to compare the size of source images to the output of an optimization plugin run at build time.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

```
npm i --save image-optimization-comparator
```

```
yarn add image-optimization-comparator
```

See example.js for an example of running the app.  Alternatively run from the command line.
```
node [script] [file size range e.g. 100-400] [preview switch: -p on -x off] [src directory] [web directory]
```
e.g.
```
node example 100-400 -x /src/ /web/
```

## Authors

* **John Bowden** - [JJB1980](https://github.com/JJB1980)
