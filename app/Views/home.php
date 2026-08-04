<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Face Attendance System | Premium AI</title>

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
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-5 animate__animated animate__fadeInDown">
        <h2 class="header-title m-0"><i class="bi bi-camera-reels-fill me-2"></i>Face Attendance AI</h2>
        <div class="d-flex gap-3">
            <a href="<?php echo defined('APP_ENTRY') ? 'index.php?action=register_view' : 'register.php'; ?>" class="btn btn-info rounded-pill px-4 shadow-sm fw-bold">
                <i class="bi bi-person-plus-fill me-1"></i>Register New Face
            </a>
            <div id="connection-status" class="status-badge bg-success shadow-sm">
                <span class="spinner-grow spinner-grow-sm me-2" role="status"></span>
                Online
            </div>
        </div>
    </div>

    <div class="row g-4">
        <!-- LEFT PANEL -->
        <div class="col-md-4 animate__animated animate__fadeInLeft">
            <!-- Status Card -->
            <div class="glass-card p-4 mb-4 shadow-lg">
                <h6 class="text-secondary mb-3">SYSTEM STATUS</h6>
                <div id="status" class="d-flex align-items-center text-warning">
                    <div class="spinner-border spinner-border-sm me-3" role="status"></div>
                    <span>Initializing models...</span>
                </div>
            </div>

            <!-- User Info Card -->
            <div class="glass-card p-4 shadow-lg">
                <h5 class="mb-4 d-flex align-items-center">
                    <i class="bi bi-person-badge-fill me-2 text-info"></i>Identified User
                </h5>
                <div>
                    <div class="user-info-label">Full Name</div>
                    <div id="u_name" class="user-info-value">-</div>
                    <div class="user-info-label">Age</div>
                    <div id="u_age" class="user-info-value">-</div>
                    <div class="user-info-label">Salary</div>
                    <div id="u_salary" class="user-info-value">-</div>
                    <div class="user-info-label">Position</div>
                    <div id="u_position" class="user-info-value">-</div>
                </div>
            </div>
        </div>

        <!-- RIGHT PANEL (Camera) -->
        <div class="col-md-8 animate__animated animate__fadeInRight">
            <div class="glass-card p-4 shadow-lg text-center h-100">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="m-0">Live Camera Feed</h5>
                    <small class="text-secondary">Face Detection Active</small>
                </div>
                <div class="scanning-pulse">
                    <video id="video" autoplay muted></video>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Libraries -->
<script src="<?php echo defined('APP_ENTRY') ? 'assets/js/face-api.min.js' : '../../public/assets/js/face-api.min.js'; ?>"></script>

<!-- Configuration & External Logic -->
<script>
    // Global Config for External JS
    const API_URL = '<?php echo defined("APP_ENTRY") ? "index.php" : "../../public/index.php"; ?>';
    const MODEL_URL = '<?php echo defined("APP_ENTRY") ? "models" : "../../public/models"; ?>';
</script>
<script src="<?php echo defined('APP_ENTRY') ? 'assets/js/scan.js' : '../../public/assets/js/scan.js'; ?>"></script>

</body>
</html>