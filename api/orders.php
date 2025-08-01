<?php
require_once 'bootstrap.php';
require_once 'vendor/autoload.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handlePost();
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

    if (!isset($body['name']) || !isset($body['order'])) {
        http_response_code(400);
        echo json_encode(["status" => "fail", "message" => "Campo obrigatório faltando"]);
        exit;
    }

    echo json_encode(["id" => generate_id()]);
}