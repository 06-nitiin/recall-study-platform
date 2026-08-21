CREATE TABLE `card_review_states` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`flashcard_id` integer NOT NULL,
	`repetitions` integer DEFAULT 0 NOT NULL,
	`interval_days` integer DEFAULT 0 NOT NULL,
	`ease_factor` integer DEFAULT 250 NOT NULL,
	`due_at` integer NOT NULL,
	`last_reviewed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`flashcard_id`) REFERENCES `flashcards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `card_review_states_flashcard_id_unique` ON `card_review_states` (`flashcard_id`);--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`module_id` integer NOT NULL,
	`source_material_id` integer,
	`prompt` text NOT NULL,
	`answer` text NOT NULL,
	`explanation` text,
	`is_generated` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `module_guides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`module_id` integer NOT NULL,
	`summary` text NOT NULL,
	`concepts_json` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `module_guides_module_id_unique` ON `module_guides` (`module_id`);--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`module_id` integer NOT NULL,
	`prompt` text NOT NULL,
	`options_json` text NOT NULL,
	`correct_option_id` text NOT NULL,
	`explanation` text,
	`is_generated` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quiz_responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`selected_option_id` text NOT NULL,
	`is_correct` integer NOT NULL,
	`confidence` integer NOT NULL,
	`answered_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `study_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `review_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`module_id` integer NOT NULL,
	`flashcard_id` integer NOT NULL,
	`rating` text NOT NULL,
	`confidence` integer NOT NULL,
	`quality` integer NOT NULL,
	`next_interval_days` integer NOT NULL,
	`reviewed_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`flashcard_id`) REFERENCES `flashcards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `study_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`module_id` integer NOT NULL,
	`kind` text NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`correct_count` integer DEFAULT 0 NOT NULL,
	`answer_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tutor_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`module_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`cited_material_ids_json` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
