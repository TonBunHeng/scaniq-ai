<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Face Attendance System</title>

<!-- Bootstrap -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
    body {
        background: #0f172a;
        color: white;
    }
    .card {
        border-radius: 15px;
    }
    video {
        border-radius: 15px;
    }
</style>
</head>

<body>

<div class="container py-4">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h3>📸 Face Attendance System</h3>
        <span class="badge bg-success">Online</span>
    </div>

    <div class="row">

        <!-- LEFT -->
        <div class="col-md-4">

            <!-- Register -->
            <div class="card p-3 shadow">
                <h5>Register User</h5>

                <input type="text" id="name" class="form-control my-2" placeholder="Enter name">
                <input type="number" id="age" class="form-control my-2" placeholder="Age">
                <input type="number" id="salary" class="form-control my-2" placeholder="Salary">
                <input type="text" id="position" class="form-control my-2" placeholder="Position">

                <button onclick="register()" class="btn btn-primary w-100 mt-2">
                    Register Face
                </button>
            </div>

            <!-- Status -->
            <div class="card mt-3 p-3 shadow">
                <h6>Status</h6>
                <p id="status" class="text-success">Loading models...</p>
            </div>

            <!-- User Info -->
            <div class="card mt-3 p-3 shadow">
                <h5>User Info</h5>
                <p><strong>Name:</strong> <span id="u_name">-</span></p>
                <p><strong>Age:</strong> <span id="u_age">-</span></p>
                <p><strong>Salary:</strong> <span id="u_salary">-</span></p>
                <p><strong>Position:</strong> <span id="u_position">-</span></p>
            </div>

        </div>

        <!-- RIGHT -->
        <div class="col-md-8">
            <div class="card p-3 shadow text-center">
                <h5>Camera</h5>
                <video id="video" width="100%" autoplay muted></video>
            </div>
        </div>

    </div>

</div>

<!-- JS -->
<script src="https://cdn.jsdelivr.net/npm/face-api.js"></script>

<script>
const video = document.getElementById('video');

let users = [];
let modelsLoaded = false;

// 🎥 Start camera
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => video.srcObject = stream);

// 🧠 Load AI Models
async function loadModels() {
    const url = 'https://justadudewhohacks.github.io/face-api.js/models';

    await faceapi.nets.tinyFaceDetector.loadFromUri(url);
    await faceapi.nets.faceLandmark68Net.loadFromUri(url);
    await faceapi.nets.faceRecognitionNet.loadFromUri(url);

    modelsLoaded = true;
    document.getElementById('status').innerText = "✅ Ready to scan";
}

// 👤 Load Users
async function loadUsers() {
    const res = await fetch('index.php?action=getUsers');
    users = await res.json();
}

// 📏 Distance
function distance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i])**2, 0));
}

// 📝 Register
async function register() {
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const salary = document.getElementById('salary').value;
    const position = document.getElementById('position').value;

    if (!name) return alert("Enter name!");

    if (!modelsLoaded) return alert("Models not ready!");

    const detection = await faceapi.detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) return alert("❌ No face detected!");

    await fetch('index.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            age,
            salary,
            position,
            descriptor: Array.from(detection.descriptor)
        })
    });

    alert("✅ Registered!");
    loadUsers();
}

// 🔍 Scan Face
async function scan() {

    if (!modelsLoaded) return;

    const detection = await faceapi.detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) return;

    const current = Array.from(detection.descriptor);

    let matched = null;

    users.forEach(user => {
        const saved = JSON.parse(user.face_data);
        const dist = distance(current, saved);

        if (dist < 0.5) matched = user;
    });

    if (matched) {
        document.getElementById('u_name').innerText = matched.name;
        document.getElementById('u_age').innerText = matched.age;
        document.getElementById('u_salary').innerText = "$" + matched.salary;
        document.getElementById('u_position').innerText = matched.position;

        document.getElementById('status').innerHTML =
            `<span class="text-success">✅ Welcome ${matched.name}</span>`;
    } else {
        document.getElementById('status').innerHTML =
            `<span class="text-danger">❌ Unknown Face</span>`;
    }
}

// 🚀 Start App
window.onload = async () => {
    await loadModels();
    await loadUsers();

    setInterval(scan, 2000);
};
</script>

</body>
</html>