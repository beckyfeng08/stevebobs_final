import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui'

const scene = new THREE.Scene();

const container = document.body;


const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( container.clientWidth, container.clientHeight);

document.body.appendChild(renderer.domElement);

var meshes = [];
var textures = [];


  
function preload() {
    //setting up orbitcontrols
    const controls = new OrbitControls( camera, renderer.domElement );
    
    //meshes is a list of meshes in the scene
    var meshes = addMeshes();
    

    //textures[i] corresponds to the texture on meshes[i] for i in meshes.length in the textures list
    var textures = addTexturesOnMeshes(meshes);

    //lights is a list of lights in the scene
    var lights = addLights();
    // scene.traverse(function(child) {
    //     console.log(child)
    //     if (child.isMesh) {
    //     console.log("hello")  ;
    //     }
    //   });

    console.log(scene.children);
       
    //creates the menubar
    createdatgui();
    
    //updates each frame
    animate();

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene,camera);
    }
    function addLights() {
        // Adding lighting
        var lightlist = [];
        const directionalLightTop = new THREE.DirectionalLight(0xffffff, 1);
        directionalLightTop.position.set(0, 1, 0); 
        const directionalLightBottom = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLightBottom.position.set(-1, -1, 0); 
        const hemlight = new THREE.HemisphereLight( 0xffffbb, 0x888888, 1 );
        scene.add( hemlight );
        scene.add(directionalLightTop);
        scene.add(directionalLightBottom);
        lightlist.push(hemlight);
        lightlist.push(directionalLightTop);
        lightlist.push(directionalLightBottom);
        return lightlist;
    }
    function addMeshes() {
        var meshlist = [];
        //rendering a simple cube for now (CHANGE TO A 3D MESH)
        const loader = new GLTFLoader();
        //loading the cow
        loader.load(
            '../models/cow.glb',
            function (gltf) {
                const modelGeometry = gltf.scene.children[0].geometry;
                const material = new THREE.MeshPhongMaterial( {
                    color: 0x00ff00, 
                    side: THREE.DoubleSide,
                    flatShading: true
                } );
                const modelMesh = new THREE.Mesh(modelGeometry,  material);
                modelMesh.scale.set(5, 5, 5);
                scene.add(modelMesh);
                meshlist.push(modelMesh);
            },
            // if 100% means loaded
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                main();
            },
            // an error callback
            function (error) {
                console.error('An error happened', error);
            }
        );
        console.log(meshlist)
        return meshlist;
    }
    function addTexturesOnMeshes(meshes) {
        // load a texture, set wrap mode to repeat
        var textures = []
        const texture = new THREE.TextureLoader().load( "../textures/spraypaint.jpg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 4, 4 );
        textures.push(texture);

        //adding textures to meshes
        //CURRENTLY FINDING HOW TO UPDATE MATERIALS ONTO MESHES, BUT WE MAY NEED TO DELETE THE PRIGINAL MESH AND
        //MAKE A NEW ONE WITH THE NEW MATERIAL
        //console.assert(meshes.length !== textures.length, "Size of meshes and textures array are not the same");
        console.log(meshes)
        console.log(textures)
        for (var i = 0; i < meshes.length; i++) {
            
            meshes[i].material.map = textures[i]
            meshes[i].material.needsUpdate = true;
        }

        return textures;
    }
    function createdatgui() {
         //GUI controls dat.gui
        const gui = new GUI();
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
            console.log(color);
        })
    }

    //event listeners
    window.addEventListener("resize", function() {
        console.log("here")
        var width = container.clientWidth;
        var height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
}
 
function main() {
    //get a list of mesh objects
    console.log(scene.children[3]);
}

preload();

// wait a second
setTimeout(main, 1000);

