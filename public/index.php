<?php
define('APP_ENTRY', true);

require_once __DIR__ . "/../app/Controllers/FaceController.php";

$controller = new FaceController();

// Support both query param and direct URI path
$action = $_GET['action'] ?? '';
if (!$action) {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $action = ltrim($uri, '/');
}

switch ($action) {
    case 'register':
        $controller->register();
        break;

    case 'getUsers':
        $controller->getUsers();
        break;

    case 'attendance':
        $controller->attendance();
        break;

    case 'register_view':
        require_once __DIR__ . "/../app/Views/register.php";
        break;

    default:
        require_once __DIR__ . "/../app/Views/home.php";
}