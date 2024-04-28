import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui'
import * as jquery from "https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js";
import { shininess } from 'three/examples/jsm/nodes/Nodes.js';

//importing local files

//initializing the window and some important variables
const scene = new THREE.Scene();

const container = document.getElementById("viewer");

const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( container.clientWidth, container.clientHeight);

container.appendChild(renderer.domElement);

const controls = new OrbitControls( camera, renderer.domElement );

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


//initiailizing materials first so the canvas can read off of it

let filepath = '../models/animeface.gltf'; //for addMeshes
let material = new THREE.MeshPhongMaterial( {
    side: THREE.DoubleSide,
 

    
} ); //for canvas initialization
let mesh;
let currmeshindex = 0;
let meshes = ["/models/cow_unwrapped.gltf", "/models/animeface.gltf"]
let lights = [];


//drawing app init items
const canvas = document.getElementById("drawingapp"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
opacitySlider = document.querySelector("#opacity-slider"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
generateMesh =  document.querySelector(".generate-mesh"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img"),
importImg =  document.querySelector(".import-img"),
importMesh =  document.querySelector(".import-glb"),
ctx = canvas.getContext("2d");
material.map = new THREE.CanvasTexture(canvas);
// global variables with default value


//calls
preload();
drawingapp();
animate();



//Drawing app for the canvas
async function drawingapp() {
    let drawingOnMesh = false;
    let drawingOnCanvas = false;
    let prevMouseX, prevMouseY, snapshot,
        isDrawing = false,
        selectedTool = "brush",
        brushWidth = 5,
        opacity = 1,
        selectedColor = "#000";
    const setCanvasBackground = () => {
        // setting whole canvas background to white, so the downloaded img background will be white
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = selectedColor; // setting fillstyle back to the selectedColor, it'll be the brush color
    }
    window.addEventListener("load", () => {
        // setting canvas width/height.. offsetwidth/height returns viewable width/height of an element
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        setCanvasBackground();
    });

  
    let lastBrushX;
    let lastBrushY;
  
    const startDraw = (e) => {
        
        prevMouseX = e.offsetX; // passing current mouseX position as prevMouseX value
        prevMouseY = e.offsetY; // passing current mouseY position as prevMouseY value
        
        isDrawing = true;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.fillStyle = selectedColor; // passing selectedColor as fill style
        ctx.globalAlpha = opacity;
        ctx.beginPath(); // creating new path to draw

        ctx.lineWidth = brushWidth; // passing brushSize as line width
        ctx.strokeStyle = selectedColor; // passing selectedColor as stroke style
        // copying canvas data & passing as snapshot value.. this avoids dragging the image
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

        //setting lastbrushx and lastbrushy 
        raycaster.setFromCamera( pointer, camera );
        //cast a ray and find uv coordinates to draw onto
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
             controls.enabled = false;
             //the raycaster found a face to paint on
             const intersection = intersects[0];
             //calculating brsuh positions from uv coordinates
            lastBrushX = intersection.uv.x*canvas.width;
            lastBrushY = (1 - intersection.uv.y)*canvas.height; //top left corner is 0 
        }
     
    }
    const drawing = (e) => {
        
        if (!isDrawing) return; // if isDrawing is false return from here
        ctx.putImageData(snapshot, 0, 0); // adding copied canvas data on to this canvas
        if (selectedTool === "brush" || selectedTool === "eraser") {
            if (drawingOnCanvas) {
                ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
                ctx.stroke(); // drawing/filling line with color
                material.map =  new THREE.CanvasTexture(canvas);
            }  else if (drawingOnMesh) {
                raycaster.setFromCamera( pointer, camera );
               //cast a ray and find uv coordinates to draw onto
               const intersects = raycaster.intersectObjects(scene.children);
               if (intersects.length > 0) {
                    controls.enabled = false;
                    //the raycaster found a face to paint on
                    const intersection = intersects[0];
                    //calculating brsuh positions from uv coordinates
                  
                    var brushX = intersection.uv.x*canvas.width;
                    var brushY = (1 - intersection.uv.y)*canvas.height; //top left corner is 0
        
                    if ((Math.abs(brushX - lastBrushX) < 30) && (Math.abs(brushY - lastBrushY) < 30)) {
              
                        ctx.lineTo(brushX, brushY); // creating line according to the mouse pointer
                        ctx.stroke(); // drawing/filling line with color
                        //saving the last positions
                    } else {
                        ctx.lineTo(lastBrushX, lastBrushY); // creating line according to the mouse pointer
                        ctx.stroke();
                        startDraw(e);
                    }
                    lastBrushX = brushX;
                    lastBrushY = brushY;
                    
                    

                    material.map =  new THREE.CanvasTexture(canvas);
               }  
            }
        } 
        
    }
    toolBtns.forEach(btn => {
        btn.addEventListener("click", () => { // adding click event to all tool option
            // removing active class from the previous option and adding on current clicked option
            document.querySelector(".options .active").classList.remove("active");
            btn.classList.add("active");
            selectedTool = btn.id;
        });
    });
    sizeSlider.addEventListener("change", () => { // passing slider value as brushSize
        brushWidth = sizeSlider.value;
    });

    opacitySlider.addEventListener("change", () => { // passing slider value as opacity 
        opacity = opacitySlider.value/100.0;
    });
    // brush size cursor display change
    document.onmousemove = function(e){
        var circle = document.getElementById("circle");
        circle.style.top = e.clientY+"px";
        circle.style.left = e.clientX+"px";
        circle.style.width = brushWidth+"px";
        circle.style.height = brushWidth+"px";
    }
    colorBtns.forEach(btn => {
        btn.addEventListener("click", () => { // adding click event to all color button
            // removing selected class from the previous option and adding on current clicked option
            document.querySelector(".options .selected").classList.remove("selected");
            btn.classList.add("selected");
            // passing selected btn background color as selectedColor value
            selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
        });
    });
    colorPicker.addEventListener("change", () => {
        // passing picked color value from color picker to last color btn background
        colorPicker.parentElement.style.background = colorPicker.value;
        colorPicker.parentElement.click();
    });
    clearCanvas.addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // clearing whole canvas
        material.map =new THREE.CanvasTexture(canvas);
        setCanvasBackground();
    });
    saveImg.addEventListener("click", () => {
        const link = document.createElement("a"); // creating <a> element
        link.download = `${Date.now()}.png`; // passing current date as link download value
        link.href = canvas.toDataURL(); // passing canvasData as link href value
        link.click(); // clicking link to download image
    });
    importImg.addEventListener("click", () => {
        // TODO: Import an image into the scene and have it appear on the drawing app canvas. 
        // You may wanna look at CanvasRenderingContext2D's drawImage() down below:
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
        // Useful variables to keep track of:
        //  canvas - the drawing app canvas
        //  ctx - a CanvasRenderingContext2D instance. Handles all the 2D drawing stuff
        console.log("does nothing rn")
    });
    importMesh.addEventListener("click", () => {
        // TODO: HANDLE LOADING A MESH into the scene and replace it with the cow. 
        // You may wanna read this for more context: 
        // This thread may help: https://stackoverflow.com/questions/67864724/threejs-load-gltf-model-directly-from-file-input
        // creating urls: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
        //this guy does the same thing: https://gltf-viewer.donmccurdy.com

        //Useful variables to keep track of:
        // filepath - filepath of the imported mesh local to this repo
        // addMeshes(file_path) - takes a string of a filepath as an argument to load and 
        //    reassign the variable "mesh" to the newly imported mesh
        console.log("does nothing rn")
    });
    generateMesh.addEventListener("click", () => {
        currmeshindex = (currmeshindex + 1) % meshes.length;
        loadMesh()
    });


    canvas.addEventListener("mousedown", (event) => {
        drawingOnMesh = false;
        drawingOnCanvas = true;
        startDraw(event);

    });
    canvas.addEventListener("mousemove", drawing);
    canvas.addEventListener("mouseup", () => {
        controls.enabled = true;
        drawingOnMesh = false;
        drawingOnCanvas = false;
        isDrawing = false;
    });

    //event listeners for the 3d viewer
    renderer.domElement.addEventListener('mousedown', (event) => {
        raycaster.setFromCamera( pointer, camera );
        raycaster.intersectObjects( scene.children )
        if (raycaster.intersectObjects( scene.children ).length > 0) {
            drawingOnMesh = true;
        }
        drawingOnCanvas = false;
        startDraw(event);
        
    
    });
    renderer.domElement.addEventListener('mousemove', (event) => {
        drawing(event);
    });
    renderer.domElement.addEventListener('mouseup', () => {
        controls.enabled = true;
        drawingOnMesh = false;
        drawingOnCanvas = false;
        isDrawing = false;
    });
    
    window.addEventListener( 'pointermove', onPointerMove );

    function onPointerMove( event ) {

        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
        pointer.x = (( event.pageX - container.offsetLeft ) / container.offsetWidth )* 2 - 1;
        pointer.y = - (( event.pageY - container.offsetTop ) / container.offsetHeight )* 2 + 1;
        
    
    }
}

//main functions
async function preload() {
    //textures is a list of textures available to use, and populates the textures list
    //addTextures();
    loadMesh(currmeshindex);
     //lights is a list of lights in the scene, and populates the lights list
    addLights();
    
    //creates the menubar
    //createdatgui();
    //meshes is a list of meshes in the scene, and populates the meshes list
    setTimeout(()=>"waiting to load", 1000);
}
//helper functions
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene,camera);
}
function addLights() {
    // Adding lighting
    const directionalLightTop = new THREE.DirectionalLight(0xffffff, 1);
    directionalLightTop.position.set(0, 1, 0); 
    const directionalLightBottom = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLightBottom.position.set(-1, -1, 0); 
    const hemlight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.7 );
    scene.add( hemlight );
    scene.add(directionalLightTop);
    scene.add(directionalLightBottom);
    lights.push(hemlight);
    lights.push(directionalLightTop);
    lights.push(directionalLightBottom);
    
}
function loadMesh() {
    //get rid of the mesh if it's in the scene
    scene.remove(mesh)
    filepath = meshes[currmeshindex];
    const loader = new GLTFLoader();
    //loading the cow
    loader.load(
        filepath,
        function (gltf) {
            const modelGeometry = gltf.scene.children[0].geometry;
            var loader = new THREE.TextureLoader();
            
            mesh = new THREE.Mesh(modelGeometry,  material);
            mesh.scale.set(5, 5, 5);
            scene.add(mesh);
            console.log(mesh)
        },
        // if 100% means loaded
        function (xhr) {
            console.log("Mesh loaded successfully");
   
        },
        // an error callback
        function (error) {
            console.error('An error happened', error);
        });

}


//event listeners
window.addEventListener("resize", function() {
    var width = container.clientWidth;
    var height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});


//error functions
function assertListsSameSize(list1, list2) {
    if (list1.length !== list2.length) {
        throw new Error("Lists are not the same size");
    }
}