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
  char
} from 'drizzle-orm/pg-core';

// Enum tipe pesanan
export const OrderTypeEnum = pgEnum('order_type_enum', ['delivery', 'takeaway']);

// Enum status pesanan
export const OrderStatusEnum = pgEnum('order_status_enum', ['pending', 'preparing', 'cooking', 'ready', 'completed', 'cancelled']);

// Enum status dapur
export const KitchenStatusEnum = pgEnum('kitchen_status_enum', ['pending', 'cooking', 'ready']);

// Enum status pembayaran
export const PaymentStatusEnum = pgEnum('payment_status_enum', ['unpaid', 'paid', 'failed', 'refunded']);

// Enum role user
export const UserRoleEnum = pgEnum('user_role_enum', ['customer', 'admin', 'staff', 'cashier', 'kitchen']);

// Enum tipe login
export const LoginTypeEnum = pgEnum('login_type_enum', ['email', 'google']);

// Tabel kategori makanan
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull()
});

// Tabel menu / dishes
export const dishes = pgTable('dishes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price').notNull(),
  available: boolean('available').default(true),
  category_id: integer('category_id').references(() => categories.id)
});

// Tabel pengguna / pelanggan
export const users = pgTable('users', {
  id: char('id', {
    length: 26
  }).primaryKey(), // ULID
  name: text('name').notNull(),
  email: text('email').notNull(),
  password: text('password'), // hanya untuk login email/password
  role: UserRoleEnum('role').default('customer'),
  login_type: LoginTypeEnum('login_type').default('email'),
  google_id: text('google_id'), // optional untuk login Google
  email_verified_at: timestamp('email_verified_at'),
  remember_token: varchar('remember_token', 100),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Tabel sessions (seperti Laravel)
export const sessions = pgTable('sessions', {
  id: char('id', {
    length: 26
  }).primaryKey(), // ULID
  user_id: char('user_id', {
    length: 26
  }).references(() => users.id),
  ip_address: varchar('ip_address', 45),
  user_agent: text('user_agent'),
  payload: text('payload').notNull(),
  last_activity: integer('last_activity').notNull()
});

// Tabel password_resets
export const password_resets = pgTable('password_resets', {
  id: char('id', {
    length: 26
  }).primaryKey(), // ULID
  user_id: char('user_id', {
    length: 26
  }).references(() => users.id).notNull(),
  token: varchar('token', 255).notNull(),
  expires_at: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  created_at: timestamp('created_at').defaultNow()
});

// Tabel pesanan (orders)
export const orders = pgTable('orders', {
  id: char('id', {
    length: 26
  }).primaryKey(), // ULID
  order_number: varchar('order_number', 20).notNull(),
  user_id: char('user_id', {
    length: 26
  }).references(() => users.id),
  type: OrderTypeEnum('type').notNull(), // delivery / takeaway
  status: OrderStatusEnum('status').default('pending'),
  payment_status: PaymentStatusEnum('payment_status').default('unpaid'),
  total_amount: numeric('total_amount').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Tabel detail pesanan
export const order_items = pgTable('order_items', {
  id: serial('id').primaryKey(),
  order_id: char('order_id', {
    length: 26
  }).references(() => orders.id),
  dish_id: integer('dish_id').references(() => dishes.id),
  quantity: integer('quantity').default(1),
  price: numeric('price').notNull()
});

// Tabel delivery info (phone dipindahkan ke sini)
export const deliveries = pgTable('deliveries', {
  id: serial('id').primaryKey(),
  order_id: char('order_id', {
    length: 26
  }).references(() => orders.id),
  delivery_label: varchar('delivery_label', 50),
  delivery_address: text('delivery_address'),
  delivery_city: text('delivery_city'),
  delivery_lat: numeric('delivery_lat'),
  delivery_long: numeric('delivery_long'),
  phone: text('phone'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Tabel dapur / kitchen tasks
export const kitchen_tasks = pgTable('kitchen_tasks', {
  id: serial('id').primaryKey(),
  order_id: char('order_id', {
    length: 26
  }).references(() => orders.id),
  status: KitchenStatusEnum('status').default('pending'),
  assigned_to: text('assigned_to'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});