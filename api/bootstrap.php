<?php
header("Content-Type: application/json; charset=utf-8");

// Permitir CORS (se precisar, ajustar conforme seu domínio)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Parar se for OPTIONS (pré-flight do CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configurações do banco de dados
$db_server = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "santanahotdog";
$key = "santana";

// Criar conexão
$conn = new mysqli($db_server, $db_user, $db_pass, $db_name);

// Verificar conexão
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Erro na conexão com o banco de dados."]);
    exit;
}

// Configurar charset utf8mb4
$conn->set_charset("utf8mb4");

function authenticate()
{
    global $key;
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

    try {
        return JWT::decode($jwt, new Key($key, 'HS256'));
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["status" => "fail", "message" => "Token expirado ou inválido"]);
        exit;
    }
}
