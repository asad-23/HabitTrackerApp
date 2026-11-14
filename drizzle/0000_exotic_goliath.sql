CREATE TABLE `check_ins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`habit_id` integer NOT NULL,
	`date` text NOT NULL,
	`status` text NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `check_ins_habit_date_idx` ON `check_ins` (`habit_id`,`date`);--> statement-breakpoint
CREATE TABLE `habits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`full_version` text NOT NULL,
	`min_version` text NOT NULL,
	`cue` text NOT NULL,
	`identity` text NOT NULL,
	`reminder_time` text,
	`repeat_mask` integer DEFAULT 127 NOT NULL,
	`start_date` text NOT NULL,
	`created_at` text NOT NULL,
	`archived_at` text,
	`archived_on` text,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reflections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week_start` text NOT NULL,
	`habit_id` integer NOT NULL,
	`reason_tag` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reflections_week_habit_idx` ON `reflections` (`week_start`,`habit_id`);