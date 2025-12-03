<?php
// api/api.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once 'config.php';

// Obtener parámetros de la URL
$action = $_GET['action'] ?? '';
$device_id = $_GET['device_id'] ?? '';

// API para obtener datos de sensores
if ($action === 'sensor_data') {
    $sql = "SELECT * FROM sensor_data";

    if (!empty($device_id)) {
        $sql .= " WHERE device_id = ? ORDER BY created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$device_id]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $stmt = $pdo->query($sql);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($result);
}

// API para obtener el último registro de cada dispositivo
else if ($action === 'latest_data') {
    $sql = "SELECT sd1.*
            FROM sensor_data sd1
            INNER JOIN (
                SELECT device_id, MAX(id) as max_id
                FROM sensor_data
                GROUP BY device_id
            ) sd2 ON sd1.device_id = sd2.device_id AND sd1.id = sd2.max_id";

    $stmt = $pdo->query($sql);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($result);
}

// API para obtener alertas (basadas en datos recientes con estatus problemáticos)
else if ($action === 'alerts') {
    $sql = "SELECT sd1.*
            FROM sensor_data sd1
            INNER JOIN (
                SELECT device_id, MAX(id) as max_id
                FROM sensor_data
                GROUP BY device_id
            ) sd2 ON sd1.device_id = sd2.device_id AND sd1.id = sd2.max_id
            WHERE sd1.estatus IN ('Alta', 'Muy Alta', 'Muy Baja')";

    $stmt = $pdo->query($sql);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $alerts = [];
    if (count($result) > 0) {
        $alertId = 1;
        foreach ($result as $row) {
            $alertType = '';
            $title = '';
            $message = '';

            switch($row['estatus']) {
                case 'Muy Baja':
                    $alertType = 'critical';
                    $title = "{$row['device_id']} - Presión Muy Baja";
                    $message = "El dispositivo ha detectado una presión anormalmente baja";
                    break;
                case 'Muy Alta':
                    $alertType = 'critical';
                    $title = "{$row['device_id']} - Presión Muy Alta";
                    $message = "El dispositivo ha detectado una presión anormalmente alta";
                    break;
                case 'Alta':
                    $alertType = 'warning';
                    $title = "{$row['device_id']} - Presión Alta";
                    $message = "La presión está por encima del rango normal";
                    break;
            }

            if ($alertType) {
                $alerts[] = [
                    'id' => $alertId++,
                    'title' => $title,
                    'message' => $message,
                    'type' => $alertType,
                    'time' => $row['created_at']
                ];
            }
        }
    }

    // Agregar alerta informativa del sistema
    $alerts[] = [
        'id' => count($alerts) + 1,
        'title' => 'Sistema Actualizado',
        'message' => 'El sistema se ha actualizado correctamente',
        'type' => 'info',
        'time' => date('Y-m-d H:i:s')
    ];

    echo json_encode($alerts);
} else {
    http_response_code(400);
    echo json_encode(["error" => "Acción no válida"]);
}
?>
