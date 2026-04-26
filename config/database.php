<?php
$host = "localhost";
$db   = "face_attendance";
$user = "root";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage());
}