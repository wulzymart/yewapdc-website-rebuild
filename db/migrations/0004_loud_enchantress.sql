CREATE TYPE "public"."workflow_state" AS ENUM('DRAFT', 'IN_REVIEW', 'READY_FOR_PUBLISH');--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "workflow_state" "workflow_state" DEFAULT 'DRAFT' NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "submitted_for_review_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "workflow_state" "workflow_state" DEFAULT 'DRAFT' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "submitted_for_review_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;