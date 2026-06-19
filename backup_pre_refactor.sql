-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: parce
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_access_requests`
--

DROP TABLE IF EXISTS `admin_access_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_access_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `requested_role_id` int(10) unsigned NOT NULL,
  `justification` text NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `reviewed_by` bigint(20) unsigned DEFAULT NULL,
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_requested_role_id` (`requested_role_id`),
  KEY `idx_status` (`status`),
  KEY `idx_reviewed_by` (`reviewed_by`),
  KEY `idx_approved_by` (`approved_by`),
  KEY `idx_reviewed_at` (`reviewed_at`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status_created` (`status`,`created_at`),
  KEY `idx_status_reviewed_approved` (`status`,`reviewed_at`,`approved_at`),
  CONSTRAINT `admin_access_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `admin_access_requests_ibfk_2` FOREIGN KEY (`requested_role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `admin_access_requests_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `admin_access_requests_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_approval_consistency` CHECK (`status` = 'approved' and `approved_by` is not null and `approved_at` is not null or `status` <> 'approved'),
  CONSTRAINT `chk_rejection_reason` CHECK (`status` = 'rejected' and `rejection_reason` is not null or `status` <> 'rejected')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_access_requests`
--

LOCK TABLES `admin_access_requests` WRITE;
/*!40000 ALTER TABLE `admin_access_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_access_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_migration` (`migration`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (3,'2024_01_01_000001_create_users_and_roles_tables',1,'2026-05-26 15:51:03'),(4,'2024_01_01_000002_create_sessions_table',2,'2026-05-26 15:51:03'),(5,'2024_01_01_000003_create_vehicles_table',3,'2026-06-02 15:02:37'),(6,'2024_01_01_000004_create_service_requests_table',4,'2026-06-09 03:29:59');
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `is_system_role` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_name` (`name`),
  KEY `idx_slug` (`slug`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_is_system_role` (`is_system_role`),
  KEY `idx_active_system` (`is_active`,`is_system_role`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Customer','customer','Standard customer user with service request capabilities',1,1,'2026-05-26 15:51:03','2026-05-26 15:51:03'),(2,'Mechanic','mechanic','Mechanic user with service execution and vehicle management capabilities',1,1,'2026-05-26 15:51:03','2026-05-26 15:51:03'),(3,'Administrator','administrator','Administrative access to manage users, services, and platform operations',1,1,'2026-05-26 15:51:03','2026-05-26 15:51:03'),(4,'Super Administrator','super_admin','Full system access with all permissions including role and system configuration',1,1,'2026-05-26 15:51:03','2026-05-26 15:51:03'),(5,'Support Staff','support','Customer support staff with read-only access to assist users',0,1,'2026-05-26 15:51:03','2026-05-26 15:51:03');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_requests`
--

DROP TABLE IF EXISTS `service_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `service_code` varchar(20) NOT NULL COMMENT 'Public tracking code (e.g., SR-2024-001234)',
  `customer_id` bigint(20) unsigned NOT NULL COMMENT 'Customer who created the request',
  `vehicle_id` bigint(20) unsigned NOT NULL COMMENT 'Vehicle needing service',
  `mechanic_id` bigint(20) unsigned DEFAULT NULL COMMENT 'Assigned mechanic (null until assigned)',
  `resolved_by` bigint(20) unsigned DEFAULT NULL COMMENT 'Mechanic who completed the service',
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
  `cancelled_by` bigint(20) unsigned DEFAULT NULL COMMENT 'User who cancelled (customer or admin)',
  `estimated_cost` decimal(10,2) DEFAULT NULL COMMENT 'Mechanic estimated cost',
  `final_cost` decimal(10,2) DEFAULT NULL COMMENT 'Actual final cost',
  `customer_rating` tinyint(3) unsigned DEFAULT NULL COMMENT 'Customer rating 1-5',
  `customer_feedback` text DEFAULT NULL COMMENT 'Customer review',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete (admin only)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `service_code` (`service_code`),
  KEY `fk_service_requests_resolved_by` (`resolved_by`),
  KEY `fk_service_requests_cancelled_by` (`cancelled_by`),
  KEY `idx_service_requests_service_code` (`service_code`),
  KEY `idx_service_requests_customer_id` (`customer_id`),
  KEY `idx_service_requests_vehicle_id` (`vehicle_id`),
  KEY `idx_service_requests_mechanic_id` (`mechanic_id`),
  KEY `idx_service_requests_status` (`status`),
  KEY `idx_service_requests_emergency_type` (`emergency_type`),
  KEY `idx_service_requests_priority` (`priority`),
  KEY `idx_service_requests_requested_at` (`requested_at`),
  KEY `idx_service_requests_deleted_at` (`deleted_at`),
  KEY `idx_service_requests_customer_status` (`customer_id`,`status`),
  KEY `idx_service_requests_mechanic_status` (`mechanic_id`,`status`),
  KEY `idx_service_requests_status_requested` (`status`,`requested_at`),
  KEY `idx_service_requests_status_priority` (`status`,`priority`,`requested_at`),
  KEY `idx_service_requests_location` (`latitude`,`longitude`),
  CONSTRAINT `fk_service_requests_cancelled_by` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_service_requests_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_service_requests_mechanic_id` FOREIGN KEY (`mechanic_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_service_requests_resolved_by` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_service_requests_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_requests`
--

LOCK TABLES `service_requests` WRITE;
/*!40000 ALTER TABLE `service_requests` DISABLE KEYS */;
INSERT INTO `service_requests` VALUES (1,'SR-2026-000001',1,1,NULL,NULL,'tire','Flat tire on highway, need immediate assistance','urgent',40.71280000,-74.00600000,'pending','2026-06-09 22:57:15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-09 16:27:15','2026-06-09 16:27:15',NULL),(2,'SR-2026-000002',2,3,12,NULL,'battery','Car won\'t start, battery seems dead','normal',40.75890000,-73.98510000,'assigned','2026-06-09 22:27:15','2026-06-09 22:42:15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-09 16:27:15','2026-06-09 16:27:15',NULL),(3,'SR-2026-000003',1,1,12,12,'lockout','Locked keys inside the car','normal',40.73060000,-73.93520000,'completed','2026-06-08 23:27:15','2026-06-08 23:37:15','2026-06-08 23:57:15','2026-06-09 00:27:15',NULL,NULL,NULL,NULL,NULL,75.00,5,'Excellent service! Very fast response and professional.','2026-06-09 16:27:15','2026-06-09 16:27:15',NULL),(4,'SR-2026-000004',2,3,NULL,NULL,'engine','Engine making strange noises','normal',40.75800000,-73.98550000,'cancelled','2026-06-06 23:27:15',NULL,NULL,NULL,'2026-06-06 23:32:15',NULL,'Found another mechanic nearby who could help sooner',2,NULL,NULL,NULL,NULL,'2026-06-09 16:27:15','2026-06-09 16:27:15',NULL),(5,'SR-2026-000005',11,8,12,12,'tire','Flat tire on highway','urgent',40.71280000,-74.00600000,'completed','2026-06-10 05:12:57','2026-06-10 05:14:09','2026-06-10 05:14:20','2026-06-10 05:17:54',NULL,NULL,NULL,NULL,NULL,75.50,5,'Excellent service!','2026-06-09 22:12:57','2026-06-09 22:19:01',NULL);
/*!40000 ALTER TABLE `service_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(10) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_last_activity` (`last_activity`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('01d90135c4eb3533884a927af3f7daf206008efb',12,'::1','','{\"user_id\":12,\"expires_at\":1780108002,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780100802,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780100802,'2026-05-30 00:26:42'),('0d2723836ee6444f19204779703b20dff72ba9f2',12,'::1','curl/8.19.0','{\"user_id\":12,\"expires_at\":1781050421,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1781043221,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1781043260,'2026-06-09 22:13:41'),('189ce1e0a8a532e28a30e5df77fb75caca9edc3f',13,'::1','','{\"user_id\":13,\"expires_at\":1780108336,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780101136,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780101136,'2026-05-30 00:32:16'),('1da29a36fb886b46646b9feb4b56389aca5c63af',11,'::1','curl/8.19.0','{\"user_id\":11,\"expires_at\":1781048963,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1781041763,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1781041784,'2026-06-09 21:49:23'),('207f217935756a024f573d9ebb0845c76a404e24',11,'::1','','{\"user_id\":11,\"expires_at\":1781049021,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1781041821,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1781041821,'2026-06-09 21:50:21'),('230987d7ab9646ee0e031682c004791960f8f6a6',11,'::1','curl/8.19.0','{\"user_id\":11,\"expires_at\":1781040036,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1781032836,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1781032837,'2026-06-09 19:20:36'),('2df7c5c60f64209b4604bbee809ff076dcaf4e3b',9,'::1','','{\"user_id\":9,\"expires_at\":1780412118,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780404918,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780404918,'2026-06-02 12:55:18'),('376be10c838dbe225ffdc136aecf516f12a13e85',11,'::1','curl/8.19.0','{\"user_id\":11,\"expires_at\":1781050280,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1781043080,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1781043195,'2026-06-09 22:11:20'),('4299141cd889ff105e4935e025e2dfc7eb86a1df',10,'::1','','{\"user_id\":10,\"expires_at\":1780412118,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780404918,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780404918,'2026-06-02 12:55:18'),('4e6493d3fe1b935461a4790526c95dedabe2f10f',12,'::1','','{\"user_id\":12,\"expires_at\":1780108226,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780101026,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780101026,'2026-05-30 00:30:26'),('522cf8b4bd23a50052b6bded093f6bf5d50ee39b',8,'::1','curl/8.19.0','{\"user_id\":8,\"expires_at\":1779838938,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1779831738,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1779831738,'2026-05-26 21:42:18'),('52e5c28e3131de7bcdfd2efe3eea0b3b5539e16b',10,'::1','','{\"user_id\":10,\"expires_at\":1780108216,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780101016,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780101016,'2026-05-30 00:30:16'),('5352a671215453621c7d4f0250b13bcf1608cd81',11,'::1','curl/8.19.0','{\"user_id\":11,\"expires_at\":1780108128,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780100928,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1780100928,'2026-05-30 00:28:48'),('57c92fa9a35f64eb6b61ed452df5fd696ca64f6f',10,'::1','','{\"user_id\":10,\"expires_at\":1780108337,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780101137,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780101137,'2026-05-30 00:32:17'),('675730f6b0bc4e30ae5113f88c22de7b2d13556d',12,'::1','curl/8.19.0','{\"user_id\":12,\"expires_at\":1781048972,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1781041772,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1781041772,'2026-06-09 21:49:32'),('6fb8af591187cf652051124e2901108339449ebc',11,'::1','curl/8.19.0','{\"user_id\":11,\"expires_at\":1780108310,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780101110,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1780101110,'2026-05-30 00:31:50'),('729af8e29bd5bb78e586bbc40301c0085fc71f0e',11,'::1','curl/8.19.0','{\"user_id\":11,\"expires_at\":1781040516,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1781033316,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1781033316,'2026-06-09 19:28:36'),('76d63c25c40bfc2e2cc5b279a20b33216c267cfc',11,'::1','curl/8.19.0','{\"user_id\":11,\"expires_at\":1781038276,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1781031076,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1781031083,'2026-06-09 18:51:16'),('77c5de8724002b2461e9d973f762e9c5809c04db',12,'::1','','{\"user_id\":12,\"expires_at\":1780108338,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780101138,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780101138,'2026-05-30 00:32:18'),('7e34f5ea9cca96c573cf1a8504da8d95804e6ca3',9,'::1','','{\"user_id\":9,\"expires_at\":1780412181,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780404981,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780404981,'2026-06-02 12:56:21'),('841d46cd3fd1553f2099a7094fe9a28184f84a3f',12,'::1','','{\"user_id\":12,\"expires_at\":1780412118,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780404918,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780404918,'2026-06-02 12:55:18'),('85b098f713189c6454fa2132205872873421892b',10,'::1','','{\"user_id\":10,\"expires_at\":1780412181,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780404981,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780404981,'2026-06-02 12:56:21'),('85b76c3566d1a96deb256feec025f41e96e06e93',11,'::1','curl/8.19.0','{\"user_id\":11,\"expires_at\":1781048945,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1781041745,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1781041745,'2026-06-09 21:49:05'),('8f8cb75c1d986e24e18d0d55ea80f980e52adeca',10,'::1','','{\"user_id\":10,\"expires_at\":1780108001,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780100801,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780100801,'2026-05-30 00:26:41'),('988fceb073e02ac1e151dc3dac8a8db04d9f8858',17,'::1','','{\"user_id\":17,\"expires_at\":1780412180,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780404980,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780404980,'2026-06-02 12:56:20'),('9cd3b020aba92818df308c18891d10981306f098',11,'::1','curl/8.19.0','{\"user_id\":11,\"expires_at\":1781050741,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1781043541,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1781043554,'2026-06-09 22:19:01'),('ae6ba17a90237dcef78d7a93a6cb348956852010',12,'::1','curl/8.19.0','{\"user_id\":12,\"expires_at\":1781050674,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1781043474,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1781043555,'2026-06-09 22:17:54'),('bbaf0363cde349f82471cc24ac8ad7a93907e971',7,'::1','curl/8.19.0','{\"user_id\":7,\"expires_at\":1779836090,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1779828890,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1779828890,'2026-05-26 20:54:50'),('bbefd4eaa25edda554bd7dfd55744eff915a701c',9,'::1','','{\"user_id\":9,\"expires_at\":1780108337,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780101137,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780101137,'2026-05-30 00:32:17'),('c2041776ac2245a4be319b36b5a4068311a1e051',6,'::1','curl/8.19.0','{\"user_id\":6,\"expires_at\":1779835337,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1779828137,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1779828137,'2026-05-26 20:42:17'),('cfe87363ce56190b0c25ac2f7816cdbf846fd189',16,'::1','','{\"user_id\":16,\"expires_at\":1780412117,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780404917,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780404917,'2026-06-02 12:55:17'),('d0d42ef63f83a0210a5d357405a495a28e5600d7',12,'::1','','{\"user_id\":12,\"expires_at\":1780108216,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780101016,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780101016,'2026-05-30 00:30:16'),('d5cfdf5a1a20749da8ed34ca6694da0f736004e5',9,'::1','','{\"user_id\":9,\"expires_at\":1780108001,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780100801,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780100801,'2026-05-30 00:26:41'),('d8ce4cfc965ea47acb8cf18048566a9a190991e3',9,'::1','','{\"user_id\":9,\"expires_at\":1780108215,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780101015,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780101015,'2026-05-30 00:30:15'),('e2306bff14a4a11706be1f1bf9267b6c1fafa533',8,'::1','curl/8.19.0','{\"user_id\":8,\"expires_at\":1779836385,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1779829185,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1779829185,'2026-05-26 20:59:45'),('e67500ac290d0ee97aae012fd1880e423a1783a2',7,'::1','curl/8.19.0','{\"user_id\":7,\"expires_at\":1779836115,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1779828915,\"ip_address\":\"::1\",\"user_agent\":\"curl\\/8.19.0\"}',1779828972,'2026-05-26 20:55:15'),('eb9fd8be797263cce5dd9f60e7030cf508624863',12,'::1','','{\"user_id\":12,\"expires_at\":1780412182,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780404982,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780404982,'2026-06-02 12:56:22'),('efb8911b3f5903e658a1b47db2d7b45494560673',9,'::1','','{\"user_id\":9,\"expires_at\":1780108224,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780101024,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780101024,'2026-05-30 00:30:24'),('f4261c6fd0cc2fd4c97757ce0a39ffb94cfa0a14',12,'::1','','{\"user_id\":12,\"expires_at\":1781049021,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1781041821,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1781041821,'2026-06-09 21:50:21'),('fae7fd707284ca729b31e95dcfe0021bbc680680',10,'::1','','{\"user_id\":10,\"expires_at\":1780108225,\"max_idle_seconds\":1800,\"remember\":false,\"created_at\":1780101025,\"ip_address\":\"::1\",\"user_agent\":\"\"}',1780101025,'2026-05-30 00:30:25');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `role_id` int(10) unsigned NOT NULL,
  `assigned_by` bigint(20) unsigned DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_assigned_by` (`assigned_by`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_assigned_at` (`assigned_at`),
  KEY `idx_user_role_active_expires` (`user_id`,`role_id`,`is_active`,`expires_at`),
  KEY `idx_expires_active` (`expires_at`,`is_active`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_expires_future` CHECK (`expires_at` is null or `expires_at` > `assigned_at`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,6,1,NULL,'2026-05-27 03:42:17',NULL,1,'2026-05-26 20:42:17','2026-05-26 20:42:17'),(2,7,1,NULL,'2026-05-27 03:54:50',NULL,1,'2026-05-26 20:54:50','2026-05-26 20:54:50'),(3,8,1,NULL,'2026-05-27 03:59:45',NULL,1,'2026-05-26 20:59:45','2026-05-26 20:59:45'),(4,9,4,NULL,'2026-05-30 07:23:37',NULL,1,'2026-05-30 07:23:37','2026-05-30 07:23:37'),(5,10,3,NULL,'2026-05-30 07:23:38',NULL,1,'2026-05-30 07:23:38','2026-05-30 07:23:38'),(6,11,1,NULL,'2026-05-30 07:23:38',NULL,1,'2026-05-30 07:23:38','2026-05-30 07:23:38'),(7,12,2,NULL,'2026-05-30 07:23:38',NULL,1,'2026-05-30 07:23:38','2026-05-30 07:23:38'),(8,13,1,NULL,'2026-05-30 07:32:16',NULL,1,'2026-05-30 00:32:16','2026-05-30 00:32:16'),(11,16,1,NULL,'2026-06-02 19:55:17',NULL,1,'2026-06-02 12:55:17','2026-06-02 12:55:17'),(12,17,1,NULL,'2026-06-02 19:56:20',NULL,1,'2026-06-02 12:56:20','2026-06-02 12:56:20'),(13,1,1,NULL,'2026-06-09 23:25:58',NULL,1,'2026-06-09 16:25:58','2026-06-09 16:25:58'),(14,2,1,NULL,'2026-06-09 23:25:58',NULL,1,'2026-06-09 16:25:58','2026-06-09 16:25:58'),(15,3,1,NULL,'2026-06-09 23:25:58',NULL,1,'2026-06-09 16:25:58','2026-06-09 16:25:58'),(16,4,1,NULL,'2026-06-09 23:25:58',NULL,1,'2026-06-09 16:25:58','2026-06-09 16:25:58');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_picture_url` varchar(500) DEFAULT NULL,
  `account_status` enum('active','suspended','deactivated','pending_verification') NOT NULL DEFAULT 'pending_verification',
  `email_verification_status` enum('unverified','verified') NOT NULL DEFAULT 'unverified',
  `phone_verification_status` enum('unverified','verified') NOT NULL DEFAULT 'unverified',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone_verified_at` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_account_status` (`account_status`),
  KEY `idx_email_verification_status` (`email_verification_status`),
  KEY `idx_phone_verification_status` (`phone_verification_status`),
  KEY `idx_last_login_at` (`last_login_at`),
  KEY `idx_deleted_at` (`deleted_at`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_account_email_status` (`account_status`,`email_verification_status`),
  KEY `idx_last_login_account` (`last_login_at`,`account_status`),
  CONSTRAINT `chk_email_verification` CHECK (`email_verification_status` = 'verified' and `email_verified_at` is not null or `email_verification_status` = 'unverified'),
  CONSTRAINT `chk_phone_verification` CHECK (`phone_verification_status` = 'verified' and `phone_verified_at` is not null or `phone_verification_status` = 'unverified')
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'testuser1@example.com','$argon2id$v=19$m=65536,t=4,p=1$akIvcElUdXhKWVRVREcxMg$Gica9zJxRPV98Tpz8xXpW3Zf/YJTHjmEFJ+G6Z1dpd4','Test','User1',NULL,NULL,'active','unverified','unverified',NULL,NULL,NULL,NULL,'2026-05-26 17:25:28','2026-05-26 17:25:28',NULL),(2,'testuser2@example.com','$argon2id$v=19$m=65536,t=4,p=1$dDVTTzlKaFZOOGR5VUJ6Yg$uiLODWiBvdyQjWAeUd++2Dg4o3ehPDtKQqkgrvnwSdc','Test','User2',NULL,NULL,'active','unverified','unverified',NULL,NULL,NULL,NULL,'2026-05-26 17:25:28','2026-05-26 17:25:28',NULL),(3,'testuser3@example.com','$argon2id$v=19$m=65536,t=4,p=1$RlZJVHN2bFZJemVCUDZCeQ$LotQE/QWd61w6eQKsZGbaeiTy3SQtm7LOgiwXx0oyNM','Test','User3',NULL,NULL,'active','unverified','unverified',NULL,NULL,NULL,NULL,'2026-05-26 17:25:28','2026-05-26 17:25:28',NULL),(4,'testuser4@example.com','$argon2id$v=19$m=65536,t=4,p=1$NlhiOFd6dW82c3FYR1VTYQ$9g0kNH9RoszaCTBfiVcctfqWiIxKRVc69RpdbjPP7QI','Test','User4',NULL,NULL,'active','unverified','unverified',NULL,NULL,NULL,NULL,'2026-05-26 17:25:29','2026-05-26 17:25:29',NULL),(5,'testuser5@example.com','$argon2id$v=19$m=65536,t=4,p=1$V2JoT1hOM0FoUlNsaHFOSg$VT1/1kQ1HiINkZq1vE6UXWV4BeXNR4EJOulkws15q9o','Test','User5',NULL,NULL,'active','unverified','unverified',NULL,NULL,NULL,NULL,'2026-05-26 17:25:29','2026-05-26 17:25:29',NULL),(6,'test@example.com','$argon2id$v=19$m=65536,t=4,p=1$dXZxWkF6dVRIenVqQTZTTg$YLuu5n24EEALQZE9Gzu3W6HOtElZwVW+r+G9jDXm9Bk','Test','User',NULL,NULL,'active','unverified','unverified',NULL,NULL,'2026-05-27 03:45:01','::1','2026-05-27 03:42:17','2026-05-26 20:45:01',NULL),(7,'newuser@example.com','$argon2id$v=19$m=65536,t=4,p=1$QTZ0cnAzZkpXWlFobFRvLw$4pwanY1aZWFyFH6rTjc1aT0j1kgS3yPDAzg2h99GACE','New','User',NULL,NULL,'active','unverified','unverified',NULL,NULL,'2026-05-27 03:55:15','::1','2026-05-27 03:54:50','2026-05-26 20:55:15',NULL),(8,'finaltest@example.com','$argon2id$v=19$m=65536,t=4,p=1$bFA5RGJnTnZzRlVYOVlXbA$+IWN7DdTL39dtq5jZCgFyhqr+89Y9RaSgzK3QpQAndk','Final','Test',NULL,NULL,'active','unverified','unverified',NULL,NULL,'2026-05-27 04:42:18','::1','2026-05-27 03:59:45','2026-05-26 21:42:18',NULL),(9,'superadmin@parce.local','$argon2id$v=19$m=65536,t=4,p=1$d1RheTFRUzcvSmMzeExsbw$tgIF+V6PcWMAeJc3WwxZWaZdCiKIVpwX5ANcJqFQ8Yo','Super','Administrator','+1234567890',NULL,'active','verified','unverified','2026-05-30 07:23:37',NULL,'2026-06-02 19:56:21','::1','2026-05-30 07:23:37','2026-06-02 12:56:21',NULL),(10,'admin@parce.local','$argon2id$v=19$m=65536,t=4,p=1$Rlp2U1Mzd3BQNk1HOWt6ZA$qyQl9HgJHkxOANd8IHTUYUeAi7U1fuBNuyOgsR3PWq8','System','Administrator','+1234567891',NULL,'active','verified','unverified','2026-05-30 07:23:38',NULL,'2026-06-02 19:56:21','::1','2026-05-30 07:23:38','2026-06-02 12:56:21',NULL),(11,'customer@parce.local','$argon2id$v=19$m=65536,t=4,p=1$TlBvQXFpcFRUTnE5NDNmdQ$n7CpSCodoi9MMuRzwgtUFAdKSiiUyv7esVswAzH5LhA','Demo','Customer','+1234567892',NULL,'active','unverified','unverified',NULL,NULL,'2026-06-10 05:19:01','::1','2026-05-30 07:23:38','2026-06-09 22:19:01',NULL),(12,'mechanic@parce.local','$argon2id$v=19$m=65536,t=4,p=1$UUc3MlVXaTBUVW1Xb3VGQQ$AZRr+QQ8TqGht11xtOQ5r3yNAoGabvRJfW1aPd0q2aU','Demo','Mechanic','+1234567893',NULL,'active','unverified','unverified',NULL,NULL,'2026-06-10 05:17:54','::1','2026-05-30 07:23:38','2026-06-09 22:17:54',NULL),(13,'integration_test_1780101136@example.com','$argon2id$v=19$m=65536,t=4,p=1$WWtYRlJabjF0RGdzSUtReQ$q1fnGBR+vUdn/MDHBtkOelFBpZsbBHWyA9zptbrokKs','Integration','Test','+1234567899',NULL,'active','unverified','unverified',NULL,NULL,NULL,NULL,'2026-05-30 07:32:16','2026-05-30 07:32:16',NULL),(16,'integration_test_1780404917@example.com','$argon2id$v=19$m=65536,t=4,p=1$dWh5SzZhdXl0dkV2aGJoUg$dArYuGQUh6NzPSvwFGnS76r3Kt/78FhzZozNjXG+zv0','Integration','Test','+1234567899',NULL,'active','unverified','unverified',NULL,NULL,NULL,NULL,'2026-06-02 19:55:17','2026-06-02 19:55:17',NULL),(17,'integration_test_1780404980@example.com','$argon2id$v=19$m=65536,t=4,p=1$Sk9sZTVhYUlibG94Yng4MA$0yl/zRyhWWhB8sFq+jSLC4cxGBpfI100+WjCrkBOGvk','Integration','Test','+1234567899',NULL,'active','unverified','unverified',NULL,NULL,NULL,NULL,'2026-06-02 19:56:20','2026-06-02 19:56:20',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehicles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL COMMENT 'Owner of the vehicle',
  `license_plate` varchar(20) NOT NULL COMMENT 'Normalized license plate (uppercase, trimmed)',
  `make` varchar(50) NOT NULL COMMENT 'Vehicle manufacturer',
  `model` varchar(50) NOT NULL COMMENT 'Vehicle model',
  `year` smallint(5) unsigned NOT NULL COMMENT 'Manufacturing year',
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_plate` (`license_plate`),
  UNIQUE KEY `vin` (`vin`),
  KEY `idx_vehicles_user_id` (`user_id`),
  KEY `idx_vehicles_license_plate` (`license_plate`),
  KEY `idx_vehicles_status` (`status`),
  KEY `idx_vehicles_deleted_at` (`deleted_at`),
  KEY `idx_vehicles_is_primary` (`is_primary`),
  KEY `idx_vehicles_created_at` (`created_at`),
  KEY `idx_vehicles_user_status` (`user_id`,`status`),
  KEY `idx_vehicles_user_deleted` (`user_id`,`deleted_at`),
  CONSTRAINT `fk_vehicles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (1,1,'ABC00101','Toyota','Corolla',2020,'Silver','1HGBH41JXMN00100','sedan','gasoline','Silver Bullet',NULL,1,'active','2026-06-02 15:05:53','2026-06-02 15:05:53',NULL),(2,1,'ABC00102','Honda','Civic',2019,'Blue','1HGBH41JXMN00101','sedan','gasoline','Blue Thunder',NULL,0,'active','2026-06-02 15:05:53','2026-06-02 15:05:53',NULL),(3,2,'ABC00201','Honda','Civic',2019,'Blue','1HGBH41JXMN00200','sedan','gasoline','Blue Thunder',NULL,1,'active','2026-06-02 15:05:53','2026-06-02 15:05:53',NULL),(4,3,'ABC00301','Ford','F-150',2021,'Black','1HGBH41JXMN00300','truck','gasoline','Work Truck',NULL,1,'active','2026-06-02 15:05:53','2026-06-02 15:05:53',NULL),(5,3,'ABC00302','Chevrolet','Suburban',2022,'White','1HGBH41JXMN00301','suv','gasoline','Family SUV',NULL,0,'active','2026-06-02 15:05:53','2026-06-02 15:05:53',NULL),(6,4,'ABC00401','Chevrolet','Suburban',2022,'White','1HGBH41JXMN00400','suv','gasoline','Family SUV',NULL,1,'active','2026-06-02 15:05:53','2026-06-02 15:05:53',NULL),(8,11,'ABC-123','Toyota','Camry',2022,'Blue',NULL,'sedan','gasoline',NULL,NULL,1,'active','2026-06-09 22:11:32','2026-06-09 22:11:32',NULL);
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-11 20:44:43
