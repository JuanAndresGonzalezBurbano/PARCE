<?php

namespace App\Core;

/**
 * Base Controller Class
 * 
 * Provides common functionality for all controllers.
 * Handles view rendering, JSON responses, and redirects.
 */
abstract class Controller
{
    protected Request $request;

    /**
     * Render view template
     */
    protected function view(string $view, array $data = []): Response
    {
        return (new Response())->view($view, $data);
    }

    /**
     * Return JSON response
     */
    protected function json(array $data, int $statusCode = 200): Response
    {
        return (new Response())->json($data, $statusCode);
    }

    /**
     * Return success JSON response
     */
    protected function success(mixed $data = null, string $message = 'Success', int $statusCode = 200): Response
    {
        return Response::success($data, $message, $statusCode);
    }

    /**
     * Return error JSON response
     */
    protected function error(string $message, mixed $errors = null, int $statusCode = 400): Response
    {
        return Response::error($message, $errors, $statusCode);
    }

    /**
     * Redirect to URL
     */
    protected function redirect(string $url, int $statusCode = 302): Response
    {
        return (new Response())->redirect($url, $statusCode);
    }

    /**
     * Redirect back to previous page
     */
    protected function back(): Response
    {
        $referer = $_SERVER['HTTP_REFERER'] ?? '/';
        return $this->redirect($referer);
    }

    /**
     * Set request instance (called by router)
     */
    public function setRequest(Request $request): void
    {
        $this->request = $request;
    }
}
