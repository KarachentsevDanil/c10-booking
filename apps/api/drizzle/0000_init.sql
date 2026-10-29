CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"guest_email" text NOT NULL,
	"policy" text NOT NULL,
	"check_in_date" date NOT NULL,
	"nights" integer NOT NULL,
	"accommodation_minor" integer NOT NULL,
	"service_fee_minor" integer NOT NULL,
	"currency" text NOT NULL,
	"payment_id" text NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"refund_amount_minor" integer,
	"refund_id" text,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"timezone" text NOT NULL,
	"check_in_time" time NOT NULL,
	"cancellation_policy" text NOT NULL,
	"nightly_rate_minor" integer NOT NULL,
	"currency" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;