import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui'

//importing local files

//initializing the window and some important variables
const scene = new THREE.Scene();

const container = document.getElementById("viewer");

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( container.clientWidth, container.clientHeight);

container.appendChild(renderer.domElement);

const controls = new OrbitControls( camera, renderer.domElement );

const gui = new GUI();

let meshes = [];
let material;
let mesh;
let textures = [];
let lights = [];

let meshesready = false;
let texturesready = true;


//calls
preload();
drawingapp();
animate();

async function drawingapp() {
    
    const canvas = document.getElementById("drawingapp"),
        toolBtns = document.querySelectorAll(".tool"),
        fillColor = document.querySelector("#fill-color"),
        sizeSlider = document.querySelector("#size-slider"),
        colorBtns = document.querySelectorAll(".colors .option"),
        colorPicker = document.querySelector("#color-picker"),
        clearCanvas = document.querySelector(".clear-canvas"),
        saveImg = document.querySelector(".save-img");
        const ctx = canvas.getContext("2d");
    console.log(canvas.width, canvas.height)
    ctx.fillStyle = '#FFFFFF';
	ctx.fillRect( 0, 0, 300, 150 );
    material.map = new THREE.CanvasTexture(canvas);
    // global variables with default value
    
    let prevMouseX, prevMouseY, snapshot,
        isDrawing = false,
        selectedTool = "brush",
        brushWidth = 5,
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

    window.addEventListener("resize", () => {
        // setting canvas width/height.. offsetwidth/height returns viewable width/height of an element
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        // setCanvasBackground();
    });
  
    const startDraw = (e) => {
        isDrawing = true;
        prevMouseX = e.offsetX; // passing current mouseX position as prevMouseX value
        prevMouseY = e.offsetY; // passing current mouseY position as prevMouseY value
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // ctx.arc(prevMouseX, prevMouseY, brushWidth/2.0, 0, 2*Math.PI); // for single click paint case
        ctx.fillStyle = selectedColor; // passing selectedColor as fill style
        // ctx.fill();
        ctx.beginPath(); // creating new path to draw

        ctx.lineWidth = brushWidth; // passing brushSize as line width
        // ctx.strokeStyle = selectedColor; // passing selectedColor as stroke style
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;

        ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
        ctx.stroke(); // drawing/filling line with color

        // copying canvas data & passing as snapshot value.. this avoids dragging the image
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
     
    }
    const drawing = (e) => {
       
        if (!isDrawing) return; // if isDrawing is false return from here
        ctx.putImageData(snapshot, 0, 0); // adding copied canvas data on to this canvas
        if (selectedTool === "brush" || selectedTool === "eraser") {
            material.map =  new THREE.CanvasTexture(canvas);
            console.log(material.map)
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            // if selected tool is eraser then set strokeStyle to white
            // to paint white color on to the existing canvas content else set the stroke color to selected color
            ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
            ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
            ctx.stroke(); // drawing/filling line with color
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
        setCanvasBackground();
    });
    saveImg.addEventListener("click", () => {
        const link = document.createElement("a"); // creating <a> element
        link.download = `${Date.now()}.jpg`; // passing current date as link download value
        link.href = canvas.toDataURL(); // passing canvasData as link href value
        link.click(); // clicking link to download image
    });
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", drawing);
    canvas.addEventListener("mouseup", () => {
        isDrawing = false;
    });
}

//main functions
async function preload() {
    //textures is a list of textures available to use, and populates the textures list
    //addTextures();
    addMeshes();
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

    //wait for everything to finish loading 
    //before we initialize a brush and assign textures
    if ( meshesready && texturesready) {
        console.log(meshesready, texturesready)
        assignTextures();
        //so threejsbrush doesn't get reinitiailized
        meshesready = false;
        texturesready = false;
    }
    controls.update();
    renderer.render(scene,camera);

}
function addLights() {
    // Adding lighting
    const directionalLightTop = new THREE.DirectionalLight(0xffffff, 1);
    directionalLightTop.position.set(0, 1, 0); 
    const directionalLightBottom = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLightBottom.position.set(-1, -1, 0); 
    const hemlight = new THREE.HemisphereLight( 0xffffbb, 0x888888, 1 );
    scene.add( hemlight );
    scene.add(directionalLightTop);
    scene.add(directionalLightBottom);
    lights.push(hemlight);
    lights.push(directionalLightTop);
    lights.push(directionalLightBottom);
    
}
function addMeshes() {
    //rendering a simple cube for now (CHANGE TO A 3D MESH)

    //lets just do a cube to debug for now
    material = new THREE.MeshPhongMaterial({color:0xffffff});
	mesh = new THREE.Mesh( new THREE.BoxGeometry( 5,5,5 ), material );
    console.log(mesh)
    scene.add(mesh);
    meshes.push(mesh); 
    // const loader = new GLTFLoader();
    // //loading the cow
    // loader.load(
    //     '../models/cow_unwrapped.glb',
    //     function (gltf) {
    //         const modelGeometry = gltf.scene.children[0].geometry;
    //         var loader = new THREE.TextureLoader();
    //         const material = new THREE.MeshPhongMaterial( {
    //             side: THREE.DoubleSide,
    //             flatShading: true,

    //         } );
    //         const modelMesh = new THREE.Mesh(modelGeometry,  material);
    //         modelMesh.scale.set(5, 5, 5);
    //         scene.add(modelMesh);
    //         meshes.push(modelMesh); 
    //     },
    //     // if 100% means loaded
    //     function (xhr) {
    //         console.log("Mesh loaded successfully");
    //         meshesready = true;
    //     },
    //     // an error callback
    //     function (error) {
    //         console.error('An error happened', error);
    //     });

}

//not used
function addTextures() {
    // load a texture, set wrap mode to repeat
    //seems like the onload callback isn't being run
    var loader = new THREE.TextureLoader();
    loader.crossOrigin = "";
    const texture = loader.load(
        "https://i.imgur.com/eCpD7bM.jpg",
         // onLoad callback
       function(texture) {
           // Texture loaded successfully
           console.log("Texture loaded successfully");
           // Here you can assign the texture to a material or perform other operations
           texture.needsUpdate = true;
           texturesready = true;

        }, 
        
       // onError callback
       function(error) {
           // Error occurred while loading texture
           console.log("Error loading texture:", error);
       }
    )  
    texture.encoding = THREE.sRGBEncoding;  
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    //texture.needsUpdate = true;
    texture.repeat.set( 4, 4 );
    //debug the texture with a cube
   
    textures.push(texture)
}
//not used
function createdatgui() {
     //GUI controls dat.gui
    for (var mesh of meshes)  {
        gui.add(mesh.material, "wireframe");
    }
        
    //color picker
    let color = {
        r: 0,
        g: 0,
        b: 0
    };
    let palette = {
        color: [0,255,255]
    }
    let folderRGB = gui.addFolder("RGB");
    folderRGB.addColor(palette, 'color').onChange(function(value) {
        color.r = value[0]/255;
        color.g = value[1]/255;
        color.b = value[2]/255;
    })
}
function assignTextures() {
    //console.log("poo")
    for (var i = 0; i < meshes.length; i++ ) {
        meshes[i].material.map =  textures[i]
        //console.log("hi")
        meshes[i].material.map.needsUpdate = true;
    }
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