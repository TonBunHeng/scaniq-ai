const video = document.getElementById('video');
const statusDiv = document.getElementById('status');
const regForm = document.getElementById('regForm');
const submitBtn = document.getElementById('submitBtn');

let modelsLoaded = false;

// Start camera with optimized resolution
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        video.srcObject = stream;
    } catch (err) {
        console.error(err);
        statusDiv.innerHTML = '<span class="text-danger"><i class="bi bi-x-circle-fill me-2"></i>Camera access denied. Check browser permissions.</span>';
    }
}

// Load AI Models
async function loadModels() {
    const localUrl = (typeof MODEL_URL !== 'undefined') ? MODEL_URL : 'models';
    const cdnUrl = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

    console.log("Loading models from:", localUrl);

    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(localUrl),
            faceapi.nets.faceLandmark68Net.loadFromUri(localUrl),
            faceapi.nets.faceRecognitionNet.loadFromUri(localUrl)
        ]);

        modelsLoaded = true;
        console.log("Models loaded successfully from local path");
        statusDiv.innerHTML = '<span class="text-success"><i class="bi bi-check-circle-fill me-2"></i>AI Ready. Please look at the camera.</span>';
        submitBtn.disabled = false;
        submitBtn.innerText = 'Capture & Register User';
    } catch (err) {
        console.warn("Error loading local models, trying CDN fallback...", err);
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(cdnUrl),
                faceapi.nets.faceLandmark68Net.loadFromUri(cdnUrl),
                faceapi.nets.faceRecognitionNet.loadFromUri(cdnUrl)
            ]);

            modelsLoaded = true;
            console.log("Models loaded successfully from CDN fallback");
            statusDiv.innerHTML = '<span class="text-success"><i class="bi bi-check-circle-fill me-2"></i>AI Ready. Please look at the camera.</span>';
            submitBtn.disabled = false;
            submitBtn.innerText = 'Capture & Register User';
        } catch (cdnErr) {
            console.error("Error loading models from both local and CDN:", cdnErr);
            statusDiv.innerHTML = '<span class="text-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>AI Model Error. Could not load recognition models.</span>';
            setTimeout(loadModels, 5000);
        }
    }
}

// Submit Form (Handles both Create & Edit/Update)
regForm.onsubmit = async (e) => {
    e.preventDefault();

    const editingUserId = document.getElementById('userId').value;
    const isEditing = Boolean(editingUserId);

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${isEditing ? 'Updating User...' : 'Processing Face...'}`;

    try {
        let descriptor = null;

        if (modelsLoaded && video.srcObject) {
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detection) {
                descriptor = Array.from(detection.descriptor);
            }
        }

        // For new registrations, face capture is required
        if (!isEditing && !descriptor) {
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
            id: editingUserId,
            name: document.getElementById('name').value,
            age: document.getElementById('age').value,
            salary: document.getElementById('salary').value,
            position: document.getElementById('position').value,
            descriptor: descriptor
        };

        const targetAction = isEditing ? 'updateUser' : 'register';
        const res = await fetch(`${API_URL}?action=${targetAction}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const result = await res.json();

        if (result.status === "registered" || result.status === "updated") {
            await fetchAndRenderUsers();
            cancelEditMode();
            Swal.fire({
                icon: 'success',
                title: isEditing ? 'User Updated!' : 'Registration Successful!',
                text: `${userData.name} has been successfully ${isEditing ? 'updated' : 'registered'}.`,
                background: '#1e293b',
                color: '#fff',
                timer: 2500,
                showConfirmButton: false
            });
        }
    } catch (err) {
        console.error("Form submit error:", err);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Server communication error. Please try again.',
            background: '#1e293b',
            color: '#fff'
        });
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = isEditing ? 'Update User Details' : 'Capture & Register User';
    }
};

let allRegisteredUsers = [];
let currentPage = 1;
const itemsPerPage = 5;

// Load & Render User Table with Pagination
async function fetchAndRenderUsers() {
    const userTableBody = document.getElementById('userTableBody');
    const totalUsersBadge = document.getElementById('totalUsersBadge');

    if (!userTableBody) return;

    try {
        const res = await fetch(`${API_URL}?action=getUsers`);
        if (!res.ok) throw new Error("Failed to fetch users");
        allRegisteredUsers = await res.json();

        if (totalUsersBadge) {
            totalUsersBadge.innerText = `Total: ${allRegisteredUsers.length}`;
        }

        renderUserTable(currentPage);
    } catch (err) {
        console.error("Error loading user table:", err);
        userTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4"><i class="bi bi-exclamation-triangle-fill me-2"></i>Failed to load user list</td></tr>`;
    }
}

function renderUserTable(page) {
    const userTableBody = document.getElementById('userTableBody');
    const pageInfo = document.getElementById('pageInfo');
    const paginationControls = document.getElementById('paginationControls');

    if (!userTableBody) return;

    if (allRegisteredUsers.length === 0) {
        userTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No registered users found</td></tr>`;
        if (pageInfo) pageInfo.innerText = "Showing 0 to 0 of 0 users";
        if (paginationControls) paginationControls.innerHTML = "";
        return;
    }

    const totalPages = Math.ceil(allRegisteredUsers.length / itemsPerPage);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, allRegisteredUsers.length);
    const usersForPage = allRegisteredUsers.slice(startIndex, endIndex);

    userTableBody.innerHTML = usersForPage.map((u, idx) => {
        const rowNum = startIndex + idx + 1;
        const regDate = u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
        const formattedSalary = u.salary ? `$${parseFloat(u.salary).toLocaleString()}` : '$0';

        return `
            <tr>
                <td class="fw-bold text-info">${rowNum}</td>
                <td class="fw-semibold text-white">${u.name}</td>
                <td class="text-light">${u.age || '-'}</td>
                <td class="text-info font-monospace fw-semibold">${formattedSalary}</td>
                <td><span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1 fw-normal">${u.position || '-'}</span></td>
                <td class="small text-light opacity-75">${regDate}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-info btn-sm rounded-2 me-1" onclick="viewUser(${u.id})" title="View User">
                            <i class="bi bi-eye-fill"></i>
                        </button>
                        <button class="btn btn-outline-warning btn-sm rounded-2 me-1" onclick="editUser(${u.id})" title="Edit User">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm rounded-2" onclick="deleteUser(${u.id})" title="Delete User">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    if (pageInfo) {
        pageInfo.innerText = `Showing ${startIndex + 1} to ${endIndex} of ${allRegisteredUsers.length} users`;
    }

    // Render Pagination Controls
    if (paginationControls) {
        let paginationHTML = `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="changePage(${page - 1})">Previous</button>
            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === page ? 'active' : ''}">
                    <button class="page-link" onclick="changePage(${i})">${i}</button>
                </li>
            `;
        }

        paginationHTML += `
            <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                <button class="page-link" onclick="changePage(${page + 1})">Next</button>
            </li>
        `;

        paginationControls.innerHTML = paginationHTML;
    }
}

function changePage(newPage) {
    const totalPages = Math.ceil(allRegisteredUsers.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        renderUserTable(newPage);
    }
}

// VIEW USER ACTION
function viewUser(id) {
    const user = allRegisteredUsers.find(u => u.id == id);
    if (!user) return;

    Swal.fire({
        title: `<i class="bi bi-person-vcard me-2 text-info"></i>${user.name}`,
        html: `
            <div class="text-start mt-3">
                <p><b>User ID:</b> ${user.id}</p>
                <p><b>Age:</b> ${user.age || 'N/A'}</p>
                <p><b>Salary:</b> $${parseFloat(user.salary || 0).toLocaleString()}</p>
                <p><b>Position:</b> ${user.position || 'N/A'}</p>
                <p><b>Registered Date:</b> ${user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</p>
                <p><b>Face Model Status:</b> <span class="badge bg-success"><i class="bi bi-check-circle-fill me-1"></i>Enrolled & Active</span></p>
            </div>
        `,
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#38bdf8',
        confirmButtonText: 'Close'
    });
}

// EDIT USER ACTION (Populate into Personal Details form)
function editUser(id) {
    const user = allRegisteredUsers.find(u => u.id == id);
    if (!user) return;

    document.getElementById('userId').value = user.id;
    document.getElementById('name').value = user.name || '';
    document.getElementById('age').value = user.age || '';
    document.getElementById('salary').value = user.salary || '';
    document.getElementById('position').value = user.position || '';

    const formTitle = document.getElementById('formTitle');
    const editModeBadge = document.getElementById('editModeBadge');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    if (formTitle) formTitle.innerText = "Edit User Details";
    if (editModeBadge) editModeBadge.classList.remove('d-none');
    if (cancelEditBtn) cancelEditBtn.classList.remove('d-none');

    submitBtn.innerText = 'Update User Details';

    const formCard = document.getElementById('formCard');
    if (formCard) {
        formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// CANCEL EDIT MODE
function cancelEditMode() {
    document.getElementById('userId').value = "";
    regForm.reset();

    const formTitle = document.getElementById('formTitle');
    const editModeBadge = document.getElementById('editModeBadge');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    if (formTitle) formTitle.innerText = "Personal Details";
    if (editModeBadge) editModeBadge.classList.add('d-none');
    if (cancelEditBtn) cancelEditBtn.classList.add('d-none');

    submitBtn.innerText = modelsLoaded ? 'Capture & Register User' : 'Waiting for AI...';
}

// DELETE USER ACTION
function deleteUser(id) {
    const user = allRegisteredUsers.find(u => u.id == id);
    if (!user) return;

    Swal.fire({
        title: 'Delete User?',
        text: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, Delete',
        background: '#1e293b',
        color: '#fff'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}?action=deleteUser`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: user.id })
                });
                const resData = await res.json();
                if (resData.status === 'deleted') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: `${user.name} has been removed.`,
                        background: '#1e293b',
                        color: '#fff',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    fetchAndRenderUsers();
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete user.' });
                }
            } catch (err) {
                console.error("Delete error:", err);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Server communication error.' });
            }
        }
    });
}

async function initApp() {
    startVideo();
    fetchAndRenderUsers();
    await loadModels();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initApp();
} else {
    window.addEventListener('DOMContentLoaded', initApp);
}
