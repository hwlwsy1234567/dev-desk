CREATE TABLE `tool_history` (
	`id` integer PRIMARY KEY NOT NULL,
	`tool_type` text NOT NULL,
	`input` text,
	`output` text,
	`created_at` integer NOT NULL,
	`favorite` integer DEFAULT 0 NOT NULL
);
