# BabylonJS MeshEditor


## About

A mesh editor for BabylonJS.

## Quick start

1) add the following dependencies 
 ```
<script src="https://cdn.babylonjs.com/babylon.js"></script>
<script src="EditControl.min.js"></script>
<script src="MeshEditor.min.js"></script>
```
See INSTALL below to find where you can get "MeshEditor.min.js".  

2) a small javascript code snippet to get you up and running
```
  //------------------MeshEditor -------------------------------------------------
  var MeshEditor = org.ssatguru.babylonjs.component.MeshEditor;
  var me = new new MeshEditor(mesh,camera,canvas,scene);
  me.start();
```

see index.html in "demo" folder for a working example  
[https://github.com/ssatguru/BabylonJS-MeshEditor/blob/master/demo/index.html](https://github.com/ssatguru/BabylonJS-MeshEditor/blob/master/demo/index.html)

## INSTALL

You can get the "MeshEditor.min.js" from its git repository "dist" folder or "releases" section  
[https://github.com/ssatguru/BabylonJS-MeshEditor/tree/master/dist](https://github.com/ssatguru/BabylonJS-MeshEditor/tree/master/dist)  
[https://github.com/ssatguru/BabylonJS-MeshEditor/releases](https://github.com/ssatguru/BabylonJS-MeshEditor/releases)  

You can also install it from npm  (TODO)
```
npm install babylonjs-mesheditor 
```
  
Note that even though this is available in npm it is not packaged as a node module or any other type of module.  
For now, to keep it simple and avoid dependencies on module systems, the application is packaged as a simple javascript "namespaced" application.  
In other words load it using the "script" tag and refer to it using the global name "org.ssatguru.babylonjs.component.MeshEditor".  

## API
#### To Instantiate
```
// JavaScript
var MeshEditor = org.ssatguru.babylonjs.component.MeshEditor;
var me = new new MeshEditor(mesh,camera,canvas,scene);
```
```
// TypeScript
import MeshEditor = org.ssatguru.babylonjs.component.MeshEditor;
let me = new new MeshEditor(mesh,camera,canvas,scene);
```
Takes four parms
* mesh - the mesh to edit
* camera - camera
* canvas - canvas
* scene - scene

## Build
If not already installed, install node js and typescript.  
Switch to the project folder.  
Run "npm install", once, to install all the dependencies (these, for now, are babylonjs, editcontrol, and uglify).  
To build anytime  
Run "npm run compile" - this will compile the typescript file and store the javascript file in the "dist" folder.  
Run "npm run min" - this will minify the javascript file and store the minified version in the "dist" folder.  
Run "npm run build" - this will both compile and minify. 
Use the "test.html" in demo folder to test your changes.  


