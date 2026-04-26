<?php
require_once "../app/Controllers/FaceController.php";

$controller = new FaceController();

$action = $_GET['action'] ?? '';

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

    default:
        require_once "../app/Views/home.php";
}