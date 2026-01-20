<?php
require_once 'bootstrap.php';
require_once 'vendor/autoload.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet();
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "fail", "message" => "Método não permitido"]);
        exit;
}

function getTotal($start, $end)
{
    global $conn;

    $stmt = $conn->prepare("
        SELECT SUM(total_value) as total
        FROM orders
        WHERE work_date BETWEEN ? AND ?
          AND status = 'completed'
    ");
    $stmt->bind_param("ss", $start, $end);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return (float) ($result['total'] ?? 0);
}

function getDaily($start, $end)
{
    global $conn;

    $stmt = $conn->prepare("
        SELECT
            work_date as date,
            YEAR(work_date) as year,
            WEEK(work_date, 1) as week,
            SUM(total_value) as total
        FROM orders
        WHERE work_date BETWEEN ? AND ?
          AND status = 'completed'
        GROUP BY work_date
        ORDER BY work_date
    ");
    $stmt->bind_param("ss", $start, $end);
    $stmt->execute();

    $result = $stmt->get_result();
    $rows = [];

    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            "date" => $row['date'],
            "year" => (int) $row['year'],
            "week" => (int) $row['week'],
            "total" => (float) $row['total']
        ];
    }

    $stmt->close();
    return $rows;
}

function getWeekly($start, $end)
{
    global $conn;

    $stmt = $conn->prepare("
        SELECT
            YEAR(work_date) as year,
            WEEK(work_date, 1) as week,
            SUM(total_value) as total
        FROM orders
        WHERE work_date BETWEEN ? AND ?
          AND status = 'completed'
        GROUP BY year, week
        ORDER BY year, week
    ");
    $stmt->bind_param("ss", $start, $end);
    $stmt->execute();

    $result = $stmt->get_result();
    $weeks = [];

    while ($row = $result->fetch_assoc()) {
        $key = $row['year'] . '-' . $row['week'];

        $weeks[$key] = [
            "year" => (int) $row['year'],
            "week" => (int) $row['week'],
            "total" => (float) $row['total'],
            "days" => []
        ];
    }

    $stmt->close();
    return $weeks;
}

function buildWeeklyWithDays($start, $end)
{
    $weeks = getWeekly($start, $end);
    $days  = getDaily($start, $end);

    foreach ($days as $day) {
        $key = $day['year'] . '-' . $day['week'];

        if (!isset($weeks[$key])) {
            continue;
        }

        $weeks[$key]['days'][] = [
            "date" => $day['date'],
            "total" => $day['total']
        ];
    }

    return array_values($weeks);
}

function handleGet()
{
    authenticate();

    $start = $_GET['start_date'] ?? null;
    $end   = $_GET['end_date'] ?? null;

    if (!$start || !$end) {
        http_response_code(400);
        echo json_encode([
            "status" => "fail",
            "message" => "Data inicial e final são obrigatórias"
        ]);
        exit;
    }

    $data = [
        "total" => getTotal($start, $end),
        "weekly" => buildWeeklyWithDays($start, $end)
    ];

    echo json_encode([
        "status" => "success",
        "data" => $data
    ]);
}
