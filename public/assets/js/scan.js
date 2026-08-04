const video = document.getElementById('video');
const statusDiv = document.getElementById('status');

let users = [];
let modelsLoaded = false;
let lastMatchedId = null;
let lastAlertTime = 0;
const COOLDOWN_MS = 8000;

// Start camera with optimized resolution
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Camera access denied:", err);
        statusDiv.innerHTML = '<span class="text-danger"><i class="bi bi-x-circle-fill me-2"></i>Camera access denied</span>';
    }
}

// Load AI Models
async function loadModels() {
    const localUrl = (typeof MODEL_URL !== 'undefined') ? MODEL_URL : 'models';
    const cdnUrl = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(localUrl),
            faceapi.nets.faceLandmark68Net.loadFromUri(localUrl),
            faceapi.nets.faceRecognitionNet.loadFromUri(localUrl)
        ]);

        modelsLoaded = true;
        statusDiv.innerHTML = '<span class="text-success"><i class="bi bi-check-circle-fill me-2"></i>AI Models Ready</span>';
    } catch (err) {
        console.warn("Local model load failed, attempting CDN fallback...", err);
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(cdnUrl),
                faceapi.nets.faceLandmark68Net.loadFromUri(cdnUrl),
                faceapi.nets.faceRecognitionNet.loadFromUri(cdnUrl)
            ]);

            modelsLoaded = true;
            statusDiv.innerHTML = '<span class="text-success"><i class="bi bi-check-circle-fill me-2"></i>AI Models Ready</span>';
        } catch (cdnErr) {
            console.error("Error loading models from both local and CDN:", cdnErr);
            statusDiv.innerHTML = '<span class="text-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>AI Model Error</span>';
        }
    }
}

// Load Users from Backend and Pre-parse face descriptors for fast matching
async function loadUsers() {
    try {
        const res = await fetch(`${API_URL}?action=getUsers`);
        if (!res.ok) throw new Error("API Connection Failed");
        const rawUsers = await res.json();
        users = rawUsers.map(u => {
            let parsed = null;
            try {
                parsed = typeof u.face_data === 'string' ? JSON.parse(u.face_data) : u.face_data;
            } catch (e) {
                console.error("Invalid descriptor for user:", u.name);
            }
            return { ...u, parsedDescriptor: parsed };
        }).filter(u => u.parsedDescriptor);
        console.log(`Loaded ${users.length} valid registered users.`);
    } catch (err) {
        console.error("Error fetching users:", err);
        statusDiv.innerHTML = '<span class="text-danger"><i class="bi bi-hdd-network-fill me-2"></i>DB Sync Failed</span>';
    }
}

// Fast Euclidean Distance calculation using loop
function euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

const scannedTodayUserIds = new Set();
const detectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
let isScanning = false;

// Scan Face
async function scan() {
    if (!modelsLoaded || users.length === 0 || video.paused || video.ended) return;

    const detection = await faceapi.detectSingleFace(video, detectorOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        statusDiv.innerHTML = '<span class="text-info"><i class="bi bi-search me-2"></i>Searching for face...</span>';
        return;
    }

    const currentDescriptor = Array.from(detection.descriptor);
    let matchedUser = null;
    let minDistance = 0.5;

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const dist = euclideanDistance(currentDescriptor, user.parsedDescriptor);
        if (dist < minDistance) {
            minDistance = dist;
            matchedUser = user;
        }
    }

    if (matchedUser) {
        updateUI(matchedUser);

        if (scannedTodayUserIds.has(matchedUser.id)) {
            statusDiv.innerHTML = `<span class="text-success"><i class="bi bi-check-all me-2 fs-5"></i>Welcome back, ${matchedUser.name}! (Already checked in today)</span>`;
            return;
        }

        const now = Date.now();
        if (lastMatchedId !== matchedUser.id || (now - lastAlertTime > COOLDOWN_MS)) {
            lastMatchedId = matchedUser.id;
            lastAlertTime = now;
            markAttendance(matchedUser);
        }
    } else {
        statusDiv.innerHTML = '<span class="text-danger animate__animated animate__shakeX"><i class="bi bi-person-x-fill me-2"></i>Unknown Face Detected</span>';
    }
}

// Update Sidebar Info
function updateUI(user) {
    document.getElementById('u_name').innerText = user.name;
    document.getElementById('u_age').innerText = user.age;
    document.getElementById('u_salary').innerText = "$" + parseFloat(user.salary).toLocaleString();
    document.getElementById('u_position').innerText = user.position;

    statusDiv.innerHTML = `<span class="text-success"><i class="bi bi-person-check-fill me-2"></i>Welcome, ${user.name}!</span>`;
}

// Premium SweetAlert
function triggerAlert(user, statusMessage = "Attendance Recorded Successfully", iconType = "success") {
    Swal.fire({
        title: `Welcome, ${user.name}!`,
        html: `
            <div class="text-start mt-3">
                <p><b>Position:</b> ${user.position}</p>
                <p><b>Status:</b> ${statusMessage}</p>
                <p class="small text-muted">Scanning completed at ${new Date().toLocaleTimeString()}</p>
            </div>
        `,
        icon: iconType,
        timer: 3000,
        showConfirmButton: false,
        background: '#1e293b',
        color: '#f1f5f9',
        toast: true,
        position: 'top-end',
        showClass: { popup: 'animate__animated animate__fadeInRight' },
        hideClass: { popup: 'animate__animated animate__fadeOutRight' }
    });
}

// Mark Attendance in DB
async function markAttendance(user) {
    if (scannedTodayUserIds.has(user.id)) return;

    try {
        const res = await fetch(`${API_URL}?action=attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id })
        });
        const result = await res.json();

        scannedTodayUserIds.add(user.id);

        if (result.status === "saved") {
            triggerAlert(user, "Attendance Recorded Successfully", "success");
        } else if (result.status === "already_marked") {
            triggerAlert(user, "Already Recorded Today", "info");
        }
    } catch (err) {
        console.error("Failed to mark attendance:", err);
    }
}

// Non-overlapping loop to prevent high CPU usage and lag
async function startScanLoop() {
    while (true) {
        if (modelsLoaded && users.length > 0 && !isScanning) {
            isScanning = true;
            try {
                await scan();
            } catch (err) {
                console.error("Scan loop error:", err);
            } finally {
                isScanning = false;
            }
        }
        await new Promise(r => setTimeout(r, 250));
    }
}

// Initialization
async function initApp() {
    startVideo();
    await loadModels();
    await loadUsers();
    startScanLoop();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initApp();
} else {
    window.addEventListener('DOMContentLoaded', initApp);
}
