'use strict';

Physijs.scripts.worker = "/physijs/physijs_worker.js";
Physijs.scripts.ammo = "/ammojs/ammo.js";

var initScene, render, renderer, scene, camera, box, resize;

initScene = function() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene = new Physijs.Scene;

    camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );

    camera.position.set(60, 50, 60);
    camera.lookAt(scene.position);
    scene.add(camera);

    box = new Physijs.BoxMesh(
        new THREE.CubeGeometry(5, 5, 5),
        new THREE.MeshBasicMaterial({color: 0x888888})
    );
    scene.add(box);

    requestAnimationFrame(render);
};

render = function() {
    scene.simulate();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
};

resize = function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
};

window.onload = initScene();

window.addEventListener("resize", resize, false);
