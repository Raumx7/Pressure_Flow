<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once 'config.php';

function authenticateToken($token) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT id FROM api_tokens WHERE token = ? AND expires_at > NOW()");
    $stmt->execute([$token]);
    return $stmt->fetch() !== false;
}

function insertSensorData($data) {
    global $pdo;

    $stmt = $pdo->prepare("
        INSERT INTO sensor_data
        (device_id, sensor_type, value, estatus, categoria, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");

    return $stmt->execute([
        $data['device_id'],
        $data['sensor_type'],
        $data['value'],
        $data['estatus'],
        $data['categoria']
    ]);
}

try {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(["error" => "Missing or invalid authorization token"]);
        exit;
    }

    if (!authenticateToken($matches[1])) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid or expired token"]);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON"]);
        exit;
    }

    if (insertSensorData($input)) {
        http_response_code(200);
        echo json_encode(["message" => "Data stored successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to store data"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
