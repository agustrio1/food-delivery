CREATE TYPE "public"."discount_target_enum" AS ENUM('order', 'item', 'category', 'delivery');--> statement-breakpoint
CREATE TYPE "public"."discount_type_enum" AS ENUM('percentage', 'fixed_amount');--> statement-breakpoint
CREATE TYPE "public"."kitchen_priority_enum" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."kitchen_status_enum" AS ENUM('pending', 'preparing', 'cooking', 'plating', 'ready', 'served');--> statement-breakpoint
CREATE TYPE "public"."login_type_enum" AS ENUM('email', 'google');--> statement-breakpoint
CREATE TYPE "public"."order_status_enum" AS ENUM('pending', 'confirmed', 'preparing', 'cooking', 'ready', 'out_for_delivery', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."order_type_enum" AS ENUM('delivery', 'takeaway');--> statement-breakpoint
CREATE TYPE "public"."payment_status_enum" AS ENUM('unpaid', 'paid', 'failed', 'refunded', 'partial');--> statement-breakpoint
CREATE TYPE "public"."tax_type_enum" AS ENUM('percentage', 'fixed_amount');--> statement-breakpoint
CREATE TYPE "public"."user_role_enum" AS ENUM('customer', 'admin', 'staff', 'cashier', 'kitchen', 'chef', 'delivery');--> statement-breakpoint
CREATE TYPE "public"."variant_type_enum" AS ENUM('size', 'flavor', 'topping', 'spice_level', 'temperature', 'custom');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" char(26) NOT NULL,
	"delivery_label" varchar,
	"delivery_address" text NOT NULL,
	"delivery_city" text,
	"delivery_postal_code" varchar,
	"delivery_lat" numeric(10, 8),
	"delivery_long" numeric(11, 8),
	"delivery_distance" numeric(8, 2),
	"delivery_fee" numeric(10, 2) DEFAULT '0',
	"delivery_instructions" text,
	"assigned_driver_id" char(26),
	"pickup_time" timestamp,
	"delivered_time" timestamp,
	"delivery_proof" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discount_usages" (
	"id" serial PRIMARY KEY NOT NULL,
	"discount_id" integer NOT NULL,
	"order_id" char(26) NOT NULL,
	"user_id" char(26),
	"discount_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar,
	"name" text NOT NULL,
	"description" text,
	"type" "discount_type_enum" NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"target" "discount_target_enum" NOT NULL,
	"target_ids" json,
	"min_order_amount" numeric(10, 2) DEFAULT '0',
	"max_discount_amount" numeric(10, 2),
	"max_uses" integer,
	"max_uses_per_user" integer DEFAULT 1,
	"current_uses" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"starts_at" timestamp,
	"expires_at" timestamp,
	"applicable_to" json,
	"first_order_only" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "discounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "dish_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"dish_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" "variant_type_enum" NOT NULL,
	"price_modifier" numeric(10, 2) DEFAULT '0',
	"is_default" boolean DEFAULT false,
	"is_available" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dishes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"images" json,
	"price" numeric(10, 2) NOT NULL,
	"cost_price" numeric(10, 2),
	"available" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"preparation_time" integer DEFAULT 15,
	"calories" integer,
	"allergens" json,
	"ingredients" json,
	"nutritional_info" json,
	"category_id" integer,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "dishes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "kitchen_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" char(26) NOT NULL,
	"order_number" varchar NOT NULL,
	"priority" "kitchen_priority_enum" DEFAULT 'normal',
	"status" "kitchen_status_enum" DEFAULT 'pending',
	"station" varchar,
	"assigned_chef_id" char(26),
	"estimated_prep_time" integer,
	"actual_prep_time" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kitchen_queue_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"kitchen_queue_id" integer NOT NULL,
	"order_item_id" integer NOT NULL,
	"dish_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"variants" json,
	"special_instructions" text,
	"status" "kitchen_status_enum" DEFAULT 'pending',
	"prep_time_minutes" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kitchen_status_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"kitchen_queue_id" integer NOT NULL,
	"from_status" "kitchen_status_enum",
	"to_status" "kitchen_status_enum" NOT NULL,
	"changed_by" char(26),
	"notes" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_discounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" char(26) NOT NULL,
	"discount_id" integer,
	"discount_code" varchar,
	"discount_name" text NOT NULL,
	"discount_type" "discount_type_enum" NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) NOT NULL,
	"applied_to" "discount_target_enum" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_item_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_item_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"variant_name" text NOT NULL,
	"variant_type" "variant_type_enum" NOT NULL,
	"price_modifier" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" char(26) NOT NULL,
	"dish_id" integer NOT NULL,
	"dish_name" text NOT NULL,
	"dish_image" text,
	"base_price" numeric(10, 2) NOT NULL,
	"final_price" numeric(10, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"special_instructions" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_taxes" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" char(26) NOT NULL,
	"tax_id" integer NOT NULL,
	"tax_name" text NOT NULL,
	"tax_rate" numeric(10, 4) NOT NULL,
	"tax_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"order_number" varchar NOT NULL,
	"user_id" char(26),
	"customer_name" text,
	"customer_phone" text,
	"customer_email" text,
	"type" "order_type_enum" NOT NULL,
	"status" "order_status_enum" DEFAULT 'pending',
	"payment_status" "payment_status_enum" DEFAULT 'unpaid',
	"payment_method" varchar,
	"subtotal" numeric(10, 2) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"notes" text,
	"estimated_ready_time" timestamp,
	"scheduled_time" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26),
	"ip_address" varchar,
	"user_agent" text,
	"payload" text NOT NULL,
	"last_activity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "tax_type_enum" NOT NULL,
	"value" numeric(10, 4) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"is_inclusive" boolean DEFAULT false,
	"min_order_amount" numeric(10, 2) DEFAULT '0',
	"max_tax_amount" numeric(10, 2),
	"applicable_to" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"phone" varchar,
	"avatar" text,
	"role" "user_role_enum" DEFAULT 'customer',
	"login_type" "login_type_enum" DEFAULT 'email',
	"google_id" text,
	"email_verified_at" timestamp,
	"phone_verified_at" timestamp,
	"is_active" boolean DEFAULT true,
	"remember_token" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_assigned_driver_id_users_id_fk" FOREIGN KEY ("assigned_driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usages" ADD CONSTRAINT "discount_usages_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usages" ADD CONSTRAINT "discount_usages_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usages" ADD CONSTRAINT "discount_usages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_variants" ADD CONSTRAINT "dish_variants_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitchen_queue" ADD CONSTRAINT "kitchen_queue_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitchen_queue" ADD CONSTRAINT "kitchen_queue_assigned_chef_id_users_id_fk" FOREIGN KEY ("assigned_chef_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitchen_queue_items" ADD CONSTRAINT "kitchen_queue_items_kitchen_queue_id_kitchen_queue_id_fk" FOREIGN KEY ("kitchen_queue_id") REFERENCES "public"."kitchen_queue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitchen_queue_items" ADD CONSTRAINT "kitchen_queue_items_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitchen_status_logs" ADD CONSTRAINT "kitchen_status_logs_kitchen_queue_id_kitchen_queue_id_fk" FOREIGN KEY ("kitchen_queue_id") REFERENCES "public"."kitchen_queue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitchen_status_logs" ADD CONSTRAINT "kitchen_status_logs_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_discounts" ADD CONSTRAINT "order_discounts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_discounts" ADD CONSTRAINT "order_discounts_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_variants" ADD CONSTRAINT "order_item_variants_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_variants" ADD CONSTRAINT "order_item_variants_variant_id_dish_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."dish_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_taxes" ADD CONSTRAINT "order_taxes_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_taxes" ADD CONSTRAINT "order_taxes_tax_id_taxes_id_fk" FOREIGN KEY ("tax_id") REFERENCES "public"."taxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_active_idx" ON "categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "categories_sort_idx" ON "categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "deliveries_order_idx" ON "deliveries" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "deliveries_driver_idx" ON "deliveries" USING btree ("assigned_driver_id");--> statement-breakpoint
CREATE INDEX "discount_usages_discount_idx" ON "discount_usages" USING btree ("discount_id");--> statement-breakpoint
CREATE INDEX "discount_usages_user_idx" ON "discount_usages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "discount_usages_order_idx" ON "discount_usages" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "discount_usages_created_at_idx" ON "discount_usages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "discounts_code_idx" ON "discounts" USING btree ("code");--> statement-breakpoint
CREATE INDEX "discounts_active_idx" ON "discounts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "discounts_expiry_idx" ON "discounts" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "discounts_type_idx" ON "discounts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "discounts_target_idx" ON "discounts" USING btree ("target");--> statement-breakpoint
CREATE INDEX "dish_variants_dish_idx" ON "dish_variants" USING btree ("dish_id");--> statement-breakpoint
CREATE INDEX "dish_variants_type_idx" ON "dish_variants" USING btree ("type");--> statement-breakpoint
CREATE INDEX "dish_variants_available_idx" ON "dish_variants" USING btree ("is_available");--> statement-breakpoint
CREATE INDEX "dishes_slug_idx" ON "dishes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "dishes_category_idx" ON "dishes" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "dishes_available_idx" ON "dishes" USING btree ("available");--> statement-breakpoint
CREATE INDEX "dishes_featured_idx" ON "dishes" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "dishes_price_idx" ON "dishes" USING btree ("price");--> statement-breakpoint
CREATE INDEX "kitchen_queue_order_idx" ON "kitchen_queue" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "kitchen_queue_status_idx" ON "kitchen_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "kitchen_queue_priority_idx" ON "kitchen_queue" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "kitchen_queue_station_idx" ON "kitchen_queue" USING btree ("station");--> statement-breakpoint
CREATE INDEX "kitchen_queue_chef_idx" ON "kitchen_queue" USING btree ("assigned_chef_id");--> statement-breakpoint
CREATE INDEX "kitchen_queue_created_at_idx" ON "kitchen_queue" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "kitchen_queue_items_queue_idx" ON "kitchen_queue_items" USING btree ("kitchen_queue_id");--> statement-breakpoint
CREATE INDEX "kitchen_queue_items_order_item_idx" ON "kitchen_queue_items" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "kitchen_queue_items_status_idx" ON "kitchen_queue_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "kitchen_status_logs_queue_idx" ON "kitchen_status_logs" USING btree ("kitchen_queue_id");--> statement-breakpoint
CREATE INDEX "kitchen_status_logs_timestamp_idx" ON "kitchen_status_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "kitchen_status_logs_changed_by_idx" ON "kitchen_status_logs" USING btree ("changed_by");--> statement-breakpoint
CREATE INDEX "order_discounts_order_idx" ON "order_discounts" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_discounts_discount_idx" ON "order_discounts" USING btree ("discount_id");--> statement-breakpoint
CREATE INDEX "order_discounts_code_idx" ON "order_discounts" USING btree ("discount_code");--> statement-breakpoint
CREATE INDEX "order_item_variants_item_idx" ON "order_item_variants" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "order_item_variants_variant_idx" ON "order_item_variants" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_dish_idx" ON "order_items" USING btree ("dish_id");--> statement-breakpoint
CREATE INDEX "order_taxes_order_idx" ON "order_taxes" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_taxes_tax_idx" ON "order_taxes" USING btree ("tax_id");--> statement-breakpoint
CREATE INDEX "orders_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_payment_status_idx" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "orders_type_idx" ON "orders" USING btree ("type");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "orders_scheduled_time_idx" ON "orders" USING btree ("scheduled_time");--> statement-breakpoint
CREATE INDEX "password_resets_user_idx" ON "password_resets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_resets_token_idx" ON "password_resets" USING btree ("token");--> statement-breakpoint
CREATE INDEX "password_resets_expiry_idx" ON "password_resets" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_activity_idx" ON "sessions" USING btree ("last_activity");--> statement-breakpoint
CREATE INDEX "taxes_active_idx" ON "taxes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "taxes_type_idx" ON "taxes" USING btree ("type");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_active_idx" ON "users" USING btree ("is_active");