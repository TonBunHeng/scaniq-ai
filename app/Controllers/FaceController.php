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
        if (empty($data['user_id'])) {
            echo json_encode(["status" => "error", "message" => "Invalid User ID"]);
            return;
        }

        $attendance = new Attendance($pdo);
        $saved = $attendance->mark($data['user_id']);

        if ($saved) {
            echo json_encode(["status" => "saved", "message" => "Attendance recorded"]);
        } else {
            echo json_encode(["status" => "already_marked", "message" => "Attendance already recorded today"]);
        }
    }

    public function updateUser() {
        global $pdo;

        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['id'])) {
            echo json_encode(["status" => "error", "message" => "Missing User ID"]);
            return;
        }

        $faceJson = !empty($data['descriptor']) ? json_encode($data['descriptor']) : null;

        $user = new User($pdo);
        $user->update(
            $data['id'],
            $data['name'],
            $data['age'],
            $data['salary'],
            $data['position'],
            $faceJson
        );

        echo json_encode(["status" => "updated"]);
    }

    public function deleteUser() {
        global $pdo;

        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? $_GET['id'] ?? null;

        if (!$id) {
            echo json_encode(["status" => "error", "message" => "Missing User ID"]);
            return;
        }

        $user = new User($pdo);
        $user->delete($id);

        echo json_encode(["status" => "deleted"]);
    }
}