import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui'


  
function main() {
    //creating the main GUI
    const container = document.body;
    //setting up the scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 10;
    
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( container.clientWidth, container.clientHeight);
    document.body.appendChild(renderer.domElement);


    //setting up orbitcontrols
    const controls = new OrbitControls( camera, renderer.domElement );
    
    //meshes is a list of meshes in the scene
    var meshes = addMeshes();

    //textures[i] corresponds to the texture on meshes[i] for i in meshes.length in the textures list
    var textures = addTextures(meshes);

    //lights is a list of lights in the scene
    var lights = addLights();
    
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
                meshlist.push(modelMesh)
            },
            // if 100% means loaded
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // an error callback
            function (error) {
                console.error('An error happened', error);
            }
        );
        return meshlist;
    }
    function addTextures() {
        // load a texture, set wrap mode to repeat
        var textures = []
        const texture = new THREE.TextureLoader().load( "../textures/spraypaint.jpg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 4, 4 );
        textures.push(texture);
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
  

main();

