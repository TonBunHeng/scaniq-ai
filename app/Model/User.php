<?php
class User {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function create($name, $face, $age, $salary, $position) {
        $stmt = $this->pdo->prepare("
            INSERT INTO users (name, face_data, age, salary, position)
            VALUES (?, ?, ?, ?, ?)
        ");
        return $stmt->execute([$name, $face, $age, $salary, $position]);
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM users");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}