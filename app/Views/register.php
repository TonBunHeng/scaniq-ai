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
        <h2 class="header-title m-0">👤 User Registration</h2>
        <a href="<?php echo defined('APP_ENTRY') ? 'index.php' : 'home.php'; ?>" class="btn btn-outline-light rounded-pill px-4">Back to Scan</a>
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
            <div class="glass-card p-4">
                <h5 class="mb-4">Personal Details</h5>
                
                <form id="regForm">
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

                    <button type="submit" id="submitBtn" class="btn btn-primary w-100" disabled>
                        Waiting for AI...
                    </button>
                </form>
            </div>
        </div>

    </div>

</div>

<!-- Use a more reliable CDN version -->
<script src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js"></script>

<!-- Configuration & External Logic -->
<script>
    const API_URL = '<?php echo defined("APP_ENTRY") ? "index.php" : "../../public/index.php"; ?>';
    const HOME_URL = '<?php echo defined("APP_ENTRY") ? "index.php" : "home.php"; ?>';
</script>
<script src="<?php echo defined('APP_ENTRY') ? 'assets/js/register.js' : '../../public/assets/js/register.js'; ?>"></script>

</body>
</html>
