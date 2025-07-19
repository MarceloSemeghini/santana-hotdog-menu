<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handlePost();
        break;

    case 'GET':
        handleGet();
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "fail", "message" => "Método não permitido"]);
        exit;
}

function authenticate()
{
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(["status" => "fail", "message" => "Token não fornecido"]);
        exit;
    }

    $authHeader = $headers['Authorization'];
    list($type, $jwt) = explode(" ", $authHeader, 2);

    if ($type !== "Bearer" || !$jwt) {
        http_response_code(401);
        echo json_encode(["status" => "fail", "message" => "Token mal formatado"]);
        exit;
    }

    return $jwt;
}

function handlePost()
{
    global $conn, $key;
    $jwt = authenticate();
    try {
        $decoded = JWT::decode($jwt, new Key($key, 'HS256'));

        $rawInput = file_get_contents("php://input");
        $body = json_decode($rawInput, true);

        if (!isset($body['name'])) {
            http_response_code(400);
            echo json_encode(["status" => "fail", "message" => "Campos obrigatórios faltando"]);
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
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["status" => "fail", "message" => "Token expirado ou inválido"]);
    }
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
        $row['additions'] = json_decode($row['additions'], true); // transforma JSON de volta em array
        $categories[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "data" => $categories
    ]);
}
