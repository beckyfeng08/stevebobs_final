import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui'

const container = document.body;
  
function main() {
  
    //setting up the scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    console.log(container.clientWidth)
    camera.position.z = 10;
    
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( container.clientWidth, container.clientHeight);
    document.body.appendChild(renderer.domElement);


    //setting up orbitcontrols
    const controls = new OrbitControls( camera, renderer.domElement );
    
    //rendering a simple cube for now (CHANGE TO A 3D MESH)
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    //GUI controls dat.gui
    const gui = new GUI();

    gui.add(cube.material, "wireframe");
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
    
    
    //update frame
    animate();
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene,camera);
    }

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


