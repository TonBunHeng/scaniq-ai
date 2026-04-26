const video = document.getElementById('video');
const statusDiv = document.getElementById('status');
const regForm = document.getElementById('regForm');
const submitBtn = document.getElementById('submitBtn');

let modelsLoaded = false;

// 🎥 Start camera
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error(err);
        statusDiv.innerHTML = '<span class="text-danger">❌ Camera access denied. Check browser permissions.</span>';
    }
}

// 🧠 Load AI Models
async function loadModels() {
    const url = 'https://justadudewhohacks.github.io/face-api.js/models';
    
    try {
        console.log("Loading models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri(url);
        await faceapi.nets.faceLandmark68Net.loadFromUri(url);
        await faceapi.nets.faceRecognitionNet.loadFromUri(url);
        
        modelsLoaded = true;
        console.log("Models loaded successfully");
        statusDiv.innerHTML = '<span class="text-success">✅ AI Ready. Please look at the camera.</span>';
        submitBtn.disabled = false;
        submitBtn.innerText = 'Capture & Register User';
    } catch (err) {
        console.error("Error loading models:", err);
        statusDiv.innerHTML = '<span class="text-danger">❌ AI Model Error. Check your internet connection.</span>';
        setTimeout(loadModels, 3000);
    }
}

// 🚀 Submit Form
regForm.onsubmit = async (e) => {
    e.preventDefault();
    
    if (!modelsLoaded) {
        Swal.fire({
            icon: 'warning',
            title: 'AI Not Ready',
            text: 'Please wait while we initialize the face recognition models.',
            background: '#1e293b',
            color: '#fff'
        });
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing Face...';

    try {
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            Swal.fire({
                icon: 'error',
                title: 'Face Not Detected',
                text: 'Please look directly at the camera and ensure your face is well-lit.',
                background: '#1e293b',
                color: '#fff'
            });
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Capture & Register User';
            return;
        }

        const userData = {
            name: document.getElementById('name').value,
            age: document.getElementById('age').value,
            salary: document.getElementById('salary').value,
            position: document.getElementById('position').value,
            descriptor: Array.from(detection.descriptor)
        };

        const res = await fetch(`${API_URL}?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const result = await res.json();

        if (result.status === "registered") {
            Swal.fire({
                icon: 'success',
                title: 'Registration Successful!',
                text: `${userData.name} has been added to the system.`,
                background: '#1e293b',
                color: '#fff',
                timer: 3000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = HOME_URL;
            });
        }
    } catch (err) {
        console.error("Registration error:", err);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Server communication error. Please try again.',
            background: '#1e293b',
            color: '#fff'
        });
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Capture & Register User';
    }
};

window.onload = async () => {
    await startVideo();
    await loadModels();
};
