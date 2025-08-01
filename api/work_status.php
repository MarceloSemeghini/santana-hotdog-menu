<?php
require_once 'bootstrap.php';
require_once 'vendor/autoload.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'PUT':
        handleUpdate();
        break;

    case 'GET':
        handleGet();
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "fail", "message" => "Método não permitido"]);
        exit;
}

// Atualiza o status ativo/inativo do usuário autenticado
function handleUpdate()
{
    global $conn;

    authenticate();

    $rawInput = file_get_contents("php://input");
    $body = json_decode($rawInput, true);

    if (!isset($body['id']) || !isset($body['status'])) {
        http_response_code(400);
        echo json_encode(["status" => "fail", "message" => "Campos obrigatórios ausentes"]);
        exit;
    }

    $id = $body["id"];
    $update = $body["status"];

    $conn->begin_transaction();

    $stmt = $conn->prepare("SELECT status FROM users WHERE id = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $currentData = $result->fetch_assoc();
    $stmt->close();

    if (!$currentData) {
        $conn->rollback();
        http_response_code(404);
        echo json_encode(["status" => "fail", "message" => "Usuário não encontrado"]);
        exit;
    } else if ($currentData['status'] === $update) {
        $conn->rollback();
        http_response_code(200);
        echo json_encode(["status" => "fail", "message" => "Status já definido"]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE users SET status = ? WHERE id = ?");
    $stmt->bind_param("ss", $update, $id);
    $stmt->execute();
    $conn->commit();

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "data" => $update
    ]);
}

function handleGet()
{
    global $conn;

    $id = $_GET['id'] ?? null;

    if ($id) {
        // Busca status de um usuário específico
        $stmt = $conn->prepare("SELECT status FROM users WHERE id = ?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if (!$user) {
            http_response_code(404);
            echo json_encode(["status" => "fail", "message" => "Usuário não encontrado"]);
            return;
        }

        echo json_encode([
            "status" => "success",
            "data" => $user['status']
        ]);
    } else {
        // Verifica se existe qualquer usuário ativo
        $stmt = $conn->prepare("SELECT status FROM users");
        $stmt->execute();
        $result = $stmt->get_result();

        $usersStatus = [];
        while ($row = $result->fetch_assoc()) {
            $usersStatus[] = $row['status'];
        }

        $stmt->close();

        echo json_encode([
            "status" => "success",
            "data" => $usersStatus
        ]);
    }
}
