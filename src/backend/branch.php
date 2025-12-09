<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

$host = 'localhost'; // Database host
$db = 'payroll'; // Database name
$user = 'root'; // Database username
$pass = ''; // Database password

try {
    // Create a new PDO instance
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Connection failed: ' . $e->getMessage()]);
    exit();
}

// Handle GET request to fetch all branches
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM Branch");
    $branches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($branches);
    exit();
}

// Handle POST request to add a new branch
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? '';

    if ($name) {
        $stmt = $pdo->prepare("INSERT INTO Branch (name) VALUES (:name)");
        $stmt->bindParam(':name', $name);
        if ($stmt->execute()) {
            echo json_encode(['message' => 'Branch added successfully!']);
        } else {
            echo json_encode(['error' => 'Failed to add branch.']);
        }
    } else {
        echo json_encode(['error' => 'Branch name is required.']);
    }
    exit();
}

// Handle DELETE request to delete a branch
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $name = basename($_SERVER['REQUEST_URI']);
    $stmt = $pdo->prepare("DELETE FROM Branch WHERE name = :name");
    $stmt->bindParam(':name', $name);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'Branch deleted successfully!']);
    } else {
        echo json_encode(['error' => 'Failed to delete branch.']);
    }
    exit();
}

// Return method not allowed for other requests
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>
