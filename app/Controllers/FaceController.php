<?php
require_once __DIR__ . "/../../config/database.php";
require_once __DIR__ . "/../Model/User.php";
require_once __DIR__ . "/../Model/Attendance.php";

class FaceController {

    public function register() {
        global $pdo;

        $data = json_decode(file_get_contents("php://input"), true);

        $user = new User($pdo);
        $user->create(
            $data['name'],
            json_encode($data['descriptor']),
            $data['age'],
            $data['salary'],
            $data['position']
        );

        echo json_encode(["status" => "registered"]);
    }

    public function getUsers() {
        global $pdo;

        $user = new User($pdo);
        echo json_encode($user->getAll());
    }

    public function attendance() {
        global $pdo;

        $data = json_decode(file_get_contents("php://input"), true);

        $attendance = new Attendance($pdo);
        $attendance->mark($data['user_id']);

        echo json_encode(["status" => "saved"]);
    }
}