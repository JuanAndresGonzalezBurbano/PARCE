<?php

namespace App\Core;

/**
 * Router Class
 * 
 * Handles route registration and dispatching.
 * Supports middleware pipeline for future authentication/authorization.
 */
class Router
{
    private array $routes = [];
    private array $middlewareStack = [];
    private array $groupMiddleware = [];
    private string $groupPrefix = '';

    /**
     * Register GET route
     */
    public function get(string $uri, callable|array $action): Route
    {
        return $this->addRoute('GET', $uri, $action);
    }

    /**
     * Register POST route
     */
    public function post(string $uri, callable|array $action): Route
    {
        return $this->addRoute('POST', $uri, $action);
    }

    /**
     * Register PUT route
     */
    public function put(string $uri, callable|array $action): Route
    {
        return $this->addRoute('PUT', $uri, $action);
    }

    /**
     * Register DELETE route
     */
    public function delete(string $uri, callable|array $action): Route
    {
        return $this->addRoute('DELETE', $uri, $action);
    }

    /**
     * Register route for any method
     */
    public function any(string $uri, callable|array $action): Route
    {
        return $this->addRoute('ANY', $uri, $action);
    }

    /**
     * Add route to routes array
     */
    private function addRoute(string $method, string $uri, callable|array $action): Route
    {
        $uri = $this->groupPrefix . $uri;
        $uri = '/' . trim($uri, '/');
        
        $route = new Route($method, $uri, $action);
        
        // Apply group middleware
        if (!empty($this->groupMiddleware)) {
            $route->middleware($this->groupMiddleware);
        }
        
        $this->routes[] = $route;
        
        return $route;
    }


    /**
     * Group routes with common prefix and middleware
     */
    public function group(array $attributes, callable $callback): void
    {
        $previousPrefix = $this->groupPrefix;
        $previousMiddleware = $this->groupMiddleware;

        // Set group prefix
        if (isset($attributes['prefix'])) {
            $this->groupPrefix = $previousPrefix . '/' . trim($attributes['prefix'], '/');
        }

        // Set group middleware
        if (isset($attributes['middleware'])) {
            $middleware = is_array($attributes['middleware']) 
                ? $attributes['middleware'] 
                : [$attributes['middleware']];
            $this->groupMiddleware = array_merge($this->groupMiddleware, $middleware);
        }

        // Execute callback to register routes
        $callback($this);

        // Restore previous values
        $this->groupPrefix = $previousPrefix;
        $this->groupMiddleware = $previousMiddleware;
    }

    /**
     * Dispatch request to matching route
     */
    public function dispatch(Request $request): Response
    {
        $method = $request->method();
        $uri = $request->uri();

        foreach ($this->routes as $route) {
            if ($route->matches($method, $uri)) {
                $params = $route->extractParams($uri);
                
                // Execute middleware pipeline
                $response = $this->runMiddleware($route, $request);
                
                if ($response !== null) {
                    return $response;
                }
                
                // Execute route action
                return $this->executeAction($route->getAction(), $request, $params);
            }
        }

        // No route found - 404
        return Response::error('Route not found', null, 404);
    }

    /**
     * Run middleware pipeline
     */
    private function runMiddleware(Route $route, Request $request): ?Response
    {
        $middleware = $route->getMiddleware();
        
        foreach ($middleware as $middlewareClass) {
            // Middleware will be implemented later
            // For now, just skip
        }
        
        return null;
    }

    /**
     * Execute route action
     */
    private function executeAction(callable|array $action, Request $request, array $params): Response
    {
        if (is_callable($action)) {
            $result = $action($request, ...$params);
        } elseif (is_array($action) && count($action) === 2) {
            [$controller, $method] = $action;
            
            if (is_string($controller)) {
                $controller = new $controller();
            }
            
            $result = $controller->$method($request, ...$params);
        } else {
            throw new \Exception('Invalid route action');
        }

        // Convert result to Response if needed
        if ($result instanceof Response) {
            return $result;
        }

        if (is_array($result)) {
            return (new Response())->json($result);
        }

        if (is_string($result)) {
            return (new Response())->html($result);
        }

        return (new Response())->setContent($result);
    }

    /**
     * Get all registered routes
     */
    public function getRoutes(): array
    {
        return $this->routes;
    }
}
