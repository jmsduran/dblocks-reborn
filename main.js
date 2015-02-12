'use strict';

Physijs.scripts.worker = "/physijs/physijs_worker.js";
Physijs.scripts.ammo = "/ammojs/ammo.js";

var initScene, render, renderer, scene, camera, controls, box, ground, light, resize;

initScene = function() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0xffffff, 1);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    document.getElementById("viewport").appendChild(renderer.domElement);

    scene = new Physijs.Scene;
    scene.setGravity(new THREE.Vector3(0, -30, 0));

    camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );

    camera.position.set(60, 50, 60);
    camera.lookAt(scene.position);
    scene.add(camera);

    light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set(20, 40, -15);
    light.target.position.copy(scene.position);
    light.castShadow = true;
    light.shadowCameraLeft = -60;
    light.shadowCameraTop = -60;
    light.shadowCameraRight = 60;
    light.shadowCameraBottom = 60;
    light.shadowCameraNear = 20;
    light.shadowCameraFar = 200;
    light.shadowBias = -.0001;
    light.shadowMapWidth = light.shadowMapHeight = 2048;
    light.shadowDarkness = .7;
    scene.add(light);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    ground = new Physijs.BoxMesh(
        new THREE.CubeGeometry(50, 1, 50),
        new THREE.MeshPhongMaterial({overdraw: true, color: 0x888888}),
        0
    );
    ground.receiveShadow = true;
    scene.add(ground);

    box = new Physijs.BoxMesh(
        new THREE.CubeGeometry(5, 5, 5),
        new THREE.MeshPhongMaterial({overdraw: true, color: 0xFFF})
    );
    box.position.y = 10;
    box.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    box.castShadow = true;
    box.receiveShadow = true;
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
    controls.update();
};

$("#toggle-sidebar").click(function(){
    $("#application-sidebar").sidebar("toggle");
});

window.onload = initScene();

window.addEventListener("resize", resize, false);
