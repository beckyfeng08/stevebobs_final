import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function main() {
    const container = document.querySelector("#container3D");
  

    //setting up the scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    console.log(container.clientWidth)
    camera.position.z = 10;
    
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( container.clientWidth, container.clientHeight);
  
    //setting up orbitcontrols
    const controls = new OrbitControls( camera, renderer.domElement );
    
    //rendering a simple cube for now (CHANGE TO A 3D MESH)
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

   
    document.body.appendChild(renderer.domElement);
    //update frame
    animate();
    function animate() {

        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene,camera);
    }
}
  

main();

