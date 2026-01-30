<?php
require_once 'bootstrap.php';
require_once 'vendor/autoload.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handlePost();
        break;

    case 'GET':
        handleGet();
        break;

    case 'PUT':
        handleUpdate();
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "fail", "message" => "Método não permitido"]);
        exit;
}

function handlePost()
{
    global $conn;

    $rawInput = file_get_contents("php://input");
    $body = json_decode($rawInput, true);

    if (!isset($body["name"]) || !isset($body["items"])) {
        http_response_code(400);
        echo json_encode(["status" => "fail", "message" => "Campos obrigatórios ausentes"]);
        exit;
    }

    $id = generate_id();
    $name = $body["name"];
    $orderData = $body["items"];
    $totalValue = round($body["cartTotal"], 2);
    $note = $body["note"] ?? null;

    $hasDeliveryData =
        isset($body['address']) ||
        isset($body['payment']) ||
        isset($body['phone']);

    if ($hasDeliveryData) {
        if (
            !isset($body['address']) ||
            !isset($body['payment']) ||
            !isset($body['phone'])
        ) {
            http_response_code(400);
            echo json_encode([
                "status" => "fail",
                "message" => "Pedido com delivery deve possuir endereço, pagamento e telefone"
            ]);
            exit;
        }
        if (isset($body["payment"]) && !is_array($body["payment"])) {
            http_response_code(400);
            echo json_encode([
                "status" => "fail",
                "message" => "Formato de pagamento inválido"
            ]);
            exit;
        }
    }


    $address = isset($body["address"])
        ? json_encode($body["address"], JSON_UNESCAPED_UNICODE)
        : null;

    $payment = isset($body["payment"])
        ? json_encode($body["payment"], JSON_UNESCAPED_UNICODE)
        : null;
    $phone = isset($body["phone"]) ? $body["phone"] : null;

    $jsonOrder = is_string($orderData) ? $orderData : json_encode($orderData);

    $hour = (int) date("H");
    $workDate = ($hour < 12) ? date("Y-m-d", strtotime("-1 day")) : date("Y-m-d");

    $stmt = $conn->prepare("
        SELECT MAX(order_code) AS max_order_code 
        FROM orders 
        WHERE work_date = ?
    ");

    $stmt->bind_param("s", $workDate);
    $stmt->execute();
    $result = $stmt->get_result();
    $maxOrderCode = ($row = $result->fetch_assoc()) ? $row['max_order_code'] : null;
    $stmt->close();

    $newOrderCode = ($maxOrderCode === null) ? 1 : $maxOrderCode + 1;
    $currentDate = date("Y-m-d H:i:s");

    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("
            INSERT INTO orders 
                (id, name, order_data, order_code, total_value, note, created_at, work_date, address, payment, phone)
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->bind_param(
            "sssidssssss",
            $id,
            $name,
            $jsonOrder,
            $newOrderCode,
            $totalValue,
            $note,
            $currentDate,
            $workDate,
            $address,
            $payment,
            $phone
        );

        $stmt->execute();
        $stmt->close();
        $conn->commit();

        echo json_encode([
            "status" => "success",
            "data" => [
                "id" => $id,
                "name" => $name,
                "order_code" => $newOrderCode,
                "total_value" => number_format($totalValue, 2, '.', '')
            ]
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode([
            "status" => "fail",
            "message" => $e->getMessage()
        ]);
    }
}

function handleGet()
{
    global $conn;

    $includeItems = filter_var($_GET['include_items'] ?? false, FILTER_VALIDATE_BOOLEAN);

    $start_date = $_GET['start_date'] ?? null;
    $end_date = $_GET['end_date'] ?? null;
    $status = $_GET['status'] ?? null;
    $id = $_GET['id'] ?? null;

    $selectFields = "id, name, order_code, total_value, status, created_at, work_date, note, address, payment, phone";

    if ($includeItems) {
        $selectFields .= ", order_data";
    }

    $query = "SELECT $selectFields FROM orders";

    $params = [];
    $types = [];

    $conditions = [];

    if ($id) {
        $conditions[] = "id = ?";
        $params[] = $id;
        $types[] = "s";
    }

    if (!$id) {
        authenticate();
    }

    if ($start_date && $end_date) {
        $conditions[] = "work_date BETWEEN ? AND ?";
        $params[] = $start_date;
        $params[] = $end_date;
        $types[] = "s";
        $types[] = "s";
    } elseif ($start_date) {
        $conditions[] = "work_date >= ?";
        $params[] = $start_date;
        $types[] = "s";
    }

    if ($status) {
        $conditions[] = "status = ?";
        $params[] = $status;
        $types[] = "s";
    }


    if ($conditions) {
        $query .= " WHERE " . implode(" AND ", $conditions);
    }

    $query .= " ORDER BY order_code ASC";

    $stmt = $conn->prepare($query);

    if ($params) {
        $stmt->bind_param(implode("", $types), ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $order = [
            "id" => $row['id'],
            "name" => $row['name'],
            "order_code" => $row['order_code'],
            "status" => $row['status'],
            "total_value" => $row['total_value'],
            "note" => $row['note'],
            "created_at" => $row['created_at'],
            "work_date" => $row['work_date'],
            "address" => $row['address'] ? json_decode($row['address'], true) : null,
            "payment" => $row['payment'] ? json_decode($row['payment'], true) : null,
            "phone" => $row['phone']
        ];

        if ($includeItems) {
            $order["items"] = json_decode($row['order_data'], true);
        }

        $orders[] = $order;
    }

    $result->free();
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "data" => $orders
    ]);
}

function handleUpdate()
{
    global $conn;

    $rawInput = file_get_contents("php://input");
    $body = json_decode($rawInput, true);

    if (!isset($body["id"])) {
        http_response_code(400);
        echo json_encode([
            "status" => "fail",
            "message" => "ID do pedido é obrigatório"
        ]);
        exit;
    }

    $id = $body["id"];

    $fields = [];
    $params = [];
    $types  = "";

    if (isset($body["status"])) {
        $fields[] = "status = ?";
        $params[] = $body["status"];
        $types   .= "s";
    }

    if (isset($body["cartTotal"])) {
        $fields[] = "total_value = ?";
        $params[] = (float) $body["cartTotal"];
        $types   .= "d";
    }

    if (isset($body["items"])) {
        $fields[] = "order_data = ?";
        $params[] = json_encode($body["items"], JSON_UNESCAPED_UNICODE);
        $types   .= "s";
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode([
            "status" => "fail",
            "message" => "Nenhum campo enviado para atualização"
        ]);
        exit;
    }

    $params[] = $id;
    $types   .= "s";

    $sql = "UPDATE orders SET " . implode(", ", $fields) . " WHERE id = ?";

    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $stmt->close();

        $conn->commit();

        echo json_encode([
            "status" => "success",
            "message" => "Pedido atualizado com sucesso"
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode([
            "status" => "fail",
            "message" => "Erro ao atualizar pedido",
            "error" => $e->getMessage()
        ]);
    }
}



