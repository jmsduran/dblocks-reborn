'use strict';

var DBLOCKS = (function() {
    /**
     * World settings:
     */
    var settings = {
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
            }
        },

        camera: {
            pos: {
                x: 60,
                y: 50,
                z: 60
            }
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
            renderer = new THREE.WebGLRenderer({
                antialias: true
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(settings.world.color, 1);
            renderer.shadowMapEnabled = true;
            renderer.shadowMapSoft = true;
            document.getElementById("viewport").appendChild(renderer.domElement);

            scene = new Physijs.Scene;
            scene.setGravity(settings.world.gravity);

            camera = new THREE.PerspectiveCamera(
                35,
                window.innerWidth / window.innerHeight,
                1,
                1000
            );

            camera.position.set(
                settings.camera.pos.x,
                settings.camera.pos.y,
                settings.camera.pos.z
            );
            camera.lookAt(scene.position);
            scene.add(camera);

            var light = new THREE.DirectionalLight(settings.light.color);
            light.position.set(
                settings.light.pos.x,
                settings.light.pos.y,
                settings.light.pos.z
            );
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
