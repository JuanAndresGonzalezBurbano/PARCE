-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-08-2026 a las 20:20:48
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `parce`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin_access_requests`
--

CREATE TABLE `admin_access_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `requested_role_id` int(10) UNSIGNED NOT NULL,
  `justification` text NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`, `created_at`) VALUES
(1, '2024_01_01_000001_create_users_and_roles_tables', 1, '2026-08-05 19:47:53'),
(2, '2024_01_01_000002_create_sessions_table', 2, '2026-08-05 19:47:53'),
(3, '2024_01_01_000003_create_vehicles_table', 3, '2026-08-05 19:47:53'),
(4, '2024_01_01_000004_create_service_requests_table', 4, '2026-08-05 19:47:53'),
(5, '2026_01_01_000005_add_document_fields_to_vehicles', 5, '2026-08-05 19:47:53'),
(6, '2026_01_01_000006_add_driver_license_to_users', 6, '2026-08-05 19:47:53'),
(7, '2026_01_01_000007_add_detailed_ratings_to_service_requests', 7, '2026-08-05 19:47:54'),
(8, '2026_01_01_000008_create_service_request_evidences_table', 8, '2026-08-05 19:47:54'),
(9, '2026_07_10_000009_create_pqr_table', 9, '2026-08-05 19:47:54'),
(10, '2026_07_10_000010_create_surveys_table', 10, '2026-08-05 19:47:54'),
(11, '2026_07_10_000011_add_missing_rating_columns_to_service_requests', 11, '2026-08-05 19:47:54'),
(12, '2026_07_10_000012_seed_demo_users_and_sample_data', 12, '2026-08-05 19:47:54'),
(13, '2026_07_10_000013_add_driver_license_status_to_users', 13, '2026-08-05 19:47:54'),
(14, '2026_07_10_000014_add_description_to_service_request_evidences', 14, '2026-08-05 19:47:55'),
(15, '2026_07_10_000015_restore_document_fields_to_vehicles', 15, '2026-08-05 19:49:24'),
(16, '2026_07_16_000016_drop_unique_constraint_from_vehicle_plate_vin', 16, '2026-08-05 19:49:31');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `used_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`, `used_at`) VALUES
(1, 4, 'abaa9a154f3c6faee7cbc65a549c1b094b1171a0abe27bff5cdad29d26bc524b', '2026-08-13 23:53:38', '2026-08-12 18:53:38', NULL),
(2, 3, '312c936765491e3a613994b8f0107e78a8b61d1e5d32caea80e34c15d7345f37', '2026-08-14 02:11:48', '2026-08-12 19:11:48', NULL),
(3, 3, '36b6a0ad738e2a2c5f0b72b7fe79dcdb4b44929290b780380bf09d384a24b8db', '2026-08-12 19:12:00', '2026-08-12 19:12:00', '2026-08-13 02:12:00'),
(4, 3, '9bf623ba65aae8e6fffcf232a889e547fbb15a21c019830ab82c0b5bac8c2d02', '2026-08-12 19:12:10', '2026-08-12 19:12:09', '2026-08-13 02:12:10'),
(5, 3, '6d16d6f9758f4af74677931e5e107a399ba854500ab5fad153ce9c8c50efe879', '2026-08-12 19:13:33', '2026-08-12 19:13:32', '2026-08-13 02:13:33'),
(6, 3, 'a30f68d7273f75340ca9e5d2a11e0dd74be2370072c4fc0e300a44372703beee', '2026-08-12 19:13:59', '2026-08-12 19:13:58', '2026-08-13 02:13:59'),
(7, 4, '2e855f38d9aa8a9c41d4326e6749bdc35ef6702342993e20d63e68c5e4bd9eb7', '2026-08-14 02:18:07', '2026-08-12 19:18:07', NULL),
(8, 4, '3c317f9faf391a01c544ff2e67ca389715fcf23471cd8fbf9b704daf76aa622f', '2026-08-14 02:36:53', '2026-08-12 19:36:53', NULL),
(9, 4, '798d068dd0821f30336a1222c1763f978fb195fca604922ded986700eaecc6c7', '2026-08-14 02:40:25', '2026-08-12 19:40:25', NULL),
(10, 4, '9af05944648e449f42a16fe4a0ba0e6ae44f869e790f071ab5c0446ebb14bbb6', '2026-08-14 02:47:44', '2026-08-12 19:47:44', NULL),
(11, 4, '9494bb6f9aa3ce8e190f708540c6b6ce726ae632ffcea401589f39c96f842c39', '2026-08-12 19:50:22', '2026-08-12 19:49:47', '2026-08-13 02:50:22'),
(12, 3, '892de54c72af82bbe166fbdee920281376382a56f51de47bc6f30e408a1a9db2', '2026-08-14 02:58:25', '2026-08-12 19:58:25', NULL),
(13, 3, 'b6377f37ca26deae5c31e66af180678a106249362fc7a9836472e1982c21ef17', '2026-08-12 19:59:35', '2026-08-12 19:59:08', '2026-08-13 02:59:35'),
(14, 6, 'ff402b24203140bf9c86ed56130888e4424333788aee1a28520be2d1bd7da9d7', '2026-08-14 03:05:39', '2026-08-12 20:05:39', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pqr`
--

CREATE TABLE `pqr` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `ticket_code` varchar(20) NOT NULL,
  `type` enum('peticion','queja','reclamo','sugerencia') NOT NULL,
  `subject` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `status` enum('pending','in_review','resolved','rejected') NOT NULL DEFAULT 'pending',
  `admin_response` text DEFAULT NULL,
  `responded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `responded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pqr`
--

INSERT INTO `pqr` (`id`, `user_id`, `ticket_code`, `type`, `subject`, `description`, `status`, `admin_response`, `responded_by`, `responded_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'PQR-2026-000001', 'peticion', 'Solicitud de factura del servicio', 'Quisiera recibir la factura electrónica de mi último servicio (dato de demostración).', 'pending', NULL, NULL, NULL, '2026-08-05 19:47:54', '2026-08-05 19:47:54', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `is_system_role` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system_role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Customer', 'customer', 'Standard customer user with service request capabilities', 1, 1, '2026-08-05 19:47:53', '2026-08-05 19:47:53'),
(2, 'Mechanic', 'mechanic', 'Mechanic user with service execution and vehicle management capabilities', 1, 1, '2026-08-05 19:47:53', '2026-08-05 19:47:53'),
(3, 'Administrator', 'administrator', 'Administrative access to manage users, services, and platform operations', 1, 1, '2026-08-05 19:47:53', '2026-08-05 19:47:53'),
(4, 'Super Administrator', 'super_admin', 'Full system access with all permissions including role and system configuration', 1, 1, '2026-08-05 19:47:53', '2026-08-05 19:47:53'),
(5, 'Support Staff', 'support', 'Customer support staff with read-only access to assist users', 0, 1, '2026-08-05 19:47:53', '2026-08-05 19:47:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `service_requests`
--

CREATE TABLE `service_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_code` varchar(20) NOT NULL COMMENT 'Public tracking code (e.g., SR-2024-001234)',
  `customer_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Customer who created the request',
  `vehicle_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Vehicle needing service',
  `mechanic_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Assigned mechanic (null until assigned)',
  `resolved_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Mechanic who completed the service',
  `emergency_type` varchar(50) NOT NULL COMMENT 'tire, battery, fuel, lockout, tow, engine, other',
  `description` text NOT NULL COMMENT 'Customer description of the problem',
  `priority` varchar(20) NOT NULL DEFAULT 'normal' COMMENT 'normal, urgent, critical',
  `latitude` decimal(10,8) NOT NULL COMMENT 'Latitude where help is needed',
  `longitude` decimal(11,8) NOT NULL COMMENT 'Longitude where help is needed',
  `status` varchar(20) NOT NULL DEFAULT 'pending' COMMENT 'pending, assigned, in_progress, completed, cancelled, expired',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When request was created',
  `assigned_at` timestamp NULL DEFAULT NULL COMMENT 'When mechanic was assigned',
  `started_at` timestamp NULL DEFAULT NULL COMMENT 'When mechanic started work',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT 'When service was completed',
  `cancelled_at` timestamp NULL DEFAULT NULL COMMENT 'When request was cancelled',
  `expired_at` timestamp NULL DEFAULT NULL COMMENT 'When request expired',
  `cancellation_reason` text DEFAULT NULL COMMENT 'Why the request was cancelled',
  `cancelled_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'User who cancelled (customer or admin)',
  `estimated_cost` decimal(10,2) DEFAULT NULL COMMENT 'Mechanic estimated cost',
  `final_cost` decimal(10,2) DEFAULT NULL COMMENT 'Actual final cost',
  `customer_rating` tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'Customer rating 1-5',
  `customer_feedback` text DEFAULT NULL COMMENT 'Customer review',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete (admin only)',
  `punctuality_rating` tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'Punctuality rating 1-5',
  `service_quality_rating` tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'Service quality rating 1-5'
) ;

--
-- Volcado de datos para la tabla `service_requests`
--

INSERT INTO `service_requests` (`id`, `service_code`, `customer_id`, `vehicle_id`, `mechanic_id`, `resolved_by`, `emergency_type`, `description`, `priority`, `latitude`, `longitude`, `status`, `requested_at`, `assigned_at`, `started_at`, `completed_at`, `cancelled_at`, `expired_at`, `cancellation_reason`, `cancelled_by`, `estimated_cost`, `final_cost`, `customer_rating`, `customer_feedback`, `created_at`, `updated_at`, `deleted_at`, `punctuality_rating`, `service_quality_rating`) VALUES
(1, 'SR-2026-000001', 1, 1, 2, 2, 'battery', 'Batería descargada en zona norte de Bogotá (dato de demostración).', 'normal', 4.71100000, -74.07210000, 'completed', '2026-08-06 00:47:54', '2026-08-06 00:47:54', '2026-08-06 00:47:54', '2026-08-06 00:47:54', NULL, NULL, NULL, NULL, 80000.00, 75000.00, 5, 'Excelente atención, muy puntual y profesional (dato de demostración).', '2026-08-06 00:47:54', '2026-08-05 19:47:54', NULL, 5, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `service_request_evidences`
--

CREATE TABLE `service_request_evidences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_request_id` bigint(20) UNSIGNED NOT NULL,
  `uploaded_by` bigint(20) UNSIGNED NOT NULL,
  `evidence_type` enum('before','during','after') NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `original_filename` varchar(255) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `file_size` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`, `created_at`) VALUES
('09a670870a915221760a6f019749d37bb66d4850', 6, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '{\"user_id\":6,\"expires_at\":1785976118,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1785968918,\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/150.0.0.0 Safari\\/537.36\"}', 1785968930, '2026-08-05 22:28:38'),
('0e332b894ecead098f1a6067db1f70ca1e995c71', 6, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '{\"user_id\":6,\"expires_at\":1785968373,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1785961173,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/150.0.0.0 Safari\\/537.36\"}', 1785961173, '2026-08-05 20:19:33'),
('10d9cdda296729358688786a935c9fcd129bd760', 6, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '{\"user_id\":6,\"expires_at\":1786566295,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1786559095,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/151.0.0.0 Safari\\/537.36\"}', 1786559232, '2026-08-12 18:24:55'),
('44ca0da190c75032cf408a51c38105a04a9da557', 5, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '{\"user_id\":5,\"expires_at\":1785968206,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1785961006,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/150.0.0.0 Safari\\/537.36\"}', 1785961006, '2026-08-05 20:16:46'),
('89903e0eb94c29a581de92a9da3ac79749b5964d', 6, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '{\"user_id\":6,\"expires_at\":1785968373,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1785961173,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/150.0.0.0 Safari\\/537.36\"}', 1785961173, '2026-08-05 20:19:33'),
('96e17789e27a7681b3e2de02318818a577c78eec', 6, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '{\"user_id\":6,\"expires_at\":1785968761,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1785961561,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/150.0.0.0 Safari\\/537.36\"}', 1785961639, '2026-08-05 20:26:01'),
('a6f0a0ac1d90689f27dbf4e5731da7f01e0f7cb1', 5, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '{\"user_id\":5,\"expires_at\":1785967974,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1785960774,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/150.0.0.0 Safari\\/537.36\"}', 1785960975, '2026-08-05 20:12:54'),
('aad6c9c1a41b67b418f2cb3f032ea13ee7416e68', 3, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '{\"user_id\":3,\"expires_at\":1786572428,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1786565228,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/151.0.0.0 Safari\\/537.36\"}', 1786565328, '2026-08-12 20:07:08'),
('ac08c55791f10710fde2ae4ee2c655068cd4cff4', 6, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '{\"user_id\":6,\"expires_at\":1785968556,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1785961356,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/150.0.0.0 Safari\\/537.36\"}', 1785961408, '2026-08-05 20:22:36'),
('b1a66318d92afe6629abb8d90e26778c009466c4', 3, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '{\"user_id\":3,\"expires_at\":1786572541,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1786565341,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/151.0.0.0 Safari\\/537.36\"}', 1786566534, '2026-08-12 20:09:01'),
('c6a24eaa00a1976c9182668547510ad05ea6604b', 5, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '{\"user_id\":5,\"expires_at\":1785967490,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1785960290,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/150.0.0.0 Safari\\/537.36\"}', 1785960290, '2026-08-05 20:04:50'),
('d55a872dd36c1b3d98eee8a283f0d9f7e61168ae', 6, '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', '{\"user_id\":6,\"expires_at\":1785968455,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1785961255,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Linux; Android 15; Pixel 9) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/150.0.0.0 Mobile Safari\\/537.36\"}', 1785961255, '2026-08-05 20:20:55'),
('de792d65338c84b289b301c00e07a48b429241a4', 6, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '{\"user_id\":6,\"expires_at\":1785968398,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1785961198,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/150.0.0.0 Safari\\/537.36\"}', 1785961198, '2026-08-05 20:19:58'),
('e65f48303461cbabc4d358f1bdd61d48203392f6', 5, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '{\"user_id\":5,\"expires_at\":1785967491,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1785960291,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/150.0.0.0 Safari\\/537.36\"}', 1785960291, '2026-08-05 20:04:51'),
('ebe116c00e1e3a8e55dbd938628463cd0a6a65b1', 6, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '{\"user_id\":6,\"expires_at\":1785968990,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1785961790,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/150.0.0.0 Safari\\/537.36\"}', 1785963525, '2026-08-05 20:29:50'),
('f0f4111811abe831153a82727933056265293ec2', 5, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '{\"user_id\":5,\"expires_at\":1785967512,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1785960312,\"ip_address\":\"::1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/150.0.0.0 Safari\\/537.36\"}', 1785960312, '2026-08-05 20:05:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `surveys`
--

CREATE TABLE `surveys` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_request_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `overall_satisfaction` tinyint(3) UNSIGNED NOT NULL,
  `would_recommend` tinyint(1) NOT NULL,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `surveys`
--

INSERT INTO `surveys` (`id`, `service_request_id`, `customer_id`, `overall_satisfaction`, `would_recommend`, `comments`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 5, 1, 'Muy buena experiencia con el mecánico asignado (dato de demostración).', '2026-08-05 19:47:54', '2026-08-05 19:47:54', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_picture_url` varchar(500) DEFAULT NULL,
  `account_status` enum('active','suspended','deactivated','pending_verification') NOT NULL DEFAULT 'active' COMMENT 'MVP: Users active by default. Email verification planned for production.',
  `email_verification_status` enum('unverified','verified') NOT NULL DEFAULT 'unverified',
  `phone_verification_status` enum('unverified','verified') NOT NULL DEFAULT 'unverified',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone_verified_at` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `driver_license_number` varchar(50) DEFAULT NULL,
  `driver_license_expiration_date` date DEFAULT NULL,
  `driver_license_document_url` varchar(500) DEFAULT NULL,
  `driver_license_status` enum('not_set','valid','expiring_soon','expired') NOT NULL DEFAULT 'not_set',
  `driver_license_uploaded_at` timestamp NULL DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `profile_picture_url`, `account_status`, `email_verification_status`, `phone_verification_status`, `email_verified_at`, `phone_verified_at`, `last_login_at`, `last_login_ip`, `created_at`, `updated_at`, `deleted_at`, `driver_license_number`, `driver_license_expiration_date`, `driver_license_document_url`, `driver_license_status`, `driver_license_uploaded_at`) VALUES
(1, 'cliente.demo@parcedemo.local', '$argon2id$v=19$m=65536,t=4,p=1$a1NPTTFTRzVzV214eUo0Zg$/zF9nbBetZL1l7jhiwLUMnFBKhfriZHv3gae63ibHwU', 'Cliente', 'Demo', '3001234567', NULL, 'active', 'unverified', 'unverified', NULL, NULL, NULL, NULL, '2026-08-06 00:47:54', '2026-08-06 00:47:54', NULL, NULL, NULL, NULL, 'not_set', NULL),
(2, 'mecanico.demo@parcedemo.local', '$argon2id$v=19$m=65536,t=4,p=1$M2ptTWlJWVE1RW9oSUZFeQ$+IuyI1G5eyYsSRFwzRzgFpiEOvIYEeZUT9/8s+buLM8', 'Mecánico', 'Demo', '3007654321', NULL, 'active', 'unverified', 'unverified', NULL, NULL, NULL, NULL, '2026-08-06 00:47:54', '2026-08-06 00:47:54', NULL, NULL, NULL, NULL, 'not_set', NULL),
(3, 'admin.demo@parcedemo.local', '$argon2id$v=19$m=65536,t=4,p=1$bUIyNXZxTzBQODZ5SjR4Qw$uHH1S0db6wycOhYwu8hPhKyd2bYgRfpG6rclRiQE2W0', 'Administrador', 'Demo', '3009998888', NULL, 'active', 'unverified', 'unverified', NULL, NULL, '2026-08-13 03:09:01', '::1', '2026-08-06 00:47:54', '2026-08-12 20:09:01', NULL, NULL, NULL, NULL, 'not_set', NULL),
(4, 'juansebastianprieto29@gmail.com', '$argon2id$v=19$m=65536,t=4,p=1$Rk12dHlJbUhIdWd3QmgwZw$NW5efzbPO84szQ2I9EzSkWapCCC6JDZ7eXyoYBjBSo0', 'Juan', 'Prieto', '3219419326', NULL, 'active', 'unverified', 'unverified', NULL, NULL, '2026-08-13 02:51:10', '::1', '2026-08-06 00:59:50', '2026-08-12 19:51:10', NULL, NULL, NULL, NULL, 'not_set', NULL),
(5, 'andresrt545l@gmail.com', '$argon2id$v=19$m=65536,t=4,p=1$ZllLSlVLYTYzV29BZjJ3Qg$1zLI9JGayFC/6ogUCtUjkldKZMQu0mEGnL9Fo35vBu4', 'Andres', 'rodriguez', '3214919458', NULL, 'active', 'unverified', 'unverified', NULL, NULL, '2026-08-06 01:16:46', '::1', '2026-08-06 01:04:50', '2026-08-05 20:16:46', NULL, NULL, NULL, NULL, 'not_set', NULL),
(6, 'santisotoo311224@gmail.com', '$argon2id$v=19$m=65536,t=4,p=1$OHpQSWtSZjNuOTN2Lm14MQ$8WovbMoEXGNKN1fXaPKOwI3PHwJfLowTlStBmd3OWYA', 'santiago', 'soto', '3214567894', NULL, 'active', 'unverified', 'unverified', NULL, NULL, '2026-08-13 02:51:48', '::1', '2026-08-06 01:19:33', '2026-08-12 19:51:48', NULL, NULL, NULL, NULL, 'not_set', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_roles`
--

CREATE TABLE `user_roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL,
  `assigned_by` bigint(20) UNSIGNED DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Volcado de datos para la tabla `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `assigned_by`, `assigned_at`, `expires_at`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, '2026-08-06 00:47:54', NULL, 1, '2026-08-05 19:47:54', '2026-08-05 19:47:54'),
(2, 2, 2, NULL, '2026-08-06 00:47:54', NULL, 1, '2026-08-05 19:47:54', '2026-08-05 19:47:54'),
(3, 3, 3, NULL, '2026-08-06 00:47:54', NULL, 1, '2026-08-05 19:47:54', '2026-08-05 19:47:54'),
(4, 4, 1, NULL, '2026-08-06 00:59:50', NULL, 1, '2026-08-05 19:59:50', '2026-08-05 19:59:50'),
(5, 5, 1, NULL, '2026-08-06 01:04:50', NULL, 1, '2026-08-05 20:04:50', '2026-08-05 20:04:50'),
(6, 6, 1, NULL, '2026-08-06 01:19:33', NULL, 1, '2026-08-05 20:19:33', '2026-08-05 20:19:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehicles`
--

CREATE TABLE `vehicles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Owner of the vehicle',
  `license_plate` varchar(20) NOT NULL COMMENT 'Normalized license plate (uppercase, trimmed)',
  `make` varchar(50) NOT NULL COMMENT 'Vehicle manufacturer',
  `model` varchar(50) NOT NULL COMMENT 'Vehicle model',
  `year` smallint(5) UNSIGNED NOT NULL COMMENT 'Manufacturing year',
  `color` varchar(30) DEFAULT NULL COMMENT 'Vehicle color',
  `vin` varchar(17) DEFAULT NULL COMMENT 'Vehicle Identification Number (17 chars)',
  `vehicle_type` varchar(20) NOT NULL DEFAULT 'sedan' COMMENT 'sedan, suv, truck, motorcycle, van, other',
  `fuel_type` varchar(20) NOT NULL DEFAULT 'gasoline' COMMENT 'gasoline, diesel, electric, hybrid, other',
  `nickname` varchar(50) DEFAULT NULL COMMENT 'User-friendly name for the vehicle',
  `primary_photo_url` varchar(255) DEFAULT NULL COMMENT 'URL to primary vehicle photo',
  `is_primary` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Is this the user primary vehicle?',
  `status` varchar(20) NOT NULL DEFAULT 'active' COMMENT 'active or inactive',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
  `soat_number` varchar(50) DEFAULT NULL COMMENT 'SOAT policy number',
  `soat_expiration_date` date DEFAULT NULL COMMENT 'SOAT expiration date',
  `soat_document_url` varchar(500) DEFAULT NULL COMMENT 'URL to uploaded SOAT document',
  `soat_uploaded_at` timestamp NULL DEFAULT NULL COMMENT 'When the SOAT document was uploaded',
  `tecnomecanica_number` varchar(50) DEFAULT NULL COMMENT 'Tecnomecánica certificate number',
  `tecnomecanica_expiration_date` date DEFAULT NULL COMMENT 'Tecnomecánica expiration date',
  `tecnomecanica_document_url` varchar(500) DEFAULT NULL COMMENT 'URL to uploaded Tecnomecánica document',
  `tecnomecanica_uploaded_at` timestamp NULL DEFAULT NULL COMMENT 'When the Tecnomecánica document was uploaded'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `vehicles`
--

INSERT INTO `vehicles` (`id`, `user_id`, `license_plate`, `make`, `model`, `year`, `color`, `vin`, `vehicle_type`, `fuel_type`, `nickname`, `primary_photo_url`, `is_primary`, `status`, `created_at`, `updated_at`, `deleted_at`, `soat_number`, `soat_expiration_date`, `soat_document_url`, `soat_uploaded_at`, `tecnomecanica_number`, `tecnomecanica_expiration_date`, `tecnomecanica_document_url`, `tecnomecanica_uploaded_at`) VALUES
(1, 1, 'DEM001', 'Chevrolet', 'Spark GT', 2020, 'Blanco', NULL, 'sedan', 'gasoline', 'Vehículo Demo', NULL, 1, 'active', '2026-08-05 19:47:54', '2026-08-05 19:47:54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 6, 'ABC-123', 'Chevrolet', 'Spark', 2020, 'Gris', NULL, 'car', 'gasoline', NULL, NULL, 1, 'active', '2026-08-05 20:45:08', '2026-08-05 20:45:08', NULL, 'SOAT-2024-123456', NULL, NULL, '2026-08-05 20:45:08', 'TM-2024-789012', NULL, NULL, '2026-08-05 20:45:08');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admin_access_requests`
--
ALTER TABLE `admin_access_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_requested_role_id` (`requested_role_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_reviewed_by` (`reviewed_by`),
  ADD KEY `idx_approved_by` (`approved_by`),
  ADD KEY `idx_reviewed_at` (`reviewed_at`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_status_created` (`status`,`created_at`),
  ADD KEY `idx_status_reviewed_approved` (`status`,`reviewed_at`,`approved_at`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_migration` (`migration`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indices de la tabla `pqr`
--
ALTER TABLE `pqr`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_code` (`ticket_code`),
  ADD KEY `fk_pqr_responded_by` (`responded_by`),
  ADD KEY `idx_pqr_user_id` (`user_id`),
  ADD KEY `idx_pqr_status` (`status`),
  ADD KEY `idx_pqr_type` (`type`),
  ADD KEY `idx_pqr_created_at` (`created_at`),
  ADD KEY `idx_pqr_deleted_at` (`deleted_at`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_is_system_role` (`is_system_role`),
  ADD KEY `idx_active_system` (`is_active`,`is_system_role`);

--
-- Indices de la tabla `service_requests`
--
ALTER TABLE `service_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `service_code` (`service_code`),
  ADD KEY `fk_service_requests_resolved_by` (`resolved_by`),
  ADD KEY `fk_service_requests_cancelled_by` (`cancelled_by`),
  ADD KEY `idx_service_requests_service_code` (`service_code`),
  ADD KEY `idx_service_requests_customer_id` (`customer_id`),
  ADD KEY `idx_service_requests_vehicle_id` (`vehicle_id`),
  ADD KEY `idx_service_requests_mechanic_id` (`mechanic_id`),
  ADD KEY `idx_service_requests_status` (`status`),
  ADD KEY `idx_service_requests_emergency_type` (`emergency_type`),
  ADD KEY `idx_service_requests_priority` (`priority`),
  ADD KEY `idx_service_requests_requested_at` (`requested_at`),
  ADD KEY `idx_service_requests_deleted_at` (`deleted_at`),
  ADD KEY `idx_service_requests_customer_status` (`customer_id`,`status`),
  ADD KEY `idx_service_requests_mechanic_status` (`mechanic_id`,`status`),
  ADD KEY `idx_service_requests_status_requested` (`status`,`requested_at`),
  ADD KEY `idx_service_requests_status_priority` (`status`,`priority`,`requested_at`),
  ADD KEY `idx_service_requests_location` (`latitude`,`longitude`);

--
-- Indices de la tabla `service_request_evidences`
--
ALTER TABLE `service_request_evidences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_service_request_id` (`service_request_id`),
  ADD KEY `fk_evidence_user` (`uploaded_by`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_last_activity` (`last_activity`);

--
-- Indices de la tabla `surveys`
--
ALTER TABLE `surveys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `service_request_id` (`service_request_id`),
  ADD KEY `idx_surveys_customer_id` (`customer_id`),
  ADD KEY `idx_surveys_created_at` (`created_at`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_account_status` (`account_status`),
  ADD KEY `idx_email_verification_status` (`email_verification_status`),
  ADD KEY `idx_phone_verification_status` (`phone_verification_status`),
  ADD KEY `idx_last_login_at` (`last_login_at`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_account_email_status` (`account_status`,`email_verification_status`),
  ADD KEY `idx_last_login_account` (`last_login_at`,`account_status`);

--
-- Indices de la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_role_id` (`role_id`),
  ADD KEY `idx_assigned_by` (`assigned_by`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `idx_assigned_at` (`assigned_at`),
  ADD KEY `idx_user_role_active_expires` (`user_id`,`role_id`,`is_active`,`expires_at`),
  ADD KEY `idx_expires_active` (`expires_at`,`is_active`);

--
-- Indices de la tabla `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vehicles_user_id` (`user_id`),
  ADD KEY `idx_vehicles_license_plate` (`license_plate`),
  ADD KEY `idx_vehicles_status` (`status`),
  ADD KEY `idx_vehicles_deleted_at` (`deleted_at`),
  ADD KEY `idx_vehicles_is_primary` (`is_primary`),
  ADD KEY `idx_vehicles_created_at` (`created_at`),
  ADD KEY `idx_vehicles_user_status` (`user_id`,`status`),
  ADD KEY `idx_vehicles_user_deleted` (`user_id`,`deleted_at`),
  ADD KEY `idx_vehicles_vin` (`vin`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admin_access_requests`
--
ALTER TABLE `admin_access_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `pqr`
--
ALTER TABLE `pqr`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `service_requests`
--
ALTER TABLE `service_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `service_request_evidences`
--
ALTER TABLE `service_request_evidences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `surveys`
--
ALTER TABLE `surveys`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `admin_access_requests`
--
ALTER TABLE `admin_access_requests`
  ADD CONSTRAINT `admin_access_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_access_requests_ibfk_2` FOREIGN KEY (`requested_role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_access_requests_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `admin_access_requests_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pqr`
--
ALTER TABLE `pqr`
  ADD CONSTRAINT `fk_pqr_responded_by` FOREIGN KEY (`responded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pqr_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `service_requests`
--
ALTER TABLE `service_requests`
  ADD CONSTRAINT `fk_service_requests_cancelled_by` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_service_requests_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_service_requests_mechanic_id` FOREIGN KEY (`mechanic_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_service_requests_resolved_by` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_service_requests_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`);

--
-- Filtros para la tabla `service_request_evidences`
--
ALTER TABLE `service_request_evidences`
  ADD CONSTRAINT `fk_evidence_service_request` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_evidence_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `surveys`
--
ALTER TABLE `surveys`
  ADD CONSTRAINT `fk_surveys_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_surveys_service_request_id` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `fk_vehicles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
