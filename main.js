'use strict';

var editor = ace.edit("editor");
editor.setTheme("ace/theme/textmate");
editor.getSession().setMode("ace/mode/javascript");

var DBLOCKS = (function() {
    /**
     * World settings:
     */
    var settings = {
        html: {
            elementId: "viewport",
            width: window.innerWidth,
            height: window.innerHeight
        },

        physijs: {
            worker: "/physijs/physijs_worker.js",
            ammo: "/ammojs/ammo.js"
        },

        shapes: {
            block: {
                xlen: 3,
                ylen: 7,
                zlen: 1,
                color: 0xF7BE81
            }
        },

        world: {
            color: 0xFFFFFF,
            gravity: new THREE.Vector3(0, -30, 0),

            ground: {
                color: 0x888888,
                xlen: 100,
                ylen: 1,
                zlen: 100
            }
        },

        light: {
            color: 0xFFFFFF,

            pos: {
                x: 20,
                y: 40,
                z: -15
            },

            castShadow: true,
            shadowCameraLeft: -60,
            shadowCameraTop: -60,
            shadowCameraRight: 60,
            shadowCameraBottom: 60,
            shadowCameraNear: 20,
            shadowCameraFar: 200,
            shadowBias: -.0001,
            shadowMapWidthHeight: 2048,
            shadowDarkness: .7
        },

        camera: {
            fov: 35,

            pos: {
                x: 60,
                y: 50,
                z: 60
            },

            near: 1,
            far: 1000,
            aspectRatio: window.innerWidth / window.innerHeight
        }
    };

    /**
     * Private logic:
     */

    Physijs.scripts.worker = settings.physijs.worker;
    Physijs.scripts.ammo = settings.physijs.ammo;

    var renderer, scene, camera, controls;

    var createShape = function(e, i, a) {
        var box = new Physijs.BoxMesh(
            new THREE.CubeGeometry(
                settings.shapes.block.xlen,
                settings.shapes.block.ylen,
                settings.shapes.block.zlen
            ),
            new THREE.MeshPhongMaterial({
                overdraw: true,
                color: settings.shapes.block.color
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

    /**
     * Public members:
     */
    return {
        blocks: [],

        pshapes: [],

        settings: settings,

        start: function() {
            // Initialize the renderer:
            renderer = new THREE.WebGLRenderer({
                antialias: true
            });

            renderer.setSize(
                settings.html.width,
                settings.html.height
            );

            renderer.setClearColor(settings.world.color, 1);
            renderer.shadowMapEnabled = true;
            renderer.shadowMapSoft = true;

            document.getElementById(settings.html.elementId)
                .appendChild(renderer.domElement);

            scene = new Physijs.Scene;
            scene.setGravity(settings.world.gravity);

            // Initialize the camera:
            camera = new THREE.PerspectiveCamera(
                settings.camera.fov,
                settings.camera.aspectRatio,
                settings.camera.near,
                settings.camera.far
            );

            camera.position.set(
                settings.camera.pos.x,
                settings.camera.pos.y,
                settings.camera.pos.z
            );

            camera.lookAt(scene.position);
            scene.add(camera);

            // Initialize the world light source:
            var light = new THREE.DirectionalLight(settings.light.color);

            light.position.set(
                settings.light.pos.x,
                settings.light.pos.y,
                settings.light.pos.z
            );

            light.target.position.copy(scene.position);
            light.castShadow = settings.light.castShadow;
            light.shadowCameraLeft = settings.light.shadowCameraLeft;
            light.shadowCameraTop = settings.light.shadowCameraTop;
            light.shadowCameraRight = settings.light.shadowCameraRight;
            light.shadowCameraBottom = settings.light.shadowCameraBottom;
            light.shadowCameraNear = settings.light.shadowCameraNear;
            light.shadowCameraFar = settings.light.shadowCameraFar;
            light.shadowBias = settings.light.shadowBias;
            light.shadowMapWidth = light.shadowMapHeight = settings.light.shadowMapWidthHeight;
            light.shadowDarkness = settings.light.shadowDarkness;
            scene.add(light);

            // Use the provided OrbitControls utility for world navigation:
            controls = new THREE.OrbitControls(camera, renderer.domElement);

            // Initialize the ground object:
            var ground = new Physijs.BoxMesh(
                new THREE.CubeGeometry(
                    settings.world.ground.xlen,
                    settings.world.ground.ylen,
                    settings.world.ground.zlen
                ),
                new THREE.MeshPhongMaterial({
                    overdraw: true,
                    color: settings.world.ground.color
                }),
                0
            );

            ground.receiveShadow = true;
            scene.add(ground);

            // Execute any initial code present within the textbox:
            if (editor.getSession().getValue())
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

            eval(editor.getSession().getValue());
            DBLOCKS.blocks.forEach(createShape);
        }
    };
})();

$("#run-button").click(DBLOCKS.runCodeHandler);
$("#sidebar-button").click(DBLOCKS.toggleSidebarHandler);
$("#reset-button").click(DBLOCKS.resetWorldHandler);

window.onload = DBLOCKS.start();
window.addEventListener("resize", DBLOCKS.resizeHandler, false);
