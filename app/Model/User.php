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
        $stmt = $this->pdo->query("SELECT * FROM users ORDER BY id ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update($id, $name, $age, $salary, $position, $face = null) {
        if ($face !== null) {
            $stmt = $this->pdo->prepare("
                UPDATE users SET name = ?, age = ?, salary = ?, position = ?, face_data = ? WHERE id = ?
            ");
            return $stmt->execute([$name, $age, $salary, $position, $face, $id]);
        } else {
            $stmt = $this->pdo->prepare("
                UPDATE users SET name = ?, age = ?, salary = ?, position = ? WHERE id = ?
            ");
            return $stmt->execute([$name, $age, $salary, $position, $id]);
        }
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = ?");
        return $stmt->execute([$id]);
    }
}