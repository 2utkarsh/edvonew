-- =============================================================================
-- Edvo Platform - Complete Database Seed File
-- =============================================================================
-- Idempotent: safe to run multiple times (uses CREATE TABLE IF NOT EXISTS + INSERT IGNORE).
-- Default password for ALL seeded users is "password".
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─── LARAVEL CORE ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `payload` longtext NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── USERS & AUTH ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'student',
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `status` int DEFAULT 1,
  `photo` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `social_links` json DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `instructor_id` bigint unsigned DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── MEDIA ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `media` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint unsigned NOT NULL,
  `uuid` char(36) DEFAULT NULL,
  `collection_name` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `disk` varchar(255) NOT NULL,
  `conversions_disk` varchar(255) DEFAULT NULL,
  `size` bigint unsigned NOT NULL,
  `manipulations` json NOT NULL,
  `custom_properties` json NOT NULL,
  `generated_conversions` json NOT NULL,
  `responsive_images` json NOT NULL,
  `order_column` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `media_uuid_unique` (`uuid`),
  KEY `media_model_type_model_id_index` (`model_type`,`model_id`),
  KEY `media_order_column_index` (`order_column`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint unsigned NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── PAYMENT SETTINGS ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `payment_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `fields` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_settings_type_unique` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── INSTRUCTORS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `instructors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `skills` json NOT NULL,
  `biography` text NOT NULL,
  `resume` varchar(255) NOT NULL DEFAULT '',
  `designation` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `payout_methods` json NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `instructors_user_id_foreign` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── COURSE CATEGORIES ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `course_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `sort` int NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `icon` varchar(255) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_category_children` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `sort` int NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `icon` varchar(255) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `course_category_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── COURSES ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `courses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `course_type` varchar(255) NOT NULL DEFAULT 'recorded',
  `status` varchar(255) NOT NULL DEFAULT 'draft',
  `level` varchar(255) NOT NULL DEFAULT 'beginner',
  `short_description` text NOT NULL,
  `description` text,
  `language` varchar(255) DEFAULT NULL,
  `pricing_type` varchar(255) NOT NULL DEFAULT 'free',
  `price` double(10,2) DEFAULT NULL,
  `discount` tinyint(1) NOT NULL DEFAULT 0,
  `discount_price` double(10,2) DEFAULT NULL,
  `drip_content` tinyint(1) NOT NULL DEFAULT 0,
  `thumbnail` varchar(255) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `preview` varchar(255) DEFAULT NULL,
  `expiry_type` varchar(255) NOT NULL DEFAULT 'lifetime',
  `expiry_duration` varchar(255) DEFAULT NULL,
  `created_from` varchar(255) NOT NULL DEFAULT 'web',
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_keywords` text,
  `meta_description` text,
  `og_title` varchar(255) DEFAULT NULL,
  `og_description` text,
  `instructor_id` bigint unsigned NOT NULL,
  `course_category_id` bigint unsigned NOT NULL,
  `course_category_child_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courses_instructor_id_foreign` (`instructor_id`),
  KEY `courses_course_category_id_foreign` (`course_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_sections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `sort` int NOT NULL DEFAULT 0,
  `user_id` bigint unsigned NOT NULL,
  `course_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `section_lessons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `sort` int NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `lesson_type` varchar(255) NOT NULL DEFAULT 'video',
  `lesson_src` varchar(255) DEFAULT NULL,
  `lesson_provider` varchar(255) DEFAULT NULL,
  `embed_source` text DEFAULT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `is_free` int NOT NULL DEFAULT 0,
  `description` text,
  `summary` text,
  `course_id` bigint unsigned NOT NULL,
  `course_section_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lesson_resources` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `resource` varchar(255) NOT NULL,
  `section_lesson_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── QUIZZES ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `section_quizzes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `duration` time NOT NULL,
  `hours` int NOT NULL DEFAULT 0,
  `minutes` int NOT NULL DEFAULT 0,
  `seconds` int NOT NULL DEFAULT 0,
  `total_mark` int NOT NULL,
  `pass_mark` int NOT NULL,
  `retake` int NOT NULL DEFAULT 1,
  `drip_rule` int DEFAULT NULL,
  `summary` int DEFAULT NULL,
  `num_questions` int DEFAULT NULL,
  `course_id` bigint unsigned NOT NULL,
  `course_section_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `options` json DEFAULT NULL,
  `answer` json DEFAULT NULL,
  `sort` int NOT NULL,
  `section_quiz_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `question_answers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `answers` json NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `quiz_question_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `quiz_submissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `attempts` int NOT NULL,
  `correct_answers` int NOT NULL,
  `incorrect_answers` int NOT NULL,
  `total_marks` int NOT NULL,
  `is_passed` tinyint(1) NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `section_quiz_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `course_assignments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `total_mark` int NOT NULL,
  `pass_mark` int NOT NULL,
  `retake` int NOT NULL DEFAULT 1,
  `summary` text,
  `deadline` datetime NOT NULL,
  `late_submission` tinyint(1) NOT NULL DEFAULT 0,
  `late_total_mark` int NOT NULL DEFAULT 0,
  `late_deadline` datetime DEFAULT NULL,
  `course_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `assignment_submissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `attachment_type` varchar(255) NOT NULL DEFAULT 'url',
  `attachment_path` varchar(255) NOT NULL,
  `comment` text,
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `marks_obtained` decimal(8,2) NOT NULL DEFAULT 0,
  `instructor_feedback` text,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `attempt_number` int NOT NULL DEFAULT 1,
  `is_late` tinyint(1) NOT NULL DEFAULT 0,
  `user_id` bigint unsigned NOT NULL,
  `course_assignment_id` bigint unsigned NOT NULL,
  `grader_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── ENROLLMENTS, PROGRESS, REVIEWS ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `course_enrollments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `enrollment_type` varchar(255) NOT NULL,
  `entry_date` timestamp NOT NULL,
  `expiry_date` timestamp NULL DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `course_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_progress` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `total_lessons` int NOT NULL DEFAULT 0,
  `completed_lessons` int NOT NULL DEFAULT 0,
  `progress_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `user_id` bigint unsigned NOT NULL,
  `course_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `review` text NOT NULL,
  `rating` int NOT NULL,
  `likes` json DEFAULT NULL,
  `dislikes` json DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `course_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── COURSE EXTRAS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `course_coupons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `discount` decimal(10,2) NOT NULL,
  `discount_type` varchar(255) NOT NULL DEFAULT 'percentage',
  `valid_from` timestamp NULL DEFAULT NULL,
  `valid_to` timestamp NULL DEFAULT NULL,
  `usage_type` varchar(255) NOT NULL DEFAULT 'unlimited',
  `usage_limit` int DEFAULT NULL,
  `used_count` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `course_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_coupons_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_certificates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `identifier` varchar(255) NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `course_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_certificates_identifier_unique` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_wishlists` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `course_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_carts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `course_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_live_classes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `class_topic` varchar(255) NOT NULL,
  `provider` varchar(255) NOT NULL,
  `class_date_and_time` timestamp NOT NULL,
  `class_note` text,
  `additional_info` json DEFAULT NULL,
  `course_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_requirements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `course_id` bigint unsigned NOT NULL,
  `requirement` text,
  `sort` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_outcomes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `course_id` bigint unsigned NOT NULL,
  `outcome` text,
  `sort` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_faqs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `course_id` bigint unsigned NOT NULL,
  `question` text,
  `answer` text,
  `sort` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── WATCH HISTORY & FORUMS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `watch_histories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `prev_watching_id` varchar(255) DEFAULT NULL,
  `prev_watching_type` varchar(255) DEFAULT NULL,
  `current_section_id` varchar(255) NOT NULL,
  `current_watching_id` varchar(255) NOT NULL,
  `current_watching_type` varchar(255) NOT NULL,
  `next_watching_id` varchar(255) DEFAULT NULL,
  `next_watching_type` varchar(255) DEFAULT NULL,
  `completed_watching` json DEFAULT NULL,
  `completion_date` timestamp NULL DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `course_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_forums` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `likes` json DEFAULT NULL,
  `dislikes` json DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `course_id` bigint unsigned NOT NULL,
  `section_lesson_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `course_forum_replies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `course_forum_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── NAVBARS & FOOTERS ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `navbars` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `navbar_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sort` int NOT NULL,
  `type` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `value` varchar(255) DEFAULT NULL,
  `items` json DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `navbar_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `footers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `footer_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sort` int NOT NULL,
  `type` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `items` json DEFAULT NULL,
  `footer_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── PAGES ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `pages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'inner_page',
  `title` varchar(255) NOT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `favicon` varchar(255) DEFAULT NULL,
  `description` text,
  `meta_description` text,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `page_sections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `sort` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `sub_title` varchar(255) DEFAULT NULL,
  `description` text,
  `thumbnail` varchar(255) DEFAULT NULL,
  `background_image` varchar(255) DEFAULT NULL,
  `background_color` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `flags` json DEFAULT NULL,
  `properties` json DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `page_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── MISC TABLES ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `blogs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext,
  `thumbnail` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `newsletters` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `subscribes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscribes_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `subject` varchar(190) DEFAULT NULL,
  `message` text NOT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `temp_stores` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) DEFAULT NULL,
  `properties` json DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `chunked_uploads` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `disk` varchar(255) NOT NULL DEFAULT 'local',
  `mime_type` varchar(255) DEFAULT NULL,
  `size` bigint NOT NULL DEFAULT 0,
  `upload_id` varchar(255) DEFAULT NULL,
  `key` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `chunks_completed` int NOT NULL DEFAULT 0,
  `total_chunks` int NOT NULL DEFAULT 0,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `chunked_upload_parts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `upload_id` bigint unsigned NOT NULL,
  `part_number` int NOT NULL,
  `etag` varchar(255) NOT NULL,
  `size` bigint NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chunked_upload_parts_upload_id_part_number_unique` (`upload_id`,`part_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── JOB CIRCULARS & ALUMNI ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `job_circulars` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `company` varchar(190) DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `experience_level` varchar(255) NOT NULL DEFAULT 'mid',
  `location` varchar(255) NOT NULL,
  `salary_min` decimal(10,2) DEFAULT NULL,
  `salary_max` decimal(10,2) DEFAULT NULL,
  `salary_currency` varchar(3) NOT NULL DEFAULT 'USD',
  `salary_negotiable` tinyint(1) NOT NULL DEFAULT 0,
  `application_deadline` date NOT NULL,
  `contact_email` varchar(255) NOT NULL,
  `skills_required` json DEFAULT NULL,
  `positions_available` int NOT NULL DEFAULT 1,
  `applicants` int unsigned NOT NULL DEFAULT 0,
  `job_type` varchar(255) NOT NULL DEFAULT 'full-time',
  `work_type` varchar(255) NOT NULL DEFAULT 'on-site',
  `status` varchar(255) NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `job_circulars_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `alumni_achievements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `bootcamp_id` bigint unsigned DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `achievement_date` datetime NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `testimonial` text,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `salary_range` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- SEED DATA
-- =============================================================================
-- Password hash below = "password" (bcrypt cost 10)
-- To use Admin@123: php -r "echo password_hash('Admin@123', PASSWORD_BCRYPT);"
-- =============================================================================

INSERT IGNORE INTO `users`
  (`id`,`name`,`email`,`role`,`password`,`status`,`email_verified_at`,`created_at`,`updated_at`)
VALUES
  (1,'Admin User','admin@edvo.in','admin','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,'2024-01-01 00:00:00','2024-01-01 00:00:00','2024-01-01 00:00:00'),
  (2,'Dr. Rajesh Kumar','rajesh@edvo.in','instructor','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,'2024-01-01 00:00:00','2024-01-01 00:00:00','2024-01-01 00:00:00'),
  (3,'Prof. Alakh Pandey','alakh@edvo.in','instructor','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,'2024-01-01 00:00:00','2024-01-01 00:00:00','2024-01-01 00:00:00'),
  (4,'Arjun Sharma','arjun@student.edvo.in','student','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,'2024-01-01 00:00:00','2024-01-01 00:00:00','2024-01-01 00:00:00'),
  (5,'Priya Singh','priya@student.edvo.in','student','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,'2024-01-01 00:00:00','2024-01-01 00:00:00','2024-01-01 00:00:00'),
  (6,'Rahul Verma','rahul@student.edvo.in','student','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,'2024-01-01 00:00:00','2024-01-01 00:00:00','2024-01-01 00:00:00'),
  (7,'Sneha Patel','sneha@student.edvo.in','student','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,'2024-01-01 00:00:00','2024-01-01 00:00:00','2024-01-01 00:00:00'),
  (8,'Vikram Nair','vikram@student.edvo.in','student','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,'2024-01-01 00:00:00','2024-01-01 00:00:00','2024-01-01 00:00:00');

INSERT IGNORE INTO `instructors`
  (`id`,`user_id`,`designation`,`biography`,`resume`,`skills`,`payout_methods`,`status`,`created_at`,`updated_at`)
VALUES
  (1,2,'Senior Python Developer','Dr. Rajesh Kumar is a seasoned Python developer with 12+ years of industry experience. He has trained over 89,000 students worldwide.','','["Python","Django","Data Science","Machine Learning","Algorithms"]','[]','approved','2024-01-01 00:00:00','2024-01-01 00:00:00'),
  (2,3,'Physics Professor','Prof. Alakh Pandey is a renowned physics educator known for making complex JEE/NEET concepts simple and intuitive for students.','','["Physics","JEE","NEET","Mechanics","Electromagnetism","Thermodynamics"]','[]','approved','2024-01-01 00:00:00','2024-01-01 00:00:00');

INSERT IGNORE INTO `course_categories`
  (`id`,`title`,`slug`,`sort`,`status`,`created_at`,`updated_at`)
VALUES
  (1,'Programming','programming',1,1,'2024-01-01 00:00:00','2024-01-01 00:00:00'),
  (2,'Physics','physics',2,1,'2024-01-01 00:00:00','2024-01-01 00:00:00'),
  (3,'Web Development','web-development',3,1,'2024-01-01 00:00:00','2024-01-01 00:00:00'),
  (4,'Mathematics','mathematics',4,1,'2024-01-01 00:00:00','2024-01-01 00:00:00'),
  (5,'Data Science','data-science',5,1,'2024-01-01 00:00:00','2024-01-01 00:00:00');

INSERT IGNORE INTO `courses`
  (`id`,`title`,`slug`,`course_type`,`status`,`level`,`short_description`,`description`,`language`,`pricing_type`,`price`,`discount`,`discount_price`,`thumbnail`,`instructor_id`,`course_category_id`,`created_at`,`updated_at`)
VALUES
  (1,'Complete Python Programming Masterclass','complete-python-programming-masterclass','recorded','published','beginner','Learn Python from scratch to advanced. Build real-world projects and master data structures, algorithms, and web development.','This comprehensive Python course takes you from absolute beginner to advanced developer. You will build 10+ real-world projects, master data structures and algorithms, create web applications with Django, and automate repetitive tasks.','English','paid',2999.00,1,2999.00,'/images/courses/python.jpg',1,1,'2024-01-15 00:00:00','2024-03-10 00:00:00'),
  (2,'Physics Wallah - JEE Advanced Complete Course','physics-wallah-jee-advanced','recorded','published','advanced','Comprehensive physics course for JEE Advanced. Cover mechanics, electromagnetism, thermodynamics, and modern physics.','Master every topic in the JEE Advanced physics syllabus with Prof. Alakh Pandey. This course covers mechanics, electromagnetism, thermodynamics, optics, and modern physics with 580+ video lectures.','Hindi','paid',4999.00,1,4999.00,'/images/courses/physics.jpg',2,2,'2024-02-01 00:00:00','2024-03-08 00:00:00'),
  (3,'Full Stack Web Development Bootcamp','full-stack-web-development-bootcamp','recorded','published','intermediate','Become a full stack developer. Learn React, Node.js, MongoDB, TypeScript, and build production-ready applications.','This bootcamp covers everything you need to become a professional full stack developer. From HTML/CSS basics to advanced React, Node.js APIs, MongoDB databases, and cloud deployment.','English','paid',3499.00,1,3499.00,'/images/courses/fullstack.jpg',1,3,'2024-01-20 00:00:00','2024-03-05 00:00:00'),
  (4,'Mathematics for Competitive Programming','mathematics-competitive-programming','recorded','published','intermediate','Master mathematical concepts essential for competitive programming and coding interviews.','Deep dive into number theory, combinatorics, probability, graph theory, and game theory — all the math you need to excel at competitive programming.','English','paid',1999.00,1,1999.00,'/images/courses/math.jpg',1,4,'2024-02-10 00:00:00','2024-03-01 00:00:00'),
  (5,'Data Structures & Algorithms in Java','data-structures-algorithms-java','recorded','published','beginner','Ace your coding interviews with comprehensive DSA coverage. Perfect for FAANG preparation.','Master all essential data structures and algorithms using Java. This course covers arrays, linked lists, trees, graphs, sorting, searching, dynamic programming, and more.','English','paid',2499.00,1,2499.00,'/images/courses/dsa.jpg',1,5,'2024-01-25 00:00:00','2024-03-07 00:00:00');

INSERT IGNORE INTO `course_sections`
  (`id`,`title`,`sort`,`user_id`,`course_id`,`created_at`,`updated_at`)
VALUES
  (1,'Introduction to Python',1,2,1,'2024-01-15 00:00:00','2024-01-15 00:00:00'),
  (2,'Mechanics & Kinematics',1,3,2,'2024-02-01 00:00:00','2024-02-01 00:00:00'),
  (3,'HTML, CSS & JavaScript Fundamentals',1,2,3,'2024-01-20 00:00:00','2024-01-20 00:00:00'),
  (4,'Number Theory Basics',1,2,4,'2024-02-10 00:00:00','2024-02-10 00:00:00'),
  (5,'Arrays & Linked Lists',1,2,5,'2024-01-25 00:00:00','2024-01-25 00:00:00');

INSERT IGNORE INTO `section_lessons`
  (`id`,`title`,`sort`,`status`,`lesson_type`,`duration`,`is_free`,`course_id`,`course_section_id`,`created_at`,`updated_at`)
VALUES
  (1,'Welcome to Python',1,1,'video','10:00',1,1,1,'2024-01-15 00:00:00','2024-01-15 00:00:00'),
  (2,'Installing Python & Setting Up',2,1,'video','15:00',1,1,1,'2024-01-15 00:00:00','2024-01-15 00:00:00'),
  (3,'Introduction to Mechanics',1,1,'video','20:00',1,2,2,'2024-02-01 00:00:00','2024-02-01 00:00:00'),
  (4,'Kinematics - Motion in 1D',2,1,'video','35:00',0,2,2,'2024-02-01 00:00:00','2024-02-01 00:00:00'),
  (5,'HTML Basics',1,1,'video','18:00',1,3,3,'2024-01-20 00:00:00','2024-01-20 00:00:00'),
  (6,'CSS Styling & Flexbox',2,1,'video','25:00',0,3,3,'2024-01-20 00:00:00','2024-01-20 00:00:00'),
  (7,'Divisibility & Prime Numbers',1,1,'video','22:00',1,4,4,'2024-02-10 00:00:00','2024-02-10 00:00:00'),
  (8,'Modular Arithmetic',2,1,'video','28:00',0,4,4,'2024-02-10 00:00:00','2024-02-10 00:00:00'),
  (9,'Arrays - Introduction',1,1,'video','16:00',1,5,5,'2024-01-25 00:00:00','2024-01-25 00:00:00'),
  (10,'Linked Lists - Singly & Doubly',2,1,'video','30:00',0,5,5,'2024-01-25 00:00:00','2024-01-25 00:00:00');

INSERT IGNORE INTO `course_enrollments`
  (`id`,`enrollment_type`,`entry_date`,`user_id`,`course_id`,`created_at`,`updated_at`)
VALUES
  (1,'paid','2024-01-20 00:00:00',4,1,'2024-01-20 00:00:00','2024-01-20 00:00:00'),
  (2,'paid','2024-02-05 00:00:00',5,2,'2024-02-05 00:00:00','2024-02-05 00:00:00'),
  (3,'paid','2024-01-25 00:00:00',6,3,'2024-01-25 00:00:00','2024-01-25 00:00:00'),
  (4,'paid','2024-02-15 00:00:00',7,4,'2024-02-15 00:00:00','2024-02-15 00:00:00'),
  (5,'paid','2024-01-30 00:00:00',8,5,'2024-01-30 00:00:00','2024-01-30 00:00:00');

INSERT IGNORE INTO `course_reviews`
  (`id`,`review`,`rating`,`user_id`,`course_id`,`created_at`,`updated_at`)
VALUES
  (1,'Excellent course! Dr. Rajesh explains Python concepts very clearly. Highly recommended for beginners.',5,4,1,'2024-02-01 00:00:00','2024-02-01 00:00:00'),
  (2,'Great content and well-structured curriculum. The projects are very practical and industry-relevant.',5,5,1,'2024-02-10 00:00:00','2024-02-10 00:00:00'),
  (3,'Good course overall. Some sections could be more detailed but the fundamentals are covered well.',4,6,1,'2024-02-15 00:00:00','2024-02-15 00:00:00'),
  (4,'Prof. Alakh is simply the best physics teacher. His explanations make even the hardest topics easy.',5,4,2,'2024-02-20 00:00:00','2024-02-20 00:00:00'),
  (5,'This course helped me crack JEE Advanced. The problem-solving approach is outstanding.',5,7,2,'2024-02-25 00:00:00','2024-02-25 00:00:00'),
  (6,'Absolutely brilliant course. Every JEE aspirant must take this. Worth every rupee.',5,8,2,'2024-03-01 00:00:00','2024-03-01 00:00:00'),
  (7,'Comprehensive full stack course. Learned React, Node.js and deployed my first app to production.',5,5,3,'2024-02-05 00:00:00','2024-02-05 00:00:00'),
  (8,'Very good bootcamp. The projects are real-world and the instructor explains everything step by step.',4,6,3,'2024-02-12 00:00:00','2024-02-12 00:00:00'),
  (9,'Loved the course structure. Went from zero to building full stack apps in 3 months.',5,7,3,'2024-02-18 00:00:00','2024-02-18 00:00:00'),
  (10,'Best math course for competitive programming. Number theory section is especially well done.',5,4,4,'2024-03-01 00:00:00','2024-03-01 00:00:00'),
  (11,'Helped me improve my Codeforces rating significantly. Highly recommended.',5,8,4,'2024-03-05 00:00:00','2024-03-05 00:00:00'),
  (12,'Good course but could use more practice problems. The theory is explained very well.',4,5,4,'2024-03-08 00:00:00','2024-03-08 00:00:00'),
  (13,'Perfect DSA course for interview prep. Solved 200+ problems and got placed at a top MNC.',5,6,5,'2024-02-08 00:00:00','2024-02-08 00:00:00'),
  (14,'Great explanations of complex algorithms. The Java implementations are clean and easy to follow.',4,7,5,'2024-02-14 00:00:00','2024-02-14 00:00:00'),
  (15,'Excellent course for FAANG preparation. The dynamic programming section alone is worth the price.',5,8,5,'2024-02-20 00:00:00','2024-02-20 00:00:00');

INSERT IGNORE INTO `course_requirements`
  (`id`,`course_id`,`requirement`,`sort`,`created_at`,`updated_at`)
VALUES
  (1,1,'No programming experience needed — we start from absolute zero',1,'2024-01-15 00:00:00','2024-01-15 00:00:00'),
  (2,1,'A computer with internet access (Windows, Mac, or Linux)',2,'2024-01-15 00:00:00','2024-01-15 00:00:00'),
  (3,1,'Willingness to learn and practice daily',3,'2024-01-15 00:00:00','2024-01-15 00:00:00'),
  (4,2,'Basic understanding of high school physics',1,'2024-02-01 00:00:00','2024-02-01 00:00:00'),
  (5,2,'Knowledge of basic calculus (differentiation and integration)',2,'2024-02-01 00:00:00','2024-02-01 00:00:00'),
  (6,2,'Dedication and consistent practice — JEE requires hard work',3,'2024-02-01 00:00:00','2024-02-01 00:00:00'),
  (7,3,'Basic HTML, CSS, and JavaScript knowledge',1,'2024-01-20 00:00:00','2024-01-20 00:00:00'),
  (8,3,'Computer with at least 8GB RAM',2,'2024-01-20 00:00:00','2024-01-20 00:00:00'),
  (9,3,'No prior framework experience required',3,'2024-01-20 00:00:00','2024-01-20 00:00:00'),
  (10,4,'Basic programming knowledge in any language',1,'2024-02-10 00:00:00','2024-02-10 00:00:00'),
  (11,4,'High school level mathematics',2,'2024-02-10 00:00:00','2024-02-10 00:00:00'),
  (12,4,'Familiarity with competitive programming platforms is a plus',3,'2024-02-10 00:00:00','2024-02-10 00:00:00'),
  (13,5,'Basic Java programming knowledge (variables, loops, functions)',1,'2024-01-25 00:00:00','2024-01-25 00:00:00'),
  (14,5,'Understanding of loops and conditional statements',2,'2024-01-25 00:00:00','2024-01-25 00:00:00'),
  (15,5,'No prior DSA knowledge required',3,'2024-01-25 00:00:00','2024-01-25 00:00:00');

INSERT IGNORE INTO `course_outcomes`
  (`id`,`course_id`,`outcome`,`sort`,`created_at`,`updated_at`)
VALUES
  (1,1,'Master Python fundamentals and advanced concepts including OOP and decorators',1,'2024-01-15 00:00:00','2024-01-15 00:00:00'),
  (2,1,'Build 10+ real-world projects including web apps and automation scripts',2,'2024-01-15 00:00:00','2024-01-15 00:00:00'),
  (3,1,'Learn data structures and algorithms in Python',3,'2024-01-15 00:00:00','2024-01-15 00:00:00'),
  (4,1,'Create web applications with Django and REST APIs',4,'2024-01-15 00:00:00','2024-01-15 00:00:00'),
  (5,2,'Master all JEE Advanced physics topics with deep conceptual understanding',1,'2024-02-01 00:00:00','2024-02-01 00:00:00'),
  (6,2,'Solve complex numerical problems with speed and accuracy',2,'2024-02-01 00:00:00','2024-02-01 00:00:00'),
  (7,2,'Understand advanced concepts in mechanics, electromagnetism, and modern physics',3,'2024-02-01 00:00:00','2024-02-01 00:00:00'),
  (8,2,'Crack IIT-JEE Advanced with confidence',4,'2024-02-01 00:00:00','2024-02-01 00:00:00'),
  (9,3,'Build complete full stack web applications from scratch',1,'2024-01-20 00:00:00','2024-01-20 00:00:00'),
  (10,3,'Master React, Next.js, Node.js, and MongoDB',2,'2024-01-20 00:00:00','2024-01-20 00:00:00'),
  (11,3,'Create and consume REST APIs with authentication',3,'2024-01-20 00:00:00','2024-01-20 00:00:00'),
  (12,3,'Deploy production applications to cloud platforms',4,'2024-01-20 00:00:00','2024-01-20 00:00:00'),
  (13,4,'Master number theory, combinatorics, and probability for competitive programming',1,'2024-02-10 00:00:00','2024-02-10 00:00:00'),
  (14,4,'Solve graph theory and game theory problems efficiently',2,'2024-02-10 00:00:00','2024-02-10 00:00:00'),
  (15,4,'Improve Codeforces and LeetCode ratings significantly',3,'2024-02-10 00:00:00','2024-02-10 00:00:00'),
  (16,4,'Apply mathematical thinking to algorithm design',4,'2024-02-10 00:00:00','2024-02-10 00:00:00'),
  (17,5,'Master all essential data structures: arrays, trees, graphs, heaps, and more',1,'2024-01-25 00:00:00','2024-01-25 00:00:00'),
  (18,5,'Understand algorithm complexity and Big-O analysis',2,'2024-01-25 00:00:00','2024-01-25 00:00:00'),
  (19,5,'Solve 200+ coding problems across all difficulty levels',3,'2024-01-25 00:00:00','2024-01-25 00:00:00'),
  (20,5,'Crack technical interviews at FAANG and top tech companies',4,'2024-01-25 00:00:00','2024-01-25 00:00:00');

INSERT IGNORE INTO `job_circulars`
  (`id`,`title`,`company`,`slug`,`description`,`experience_level`,`location`,`salary_min`,`salary_max`,`salary_currency`,`salary_negotiable`,`application_deadline`,`contact_email`,`skills_required`,`positions_available`,`applicants`,`job_type`,`work_type`,`status`,`created_at`,`updated_at`)
VALUES
  (1,'Senior Full Stack Developer','TechCorp Solutions','senior-full-stack-developer-techcorp','We are looking for an experienced Full Stack Developer to join our growing team. You will be responsible for developing scalable web applications using modern technologies including React, Node.js, and cloud platforms.','senior','Bangalore, India',1500000.00,2500000.00,'INR',0,'2024-04-08','careers@techcorp.in','["React","Node.js","TypeScript","MongoDB","AWS"]',2,156,'full-time','on-site','active','2024-03-08 00:00:00','2024-03-08 00:00:00'),
  (2,'Python Developer - Data Science','DataMinds Analytics','python-developer-data-science-dataminds','Join our data science team to build ML models and data pipelines. Work on cutting-edge AI projects that impact millions of users.','mid','Remote',1000000.00,1800000.00,'INR',0,'2024-04-07','jobs@dataminds.in','["Python","Machine Learning","TensorFlow","Pandas","SQL"]',1,243,'full-time','remote','active','2024-03-07 00:00:00','2024-03-07 00:00:00'),
  (3,'Frontend Developer Intern','StartupHub','frontend-developer-intern-startuphub','Exciting internship opportunity for fresh graduates. Learn and work on real-world projects with mentorship from senior developers.','entry','Delhi NCR',25000.00,40000.00,'INR',0,'2024-04-15','intern@startuphub.in','["HTML","CSS","JavaScript","React","Git"]',3,89,'internship','on-site','active','2024-03-09 00:00:00','2024-03-09 00:00:00'),
  (4,'DevOps Engineer','CloudNine Technologies','devops-engineer-cloudnine','Seeking a DevOps engineer to manage CI/CD pipelines, cloud infrastructure, and ensure system reliability.','senior','Hyderabad, India',1200000.00,2000000.00,'INR',0,'2024-04-06','hr@cloudnine.in','["Docker","Kubernetes","AWS","Jenkins","Terraform"]',1,178,'full-time','on-site','active','2024-03-06 00:00:00','2024-03-06 00:00:00'),
  (5,'Physics Content Creator','EduTech Innovations','physics-content-creator-edutech','Create engaging physics content for JEE/NEET aspirants. Record video lectures, solve problems, and develop study materials.','mid','Remote',50000.00,80000.00,'INR',1,'2024-04-20','content@edutech.in','["Physics","Teaching","Content Creation","Video Recording"]',2,67,'part-time','remote','active','2024-03-05 00:00:00','2024-03-05 00:00:00');

INSERT IGNORE INTO `alumni_achievements`
  (`id`,`user_id`,`bootcamp_id`,`type`,`company_name`,`position`,`description`,`achievement_date`,`testimonial`,`featured`,`status`,`salary_range`,`location`,`created_at`,`updated_at`)
VALUES
  (1,4,NULL,'placement','Google','Software Engineer','Arjun completed the Python Masterclass and Full Stack Bootcamp, then cracked Google''s interview process after 6 months of dedicated preparation on the Edvo platform.','2024-01-15 00:00:00','Edvo''s structured curriculum and hands-on projects gave me the confidence to crack Google''s interview. The DSA course was a game-changer for me.',1,'approved','₹35-45 LPA','Bangalore, India','2024-01-15 00:00:00','2024-01-15 00:00:00'),
  (2,5,NULL,'promotion','Microsoft','Senior Developer','Priya upskilled through the Full Stack Web Development Bootcamp and earned a promotion to Senior Developer at Microsoft within 8 months of completing the course.','2024-02-20 00:00:00','The full stack bootcamp on Edvo is incredibly practical. I applied what I learned directly at work and got promoted within months.',1,'approved','₹28-35 LPA','Hyderabad, India','2024-02-20 00:00:00','2024-02-20 00:00:00'),
  (3,6,NULL,'achievement',NULL,NULL,'Rahul achieved a Codeforces Expert rating (1600+) after completing the Mathematics for Competitive Programming course, placing him in the top 10% of competitive programmers globally.','2024-03-10 00:00:00','The math course on Edvo transformed my competitive programming skills. I went from Specialist to Expert on Codeforces in just 3 months.',0,'approved',NULL,NULL,'2024-03-10 00:00:00','2024-03-10 00:00:00');

INSERT IGNORE INTO `settings` (`key`,`value`,`created_at`,`updated_at`) VALUES
  ('site_name','Edvo','2024-01-01 00:00:00','2024-01-01 00:00:00'),
  ('site_tagline','Learn. Grow. Achieve.','2024-01-01 00:00:00','2024-01-01 00:00:00'),
  ('contact_email','support@edvo.in','2024-01-01 00:00:00','2024-01-01 00:00:00'),
  ('currency','INR','2024-01-01 00:00:00','2024-01-01 00:00:00'),
  ('currency_symbol','₹','2024-01-01 00:00:00','2024-01-01 00:00:00'),
  ('timezone','Asia/Kolkata','2024-01-01 00:00:00','2024-01-01 00:00:00');

-- Seed a default navbar so SettingsService::getNavbar() doesn't crash
INSERT IGNORE INTO `navbars` (`id`,`title`,`slug`,`active`,`created_at`,`updated_at`)
VALUES (1,'Main Navbar','navbar_1',1,'2024-01-01 00:00:00','2024-01-01 00:00:00');

-- Seed a default footer
INSERT IGNORE INTO `footers` (`id`,`title`,`slug`,`active`,`created_at`,`updated_at`)
VALUES (1,'Main Footer','footer_1',1,'2024-01-01 00:00:00','2024-01-01 00:00:00');

SET FOREIGN_KEY_CHECKS = 1;
