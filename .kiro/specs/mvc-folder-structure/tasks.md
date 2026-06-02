# Tasks: MVC Folder Structure

## 1. Create Root Directory Structure

### 1.1 Create main directories
- [ ] Create `public/` directory in project root
- [ ] Create `app/` directory in project root
- [ ] Create `config/` directory in project root
- [ ] Create `database/` directory in project root

## 2. Create Application Directory Structure

### 2.1 Create MVC subdirectories
- [ ] Create `app/models/` directory
- [ ] Create `app/views/` directory
- [ ] Create `app/controllers/` directory
- [ ] Create `app/core/` directory

## 3. Create Public Assets Structure

### 3.1 Create asset directories
- [ ] Create `public/assets/` directory
- [ ] Create `public/assets/css/` directory
- [ ] Create `public/assets/js/` directory
- [ ] Create `public/assets/images/` directory

## 4. Create Views Directory Structure

### 4.1 Create view subdirectories
- [ ] Create `app/views/layouts/` directory
- [ ] Create `app/views/components/` directory
- [ ] Create `app/views/errors/` directory

## 5. Create Database Directory Structure

### 5.1 Create database subdirectories
- [ ] Create `database/migrations/` directory
- [ ] Create `database/seeds/` directory

## 6. Create Configuration Directory Structure

### 6.1 Create config subdirectories
- [ ] Create `config/` directory structure (already exists from step 1.1)

## 7. Implement Router Core Component

### 7.1 Create Router class
- [ ] Create `app/core/Router.php` file
- [ ] Implement `Router` class with `route()` method
- [ ] Implement `addRoute()` method for route registration
- [ ] Implement `getRoutes()` method to retrieve registered routes
- [ ] Implement `matchRoute()` private method for pattern matching
- [ ] Implement `handle404()` method for unmatched routes
- [ ] Add support for URL parameter extraction (e.g., `:id`)

### 7.2 Create routes configuration
- [ ] Create `config/routes.php` file
- [ ] Add example route registrations
- [ ] Document route registration format

## 8. Implement Base Controller

### 8.1 Create BaseController class
- [ ] Create `app/core/BaseController.php` file
- [ ] Implement abstract `BaseController` class
- [ ] Implement `view()` method for rendering views
- [ ] Implement `redirect()` method for URL redirection
- [ ] Implement `json()` method for JSON responses
- [ ] Add protected property for views directory path

### 8.2 Create example controller
- [ ] Create `app/controllers/HomeController.php` file
- [ ] Extend `BaseController` in `HomeController`
- [ ] Implement `index()` action method
- [ ] Add example view rendering with data

## 9. Implement Base Model

### 9.1 Create BaseModel class
- [ ] Create `app/core/BaseModel.php` file
- [ ] Implement abstract `BaseModel` class
- [ ] Implement constructor with database connection
- [ ] Implement `query()` method for parameterized queries
- [ ] Implement `findAll()` method for retrieving all records
- [ ] Implement `findById()` method for retrieving single record
- [ ] Implement `create()` method for inserting records
- [ ] Implement `update()` method for updating records
- [ ] Implement `delete()` method for deleting records
- [ ] Add protected `$db` property for PDO connection
- [ ] Add protected `$table` property for table name

### 9.2 Create example model
- [ ] Create `app/models/User.php` file (as example, not functional yet)
- [ ] Extend `BaseModel` in `User` model
- [ ] Set `$table` property to 'users'
- [ ] Add example methods using base CRUD operations

## 10. Implement Layout System

### 10.1 Create main layout
- [ ] Create `app/views/layouts/main.php` file
- [ ] Add HTML5 doctype and structure
- [ ] Add `<head>` section with meta tags
- [ ] Add charset meta tag (UTF-8)
- [ ] Add viewport meta tag for responsive design
- [ ] Add dynamic `<title>` tag using view data
- [ ] Link CSS variables file
- [ ] Link main CSS file
- [ ] Add `<body>` structure with header, main, footer
- [ ] Add content injection point for views
- [ ] Link JavaScript files before closing `</body>`

### 10.2 Create layout components
- [ ] Create `app/views/components/header.php` file
- [ ] Create `app/views/components/footer.php` file
- [ ] Create `app/views/components/navigation.php` file
- [ ] Add basic HTML structure to each component

### 10.3 Update BaseController for layout rendering
- [ ] Implement `renderLayout()` method in `BaseController`
- [ ] Add layout file path configuration
- [ ] Integrate layout rendering into `view()` method

## 11. Create CSS Variables File

### 11.1 Create variables.css
- [ ] Create `public/assets/css/variables.css` file
- [ ] Define `:root` selector
- [ ] Add primary color variable (`--primary-color`)
- [ ] Add secondary color variable (`--secondary-color`)
- [ ] Add success color variable (`--success-color`)
- [ ] Add danger color variable (`--danger-color`)
- [ ] Add warning color variable (`--warning-color`)
- [ ] Add info color variable (`--info-color`)
- [ ] Add text color variables (`--text-color`, `--text-light`, `--text-dark`)
- [ ] Add background color variables (`--bg-color`, `--bg-light`, `--bg-dark`)
- [ ] Add border color variable (`--border-color`)
- [ ] Add font family variable (`--font-family`)
- [ ] Add font size variables (`--font-size-base`, `--font-size-sm`, `--font-size-lg`, `--font-size-xl`)
- [ ] Add font weight variables (`--font-weight-normal`, `--font-weight-bold`)
- [ ] Add line height variable (`--line-height`)
- [ ] Add spacing unit variable (`--spacing-unit`)
- [ ] Add spacing scale variables (`--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`)

## 12. Create Main CSS File

### 12.1 Create main.css
- [ ] Create `public/assets/css/main.css` file
- [ ] Add CSS reset or normalize styles
- [ ] Add base body styles using CSS variables
- [ ] Add typography styles using CSS variables
- [ ] Add container class for layout
- [ ] Add utility classes for spacing
- [ ] Add button styles using CSS variables
- [ ] Add form element styles
- [ ] Add responsive design media queries

## 13. Create Main JavaScript File

### 13.1 Create main.js
- [ ] Create `public/assets/js/main.js` file
- [ ] Add basic JavaScript structure
- [ ] Add DOM ready event listener
- [ ] Add example utility functions
- [ ] Add comments for future enhancements

## 14. Create Public Entry Point

### 14.1 Create index.php
- [ ] Create `public/index.php` file
- [ ] Add PHP opening tag
- [ ] Require Router class
- [ ] Require BaseController class
- [ ] Require routes configuration
- [ ] Instantiate Router
- [ ] Get request URI from `$_SERVER['REQUEST_URI']`
- [ ] Call `route()` method with URI
- [ ] Add error handling for uncaught exceptions

### 14.2 Create .htaccess for Apache
- [ ] Create `public/.htaccess` file
- [ ] Enable RewriteEngine
- [ ] Add rule to route all requests to index.php
- [ ] Preserve query strings
- [ ] Exclude existing files and directories from rewriting

## 15. Create Database Configuration

### 15.1 Create database config file
- [ ] Create `config/database.php` file
- [ ] Define database host
- [ ] Define database name
- [ ] Define database username
- [ ] Define database password
- [ ] Define charset (utf8mb4)
- [ ] Define PDO options array (error mode, fetch mode)
- [ ] Return configuration as associative array
- [ ] Add comments for each configuration option

### 15.2 Create database config template
- [ ] Create `config/database.example.php` file
- [ ] Copy structure from `database.php`
- [ ] Replace sensitive values with placeholders
- [ ] Add instructions in comments

## 16. Create Application Configuration

### 16.1 Create app config file
- [ ] Create `config/app.php` file
- [ ] Define application name
- [ ] Define environment (development/production)
- [ ] Define base URL
- [ ] Define timezone
- [ ] Define error reporting level by environment
- [ ] Return configuration as associative array

## 17. Create Database Schema Documentation

### 17.1 Create schema.sql
- [ ] Create `database/schema.sql` file
- [ ] Add comments explaining schema purpose
- [ ] Add example table structure (users table as reference)
- [ ] Include primary key definition
- [ ] Include timestamp fields (created_at, updated_at)
- [ ] Add comments for future tables

### 17.2 Document migration system
- [ ] Create `database/migrations/README.md` file
- [ ] Document migration file naming convention
- [ ] Document migration structure (up/down methods)
- [ ] Document execution order
- [ ] Document rollback strategy

### 17.3 Document seed system
- [ ] Create `database/seeds/README.md` file
- [ ] Document seed file structure
- [ ] Document seed execution process
- [ ] Add example seed data structure

## 18. Create Error Views

### 18.1 Create 404 error view
- [ ] Create `app/views/errors/404.php` file
- [ ] Add user-friendly 404 message
- [ ] Add navigation links to home page
- [ ] Style error page to match site design

### 18.2 Create 500 error view
- [ ] Create `app/views/errors/500.php` file
- [ ] Add generic error message for production
- [ ] Add placeholder for detailed error in development
- [ ] Style error page to match site design

## 19. Create Example Views

### 19.1 Create home view
- [ ] Create `app/views/home/` directory
- [ ] Create `app/views/home/index.php` file
- [ ] Add welcome message using view data
- [ ] Use `htmlspecialchars()` for output escaping
- [ ] Add basic HTML structure

## 20. Implement Error Handling

### 20.1 Add error handling to Router
- [ ] Implement try-catch in `route()` method
- [ ] Handle ControllerNotFoundException
- [ ] Handle ActionNotFoundException
- [ ] Log errors appropriately
- [ ] Return appropriate HTTP status codes

### 20.2 Add error handling to BaseController
- [ ] Implement try-catch in `view()` method
- [ ] Throw ViewNotFoundException for missing views
- [ ] Log view errors
- [ ] Handle layout rendering errors

### 20.3 Add error handling to BaseModel
- [ ] Implement try-catch in `query()` method
- [ ] Catch PDOException
- [ ] Log database errors (without exposing credentials)
- [ ] Re-throw exceptions for controller handling

## 21. Create Git Configuration

### 21.1 Create .gitignore
- [ ] Create `.gitignore` file in project root
- [ ] Add `config/database.php` to ignore list
- [ ] Add `vendor/` to ignore list
- [ ] Add `.env` to ignore list (for future use)
- [ ] Add IDE-specific files (`.vscode/`, `.idea/`, `*.sublime-*`)
- [ ] Add OS-specific files (`.DS_Store`, `Thumbs.db`)
- [ ] Add uploaded files directory (future)
- [ ] Add log files (`*.log`)

### 21.2 Initialize Git repository
- [ ] Run `git init` in project root
- [ ] Create initial commit with folder structure

## 22. Create Documentation

### 22.1 Create README.md
- [ ] Create `README.md` file in project root
- [ ] Add project title and description
- [ ] Add folder structure explanation
- [ ] Add setup instructions
- [ ] Add basic usage examples
- [ ] Add requirements (PHP version, MySQL, Apache)
- [ ] Add future enhancements section

### 22.2 Create SETUP.md
- [ ] Create `SETUP.md` file in project root
- [ ] Add detailed installation steps
- [ ] Add database setup instructions
- [ ] Add web server configuration (Apache/Nginx)
- [ ] Add troubleshooting section
- [ ] Add development environment setup

### 22.3 Add inline code documentation
- [ ] Add PHPDoc comments to Router class methods
- [ ] Add PHPDoc comments to BaseController methods
- [ ] Add PHPDoc comments to BaseModel methods
- [ ] Add inline comments explaining complex logic

## 23. Create Placeholder Assets

### 23.1 Create placeholder images
- [ ] Create `public/assets/images/logo.png` placeholder
- [ ] Create `public/assets/images/favicon.ico` placeholder
- [ ] Document image directory structure in README

## 24. Testing Setup

### 24.1 Document testing approach
- [ ] Create `tests/README.md` file
- [ ] Document unit testing strategy
- [ ] Document integration testing strategy
- [ ] Document property-based testing approach
- [ ] List recommended testing frameworks (PHPUnit)

## 25. Security Implementation

### 25.1 Implement input sanitization
- [ ] Create `app/core/Security.php` file
- [ ] Implement `sanitizeInput()` static method
- [ ] Implement `escapeOutput()` static method
- [ ] Add XSS prevention utilities
- [ ] Document security best practices

### 25.2 Configure directory protection
- [ ] Create `app/.htaccess` to deny direct access
- [ ] Create `config/.htaccess` to deny direct access
- [ ] Create `database/.htaccess` to deny direct access
- [ ] Verify only `public/` is web-accessible

## 26. Performance Optimization Setup

### 26.1 Configure database connection
- [ ] Set PDO connection to persistent mode in BaseModel
- [ ] Configure PDO fetch mode to FETCH_ASSOC
- [ ] Set PDO error mode to EXCEPTION
- [ ] Document connection pooling for future

### 26.2 Configure output buffering
- [ ] Verify output buffering is used in view rendering
- [ ] Add ob_start() and ob_get_clean() in view() method
- [ ] Document view caching strategy for future

## 27. Create Configuration Loader

### 27.1 Implement config loader utility
- [ ] Create `app/core/Config.php` file
- [ ] Implement `load()` static method
- [ ] Add configuration caching
- [ ] Add validation for required config keys
- [ ] Handle missing configuration files gracefully

## 28. Final Integration Testing

### 28.1 Test complete request flow
- [ ] Test routing from browser to controller
- [ ] Test view rendering with layout
- [ ] Test asset loading (CSS, JS, images)
- [ ] Test 404 error handling
- [ ] Test example home page renders correctly

### 28.2 Verify folder structure
- [ ] Verify all directories are created
- [ ] Verify all core files are in place
- [ ] Verify file naming conventions are followed
- [ ] Verify directory permissions are correct

### 28.3 Verify documentation
- [ ] Verify README.md is complete
- [ ] Verify SETUP.md is complete
- [ ] Verify inline code comments are present
- [ ] Verify database documentation is complete

## 29. Create Development Helpers

### 29.1 Create helper functions file
- [ ] Create `app/core/helpers.php` file
- [ ] Implement `dd()` function (dump and die for debugging)
- [ ] Implement `env()` function for environment variables (future)
- [ ] Implement `config()` function for accessing config values
- [ ] Implement `url()` function for generating URLs
- [ ] Implement `asset()` function for asset URLs

### 29.2 Include helpers in entry point
- [ ] Require `helpers.php` in `public/index.php`
- [ ] Document helper functions in README

## 30. Finalization

### 30.1 Code review and cleanup
- [ ] Review all PHP files for syntax errors
- [ ] Review all CSS files for consistency
- [ ] Review all documentation for accuracy
- [ ] Remove any placeholder comments
- [ ] Ensure consistent code formatting

### 30.2 Create initial Git commit
- [ ] Stage all files except ignored ones
- [ ] Create commit with message "Initial MVC folder structure"
- [ ] Verify .gitignore is working correctly

### 30.3 Prepare for next phase
- [ ] Document extension points for authentication
- [ ] Document extension points for dashboards
- [ ] Document extension points for additional features
- [ ] Create roadmap for future enhancements
