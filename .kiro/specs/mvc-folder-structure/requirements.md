# Requirements Document: MVC Folder Structure

## 1. Folder Structure Organization

### 1.1 Root Directory Structure
The system SHALL create a root-level folder structure that separates public-facing files from application logic, configuration, and data storage.

**Acceptance Criteria:**
- Root directory contains `public/`, `app/`, `config/`, and `database/` folders
- Public folder is the only web-accessible directory
- Application logic is stored outside the public directory for security
- Configuration files are stored in a dedicated config directory
- Database-related files are organized in a separate directory

### 1.2 Application Directory Structure
The system SHALL organize application code following MVC pattern with separate directories for models, views, controllers, and core components.

**Acceptance Criteria:**
- `app/` directory contains `models/`, `views/`, `controllers/`, and `core/` subdirectories
- Each subdirectory serves a single, well-defined purpose
- Directory structure supports separation of concerns
- Structure is intuitive for beginners
- Structure scales to accommodate future features

### 1.3 Public Assets Organization
The system SHALL organize public assets (CSS, JavaScript, images) in a logical, maintainable structure within the public directory.

**Acceptance Criteria:**
- `public/assets/` directory contains `css/`, `js/`, and `images/` subdirectories
- CSS files are organized by purpose (variables, main styles, components)
- JavaScript files are organized by functionality
- Images directory supports organized storage of visual assets
- Asset paths are predictable and follow conventions

### 1.4 Views Directory Structure
The system SHALL organize view files in a hierarchical structure that supports layouts, reusable components, and feature-specific views.

**Acceptance Criteria:**
- `app/views/` contains `layouts/`, `components/`, and feature-specific subdirectories
- Layouts directory stores reusable page templates
- Components directory stores reusable view fragments
- Feature views are grouped in named subdirectories (e.g., `home/`, `users/`)
- Structure supports view composition and reusability

## 2. Routing System

### 2.1 URL Routing
The system SHALL provide a routing mechanism that maps incoming URLs to controller actions.

**Acceptance Criteria:**
- Router parses incoming request URLs
- Router matches URLs against registered route patterns
- Router instantiates appropriate controller and calls specified action
- Router supports parameterized routes (e.g., `/users/:id`)
- Router handles unmatched routes with 404 response

### 2.2 Route Registration
The system SHALL allow routes to be registered with path patterns, controller names, and action methods.

**Acceptance Criteria:**
- Routes can be registered programmatically
- Each route specifies path, controller, and action
- Route paths must start with '/'
- Controller names must be valid class names
- Action names must be valid method names
- Duplicate route paths are prevented

### 2.3 Route Matching
The system SHALL match incoming request paths against registered route patterns, including support for URL parameters.

**Acceptance Criteria:**
- Exact path matches are supported
- Parameterized paths (e.g., `:id`) are supported
- Route parameters are extracted and made available to controllers
- First matching route is selected
- Route matching is case-sensitive
- Query strings are preserved and accessible

### 2.4 HTTP Method Support
The system SHALL support routing based on HTTP methods (GET, POST, PUT, DELETE, PATCH).

**Acceptance Criteria:**
- Routes can specify allowed HTTP methods
- Router validates request method matches route method
- Invalid method requests return 405 Method Not Allowed
- Default method is GET if not specified
- Multiple methods can be specified for a single route

## 3. Base Controller

### 3.1 View Rendering
The base controller SHALL provide a method to render views with data.

**Acceptance Criteria:**
- `view()` method accepts view path and data array
- View files are located in `app/views/` directory
- Data array is extracted to variables accessible in view
- View content is wrapped in layout template
- Non-existent views throw ViewNotFoundException
- HTML output is sent to browser

### 3.2 Redirect Functionality
The base controller SHALL provide a method to redirect to different URLs.

**Acceptance Criteria:**
- `redirect()` method accepts URL string
- HTTP 302 redirect header is sent
- Execution stops after redirect
- Both relative and absolute URLs are supported
- Redirect preserves query parameters if specified

### 3.3 JSON Response
The base controller SHALL provide a method to return JSON responses for API endpoints.

**Acceptance Criteria:**
- `json()` method accepts data array and optional status code
- Data is encoded as JSON
- Content-Type header is set to `application/json`
- Status code defaults to 200
- Invalid JSON data throws exception
- UTF-8 encoding is used

## 4. Base Model

### 4.1 Database Connection
The base model SHALL establish and maintain a PDO database connection.

**Acceptance Criteria:**
- Database connection is established in constructor
- Connection uses configuration from `config/database.php`
- Connection uses PDO with prepared statements
- Connection errors throw PDOException
- Connection uses UTF-8 charset
- Connection is persistent to reduce overhead

### 4.2 Parameterized Queries
The base model SHALL provide a method to execute parameterized SQL queries safely.

**Acceptance Criteria:**
- `query()` method accepts SQL string and parameters array
- Parameters are bound using PDO prepared statements
- Both positional and named parameters are supported
- SQL injection is prevented through parameterization
- Query errors throw PDOException
- PDOStatement object is returned on success

### 4.3 CRUD Operations
The base model SHALL provide methods for common CRUD (Create, Read, Update, Delete) operations.

**Acceptance Criteria:**
- `findAll()` retrieves all records from table
- `findById()` retrieves single record by ID
- `create()` inserts new record and returns ID
- `update()` modifies existing record by ID
- `delete()` removes record by ID
- All operations use parameterized queries
- Operations return appropriate data types (array, int, bool)

### 4.4 Table Name Configuration
The base model SHALL allow child models to specify their database table name.

**Acceptance Criteria:**
- Protected `$table` property stores table name
- Child models set table name in class definition
- Table name is used in CRUD operations
- Table name must be non-empty string
- Invalid table names throw exception

## 5. Layout System

### 5.1 Reusable Layout Template
The system SHALL provide a reusable layout template that wraps all page content.

**Acceptance Criteria:**
- Layout file defines common HTML structure (doctype, head, body)
- Layout includes header, navigation, main content area, and footer
- Layout loads CSS and JavaScript assets
- Layout sets page title from view data
- Layout includes meta tags for charset and viewport
- Content from views is injected into main content area

### 5.2 Dynamic Title Management
The layout system SHALL allow views to set custom page titles.

**Acceptance Criteria:**
- Page title can be set via view data
- Default title is used if none specified
- Title is properly escaped for HTML
- Title appears in `<title>` tag
- Title can include site name suffix

### 5.3 Asset Inclusion
The layout system SHALL include CSS and JavaScript assets in the correct order.

**Acceptance Criteria:**
- CSS variables file is loaded first
- Main CSS file is loaded after variables
- Additional stylesheets can be added per view
- JavaScript files are loaded before closing `</body>` tag
- Asset paths are relative to public directory
- Non-existent assets are handled gracefully

### 5.4 Meta Tag Management
The layout system SHALL include essential meta tags for proper page rendering and SEO.

**Acceptance Criteria:**
- Charset meta tag is set to UTF-8
- Viewport meta tag is included for responsive design
- Additional meta tags can be added per view
- Meta tags are properly formatted
- Meta tags appear in `<head>` section

## 6. CSS Variables System

### 6.1 CSS Variables File
The system SHALL provide a CSS variables file defining reusable design tokens.

**Acceptance Criteria:**
- `variables.css` file exists in `public/assets/css/`
- Variables are defined in `:root` selector
- Variables use `--` prefix naming convention
- Variables include colors, typography, and spacing
- Variables are loaded before other stylesheets

### 6.2 Color Variables
The CSS variables file SHALL define color tokens for consistent theming.

**Acceptance Criteria:**
- Primary, secondary, success, danger, warning, and info colors are defined
- Text and background colors are defined
- Border and shadow colors are defined
- Color values use hex or RGB format
- Colors are accessible (meet WCAG contrast requirements)

### 6.3 Typography Variables
The CSS variables file SHALL define typography tokens for consistent text styling.

**Acceptance Criteria:**
- Font family variables are defined
- Font size variables for headings and body text are defined
- Font weight variables are defined
- Line height variables are defined
- Letter spacing variables are defined (if needed)

### 6.4 Spacing Variables
The CSS variables file SHALL define spacing tokens for consistent layout.

**Acceptance Criteria:**
- Base spacing unit is defined
- Spacing scale is defined (multiples of base unit)
- Padding and margin variables are defined
- Gap variables for flexbox/grid are defined
- Spacing values are consistent and proportional

## 7. Configuration Management

### 7.1 Database Configuration
The system SHALL provide a configuration file for database connection settings.

**Acceptance Criteria:**
- `config/database.php` file exists
- Configuration includes host, database name, username, password
- Configuration includes charset (default: utf8mb4)
- Configuration includes PDO options array
- Sensitive credentials are not committed to version control
- Configuration file returns associative array

### 7.2 Application Configuration
The system SHALL provide a configuration file for application-wide settings.

**Acceptance Criteria:**
- `config/app.php` file exists
- Configuration includes application name
- Configuration includes environment (development/production)
- Configuration includes base URL
- Configuration includes timezone
- Configuration file returns associative array

### 7.3 Configuration Loading
The system SHALL provide a mechanism to load configuration files.

**Acceptance Criteria:**
- `loadConfig()` function accepts config file name
- Function returns configuration array
- Function throws exception if file not found
- Function validates configuration structure
- Configuration is cached to avoid repeated file reads

## 8. Database Planning

### 8.1 Database Schema Documentation
The system SHALL provide documentation for initial database schema planning.

**Acceptance Criteria:**
- `database/schema.sql` file exists
- File contains SQL statements for table creation
- Tables use appropriate data types
- Tables include primary keys
- Tables include foreign keys where appropriate
- Tables include indexes for performance

### 8.2 Migration System Planning
The system SHALL plan for a database migration system for future schema changes.

**Acceptance Criteria:**
- `database/migrations/` directory exists
- Migration file naming convention is documented
- Migration structure (up/down methods) is documented
- Migration execution order is defined
- Rollback strategy is documented

### 8.3 Seed Data Planning
The system SHALL plan for database seeding for development and testing.

**Acceptance Criteria:**
- `database/seeds/` directory exists
- Seed file structure is documented
- Seed data includes sample records for testing
- Seed execution is documented
- Seeds are separate from production data

## 9. Error Handling

### 9.1 404 Not Found Handling
The system SHALL handle requests for non-existent routes with a 404 error page.

**Acceptance Criteria:**
- 404 HTTP status code is returned
- Custom 404 error page is displayed
- Error page includes navigation links
- Attempted URL is logged for monitoring
- Error page matches site design

### 9.2 500 Internal Server Error Handling
The system SHALL handle application errors with a 500 error page.

**Acceptance Criteria:**
- 500 HTTP status code is returned
- Generic error page is displayed in production
- Detailed error message is shown in development mode
- Error details are logged
- Application does not crash

### 9.3 Database Error Handling
The system SHALL handle database connection and query errors gracefully.

**Acceptance Criteria:**
- PDOException is caught and handled
- Error details are logged (without exposing credentials)
- User-friendly error message is displayed
- 503 Service Unavailable status is returned for connection failures
- Transactions are rolled back on error

### 9.4 View Not Found Handling
The system SHALL handle attempts to render non-existent views.

**Acceptance Criteria:**
- ViewNotFoundException is thrown
- Error includes view path and controller context
- Error is logged
- 500 status code is returned
- Detailed error shown in development mode

## 10. Security

### 10.1 SQL Injection Prevention
The system SHALL prevent SQL injection attacks through parameterized queries.

**Acceptance Criteria:**
- All database queries use PDO prepared statements
- User input is never concatenated into SQL strings
- Parameters are properly bound with correct types
- Query method validates parameter count matches placeholders
- Raw queries are not exposed to user input

### 10.2 XSS Prevention
The system SHALL prevent cross-site scripting (XSS) attacks through output escaping.

**Acceptance Criteria:**
- All user-generated content is escaped before output
- `htmlspecialchars()` is used for HTML context escaping
- Views use short echo tag with escaping: `<?= htmlspecialchars($var) ?>`
- JavaScript context escaping is documented
- Content Security Policy headers are planned for future

### 10.3 Configuration Security
The system SHALL protect sensitive configuration data from exposure.

**Acceptance Criteria:**
- Configuration files are stored outside public directory
- `.gitignore` excludes sensitive config files
- Environment variables are used for credentials (planned)
- Database credentials are not hardcoded in application code
- Configuration files have restricted file permissions

### 10.4 Directory Access Protection
The system SHALL prevent direct access to application files and directories.

**Acceptance Criteria:**
- Only `public/` directory is web-accessible
- `.htaccess` or nginx config restricts access to other directories
- Directory listing is disabled
- Direct access to PHP files outside public returns 403
- Application entry point is `public/index.php`

## 11. File Organization

### 11.1 Naming Conventions
The system SHALL follow consistent naming conventions for files and directories.

**Acceptance Criteria:**
- Controller files use PascalCase with "Controller" suffix (e.g., `HomeController.php`)
- Model files use PascalCase (e.g., `User.php`)
- View files use lowercase with hyphens (e.g., `user-profile.php`)
- Directory names use lowercase with hyphens
- Configuration files use lowercase with hyphens
- Class names match file names

### 11.2 Autoloading Structure
The system SHALL organize files to support PSR-4 autoloading in the future.

**Acceptance Criteria:**
- One class per file
- File path matches namespace structure
- Class names match file names
- Directory structure supports namespace mapping
- Core classes are in `app/core/` directory

### 11.3 Documentation Files
The system SHALL include documentation files for setup and usage.

**Acceptance Criteria:**
- `README.md` exists in root directory
- README includes setup instructions
- README includes folder structure explanation
- README includes basic usage examples
- `SETUP.md` includes detailed installation steps

## 12. Development Environment

### 12.1 Local Development Setup
The system SHALL support easy local development environment setup.

**Acceptance Criteria:**
- Development can run on XAMPP, WAMP, or MAMP
- PHP 8.0+ is required
- MySQL 5.7+ or MariaDB 10.2+ is required
- Apache mod_rewrite is enabled
- Setup instructions are documented

### 12.2 Environment Configuration
The system SHALL support different configurations for development and production environments.

**Acceptance Criteria:**
- Environment can be set via configuration
- Development mode shows detailed errors
- Production mode shows generic error pages
- Error reporting level differs by environment
- Database credentials differ by environment

### 12.3 Git Integration
The system SHALL include proper Git configuration for version control.

**Acceptance Criteria:**
- `.gitignore` file exists
- `.gitignore` excludes vendor directories
- `.gitignore` excludes sensitive config files
- `.gitignore` excludes uploaded files
- `.gitignore` excludes IDE-specific files
- Git repository is initialized

## 13. Performance

### 13.1 Asset Loading Optimization
The system SHALL optimize asset loading for performance.

**Acceptance Criteria:**
- CSS files are loaded in `<head>`
- JavaScript files are loaded before `</body>`
- CSS variables reduce stylesheet size
- Asset paths are relative for faster resolution
- Future: Asset minification is planned

### 13.2 Database Connection Efficiency
The system SHALL use efficient database connection practices.

**Acceptance Criteria:**
- PDO connections are persistent
- Connections are reused across requests
- Connections are closed properly
- Connection pooling is planned for high traffic
- Query results are fetched efficiently

### 13.3 View Rendering Efficiency
The system SHALL render views efficiently.

**Acceptance Criteria:**
- Output buffering is used for view rendering
- Views are included only when needed
- Layout is rendered once per request
- Future: View caching is planned
- Future: Template compilation is planned

## 14. Scalability

### 14.1 Modular Structure
The system SHALL support adding new features without restructuring.

**Acceptance Criteria:**
- New controllers can be added to `app/controllers/`
- New models can be added to `app/models/`
- New views can be added to `app/views/`
- New routes can be registered in `config/routes.php`
- Core functionality remains unchanged when adding features

### 14.2 Component Reusability
The system SHALL support reusable components across features.

**Acceptance Criteria:**
- Base controller provides shared functionality
- Base model provides shared database operations
- Layout system supports multiple layouts
- View components can be included in multiple views
- CSS variables ensure consistent styling

### 14.3 Future Extension Points
The system SHALL provide clear extension points for future enhancements.

**Acceptance Criteria:**
- Authentication system can be added without restructuring
- Dashboard features can be added as new controllers/views
- API endpoints can be added alongside web routes
- Middleware system can be integrated into router
- Service layer can be added between controllers and models
