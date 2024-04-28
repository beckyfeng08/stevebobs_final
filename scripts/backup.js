import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui'
import * as jquery from "https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js";

//importing local files

//initializing the window and some important variables
const scene = new THREE.Scene();

const container = document.getElementById("viewer");

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);

container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

//const gui = new GUI();

//initiailizing materials first so the canvas can read off of it
let material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    flatShading: true,
});
let mesh;
let lights = [];


//drawing app init items
const canvas = document.getElementById("drawingapp"),
    toolBtns = document.querySelectorAll(".tool"),
    fillColor = document.querySelector("#fill-color"),
    opacitySlider = document.querySelector("#opacity-slider"),
    sizeSlider = document.querySelector("#size-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    clearCanvas = document.querySelector(".clear-canvas"),
    saveImg = document.querySelector(".save-img"),
    importImg = document.querySelector(".import-img"),
    importMesh = document.querySelector(".import-glb"),
    ctx = canvas.getContext("2d");
material.map = new THREE.CanvasTexture(canvas);
material.map.flipY = false;
// global variables with default value

var loaded = false;
//calls
drawingapp();
await preload();



ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.fillStyle = "#fff"; // passing selectedColor as fill style
ctx.lineWidth = 1; // passing brushSize as line width

console.log(mesh);
const uv = mesh.geometry.getAttribute('uv');
// index = mesh.geometry.bufferedAttribute("index")
// positions = mesh.geometry.bufferedAttribute("position")
// uv = mesh.geometry.bufferedAttribute("uv")

let maxU = 0;
let maxV = 0;
for (let i = 0; i < uv.count; i++) {
    maxU = Math.max(maxU, uv.array[i * 2]);
    maxV = Math.max(maxV, uv.array[i * 2 + 1]);
}
console.log("MaxU: " + maxU);
console.log("MaxV: " + maxV);

let index = mesh.geometry.getIndex();
for (let j = 0; j < index.count; j += 3) {
    let i0 = index.array[j] * 2;
    let i1 = index.array[j + 1] * 2;
    let i2 = index.array[j + 2] * 2;
    console.log(i0, i1, i2);
    ctx.beginPath(); // creating new path to draw
    ctx.moveTo(uv.array[i0] * canvas.width, uv.array[i0 + 1] * canvas.height); // creating line according to the mouse pointer
    ctx.lineTo(uv.array[i1] * canvas.width, uv.array[i1 + 1] * canvas.height); // creating line according to the mouse pointer
    ctx.stroke(); // drawing/filling line with color
    ctx.lineTo(uv.array[i2] * canvas.width, uv.array[i2 + 1] * canvas.height); // creating line according to the mouse pointer
    ctx.stroke(); // drawing/filling line with color
    ctx.lineTo(uv.array[i0] * canvas.width, uv.array[i0 + 1] * canvas.height); // creating line according to the mouse pointer
    ctx.stroke(); // drawing/filling line with color
    ctx.closePath();
    // ctx.stroke(); // drawing/filling line with color
}

console.log("post_load");
animate();


//Drawing app for the canvas
function drawingapp() {
    console.log("Loaded: " + loaded);
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

    window.addEventListener("resize", () => {
        // setting canvas width/height.. offsetwidth/height returns viewable width/height of an element
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        // setCanvasBackground();
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
        raycaster.setFromCamera(pointer, camera);
        //cast a ray and find uv coordinates to draw onto
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
            controls.enabled = false;
            //the raycaster found a face to paint on
            const intersection = intersects[0];
            //calculating brsuh positions from uv coordinates
            lastBrushX = intersection.uv.x * canvas.width;
            lastBrushY = (1 - intersection.uv.y) * canvas.height; //top left corner is 0
        }

    }
    const drawing = (e) => {

        if (!isDrawing) return; // if isDrawing is false return from here
        ctx.putImageData(snapshot, 0, 0); // adding copied canvas data on to this canvas
        if (selectedTool === "brush" || selectedTool === "eraser") {
            if (drawingOnCanvas) {
                ctx.lineTo(e.offsetX, e.offsetY); // creating line according to the mouse pointer
                ctx.stroke(); // drawing/filling line with color
                material.map = new THREE.CanvasTexture(canvas);
                material.map.flipY = false;
            } else if (drawingOnMesh) {
                raycaster.setFromCamera(pointer, camera);
                //cast a ray and find uv coordinates to draw onto
                const intersects = raycaster.intersectObjects(scene.children);
                if (intersects.length > 0) {
                    controls.enabled = false;
                    //the raycaster found a face to paint on
                    const intersection = intersects[0];
                    //calculating brsuh positions from uv coordinates

                    var brushX = intersection.uv.x * canvas.width;
                    var brushY = (1 - intersection.uv.y) * canvas.height; //top left corner is 0

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

                    material.map = new THREE.CanvasTexture(canvas);
                    material.map.flipY = false;
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
        opacity = opacitySlider.value / 100.0;
    });
    // brush size cursor display change
    document.onmousemove = function (e) {
        var circle = document.getElementById("circle");
        circle.style.top = e.clientY + "px";
        circle.style.left = e.clientX + "px";
        circle.style.width = brushWidth + "px";
        circle.style.height = brushWidth + "px";
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
        material.map = new THREE.CanvasTexture(canvas);
        material.map.flipY = false;
        setCanvasBackground();
    });
    saveImg.addEventListener("click", () => {
        const link = document.createElement("a"); // creating <a> element
        link.download = `${Date.now()}.png`; // passing current date as link download value
        link.href = canvas.toDataURL(); // passing canvasData as link href value
        link.click(); // clicking link to download image
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
        raycaster.setFromCamera(pointer, camera);
        raycaster.intersectObjects(scene.children)
        if (raycaster.intersectObjects(scene.children).length > 0) {
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

    window.addEventListener('pointermove', onPointerMove);

    function onPointerMove(event) {

        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
        pointer.x = ((event.pageX - container.offsetLeft) / container.offsetWidth) * 2 - 1;
        pointer.y = - ((event.pageY - container.offsetTop) / container.offsetHeight) * 2 + 1;


    }
}

//main functions
async function preload() {
    //textures is a list of textures available to use, and populates the textures list
    //addTextures();
    //lights is a list of lights in the scene, and populates the lights list
    return Promise.all([addMeshes(), addLights()]).then(() => {
        console.log("Loading done.");
    });
    //creates the menubar
    //createdatgui();
    //meshes is a list of meshes in the scene, and populates the meshes list
    // setTimeout(()=>"waiting to load", 1000);
}
//helper functions
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
async function addLights() {
    // Adding lighting

    const directionalLightTop = new THREE.DirectionalLight(0xffffff, 1);
    directionalLightTop.position.set(0, 1, 0);
    const directionalLightBottom = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLightBottom.position.set(-1, -1, 0);
    const hemlight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    scene.add(hemlight);
    scene.add(directionalLightTop);
    scene.add(directionalLightBottom);
    lights.push(hemlight);
    lights.push(directionalLightTop);
    lights.push(directionalLightBottom);
    return Promise.resolve(1).then(() => { console.log("Loaded Lights.") });
}
async function addMeshes() {
    //rendering a simple cube for now (CHANGE TO A 3D MESH)

    //lets just do a cube to debug for now
    //material = new THREE.MeshPhongMaterial({color:0xffffff});
    // mesh = new THREE.Mesh( new THREE.BoxGeometry( 5,5,5 ), material );
    // console.log(mesh)
    // scene.add(mesh);
    // meshes.push(mesh);
    const loader = new GLTFLoader();
    //loading the cow
    return loader.loadAsync('../models/cow_unwrapped.glb',
        // if 100% means loaded
        function (xhr) {
            console.log("Mesh loaded successfully");
            loaded = true;

        })
        .then((gltf) => {
            const modelGeometry = gltf.scene.children[0].geometry;
            var loader = new THREE.TextureLoader();

            mesh = new THREE.Mesh(modelGeometry, material);
            mesh.scale.set(5, 5, 5);
            scene.add(mesh);
            loaded = true;
            console.log("then.");
        })
        .catch((error) => {
            console.error('An error happened', error);
        });
}

//event listeners
window.addEventListener("resize", function () {
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