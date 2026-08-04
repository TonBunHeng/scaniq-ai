<?php
class Attendance {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function hasMarkedToday($user_id) {
        $stmt = $this->pdo->prepare("SELECT id FROM attendance WHERE user_id = ? AND DATE(timestamp) = CURDATE()");
        $stmt->execute([$user_id]);
        return (bool) $stmt->fetch();
    }

    public function mark($user_id) {
        if ($this->hasMarkedToday($user_id)) {
            return false; // Already recorded today
        }

        $stmt = $this->pdo->prepare("INSERT INTO attendance (user_id) VALUES (?)");
        return $stmt->execute([$user_id]);
    }
}