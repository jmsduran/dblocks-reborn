'use strict';

var DBLOCKS = (function() {
    Physijs.scripts.worker = "/physijs/physijs_worker.js";
    Physijs.scripts.ammo = "/ammojs/ammo.js";

    var renderer, scene, camera, controls;

    var createShape = function(e, i, a) {
        var box = new Physijs.BoxMesh(
            new THREE.CubeGeometry(3, 7, 1),
            new THREE.MeshPhongMaterial({
                overdraw: true,
                color: 0xF7BE81
            })
        );

        box.position.set(e.pos.x, e.pos.y, e.pos.z);
        box.rotation.set(e.rot.x, e.rot.y, e.rot.z);
        box.castShadow = true;
        box.receiveShadow = true;

        DBLOCKS.pshapes[i] = box;
        scene.add(DBLOCKS.pshapes[i]);
    };

    var removeFromScene = function(e, i, a) {
        scene.remove(e);
    };

    var render = function() {
        scene.simulate();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    };

    return {
        blocks: [],

        pshapes: [],

        start: function() {
            renderer = new THREE.WebGLRenderer({
                antialias: true
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0xFFFFFF, 1);
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
                new THREE.CubeGeometry(100, 1, 100),
                new THREE.MeshPhongMaterial({
                    overdraw: true,
                    color: 0x888888
                }),
                0
            );
            ground.receiveShadow = true;
            scene.add(ground);

            if ($("#application-editor").val())
                DBLOCKS.runCodeHandler();

            requestAnimationFrame(render);
        },

        resizeHandler: function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
            controls.update();
        },

        resetWorldHandler: function() {
            DBLOCKS.pshapes.forEach(removeFromScene);
            DBLOCKS.pshapes = [];
            DBLOCKS.blocks = [];
        },

        toggleSidebarHandler: function() {
            $("#application-sidebar").sidebar("toggle");
        },

        runCodeHandler: function() {
            DBLOCKS.toggleSidebarHandler();
            DBLOCKS.resetWorldHandler();

            eval($("#application-editor").val());
            DBLOCKS.blocks.forEach(createShape);
        }
    };
})();

$("#run-button").click(DBLOCKS.runCodeHandler);
$("#sidebar-button").click(DBLOCKS.toggleSidebarHandler);
$("#reset-button").click(DBLOCKS.resetWorldHandler);

window.onload = DBLOCKS.start();
window.addEventListener("resize", DBLOCKS.resizeHandler, false);
