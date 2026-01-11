import * as THREE from 'three';

const initThreeJS = () => {
    const canvas = document.querySelector('#bg-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles Group
    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);

    // Create Particles (Data Nodes)
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 700;

    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        // Spread particles in a wide area
        posArray[i] = (Math.random() - 0.5) * 60;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Subtle Teal Material for Data Points
    const material = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x2dd4bf, // Teal-400
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particleGeometry, material);
    particlesGroup.add(particlesMesh);

    // Adding connections (lines) between close particles for that "Network" look
    // Note: Doing this for all particles is heavy, so we add a secondary static geometry for lines
    // or just leave it as points for better performance and cleaner look. 
    // Let's add a few geometric shapes floating around to represent "structures"

    const geoGeometry = new THREE.IcosahedronGeometry(1, 0);
    const geoMaterial = new THREE.MeshBasicMaterial({
        color: 0x0d9488, // Teal-600
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    const floatingGeos = [];
    for (let i = 0; i < 5; i++) {
        const mesh = new THREE.Mesh(geoGeometry, geoMaterial);
        mesh.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 20
        );
        mesh.scale.setScalar(Math.random() * 2 + 1);
        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.002,
                y: (Math.random() - 0.5) * 0.002
            }
        };
        scene.add(mesh);
        floatingGeos.push(mesh);
    }

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;

    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    };

    document.addEventListener('mousemove', onDocumentMouseMove);

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        const elapsedTime = clock.getElapsedTime();

        // Smooth rotation based on mouse
        particlesGroup.rotation.y += 0.05 * (targetX - particlesGroup.rotation.y);
        particlesGroup.rotation.x += 0.05 * (targetY - particlesGroup.rotation.x);

        // Constant subtle movement
        particlesGroup.rotation.z += 0.0005;

        // Animate floating geometries
        floatingGeos.forEach(geo => {
            geo.rotation.x += geo.userData.rotationSpeed.x;
            geo.rotation.y += geo.userData.rotationSpeed.y;
            // Gentle float
            geo.position.y += Math.sin(elapsedTime * 0.5 + geo.position.x) * 0.01;
        });

        renderer.render(scene, camera);
        window.requestAnimationFrame(animate);
    };

    animate();
};

initThreeJS();
