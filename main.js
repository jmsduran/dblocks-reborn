'use strict';

Physijs.scripts.worker = "/physijs/physijs_worker.js";
Physijs.scripts.ammo = "/ammojs/ammo.js";

var renderer, scene, camera, controls;

var blocks = [
    {
        pos: {x: 0, y: 10, z: 0},
        rot: {
            x: Math.random() * Math.PI,
            y: Math.random() * Math.PI,
            z: Math.random() * Math.PI
        }
    },
    {
        pos: {x: 0, y: 20, z: 0},
        rot: {
            x: Math.random() * Math.PI,
            y: Math.random() * Math.PI,
            z: Math.random() * Math.PI
        }
    }
];

var pshapes = [];

var initScene = function() {
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

    var light = new THREE.DirectionalLight(0xFFFFFF);
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

    var ground = new Physijs.BoxMesh(
        new THREE.CubeGeometry(50, 1, 50),
        new THREE.MeshPhongMaterial({overdraw: true, color: 0x888888}),
        0
    );
    ground.receiveShadow = true;
    scene.add(ground);

    blocks.forEach(createShape);

    requestAnimationFrame(render);
};

var createShape = function(e, i, a) {
    var box = new Physijs.BoxMesh(
        new THREE.CubeGeometry(5, 5, 5),
        new THREE.MeshPhongMaterial({overdraw: true, color: 0xFFF})
    );

    box.position.set(e.pos.x, e.pos.y, e.pos.z);
    box.rotation.set(e.rot.x, e.rot.y, e.rot.z);
    box.castShadow = true;
    box.receiveShadow = true;

    pshapes[i] = box;
    scene.add(pshapes[i]);
};

var removeFromScene = function(e, i, a) {
    scene.remove(e);
};

var render = function() {
    scene.simulate();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
};

var resize = function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.update();
};

$("#run-button").click(function() {
    $("#application-sidebar").sidebar("toggle");
});

$("#sidebar-button").click(function(){
    $("#application-sidebar").sidebar("toggle");
});

$("#reset-button").click(function(){
    pshapes.forEach(removeFromScene);
});

window.onload = initScene();

window.addEventListener("resize", resize, false);
