import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui'

//initializing the window and some important variables
const scene = new THREE.Scene();

const container = document.body;

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( container.clientWidth, container.clientHeight);

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls( camera, renderer.domElement );

const gui = new GUI();

var meshes = [];
var textures = [];
var lights = [];

var meshesready = false;
var texturesready = false;

//main functions
function preload() {
   
    
    //textures is a list of textures available to use, and populates the textures list
    addTextures();
    addMeshes();
     //lights is a list of lights in the scene, and populates the lights list
    addLights();
   
    //creates the menubar
    createdatgui();
    //meshes is a list of meshes in the scene, and populates the meshes list
   

}
 


//helper functions
function animate() {
    requestAnimationFrame(animate);
    if (meshesready && texturesready) {
        //console.log("here")
        assignTextures(); //uncommenting this would make the implementation slow, but will probably be necessary
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
    const loader = new GLTFLoader();
    //loading the cow
    loader.load(
        '../models/cow.glb',
        function (gltf) {
            const modelGeometry = gltf.scene.children[0].geometry;
            var loader = new THREE.TextureLoader();

            const material = new THREE.MeshPhongMaterial( {
                color: 0x00ffff,
                side: THREE.DoubleSide,
                flatShading: true,
                

            } );
            const modelMesh = new THREE.Mesh(modelGeometry,  material);
            modelMesh.scale.set(5, 5, 5);
            scene.add(modelMesh);
            meshes.push(modelMesh); 
        },
        // if 100% means loaded
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            meshesready = true
        },
        // an error callback
        function (error) {
            console.error('An error happened', error);
        }
    );
}
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
    for (var i = 0; i < meshes.length; i++ ) {
        meshes[i].material = new THREE.MeshPhongMaterial( {
            map: textures[i]
        });
        meshes[i].material.needsUpdate = true;
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

//calls
preload();
setTimeout(animate, 1000);

//error functions
function assertListsSameSize(list1, list2) {
    if (list1.length !== list2.length) {
        throw new Error("Lists are not the same size");
    }
}
