-- MySQL dump 10.13  Distrib 9.7.0, for Win64 (x86_64)
--
-- Host: localhost    Database: vasma_db
-- ------------------------------------------------------
-- Server version	9.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `vasma_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `vasma_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `vasma_db`;

--
-- Table structure for table `actions`
--

DROP TABLE IF EXISTS `actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actions` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_actions_business` (`business_id`),
  CONSTRAINT `fk_actions_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actions`
--

LOCK TABLES `actions` WRITE;
/*!40000 ALTER TABLE `actions` DISABLE KEYS */;
INSERT INTO `actions` VALUES ('4bntalnufxsh','biz_DEMO-TRIAL','Checked',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('frs7dd4kfxsh','biz_DEMO-TRIAL','Changed',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('nn7swi7yulvn','biz_DEMO-TRIAL','Purchased',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('yej9bo62fxsh','biz_DEMO-TRIAL','Replaced',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('zs4c6psofxsh','biz_DEMO-TRIAL','Repaired',1,'2026-05-26 22:09:43','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activation_requests`
--

DROP TABLE IF EXISTS `activation_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activation_requests` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_type` enum('ACTIVATION','EXTENSION','RESET_PASSWORD') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVATION',
  `requested_duration` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_code` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `activation_code` text COLLATE utf8mb4_unicode_ci,
  `status` enum('PENDING','APPROVED','REJECTED','USED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_activation_requests_business` (`business_id`),
  CONSTRAINT `fk_activation_requests_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activation_requests`
--

LOCK TABLES `activation_requests` WRITE;
/*!40000 ALTER TABLE `activation_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `activation_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_settings`
--

DROP TABLE IF EXISTS `app_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `settings_json` json NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_app_settings_scope` (`business_id`,`branch_id`),
  KEY `fk_app_settings_branch` (`branch_id`),
  CONSTRAINT `fk_app_settings_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_app_settings_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_settings`
--

LOCK TABLES `app_settings` WRITE;
/*!40000 ALTER TABLE `app_settings` DISABLE KEYS */;
INSERT INTO `app_settings` VALUES (6,'biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','{\"theme\": \"light\", \"mobile\": \"\", \"appName\": \"VASMA System - Vehicle Auto Service Management System\", \"creator\": \"Bakari Kamanga\", \"language\": \"en\", \"location\": \"\", \"password\": \"\", \"userName\": \"Admin\", \"ownerName\": \"\", \"businessName\": \"Fuad Auto Service\", \"lastUnlockAt\": \"\", \"loginEnabled\": false, \"billPageSetup\": \"compact\", \"businessAdmin\": {\"users\": [{\"id\": \"owner\", \"name\": \"Admin\", \"role\": \"Admin\", \"active\": true, \"mobile\": \"\", \"branchId\": \"main\", \"username\": \"owner\"}], \"branches\": [{\"id\": \"main\", \"code\": \"MAIN\", \"name\": \"Main Branch\", \"active\": true, \"mobile\": \"\", \"location\": \"\"}], \"auditLogs\": [], \"permissions\": {\"User\": [\"dashboard\", \"customers\", \"jobs\", \"confirmation\", \"payments\", \"reports\"], \"Admin\": [\"all\"], \"Supervisor\": [\"dashboard\", \"customers\", \"jobs\", \"confirmation\", \"payments\", \"serviceCards\", \"expenses\", \"reports\", \"analysis\"]}}, \"developerEdits\": {}, \"lockWhenHidden\": false, \"autoLockMinutes\": \"15\", \"developerLayout\": {}, \"enabledServices\": [\"carWash\"], \"serviceAuthCode\": \"VASMA-CARWASH\", \"jobCardPageSetup\": \"compact\", \"receiptPageSetup\": \"compact\", \"developerGraphHeight\": \"390\", \"serviceAuthorization\": {\"code\": \"VASMA-CARWASH\", \"authorizedAt\": \"2026-05-24T21:38:02.951Z\", \"authorizedServices\": [\"carWash\"]}, \"developerCustomBlocks\": {}}','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `app_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `before_json` json DEFAULT NULL,
  `after_json` json DEFAULT NULL,
  `ip_address` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity` (`business_id`,`entity_type`,`entity_id`),
  KEY `fk_audit_logs_branch` (`branch_id`),
  KEY `fk_audit_logs_user` (`user_id`),
  CONSTRAINT `fk_audit_logs_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_audit_logs_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branch_user_permissions`
--

DROP TABLE IF EXISTS `branch_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branch_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `permission_key` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branch_user_permission` (`business_id`,`branch_id`,`user_id`,`permission_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branch_user_permissions`
--

LOCK TABLES `branch_user_permissions` WRITE;
/*!40000 ALTER TABLE `branch_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `branch_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_code` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branch_code` (`business_id`,`branch_code`),
  CONSTRAINT `fk_branches_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES ('branch_DEMO-TRIAL_main','biz_DEMO-TRIAL','MAIN','Main Branch','','','ACTIVE','2026-05-26 19:07:17','2026-05-26 22:09:43'),('branch_VASMA-2-02_main','biz_VASMA-2-02','MAIN','Main Branch','Demo Location','+255 712 000 000','ACTIVE','2026-05-26 20:47:31','2026-05-26 20:47:31');
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_subscriptions`
--

DROP TABLE IF EXISTS `business_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_subscriptions` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('TRIAL','ACTIVE','EXPIRED','SUSPENDED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TRIAL',
  `start_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `branch_limit` int NOT NULL DEFAULT '1',
  `activation_code` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_subscription_status` (`business_id`,`status`,`expiry_date`),
  KEY `fk_business_subscriptions_plan` (`plan_id`),
  CONSTRAINT `fk_business_subscriptions_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_business_subscriptions_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_subscriptions`
--

LOCK TABLES `business_subscriptions` WRITE;
/*!40000 ALTER TABLE `business_subscriptions` DISABLE KEYS */;
INSERT INTO `business_subscriptions` VALUES ('sub_biz_DEMO-TRIAL','biz_DEMO-TRIAL','plan_carwash_general_monthly','ACTIVE','2026-05-26','2026-06-25',1,NULL,'2026-05-26 20:42:53','2026-05-26 20:42:53'),('sub_DEMO-TRIAL','biz_DEMO-TRIAL','plan_full_monthly','TRIAL','2026-05-26','2026-06-09',1,NULL,'2026-05-26 19:07:17','2026-05-26 22:09:43'),('sub_VASMA-2-02','biz_VASMA-2-02','plan_carwash_monthly','TRIAL','2026-05-26','2026-06-25',1,NULL,'2026-05-26 20:47:31','2026-05-26 20:47:31');
/*!40000 ALTER TABLE `business_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_users`
--

DROP TABLE IF EXISTS `business_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `is_default_branch` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_business_user_branch` (`business_id`,`user_id`,`branch_id`),
  KEY `fk_business_users_branch` (`branch_id`),
  KEY `fk_business_users_user` (`user_id`),
  CONSTRAINT `fk_business_users_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_business_users_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_business_users_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_users`
--

LOCK TABLES `business_users` WRITE;
/*!40000 ALTER TABLE `business_users` DISABLE KEYS */;
INSERT INTO `business_users` VALUES (2,'biz_DEMO-TRIAL','branch_DEMO-TRIAL_main',5,'business',1,'2026-05-26 19:07:17'),(10,'biz_VASMA-2-02','branch_VASMA-2-02_main',8,'admin',1,'2026-05-26 20:47:31');
/*!40000 ALTER TABLE `business_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `businesses`
--

DROP TABLE IF EXISTS `businesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `businesses` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_code` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_number` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('TRIAL','ACTIVE','EXPIRED','SUSPENDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TRIAL',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `business_code` (`business_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesses`
--

LOCK TABLES `businesses` WRITE;
/*!40000 ALTER TABLE `businesses` DISABLE KEYS */;
INSERT INTO `businesses` VALUES ('biz_DEMO-TRIAL','DEMO-TRIAL','Fuad Auto Service','Admin','','','00','ACTIVE','2026-05-26 19:07:17','2026-05-26 22:09:43'),('biz_VASMA-2-02','VASMA-2-02','Fuad Auto Service','Demo User','+255 712 000 000','Demo Location','02','TRIAL','2026-05-26 20:47:31','2026-05-26 20:47:31');
/*!40000 ALTER TABLE `businesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commissions`
--

DROP TABLE IF EXISTS `commissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commissions` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commission_date` date NOT NULL,
  `job_card_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attendant_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rate` decimal(14,2) NOT NULL DEFAULT '0.00',
  `amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `status` enum('PENDING','PAID') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PAID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_commissions_business` (`business_id`),
  KEY `fk_commissions_branch` (`branch_id`),
  KEY `fk_commissions_job` (`job_card_id`),
  KEY `fk_commissions_attendant` (`attendant_id`),
  CONSTRAINT `fk_commissions_attendant` FOREIGN KEY (`attendant_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_commissions_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_commissions_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_commissions_job` FOREIGN KEY (`job_card_id`) REFERENCES `job_cards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commissions`
--

LOCK TABLES `commissions` WRITE;
/*!40000 ALTER TABLE `commissions` DISABLE KEYS */;
INSERT INTO `commissions` VALUES ('3uge0ktlolzi','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','2026-05-19','ajupc1eckvkz','v5xdphm389l3','Percent',35.00,17500.00,'PAID','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('jl5t32o7kz2l','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','2026-05-19','mgyh85cvfxx6','bvyllici89l3','Amount',3000.00,3000.00,'PAID','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('nnsdl2e1fln7','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','2026-05-19','fubhsb17dy0o','qmmbacra89l3','Percent',35.00,34300.00,'PAID','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('skst82jmhzsw','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','2026-05-20','x7l6c7fgd00x','qmmbacra89l3','Percent',45.00,9000.00,'PAID','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `commissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_model` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customers_vehicle` (`business_id`,`vehicle`),
  KEY `fk_customers_branch` (`branch_id`),
  CONSTRAINT `fk_customers_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_customers_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES ('8dfxtrus89l3','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','Bakari Kamanga','T 194 DQG','Mitsubishi Pickup','Bakari Kamanga','+255 712 000 000',1,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('ukw750hseigq','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','Fuad ','T 320 AAA','Toyota Corolla','Fuad Salum','073 815 181',1,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_employees_business` (`business_id`),
  KEY `fk_employees_branch` (`branch_id`),
  CONSTRAINT `fk_employees_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_employees_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES ('bvyllici89l3','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','Neema John','+255 714 222 222','Attendant',1,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('qmmbacra89l3','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','Juma Said','+255 713 111 111','Attendant',1,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('v5xdphm389l3','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','Peter Joseph','+255 715 333 333','Supervisor',1,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_categories`
--

DROP TABLE IF EXISTS `expense_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_categories` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_expense_categories_business` (`business_id`),
  CONSTRAINT `fk_expense_categories_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_categories`
--

LOCK TABLES `expense_categories` WRITE;
/*!40000 ALTER TABLE `expense_categories` DISABLE KEYS */;
INSERT INTO `expense_categories` VALUES ('3j3vd5ph89l3','biz_DEMO-TRIAL','Rent',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('3kpfy0sb89l3','biz_DEMO-TRIAL','Maintenance',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('565mkvjg89l3','biz_DEMO-TRIAL','Salaries',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('asxaf05i89l3','biz_DEMO-TRIAL','Consumables',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('expcat_biz_DEMO-TRIAL_Utilities','biz_DEMO-TRIAL','Utilities',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('lxj4rg4489l3','biz_DEMO-TRIAL','Transport',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('x4u5ivag89l3','biz_DEMO-TRIAL','Utilities',1,'2026-05-26 22:09:43','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `expense_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_items`
--

DROP TABLE IF EXISTS `expense_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_items` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expense_category_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_expense_items_business` (`business_id`),
  KEY `fk_expense_items_category` (`expense_category_id`),
  CONSTRAINT `fk_expense_items_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_expense_items_category` FOREIGN KEY (`expense_category_id`) REFERENCES `expense_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_items`
--

LOCK TABLES `expense_items` WRITE;
/*!40000 ALTER TABLE `expense_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `expense_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expense_date` date NOT NULL,
  `expense_category_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expense_item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_expenses_date` (`business_id`,`branch_id`,`expense_date`),
  KEY `fk_expenses_branch` (`branch_id`),
  KEY `fk_expenses_category` (`expense_category_id`),
  KEY `fk_expenses_created_by` (`created_by`),
  CONSTRAINT `fk_expenses_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expenses_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_expenses_category` FOREIGN KEY (`expense_category_id`) REFERENCES `expense_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_expenses_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES ('2cpklqotye57','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','2026-05-22','expcat_biz_DEMO-TRIAL_Utilities','Maji',3000.00,'',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('abd02ybtxza0','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','2026-05-22','expcat_biz_DEMO-TRIAL_Utilities','Umeme',20000.00,'',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_card_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_ref` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_date` date NOT NULL,
  `total_amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `paid_amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `status` enum('UNPAID','PARTIAL','PAID','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNPAID',
  `qr_payload` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invoice_ref` (`business_id`,`invoice_ref`),
  KEY `fk_invoices_branch` (`branch_id`),
  KEY `fk_invoices_job` (`job_card_id`),
  CONSTRAINT `fk_invoices_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_invoices_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invoices_job` FOREIGN KEY (`job_card_id`) REFERENCES `job_cards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES ('inv_ajupc1eckvkz','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','ajupc1eckvkz','INV-JC000003','2026-05-19',50000.00,50000.00,'PAID','{\"ref\":\"JC-000003\",\"total\":50000,\"paid\":50000,\"paymentStatus\":\"PAID\"}','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('inv_es69qe6kj39y','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','es69qe6kj39y','INV-JC000007','2026-05-24',25000.00,0.00,'UNPAID','{\"ref\":\"JC-000007\",\"total\":25000,\"paid\":0,\"paymentStatus\":\"UNPAID\"}','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('inv_fubhsb17dy0o','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','fubhsb17dy0o','INV-JC000001','2026-05-19',98000.00,98000.00,'PAID','{\"ref\":\"JC-000001\",\"total\":98000,\"paid\":98000,\"paymentStatus\":\"PAID\"}','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('inv_mgyh85cvfxx6','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','mgyh85cvfxx6','INV-JC000002','2026-05-19',10000.00,10000.00,'PAID','{\"ref\":\"JC-000002\",\"total\":10000,\"paid\":10000,\"paymentStatus\":\"PAID\"}','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('inv_nfgvld85q5oj','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','nfgvld85q5oj','INV-JC000006','2026-05-24',10000.00,0.00,'UNPAID','{\"ref\":\"JC-000006\",\"total\":10000,\"paid\":0,\"paymentStatus\":\"UNPAID\"}','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('inv_q3ucbb0uwgvp','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','q3ucbb0uwgvp','INV-JC000005','2026-05-24',10000.00,10000.00,'PAID','{\"ref\":\"JC-000005\",\"total\":10000,\"paid\":10000,\"paymentStatus\":\"PAID\"}','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('inv_x7l6c7fgd00x','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','x7l6c7fgd00x','INV-JC000004','2026-05-20',20000.00,20000.00,'PAID','{\"ref\":\"JC-000004\",\"total\":20000,\"paid\":20000,\"paymentStatus\":\"PAID\"}','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_card_item_sub_items`
--

DROP TABLE IF EXISTS `job_card_item_sub_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_card_item_sub_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `job_card_item_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sub_item_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `done` tinyint(1) NOT NULL DEFAULT '0',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_job_card_item_subs_item` (`job_card_item_id`),
  KEY `fk_job_card_item_subs_sub_item` (`sub_item_id`),
  CONSTRAINT `fk_job_card_item_subs_item` FOREIGN KEY (`job_card_item_id`) REFERENCES `job_card_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_job_card_item_subs_sub_item` FOREIGN KEY (`sub_item_id`) REFERENCES `service_sub_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_card_item_sub_items`
--

LOCK TABLES `job_card_item_sub_items` WRITE;
/*!40000 ALTER TABLE `job_card_item_sub_items` DISABLE KEYS */;
INSERT INTO `job_card_item_sub_items` VALUES (14,'keteex3thon3','yya098kzq450','Exterior body wash',0,'','2026-05-26 22:09:43'),(15,'keteex3thon3','n6mip7jlq450','Interior cleaning',0,'','2026-05-26 22:09:43'),(16,'keteex3thon3','sbv1hf72q450','Vacuum cleaning',0,'','2026-05-26 22:09:43'),(17,'keteex3thon3','7tiu2l1tq450','Tyre cleaning',0,'','2026-05-26 22:09:43'),(18,'keteex3thon3','eaozusleq450','Dashboard polish',0,'','2026-05-26 22:09:43'),(19,'keteex3thon3','czit7e0hq450','Tyre shine',0,'','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `job_card_item_sub_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_card_items`
--

DROP TABLE IF EXISTS `job_card_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_card_items` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_card_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_item_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attendant_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_job_card_items_job` (`job_card_id`),
  KEY `fk_job_card_items_category` (`category_id`),
  KEY `fk_job_card_items_service` (`service_item_id`),
  KEY `fk_job_card_items_attendant` (`attendant_id`),
  CONSTRAINT `fk_job_card_items_attendant` FOREIGN KEY (`attendant_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_job_card_items_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_job_card_items_job` FOREIGN KEY (`job_card_id`) REFERENCES `job_cards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_job_card_items_service` FOREIGN KEY (`service_item_id`) REFERENCES `service_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_card_items`
--

LOCK TABLES `job_card_items` WRITE;
/*!40000 ALTER TABLE `job_card_items` DISABLE KEYS */;
INSERT INTO `job_card_items` VALUES ('6ymwwoqjprc9','nfgvld85q5oj','svc_carwash','kcpom5l789l3','bvyllici89l3','Checked','Checked',1,10000.00,'','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('a5fo1177birl','x7l6c7fgd00x','svc_carwash','kcpom5l789l3','qmmbacra89l3','Checked','Checked',1,10000.00,'','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('d5r5lnx3c773','x7l6c7fgd00x','svc_carwash','og3gzyao89l3','qmmbacra89l3','Checked','Checked',1,10000.00,'','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('hzcxo1lbjip2','ajupc1eckvkz','svc_general','oq04287889l3','bvyllici89l3','','',0,50000.00,'','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('iztx8f6lv00k','q3ucbb0uwgvp','svc_carwash','kcpom5l789l3','qmmbacra89l3','','',0,10000.00,'','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('keteex3thon3','es69qe6kj39y','svc_carwash','0ndqfpg789l3','qmmbacra89l3','','',0,25000.00,'','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('lbxsfqzmdk7k','fubhsb17dy0o','svc_tire','item_test_puncture','qmmbacra89l3','','',0,50000.00,'','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('q0buofkqepxq','mgyh85cvfxx6','svc_carwash','0ndqfpg789l3','v5xdphm389l3','','',0,10000.00,'','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `job_card_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_cards`
--

DROP TABLE IF EXISTS `job_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_cards` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ref` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_ref` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_date` date NOT NULL,
  `mileage` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `confirmation_status` enum('PENDING','CONFIRMED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `payment_status` enum('UNPAID','PARTIAL','PAID') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNPAID',
  `service_card_json` json DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_job_ref` (`business_id`,`ref`),
  KEY `idx_job_cards_date` (`business_id`,`branch_id`,`job_date`),
  KEY `fk_job_cards_branch` (`branch_id`),
  KEY `fk_job_cards_customer` (`customer_id`),
  KEY `fk_job_cards_created_by` (`created_by`),
  CONSTRAINT `fk_job_cards_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_job_cards_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_job_cards_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_job_cards_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_cards`
--

LOCK TABLES `job_cards` WRITE;
/*!40000 ALTER TABLE `job_cards` DISABLE KEYS */;
INSERT INTO `job_cards` VALUES ('ajupc1eckvkz','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','8dfxtrus89l3','JC-000003','INV-JC000003','2026-05-19','85000','','PENDING','PAID','{\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('es69qe6kj39y','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','8dfxtrus89l3','JC-000007','INV-JC000007','2026-05-24','','','PENDING','UNPAID','{\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('fubhsb17dy0o','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','8dfxtrus89l3','JC-000001','INV-JC000001','2026-05-19','','','PENDING','PAID','{\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('mgyh85cvfxx6','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','ukw750hseigq','JC-000002','INV-JC000002','2026-05-19','','','PENDING','PAID','{\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('nfgvld85q5oj','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','ukw750hseigq','JC-000006','INV-JC000006','2026-05-24','','','CONFIRMED','UNPAID','{\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('q3ucbb0uwgvp','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','8dfxtrus89l3','JC-000005','INV-JC000005','2026-05-24','','','PENDING','PAID','{\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('x7l6c7fgd00x','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','8dfxtrus89l3','JC-000004','INV-JC000004','2026-05-20','','','CONFIRMED','PAID','{\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `job_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `landing_pages`
--

DROP TABLE IF EXISTS `landing_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `landing_pages` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content_json` json DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `landing_pages`
--

LOCK TABLES `landing_pages` WRITE;
/*!40000 ALTER TABLE `landing_pages` DISABLE KEYS */;
INSERT INTO `landing_pages` VALUES ('landing_main','home','VASMA System','Vehicle Auto Service Management System','{\"cta\": \"Choose package and register your business\", \"theme\": \"default\"}',1,'2026-05-26 20:30:08','2026-05-26 20:30:08');
/*!40000 ALTER TABLE `landing_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `licenses`
--

DROP TABLE IF EXISTS `licenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `licenses` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_type` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activation_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `status` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activation_code` text COLLATE utf8mb4_unicode_ci,
  `request_code` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_license_device` (`device_id`),
  KEY `fk_licenses_business` (`business_id`),
  CONSTRAINT `fk_licenses_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `licenses`
--

LOCK TABLES `licenses` WRITE;
/*!40000 ALTER TABLE `licenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `licenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_features`
--

DROP TABLE IF EXISTS `package_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package_features` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `plan_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `feature_key` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `feature_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_package_feature` (`plan_id`,`feature_key`),
  CONSTRAINT `fk_package_features_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_features`
--

LOCK TABLES `package_features` WRITE;
/*!40000 ALTER TABLE `package_features` DISABLE KEYS */;
/*!40000 ALTER TABLE `package_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `services` text COLLATE utf8mb4_unicode_ci,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_packages_business` (`business_id`),
  CONSTRAINT `fk_packages_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES ('1d1bnepj89l3','biz_DEMO-TRIAL','Full Wash','Body wash + interior cleaning + vacuum + tyre cleaning',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('2pqx4vmb89l3','biz_DEMO-TRIAL','Standard Wash','Body wash + kusafisha ndani kwa kawaida',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('2vozfq8k89l3','biz_DEMO-TRIAL','Complete Detailing','Full wash + interior deep cleaning + polish + tyre shine',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('ec85copc89l3','biz_DEMO-TRIAL','Basic Wash','Kuosha body ya nje tu',1,'2026-05-26 22:09:43','2026-05-26 22:09:43'),('t83ydq7189l3','biz_DEMO-TRIAL','Premium Wash','Full wash + dashboard polish + tyre shine',1,'2026-05-26 22:09:43','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_requests`
--

DROP TABLE IF EXISTS `password_reset_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_requests` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `device_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `reset_code` text COLLATE utf8mb4_unicode_ci,
  `status` enum('PENDING','APPROVED','USED','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_password_reset_business` (`business_id`),
  KEY `fk_password_reset_user` (`user_id`),
  CONSTRAINT `fk_password_reset_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_requests`
--

LOCK TABLES `password_reset_requests` WRITE;
/*!40000 ALTER TABLE `password_reset_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_items`
--

DROP TABLE IF EXISTS `payment_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_items` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_card_item_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchased_item_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_payment_items_payment` (`payment_id`),
  KEY `fk_payment_items_job_item` (`job_card_item_id`),
  KEY `fk_payment_items_purchase` (`purchased_item_id`),
  CONSTRAINT `fk_payment_items_job_item` FOREIGN KEY (`job_card_item_id`) REFERENCES `job_card_items` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_payment_items_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payment_items_purchase` FOREIGN KEY (`purchased_item_id`) REFERENCES `purchased_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_items`
--

LOCK TABLES `payment_items` WRITE;
/*!40000 ALTER TABLE `payment_items` DISABLE KEYS */;
INSERT INTO `payment_items` VALUES ('0jatgvl4gxak_a5fo1177birl','0jatgvl4gxak','a5fo1177birl',NULL,'a5fo1177birl',10000.00,'2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('0jatgvl4gxak_d5r5lnx3c773','0jatgvl4gxak','d5r5lnx3c773',NULL,'d5r5lnx3c773',10000.00,'2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('65kgyidyxw0z_iztx8f6lv00k','65kgyidyxw0z','iztx8f6lv00k',NULL,'iztx8f6lv00k',10000.00,'2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('fotw4tn3o08t_hzcxo1lbjip2','fotw4tn3o08t','hzcxo1lbjip2',NULL,'hzcxo1lbjip2',50000.00,'2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('m8qqqrozj33o_q0buofkqepxq','m8qqqrozj33o','q0buofkqepxq',NULL,'q0buofkqepxq',10000.00,'2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('op0dl0znn8br_4l6bcaemjsza','op0dl0znn8br',NULL,'4l6bcaemjsza','4l6bcaemjsza',48000.00,'2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('op0dl0znn8br_lbxsfqzmdk7k','op0dl0znn8br','lbxsfqzmdk7k',NULL,'lbxsfqzmdk7k',50000.00,'2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `payment_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `method_name` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_number` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES ('paymethod_bank','Bank Transfer','','','Enter bank account details and payment reference instructions.',1,3,'2026-05-26 20:30:08','2026-05-26 20:30:08'),('paymethod_cash','Cash','','','Cash payment received by VASMA admin.',1,1,'2026-05-26 20:30:08','2026-05-26 20:30:08'),('paymethod_mobile_money','Mobile Money','','','Enter mobile money receiving number and payment instructions.',1,2,'2026-05-26 20:30:08','2026-05-26 20:30:08');
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_card_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ref` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_date` date NOT NULL,
  `method` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `comment` text COLLATE utf8mb4_unicode_ci,
  `attachment_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payment_ref` (`business_id`,`ref`),
  KEY `fk_payments_branch` (`branch_id`),
  KEY `fk_payments_job` (`job_card_id`),
  KEY `fk_payments_invoice` (`invoice_id`),
  KEY `fk_payments_created_by` (`created_by`),
  CONSTRAINT `fk_payments_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_payments_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_payments_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_payments_job` FOREIGN KEY (`job_card_id`) REFERENCES `job_cards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES ('0jatgvl4gxak','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','x7l6c7fgd00x','inv_x7l6c7fgd00x','RCPT-JC000004','2026-05-20','Cash',20000.00,'','',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('65kgyidyxw0z','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','q3ucbb0uwgvp','inv_q3ucbb0uwgvp','RCPT-JC000005','2026-05-24','Cash',10000.00,'','',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('fotw4tn3o08t','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','ajupc1eckvkz','inv_ajupc1eckvkz','RCPT-JC000003','2026-05-19','Cash',50000.00,'','',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('m8qqqrozj33o','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','mgyh85cvfxx6','inv_mgyh85cvfxx6','RCPT-JC000002','2026-05-19','Cash',10000.00,'','',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('op0dl0znn8br','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','fubhsb17dy0o','inv_fubhsb17dy0o','RCPT-JC000001','2026-05-19','Cash',98000.00,'','',5,'2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchased_items`
--

DROP TABLE IF EXISTS `purchased_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchased_items` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_card_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_item_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` decimal(14,2) NOT NULL DEFAULT '0.00',
  `unit_cost` decimal(14,2) NOT NULL DEFAULT '0.00',
  `amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `status` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_purchased_items_job` (`job_card_id`),
  KEY `fk_purchased_items_category` (`category_id`),
  KEY `fk_purchased_items_service` (`service_item_id`),
  CONSTRAINT `fk_purchased_items_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_purchased_items_job` FOREIGN KEY (`job_card_id`) REFERENCES `job_cards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_purchased_items_service` FOREIGN KEY (`service_item_id`) REFERENCES `service_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchased_items`
--

LOCK TABLES `purchased_items` WRITE;
/*!40000 ALTER TABLE `purchased_items` DISABLE KEYS */;
INSERT INTO `purchased_items` VALUES ('4l6bcaemjsza','fubhsb17dy0o',NULL,NULL,'Engine Oil - TAR 7000 SAE 15W/40','Ltrs',4.00,12000.00,48000.00,'','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `purchased_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipts`
--

DROP TABLE IF EXISTS `receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receipts` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receipt_ref` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receipt_date` date NOT NULL,
  `amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `qr_payload` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_receipt_ref` (`business_id`,`receipt_ref`),
  KEY `fk_receipts_branch` (`branch_id`),
  KEY `fk_receipts_payment` (`payment_id`),
  CONSTRAINT `fk_receipts_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_receipts_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_receipts_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipts`
--

LOCK TABLES `receipts` WRITE;
/*!40000 ALTER TABLE `receipts` DISABLE KEYS */;
INSERT INTO `receipts` VALUES ('rcpt_0jatgvl4gxak','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','0jatgvl4gxak','RCPT-JC000004','2026-05-20',20000.00,'{\"ref\":\"RCPT-JC000004\",\"amount\":20000}','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('rcpt_65kgyidyxw0z','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','65kgyidyxw0z','RCPT-JC000005','2026-05-24',10000.00,'{\"ref\":\"RCPT-JC000005\",\"amount\":10000}','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('rcpt_fotw4tn3o08t','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','fotw4tn3o08t','RCPT-JC000003','2026-05-19',50000.00,'{\"ref\":\"RCPT-JC000003\",\"amount\":50000}','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('rcpt_m8qqqrozj33o','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','m8qqqrozj33o','RCPT-JC000002','2026-05-19',10000.00,'{\"ref\":\"RCPT-JC000002\",\"amount\":10000}','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('rcpt_op0dl0znn8br','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','op0dl0znn8br','RCPT-JC000001','2026-05-19',98000.00,'{\"ref\":\"RCPT-JC000001\",\"amount\":98000}','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_key` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_key` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_role_permission` (`role_key`,`permission_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_key` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_name` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_key` (`role_key`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (2,'admin','Admin','Business administration and reports','2026-05-26 19:30:21'),(3,'supervisor','Supervisor','Branch and operational supervision','2026-05-26 19:30:21'),(4,'user','User','Standard transaction user','2026-05-26 19:30:21');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_card_items`
--

DROP TABLE IF EXISTS `service_card_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_card_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `service_card_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `done` tinyint(1) NOT NULL DEFAULT '0',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_service_card_items_card` (`service_card_id`),
  CONSTRAINT `fk_service_card_items_card` FOREIGN KEY (`service_card_id`) REFERENCES `service_cards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_card_items`
--

LOCK TABLES `service_card_items` WRITE;
/*!40000 ALTER TABLE `service_card_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_card_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_cards`
--

DROP TABLE IF EXISTS `service_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_cards` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_card_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_mileage` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `next_service_mileage` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `next_service_date` date DEFAULT NULL,
  `service_interval_comment` text COLLATE utf8mb4_unicode_ci,
  `attended_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sync_status` enum('PENDING','SYNCED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYNCED',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_service_cards_business` (`business_id`),
  KEY `fk_service_cards_branch` (`branch_id`),
  KEY `fk_service_cards_job` (`job_card_id`),
  CONSTRAINT `fk_service_cards_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_service_cards_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_service_cards_job` FOREIGN KEY (`job_card_id`) REFERENCES `job_cards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_cards`
--

LOCK TABLES `service_cards` WRITE;
/*!40000 ALTER TABLE `service_cards` DISABLE KEYS */;
INSERT INTO `service_cards` VALUES ('svc_card_ajupc1eckvkz','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','ajupc1eckvkz','85000','',NULL,'','','','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('svc_card_es69qe6kj39y','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','es69qe6kj39y','','',NULL,'','','','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('svc_card_fubhsb17dy0o','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','fubhsb17dy0o','','',NULL,'','','','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('svc_card_mgyh85cvfxx6','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','mgyh85cvfxx6','','',NULL,'','','','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('svc_card_nfgvld85q5oj','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','nfgvld85q5oj','','',NULL,'','','','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('svc_card_q3ucbb0uwgvp','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','q3ucbb0uwgvp','','',NULL,'','','','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43'),('svc_card_x7l6c7fgd00x','biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','x7l6c7fgd00x','','',NULL,'','','','2026-05-26 22:09:43','2026-05-26 22:09:43','SYNCED','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `service_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_categories`
--

DROP TABLE IF EXISTS `service_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_categories` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `service_key` (`service_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_categories`
--

LOCK TABLES `service_categories` WRITE;
/*!40000 ALTER TABLE `service_categories` DISABLE KEYS */;
INSERT INTO `service_categories` VALUES ('svc_carwash','carWash','Car Wash',1,'2026-05-26 18:44:57','2026-05-26 22:09:43'),('svc_general','general','General Service',1,'2026-05-26 18:44:57','2026-05-26 22:09:43'),('svc_tire','tire','Tire Service',1,'2026-05-26 18:44:57','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `service_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_items`
--

DROP TABLE IF EXISTS `service_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_items` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `default_amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_service_item` (`category_id`,`name`),
  CONSTRAINT `fk_service_items_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_items`
--

LOCK TABLES `service_items` WRITE;
/*!40000 ALTER TABLE `service_items` DISABLE KEYS */;
INSERT INTO `service_items` VALUES ('0hsz87t589l3','svc_tire','Tire Fitting / Replacement',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('0ndqfpg789l3','svc_carwash','Full Wash',0.00,1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('141gp7n789l3','svc_general','Fuel Filter Replacement',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('18lbckan89l3','svc_tire','Valve Replacement',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('1favjj7c89l3','svc_tire','Tire Pressure Adjustment',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('4rschjfd89l3','svc_tire','Tube Replacement',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('9orjohj989l3','svc_carwash','Interior Deep Cleaning',0.00,1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('9petf3qn89l3','svc_carwash','Premium Wash',0.00,1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('ab00owpi89l3','svc_general','Spark Plug Replacement',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('c9yijr1g89l3','svc_general','Oil Filter Replacement',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('cz0vq8rw89l3','svc_general','Cabin / AC Filter Replacement',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('dtaac3wt89l3','svc_carwash','Standard Wash',0.00,1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('flpvvtci89l3','svc_general','Brake Inspection & Adjustment',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('fn9wdby289l3','svc_general','Differential Oil Change',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('fxbmx7r689l3','svc_tire','Wheel Balancing',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('gh1a7b3f89l3','svc_general','Power Steering Fluid Top-up / Change',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('item_test_puncture','svc_tire','Puncture Repair',0.00,1,'2026-05-26 19:01:44','2026-05-26 22:09:43'),('iynyq2y389l3','svc_carwash','Engine Wash',0.00,1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('izpqsvlh89l3','svc_general','Air Filter Replacement',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('j0p4liw089l3','svc_carwash','Complete Detailing',0.00,1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('kcpom5l789l3','svc_carwash','Basic Wash',0.00,1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('kvzdfahe89l3','svc_tire','Tire Rotation',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('lg6z7som89l3','svc_carwash','Motorcycle Wash',0.00,1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('ll3n8uso89l3','svc_general','Coolant Top-up / Change',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('lvfhgyjp89l3','svc_general','Brake Fluid Top-up / Change',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('m1at1g7i89l3','svc_general','Service Labour Charge',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('n3avvqb089l3','svc_general','Gear Oil Change',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('og3gzyao89l3','svc_carwash','Seat Cleaning Package',0.00,1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('oq04287889l3','svc_general','Engine Oil Change',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('r6n71wi389l3','svc_tire','Rim Cleaning',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('says77ev89l3','svc_general','General Vehicle Inspection',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('t2vqdg9j89l3','svc_tire','Wheel Alignment',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('um4jash989l3','svc_carwash','Body Polish / Waxing',0.00,1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('vzvq6f2l89l3','svc_general','Air Filter Cleaning',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('wcnphqn789l3','svc_carwash','Underbody Wash',0.00,1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('wmolvks889l3','svc_general','Battery Terminal Cleaning',0.00,1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('zbcjogrz89l3','svc_carwash','Carpet / Floor Mat Cleaning',0.00,1,'2026-05-26 19:10:54','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `service_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_sub_items`
--

DROP TABLE IF EXISTS `service_sub_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_sub_items` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_item_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_service_sub_item` (`service_item_id`,`name`),
  CONSTRAINT `fk_service_sub_items_item` FOREIGN KEY (`service_item_id`) REFERENCES `service_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_sub_items`
--

LOCK TABLES `service_sub_items` WRITE;
/*!40000 ALTER TABLE `service_sub_items` DISABLE KEYS */;
INSERT INTO `service_sub_items` VALUES ('01a2wkraq44z','4rschjfd89l3','Repair / replace',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('028dhnjrq450','1favjj7c89l3','Repair / replace',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('047cld3tq450','1favjj7c89l3','Remove wheel',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('09n9vsn6q450','r6n71wi389l3','Fit wheel',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('0z2c7e7nq44z','4rschjfd89l3','Inflate pressure',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('0z5c3f5aq44z','18lbckan89l3','Leak test',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('11jzpg6lq450','fn9wdby289l3','Inspect vehicle',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('12ncn0hhq450','izpqsvlh89l3','Fit new air filter',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('14ugjvqoq44z','item_test_puncture','Fit wheel',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('1g9gjfacq44z','18lbckan89l3','Remove valve',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('1i8eeoqrq450','lvfhgyjp89l3','Inspect brakes',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('1tf3wtxkq450','dtaac3wt89l3','Exterior body wash',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('1u15nilbq450','iynyq2y389l3','Engine bay wash',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('1ukkxlocq450','ll3n8uso89l3','Test and verify',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('22ezteh3q44z','0hsz87t589l3','Remove wheel',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('2mc9fefpq450','fn9wdby289l3','Test and verify',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('3d030ufmq450','j0p4liw089l3','Dashboard polish',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('3ex6zbhxq450','j0p4liw089l3','Tyre shine',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('3ff5189dq44z','0hsz87t589l3','Inflate pressure',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('3msmv3q5q450','og3gzyao89l3','Interior cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('3sl5g6t6q450','c9yijr1g89l3','Remove old oil filter',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('3uji1kwjq450','kvzdfahe89l3','Inflate pressure',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('3ur1r2pyq450','flpvvtci89l3','Lights check',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('3wfg0gzeq450','j0p4liw089l3','Carpet cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('3wgm4hveq450','zbcjogrz89l3','Vacuum cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('48pv3z73q450','fxbmx7r689l3','Road check',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('4bl8y8uaq450','lg6z7som89l3','Exterior body wash',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('4la9fwgtq450','m1at1g7i89l3','Inspect vehicle',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('5dsfx0fsq450','oq04287889l3','Replace engine oil',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('5g1cmvvfq450','9orjohj989l3','Seat cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('5rov6ssdq450','fxbmx7r689l3','Fit wheel',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('5ya63dcfq450','ab00owpi89l3','Perform service',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('6cih8122q450','9orjohj989l3','Tyre cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('6i9r4cwvq450','n3avvqb089l3','Test and verify',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('6j60i4f0q450','r6n71wi389l3','Repair / replace',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('6lgu07yvq44z','item_test_puncture','Repair / replace',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('724duq8gq450','n3avvqb089l3','Inspect vehicle',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('75w23eihq450','wcnphqn789l3','Chassis rinse',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('7ssn2u7rq450','iynyq2y389l3','Engine degreasing',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('7tiu2l1tq450','0ndqfpg789l3','Tyre cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('7wd8lkk7q450','og3gzyao89l3','Seat cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('83cwofz3q450','9orjohj989l3','Exterior body wash',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('8clvhrd7q450','wmolvks889l3','Clean terminals',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('8ezw1w22q450','1favjj7c89l3','Fit wheel',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('8h5hzgm7q450','fxbmx7r689l3','Remove wheel',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('8xkv47d6q450','9orjohj989l3','Interior cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('910p7pb4q450','kcpom5l789l3','Tyre cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('95r0pj06q450','um4jash989l3','Interior cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('9k0j8yq7q450','lg6z7som89l3','Interior cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('9kijqzmwq450','oq04287889l3','Check oil level',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('9sox1466q450','gh1a7b3f89l3','Inspect vehicle',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('9zcmadn9q44z','4rschjfd89l3','Fit wheel',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('a96tlxk2q450','og3gzyao89l3','Vacuum cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('aiyvl0h9q450','9petf3qn89l3','Vacuum cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('aqsbz5neq450','9petf3qn89l3','Tyre cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('av0hb1jmq450','ll3n8uso89l3','Perform service',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('b8hqudiiq450','vzvq6f2l89l3','Clean air filter',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('bdukqub5q450','ab00owpi89l3','Test and verify',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('bhvzlnd2q450','og3gzyao89l3','Carpet cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('byw37gghq450','j0p4liw089l3','Vacuum cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('c100pkjxq450','flpvvtci89l3','Road test',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('cgnilublq450','kvzdfahe89l3','Inspect tyre positions',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('co0aeh7wq450','zbcjogrz89l3','Tyre cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('cq4e060wq450','wmolvks889l3','Tighten terminals',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('czit7e0hq450','0ndqfpg789l3','Tyre shine',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('d6s26vrjq450','r6n71wi389l3','Remove wheel',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('d7ozrdf8q450','m1at1g7i89l3','Perform service',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('de3ouq71q450','j0p4liw089l3','Body polish',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('dv3vn8eoq450','kcpom5l789l3','Interior cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('e6gdh1baq44z','18lbckan89l3','Fit new valve',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('e80z3uhnq450','c9yijr1g89l3','Fit new oil filter',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('eaozusleq450','0ndqfpg789l3','Dashboard polish',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('fnqpjzo1q450','9orjohj989l3','Vacuum cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('fpuckygjq450','j0p4liw089l3','Interior cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('fu1na0jhq450','says77ev89l3','Lights check',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('fyatcuv9q44z','item_test_puncture','Remove wheel',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('gm99970oq450','t2vqdg9j89l3','Adjust alignment',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('gqkkiy2mq450','um4jash989l3','Exterior body wash',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('grisu0j4q450','fxbmx7r689l3','Balance wheel',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('gubtjh3eq450','1favjj7c89l3','Inflate pressure',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('h04rnd99q450','t2vqdg9j89l3','Inspect alignment',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('i466ngdwq450','ab00owpi89l3','Inspect vehicle',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('ivdm5k5fq450','gh1a7b3f89l3','Test and verify',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('j4886dghq450','141gp7n789l3','Remove fuel filter',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('jrx5wlwcq450','9petf3qn89l3','Exterior body wash',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('k1l9cd7gq450','9petf3qn89l3','Tyre shine',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('ky2tlqgsq450','fn9wdby289l3','Perform service',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('l11g8e0mq44z','0hsz87t589l3','Fit wheel',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('l3g2v1q9q450','c9yijr1g89l3','Leak check',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('l4zjj7e5q450','kcpom5l789l3','Exterior body wash',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('lb7luu8pq450','izpqsvlh89l3','Remove air filter',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('lnb28abmq450','flpvvtci89l3','Brake check',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('mbqv5oimq44z','0hsz87t589l3','Repair / replace',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('n42t3qawq450','um4jash989l3','Tyre cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('n6mip7jlq450','0ndqfpg789l3','Interior cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('n7cu888xq44z','4rschjfd89l3','Remove wheel',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('nonawrabq450','says77ev89l3','Engine check',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('nvqa1lnbq450','j0p4liw089l3','Tyre cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('o137czs6q44z','item_test_puncture','Inflate pressure',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('oe8l7r5sq450','141gp7n789l3','Fit new fuel filter',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('ohwgu1l3q450','zbcjogrz89l3','Exterior body wash',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('p1r7gxmxq450','izpqsvlh89l3','Recheck fitting',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('p8p9qx3sq450','says77ev89l3','Fluid level check',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('p91tbbyaq450','zbcjogrz89l3','Carpet cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('pkmqaohqq450','oq04287889l3','Drain old oil',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('pww9t092q450','9petf3qn89l3','Dashboard polish',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('pyshm4ncq450','lg6z7som89l3','Tyre cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('qgqumt3hq450','gh1a7b3f89l3','Perform service',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('r0lz5u9cq450','cz0vq8rw89l3','Perform service',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('rm0gcfi4q450','kcpom5l789l3','Vacuum cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('rx5n5agwq450','og3gzyao89l3','Exterior body wash',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('rxfhuwmrq450','dtaac3wt89l3','Interior cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('rxrwiuz8q450','9orjohj989l3','Carpet cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('s4drl81qq450','lvfhgyjp89l3','Adjust / service brakes',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('s6ptha18q450','um4jash989l3','Body polish',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('s7as3pshq450','flpvvtci89l3','Fluid level check',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('sbv1hf72q450','0ndqfpg789l3','Vacuum cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('ssdeacebq450','r6n71wi389l3','Inflate pressure',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('sub_test_inspect','item_test_puncture','Inspect tyre',1,'2026-05-26 19:01:44','2026-05-26 22:09:43'),('tbbg26paq450','lvfhgyjp89l3','Road test',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('tf0nj2tiq450','iynyq2y389l3','Final engine wipe',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('tljpiq63q450','says77ev89l3','Brake check',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('trp3rlolq450','t2vqdg9j89l3','Road test',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('twtwwwejq450','vzvq6f2l89l3','Recheck fitting',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('uisx8eqmq450','m1at1g7i89l3','Test and verify',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('ulkojw7eq450','wcnphqn789l3','Underbody wash',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('umuq86niq450','flpvvtci89l3','Engine check',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('ush6k9nuq450','kvzdfahe89l3','Rotate tyres',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('uuelpzc3q450','ll3n8uso89l3','Inspect vehicle',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('uuglylklq450','um4jash989l3','Waxing',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('v4qsv1wsq450','dtaac3wt89l3','Tyre cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('vq486wqfq450','j0p4liw089l3','Waxing',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('vspvd8djq450','says77ev89l3','Road test',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('vv9npmhsq450','1favjj7c89l3','Inspect tyre',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('w350j7acq450','zbcjogrz89l3','Seat cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('wrgs81dqq450','j0p4liw089l3','Exterior body wash',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('wu4k3dhbq450','og3gzyao89l3','Tyre cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('x6kxmlbxq450','141gp7n789l3','Leak check',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('x6nfx1qnq450','r6n71wi389l3','Inspect tyre',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('xgakf6j7q450','um4jash989l3','Vacuum cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('xkoamzwcq44z','0hsz87t589l3','Inspect tyre',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('xmgnjtqqq450','wcnphqn789l3','Mud removal',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('xnwq57kzq44z','4rschjfd89l3','Inspect tyre',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('xomlamzvq450','zbcjogrz89l3','Interior cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('xzjf4zosq450','dtaac3wt89l3','Vacuum cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('yinqdsedq450','vzvq6f2l89l3','Remove air filter',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('yy5y1w7wq450','n3avvqb089l3','Perform service',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('yya098kzq450','0ndqfpg789l3','Exterior body wash',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('z7ui09zfq450','cz0vq8rw89l3','Inspect vehicle',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('zbkujrfdq450','9petf3qn89l3','Interior cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('zcr8hd78q450','cz0vq8rw89l3','Test and verify',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('ze39orrkq450','j0p4liw089l3','Seat cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43'),('ztjzycyqq450','wmolvks889l3','Check charging',1,'2026-05-26 19:10:53','2026-05-26 22:09:43'),('zxcg1k89q450','lg6z7som89l3','Vacuum cleaning',1,'2026-05-26 19:10:54','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `service_sub_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_payments`
--

DROP TABLE IF EXISTS `subscription_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_payments` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subscription_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `reference` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_subscription_payments_business` (`business_id`),
  KEY `fk_subscription_payments_subscription` (`subscription_id`),
  KEY `fk_subscription_payments_method` (`payment_method_id`),
  CONSTRAINT `fk_subscription_payments_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_subscription_payments_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_subscription_payments_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `business_subscriptions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_payments`
--

LOCK TABLES `subscription_payments` WRITE;
/*!40000 ALTER TABLE `subscription_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plan_services`
--

DROP TABLE IF EXISTS `subscription_plan_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plan_services` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `plan_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_category_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_plan_service` (`plan_id`,`service_category_id`),
  KEY `fk_plan_services_category` (`service_category_id`),
  CONSTRAINT `fk_plan_services_category` FOREIGN KEY (`service_category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_plan_services_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plan_services`
--

LOCK TABLES `subscription_plan_services` WRITE;
/*!40000 ALTER TABLE `subscription_plan_services` DISABLE KEYS */;
INSERT INTO `subscription_plan_services` VALUES (8,'plan_carwash_general_monthly','svc_carwash'),(9,'plan_carwash_general_monthly','svc_general'),(2,'plan_carwash_monthly','svc_carwash'),(11,'plan_full_monthly','svc_carwash'),(12,'plan_full_monthly','svc_general'),(10,'plan_full_monthly','svc_tire'),(3,'plan_general_monthly','svc_general'),(5,'plan_tire_carwash_monthly','svc_carwash'),(4,'plan_tire_carwash_monthly','svc_tire'),(7,'plan_tire_general_monthly','svc_general'),(6,'plan_tire_general_monthly','svc_tire'),(1,'plan_tire_monthly','svc_tire');
/*!40000 ALTER TABLE `subscription_plan_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_code` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_period` enum('TRIAL','MONTHLY','QUARTERLY','SEMI_ANNUAL','YEARLY','CUSTOM') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MONTHLY',
  `duration_days` int NOT NULL DEFAULT '30',
  `branch_limit` int NOT NULL DEFAULT '1',
  `price` decimal(14,2) NOT NULL DEFAULT '0.00',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_code` (`plan_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES ('plan_carwash_general_monthly','VASMA-23-MONTHLY','Car Wash + General Service','MONTHLY',30,1,0.00,1,'2026-05-26 18:44:57','2026-05-26 18:44:57'),('plan_carwash_monthly','VASMA-2-MONTHLY','Car Wash Only','MONTHLY',30,1,0.00,1,'2026-05-26 18:44:57','2026-05-26 18:44:57'),('plan_full_monthly','VASMA-123-MONTHLY','Full Service Package','MONTHLY',30,1,0.00,1,'2026-05-26 18:44:57','2026-05-26 18:44:57'),('plan_general_monthly','VASMA-3-MONTHLY','General Service Only','MONTHLY',30,1,0.00,1,'2026-05-26 18:44:57','2026-05-26 18:44:57'),('plan_tire_carwash_monthly','VASMA-12-MONTHLY','Tyre Service + Car Wash','MONTHLY',30,1,0.00,1,'2026-05-26 18:44:57','2026-05-26 18:44:57'),('plan_tire_general_monthly','VASMA-13-MONTHLY','Tyre Service + General Service','MONTHLY',30,1,0.00,1,'2026-05-26 18:44:57','2026-05-26 18:44:57'),('plan_tire_monthly','VASMA-1-MONTHLY','Tyre Service Only','MONTHLY',30,1,0.00,1,'2026-05-26 18:44:57','2026-05-26 18:44:57');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_services`
--

DROP TABLE IF EXISTS `subscription_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_services` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `subscription_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_category_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_subscription_service` (`subscription_id`,`service_category_id`),
  KEY `fk_subscription_services_category` (`service_category_id`),
  CONSTRAINT `fk_subscription_services_category` FOREIGN KEY (`service_category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_subscription_services_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `business_subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_services`
--

LOCK TABLES `subscription_services` WRITE;
/*!40000 ALTER TABLE `subscription_services` DISABLE KEYS */;
INSERT INTO `subscription_services` VALUES (5,'sub_DEMO-TRIAL','svc_tire',1),(6,'sub_DEMO-TRIAL','svc_carwash',1),(7,'sub_DEMO-TRIAL','svc_general',1),(10,'sub_biz_DEMO-TRIAL','svc_carwash',1),(11,'sub_biz_DEMO-TRIAL','svc_general',1),(12,'sub_VASMA-2-02','svc_carwash',1);
/*!40000 ALTER TABLE `subscription_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_audit`
--

DROP TABLE IF EXISTS `sync_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sync_audit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `business_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_sync_audit_user` (`user_id`),
  KEY `fk_sync_audit_business` (`business_id`),
  KEY `fk_sync_audit_branch` (`branch_id`),
  CONSTRAINT `fk_sync_audit_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sync_audit_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sync_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_audit`
--

LOCK TABLES `sync_audit` WRITE;
/*!40000 ALTER TABLE `sync_audit` DISABLE KEYS */;
INSERT INTO `sync_audit` VALUES (2,5,'biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','NORMALIZED_SAVE','SUCCESS','Saved JSON state and normalized transaction tables','2026-05-26 19:10:54'),(3,5,'biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','NORMALIZED_SAVE','SUCCESS','Saved JSON state and normalized transaction tables','2026-05-26 19:33:24'),(6,5,'biz_DEMO-TRIAL','branch_DEMO-TRIAL_main','NORMALIZED_SAVE','SUCCESS','Saved JSON state and normalized transaction tables','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `sync_audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$EDk0rFSSP5aJuuM9oXnrYefnGeX.mAr2a94jH6EMUFBHTDX9lEM22','admin','2026-05-24 17:47:37',NULL,'ACTIVE','2026-05-26 18:45:49'),(2,'VASMA-123-07','$2a$10$aclldPSeuHf39l9.MklGW.TjZDNmROb0JK4a4YkgdQc.Rz/VuVunK','business','2026-05-26 18:34:23',NULL,'ACTIVE','2026-05-26 18:45:49'),(5,'DEMO-TRIAL','$2a$10$3ikJsR7sUkxh.DglKRUsP.Vr5HXQRqk/v18itmZhh/wtijmgXnHqK','business','2026-05-26 19:07:15',NULL,'ACTIVE','2026-05-26 19:07:15'),(8,'VASMA-2-02','$2a$10$SGBgIpJR5kHDva9aFm4AgOs.0NeGxd8VlDdXuqCAjxJzUfUtRcmIW','business','2026-05-26 20:47:31','Demo User','ACTIVE','2026-05-26 20:47:31');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vasma_data`
--

DROP TABLE IF EXISTS `vasma_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vasma_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_vasma_data_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vasma_data`
--

LOCK TABLES `vasma_data` WRITE;
/*!40000 ALTER TABLE `vasma_data` DISABLE KEYS */;
INSERT INTO `vasma_data` VALUES (1,1,'{\"actions\": [{\"id\": \"4bntalnufxsh\", \"name\": \"Checked\"}, {\"id\": \"frs7dd4kfxsh\", \"name\": \"Changed\"}, {\"id\": \"yej9bo62fxsh\", \"name\": \"Replaced\"}, {\"id\": \"zs4c6psofxsh\", \"name\": \"Repaired\"}, {\"id\": \"nn7swi7yulvn\", \"name\": \"Purchased\"}], \"expenses\": [{\"id\": \"abd02ybtxza0\", \"date\": \"2026-05-22\", \"amount\": 20000, \"comment\": \"\", \"itemName\": \"Utilities\", \"expenseItem\": \"Umeme\"}, {\"id\": \"2cpklqotye57\", \"date\": \"2026-05-22\", \"amount\": 3000, \"comment\": \"\", \"itemName\": \"Utilities\", \"expenseItem\": \"Maji\"}], \"jobCards\": [{\"id\": \"fubhsb17dy0o\", \"qty\": \"4\", \"ref\": \"JC-000001\", \"date\": \"2026-05-19\", \"name\": \"Engine Oil - TAR 7000 SAE 15W/40\", \"unit\": \"Ltrs\", \"items\": [{\"id\": \"lbxsfqzmdk7k\", \"action\": \"\", \"amount\": 50000, \"itemId\": \"z21cxpai89l3\", \"status\": \"\", \"remarks\": \"\", \"confirmed\": false, \"categoryId\": \"yfvh0wrp89l3\", \"subItemIds\": [], \"attendantId\": \"qmmbacra89l3\", \"categoryName\": \"Tire Service\", \"attendantName\": \"Juma Said\", \"subItemStatus\": {}, \"serviceItemName\": \"Puncture Repair\"}], \"notes\": \"\", \"action\": \"\", \"amount\": \"48000.00\", \"itemId\": \"z21cxpai89l3\", \"status\": \"\", \"mileage\": \"\", \"unitCost\": \"12000\", \"categoryId\": \"yfvh0wrp89l3\", \"customerId\": \"8dfxtrus89l3\", \"invoiceRef\": \"INV-JC000001\", \"attendantId\": \"qmmbacra89l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [{\"id\": \"4l6bcaemjsza\", \"qty\": 4, \"name\": \"Engine Oil - TAR 7000 SAE 15W/40\", \"unit\": \"Ltrs\", \"amount\": 48000, \"status\": \"\", \"unitCost\": 12000}], \"confirmationRemarks\": \"\"}, {\"id\": \"mgyh85cvfxx6\", \"ref\": \"JC-000002\", \"date\": \"2026-05-19\", \"items\": [{\"id\": \"q0buofkqepxq\", \"action\": \"\", \"amount\": 10000, \"itemId\": \"0ndqfpg789l3\", \"status\": \"\", \"remarks\": \"\", \"confirmed\": false, \"categoryId\": \"d43ytz4h89l3\", \"subItemIds\": [], \"attendantId\": \"v5xdphm389l3\", \"categoryName\": \"Car Wash\", \"attendantName\": \"Peter Joseph\", \"subItemStatus\": {}, \"serviceItemName\": \"Full Wash\"}], \"notes\": \"\", \"action\": \"\", \"amount\": \"10000\", \"itemId\": \"0ndqfpg789l3\", \"mileage\": \"\", \"categoryId\": \"d43ytz4h89l3\", \"customerId\": \"ukw750hseigq\", \"invoiceRef\": \"INV-JC000002\", \"attendantId\": \"v5xdphm389l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [], \"confirmationRemarks\": \"\"}, {\"id\": \"ajupc1eckvkz\", \"ref\": \"JC-000003\", \"date\": \"2026-05-19\", \"items\": [{\"id\": \"hzcxo1lbjip2\", \"action\": \"\", \"amount\": 50000, \"itemId\": \"oq04287889l3\", \"status\": \"\", \"remarks\": \"\", \"confirmed\": false, \"categoryId\": \"yy25l91h89l3\", \"subItemIds\": [], \"attendantId\": \"bvyllici89l3\", \"categoryName\": \"General Service\", \"attendantName\": \"Neema John\", \"subItemStatus\": {}, \"serviceItemName\": \"Engine Oil Change\"}], \"notes\": \"\", \"action\": \"\", \"amount\": \"50000\", \"itemId\": \"oq04287889l3\", \"mileage\": 85000, \"categoryId\": \"yy25l91h89l3\", \"customerId\": \"8dfxtrus89l3\", \"invoiceRef\": \"INV-JC000003\", \"attendantId\": \"bvyllici89l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [], \"confirmationRemarks\": \"\"}, {\"id\": \"x7l6c7fgd00x\", \"ref\": \"JC-000004\", \"date\": \"2026-05-20\", \"items\": [{\"id\": \"a5fo1177birl\", \"action\": \"Checked\", \"amount\": 10000, \"itemId\": \"kcpom5l789l3\", \"status\": \"Checked\", \"remarks\": \"\", \"confirmed\": true, \"categoryId\": \"d43ytz4h89l3\", \"subItemIds\": [], \"attendantId\": \"qmmbacra89l3\", \"categoryName\": \"Car Wash\", \"attendantName\": \"Juma Said\", \"subItemStatus\": {}, \"serviceItemName\": \"Basic Wash\"}, {\"id\": \"d5r5lnx3c773\", \"action\": \"Checked\", \"amount\": 10000, \"itemId\": \"og3gzyao89l3\", \"status\": \"Checked\", \"remarks\": \"\", \"confirmed\": true, \"categoryId\": \"d43ytz4h89l3\", \"subItemIds\": [], \"attendantId\": \"qmmbacra89l3\", \"categoryName\": \"Car Wash\", \"attendantName\": \"Juma Said\", \"subItemStatus\": {}, \"serviceItemName\": \"Seat Cleaning Package\"}], \"notes\": \"\", \"amount\": \"10000\", \"itemId\": \"og3gzyao89l3\", \"mileage\": 0, \"categoryId\": \"d43ytz4h89l3\", \"customerId\": \"8dfxtrus89l3\", \"invoiceRef\": \"INV-JC000004\", \"attendantId\": \"qmmbacra89l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [], \"confirmationRemarks\": \"\"}, {\"id\": \"q3ucbb0uwgvp\", \"ref\": \"JC-000005\", \"date\": \"2026-05-24\", \"items\": [{\"id\": \"iztx8f6lv00k\", \"action\": \"\", \"amount\": 10000, \"itemId\": \"kcpom5l789l3\", \"status\": \"\", \"remarks\": \"\", \"confirmed\": false, \"categoryId\": \"d43ytz4h89l3\", \"subItemIds\": [], \"attendantId\": \"qmmbacra89l3\", \"categoryName\": \"Car Wash\", \"attendantName\": \"Juma Said\", \"subItemStatus\": {}, \"serviceItemName\": \"Basic Wash\"}], \"notes\": \"\", \"amount\": \"10000\", \"itemId\": \"kcpom5l789l3\", \"mileage\": 0, \"categoryId\": \"d43ytz4h89l3\", \"customerId\": \"8dfxtrus89l3\", \"invoiceRef\": \"INV-JC000005\", \"attendantId\": \"qmmbacra89l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [], \"confirmationRemarks\": \"\"}, {\"id\": \"nfgvld85q5oj\", \"ref\": \"JC-000006\", \"date\": \"2026-05-24\", \"items\": [{\"id\": \"6ymwwoqjprc9\", \"action\": \"Checked\", \"amount\": 10000, \"itemId\": \"kcpom5l789l3\", \"status\": \"Checked\", \"remarks\": \"\", \"confirmed\": false, \"categoryId\": \"d43ytz4h89l3\", \"subItemIds\": [], \"attendantId\": \"bvyllici89l3\", \"categoryName\": \"Car Wash\", \"attendantName\": \"Neema John\", \"subItemStatus\": {}, \"serviceItemName\": \"Basic Wash\"}], \"notes\": \"\", \"amount\": \"10000\", \"itemId\": \"kcpom5l789l3\", \"mileage\": 0, \"categoryId\": \"d43ytz4h89l3\", \"customerId\": \"ukw750hseigq\", \"invoiceRef\": \"INV-JC000006\", \"attendantId\": \"bvyllici89l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [], \"confirmationRemarks\": \"\"}, {\"id\": \"es69qe6kj39y\", \"ref\": \"JC-000007\", \"date\": \"2026-05-24\", \"items\": [{\"id\": \"keteex3thon3\", \"action\": \"\", \"amount\": 25000, \"itemId\": \"0ndqfpg789l3\", \"status\": \"\", \"remarks\": \"\", \"confirmed\": false, \"categoryId\": \"d43ytz4h89l3\", \"subItemIds\": [\"yya098kzq450\", \"n6mip7jlq450\", \"sbv1hf72q450\", \"7tiu2l1tq450\", \"eaozusleq450\", \"czit7e0hq450\"], \"attendantId\": \"qmmbacra89l3\", \"categoryName\": \"Car Wash\", \"attendantName\": \"Juma Said\", \"subItemStatus\": {}, \"serviceItemName\": \"Full Wash\"}], \"notes\": \"\", \"amount\": \"25000\", \"itemId\": \"0ndqfpg789l3\", \"mileage\": 0, \"categoryId\": \"d43ytz4h89l3\", \"customerId\": \"8dfxtrus89l3\", \"invoiceRef\": \"INV-JC000007\", \"subItemIds\": \"czit7e0hq450\", \"attendantId\": \"qmmbacra89l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [], \"confirmationRemarks\": \"\"}], \"packages\": [{\"id\": \"ec85copc89l3\", \"name\": \"Basic Wash\", \"services\": \"Kuosha body ya nje tu\"}, {\"id\": \"2pqx4vmb89l3\", \"name\": \"Standard Wash\", \"services\": \"Body wash + kusafisha ndani kwa kawaida\"}, {\"id\": \"1d1bnepj89l3\", \"name\": \"Full Wash\", \"services\": \"Body wash + interior cleaning + vacuum + tyre cleaning\"}, {\"id\": \"t83ydq7189l3\", \"name\": \"Premium Wash\", \"services\": \"Full wash + dashboard polish + tyre shine\"}, {\"id\": \"2vozfq8k89l3\", \"name\": \"Complete Detailing\", \"services\": \"Full wash + interior deep cleaning + polish + tyre shine\"}], \"payments\": [{\"id\": \"op0dl0znn8br\", \"ref\": \"RCPT-JC000001\", \"date\": \"2026-05-19\", \"items\": [{\"amount\": 50000, \"lineId\": \"lbxsfqzmdk7k\", \"jobItemId\": \"lbxsfqzmdk7k\", \"attendantId\": \"qmmbacra89l3\"}, {\"amount\": 48000, \"lineId\": \"4l6bcaemjsza\", \"jobItemId\": \"4l6bcaemjsza\", \"attendantId\": \"\"}], \"jobId\": \"fubhsb17dy0o\", \"amount\": \"48000\", \"method\": \"Cash\", \"comment\": \"\", \"attendantId\": \"\", \"attachmentName\": \"\"}, {\"id\": \"m8qqqrozj33o\", \"ref\": \"RCPT-JC000002\", \"date\": \"2026-05-19\", \"items\": [{\"amount\": 10000, \"lineId\": \"q0buofkqepxq\", \"jobItemId\": \"q0buofkqepxq\", \"attendantId\": \"qmmbacra89l3\"}], \"jobId\": \"mgyh85cvfxx6\", \"amount\": \"10000\", \"method\": \"Cash\", \"comment\": \"\", \"attendantId\": \"qmmbacra89l3\", \"attachmentName\": \"\"}, {\"id\": \"fotw4tn3o08t\", \"ref\": \"RCPT-JC000003\", \"date\": \"2026-05-19\", \"items\": [{\"amount\": 50000, \"lineId\": \"hzcxo1lbjip2\", \"jobItemId\": \"hzcxo1lbjip2\", \"attendantId\": \"bvyllici89l3\"}], \"jobId\": \"ajupc1eckvkz\", \"amount\": \"50000\", \"method\": \"Cash\", \"comment\": \"\", \"attendantId\": \"bvyllici89l3\", \"attachmentName\": \"\"}, {\"id\": \"0jatgvl4gxak\", \"ref\": \"RCPT-JC000004\", \"date\": \"2026-05-20\", \"items\": [{\"amount\": 10000, \"lineId\": \"a5fo1177birl\", \"jobItemId\": \"a5fo1177birl\", \"attendantId\": \"qmmbacra89l3\"}, {\"amount\": 10000, \"lineId\": \"d5r5lnx3c773\", \"jobItemId\": \"d5r5lnx3c773\", \"attendantId\": \"qmmbacra89l3\"}], \"jobId\": \"x7l6c7fgd00x\", \"amount\": \"10000\", \"method\": \"Cash\", \"comment\": \"\", \"attendantId\": \"qmmbacra89l3\", \"attachmentName\": \"\"}, {\"id\": \"65kgyidyxw0z\", \"ref\": \"RCPT-JC000005\", \"date\": \"2026-05-24\", \"items\": [{\"amount\": 10000, \"lineId\": \"iztx8f6lv00k\", \"jobItemId\": \"iztx8f6lv00k\", \"attendantId\": \"qmmbacra89l3\", \"attendantName\": \"Juma Said\"}], \"jobId\": \"q3ucbb0uwgvp\", \"amount\": \"10000\", \"method\": \"Cash\", \"comment\": \"\", \"attendantId\": \"qmmbacra89l3\", \"attachmentName\": \"\"}], \"settings\": {\"theme\": \"light\", \"mobile\": \"\", \"appName\": \"VASMA System - Vehicle Auto Service Management System\", \"creator\": \"Bakari Kamanga\", \"language\": \"en\", \"location\": \"\", \"password\": \"\", \"userName\": \"Admin\", \"ownerName\": \"\", \"businessName\": \"Fuad Auto Service\", \"lastUnlockAt\": \"\", \"loginEnabled\": false, \"billPageSetup\": \"compact\", \"developerEdits\": {}, \"lockWhenHidden\": false, \"autoLockMinutes\": \"15\", \"developerLayout\": {}, \"enabledServices\": [\"carWash\"], \"serviceAuthCode\": \"VASMA-CARWASH\", \"jobCardPageSetup\": \"compact\", \"receiptPageSetup\": \"compact\", \"developerGraphHeight\": \"390\", \"serviceAuthorization\": {\"code\": \"VASMA-CARWASH\", \"authorizedAt\": \"2026-05-24T21:38:02.951Z\", \"authorizedServices\": [\"carWash\"]}, \"developerCustomBlocks\": {}}, \"customers\": [{\"id\": \"8dfxtrus89l3\", \"name\": \"Bakari Kamanga\", \"active\": true, \"mobile\": \"+255 712 000 000\", \"contact\": \"Bakari Kamanga\", \"vehicle\": \"T 194 DQG\", \"vehicleModel\": \"Mitsubishi Pickup\"}, {\"id\": \"ukw750hseigq\", \"name\": \"Fuad \", \"active\": true, \"mobile\": \"073 815 181\", \"contact\": \"Fuad Salum\", \"vehicle\": \"T 320 AAA\", \"vehicleModel\": \"Toyota Corolla\"}], \"employees\": [{\"id\": \"qmmbacra89l3\", \"name\": \"Juma Said\", \"role\": \"Attendant\", \"active\": true, \"mobile\": \"+255 713 111 111\"}, {\"id\": \"bvyllici89l3\", \"name\": \"Neema John\", \"role\": \"Attendant\", \"active\": true, \"mobile\": \"+255 714 222 222\"}, {\"id\": \"v5xdphm389l3\", \"name\": \"Peter Joseph\", \"role\": \"Supervisor\", \"active\": true, \"mobile\": \"+255 715 333 333\"}], \"categories\": [{\"id\": \"yfvh0wrp89l3\", \"name\": \"Tire Service\", \"items\": [{\"id\": \"z21cxpai89l3\", \"name\": \"Puncture Repair\", \"subItems\": [{\"id\": \"slgcpmruq44z\", \"name\": \"Inspect tyre\"}, {\"id\": \"fyatcuv9q44z\", \"name\": \"Remove wheel\"}, {\"id\": \"6lgu07yvq44z\", \"name\": \"Repair / replace\"}, {\"id\": \"14ugjvqoq44z\", \"name\": \"Fit wheel\"}, {\"id\": \"o137czs6q44z\", \"name\": \"Inflate pressure\"}]}, {\"id\": \"0hsz87t589l3\", \"name\": \"Tire Fitting / Replacement\", \"subItems\": [{\"id\": \"xkoamzwcq44z\", \"name\": \"Inspect tyre\"}, {\"id\": \"22ezteh3q44z\", \"name\": \"Remove wheel\"}, {\"id\": \"mbqv5oimq44z\", \"name\": \"Repair / replace\"}, {\"id\": \"l11g8e0mq44z\", \"name\": \"Fit wheel\"}, {\"id\": \"3ff5189dq44z\", \"name\": \"Inflate pressure\"}]}, {\"id\": \"4rschjfd89l3\", \"name\": \"Tube Replacement\", \"subItems\": [{\"id\": \"xnwq57kzq44z\", \"name\": \"Inspect tyre\"}, {\"id\": \"n7cu888xq44z\", \"name\": \"Remove wheel\"}, {\"id\": \"01a2wkraq44z\", \"name\": \"Repair / replace\"}, {\"id\": \"9zcmadn9q44z\", \"name\": \"Fit wheel\"}, {\"id\": \"0z2c7e7nq44z\", \"name\": \"Inflate pressure\"}]}, {\"id\": \"18lbckan89l3\", \"name\": \"Valve Replacement\", \"subItems\": [{\"id\": \"1g9gjfacq44z\", \"name\": \"Remove valve\"}, {\"id\": \"e6gdh1baq44z\", \"name\": \"Fit new valve\"}, {\"id\": \"0z5c3f5aq44z\", \"name\": \"Leak test\"}]}, {\"id\": \"fxbmx7r689l3\", \"name\": \"Wheel Balancing\", \"subItems\": [{\"id\": \"8h5hzgm7q450\", \"name\": \"Remove wheel\"}, {\"id\": \"grisu0j4q450\", \"name\": \"Balance wheel\"}, {\"id\": \"5rov6ssdq450\", \"name\": \"Fit wheel\"}, {\"id\": \"48pv3z73q450\", \"name\": \"Road check\"}]}, {\"id\": \"t2vqdg9j89l3\", \"name\": \"Wheel Alignment\", \"subItems\": [{\"id\": \"h04rnd99q450\", \"name\": \"Inspect alignment\"}, {\"id\": \"gm99970oq450\", \"name\": \"Adjust alignment\"}, {\"id\": \"trp3rlolq450\", \"name\": \"Road test\"}]}, {\"id\": \"kvzdfahe89l3\", \"name\": \"Tire Rotation\", \"subItems\": [{\"id\": \"cgnilublq450\", \"name\": \"Inspect tyre positions\"}, {\"id\": \"ush6k9nuq450\", \"name\": \"Rotate tyres\"}, {\"id\": \"3uji1kwjq450\", \"name\": \"Inflate pressure\"}]}, {\"id\": \"1favjj7c89l3\", \"name\": \"Tire Pressure Adjustment\", \"subItems\": [{\"id\": \"vv9npmhsq450\", \"name\": \"Inspect tyre\"}, {\"id\": \"047cld3tq450\", \"name\": \"Remove wheel\"}, {\"id\": \"028dhnjrq450\", \"name\": \"Repair / replace\"}, {\"id\": \"8ezw1w22q450\", \"name\": \"Fit wheel\"}, {\"id\": \"gubtjh3eq450\", \"name\": \"Inflate pressure\"}]}, {\"id\": \"r6n71wi389l3\", \"name\": \"Rim Cleaning\", \"subItems\": [{\"id\": \"x6nfx1qnq450\", \"name\": \"Inspect tyre\"}, {\"id\": \"d6s26vrjq450\", \"name\": \"Remove wheel\"}, {\"id\": \"6j60i4f0q450\", \"name\": \"Repair / replace\"}, {\"id\": \"09n9vsn6q450\", \"name\": \"Fit wheel\"}, {\"id\": \"ssdeacebq450\", \"name\": \"Inflate pressure\"}]}], \"active\": true}, {\"id\": \"yy25l91h89l3\", \"name\": \"General Service\", \"items\": [{\"id\": \"oq04287889l3\", \"name\": \"Engine Oil Change\", \"subItems\": [{\"id\": \"pkmqaohqq450\", \"name\": \"Drain old oil\"}, {\"id\": \"5dsfx0fsq450\", \"name\": \"Replace engine oil\"}, {\"id\": \"9kijqzmwq450\", \"name\": \"Check oil level\"}]}, {\"id\": \"c9yijr1g89l3\", \"name\": \"Oil Filter Replacement\", \"subItems\": [{\"id\": \"3sl5g6t6q450\", \"name\": \"Remove old oil filter\"}, {\"id\": \"e80z3uhnq450\", \"name\": \"Fit new oil filter\"}, {\"id\": \"l3g2v1q9q450\", \"name\": \"Leak check\"}]}, {\"id\": \"vzvq6f2l89l3\", \"name\": \"Air Filter Cleaning\", \"subItems\": [{\"id\": \"yinqdsedq450\", \"name\": \"Remove air filter\"}, {\"id\": \"b8hqudiiq450\", \"name\": \"Clean air filter\"}, {\"id\": \"twtwwwejq450\", \"name\": \"Recheck fitting\"}]}, {\"id\": \"izpqsvlh89l3\", \"name\": \"Air Filter Replacement\", \"subItems\": [{\"id\": \"lb7luu8pq450\", \"name\": \"Remove air filter\"}, {\"id\": \"12ncn0hhq450\", \"name\": \"Fit new air filter\"}, {\"id\": \"p1r7gxmxq450\", \"name\": \"Recheck fitting\"}]}, {\"id\": \"141gp7n789l3\", \"name\": \"Fuel Filter Replacement\", \"subItems\": [{\"id\": \"j4886dghq450\", \"name\": \"Remove fuel filter\"}, {\"id\": \"oe8l7r5sq450\", \"name\": \"Fit new fuel filter\"}, {\"id\": \"x6kxmlbxq450\", \"name\": \"Leak check\"}]}, {\"id\": \"cz0vq8rw89l3\", \"name\": \"Cabin / AC Filter Replacement\", \"subItems\": [{\"id\": \"z7ui09zfq450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"r0lz5u9cq450\", \"name\": \"Perform service\"}, {\"id\": \"zcr8hd78q450\", \"name\": \"Test and verify\"}]}, {\"id\": \"ab00owpi89l3\", \"name\": \"Spark Plug Replacement\", \"subItems\": [{\"id\": \"i466ngdwq450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"5ya63dcfq450\", \"name\": \"Perform service\"}, {\"id\": \"bdukqub5q450\", \"name\": \"Test and verify\"}]}, {\"id\": \"n3avvqb089l3\", \"name\": \"Gear Oil Change\", \"subItems\": [{\"id\": \"724duq8gq450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"yy5y1w7wq450\", \"name\": \"Perform service\"}, {\"id\": \"6i9r4cwvq450\", \"name\": \"Test and verify\"}]}, {\"id\": \"fn9wdby289l3\", \"name\": \"Differential Oil Change\", \"subItems\": [{\"id\": \"11jzpg6lq450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"ky2tlqgsq450\", \"name\": \"Perform service\"}, {\"id\": \"2mc9fefpq450\", \"name\": \"Test and verify\"}]}, {\"id\": \"lvfhgyjp89l3\", \"name\": \"Brake Fluid Top-up / Change\", \"subItems\": [{\"id\": \"1i8eeoqrq450\", \"name\": \"Inspect brakes\"}, {\"id\": \"s4drl81qq450\", \"name\": \"Adjust / service brakes\"}, {\"id\": \"tbbg26paq450\", \"name\": \"Road test\"}]}, {\"id\": \"ll3n8uso89l3\", \"name\": \"Coolant Top-up / Change\", \"subItems\": [{\"id\": \"uuelpzc3q450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"av0hb1jmq450\", \"name\": \"Perform service\"}, {\"id\": \"1ukkxlocq450\", \"name\": \"Test and verify\"}]}, {\"id\": \"gh1a7b3f89l3\", \"name\": \"Power Steering Fluid Top-up / Change\", \"subItems\": [{\"id\": \"9sox1466q450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"qgqumt3hq450\", \"name\": \"Perform service\"}, {\"id\": \"ivdm5k5fq450\", \"name\": \"Test and verify\"}]}, {\"id\": \"wmolvks889l3\", \"name\": \"Battery Terminal Cleaning\", \"subItems\": [{\"id\": \"8clvhrd7q450\", \"name\": \"Clean terminals\"}, {\"id\": \"cq4e060wq450\", \"name\": \"Tighten terminals\"}, {\"id\": \"ztjzycyqq450\", \"name\": \"Check charging\"}]}, {\"id\": \"flpvvtci89l3\", \"name\": \"Brake Inspection & Adjustment\", \"subItems\": [{\"id\": \"umuq86niq450\", \"name\": \"Engine check\"}, {\"id\": \"s7as3pshq450\", \"name\": \"Fluid level check\"}, {\"id\": \"3ur1r2pyq450\", \"name\": \"Lights check\"}, {\"id\": \"lnb28abmq450\", \"name\": \"Brake check\"}, {\"id\": \"c100pkjxq450\", \"name\": \"Road test\"}]}, {\"id\": \"says77ev89l3\", \"name\": \"General Vehicle Inspection\", \"subItems\": [{\"id\": \"nonawrabq450\", \"name\": \"Engine check\"}, {\"id\": \"p8p9qx3sq450\", \"name\": \"Fluid level check\"}, {\"id\": \"fu1na0jhq450\", \"name\": \"Lights check\"}, {\"id\": \"tljpiq63q450\", \"name\": \"Brake check\"}, {\"id\": \"vspvd8djq450\", \"name\": \"Road test\"}]}, {\"id\": \"m1at1g7i89l3\", \"name\": \"Service Labour Charge\", \"subItems\": [{\"id\": \"4la9fwgtq450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"d7ozrdf8q450\", \"name\": \"Perform service\"}, {\"id\": \"uisx8eqmq450\", \"name\": \"Test and verify\"}]}], \"active\": true}, {\"id\": \"d43ytz4h89l3\", \"name\": \"Car Wash\", \"items\": [{\"id\": \"kcpom5l789l3\", \"name\": \"Basic Wash\", \"subItems\": [{\"id\": \"l4zjj7e5q450\", \"name\": \"Exterior body wash\"}, {\"id\": \"dv3vn8eoq450\", \"name\": \"Interior cleaning\"}, {\"id\": \"rm0gcfi4q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"910p7pb4q450\", \"name\": \"Tyre cleaning\"}]}, {\"id\": \"dtaac3wt89l3\", \"name\": \"Standard Wash\", \"subItems\": [{\"id\": \"1tf3wtxkq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"rxfhuwmrq450\", \"name\": \"Interior cleaning\"}, {\"id\": \"xzjf4zosq450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"v4qsv1wsq450\", \"name\": \"Tyre cleaning\"}]}, {\"id\": \"0ndqfpg789l3\", \"name\": \"Full Wash\", \"subItems\": [{\"id\": \"yya098kzq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"n6mip7jlq450\", \"name\": \"Interior cleaning\"}, {\"id\": \"sbv1hf72q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"7tiu2l1tq450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"eaozusleq450\", \"name\": \"Dashboard polish\"}, {\"id\": \"czit7e0hq450\", \"name\": \"Tyre shine\"}]}, {\"id\": \"9petf3qn89l3\", \"name\": \"Premium Wash\", \"subItems\": [{\"id\": \"jrx5wlwcq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"zbkujrfdq450\", \"name\": \"Interior cleaning\"}, {\"id\": \"aiyvl0h9q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"aqsbz5neq450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"pww9t092q450\", \"name\": \"Dashboard polish\"}, {\"id\": \"k1l9cd7gq450\", \"name\": \"Tyre shine\"}]}, {\"id\": \"iynyq2y389l3\", \"name\": \"Engine Wash\", \"subItems\": [{\"id\": \"1u15nilbq450\", \"name\": \"Engine bay wash\"}, {\"id\": \"7ssn2u7rq450\", \"name\": \"Engine degreasing\"}, {\"id\": \"tf0nj2tiq450\", \"name\": \"Final engine wipe\"}]}, {\"id\": \"wcnphqn789l3\", \"name\": \"Underbody Wash\", \"subItems\": [{\"id\": \"ulkojw7eq450\", \"name\": \"Underbody wash\"}, {\"id\": \"xmgnjtqqq450\", \"name\": \"Mud removal\"}, {\"id\": \"75w23eihq450\", \"name\": \"Chassis rinse\"}]}, {\"id\": \"9orjohj989l3\", \"name\": \"Interior Deep Cleaning\", \"subItems\": [{\"id\": \"83cwofz3q450\", \"name\": \"Exterior body wash\"}, {\"id\": \"8xkv47d6q450\", \"name\": \"Interior cleaning\"}, {\"id\": \"fnqpjzo1q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"6cih8122q450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"5g1cmvvfq450\", \"name\": \"Seat cleaning\"}, {\"id\": \"rxrwiuz8q450\", \"name\": \"Carpet cleaning\"}]}, {\"id\": \"og3gzyao89l3\", \"name\": \"Seat Cleaning Package\", \"subItems\": [{\"id\": \"rx5n5agwq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"3msmv3q5q450\", \"name\": \"Interior cleaning\"}, {\"id\": \"a96tlxk2q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"wu4k3dhbq450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"7wd8lkk7q450\", \"name\": \"Seat cleaning\"}, {\"id\": \"bhvzlnd2q450\", \"name\": \"Carpet cleaning\"}]}, {\"id\": \"zbcjogrz89l3\", \"name\": \"Carpet / Floor Mat Cleaning\", \"subItems\": [{\"id\": \"ohwgu1l3q450\", \"name\": \"Exterior body wash\"}, {\"id\": \"xomlamzvq450\", \"name\": \"Interior cleaning\"}, {\"id\": \"3wgm4hveq450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"co0aeh7wq450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"w350j7acq450\", \"name\": \"Seat cleaning\"}, {\"id\": \"p91tbbyaq450\", \"name\": \"Carpet cleaning\"}]}, {\"id\": \"um4jash989l3\", \"name\": \"Body Polish / Waxing\", \"subItems\": [{\"id\": \"gqkkiy2mq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"95r0pj06q450\", \"name\": \"Interior cleaning\"}, {\"id\": \"xgakf6j7q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"n42t3qawq450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"s6ptha18q450\", \"name\": \"Body polish\"}, {\"id\": \"uuglylklq450\", \"name\": \"Waxing\"}]}, {\"id\": \"j0p4liw089l3\", \"name\": \"Complete Detailing\", \"subItems\": [{\"id\": \"wrgs81dqq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"fpuckygjq450\", \"name\": \"Interior cleaning\"}, {\"id\": \"byw37gghq450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"nvqa1lnbq450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"3d030ufmq450\", \"name\": \"Dashboard polish\"}, {\"id\": \"3ex6zbhxq450\", \"name\": \"Tyre shine\"}, {\"id\": \"ze39orrkq450\", \"name\": \"Seat cleaning\"}, {\"id\": \"3wfg0gzeq450\", \"name\": \"Carpet cleaning\"}, {\"id\": \"de3ouq71q450\", \"name\": \"Body polish\"}, {\"id\": \"vq486wqfq450\", \"name\": \"Waxing\"}]}, {\"id\": \"lg6z7som89l3\", \"name\": \"Motorcycle Wash\", \"subItems\": [{\"id\": \"4bl8y8uaq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"9k0j8yq7q450\", \"name\": \"Interior cleaning\"}, {\"id\": \"zxcg1k89q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"pyshm4ncq450\", \"name\": \"Tyre cleaning\"}]}], \"active\": true}], \"commissions\": [{\"id\": \"nnsdl2e1fln7\", \"date\": \"2026-05-19\", \"rate\": \"35\", \"type\": \"Percent\", \"jobId\": \"fubhsb17dy0o\", \"amount\": 34300, \"attendantId\": \"qmmbacra89l3\"}, {\"id\": \"jl5t32o7kz2l\", \"date\": \"2026-05-19\", \"rate\": \"3000\", \"type\": \"Amount\", \"jobId\": \"mgyh85cvfxx6\", \"amount\": 3000, \"attendantId\": \"bvyllici89l3\"}, {\"id\": \"3uge0ktlolzi\", \"date\": \"2026-05-19\", \"rate\": \"35\", \"type\": \"Percent\", \"jobId\": \"ajupc1eckvkz\", \"amount\": 17500, \"attendantId\": \"v5xdphm389l3\"}, {\"id\": \"skst82jmhzsw\", \"date\": \"2026-05-20\", \"rate\": \"45\", \"type\": \"Percent\", \"jobId\": \"x7l6c7fgd00x\", \"amount\": 9000, \"attendantId\": \"qmmbacra89l3\"}], \"expenseItems\": [{\"id\": \"x4u5ivag89l3\", \"name\": \"Utilities\"}, {\"id\": \"asxaf05i89l3\", \"name\": \"Consumables\"}, {\"id\": \"3j3vd5ph89l3\", \"name\": \"Rent\"}, {\"id\": \"565mkvjg89l3\", \"name\": \"Salaries\"}, {\"id\": \"3kpfy0sb89l3\", \"name\": \"Maintenance\"}, {\"id\": \"lxj4rg4489l3\", \"name\": \"Transport\"}]}','2026-05-24 20:15:10','2026-05-25 19:57:19'),(86,5,'{\"_sync\": {\"savedAt\": \"2026-05-26T22:09:43.378Z\", \"appVersion\": \"v99\"}, \"actions\": [{\"id\": \"4bntalnufxsh\", \"name\": \"Checked\"}, {\"id\": \"frs7dd4kfxsh\", \"name\": \"Changed\"}, {\"id\": \"yej9bo62fxsh\", \"name\": \"Replaced\"}, {\"id\": \"zs4c6psofxsh\", \"name\": \"Repaired\"}, {\"id\": \"nn7swi7yulvn\", \"name\": \"Purchased\"}], \"expenses\": [{\"id\": \"abd02ybtxza0\", \"date\": \"2026-05-22\", \"amount\": 20000, \"comment\": \"\", \"itemName\": \"Utilities\", \"expenseItem\": \"Umeme\"}, {\"id\": \"2cpklqotye57\", \"date\": \"2026-05-22\", \"amount\": 3000, \"comment\": \"\", \"itemName\": \"Utilities\", \"expenseItem\": \"Maji\"}], \"jobCards\": [{\"id\": \"fubhsb17dy0o\", \"qty\": \"4\", \"ref\": \"JC-000001\", \"date\": \"2026-05-19\", \"name\": \"Engine Oil - TAR 7000 SAE 15W/40\", \"unit\": \"Ltrs\", \"items\": [{\"id\": \"lbxsfqzmdk7k\", \"action\": \"\", \"amount\": 50000, \"itemId\": \"z21cxpai89l3\", \"status\": \"\", \"remarks\": \"\", \"confirmed\": false, \"categoryId\": \"yfvh0wrp89l3\", \"subItemIds\": [], \"attendantId\": \"qmmbacra89l3\", \"categoryName\": \"Tire Service\", \"attendantName\": \"Juma Said\", \"subItemStatus\": {}, \"serviceItemName\": \"Puncture Repair\"}], \"notes\": \"\", \"action\": \"\", \"amount\": \"48000.00\", \"itemId\": \"z21cxpai89l3\", \"status\": \"\", \"mileage\": \"\", \"unitCost\": \"12000\", \"categoryId\": \"yfvh0wrp89l3\", \"customerId\": \"8dfxtrus89l3\", \"invoiceRef\": \"INV-JC000001\", \"attendantId\": \"qmmbacra89l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [{\"id\": \"4l6bcaemjsza\", \"qty\": 4, \"name\": \"Engine Oil - TAR 7000 SAE 15W/40\", \"unit\": \"Ltrs\", \"amount\": 48000, \"status\": \"\", \"unitCost\": 12000}], \"confirmationRemarks\": \"\"}, {\"id\": \"mgyh85cvfxx6\", \"ref\": \"JC-000002\", \"date\": \"2026-05-19\", \"items\": [{\"id\": \"q0buofkqepxq\", \"action\": \"\", \"amount\": 10000, \"itemId\": \"0ndqfpg789l3\", \"status\": \"\", \"remarks\": \"\", \"confirmed\": false, \"categoryId\": \"d43ytz4h89l3\", \"subItemIds\": [], \"attendantId\": \"v5xdphm389l3\", \"categoryName\": \"Car Wash\", \"attendantName\": \"Peter Joseph\", \"subItemStatus\": {}, \"serviceItemName\": \"Full Wash\"}], \"notes\": \"\", \"action\": \"\", \"amount\": \"10000\", \"itemId\": \"0ndqfpg789l3\", \"mileage\": \"\", \"categoryId\": \"d43ytz4h89l3\", \"customerId\": \"ukw750hseigq\", \"invoiceRef\": \"INV-JC000002\", \"attendantId\": \"v5xdphm389l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [], \"confirmationRemarks\": \"\"}, {\"id\": \"ajupc1eckvkz\", \"ref\": \"JC-000003\", \"date\": \"2026-05-19\", \"items\": [{\"id\": \"hzcxo1lbjip2\", \"action\": \"\", \"amount\": 50000, \"itemId\": \"oq04287889l3\", \"status\": \"\", \"remarks\": \"\", \"confirmed\": false, \"categoryId\": \"yy25l91h89l3\", \"subItemIds\": [], \"attendantId\": \"bvyllici89l3\", \"categoryName\": \"General Service\", \"attendantName\": \"Neema John\", \"subItemStatus\": {}, \"serviceItemName\": \"Engine Oil Change\"}], \"notes\": \"\", \"action\": \"\", \"amount\": \"50000\", \"itemId\": \"oq04287889l3\", \"mileage\": 85000, \"categoryId\": \"yy25l91h89l3\", \"customerId\": \"8dfxtrus89l3\", \"invoiceRef\": \"INV-JC000003\", \"attendantId\": \"bvyllici89l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [], \"confirmationRemarks\": \"\"}, {\"id\": \"x7l6c7fgd00x\", \"ref\": \"JC-000004\", \"date\": \"2026-05-20\", \"items\": [{\"id\": \"a5fo1177birl\", \"action\": \"Checked\", \"amount\": 10000, \"itemId\": \"kcpom5l789l3\", \"status\": \"Checked\", \"remarks\": \"\", \"confirmed\": true, \"categoryId\": \"d43ytz4h89l3\", \"subItemIds\": [], \"attendantId\": \"qmmbacra89l3\", \"categoryName\": \"Car Wash\", \"attendantName\": \"Juma Said\", \"subItemStatus\": {}, \"serviceItemName\": \"Basic Wash\"}, {\"id\": \"d5r5lnx3c773\", \"action\": \"Checked\", \"amount\": 10000, \"itemId\": \"og3gzyao89l3\", \"status\": \"Checked\", \"remarks\": \"\", \"confirmed\": true, \"categoryId\": \"d43ytz4h89l3\", \"subItemIds\": [], \"attendantId\": \"qmmbacra89l3\", \"categoryName\": \"Car Wash\", \"attendantName\": \"Juma Said\", \"subItemStatus\": {}, \"serviceItemName\": \"Seat Cleaning Package\"}], \"notes\": \"\", \"amount\": \"10000\", \"itemId\": \"og3gzyao89l3\", \"mileage\": 0, \"categoryId\": \"d43ytz4h89l3\", \"customerId\": \"8dfxtrus89l3\", \"invoiceRef\": \"INV-JC000004\", \"attendantId\": \"qmmbacra89l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [], \"confirmationRemarks\": \"\"}, {\"id\": \"q3ucbb0uwgvp\", \"ref\": \"JC-000005\", \"date\": \"2026-05-24\", \"items\": [{\"id\": \"iztx8f6lv00k\", \"action\": \"\", \"amount\": 10000, \"itemId\": \"kcpom5l789l3\", \"status\": \"\", \"remarks\": \"\", \"confirmed\": false, \"categoryId\": \"d43ytz4h89l3\", \"subItemIds\": [], \"attendantId\": \"qmmbacra89l3\", \"categoryName\": \"Car Wash\", \"attendantName\": \"Juma Said\", \"subItemStatus\": {}, \"serviceItemName\": \"Basic Wash\"}], \"notes\": \"\", \"amount\": \"10000\", \"itemId\": \"kcpom5l789l3\", \"mileage\": 0, \"categoryId\": \"d43ytz4h89l3\", \"customerId\": \"8dfxtrus89l3\", \"invoiceRef\": \"INV-JC000005\", \"attendantId\": \"qmmbacra89l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [], \"confirmationRemarks\": \"\"}, {\"id\": \"nfgvld85q5oj\", \"ref\": \"JC-000006\", \"date\": \"2026-05-24\", \"items\": [{\"id\": \"6ymwwoqjprc9\", \"action\": \"Checked\", \"amount\": 10000, \"itemId\": \"kcpom5l789l3\", \"status\": \"Checked\", \"remarks\": \"\", \"confirmed\": true, \"categoryId\": \"d43ytz4h89l3\", \"subItemIds\": [], \"attendantId\": \"bvyllici89l3\", \"categoryName\": \"Car Wash\", \"attendantName\": \"Neema John\", \"subItemStatus\": {\"910p7pb4q450\": true, \"dv3vn8eoq450\": true, \"l4zjj7e5q450\": true, \"rm0gcfi4q450\": true}, \"serviceItemName\": \"Basic Wash\"}], \"notes\": \"\", \"amount\": \"10000\", \"itemId\": \"kcpom5l789l3\", \"mileage\": 0, \"categoryId\": \"d43ytz4h89l3\", \"customerId\": \"ukw750hseigq\", \"invoiceRef\": \"INV-JC000006\", \"attendantId\": \"bvyllici89l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [], \"confirmationRemarks\": \"\"}, {\"id\": \"es69qe6kj39y\", \"ref\": \"JC-000007\", \"date\": \"2026-05-24\", \"items\": [{\"id\": \"keteex3thon3\", \"action\": \"\", \"amount\": 25000, \"itemId\": \"0ndqfpg789l3\", \"status\": \"\", \"remarks\": \"\", \"confirmed\": false, \"categoryId\": \"d43ytz4h89l3\", \"subItemIds\": [\"yya098kzq450\", \"n6mip7jlq450\", \"sbv1hf72q450\", \"7tiu2l1tq450\", \"eaozusleq450\", \"czit7e0hq450\"], \"attendantId\": \"qmmbacra89l3\", \"categoryName\": \"Car Wash\", \"attendantName\": \"Juma Said\", \"subItemStatus\": {}, \"serviceItemName\": \"Full Wash\"}], \"notes\": \"\", \"amount\": \"25000\", \"itemId\": \"0ndqfpg789l3\", \"mileage\": 0, \"categoryId\": \"d43ytz4h89l3\", \"customerId\": \"8dfxtrus89l3\", \"invoiceRef\": \"INV-JC000007\", \"subItemIds\": \"czit7e0hq450\", \"attendantId\": \"qmmbacra89l3\", \"serviceCard\": {\"lines\": [], \"nextServiceDate\": \"\", \"nextServiceMileage\": \"\"}, \"purchaseItems\": [], \"confirmationRemarks\": \"\"}], \"packages\": [{\"id\": \"ec85copc89l3\", \"name\": \"Basic Wash\", \"services\": \"Kuosha body ya nje tu\"}, {\"id\": \"2pqx4vmb89l3\", \"name\": \"Standard Wash\", \"services\": \"Body wash + kusafisha ndani kwa kawaida\"}, {\"id\": \"1d1bnepj89l3\", \"name\": \"Full Wash\", \"services\": \"Body wash + interior cleaning + vacuum + tyre cleaning\"}, {\"id\": \"t83ydq7189l3\", \"name\": \"Premium Wash\", \"services\": \"Full wash + dashboard polish + tyre shine\"}, {\"id\": \"2vozfq8k89l3\", \"name\": \"Complete Detailing\", \"services\": \"Full wash + interior deep cleaning + polish + tyre shine\"}], \"payments\": [{\"id\": \"op0dl0znn8br\", \"ref\": \"RCPT-JC000001\", \"date\": \"2026-05-19\", \"items\": [{\"amount\": 50000, \"lineId\": \"lbxsfqzmdk7k\", \"jobItemId\": \"lbxsfqzmdk7k\", \"attendantId\": \"qmmbacra89l3\"}, {\"amount\": 48000, \"lineId\": \"4l6bcaemjsza\", \"jobItemId\": \"4l6bcaemjsza\", \"attendantId\": \"\"}], \"jobId\": \"fubhsb17dy0o\", \"amount\": \"48000\", \"method\": \"Cash\", \"comment\": \"\", \"attendantId\": \"\", \"attachmentName\": \"\"}, {\"id\": \"m8qqqrozj33o\", \"ref\": \"RCPT-JC000002\", \"date\": \"2026-05-19\", \"items\": [{\"amount\": 10000, \"lineId\": \"q0buofkqepxq\", \"jobItemId\": \"q0buofkqepxq\", \"attendantId\": \"qmmbacra89l3\"}], \"jobId\": \"mgyh85cvfxx6\", \"amount\": \"10000\", \"method\": \"Cash\", \"comment\": \"\", \"attendantId\": \"qmmbacra89l3\", \"attachmentName\": \"\"}, {\"id\": \"fotw4tn3o08t\", \"ref\": \"RCPT-JC000003\", \"date\": \"2026-05-19\", \"items\": [{\"amount\": 50000, \"lineId\": \"hzcxo1lbjip2\", \"jobItemId\": \"hzcxo1lbjip2\", \"attendantId\": \"bvyllici89l3\"}], \"jobId\": \"ajupc1eckvkz\", \"amount\": \"50000\", \"method\": \"Cash\", \"comment\": \"\", \"attendantId\": \"bvyllici89l3\", \"attachmentName\": \"\"}, {\"id\": \"0jatgvl4gxak\", \"ref\": \"RCPT-JC000004\", \"date\": \"2026-05-20\", \"items\": [{\"amount\": 10000, \"lineId\": \"a5fo1177birl\", \"jobItemId\": \"a5fo1177birl\", \"attendantId\": \"qmmbacra89l3\"}, {\"amount\": 10000, \"lineId\": \"d5r5lnx3c773\", \"jobItemId\": \"d5r5lnx3c773\", \"attendantId\": \"qmmbacra89l3\"}], \"jobId\": \"x7l6c7fgd00x\", \"amount\": \"10000\", \"method\": \"Cash\", \"comment\": \"\", \"attendantId\": \"qmmbacra89l3\", \"attachmentName\": \"\"}, {\"id\": \"65kgyidyxw0z\", \"ref\": \"RCPT-JC000005\", \"date\": \"2026-05-24\", \"items\": [{\"amount\": 10000, \"lineId\": \"iztx8f6lv00k\", \"jobItemId\": \"iztx8f6lv00k\", \"attendantId\": \"qmmbacra89l3\", \"attendantName\": \"Juma Said\"}], \"jobId\": \"q3ucbb0uwgvp\", \"amount\": \"10000\", \"method\": \"Cash\", \"comment\": \"\", \"attendantId\": \"qmmbacra89l3\", \"attachmentName\": \"\"}], \"settings\": {\"theme\": \"light\", \"mobile\": \"\", \"appName\": \"VASMA System - Vehicle Auto Service Management System\", \"creator\": \"Bakari Kamanga\", \"language\": \"en\", \"location\": \"\", \"password\": \"\", \"userName\": \"Admin\", \"ownerName\": \"\", \"businessName\": \"Fuad Auto Service\", \"lastUnlockAt\": \"\", \"loginEnabled\": false, \"billPageSetup\": \"compact\", \"businessAdmin\": {\"users\": [{\"id\": \"owner\", \"name\": \"Admin\", \"role\": \"Admin\", \"active\": true, \"mobile\": \"\", \"branchId\": \"main\", \"username\": \"owner\"}], \"branches\": [{\"id\": \"main\", \"code\": \"MAIN\", \"name\": \"Main Branch\", \"active\": true, \"mobile\": \"\", \"location\": \"\"}], \"auditLogs\": [], \"permissions\": {\"User\": [\"dashboard\", \"customers\", \"jobs\", \"confirmation\", \"payments\", \"reports\"], \"Admin\": [\"all\"], \"Supervisor\": [\"dashboard\", \"customers\", \"jobs\", \"confirmation\", \"payments\", \"serviceCards\", \"expenses\", \"reports\", \"analysis\"]}}, \"developerEdits\": {}, \"lockWhenHidden\": false, \"autoLockMinutes\": \"15\", \"developerLayout\": {}, \"enabledServices\": [\"carWash\"], \"serviceAuthCode\": \"VASMA-CARWASH\", \"jobCardPageSetup\": \"compact\", \"receiptPageSetup\": \"compact\", \"developerGraphHeight\": \"390\", \"serviceAuthorization\": {\"code\": \"VASMA-CARWASH\", \"authorizedAt\": \"2026-05-24T21:38:02.951Z\", \"authorizedServices\": [\"carWash\"]}, \"developerCustomBlocks\": {}}, \"customers\": [{\"id\": \"8dfxtrus89l3\", \"name\": \"Bakari Kamanga\", \"active\": true, \"mobile\": \"+255 712 000 000\", \"contact\": \"Bakari Kamanga\", \"vehicle\": \"T 194 DQG\", \"vehicleModel\": \"Mitsubishi Pickup\"}, {\"id\": \"ukw750hseigq\", \"name\": \"Fuad \", \"active\": true, \"mobile\": \"073 815 181\", \"contact\": \"Fuad Salum\", \"vehicle\": \"T 320 AAA\", \"vehicleModel\": \"Toyota Corolla\"}], \"employees\": [{\"id\": \"qmmbacra89l3\", \"name\": \"Juma Said\", \"role\": \"Attendant\", \"active\": true, \"mobile\": \"+255 713 111 111\"}, {\"id\": \"bvyllici89l3\", \"name\": \"Neema John\", \"role\": \"Attendant\", \"active\": true, \"mobile\": \"+255 714 222 222\"}, {\"id\": \"v5xdphm389l3\", \"name\": \"Peter Joseph\", \"role\": \"Supervisor\", \"active\": true, \"mobile\": \"+255 715 333 333\"}], \"categories\": [{\"id\": \"yfvh0wrp89l3\", \"name\": \"Tire Service\", \"items\": [{\"id\": \"z21cxpai89l3\", \"name\": \"Puncture Repair\", \"subItems\": [{\"id\": \"slgcpmruq44z\", \"name\": \"Inspect tyre\"}, {\"id\": \"fyatcuv9q44z\", \"name\": \"Remove wheel\"}, {\"id\": \"6lgu07yvq44z\", \"name\": \"Repair / replace\"}, {\"id\": \"14ugjvqoq44z\", \"name\": \"Fit wheel\"}, {\"id\": \"o137czs6q44z\", \"name\": \"Inflate pressure\"}]}, {\"id\": \"0hsz87t589l3\", \"name\": \"Tire Fitting / Replacement\", \"subItems\": [{\"id\": \"xkoamzwcq44z\", \"name\": \"Inspect tyre\"}, {\"id\": \"22ezteh3q44z\", \"name\": \"Remove wheel\"}, {\"id\": \"mbqv5oimq44z\", \"name\": \"Repair / replace\"}, {\"id\": \"l11g8e0mq44z\", \"name\": \"Fit wheel\"}, {\"id\": \"3ff5189dq44z\", \"name\": \"Inflate pressure\"}]}, {\"id\": \"4rschjfd89l3\", \"name\": \"Tube Replacement\", \"subItems\": [{\"id\": \"xnwq57kzq44z\", \"name\": \"Inspect tyre\"}, {\"id\": \"n7cu888xq44z\", \"name\": \"Remove wheel\"}, {\"id\": \"01a2wkraq44z\", \"name\": \"Repair / replace\"}, {\"id\": \"9zcmadn9q44z\", \"name\": \"Fit wheel\"}, {\"id\": \"0z2c7e7nq44z\", \"name\": \"Inflate pressure\"}]}, {\"id\": \"18lbckan89l3\", \"name\": \"Valve Replacement\", \"subItems\": [{\"id\": \"1g9gjfacq44z\", \"name\": \"Remove valve\"}, {\"id\": \"e6gdh1baq44z\", \"name\": \"Fit new valve\"}, {\"id\": \"0z5c3f5aq44z\", \"name\": \"Leak test\"}]}, {\"id\": \"fxbmx7r689l3\", \"name\": \"Wheel Balancing\", \"subItems\": [{\"id\": \"8h5hzgm7q450\", \"name\": \"Remove wheel\"}, {\"id\": \"grisu0j4q450\", \"name\": \"Balance wheel\"}, {\"id\": \"5rov6ssdq450\", \"name\": \"Fit wheel\"}, {\"id\": \"48pv3z73q450\", \"name\": \"Road check\"}]}, {\"id\": \"t2vqdg9j89l3\", \"name\": \"Wheel Alignment\", \"subItems\": [{\"id\": \"h04rnd99q450\", \"name\": \"Inspect alignment\"}, {\"id\": \"gm99970oq450\", \"name\": \"Adjust alignment\"}, {\"id\": \"trp3rlolq450\", \"name\": \"Road test\"}]}, {\"id\": \"kvzdfahe89l3\", \"name\": \"Tire Rotation\", \"subItems\": [{\"id\": \"cgnilublq450\", \"name\": \"Inspect tyre positions\"}, {\"id\": \"ush6k9nuq450\", \"name\": \"Rotate tyres\"}, {\"id\": \"3uji1kwjq450\", \"name\": \"Inflate pressure\"}]}, {\"id\": \"1favjj7c89l3\", \"name\": \"Tire Pressure Adjustment\", \"subItems\": [{\"id\": \"vv9npmhsq450\", \"name\": \"Inspect tyre\"}, {\"id\": \"047cld3tq450\", \"name\": \"Remove wheel\"}, {\"id\": \"028dhnjrq450\", \"name\": \"Repair / replace\"}, {\"id\": \"8ezw1w22q450\", \"name\": \"Fit wheel\"}, {\"id\": \"gubtjh3eq450\", \"name\": \"Inflate pressure\"}]}, {\"id\": \"r6n71wi389l3\", \"name\": \"Rim Cleaning\", \"subItems\": [{\"id\": \"x6nfx1qnq450\", \"name\": \"Inspect tyre\"}, {\"id\": \"d6s26vrjq450\", \"name\": \"Remove wheel\"}, {\"id\": \"6j60i4f0q450\", \"name\": \"Repair / replace\"}, {\"id\": \"09n9vsn6q450\", \"name\": \"Fit wheel\"}, {\"id\": \"ssdeacebq450\", \"name\": \"Inflate pressure\"}]}], \"active\": true}, {\"id\": \"yy25l91h89l3\", \"name\": \"General Service\", \"items\": [{\"id\": \"oq04287889l3\", \"name\": \"Engine Oil Change\", \"subItems\": [{\"id\": \"pkmqaohqq450\", \"name\": \"Drain old oil\"}, {\"id\": \"5dsfx0fsq450\", \"name\": \"Replace engine oil\"}, {\"id\": \"9kijqzmwq450\", \"name\": \"Check oil level\"}]}, {\"id\": \"c9yijr1g89l3\", \"name\": \"Oil Filter Replacement\", \"subItems\": [{\"id\": \"3sl5g6t6q450\", \"name\": \"Remove old oil filter\"}, {\"id\": \"e80z3uhnq450\", \"name\": \"Fit new oil filter\"}, {\"id\": \"l3g2v1q9q450\", \"name\": \"Leak check\"}]}, {\"id\": \"vzvq6f2l89l3\", \"name\": \"Air Filter Cleaning\", \"subItems\": [{\"id\": \"yinqdsedq450\", \"name\": \"Remove air filter\"}, {\"id\": \"b8hqudiiq450\", \"name\": \"Clean air filter\"}, {\"id\": \"twtwwwejq450\", \"name\": \"Recheck fitting\"}]}, {\"id\": \"izpqsvlh89l3\", \"name\": \"Air Filter Replacement\", \"subItems\": [{\"id\": \"lb7luu8pq450\", \"name\": \"Remove air filter\"}, {\"id\": \"12ncn0hhq450\", \"name\": \"Fit new air filter\"}, {\"id\": \"p1r7gxmxq450\", \"name\": \"Recheck fitting\"}]}, {\"id\": \"141gp7n789l3\", \"name\": \"Fuel Filter Replacement\", \"subItems\": [{\"id\": \"j4886dghq450\", \"name\": \"Remove fuel filter\"}, {\"id\": \"oe8l7r5sq450\", \"name\": \"Fit new fuel filter\"}, {\"id\": \"x6kxmlbxq450\", \"name\": \"Leak check\"}]}, {\"id\": \"cz0vq8rw89l3\", \"name\": \"Cabin / AC Filter Replacement\", \"subItems\": [{\"id\": \"z7ui09zfq450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"r0lz5u9cq450\", \"name\": \"Perform service\"}, {\"id\": \"zcr8hd78q450\", \"name\": \"Test and verify\"}]}, {\"id\": \"ab00owpi89l3\", \"name\": \"Spark Plug Replacement\", \"subItems\": [{\"id\": \"i466ngdwq450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"5ya63dcfq450\", \"name\": \"Perform service\"}, {\"id\": \"bdukqub5q450\", \"name\": \"Test and verify\"}]}, {\"id\": \"n3avvqb089l3\", \"name\": \"Gear Oil Change\", \"subItems\": [{\"id\": \"724duq8gq450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"yy5y1w7wq450\", \"name\": \"Perform service\"}, {\"id\": \"6i9r4cwvq450\", \"name\": \"Test and verify\"}]}, {\"id\": \"fn9wdby289l3\", \"name\": \"Differential Oil Change\", \"subItems\": [{\"id\": \"11jzpg6lq450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"ky2tlqgsq450\", \"name\": \"Perform service\"}, {\"id\": \"2mc9fefpq450\", \"name\": \"Test and verify\"}]}, {\"id\": \"lvfhgyjp89l3\", \"name\": \"Brake Fluid Top-up / Change\", \"subItems\": [{\"id\": \"1i8eeoqrq450\", \"name\": \"Inspect brakes\"}, {\"id\": \"s4drl81qq450\", \"name\": \"Adjust / service brakes\"}, {\"id\": \"tbbg26paq450\", \"name\": \"Road test\"}]}, {\"id\": \"ll3n8uso89l3\", \"name\": \"Coolant Top-up / Change\", \"subItems\": [{\"id\": \"uuelpzc3q450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"av0hb1jmq450\", \"name\": \"Perform service\"}, {\"id\": \"1ukkxlocq450\", \"name\": \"Test and verify\"}]}, {\"id\": \"gh1a7b3f89l3\", \"name\": \"Power Steering Fluid Top-up / Change\", \"subItems\": [{\"id\": \"9sox1466q450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"qgqumt3hq450\", \"name\": \"Perform service\"}, {\"id\": \"ivdm5k5fq450\", \"name\": \"Test and verify\"}]}, {\"id\": \"wmolvks889l3\", \"name\": \"Battery Terminal Cleaning\", \"subItems\": [{\"id\": \"8clvhrd7q450\", \"name\": \"Clean terminals\"}, {\"id\": \"cq4e060wq450\", \"name\": \"Tighten terminals\"}, {\"id\": \"ztjzycyqq450\", \"name\": \"Check charging\"}]}, {\"id\": \"flpvvtci89l3\", \"name\": \"Brake Inspection & Adjustment\", \"subItems\": [{\"id\": \"umuq86niq450\", \"name\": \"Engine check\"}, {\"id\": \"s7as3pshq450\", \"name\": \"Fluid level check\"}, {\"id\": \"3ur1r2pyq450\", \"name\": \"Lights check\"}, {\"id\": \"lnb28abmq450\", \"name\": \"Brake check\"}, {\"id\": \"c100pkjxq450\", \"name\": \"Road test\"}]}, {\"id\": \"says77ev89l3\", \"name\": \"General Vehicle Inspection\", \"subItems\": [{\"id\": \"nonawrabq450\", \"name\": \"Engine check\"}, {\"id\": \"p8p9qx3sq450\", \"name\": \"Fluid level check\"}, {\"id\": \"fu1na0jhq450\", \"name\": \"Lights check\"}, {\"id\": \"tljpiq63q450\", \"name\": \"Brake check\"}, {\"id\": \"vspvd8djq450\", \"name\": \"Road test\"}]}, {\"id\": \"m1at1g7i89l3\", \"name\": \"Service Labour Charge\", \"subItems\": [{\"id\": \"4la9fwgtq450\", \"name\": \"Inspect vehicle\"}, {\"id\": \"d7ozrdf8q450\", \"name\": \"Perform service\"}, {\"id\": \"uisx8eqmq450\", \"name\": \"Test and verify\"}]}], \"active\": true}, {\"id\": \"d43ytz4h89l3\", \"name\": \"Car Wash\", \"items\": [{\"id\": \"kcpom5l789l3\", \"name\": \"Basic Wash\", \"subItems\": [{\"id\": \"l4zjj7e5q450\", \"name\": \"Exterior body wash\"}, {\"id\": \"dv3vn8eoq450\", \"name\": \"Interior cleaning\"}, {\"id\": \"rm0gcfi4q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"910p7pb4q450\", \"name\": \"Tyre cleaning\"}]}, {\"id\": \"dtaac3wt89l3\", \"name\": \"Standard Wash\", \"subItems\": [{\"id\": \"1tf3wtxkq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"rxfhuwmrq450\", \"name\": \"Interior cleaning\"}, {\"id\": \"xzjf4zosq450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"v4qsv1wsq450\", \"name\": \"Tyre cleaning\"}]}, {\"id\": \"0ndqfpg789l3\", \"name\": \"Full Wash\", \"subItems\": [{\"id\": \"yya098kzq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"n6mip7jlq450\", \"name\": \"Interior cleaning\"}, {\"id\": \"sbv1hf72q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"7tiu2l1tq450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"eaozusleq450\", \"name\": \"Dashboard polish\"}, {\"id\": \"czit7e0hq450\", \"name\": \"Tyre shine\"}]}, {\"id\": \"9petf3qn89l3\", \"name\": \"Premium Wash\", \"subItems\": [{\"id\": \"jrx5wlwcq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"zbkujrfdq450\", \"name\": \"Interior cleaning\"}, {\"id\": \"aiyvl0h9q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"aqsbz5neq450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"pww9t092q450\", \"name\": \"Dashboard polish\"}, {\"id\": \"k1l9cd7gq450\", \"name\": \"Tyre shine\"}]}, {\"id\": \"iynyq2y389l3\", \"name\": \"Engine Wash\", \"subItems\": [{\"id\": \"1u15nilbq450\", \"name\": \"Engine bay wash\"}, {\"id\": \"7ssn2u7rq450\", \"name\": \"Engine degreasing\"}, {\"id\": \"tf0nj2tiq450\", \"name\": \"Final engine wipe\"}]}, {\"id\": \"wcnphqn789l3\", \"name\": \"Underbody Wash\", \"subItems\": [{\"id\": \"ulkojw7eq450\", \"name\": \"Underbody wash\"}, {\"id\": \"xmgnjtqqq450\", \"name\": \"Mud removal\"}, {\"id\": \"75w23eihq450\", \"name\": \"Chassis rinse\"}]}, {\"id\": \"9orjohj989l3\", \"name\": \"Interior Deep Cleaning\", \"subItems\": [{\"id\": \"83cwofz3q450\", \"name\": \"Exterior body wash\"}, {\"id\": \"8xkv47d6q450\", \"name\": \"Interior cleaning\"}, {\"id\": \"fnqpjzo1q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"6cih8122q450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"5g1cmvvfq450\", \"name\": \"Seat cleaning\"}, {\"id\": \"rxrwiuz8q450\", \"name\": \"Carpet cleaning\"}]}, {\"id\": \"og3gzyao89l3\", \"name\": \"Seat Cleaning Package\", \"subItems\": [{\"id\": \"rx5n5agwq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"3msmv3q5q450\", \"name\": \"Interior cleaning\"}, {\"id\": \"a96tlxk2q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"wu4k3dhbq450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"7wd8lkk7q450\", \"name\": \"Seat cleaning\"}, {\"id\": \"bhvzlnd2q450\", \"name\": \"Carpet cleaning\"}]}, {\"id\": \"zbcjogrz89l3\", \"name\": \"Carpet / Floor Mat Cleaning\", \"subItems\": [{\"id\": \"ohwgu1l3q450\", \"name\": \"Exterior body wash\"}, {\"id\": \"xomlamzvq450\", \"name\": \"Interior cleaning\"}, {\"id\": \"3wgm4hveq450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"co0aeh7wq450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"w350j7acq450\", \"name\": \"Seat cleaning\"}, {\"id\": \"p91tbbyaq450\", \"name\": \"Carpet cleaning\"}]}, {\"id\": \"um4jash989l3\", \"name\": \"Body Polish / Waxing\", \"subItems\": [{\"id\": \"gqkkiy2mq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"95r0pj06q450\", \"name\": \"Interior cleaning\"}, {\"id\": \"xgakf6j7q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"n42t3qawq450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"s6ptha18q450\", \"name\": \"Body polish\"}, {\"id\": \"uuglylklq450\", \"name\": \"Waxing\"}]}, {\"id\": \"j0p4liw089l3\", \"name\": \"Complete Detailing\", \"subItems\": [{\"id\": \"wrgs81dqq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"fpuckygjq450\", \"name\": \"Interior cleaning\"}, {\"id\": \"byw37gghq450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"nvqa1lnbq450\", \"name\": \"Tyre cleaning\"}, {\"id\": \"3d030ufmq450\", \"name\": \"Dashboard polish\"}, {\"id\": \"3ex6zbhxq450\", \"name\": \"Tyre shine\"}, {\"id\": \"ze39orrkq450\", \"name\": \"Seat cleaning\"}, {\"id\": \"3wfg0gzeq450\", \"name\": \"Carpet cleaning\"}, {\"id\": \"de3ouq71q450\", \"name\": \"Body polish\"}, {\"id\": \"vq486wqfq450\", \"name\": \"Waxing\"}]}, {\"id\": \"lg6z7som89l3\", \"name\": \"Motorcycle Wash\", \"subItems\": [{\"id\": \"4bl8y8uaq450\", \"name\": \"Exterior body wash\"}, {\"id\": \"9k0j8yq7q450\", \"name\": \"Interior cleaning\"}, {\"id\": \"zxcg1k89q450\", \"name\": \"Vacuum cleaning\"}, {\"id\": \"pyshm4ncq450\", \"name\": \"Tyre cleaning\"}]}], \"active\": true}], \"_syncUserId\": 5, \"commissions\": [{\"id\": \"nnsdl2e1fln7\", \"date\": \"2026-05-19\", \"rate\": \"35\", \"type\": \"Percent\", \"jobId\": \"fubhsb17dy0o\", \"amount\": 34300, \"attendantId\": \"qmmbacra89l3\"}, {\"id\": \"jl5t32o7kz2l\", \"date\": \"2026-05-19\", \"rate\": \"3000\", \"type\": \"Amount\", \"jobId\": \"mgyh85cvfxx6\", \"amount\": 3000, \"attendantId\": \"bvyllici89l3\"}, {\"id\": \"3uge0ktlolzi\", \"date\": \"2026-05-19\", \"rate\": \"35\", \"type\": \"Percent\", \"jobId\": \"ajupc1eckvkz\", \"amount\": 17500, \"attendantId\": \"v5xdphm389l3\"}, {\"id\": \"skst82jmhzsw\", \"date\": \"2026-05-20\", \"rate\": \"45\", \"type\": \"Percent\", \"jobId\": \"x7l6c7fgd00x\", \"amount\": 9000, \"attendantId\": \"qmmbacra89l3\"}], \"expenseItems\": [{\"id\": \"x4u5ivag89l3\", \"name\": \"Utilities\"}, {\"id\": \"asxaf05i89l3\", \"name\": \"Consumables\"}, {\"id\": \"3j3vd5ph89l3\", \"name\": \"Rent\"}, {\"id\": \"565mkvjg89l3\", \"name\": \"Salaries\"}, {\"id\": \"3kpfy0sb89l3\", \"name\": \"Maintenance\"}, {\"id\": \"lxj4rg4489l3\", \"name\": \"Transport\"}]}','2026-05-26 19:07:17','2026-05-26 22:09:43');
/*!40000 ALTER TABLE `vasma_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'vasma_db'
--

--
-- Dumping routines for database 'vasma_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-27 13:21:16
