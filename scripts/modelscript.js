import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129/examples/jsm/controls/OrbitControls.js';

import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";


//we need a scene, camera, and renderer
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//keep track of mouse position
let mouseX = window.innerWidth /2;
let mouseY = window.innerHeight / 2;

let object;
let controls;
let objToRender = "ladder";
//new gltf loader
const loader = new GLTFLoader();
//load the gltf file
loader.load( 
   "models/ladder.glb",
   function (gltf) {
    //if the file is loaded, add it to the scene
    object = gltf.scene;
    scene.add(object);
   },
   function (xhr) {
    //while it is loading, lof the progress
    console.log((xhr.loaded / xhr.total*100) + '% loaded');
   },
   function (error) {
    //if there is an error, log it
    console.error(error);
   }    
);


const renderer = new THREE.WebGLRenderer({alpha: true}); //alpha allows for transparent background
renderer.setSize(window.innerWidth, window.innerHeight);
console.log("here")
//add renderer to the COM

document.getElementById("container3D").appendChild(renderer.domElement);
console.log("here")
//set how far the camera will be from the model
camera.position.z = objToRender == "ladder" ? 25 : 500;

//adding lights to the scene
const topLight = new THREE.DirectionalLight(0xffffff, 1); //color, intensity
topLight.position.set(500,500,500);
topLight.castShader = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, objToRender== "ladder"? 5 : 1);
scene.add(ambientLight);

//add controls to camera so we can rotate / zoom within the screen
if (objToRender == "ladder") {
    controls = new OrbitControls(camera, renderer.domElement);
}

//render the scene
function animate(){
    requestAnimationFrame(animate);
    
    //make the ladder move
    if (object && objToRender == "ladder" ) {
        object.rotation.y = -3 + mouseX / window.innerWidth * 3;
    object.rotation.x = -1.2 + mouseY * 2.5 / window.innerHeight;
    }
    renderer.render(scene, camera);
}

//add a listener to the window so we can resize
window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / this.window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

//add mosue position listener, so we can make the eye move
document.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
} 

console.log("here")
//start the rendering
animate();
