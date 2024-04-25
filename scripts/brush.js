import * as THREE from 'three';
export class threejsbrush {
    constructor(scene, camera, renderer, brushSize = 0.05, brushColor = 0xff0000) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.brushSize = brushSize;
        this.brushColor = brushColor;

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.painting = false;
        this.brushTexture = this.createBrushTexture();

        this.init();
    }

    init() {
        // Set up mouse event listeners
        this.renderer.domElement.addEventListener('mousedown', (event) => this.onMouseDown(event), false);
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event), false);
        this.renderer.domElement.addEventListener('mouseup', (event) => this.onMouseUp(event), false);
    }

    createBrushTexture() {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, this.brushSize * size / 2, 0, Math.PI * 2);
        ctx.fillStyle = `#${this.brushColor.toString(16).padStart(6, '0')}`;
        ctx.fill();

        const brushTexture = new THREE.CanvasTexture(canvas);
        brushTexture.needsUpdate = true;

        // Ensure texture is fully loaded before using it
        return new Promise((resolve) => {
            brushTexture.image.onload = () => {
                resolve(brushTexture);
            };
        });
    }

    async onMouseDown(event) {
        this.painting = true;
        await this.onMouseMove(event); // Paint on initial click
    }

    async onMouseMove(event) {
        event.preventDefault();

        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
      
        if (this.painting) {
            await this.paint();
          
        }
    }

    onMouseUp(event) {
        this.painting = false;
    }

    async paint() {
        // Set up raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Calculate intersection with scene objects
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
  
        if (intersects.length > 0) {
            const intersection = intersects[0];
            const mesh = intersection.object;
         
            // Ensure the mesh has a texture
            if (!mesh.material.map) {
                console.warn("Mesh does not have a texture.");
                return;
            }

            // Wait for the brush texture to be fully loaded
            console.log("e")
            const brushTexture = await this.brushTexture;
            
            // Calculate UV coordinates
            const uv = intersection.uv;
            const texture = mesh.material.map;
          
            // Create a temporary canvas to draw the texture
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = texture.image.width;
            tempCanvas.height = texture.image.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(texture.image, 0, 0);

            // Calculate brush position on the texture
            const brushX = uv.x * tempCanvas.width;
            const brushY = (1 - uv.y) * tempCanvas.height;

            // Draw brush on the temporary canvas
            const brushSizePixels = this.brushSize * tempCanvas.width / 2;
            tempCtx.beginPath();
            tempCtx.arc(brushX, brushY, brushSizePixels, 0, Math.PI * 2);
            tempCtx.fillStyle = `#${this.brushColor.toString(16).padStart(6, '0')}`;
            tempCtx.fill();
            
            // Update texture with modified canvas
            texture.image.src = tempCanvas.toDataURL();
            texture.needsUpdate = true;
        }
    }

    setBrushSize(size) {
        this.brushSize = size;
        this.brushTexture = this.createBrushTexture();
    }

    setBrushColor(color) {
        this.brushColor = color;
        this.brushTexture = this.createBrushTexture();
    }
}