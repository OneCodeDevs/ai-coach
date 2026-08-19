-- Praxis-Aufgaben sessions

CREATE TABLE IF NOT EXISTS `praxis_sessions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text DEFAULT 'me' NOT NULL,
  `kapitel_slug` text NOT NULL,
  `aufgabe_id` text NOT NULL,
  `status` text DEFAULT 'in_progress' NOT NULL,
  `abgabe` text DEFAULT '' NOT NULL,
  `abgabe_typ` text DEFAULT 'text' NOT NULL,
  `feedback` text DEFAULT '' NOT NULL,
  `versuche` integer DEFAULT 0 NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
