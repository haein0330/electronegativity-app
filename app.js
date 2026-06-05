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

// --- APP STATE ---
let activeSlot = 'A'; // 'A' or 'B'
let selectedAtomA = ELEMENTS.find(e => e.symbol === 'C'); // Default Carbon
let selectedAtomB = ELEMENTS.find(e => e.symbol === 'H'); // Default Hydrogen

// --- CHART SETUP (Chart.js) ---
let chartInstance = null;

function getIonicPercentage(diff) {
    return (1 - Math.exp(-Math.pow(diff / 2, 2))) * 100;
}

function initChart() {
    const ctx = document.getElementById('paulingChart').getContext('2d');
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
                    borderColor: 'rgba(0, 242, 254, 0.3)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: '현재 결합 상태',
                    data: [], 
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
            plugins: { legend: { display: false } },
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

// --- THREE.JS SETUP (Volumetric Electron Cloud) ---
let scene, camera, renderer;
let atomMeshA, atomMeshB;
let electronParticles;
let dipoleArrow;
const PARTICLE_COUNT = 3000; // Increased count for volumetric density mist
let particleSeeds = []; // Stores uncorrelated random values for true spherical/bridge distribution

function initThree() {
    const container = document.getElementById('canvasContainer');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08090f, 0.04);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 11;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const pointLightA = new THREE.PointLight(0x00f2fe, 3, 12);
    pointLightA.position.set(-2.5, 0, 2);
    scene.add(pointLightA);

    const pointLightB = new THREE.PointLight(0xff007f, 3, 12);
    pointLightB.position.set(2.5, 0, 2);
    scene.add(pointLightB);

    // Core spheres representation
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const matA = new THREE.MeshPhongMaterial({
        color: 0x00f2fe,
        emissive: 0x001122,
        shininess: 90
    });
    const matB = new THREE.MeshPhongMaterial({
        color: 0xff007f,
        emissive: 0x220011,
        shininess: 90
    });

    atomMeshA = new THREE.Mesh(geometry, matA);
    atomMeshB = new THREE.Mesh(geometry, matB);

    atomMeshA.position.x = -2.5;
    atomMeshB.position.x = 2.5;

    scene.add(atomMeshA);
    scene.add(atomMeshB);

    // Dipole Moment Arrow
    const arrowDir = new THREE.Vector3(1, 0, 0);
    const arrowOrigin = new THREE.Vector3(0, 1.8, 0); // raised above atoms
    dipoleArrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 0.1, 0xffa500, 0.4, 0.22);
    scene.add(dipoleArrow);

    // Generate static uncorrelated random seeds for particles
    particleSeeds = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particleSeeds.push({
            radialScale: Math.pow(Math.random(), 1.4), // concentrates near core
            theta: Math.random() * Math.PI * 2,
            phi: Math.acos((Math.random() * 2) - 1),
            bridgeT: Math.random(),
            bridgeAngle: Math.random() * Math.PI * 2,
            bridgeRadius: Math.random(),
            typeSeed: Math.random(), // used to partition particle categories
            vibrationOffset: Math.random() * Math.PI * 2
        });
    }

    // Dynamic Volumetric Density Particles
    const pGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i*3] = 0;
        positions[i*3+1] = 0;
        positions[i*3+2] = 0;
    }

    pGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Canvas texture for smooth volumetric circular particles
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const pTexture = new THREE.CanvasTexture(canvas);

    const pMaterial = new THREE.PointsMaterial({
        color: 0x00f2fe,
        size: 0.15,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        map: pTexture,
        depthWrite: false
    });

    electronParticles = new THREE.Points(pGeometry, pMaterial);
    scene.add(electronParticles);

    // Controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    container.addEventListener('mousedown', () => isDragging = true);
    container.addEventListener('mousemove', (e) => {
        if (isDragging) {
            scene.rotation.y += (e.offsetX - prevMouse.x) * 0.006;
            scene.rotation.x += (e.offsetY - prevMouse.y) * 0.006;
        }
        prevMouse = { x: e.offsetX, y: e.offsetY };
    });
    window.addEventListener('mouseup', () => isDragging = false);

    window.addEventListener('resize', onWindowResize);
    animate();
}

function onWindowResize() {
    const container = document.getElementById('canvasContainer');
    if (!container || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.035;

    atomMeshA.rotation.y += 0.004;
    atomMeshB.rotation.y += 0.004;

    // Density mapping weights
    const enA = selectedAtomA.en;
    const enB = selectedAtomB.en;
    const diff = Math.abs(enA - enB);
    const sumEn = enA + enB;
    const wA = enA / sumEn;

    const posA = atomMeshA.position;
    const posB = atomMeshB.position;

    const positions = electronParticles.geometry.attributes.position.array;
    
    // Generate/Shift particles in a probability density distribution
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const seed = particleSeeds[i];
        
        // Quantum vibration simulation (slight oscillation over time)
        const vib = Math.sin(time * 2 + seed.vibrationOffset) * 0.05;

        // Choose which atom this particle clusters around based on electronegativity weight
        const isClusterA = seed.typeSeed < wA;

        // Base sphere center
        const center = isClusterA ? posA : posB;
        const scaleVal = isClusterA ? atomMeshA.scale.x : atomMeshB.scale.x;

        // Base cloud radius proportional to atomic radius
        let cloudRadius = scaleVal * 1.7;
        
        // Dynamic deformation based on polar/ionic character
        if (diff > 0.05) {
            if (isClusterA) {
                // If it belongs to positive atom, pull its cloud density inwards/deplete it
                if (enA < enB) {
                    cloudRadius = scaleVal * Math.max(1.6 - diff * 0.65, 0.45);
                }
            } else {
                // If B is positive, deplete B's cloud
                if (enB < enA) {
                    cloudRadius = scaleVal * Math.max(1.6 - diff * 0.65, 0.45);
                }
            }
        }

        // Spherical distribution mapping using pre-generated random seeds
        const theta = seed.theta + time * 0.08; // slow drift rotation
        const phi = seed.phi;
        const dist = seed.radialScale * cloudRadius + vib;

        // Calculate 3D coordinates around target core
        let targetX = center.x + dist * Math.sin(phi) * Math.cos(theta);
        let targetY = center.y + dist * Math.sin(phi) * Math.sin(theta);
        let targetZ = center.z + dist * Math.cos(phi);

        // Add a "bonding bridge" between atoms for covalent/polar bonds
        if (diff < 1.7) {
            const bridgeWeight = (1.7 - diff) / 1.7 * 0.35; // Maximum 35% particles in the covalent sharing zone
            if (seed.typeSeed < bridgeWeight) {
                const t = seed.bridgeT;
                targetX = posA.x + (posB.x - posA.x) * t;
                
                // Disperse around the sharing axis
                const dispersion = (0.7 + seed.bridgeRadius * 0.6) * Math.sin(t * Math.PI) * (1.0 - (diff / 2.0));
                targetY = dispersion * Math.cos(seed.bridgeAngle + time * 0.25) + vib;
                targetZ = dispersion * Math.sin(seed.bridgeAngle + time * 0.25) + vib;
            }
        }

        positions[i*3] = targetX;
        positions[i*3+1] = targetY;
        positions[i*3+2] = targetZ;
    }
    
    electronParticles.geometry.attributes.position.needsUpdate = true;

    // Cloud visual color shifts based on bonding state
    if (diff < 0.4) {
        electronParticles.material.color.setHex(0x00f2fe); // Cyan
        electronParticles.material.size = 0.16;
    } else if (diff < 1.7) {
        electronParticles.material.color.setHex(0xf59e0b); // Orange
        electronParticles.material.size = 0.14;
    } else {
        electronParticles.material.color.setHex(0xff007f); // Pink
        electronParticles.material.size = 0.12;
    }

    renderer.render(scene, camera);
}

function update3DScene() {
    if (!atomMeshA || !atomMeshB) return;

    const enA = selectedAtomA.en;
    const enB = selectedAtomB.en;
    const diff = Math.abs(enA - enB);

    // Resize atom cores according to atomic radius
    const scaleA = Math.sqrt(selectedAtomA.radius) * 0.85;
    const scaleB = Math.sqrt(selectedAtomB.radius) * 0.85;

    atomMeshA.scale.setScalar(scaleA);
    atomMeshB.scale.setScalar(scaleB);

    atomMeshA.material.color.set(selectedAtomA.color);
    atomMeshB.material.color.set(selectedAtomB.color);

    // Position delta charge indicators
    const chargeAEl = document.getElementById('chargeA');
    const chargeBEl = document.getElementById('chargeB');

    const tempV_A = new THREE.Vector3().copy(atomMeshA.position);
    const tempV_B = new THREE.Vector3().copy(atomMeshB.position);
    tempV_A.y += 1.4;
    tempV_B.y += 1.4;

    tempV_A.project(camera);
    tempV_B.project(camera);

    const canvasContainer = document.getElementById('canvasContainer');
    const wHalf = canvasContainer.clientWidth / 2;
    const hHalf = canvasContainer.clientHeight / 2;

    chargeAEl.style.left = `${(tempV_A.x * wHalf) + wHalf}px`;
    chargeAEl.style.top = `${-(tempV_A.y * hHalf) + hHalf}px`;
    chargeBEl.style.left = `${(tempV_B.x * wHalf) + wHalf}px`;
    chargeBEl.style.top = `${-(tempV_B.y * hHalf) + hHalf}px`;

    // Position & orientation of Dipole moment vector
    if (diff > 0.05) {
        dipoleArrow.visible = true;
        const arrowLength = Math.min(diff * 1.5, 3.8);
        dipoleArrow.setLength(arrowLength, 0.4, 0.22);
        
        if (enA > enB) {
            dipoleArrow.setDirection(new THREE.Vector3(-1, 0, 0));
            dipoleArrow.position.set(arrowLength / 2, 1.8, 0);
            chargeAEl.textContent = 'δ-';
            chargeBEl.textContent = 'δ+';
            chargeAEl.style.opacity = 1;
            chargeBEl.style.opacity = 1;
        } else {
            dipoleArrow.setDirection(new THREE.Vector3(1, 0, 0));
            dipoleArrow.position.set(-arrowLength / 2, 1.8, 0);
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

// --- APP LOGIC ---
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
    } else {
        selectedAtomB = el;
    }

    updateSelectionStyles();
    updateBondSimulation();
}

function updateSelectionStyles() {
    document.querySelectorAll('.slot-toggle').forEach(btn => {
        const slot = btn.dataset.slot;
        btn.classList.toggle('active', slot === activeSlot);
    });

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

    document.getElementById('selectedAName').textContent = `${selectedAtomA.symbol} (${selectedAtomA.en.toFixed(2)})`;
    document.getElementById('selectedBName').textContent = `${selectedAtomB.symbol} (${selectedAtomB.en.toFixed(2)})`;
}

function updateBondSimulation() {
    const enA = selectedAtomA.en;
    const enB = selectedAtomB.en;
    const diff = Math.abs(enA - enB);
    const ionicPct = getIonicPercentage(diff);
    
    // Update labels
    document.getElementById('bondElements').textContent = `${selectedAtomA.name} - ${selectedAtomB.name}`;
    document.getElementById('enDifference').textContent = diff.toFixed(2);
    document.getElementById('ionicPercent').textContent = `${ionicPct.toFixed(1)}%`;

    // Category check
    const typeBadge = document.getElementById('bondType');
    const descBox = document.getElementById('bondDescription');

    typeBadge.className = 'summary-val badge'; // reset class
    
    if (diff < 0.4) {
        typeBadge.textContent = '무극성 공유 결합';
        typeBadge.classList.add('covalent');
        descBox.innerHTML = `두 원소의 전기음성도 차이가 매우 작아(${diff.toFixed(2)}), 3D 뷰어 상의 <strong>전자구름이 두 원자핵 사이에 고르게 분포</strong>해 있습니다. 전자를 양쪽에서 대칭에 가깝게 대등하게 공유하는 무극성 결합입니다.`;
    } else if (diff < 1.7) {
        typeBadge.textContent = '극성 공유 결합';
        typeBadge.classList.add('polar');
        const strongerSymbol = enA > enB ? selectedAtomA.symbol : selectedAtomB.symbol;
        descBox.innerHTML = `전기음성도 차이(${diff.toFixed(2)})로 인해 공유 전자구름이 더 강한 원소인 <strong>${strongerSymbol} 쪽으로 쏠려 있음</strong>을 볼 수 있습니다. 전자 분포 불균형으로 인해 분자 내에 부분적인 양전하(δ+)와 음전하(δ-)가 생성되며, 쌍극자 모멘트 벡터(화살표)가 발생합니다.`;
    } else {
        typeBadge.textContent = '이온 결합';
        typeBadge.classList.add('ionic');
        const strongerSymbol = enA > enB ? selectedAtomA.symbol : selectedAtomB.symbol;
        const weakerSymbol = enA > enB ? selectedAtomB.symbol : selectedAtomA.symbol;
        descBox.innerHTML = `두 원소의 전기음성도 차이가 극도로 커서(${diff.toFixed(2)}), 전자가 <strong>${weakerSymbol}에서 ${strongerSymbol}로 거의 완전히 전이</strong>되었습니다. 3D 뷰어에서 전자구름이 한쪽 구체에만 몰려 있으며, 두 원자는 각각 완전히 양이온과 음이온이 되어 강한 정전기적 인력으로 묶이게 됩니다.`;
    }

    updateChart(diff);
    update3DScene();
}

window.addEventListener('DOMContentLoaded', () => {
    initChart();
    initThree();
    renderPeriodicTable();

    document.getElementById('slotABtn').addEventListener('click', () => {
        activeSlot = 'A';
        updateSelectionStyles();
    });
    
    document.getElementById('slotBBtn').addEventListener('click', () => {
        activeSlot = 'B';
        updateSelectionStyles();
    });

    updateBondSimulation();
    
    // Quick update delay to ensure render layout handles coordinate system
    setTimeout(() => {
        updateBondSimulation();
    }, 150);
});
