// --- ELEMENT DATA (Pauling Electronegativity) ---
const ELEMENTS = [
    { number: 1,  symbol: 'H',  name: '수소 (Hydrogen)',      en: 2.20, radius: 0.37, color: '#00f2fe' },
    { number: 3,  symbol: 'Li', name: '리튬 (Lithium)',       en: 0.98, radius: 1.52, color: '#a5f3fc' },
    { number: 4,  symbol: 'Be', name: '베릴륨 (Beryllium)',   en: 1.57, radius: 1.12, color: '#86efac' },
    { number: 5,  symbol: 'B',  name: '붕소 (Boron)',         en: 2.04, radius: 0.85, color: '#fde047' },
    { number: 6,  symbol: 'C',  name: '탄소 (Carbon)',        en: 2.55, radius: 0.77, color: '#c084fc' },
    { number: 7,  symbol: 'N',  name: '질소 (Nitrogen)',      en: 3.04, radius: 0.75, color: '#38bdf8' },
    { number: 8,  symbol: 'O',  name: '산소 (Oxygen)',        en: 3.44, radius: 0.73, color: '#fb7185' },
    { number: 9,  symbol: 'F',  name: '플루오린 (Fluorine)',  en: 3.98, radius: 0.72, color: '#f43f5e' },
    { number: 11, symbol: 'Na', name: '나트륨 (Sodium)',      en: 0.93, radius: 1.86, color: '#fed7aa' },
    { number: 12, symbol: 'Mg', name: '마그네슘 (Magnesium)',  en: 1.31, radius: 1.60, color: '#cbd5e1' },
    { number: 13, symbol: 'Al', name: '알루미늄 (Aluminum)',  en: 1.61, radius: 1.43, color: '#94a3b8' },
    { number: 14, symbol: 'Si', name: '규소 (Silicon)',       en: 1.90, radius: 1.11, color: '#fbbf24' },
    { number: 15, symbol: 'P',  name: '인 (Phosphorus)',      en: 2.19, radius: 1.06, color: '#a78bfa' },
    { number: 16, symbol: 'S',  name: '황 (Sulfur)',          en: 2.58, radius: 1.02, color: '#facc15' },
    { number: 17, symbol: 'Cl', name: '염소 (Chlorine)',      en: 3.16, radius: 0.99, color: '#4ade80' },
    { number: 19, symbol: 'K',  name: '칼륨 (Potassium)',     en: 0.82, radius: 2.27, color: '#fbcfe8' }
];

// --- MISSION CONFIGURATION ---
const STAGES = [
    {
        stage: 1,
        title: "Stage 1: 무극성 공유 결합 형성",
        desc: "전기음성도 차이(ΔEN)가 0.4 미만이 되어 두 원자가 전자를 균등하게 공유하는 '무극성 공유 결합'을 형성하세요. (예: C와 H 등)",
        check: (diff) => diff < 0.4,
        explanation: (a, b, diff) => `성공! ${a.name}(EN ${a.en})와 ${b.name}(EN ${b.en})의 전기음성도 차이는 ${diff.toFixed(2)}입니다. 차이가 0.4 미만이므로 전자가 균등하게 공유되는 무극성 공유 결합(Nonpolar Covalent)을 형성합니다.`
    },
    {
        stage: 2,
        title: "Stage 2: 극성 공유 결합 형성",
        desc: "전기음성도 차이(ΔEN)가 0.4 이상 1.7 미만이 되어 전자가 한쪽으로 치우쳐 극성을 띠는 '극성 공유 결합'을 형성하세요. (예: H와 O 등)",
        check: (diff) => diff >= 0.4 && diff < 1.7,
        explanation: (a, b, diff) => `성공! ${a.name}(EN ${a.en})와 ${b.name}(EN ${b.en})의 전기음성도 차이는 ${diff.toFixed(2)}입니다. 차이가 0.4~1.7 사이이므로 더 전기음성도가 큰 쪽으로 공유 전자쌍이 끌려가는 극성 공유 결합(Polar Covalent)을 형성합니다.`
    },
    {
        stage: 3,
        title: "Stage 3: 이온 결합 형성",
        desc: "전기음성도 차이(ΔEN)가 1.7 이상이 되어 전자가 완전히 한쪽으로 이동하여 정전기적 인력으로 결합하는 '이온 결합'을 형성하세요. (예: Na와 Cl 등)",
        check: (diff) => diff >= 1.7,
        explanation: (a, b, diff) => `성공! ${a.name}(EN ${a.en})와 ${b.name}(EN ${b.en})의 전기음성도 차이는 ${diff.toFixed(2)}입니다. 차이가 1.7 이상으로 매우 크기 때문에, 전자가 완전히 전이되어 음이온과 양이온을 형성하는 이온 결합(Ionic)에 도달합니다.`
    }
];

// --- APP STATE ---
let activeSlot = 'A'; // 'A' or 'B'
let selectedAtomA = ELEMENTS.find(e => e.symbol === 'C'); // Default Carbon
let selectedAtomB = ELEMENTS.find(e => e.symbol === 'H'); // Default Hydrogen
let currentStage = 1;

// --- CHART SETUP (Chart.js) ---
let chartInstance = null;

// Pauling Equation: Percent Ionic Character = (1 - e^(-(ΔEN/2)^2)) * 100
function getIonicPercentage(diff) {
    return (1 - Math.exp(-Math.pow(diff / 2, 2))) * 100;
}

function initChart() {
    const ctx = document.getElementById('paulingChart').getContext('2d');
    
    // Generate background curve points
    const curveData = [];
    for (let x = 0; x <= 3.3; x += 0.05) {
        curveData.push({ x: x, y: getIonicPercentage(x) });
    }

    chartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: '이온 결합성 (%)',
                    data: curveData,
                    showLine: true,
                    borderColor: 'rgba(0, 242, 254, 0.4)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: '현재 결합 상태',
                    data: [], // Updated dynamically
                    pointBackgroundColor: '#ff007f',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: '전기음성도 차이 (ΔEN)', color: '#94a3b8', font: { family: 'Orbitron' } },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' },
                    min: 0,
                    max: 3.3
                },
                y: {
                    title: { display: true, text: '이온 결합 백분율 (%)', color: '#94a3b8', font: { family: 'Orbitron' } },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

function updateChart(diff) {
    if (!chartInstance) return;
    const ionicPct = getIonicPercentage(diff);
    chartInstance.data.datasets[1].data = [{ x: diff, y: ionicPct }];
    chartInstance.update();
}

// --- THREE.JS SETUP ---
let scene, camera, renderer;
let atomMeshA, atomMeshB;
let electronParticles;
let dipoleArrow;
const PARTICLE_COUNT = 80;

function initThree() {
    const container = document.getElementById('canvasContainer');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08090f, 0.05);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 12;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const pointLight = new THREE.PointLight(0x00f2fe, 2, 15);
    pointLight.position.set(-2, 0, 2);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xff007f, 2, 15);
    pointLight2.position.set(2, 0, 2);
    scene.add(pointLight2);

    // Atom Meshes (Representing cores)
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    
    const matA = new THREE.MeshPhongMaterial({
        color: 0x00f2fe,
        emissive: 0x002244,
        shininess: 80,
        flatShading: false
    });
    const matB = new THREE.MeshPhongMaterial({
        color: 0xff007f,
        emissive: 0x440022,
        shininess: 80,
        flatShading: false
    });

    atomMeshA = new THREE.Mesh(geometry, matA);
    atomMeshB = new THREE.Mesh(geometry, matB);

    atomMeshA.position.x = -3.2;
    atomMeshB.position.x = 3.2;

    scene.add(atomMeshA);
    scene.add(atomMeshB);

    // Dipole Moment Vector Arrow
    const arrowDir = new THREE.Vector3(1, 0, 0);
    const arrowOrigin = new THREE.Vector3(0, 0, 0);
    dipoleArrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 0.1, 0xffaa00, 0.4, 0.25);
    scene.add(dipoleArrow);

    // Electron clouds representation (Particle System)
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    
    // Distribute particles in a standard bond pathway
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i*3] = (Math.random() - 0.5) * 6;
        positions[i*3+1] = (Math.random() - 0.5) * 2;
        positions[i*3+2] = (Math.random() - 0.5) * 2;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom Canvas Texture for nice circular glowing particles
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const pTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
        color: 0x00f2fe,
        size: 0.35,
        transparent: true,
        blending: THREE.AdditiveBlending,
        map: pTexture,
        depthWrite: false
    });

    electronParticles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(electronParticles);

    // Basic orbital controls emulation via mouse dragging
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    container.addEventListener('mousedown', (e) => { isDragging = true; });
    container.addEventListener('mousemove', (e) => {
        const deltaMove = {
            x: e.offsetX - previousMousePosition.x,
            y: e.offsetY - previousMousePosition.y
        };

        if (isDragging) {
            scene.rotation.y += deltaMove.x * 0.005;
            scene.rotation.x += deltaMove.y * 0.005;
        }

        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
    });
    window.addEventListener('mouseup', () => { isDragging = false; });

    // Handle resizing
    window.addEventListener('resize', onWindowResize);

    animate();
}

function onWindowResize() {
    const container = document.getElementById('canvasContainer');
    if (!container || !renderer) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Particle animation loop where particles flow/skew depending on Electronegativity Difference
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    
    time += 0.05;

    // Pulse atoms slightly
    atomMeshA.rotation.y += 0.01;
    atomMeshB.rotation.y += 0.01;

    // Electron sharing animation
    const enA = selectedAtomA.en;
    const enB = selectedAtomB.en;
    const diff = Math.abs(enA - enB);
    const flowDirection = enA > enB ? -1 : 1; // Flow to the stronger one
    
    // Position of atoms
    const posA = atomMeshA.position;
    const posB = atomMeshB.position;

    // Animate and warp electrons based on electronegativity difference
    const positions = electronParticles.geometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // We use a parametric curve (interpolating between Atom A and Atom B)
        // With electronegativity difference skewing the probability density (concentration)
        const tVal = ((i + time) % PARTICLE_COUNT) / PARTICLE_COUNT; // value 0 to 1
        
        // Skewing formula
        let skewedT = tVal;
        if (diff > 0.05) {
            // Skew electron concentration towards the atom with higher electronegativity
            const skewFactor = Math.min(diff * 0.35, 0.85); // Max skew cap
            if (flowDirection === -1) {
                // Skew towards A (tVal closer to 0)
                skewedT = Math.pow(tVal, 1 + skewFactor);
            } else {
                // Skew towards B (tVal closer to 1)
                skewedT = 1 - Math.pow(1 - tVal, 1 + skewFactor);
            }
        }

        // Interpolate position along the X-axis between A and B
        const targetX = posA.x + (posB.x - posA.x) * skewedT;
        
        // Orbit/cylinder shape surrounding the bond
        const angle = (i * 0.17) + time * 0.3;
        const radius = 0.6 + Math.sin(skewedT * Math.PI) * 0.8 * (1 - (diff / 4)); // ionic cloud collapses slightly

        positions[i*3] = targetX;
        positions[i*3+1] = Math.sin(angle) * radius * (1.0 + 0.1 * Math.cos(time + i));
        positions[i*3+2] = Math.cos(angle) * radius * (1.0 + 0.1 * Math.sin(time + i));
    }
    electronParticles.geometry.attributes.position.needsUpdate = true;

    // Dynamic color shifting for electron particles
    if (diff < 0.4) {
        // Pure covalent - Greenish/Blue
        electronParticles.material.color.setHex(0x00f2fe);
    } else if (diff < 1.7) {
        // Polar - Gold/Yellow-Green
        electronParticles.material.color.setHex(0xeab308);
    } else {
        // Ionic - Neon Pink
        electronParticles.material.color.setHex(0xff007f);
    }

    renderer.render(scene, camera);
}

// Update 3D visualization when atoms change
function update3DScene() {
    if (!atomMeshA || !atomMeshB) return;

    const enA = selectedAtomA.en;
    const enB = selectedAtomB.en;
    const diff = Math.abs(enA - enB);

    // Radii representing core sizes (normalized slightly for visuals)
    const baseRadiusA = Math.sqrt(selectedAtomA.radius) * 0.8;
    const baseRadiusB = Math.sqrt(selectedAtomB.radius) * 0.8;

    atomMeshA.scale.setScalar(baseRadiusA);
    atomMeshB.scale.setScalar(baseRadiusB);

    atomMeshA.material.color.set(selectedAtomA.color);
    atomMeshB.material.color.set(selectedAtomB.color);

    // Delta charge signs and HTML overlays
    const chargeAEl = document.getElementById('chargeA');
    const chargeBEl = document.getElementById('chargeB');

    // Project 3D coordinates to 2D screen positions for Delta charge indicators
    const tempV_A = new THREE.Vector3().copy(atomMeshA.position);
    const tempV_B = new THREE.Vector3().copy(atomMeshB.position);
    tempV_A.y += 1.4; // offset above the atom
    tempV_B.y += 1.4;

    tempV_A.project(camera);
    tempV_B.project(camera);

    const canvasContainer = document.getElementById('canvasContainer');
    const widthHalf = canvasContainer.clientWidth / 2;
    const heightHalf = canvasContainer.clientHeight / 2;

    const screenX_A = (tempV_A.x * widthHalf) + widthHalf;
    const screenY_A = -(tempV_A.y * heightHalf) + heightHalf;
    const screenX_B = (tempV_B.x * widthHalf) + widthHalf;
    const screenY_B = -(tempV_B.y * heightHalf) + heightHalf;

    chargeAEl.style.left = `${screenX_A}px`;
    chargeAEl.style.top = `${screenY_A}px`;
    chargeBEl.style.left = `${screenX_B}px`;
    chargeBEl.style.top = `${screenY_B}px`;

    // Handle dipole arrows & delta values
    if (diff > 0.05) {
        dipoleArrow.visible = true;
        const arrowLength = Math.min(diff * 1.5, 4.5);
        dipoleArrow.setLength(arrowLength, 0.4, 0.25);
        
        if (enA > enB) {
            // Points from B (less EN) to A (more EN)
            dipoleArrow.setDirection(new THREE.Vector3(-1, 0, 0));
            chargeAEl.textContent = 'δ-';
            chargeBEl.textContent = 'δ+';
            chargeAEl.style.opacity = 1;
            chargeBEl.style.opacity = 1;
        } else {
            // Points from A to B
            dipoleArrow.setDirection(new THREE.Vector3(1, 0, 0));
            chargeAEl.textContent = 'δ+';
            chargeBEl.textContent = 'δ-';
            chargeAEl.style.opacity = 1;
            chargeBEl.style.opacity = 1;
        }
    } else {
        dipoleArrow.visible = false;
        chargeAEl.style.opacity = 0;
        chargeBEl.style.opacity = 0;
    }
}

// --- DOM & PTABLE CONTROL ---
function renderPeriodicTable() {
    const tableContainer = document.getElementById('periodicTable');
    tableContainer.innerHTML = '';

    ELEMENTS.forEach(el => {
        const elBtn = document.createElement('button');
        elBtn.className = 'pt-element';
        elBtn.dataset.symbol = el.symbol;
        
        elBtn.innerHTML = `
            <span class="el-number">${el.number}</span>
            <span class="el-symbol">${el.symbol}</span>
            <span class="el-en">${el.en.toFixed(1)}</span>
        `;

        elBtn.addEventListener('click', () => selectElement(el));
        tableContainer.appendChild(elBtn);
    });

    updateSelectionStyles();
}

function selectElement(el) {
    if (activeSlot === 'A') {
        selectedAtomA = el;
        document.getElementById('selectedAName').textContent = `${el.symbol} (${el.en.toFixed(2)})`;
    } else {
        selectedAtomB = el;
        document.getElementById('selectedBName').textContent = `${el.symbol} (${el.en.toFixed(2)})`;
    }

    updateSelectionStyles();
    updateBondSimulation();
}

function updateSelectionStyles() {
    // Sync active slot tabs
    document.querySelectorAll('.slot-toggle').forEach(btn => {
        const slot = btn.dataset.slot;
        btn.classList.toggle('active', slot === activeSlot);
    });

    // Sync periodic table buttons
    document.querySelectorAll('.pt-element').forEach(btn => {
        const symbol = btn.dataset.symbol;
        const isA = selectedAtomA.symbol === symbol;
        const isB = selectedAtomB.symbol === symbol;

        btn.classList.remove('selected-a', 'selected-b', 'selected-both');
        if (isA && isB) {
            btn.classList.add('selected-both');
        } else if (isA) {
            btn.classList.add('selected-a');
        } else if (isB) {
            btn.classList.add('selected-b');
        }
    });

    // Update labels
    document.getElementById('selectedAName').textContent = `${selectedAtomA.symbol} (${selectedAtomA.en.toFixed(2)})`;
    document.getElementById('selectedBName').textContent = `${selectedAtomB.symbol} (${selectedAtomB.en.toFixed(2)})`;
}

// Core app updating
function updateBondSimulation() {
    const diff = Math.abs(selectedAtomA.en - selectedAtomB.en);
    
    // Update chart position
    updateChart(diff);
    
    // Update Three.js properties
    update3DScene();

    // Check Stage Objective
    const currentMission = STAGES[currentStage - 1];
    const statusMsg = document.getElementById('statusMessage');
    const indicator = document.getElementById('missionStatusIndicator');
    const nextBtn = document.getElementById('nextStageBtn');

    if (currentMission.check(diff)) {
        statusMsg.textContent = "목표 달성! 다음 단계를 진행할 수 있습니다.";
        indicator.className = "mission-status-indicator success";
        nextBtn.style.display = "block";
    } else {
        statusMsg.textContent = `현재 ΔEN = ${diff.toFixed(2)}. 목표에 도달하지 못했습니다.`;
        indicator.className = "mission-status-indicator ready";
        nextBtn.style.display = "none";
    }
}

// --- GAME LOGIC ---
function loadStage(stageNum) {
    currentStage = stageNum;
    const stageConf = STAGES[stageNum - 1];
    
    document.getElementById('missionTitle').textContent = stageConf.title;
    document.getElementById('missionDesc').textContent = stageConf.desc;

    // Update header progress meter
    document.getElementById('progressBar').style.width = `${((stageNum - 1) / 3) * 100}%`;
    document.getElementById('progressText').textContent = `${stageNum - 1} / 3`;

    document.getElementById('nextStageBtn').style.display = "none";
    document.getElementById('missionStatusIndicator').className = "mission-status-indicator ready";
    document.getElementById('statusMessage').textContent = "주기율표에서 결합할 원소들을 선택하세요.";

    updateBondSimulation();
}

function handleStageSuccess() {
    const stageConf = STAGES[currentStage - 1];
    const diff = Math.abs(selectedAtomA.en - selectedAtomB.en);

    // Set stage completion modal descriptions
    document.getElementById('modalStageTitle').textContent = `${stageConf.title} 완료!`;
    document.getElementById('modalExplanation').textContent = stageConf.explanation(selectedAtomA, selectedAtomB, diff);
    
    const overlay = document.getElementById('successModal');
    overlay.classList.add('active');
}

// Init everything
window.addEventListener('DOMContentLoaded', () => {
    initChart();
    initThree();
    renderPeriodicTable();

    // Event Listeners for switching Slot Selection
    document.getElementById('slotABtn').addEventListener('click', () => {
        activeSlot = 'A';
        updateSelectionStyles();
    });
    
    document.getElementById('slotBBtn').addEventListener('click', () => {
        activeSlot = 'B';
        updateSelectionStyles();
    });

    // Button to progress stage inside the side control card
    document.getElementById('nextStageBtn').addEventListener('click', handleStageSuccess);

    // Modal progress button click
    document.getElementById('modalCloseBtn').addEventListener('click', () => {
        document.getElementById('successModal').classList.remove('active');
        
        if (currentStage < 3) {
            loadStage(currentStage + 1);
        } else {
            // Victory Modal
            document.getElementById('progressBar').style.width = "100%";
            document.getElementById('progressText').textContent = "3 / 3";
            document.getElementById('victoryModal').classList.add('active');
        }
    });

    // Reset Game button
    document.getElementById('resetGameBtn').addEventListener('click', () => {
        document.getElementById('victoryModal').classList.remove('active');
        // Reset defaults
        selectedAtomA = ELEMENTS.find(e => e.symbol === 'C');
        selectedAtomB = ELEMENTS.find(e => e.symbol === 'H');
        activeSlot = 'A';
        updateSelectionStyles();
        loadStage(1);
    });

    // Set starting stage
    loadStage(1);
    
    // Kickstart coordinate mapping after everything loads
    setTimeout(() => {
        updateBondSimulation();
    }, 100);
});
