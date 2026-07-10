<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;

/**
 * Controlador Principal
 *
 * Controlador de ejemplo que demuestra el patrón MVC.
 */
class HomeController extends Controller
{
    /**
     * Muestra la página de inicio
     */
    public function index(Request $request): Response
    {
        return $this->view('home', [
            'title'   => 'Bienvenido a P.A.R.C.E',
            'message' => '¡La infraestructura backend está lista!'
        ]);
    }

    /**
     * Endpoint de ejemplo para la API
     */
    public function apiStatus(Request $request): Response
    {
        return $this->success([
            'status'      => 'operational',
            'timestamp'   => date('Y-m-d H:i:s'),
            'environment' => $_ENV['APP_ENV'] ?? 'local'
        ]);
    }
}
