import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  pgEnum,
  varchar,
  char,
  json,
  unique,
  index,
  decimal
} from 'drizzle-orm/pg-core';

// Enum tipe discount
export const DiscountTypeEnum = pgEnum('discount_type_enum', ['percentage', 'fixed_amount']);

// Enum target discount
export const DiscountTargetEnum = pgEnum('discount_target_enum', ['order', 'item', 'category', 'delivery']);

// Enum tipe tax
export const TaxTypeEnum = pgEnum('tax_type_enum', ['percentage', 'fixed_amount']);

// Enum tipe pesanan
export const OrderTypeEnum = pgEnum('order_type_enum', ['delivery', 'takeaway']);

// Enum status pesanan
export const OrderStatusEnum = pgEnum('order_status_enum', ['pending', 'confirmed', 'preparing', 'cooking', 'ready', 'out_for_delivery', 'completed', 'cancelled']);

// Enum status dapur
export const KitchenStatusEnum = pgEnum('kitchen_status_enum', ['pending', 'preparing', 'cooking', 'plating', 'ready', 'served']);

// Enum status pembayaran
export const PaymentStatusEnum = pgEnum('payment_status_enum', ['unpaid', 'paid', 'failed', 'refunded', 'partial']);

// Enum role user
export const UserRoleEnum = pgEnum('user_role_enum', ['customer', 'admin', 'staff', 'cashier', 'kitchen', 'chef', 'delivery']);

// Enum tipe login
export const LoginTypeEnum = pgEnum('login_type_enum', ['email', 'google']);

// Enum prioritas kitchen
export const KitchenPriorityEnum = pgEnum('kitchen_priority_enum', ['low', 'normal', 'high', 'urgent']);

// Enum tipe varian
export const VariantTypeEnum = pgEnum('variant_type_enum', ['size', 'flavor', 'topping', 'spice_level', 'temperature', 'custom']);

// Tabel kategori makanan
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sort_order: integer('sort_order').default(0),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  activeIdx: index('categories_active_idx').on(table.is_active),
  sortIdx: index('categories_sort_idx').on(table.sort_order)
}));

// Tabel menu / dishes
export const dishes = pgTable('dishes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  images: json('images'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  cost_price: decimal('cost_price', { precision: 10, scale: 2 }),
  available: boolean('available').default(true),
  is_featured: boolean('is_featured').default(false),
  preparation_time: integer('preparation_time').default(15),
  calories: integer('calories'),
  allergens: json('allergens'),
  ingredients: json('ingredients'),
  nutritional_info: json('nutritional_info'),
  category_id: integer('category_id').references(() => categories.id),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  slugIdx: index('dishes_slug_idx').on(table.slug),
  categoryIdx: index('dishes_category_idx').on(table.category_id),
  availableIdx: index('dishes_available_idx').on(table.available),
  featuredIdx: index('dishes_featured_idx').on(table.is_featured),
  priceIdx: index('dishes_price_idx').on(table.price)
}));

// Tabel varian produk
export const dish_variants = pgTable('dish_variants', {
  id: serial('id').primaryKey(),
  dish_id: integer('dish_id').references(() => dishes.id).notNull(),
  name: text('name').notNull(),
  type: VariantTypeEnum('type').notNull(),
  price_modifier: decimal('price_modifier', { precision: 10, scale: 2 }).default('0'),
  is_default: boolean('is_default').default(false),
  is_available: boolean('is_available').default(true),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  dishIdx: index('dish_variants_dish_idx').on(table.dish_id),
  typeIdx: index('dish_variants_type_idx').on(table.type),
  availableIdx: index('dish_variants_available_idx').on(table.is_available)
}));

// Tabel pengguna / pelanggan
export const users = pgTable('users', {
  id: char('id', { length: 26 }).primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  phone: varchar('phone', 20),
  avatar: text('avatar'),
  role: UserRoleEnum('role').default('customer'),
  login_type: LoginTypeEnum('login_type').default('email'),
  google_id: text('google_id'),
  email_verified_at: timestamp('email_verified_at'),
  phone_verified_at: timestamp('phone_verified_at'),
  is_active: boolean('is_active').default(true),
  remember_token: varchar('remember_token', 100),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
  activeIdx: index('users_active_idx').on(table.is_active)
}));

// Tabel sessions
export const sessions = pgTable('sessions', {
  id: char('id', { length: 26 }).primaryKey(),
  user_id: char('user_id', { length: 26 }).references(() => users.id),
  ip_address: varchar('ip_address', 45),
  user_agent: text('user_agent'),
  payload: text('payload').notNull(),
  last_activity: integer('last_activity').notNull()
}, (table) => ({
  userIdx: index('sessions_user_idx').on(table.user_id),
  activityIdx: index('sessions_activity_idx').on(table.last_activity)
}));

// Tabel taxes
export const taxes = pgTable('taxes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: TaxTypeEnum('type').notNull(),
  value: decimal('value', { precision: 10, scale: 4 }).notNull(),
  description: text('description'),
  is_active: boolean('is_active').default(true),
  is_inclusive: boolean('is_inclusive').default(false),
  min_order_amount: decimal('min_order_amount', { precision: 10, scale: 2 }).default('0'),
  max_tax_amount: decimal('max_tax_amount', { precision: 10, scale: 2 }),
  applicable_to: json('applicable_to'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  activeIdx: index('taxes_active_idx').on(table.is_active),
  typeIdx: index('taxes_type_idx').on(table.type)
}));

// Tabel discounts
export const discounts = pgTable('discounts', {
  id: serial('id').primaryKey(),
  code: varchar('code', 50).unique(),
  name: text('name').notNull(),
  description: text('description'),
  type: DiscountTypeEnum('type').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  target: DiscountTargetEnum('target').notNull(),
  target_ids: json('target_ids'),
  min_order_amount: decimal('min_order_amount', { precision: 10, scale: 2 }).default('0'),
  max_discount_amount: decimal('max_discount_amount', { precision: 10, scale: 2 }),
  max_uses: integer('max_uses'),
  max_uses_per_user: integer('max_uses_per_user').default(1),
  current_uses: integer('current_uses').default(0),
  is_active: boolean('is_active').default(true),
  starts_at: timestamp('starts_at'),
  expires_at: timestamp('expires_at'),
  applicable_to: json('applicable_to'),
  first_order_only: boolean('first_order_only').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  codeIdx: index('discounts_code_idx').on(table.code),
  activeIdx: index('discounts_active_idx').on(table.is_active),
  expiryIdx: index('discounts_expiry_idx').on(table.expires_at),
  typeIdx: index('discounts_type_idx').on(table.type),
  targetIdx: index('discounts_target_idx').on(table.target)
}));

// Tabel password_resets
export const password_resets = pgTable('password_resets', {
  id: char('id', { length: 26 }).primaryKey(),
  user_id: char('user_id', { length: 26 }).references(() => users.id).notNull(),
  token: varchar('token', 255).notNull(),
  expires_at: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  userIdx: index('password_resets_user_idx').on(table.user_id),
  tokenIdx: index('password_resets_token_idx').on(table.token),
  expiryIdx: index('password_resets_expiry_idx').on(table.expires_at)
}));

// Tabel pesanan
export const orders = pgTable('orders', {
  id: char('id', { length: 26 }).primaryKey(),
  order_number: varchar('order_number', 20).notNull().unique(),
  user_id: char('user_id', { length: 26 }).references(() => users.id),
  customer_name: text('customer_name'),
  customer_phone: text('customer_phone'),
  customer_email: text('customer_email'),
  type: OrderTypeEnum('type').notNull(),
  status: OrderStatusEnum('status').default('pending'),
  payment_status: PaymentStatusEnum('payment_status').default('unpaid'),
  payment_method: varchar('payment_method', 50),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  estimated_ready_time: timestamp('estimated_ready_time'),
  scheduled_time: timestamp('scheduled_time'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  orderNumberIdx: index('orders_number_idx').on(table.order_number),
  userIdx: index('orders_user_idx').on(table.user_id),
  statusIdx: index('orders_status_idx').on(table.status),
  paymentStatusIdx: index('orders_payment_status_idx').on(table.payment_status),
  typeIdx: index('orders_type_idx').on(table.type),
  createdAtIdx: index('orders_created_at_idx').on(table.created_at),
  scheduledTimeIdx: index('orders_scheduled_time_idx').on(table.scheduled_time)
}));

// Tabel order taxes
export const order_taxes = pgTable('order_taxes', {
  id: serial('id').primaryKey(),
  order_id: char('order_id', { length: 26 }).references(() => orders.id).notNull(),
  tax_id: integer('tax_id').references(() => taxes.id).notNull(),
  tax_name: text('tax_name').notNull(),
  tax_rate: decimal('tax_rate', { precision: 10, scale: 4 }).notNull(),
  tax_amount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  orderIdx: index('order_taxes_order_idx').on(table.order_id),
  taxIdx: index('order_taxes_tax_idx').on(table.tax_id)
}));

// Tabel order discounts
export const order_discounts = pgTable('order_discounts', {
  id: serial('id').primaryKey(),
  order_id: char('order_id', { length: 26 }).references(() => orders.id).notNull(),
  discount_id: integer('discount_id').references(() => discounts.id),
  discount_code: varchar('discount_code', 50),
  discount_name: text('discount_name').notNull(),
  discount_type: DiscountTypeEnum('discount_type').notNull(),
  discount_value: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  discount_amount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull(),
  applied_to: DiscountTargetEnum('applied_to').notNull(),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  orderIdx: index('order_discounts_order_idx').on(table.order_id),
  discountIdx: index('order_discounts_discount_idx').on(table.discount_id),
  codeIdx: index('order_discounts_code_idx').on(table.discount_code)
}));

// Tabel detail pesanan
export const order_items = pgTable('order_items', {
  id: serial('id').primaryKey(),
  order_id: char('order_id', { length: 26 }).references(() => orders.id).notNull(),
  dish_id: integer('dish_id').references(() => dishes.id).notNull(),
  dish_name: text('dish_name').notNull(),
  dish_image: text('dish_image'),
  base_price: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  final_price: decimal('final_price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  special_instructions: text('special_instructions'),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  orderIdx: index('order_items_order_idx').on(table.order_id),
  dishIdx: index('order_items_dish_idx').on(table.dish_id)
}));

// Tabel varian yang dipilih untuk setiap order item
export const order_item_variants = pgTable('order_item_variants', {
  id: serial('id').primaryKey(),
  order_item_id: integer('order_item_id').references(() => order_items.id).notNull(),
  variant_id: integer('variant_id').references(() => dish_variants.id).notNull(),
  variant_name: text('variant_name').notNull(),
  variant_type: VariantTypeEnum('variant_type').notNull(),
  price_modifier: decimal('price_modifier', { precision: 10, scale: 2 }).default('0'),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  orderItemIdx: index('order_item_variants_item_idx').on(table.order_item_id),
  variantIdx: index('order_item_variants_variant_idx').on(table.variant_id)
}));

// Tabel delivery info
export const deliveries = pgTable('deliveries', {
  id: serial('id').primaryKey(),
  order_id: char('order_id', { length: 26 }).references(() => orders.id).notNull(),
  delivery_label: varchar('delivery_label', 50),
  delivery_address: text('delivery_address').notNull(),
  delivery_city: text('delivery_city'),
  delivery_postal_code: varchar('delivery_postal_code', 10),
  delivery_lat: decimal('delivery_lat', { precision: 10, scale: 8 }),
  delivery_long: decimal('delivery_long', { precision: 11, scale: 8 }),
  delivery_distance: decimal('delivery_distance', { precision: 8, scale: 2 }),
  delivery_fee: decimal('delivery_fee', { precision: 10, scale: 2 }).default('0'),
  delivery_instructions: text('delivery_instructions'),
  assigned_driver_id: char('assigned_driver_id', { length: 26 }).references(() => users.id),
  pickup_time: timestamp('pickup_time'),
  delivered_time: timestamp('delivered_time'),
  delivery_proof: text('delivery_proof'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  orderIdx: index('deliveries_order_idx').on(table.order_id),
  driverIdx: index('deliveries_driver_idx').on(table.assigned_driver_id)
}));

// Tabel kitchen queue
export const kitchen_queue = pgTable('kitchen_queue', {
  id: serial('id').primaryKey(),
  order_id: char('order_id', { length: 26 }).references(() => orders.id).notNull(),
  order_number: varchar('order_number', 20).notNull(),
  priority: KitchenPriorityEnum('priority').default('normal'),
  status: KitchenStatusEnum('status').default('pending'),
  station: varchar('station', 50),
  assigned_chef_id: char('assigned_chef_id', { length: 26 }).references(() => users.id),
  estimated_prep_time: integer('estimated_prep_time'),
  actual_prep_time: integer('actual_prep_time'),
  started_at: timestamp('started_at'),
  completed_at: timestamp('completed_at'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}, (table) => ({
  orderIdx: index('kitchen_queue_order_idx').on(table.order_id),
  statusIdx: index('kitchen_queue_status_idx').on(table.status),
  priorityIdx: index('kitchen_queue_priority_idx').on(table.priority),
  stationIdx: index('kitchen_queue_station_idx').on(table.station),
  chefIdx: index('kitchen_queue_chef_idx').on(table.assigned_chef_id),
  createdAtIdx: index('kitchen_queue_created_at_idx').on(table.created_at)
}));

// Tabel kitchen queue items
export const kitchen_queue_items = pgTable('kitchen_queue_items', {
  id: serial('id').primaryKey(),
  kitchen_queue_id: integer('kitchen_queue_id').references(() => kitchen_queue.id).notNull(),
  order_item_id: integer('order_item_id').references(() => order_items.id).notNull(),
  dish_name: text('dish_name').notNull(),
  quantity: integer('quantity').notNull(),
  variants: json('variants'),
  special_instructions: text('special_instructions'),
  status: KitchenStatusEnum('status').default('pending'),
  prep_time_minutes: integer('prep_time_minutes'),
  started_at: timestamp('started_at'),
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  queueIdx: index('kitchen_queue_items_queue_idx').on(table.kitchen_queue_id),
  orderItemIdx: index('kitchen_queue_items_order_item_idx').on(table.order_item_id),
  statusIdx: index('kitchen_queue_items_status_idx').on(table.status)
}));

// Tabel untuk tracking perubahan status kitchen
export const kitchen_status_logs = pgTable('kitchen_status_logs', {
  id: serial('id').primaryKey(),
  kitchen_queue_id: integer('kitchen_queue_id').references(() => kitchen_queue.id).notNull(),
  from_status: KitchenStatusEnum('from_status'),
  to_status: KitchenStatusEnum('to_status').notNull(),
  changed_by: char('changed_by', { length: 26 }).references(() => users.id),
  notes: text('notes'),
  timestamp: timestamp('timestamp').defaultNow()
}, (table) => ({
  queueIdx: index('kitchen_status_logs_queue_idx').on(table.kitchen_queue_id),
  timestampIdx: index('kitchen_status_logs_timestamp_idx').on(table.timestamp),
  changedByIdx: index('kitchen_status_logs_changed_by_idx').on(table.changed_by)
}));

// Tabel discount usage tracking
export const discount_usages = pgTable('discount_usages', {
  id: serial('id').primaryKey(),
  discount_id: integer('discount_id').references(() => discounts.id).notNull(),
  order_id: char('order_id', { length: 26 }).references(() => orders.id).notNull(),
  user_id: char('user_id', { length: 26 }).references(() => users.id),
  discount_amount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow()
}, (table) => ({
  discountIdx: index('discount_usages_discount_idx').on(table.discount_id),
  userIdx: index('discount_usages_user_idx').on(table.user_id),
  orderIdx: index('discount_usages_order_idx').on(table.order_id),
  createdAtIdx: index('discount_usages_created_at_idx').on(table.created_at)
}));