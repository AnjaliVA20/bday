// threescenes.js
class ThreeSceneManager {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene = new THREE.Scene();

        this.particles = null;
        this.particleSystem = null;
        this.planets = [];     // Stores the full planet groups for animation
        this.hitboxes = [];    // Stores the invisible spheres for raycasting
        this.planetGroup = new THREE.Group();
        this.scene.add(this.planetGroup);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.currentTheme = 'menu';
        this.clock = new THREE.Clock();

        // Add glowing light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);
        this.pointLight = new THREE.PointLight(0xffffff, 1.2, 100);
        this.pointLight.position.set(0, 5, 20);
        this.scene.add(this.pointLight);
        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.dirLight.position.set(-10, 10, 10);
        this.scene.add(this.dirLight);

        this.init();
        this.setupParticles();
        this.setupPlanets();
        this.animate();

        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('click', this.onClick.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.camera.position.z = 25;
    }

    setupParticles() {
        const particleCount = 2000;
        this.particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        let colorObj = new THREE.Color();

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
            colorObj.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5);
            colors[i * 3] = colorObj.r;
            colors[i * 3 + 1] = colorObj.g;
            colors[i * 3 + 2] = colorObj.b;
        }

        this.particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.5, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
        });

        this.particleSystem = new THREE.Points(this.particles, material);
        this.scene.add(this.particleSystem);
    }

    createLowPolyPlanet(radius, oceanColor, landColor, cloudColor) {
        const group = new THREE.Group();

        // 1. Ocean (Inner Sphere)
        const oceanGeo = new THREE.IcosahedronGeometry(radius * 0.95, 3);
        const oceanMat = new THREE.MeshStandardMaterial({
            color: oceanColor,
            flatShading: true,
            roughness: 0.2,
            metalness: 0.3
        });
        const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
        group.add(oceanMesh);

        // 2. Land (Outer broken Sphere)
        // We use detail = 2 or 3 for low poly look
        const landGeo = new THREE.IcosahedronGeometry(radius, 2);

        // Jitter vertices
        const posAttr = landGeo.attributes.position;
        const v3 = new THREE.Vector3();
        for (let i = 0; i < posAttr.count; i++) {
            v3.fromBufferAttribute(posAttr, i);
            v3.normalize();

            // Generate pseudo-random terrain noise
            const n = Math.sin(v3.x * 6) * Math.cos(v3.y * 6) * Math.sin(v3.z * 6);
            // If n < 0, it sinks below ocean. If n > 0, it rises as land.
            const height = radius + (n > 0.1 ? n * 0.8 : -0.5);
            v3.multiplyScalar(height);
            posAttr.setXYZ(i, v3.x, v3.y, v3.z);
        }
        landGeo.computeVertexNormals();

        const landMat = new THREE.MeshStandardMaterial({
            color: landColor,
            flatShading: true,
            roughness: 0.8,
            metalness: 0.1
        });
        const landMesh = new THREE.Mesh(landGeo, landMat);
        group.add(landMesh);

        // 3. Clouds
        const numClouds = 6 + Math.floor(Math.random() * 4);
        const cloudMat = new THREE.MeshStandardMaterial({
            color: cloudColor, flatShading: true, roughness: 1.0, transparent: true, opacity: 0.9
        });
        for (let i = 0; i < numClouds; i++) {
            const cloudGeo = new THREE.IcosahedronGeometry(radius * 0.25 * Math.random() + 0.3, 0); // 0 detail = icosahedron
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const r = radius + 1.2 + Math.random();
            cloud.position.set(
                r * Math.sin(theta) * Math.cos(phi),
                r * Math.sin(theta) * Math.sin(phi),
                r * Math.cos(theta)
            );
            cloud.rotation.set(Math.random(), Math.random(), Math.random());
            cloud.scale.set(1, 0.6, 1);
            group.add(cloud);
        }

        // Add simple internal rotation to the clouds relative to the planet
        group.userData = { clouds: [] };
        group.children.forEach(c => {
            if (c.geometry.parameters && c.geometry.parameters.detail === 0) {
                group.userData.clouds.push(c);
            }
        });

        return group;
    }

    createDanDaDanPlanet(radius) {
        const group = this.createLowPolyPlanet(radius, 0x2b005e, 0x220033, 0x00c8ff);

        // Neon Green Buildings
        const bMat = new THREE.MeshStandardMaterial({ color: 0x00ff44, emissive: 0x004411, flatShading: true });
        for (let i = 0; i < 15; i++) {
            const h = 0.5 + Math.random() * 1.5;
            const bGeo = new THREE.BoxGeometry(0.3, h, 0.3);
            bGeo.translate(0, h / 2, 0);
            const b = new THREE.Mesh(bGeo, bMat);

            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const v3 = new THREE.Vector3(Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)).normalize();
            b.position.copy(v3).multiplyScalar(radius + 0.3);
            b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v3);
            group.add(b);
        }

        // Hovering UFO
        const ufoGroup = new THREE.Group();
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.8 }));
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.2, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        rim.position.y = -0.1;

        const beamGeo = new THREE.ConeGeometry(1.2, 3.5, 16);
        beamGeo.translate(0, -1.75, 0);
        const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }));
        beam.position.y = -0.2;

        ufoGroup.add(dome);
        ufoGroup.add(rim);
        ufoGroup.add(beam);
        ufoGroup.position.set(0, radius + 2.8, 0);

        group.add(ufoGroup);
        group.userData.ufo = ufoGroup;

        return group;
    }

    createGhostHunterPlanet(radius) {
        const group = this.createLowPolyPlanet(radius, 0x05001a, 0x2c3e50, 0x8800ff);

        const graveyard = new THREE.Group();
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x555555, flatShading: true });
        for (let i = 0; i < 6; i++) {
            const stoneGeo = new THREE.BoxGeometry(0.3, 0.6, 0.2);
            stoneGeo.translate(0, 0.3, 0);
            const stone = new THREE.Mesh(stoneGeo, stoneMat);

            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI * 0.5; // Upper half
            const v3 = new THREE.Vector3(Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)).normalize();
            stone.position.copy(v3).multiplyScalar(radius + 0.1);
            stone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v3);
            graveyard.add(stone);
        }

        group.add(graveyard);
        return group;
    }

    createWolfGirlPlanet(radius) {
        const group = this.createLowPolyPlanet(radius, 0xffb3c6, 0xff4d6d, 0xffffff);

        // Add Floating Hearts
        const heartGroup = new THREE.Group();
        const x = 0, y = 0;
        const heartShape = new THREE.Shape();
        heartShape.moveTo(x + 5, y + 5);
        heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
        heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
        heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
        heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
        heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
        heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

        const extrudeSettings = { depth: 2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.5, bevelThickness: 0.5 };
        const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        geometry.center();
        geometry.scale(0.02, -0.02, 0.02);

        const heartMat = new THREE.MeshStandardMaterial({ color: 0xff0044, roughness: 0.2 });

        for (let i = 0; i < 4; i++) {
            const heart = new THREE.Mesh(geometry, heartMat);
            const phi = Math.random() * Math.PI * 2;
            const v3 = new THREE.Vector3(Math.cos(phi), Math.random() + 0.5, Math.sin(phi)).normalize();
            heart.position.copy(v3).multiplyScalar(radius + 0.8);
            heart.lookAt(0, radius + 0.8, 0);
            heartGroup.add(heart);
        }

        group.add(heartGroup);
        return group;
    }

    setupPlanets() {
        // Planet 1: Realm 01 (Supernatural: Purple ocean, Neon Green land, cyan clouds, UFO)
        const p1Group = this.createDanDaDanPlanet(3);
        p1Group.position.set(-10, 0, 0);

        // Hitbox for P1
        const hb1 = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 16), new THREE.MeshBasicMaterial({ visible: false }));
        hb1.position.copy(p1Group.position);
        hb1.userData = { level: 1, name: "REALM 01", locked: false, originalGroup: p1Group };

        // Planet 2: Realm 02 (Dark blue ocean, grey land, purple clouds, Gravestones)
        const p2Group = this.createGhostHunterPlanet(3);
        p2Group.position.set(0, 0, 0);

        const hb2 = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 16), new THREE.MeshBasicMaterial({ visible: false }));
        hb2.position.copy(p2Group.position);
        hb2.userData = { level: 2, name: "REALM 02", locked: true, originalGroup: p2Group };

        // Planet 3: Realm 03 (Romance: Pink ocean, Red land, White clouds, Hearts)
        const p3Group = this.createWolfGirlPlanet(3);
        p3Group.position.set(10, 0, 0);

        const hb3 = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 16), new THREE.MeshBasicMaterial({ visible: false }));
        hb3.position.copy(p3Group.position);
        hb3.userData = { level: 3, name: "REALM 03", locked: true, originalGroup: p3Group };

        this.planets = [p1Group, p2Group, p3Group];
        this.hitboxes = [hb1, hb2, hb3];

        this.planets.forEach(p => this.planetGroup.add(p));
        this.hitboxes.forEach(hb => this.planetGroup.add(hb));

        // Create UI labels overlay
        this.createLabels();
    }

    createLabels() {
        const container = document.createElement('div');
        container.id = 'planet-labels';
        container.style.position = 'fixed';
        container.style.inset = '0';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '5'; // Below screens but above canvas
        document.body.appendChild(container);

        this.labels = [];
        this.hitboxes.forEach((hb, i) => {
            const lbl = document.createElement('div');
            lbl.style.position = 'absolute';
            lbl.style.color = '#fff';
            lbl.style.fontFamily = 'Rajdhani, sans-serif';
            lbl.style.fontWeight = '700';
            lbl.style.letterSpacing = '2px';
            lbl.style.textShadow = '0 2px 10px rgba(0,0,0,0.8)';
            lbl.style.textAlign = 'center';
            lbl.style.transform = 'translate(-50%, -50%)';
            lbl.innerText = hb.userData.name;

            if (hb.userData.locked) {
                lbl.innerText += '\n🔒 LOCKED';
                lbl.style.opacity = '0.5';
            }

            container.appendChild(lbl);
            this.labels.push(lbl);
        });
    }

    updateLabels() {
        if (this.currentTheme !== 'menu' && document.getElementById('level-select').classList.contains('active')) {
            document.getElementById('planet-labels').style.display = 'block';
        } else if (this.currentTheme === 'menu' && document.getElementById('level-select').classList.contains('active')) {
            document.getElementById('planet-labels').style.display = 'block';
        } else {
            document.getElementById('planet-labels').style.display = 'none';
            return;
        }

        this.hitboxes.forEach((hb, i) => {
            if (window.game) {
                if (hb.userData.level === 2) hb.userData.locked = !window.game.progress.level1Cleared;
                if (hb.userData.level === 3) hb.userData.locked = !window.game.progress.level2Cleared;
            }

            const lbl = this.labels[i];
            lbl.innerText = hb.userData.name;
            const group = hb.userData.originalGroup;

            if (hb.userData.locked) {
                lbl.innerText += '\n🔒 LOCKED';
                lbl.style.opacity = '0.5';
                group.traverse(mesh => {
                    if (mesh.isMesh && mesh.material) {
                        mesh.material.opacity = 0.3;
                        mesh.material.transparent = true;
                    }
                });
            } else {
                if (window.game && window.game.progress[`level${hb.userData.level}Cleared`]) {
                    lbl.innerText += '\n✓ CLEARED';
                    lbl.style.color = '#00ff88';
                } else {
                    lbl.style.color = '#fff';
                }
                lbl.style.opacity = '1';
                group.traverse(mesh => {
                    if (mesh.isMesh && mesh.material) {
                        if ((mesh.geometry && mesh.geometry.parameters && mesh.geometry.parameters.detail === 0) || mesh.material.blending === THREE.AdditiveBlending) {
                            mesh.material.opacity = 0.9;
                            mesh.material.transparent = true;
                        } else {
                            mesh.material.opacity = 1.0;
                            mesh.material.transparent = false;
                        }
                    }
                });
            }

            const pos = hb.position.clone();
            pos.y -= 4.5;
            pos.project(this.camera);

            const x = (pos.x * .5 + .5) * window.innerWidth;
            const y = (pos.y * -.5 + .5) * window.innerHeight;
            lbl.style.left = `${x}px`;
            lbl.style.top = `${y}px`;
        });
    }

    onMouseMove(event) {
        if (this.currentTheme !== 'menu' || !document.getElementById('level-select').classList.contains('active')) return;
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.hitboxes);

        this.planets.forEach(p => p.scale.set(1, 1, 1));
        document.body.style.cursor = 'default';

        if (intersects.length > 0) {
            const hb = intersects[0].object;
            if (!hb.userData.locked && hb.userData.level <= 3) {
                hb.userData.originalGroup.scale.set(1.15, 1.15, 1.15); // bounce on hover
                document.body.style.cursor = 'pointer';
            }
        }
    }

    onClick(event) {
        if (this.currentTheme !== 'menu' || !document.getElementById('level-select').classList.contains('active')) return;
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.hitboxes);

        if (intersects.length > 0) {
            const hb = intersects[0].object;
            if (!hb.userData.locked) {
                window.game.enterLevel(hb.userData.level);
                document.body.style.cursor = 'default';
            }
        }
    }

    changeTheme(theme) {
        this.currentTheme = theme;
        if (theme === 'menu') {
            this.planetGroup.visible = true;
        } else {
            this.planetGroup.visible = false;
        }

        const colors = this.particles.attributes.color.array;
        let colorObj = new THREE.Color();

        for (let i = 0; i < colors.length / 3; i++) {
            if (theme === 'menu') colorObj.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5);
            else if (theme === 'level1') colorObj.setHSL(0.3 + Math.random() * 0.1, 0.9, 0.6);
            else if (theme === 'level2') colorObj.setHSL(0.75 + Math.random() * 0.1, 0.9, 0.5);
            else if (theme === 'level3') colorObj.setHSL(0.0 + Math.random() * 0.05, 1.0, 0.4);

            colors[i * 3] = colorObj.r;
            colors[i * 3 + 1] = colorObj.g;
            colors[i * 3 + 2] = colorObj.b;
        }
        this.particles.attributes.color.needsUpdate = true;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        if (this.currentTheme === 'menu') {
            this.particleSystem.rotation.y += 0.05 * delta;
            this.particleSystem.rotation.x += 0.02 * delta;

            // Rotate planets
            this.planets.forEach((p, idx) => {
                p.rotation.y += (0.2 + idx * 0.1) * delta;
                p.position.y = Math.sin(time * 2 + idx * 2) * 0.5;

                // Sync hitboxes
                this.hitboxes[idx].position.copy(p.position);

                // Rotate clouds around planet slowly
                if (p.userData.clouds) {
                    p.userData.clouds.forEach(c => {
                        // Slight bobbing for clouds relative to planet
                        c.position.y += Math.sin(time * 5 + c.position.x) * 0.005;
                    });
                }
            });

            this.updateLabels();

        } else if (this.currentTheme === 'level1') {
            this.particleSystem.rotation.y -= 0.1 * delta;
            this.particleSystem.rotation.z += 0.05 * delta;
            const positions = this.particles.attributes.position.array;
            for (let i = 0; i < positions.length / 3; i++) {
                positions[i * 3 + 1] += Math.sin(time + positions[i * 3]) * 0.01;
            }
            this.particles.attributes.position.needsUpdate = true;
        } else if (this.currentTheme === 'level2') {
            this.particleSystem.rotation.y += 0.15 * delta;
        } else if (this.currentTheme === 'level3') {
            const positions = this.particles.attributes.position.array;
            for (let i = 0; i < positions.length / 3; i++) {
                positions[i * 3 + 1] += 10 * delta;
                if (positions[i * 3 + 1] > 50) positions[i * 3 + 1] = -50;
            }
            this.particles.attributes.position.needsUpdate = true;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

const bgManager = new ThreeSceneManager();
window.bgManager = bgManager;
