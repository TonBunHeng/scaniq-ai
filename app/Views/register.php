<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Registration | Face Attendance AI</title>

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Animate.css -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>

    <!-- Custom Styles -->
    <link rel="stylesheet" href="<?php echo defined('APP_ENTRY') ? 'assets/css/style.css' : '../../public/assets/css/style.css'; ?>">
</head>

<body>

<div class="container py-5">

    <div class="d-flex justify-content-between align-items-center mb-5">
        <h2 class="header-title m-0"><i class="bi bi-person-badge-fill me-2"></i>User Registration</h2>
        <a href="<?php echo defined('APP_ENTRY') ? 'index.php' : 'home.php'; ?>" class="btn btn-outline-light rounded-pill px-4">
            <i class="bi bi-arrow-left me-1"></i>Back to Scan
        </a>
    </div>

    <div class="row g-4">
        
        <!-- Camera Section -->
        <div class="col-md-6">
            <div class="glass-card p-4 h-100 text-center">
                <h5 class="mb-3">Face Capture</h5>
                <video id="video" autoplay muted></video>
                <div id="status" class="mt-3 text-info">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    Initializing AI Models...
                </div>
            </div>
        </div>

        <!-- Form Section -->
        <div class="col-md-6">
            <div class="glass-card p-4" id="formCard">
                <h5 class="mb-4 d-flex justify-content-between align-items-center">
                    <span id="formTitle">Personal Details</span>
                    <span id="editModeBadge" class="badge bg-warning text-dark d-none">Editing User</span>
                </h5>
                
                <form id="regForm">
                    <input type="hidden" id="userId" value="">

                    <div class="mb-3">
                        <label class="form-label text-secondary small">FULL NAME</label>
                        <input type="text" id="name" class="form-control" placeholder="Enter full name" required>
                    </div>

                    <div class="row mb-3">
                        <div class="col-6">
                            <label class="form-label text-secondary small">AGE</label>
                            <input type="number" id="age" class="form-control" placeholder="Age" required>
                        </div>
                        <div class="col-6">
                            <label class="form-label text-secondary small">SALARY ($)</label>
                            <input type="number" id="salary" class="form-control" placeholder="Salary" required>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label text-secondary small">POSITION</label>
                        <input type="text" id="position" class="form-control" placeholder="Job Title" required>
                    </div>

                    <div class="d-flex gap-2">
                        <button type="submit" id="submitBtn" class="btn btn-primary w-100" disabled>
                            Waiting for AI...
                        </button>
                        <button type="button" id="cancelEditBtn" class="btn btn-outline-secondary d-none px-3 rounded-3" onclick="cancelEditMode()">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>

    </div>

    <!-- Registered Users Table -->
    <div class="row mt-5">
        <div class="col-12">
            <div class="glass-card p-4">
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h5 class="m-0 d-flex align-items-center">
                        <i class="bi bi-people-fill me-2 text-info"></i>Registered Users List
                    </h5>
                    <span class="badge bg-primary rounded-pill px-3 py-2 fs-6" id="totalUsersBadge">Total: 0</span>
                </div>

                <div class="table-responsive">
                    <table class="table table-dark table-hover align-middle mb-0 custom-table">
                        <thead>
                            <tr>
                                <th scope="col" style="width: 70px;">#</th>
                                <th scope="col">FULL NAME</th>
                                <th scope="col">AGE</th>
                                <th scope="col">SALARY ($)</th>
                                <th scope="col">POSITION</th>
                                <th scope="col">REGISTERED AT</th>
                                <th scope="col" class="text-center" style="width: 140px;">ACTION</th>
                            </tr>
                        </thead>
                        <tbody id="userTableBody">
                            <tr>
                                <td colspan="7" class="text-center text-muted py-4">Loading users...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination Footer -->
                <div class="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
                    <div class="small text-secondary fw-semibold" id="pageInfo">Showing 0 to 0 of 0 users</div>
                    <nav>
                        <ul class="pagination pagination-sm m-0 gap-1" id="paginationControls">
                            <!-- Populated dynamically by JS -->
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>

</div>

<!-- Face API library -->
<script src="<?php echo defined('APP_ENTRY') ? 'assets/js/face-api.min.js' : '../../public/assets/js/face-api.min.js'; ?>"></script>

<!-- Configuration & External Logic -->
<script>
    const API_URL = '<?php echo defined("APP_ENTRY") ? "index.php" : "../../public/index.php"; ?>';
    const HOME_URL = '<?php echo defined("APP_ENTRY") ? "index.php" : "home.php"; ?>';
    const MODEL_URL = '<?php echo defined("APP_ENTRY") ? "models" : "../../public/models"; ?>';
</script>
<script src="<?php echo defined('APP_ENTRY') ? 'assets/js/register.js' : '../../public/assets/js/register.js'; ?>"></script>

</body>
</html>
