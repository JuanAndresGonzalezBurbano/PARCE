<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;

/**
 * Home Controller
 * 
 * Example controller demonstrating the MVC pattern.
 */
class HomeController extends Controller
{
    /**
     * Display home page
     */
    public function index(Request $request): Response
    {
        return $this->view('home', [
            'title' => 'Welcome to P.A.R.C.E',
            'message' => 'Backend infrastructure is ready!'
        ]);
    }

    /**
     * API endpoint example
     */
    public function apiStatus(Request $request): Response
    {
        return $this->success([
            'status' => 'operational',
            'timestamp' => date('Y-m-d H:i:s'),
            'environment' => $_ENV['APP_ENV'] ?? 'local'
        ]);
    }
}
