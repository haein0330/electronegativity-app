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

// --- 2D CANVAS BOND VISUALIZER ---
let canvas, ctx;
const PARTICLE_COUNT = 800; // Dense static particles

function initCanvasVisualizer() {
    canvas = document.getElementById('bondCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        drawStaticScene();
    });
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
}

// Draw the static distribution of electrons (no animation loop)
function drawStaticScene() {
    if (!canvas || !ctx) return;
    
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    
    ctx.clearRect(0, 0, width, height);

    // Positions of Atom A and Atom B
    const xCenter = width / 2;
    const yCenter = height / 2;
    const spacing = 160; 
    const xA = xCenter - spacing;
    const xB = xCenter + spacing;

    const enA = selectedAtomA.en;
    const enB = selectedAtomB.en;
    const diff = Math.abs(enA - enB);
    const sumEn = enA + enB;
    
    // Relative distribution weights
    const wA = enA / sumEn;
    const wB = enB / sumEn;

    // Radii of atomic cores
    const baseRadiusA = Math.sqrt(selectedAtomA.radius) * 35;
    const baseRadiusB = Math.sqrt(selectedAtomB.radius) * 35;

    let glowColor = 'rgba(0, 242, 254, 0.4)';  // Cyan
    let particleColor = '#00f2fe';
    if (diff >= 0.4 && diff < 1.7) {
        glowColor = 'rgba(245, 158, 11, 0.45)'; // Amber/Orange
        particleColor = '#f59e0b';
    } else if (diff >= 1.7) {
        glowColor = 'rgba(255, 0, 127, 0.45)';  // Pink
        particleColor = '#ff007f';
    }

    // --- 1. RENDER ELECTRON CLOUD DENSITY (BACKGROUND GLOW) ---
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Shared bonding bridge (gradually vanishes as polar diff increases, completely gone in ionic)
    if (diff < 1.7) {
        const bridgeGlow = ctx.createLinearGradient(xA, yCenter, xB, yCenter);
        const bridgeOpacity = ((1.7 - diff) / 1.7) * 0.75;
        
        bridgeGlow.addColorStop(0, `rgba(0, 242, 254, ${wA * bridgeOpacity})`);
        bridgeGlow.addColorStop(0.5, glowColor.replace('0.4', (bridgeOpacity * 0.8).toString()));
        bridgeGlow.addColorStop(1, `rgba(255, 0, 127, ${wB * bridgeOpacity})`);

        ctx.strokeStyle = bridgeGlow;
        ctx.lineWidth = 65 * (1 - diff / 2.0);
        ctx.lineCap = 'round';
        ctx.shadowBlur = 30;
        ctx.shadowColor = particleColor;
        ctx.beginPath();
        ctx.moveTo(xA, yCenter);
        ctx.lineTo(xB, yCenter);
        ctx.stroke();
    }

    // Cloud around Atom A (shrinks if B is stronger)
    const radGlowA = ctx.createRadialGradient(xA, yCenter, 0, xA, yCenter, baseRadiusA * (1.7 - diff * 0.5));
    const opacityA = enA >= enB ? 0.8 : 0.8 - diff * 0.35;
    radGlowA.addColorStop(0, `rgba(0, 242, 254, ${opacityA})`);
    radGlowA.addColorStop(0.5, `rgba(0, 242, 254, ${opacityA * 0.3})`);
    radGlowA.addColorStop(1, 'rgba(0, 242, 254, 0)');
    ctx.fillStyle = radGlowA;
    ctx.beginPath();
    ctx.arc(xA, yCenter, baseRadiusA * (1.7 - diff * 0.5), 0, Math.PI * 2);
    ctx.fill();

    // Cloud around Atom B (grows if B is stronger)
    const radGlowB = ctx.createRadialGradient(xB, yCenter, 0, xB, yCenter, baseRadiusB * (1.7 + diff * 0.4));
    const opacityB = enB >= enA ? 0.8 : 0.8 - diff * 0.35;
    radGlowB.addColorStop(0, `rgba(255, 0, 127, ${opacityB})`);
    radGlowB.addColorStop(0.5, `rgba(255, 0, 127, ${opacityB * 0.3})`);
    radGlowB.addColorStop(1, 'rgba(255, 0, 127, 0)');
    ctx.fillStyle = radGlowB;
    ctx.beginPath();
    ctx.arc(xB, yCenter, baseRadiusB * (1.7 + diff * 0.4), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // --- 2. RENDER STATIC ELECTRON DOTS (DENSITY DISTRIBUTION) ---
    ctx.save();
    ctx.shadowBlur = 4;
    ctx.shadowColor = particleColor;
    ctx.fillStyle = particleColor;

    // Use a deterministic seed generator for static dot layout
    let seed = 45;
    function random() {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    const bridgeRatio = diff >= 1.7 ? 0 : 0.35 * (1 - diff / 1.7); // proportion of shared electrons

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        let px = 0, py = 0;
        const type = random();

        if (type < bridgeRatio) {
            // Shared bridge zone (between A and B)
            const t = random();
            px = xA + (xB - xA) * t;
            const dispersion = (random() - 0.5) * 45 * Math.sin(t * Math.PI);
            py = yCenter + dispersion;
        } else {
            // Clustered zone (around Core A or Core B depending on electronegativity weight)
            const isA = random() < wA;
            const center = isA ? xA : xB;
            const coreRadius = isA ? baseRadiusA : baseRadiusB;
            
            // Adjust outer cloud limits
            let maxRadius = coreRadius * 1.8;
            if (diff > 0.05) {
                if (isA && enA < enB) maxRadius = coreRadius * Math.max(1.8 - diff * 0.7, 0.5);
                if (!isA && enB < enA) maxRadius = coreRadius * Math.max(1.8 - diff * 0.7, 0.5);
            }

            const angle = random() * Math.PI * 2;
            const dist = Math.pow(random(), 1.3) * maxRadius; // concentrates near center

            px = center + Math.cos(angle) * dist;
            py = yCenter + Math.sin(angle) * dist * 0.9;
        }

        const size = random() * 1.8 + 0.8;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // --- 3. RENDER ATOMIC CORES ---
    // Core A
    ctx.save();
    const coreGradA = ctx.createRadialGradient(xA - 8, yCenter - 8, 2, xA, yCenter, baseRadiusA);
    coreGradA.addColorStop(0, '#ffffff');
    coreGradA.addColorStop(0.3, selectedAtomA.color);
    coreGradA.addColorStop(1, '#020617');
    ctx.fillStyle = coreGradA;
    ctx.beginPath();
    ctx.arc(xA, yCenter, baseRadiusA, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedAtomA.symbol, xA, yCenter);
    ctx.restore();

    // Core B
    ctx.save();
    const coreGradB = ctx.createRadialGradient(xB - 8, yCenter - 8, 2, xB, yCenter, baseRadiusB);
    coreGradB.addColorStop(0, '#ffffff');
    coreGradB.addColorStop(0.3, selectedAtomB.color);
    coreGradB.addColorStop(1, '#020617');
    ctx.fillStyle = coreGradB;
    ctx.beginPath();
    ctx.arc(xB, yCenter, baseRadiusB, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedAtomB.symbol, xB, yCenter);
    ctx.restore();

    // --- 4. RENDER DIPOLE MOMENT ARROW ---
    if (diff > 0.05) {
        ctx.save();
        const arrowY = yCenter - 75;
        const arrowLength = Math.min(diff * 65, 220);
        
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f59e0b';

        const isDirLeft = enA > enB; 
        const arrowStartX = xCenter + (isDirLeft ? (arrowLength / 2) : -(arrowLength / 2));
        const arrowEndX = xCenter + (isDirLeft ? -(arrowLength / 2) : (arrowLength / 2));

        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowY);
        ctx.lineTo(arrowEndX, arrowY);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        if (isDirLeft) {
            ctx.moveTo(arrowEndX, arrowY);
            ctx.lineTo(arrowEndX + 10, arrowY - 6);
            ctx.lineTo(arrowEndX + 10, arrowY + 6);
        } else {
            ctx.moveTo(arrowEndX, arrowY);
            ctx.lineTo(arrowEndX - 10, arrowY - 6);
            ctx.lineTo(arrowEndX - 10, arrowY + 6);
        }
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowY - 6);
        ctx.lineTo(arrowStartX, arrowY + 6);
        ctx.stroke();

        ctx.font = '500 10px Orbitron';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('DIPOLE MOMENT', xCenter, arrowY - 14);
        ctx.restore();
    }

    // --- 5. RENDER PARTIAL CHARGES (δ+, δ-) ---
    if (diff > 0.05) {
        ctx.save();
        ctx.font = '900 16px Orbitron';
        ctx.textAlign = 'center';
        
        const labelY = yCenter - baseRadiusA - 20;

        if (enA > enB) {
            ctx.fillStyle = '#00f2fe';
            ctx.shadowColor = '#00f2fe';
            ctx.shadowBlur = 8;
            ctx.fillText('δ-', xA, labelY);
            
            ctx.fillStyle = '#ff007f';
            ctx.shadowColor = '#ff007f';
            ctx.shadowBlur = 8;
            ctx.fillText('δ+', xB, labelY);
        } else {
            ctx.fillStyle = '#00f2fe';
            ctx.shadowColor = '#00f2fe';
            ctx.shadowBlur = 8;
            ctx.fillText('δ+', xA, labelY);
            
            ctx.fillStyle = '#ff007f';
            ctx.shadowColor = '#ff007f';
            ctx.shadowBlur = 8;
            ctx.fillText('δ-', xB, labelY);
        }
        ctx.restore();
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
        descBox.innerHTML = `두 원소의 전기음성도 차이가 매우 작아(${diff.toFixed(2)}), <strong>전자구름이 두 원자핵 사이에 대칭적으로 고르게 공유</strong>됩니다. 양쪽 원자가 전자를 대등하게 공유하는 무극성 성격을 가집니다.`;
    } else if (diff < 1.7) {
        typeBadge.textContent = '극성 공유 결합';
        typeBadge.classList.add('polar');
        const strongerSymbol = enA > enB ? selectedAtomA.symbol : selectedAtomB.symbol;
        descBox.innerHTML = `전기음성도 차이(${diff.toFixed(2)})로 인해 공유 전자구름이 더 강한 원소인 <strong>${strongerSymbol} 쪽으로 쏠려 있음</strong>을 볼 수 있습니다. 전자 분포 불균형으로 인해 분자 내에 부분적인 양전하(δ+)와 음전하(δ-)가 생성되며, 쌍극자 모멘트가 발생합니다.`;
    } else {
        typeBadge.textContent = '이온 결합';
        typeBadge.classList.add('ionic');
        const strongerSymbol = enA > enB ? selectedAtomA.symbol : selectedAtomB.symbol;
        const weakerSymbol = enA > enB ? selectedAtomB.symbol : selectedAtomA.symbol;
        descBox.innerHTML = `두 원소의 전기음성도 차이가 매우 커서(${diff.toFixed(2)}), 전자가 <strong>${weakerSymbol}에서 ${strongerSymbol}로 거의 완전히 전이</strong>되어 공유되지 않습니다. 전자구름이 강한 원소 주위에만 모이고 두 원자는 양이온과 음이온이 됩니다.`;
    }

    updateChart(diff);
    drawStaticScene();
}

window.addEventListener('DOMContentLoaded', () => {
    initChart();
    initCanvasVisualizer();
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
    
    setTimeout(() => {
        updateBondSimulation();
    }, 150);
});
