<?php
// removeStaff.php
include 'db.php'; // Assuming your DB connection is in db.php

$data = json_decode(file_get_contents("php://input"), true);
$staffID = $data['staffID'];

$sql = "UPDATE staff SET is_removed = 1 WHERE StaffID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $staffID);
$stmt->execute();

echo json_encode(['success' => true]);
?>
