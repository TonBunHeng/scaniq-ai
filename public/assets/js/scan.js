const video = document.getElementById('video');
const statusDiv = document.getElementById('status');

let users = [];
let modelsLoaded = false;
let lastMatchedId = null;
let lastAlertTime = 0;
const COOLDOWN_MS = 8000;

// 🎥 Start camera
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error("Camera access denied:", err);
        statusDiv.innerHTML = '<span class="text-danger">❌ Camera access denied</span>';
    }
}

// 🧠 Load AI Models
async function loadModels() {
    const url = 'https://justadudewhohacks.github.io/face-api.js/models';
    
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(url),
            faceapi.nets.faceLandmark68Net.loadFromUri(url),
            faceapi.nets.faceRecognitionNet.loadFromUri(url)
        ]);

        modelsLoaded = true;
        statusDiv.innerHTML = '<span class="text-success">✅ AI Models Ready</span>';
    } catch (err) {
        console.error("Error loading models:", err);
        statusDiv.innerHTML = '<span class="text-danger">❌ AI Model Error</span>';
    }
}

// 👤 Load Users from Backend
async function loadUsers() {
    try {
        const res = await fetch(`${API_URL}?action=getUsers`);
        if (!res.ok) throw new Error("API Connection Failed");
        users = await res.json();
        console.log(`Loaded ${users.length} registered users.`);
    } catch (err) {
        console.error("Error fetching users:", err);
        statusDiv.innerHTML = '<span class="text-danger">❌ DB Sync Failed</span>';
    }
}

// 📏 Euclidean Distance for Face Matching
function euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

// 🔍 Scan Face
async function scan() {
    if (!modelsLoaded || users.length === 0) return;

    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        statusDiv.innerHTML = '<span class="text-info">🔍 Searching for face...</span>';
        return;
    }

    const currentDescriptor = Array.from(detection.descriptor);
    let matchedUser = null;
    let minDistance = 0.5;

    users.forEach(user => {
        try {
            const savedDescriptor = JSON.parse(user.face_data);
            const dist = euclideanDistance(currentDescriptor, savedDescriptor);

            if (dist < minDistance) {
                minDistance = dist;
                matchedUser = user;
            }
        } catch (e) {
            console.error("Invalid face data for user:", user.name);
        }
    });

    if (matchedUser) {
        updateUI(matchedUser);
        
        const now = Date.now();
        if (lastMatchedId !== matchedUser.id || (now - lastAlertTime > COOLDOWN_MS)) {
            triggerAlert(matchedUser);
            markAttendance(matchedUser.id);
            lastMatchedId = matchedUser.id;
            lastAlertTime = now;
        }
    } else {
        statusDiv.innerHTML = '<span class="text-danger animate__animated animate__shakeX">❌ Unknown Face Detected</span>';
    }
}

// 📋 Update Sidebar Info
function updateUI(user) {
    document.getElementById('u_name').innerText = user.name;
    document.getElementById('u_age').innerText = user.age;
    document.getElementById('u_salary').innerText = "$" + parseFloat(user.salary).toLocaleString();
    document.getElementById('u_position').innerText = user.position;

    statusDiv.innerHTML = `<span class="text-success">✅ Welcome, ${user.name}!</span>`;
}

// 🔔 Premium SweetAlert
function triggerAlert(user) {
    Swal.fire({
        title: `Welcome, ${user.name}!`,
        html: `
            <div class="text-start mt-3">
                <p><b>Position:</b> ${user.position}</p>
                <p><b>Status:</b> Attendance Recorded Successfully</p>
                <p class="small text-muted">Scanning completed at ${new Date().toLocaleTimeString()}</p>
            </div>
        `,
        icon: 'success',
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

// 📤 Mark Attendance in DB
async function markAttendance(userId) {
    try {
        await fetch(`${API_URL}?action=attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });
    } catch (err) {
        console.error("Failed to mark attendance:", err);
    }
}

// 🚀 Initialization
window.onload = async () => {
    await startVideo();
    await loadModels();
    await loadUsers();
    setInterval(scan, 1000);
};
