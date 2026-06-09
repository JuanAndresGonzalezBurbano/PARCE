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
    private array $globalMiddleware = [];

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
     * Register global middleware (runs on every request)
     * 
     * @param string|array $middleware Middleware class name(s)
     * @return void
     */
    public function middleware(string|array $middleware): void
    {
        $middleware = is_array($middleware) ? $middleware : [$middleware];
        $this->globalMiddleware = array_merge($this->globalMiddleware, $middleware);
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

        // Handle OPTIONS preflight through global middleware first
        // This allows CORS middleware to intercept without route registration
        if ($method === 'OPTIONS' && !empty($this->globalMiddleware)) {
            // Create a dummy route for OPTIONS to pass through middleware
            $dummyRoute = new Route('OPTIONS', $uri, function($request) {
                // If no middleware handled it, return 204 No Content
                return (new Response())->setStatusCode(204);
            });
            
            $response = $this->runMiddleware($dummyRoute, $request);
            if ($response !== null) {
                return $response;
            }
        }

        foreach ($this->routes as $route) {
            if ($route->matches($method, $uri)) {
                // Execute middleware pipeline (which includes the route action)
                $response = $this->runMiddleware($route, $request);
                
                if ($response !== null) {
                    return $response;
                }
                
                // If no middleware, execute route action directly
                $params = $route->extractParams($uri);
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
        // Merge global middleware with route middleware
        $routeMiddleware = $route->getMiddleware();
        $allMiddleware = array_merge($this->globalMiddleware, $routeMiddleware);
        
        if (empty($allMiddleware)) {
            return null;
        }
        
        // Build middleware pipeline
        $pipeline = function($request) use ($route) {
            // This is the final handler - execute the route action
            $params = $route->extractParams($request->uri());
            return $this->executeAction($route->getAction(), $request, $params);
        };
        
        // Wrap each middleware around the pipeline (reverse order)
        foreach (array_reverse($allMiddleware) as $middlewareClass) {
            $pipeline = function($request) use ($middlewareClass, $pipeline) {
                // Handle string middleware (no parameters)
                if (is_string($middlewareClass)) {
                    $middlewareInstance = new $middlewareClass();
                }
                // Handle array middleware [ClassName, params]
                elseif (is_array($middlewareClass) && count($middlewareClass) === 2) {
                    $className = $middlewareClass[0];
                    $params = $middlewareClass[1];
                    // Pass the params as-is (already an array for RBACMiddleware)
                    $middlewareInstance = new $className($params);
                }
                // Handle already-instantiated middleware
                else {
                    $middlewareInstance = $middlewareClass;
                }
                
                // Execute middleware
                return $middlewareInstance->handle($request, $pipeline);
            };
        }
        
        // Execute the pipeline
        return $pipeline($request);
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
