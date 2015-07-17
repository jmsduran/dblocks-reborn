/**
 * dblocks
 * Copyright (C) 2015  James Marcos Duran
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

'use strict';

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

        editor: {
            elementId: "editor",
            theme: "ace/theme/textmate",
            mode: "ace/mode/javascript",
            showPrintMargin: false
        },

        sidebar: {
            elementId: "editor-modal"
        },

        menu: {
            elementId: "menu-buttons"
        },

        physijs: {
            worker: "/bower_components/physijs/physijs_worker.js",
            ammo: "/bower_components/ammo.js/builds/ammo.js"
        },

        shapes: {
            block: {
                xlen: 3,
                ylen: 7,
                zlen: 1,
                color: 0xF7BE81
            },

            sphere: {
                radius: 2,
                widthsegments: 32,
                heightsegments: 32,
                color: 0xFF5F68
            }
        },

        projectile: {
            velocity: 250
        },

        world: {
            color: 0xFFFFFF,
            gravity: new THREE.Vector3(0, -30, 0),

            ground: {
                color: 0x888888,
                xlen: 200,
                ylen: 1,
                zlen: 200
            },

            meshnormal: {
                enabled: false
            },

            wireframe: {
                enabled: false,
                color: "blue"
            },

            timeout: 0
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
     * Source:
     * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
     *
     * shim layer with setTimeout fallback
     */
    window['requestAnimFrame'] = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( /* function */ callback,
                /* DOMElement */
                element) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    /**
     * Private logic:
     */

    Physijs.scripts.worker = settings.physijs.worker;
    Physijs.scripts.ammo = settings.physijs.ammo;

    var renderer, scene, camera, controls;

    var getMaterial = function(phongColor) {
        var material = new THREE.MeshPhongMaterial({
            overdraw: true,
            color: phongColor
        });

        if (settings.world.meshnormal.enabled)
            material = new THREE.MeshNormalMaterial();

        if (settings.world.wireframe.enabled)
            material = new THREE.MeshBasicMaterial({
                wireframe: true,
                color: settings.world.wireframe.color
            });

        return material;
    };

    var createShape = function(e, i, a) {
        var material = getMaterial(settings.shapes.block.color);

        var box = new Physijs.BoxMesh(
            new THREE.CubeGeometry(
                settings.shapes.block.xlen,
                settings.shapes.block.ylen,
                settings.shapes.block.zlen
            ),
            material
        );

        box.position.set(e.pos.x, e.pos.y, e.pos.z);
        box.rotation.set(e.rot.x, e.rot.y, e.rot.z);

        if (settings.world.wireframe.enabled ||
            settings.world.meshnormal.enabled) {
            box.castShadow = false;
            box.receiveShadow = false;

        } else {
            box.castShadow = true;
            box.receiveShadow = true;
        }

        DBLOCKS.pshapes[i] = box;

        setTimeout(function() {
            scene.add(DBLOCKS.pshapes[i]);
        }, i * settings.world.timeout);
    };

    var removeFromScene = function(e, i, a) {
        scene.remove(e);
    };

    var render = function() {
        scene.simulate();
        renderer.render(scene, camera);
        requestAnimFrame(render);
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

            requestAnimFrame(render);
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

        throwBallHandler: function() {
            var material = getMaterial(settings.shapes.sphere.color);

            var ball = new Physijs.SphereMesh(
                new THREE.SphereGeometry(
                    settings.shapes.sphere.radius,
                    settings.shapes.sphere.widthsegments,
                    settings.shapes.sphere.heightsegments
                ),
                material
            );

            ball.position.set(
                camera.position.x,
                camera.position.y,
                camera.position.z
            );

            if (settings.world.wireframe.enabled ||
                settings.world.meshnormal.enabled) {
                ball.castShadow = false;
                ball.receiveShadow = false;

            } else {
                ball.castShadow = true;
                ball.receiveShadow = true;
            }

            var force = new THREE.Vector3(0, 0, -1);
            force.applyQuaternion(camera.quaternion);
            force.multiplyScalar(settings.projectile.velocity);

            DBLOCKS.pshapes.push(ball);
            scene.add(DBLOCKS.pshapes[DBLOCKS.pshapes.length - 1]);
            DBLOCKS.pshapes[DBLOCKS.pshapes.length - 1].setLinearVelocity(force);
        },

        runCodeHandler: function() {
            DBLOCKS.resetWorldHandler();

            eval(editor.getSession().getValue());
            DBLOCKS.blocks.forEach(createShape);
        },

        replayCodeHandler: function() {
            DBLOCKS.resetWorldHandler();

            eval(editor.getSession().getValue());
            DBLOCKS.blocks.forEach(createShape);
        }
    };
})();

var editor = ace.edit(DBLOCKS.settings.editor.elementId);
editor.setTheme(DBLOCKS.settings.editor.theme);
editor.getSession().setMode(DBLOCKS.settings.editor.mode);

var setVisibility = function(cevs, mevs, pmrg) {
    var settings = DBLOCKS.settings;
    var ceditor = document.getElementById(settings.sidebar.elementId);
    var menu = document.getElementById(settings.menu.elementId);

    ceditor.style.visibility = cevs;
    menu.style.visibility = mevs;

    editor.setShowPrintMargin(pmrg);
    editor.resize();
};

document.getElementById("run-button").onclick = function() {
    setVisibility("hidden", "visible", false);
    DBLOCKS.runCodeHandler();
};

document.getElementById("editor-button").onclick = function() {
    setVisibility("visible", "hidden", DBLOCKS.settings.editor.showPrintMargin);
};

document.getElementById("hide-button").onclick = function() {
    setVisibility("hidden", "visible", false);
};

document.getElementById("reset-button").onclick = DBLOCKS.resetWorldHandler;
document.getElementById("replay-button").onclick = DBLOCKS.replayCodeHandler;

document.onclick = function(e) {
    if (e.shiftKey) {
        DBLOCKS.throwBallHandler();
    }
};

window.onload = function() {
    setVisibility("hidden", "visible", false);
    DBLOCKS.start();
};

window.addEventListener("resize", DBLOCKS.resizeHandler, false);
