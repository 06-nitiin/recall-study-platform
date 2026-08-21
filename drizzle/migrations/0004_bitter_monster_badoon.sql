CREATE TABLE `study_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`daily_goal_minutes` integer DEFAULT 20 NOT NULL,
	`preferred_session_minutes` integer DEFAULT 15 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `study_preferences_user_id_unique` ON `study_preferences` (`user_id`);