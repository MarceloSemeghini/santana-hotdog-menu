<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../vendor/autoload.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handlePost();
        break;

    case 'DELETE':
        handleDelete();
        break;

    case 'GET':
        handleGet();
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "fail", "message" => "Método não permitido"]);
        exit;
}
function handlePost()
{
    global $conn;

    authenticate();

    $rawInput = file_get_contents("php://input");
    $body = json_decode($rawInput, true);

    if (!isset($body['name'])) {
        http_response_code(400);
        echo json_encode(["status" => "fail", "message" => "Campo obrigatório faltando"]);
        exit;
    }

    $name = $body['name'];
    $additions = isset($body['additions']) ? json_encode($body['additions'], JSON_UNESCAPED_UNICODE) : null;

    $checkStmt = $conn->prepare("SELECT id FROM categories WHERE name = ?");
    $checkStmt->bind_param("s", $name);
    $checkStmt->execute();
    $checkStmt->store_result();

    if ($checkStmt->num_rows > 0) {
        http_response_code(409);
        echo json_encode(["status" => "fail", "message" => "Categoria com este nome já existe"]);
        $checkStmt->close();
        exit;
    }
    $checkStmt->close();

    $stmt = $conn->prepare("INSERT INTO categories (name, additions) VALUES (?, ?)");
    $stmt->bind_param("ss", $name, $additions);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Categoria inserida com sucesso",
            "categoryId" => $stmt->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "fail", "message" => "Erro ao inserir no banco"]);
    }

    $stmt->close();
}
function handleDelete()
{
    global $conn;

    authenticate();

    $id = $_GET['id'] ?? null;

    if (!$id || !is_numeric($id)) {
        http_response_code(400);
        echo json_encode(["status" => "fail", "message" => "ID inválido"]);
        exit;
    }

    $checkStmt = $conn->prepare("SELECT id FROM categories WHERE id = ?");
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $checkStmt->store_result();

    if ($checkStmt->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["status" => "fail", "message" => "Categoria não encontrada"]);
        $checkStmt->close();
        exit;
    }
    $checkStmt->close();

    $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Categoria deletada com sucesso"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "fail", "message" => "Erro ao deletar a categoria"]);
    }

    $stmt->close();
}


function handleGet()
{
    global $conn;

    $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $conn->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->bind_param("i", $id);
    } else {
        $stmt = $conn->prepare("SELECT * FROM categories");
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $row['additions'] = json_decode($row['additions'], true);
        $categories[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "data" => $categories
    ]);
}
