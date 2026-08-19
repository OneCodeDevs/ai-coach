-- Initial schema for AI Coach

CREATE TABLE IF NOT EXISTS `lesson_progress` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text DEFAULT 'me' NOT NULL,
  `kapitel_slug` text NOT NULL,
  `lesson_slug` text NOT NULL,
  `completed_at` integer
);

CREATE UNIQUE INDEX IF NOT EXISTS `lesson_progress_user_lesson`
  ON `lesson_progress` (`user_id`, `kapitel_slug`, `lesson_slug`);

CREATE TABLE IF NOT EXISTS `exam_sessions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text DEFAULT 'me' NOT NULL,
  `kapitel_slug` text NOT NULL,
  `status` text DEFAULT 'in_progress' NOT NULL,
  `question_index` integer DEFAULT 0 NOT NULL,
  `follow_up_count` integer DEFAULT 0 NOT NULL,
  `transcript` text DEFAULT '[]' NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `journal_entries` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text DEFAULT 'me' NOT NULL,
  `kapitel_slug` text NOT NULL,
  `session_id` integer,
  `staerken` text DEFAULT '[]' NOT NULL,
  `luecken` text DEFAULT '[]' NOT NULL,
  `zusammenfassung` text DEFAULT '' NOT NULL,
  `naechste_schritte` text DEFAULT '[]' NOT NULL,
  `created_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `translations` (
  `hash` text PRIMARY KEY NOT NULL,
  `source_lang` text NOT NULL,
  `target_lang` text NOT NULL,
  `source_text` text NOT NULL,
  `translated_text` text NOT NULL,
  `created_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `settings` (
  `key` text PRIMARY KEY NOT NULL,
  `value` text NOT NULL
);

INSERT OR IGNORE INTO `settings` (`key`, `value`) VALUES ('focus-mode', '0');
