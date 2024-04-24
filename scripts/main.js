import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function main() {
   
    //setting up the scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight);

    //get the container3D from the DOM
    const container = document.getElementById("container3D");
    console.log(container)
    container.appendChild(renderer.domElement);

    //setting up orbitcontrols
    const controls = new OrbitControls( camera, renderer.domElement );
    
    //rendering a simple cube for now (CHANGE TO A 3D MESH)
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    
    //update frame
    animate();
    function animate() {

        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene,camera);
    }
}

main();

