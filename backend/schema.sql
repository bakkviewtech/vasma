CREATE DATABASE IF NOT EXISTS vasma_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vasma_db;

CREATE TABLE IF NOT EXISTS businesses (
  id VARCHAR(64) PRIMARY KEY,
  business_uid VARCHAR(32) UNIQUE,
  business_code VARCHAR(80) NOT NULL UNIQUE,
  business_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  mobile VARCHAR(80),
  location VARCHAR(255),
  business_number VARCHAR(40),
  status ENUM('PENDING','TRIAL','APPROVED_AWAITING_PAYMENT','PAYMENT_SUBMITTED','ACTIVE','EXPIRED','SUSPENDED') NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  branch_code VARCHAR(80) NOT NULL,
  branch_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  mobile VARCHAR(80),
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_branch_code (business_id, branch_code),
  CONSTRAINT fk_branches_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  name VARCHAR(255),
  status ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_key VARCHAR(80) NOT NULL UNIQUE,
  role_name VARCHAR(160) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_key VARCHAR(80) NOT NULL,
  permission_key VARCHAR(160) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_role_permission (role_key, permission_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS business_users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  branch_id VARCHAR(64),
  user_id INT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_default_branch TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_business_user_branch (business_id, user_id, branch_id),
  CONSTRAINT fk_business_users_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_business_users_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_business_users_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS branch_user_permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  branch_id VARCHAR(64) NOT NULL,
  user_id INT NOT NULL,
  permission_key VARCHAR(160) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_branch_user_permission (business_id, branch_id, user_id, permission_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO roles (role_key, role_name, description) VALUES
('admin', 'Admin', 'System administration and business management'),
('supervisor', 'Supervisor', 'Branch and operational supervision'),
('user', 'User', 'Standard transaction user');

CREATE TABLE IF NOT EXISTS service_categories (
  id VARCHAR(64) PRIMARY KEY,
  service_key VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  sync_status ENUM('PENDING','SYNCED','FAILED') NOT NULL DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_items (
  id VARCHAR(64) PRIMARY KEY,
  category_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  default_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  sync_status ENUM('PENDING','SYNCED','FAILED') NOT NULL DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_service_item (category_id, name),
  CONSTRAINT fk_service_items_category FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_sub_items (
  id VARCHAR(64) PRIMARY KEY,
  service_item_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_service_sub_item (service_item_id, name),
  CONSTRAINT fk_service_sub_items_item FOREIGN KEY (service_item_id) REFERENCES service_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(64) PRIMARY KEY,
  plan_code VARCHAR(80) NOT NULL UNIQUE,
  plan_name VARCHAR(255) NOT NULL,
  billing_period ENUM('TRIAL','MONTHLY','QUARTERLY','SEMI_ANNUAL','YEARLY','CUSTOM') NOT NULL DEFAULT 'MONTHLY',
  duration_days INT NOT NULL DEFAULT 30,
  branch_limit INT NOT NULL DEFAULT 1,
  price DECIMAL(14,2) NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscription_plan_services (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  plan_id VARCHAR(64) NOT NULL,
  service_category_id VARCHAR(64) NOT NULL,
  UNIQUE KEY uq_plan_service (plan_id, service_category_id),
  CONSTRAINT fk_plan_services_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
  CONSTRAINT fk_plan_services_category FOREIGN KEY (service_category_id) REFERENCES service_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS package_features (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  plan_id VARCHAR(64) NOT NULL,
  feature_key VARCHAR(120) NOT NULL,
  feature_name VARCHAR(255) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_package_feature (plan_id, feature_key),
  CONSTRAINT fk_package_features_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS business_subscriptions (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  plan_id VARCHAR(64) NOT NULL,
  status ENUM('PENDING','TRIAL','APPROVED_AWAITING_PAYMENT','PAYMENT_SUBMITTED','ACTIVE','EXPIRED','SUSPENDED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  branch_limit INT NOT NULL DEFAULT 1,
  activation_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_business_subscription_status (business_id, status, expiry_date),
  CONSTRAINT fk_business_subscriptions_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_business_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscription_services (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  subscription_id VARCHAR(64) NOT NULL,
  service_category_id VARCHAR(64) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_subscription_service (subscription_id, service_category_id),
  CONSTRAINT fk_subscription_services_subscription FOREIGN KEY (subscription_id) REFERENCES business_subscriptions(id) ON DELETE CASCADE,
  CONSTRAINT fk_subscription_services_category FOREIGN KEY (service_category_id) REFERENCES service_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  branch_id VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  vehicle VARCHAR(80) NOT NULL,
  vehicle_model VARCHAR(255),
  contact VARCHAR(255),
  mobile VARCHAR(80),
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_vehicle (business_id, vehicle),
  CONSTRAINT fk_customers_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_customers_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  branch_id VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(80),
  role VARCHAR(120),
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_employees_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_employees_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS actions (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_actions_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS packages (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  services TEXT,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_packages_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS expense_categories (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_expense_categories_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS expense_items (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64),
  expense_category_id VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_expense_items_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_expense_items_category FOREIGN KEY (expense_category_id) REFERENCES expense_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS job_cards (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  branch_id VARCHAR(64),
  customer_id VARCHAR(64) NOT NULL,
  ref VARCHAR(40) NOT NULL,
  invoice_ref VARCHAR(40),
  job_date DATE NOT NULL,
  mileage VARCHAR(80),
  notes TEXT,
  confirmation_status ENUM('PENDING','CONFIRMED') NOT NULL DEFAULT 'PENDING',
  payment_status ENUM('UNPAID','PARTIAL','PAID') NOT NULL DEFAULT 'UNPAID',
  service_card_json JSON,
  record_mode ENUM('TRIAL','OFFICIAL') NOT NULL DEFAULT 'TRIAL',
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  archived_at TIMESTAMP NULL,
  archive_reason VARCHAR(255),
  sync_status ENUM('PENDING','SYNCED','FAILED') NOT NULL DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_job_ref (business_id, ref),
  INDEX idx_job_cards_date (business_id, branch_id, job_date),
  CONSTRAINT fk_job_cards_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_job_cards_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_job_cards_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_job_cards_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS job_card_items (
  id VARCHAR(64) PRIMARY KEY,
  job_card_id VARCHAR(64) NOT NULL,
  category_id VARCHAR(64),
  service_item_id VARCHAR(64),
  attendant_id VARCHAR(64),
  action VARCHAR(120),
  status VARCHAR(120),
  confirmed TINYINT(1) NOT NULL DEFAULT 0,
  amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  remarks TEXT,
  sync_status ENUM('PENDING','SYNCED','FAILED') NOT NULL DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_job_card_items_job FOREIGN KEY (job_card_id) REFERENCES job_cards(id) ON DELETE CASCADE,
  CONSTRAINT fk_job_card_items_category FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_job_card_items_service FOREIGN KEY (service_item_id) REFERENCES service_items(id) ON DELETE SET NULL,
  CONSTRAINT fk_job_card_items_attendant FOREIGN KEY (attendant_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS job_card_item_sub_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  job_card_item_id VARCHAR(64) NOT NULL,
  sub_item_id VARCHAR(64),
  sub_item_name VARCHAR(255) NOT NULL,
  done TINYINT(1) NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_job_card_item_subs_item FOREIGN KEY (job_card_item_id) REFERENCES job_card_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_job_card_item_subs_sub_item FOREIGN KEY (sub_item_id) REFERENCES service_sub_items(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchased_items (
  id VARCHAR(64) PRIMARY KEY,
  job_card_id VARCHAR(64) NOT NULL,
  category_id VARCHAR(64),
  service_item_id VARCHAR(64),
  item_name VARCHAR(255) NOT NULL,
  unit VARCHAR(80),
  quantity DECIMAL(14,2) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(14,2) NOT NULL DEFAULT 0,
  amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  status VARCHAR(120),
  sync_status ENUM('PENDING','SYNCED','FAILED') NOT NULL DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_purchased_items_job FOREIGN KEY (job_card_id) REFERENCES job_cards(id) ON DELETE CASCADE,
  CONSTRAINT fk_purchased_items_category FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_purchased_items_service FOREIGN KEY (service_item_id) REFERENCES service_items(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  branch_id VARCHAR(64),
  job_card_id VARCHAR(64) NOT NULL,
  invoice_ref VARCHAR(60) NOT NULL,
  invoice_date DATE NOT NULL,
  total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  status ENUM('UNPAID','PARTIAL','PAID','CANCELLED') NOT NULL DEFAULT 'UNPAID',
  qr_payload TEXT,
  sync_status ENUM('PENDING','SYNCED','FAILED') NOT NULL DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_invoice_ref (business_id, invoice_ref),
  CONSTRAINT fk_invoices_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_invoices_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_invoices_job FOREIGN KEY (job_card_id) REFERENCES job_cards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  branch_id VARCHAR(64),
  job_card_id VARCHAR(64) NOT NULL,
  invoice_id VARCHAR(64),
  ref VARCHAR(60) NOT NULL,
  payment_date DATE NOT NULL,
  method VARCHAR(80),
  amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  comment TEXT,
  attachment_name VARCHAR(255),
  record_mode ENUM('TRIAL','OFFICIAL') NOT NULL DEFAULT 'TRIAL',
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  archived_at TIMESTAMP NULL,
  archive_reason VARCHAR(255),
  sync_status ENUM('PENDING','SYNCED','FAILED') NOT NULL DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payment_ref (business_id, ref),
  CONSTRAINT fk_payments_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_payments_job FOREIGN KEY (job_card_id) REFERENCES job_cards(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
  CONSTRAINT fk_payments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_items (
  id VARCHAR(64) PRIMARY KEY,
  payment_id VARCHAR(64) NOT NULL,
  job_card_item_id VARCHAR(64),
  purchased_item_id VARCHAR(64),
  label VARCHAR(255) NOT NULL,
  amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  sync_status ENUM('PENDING','SYNCED','FAILED') NOT NULL DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_items_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_items_job_item FOREIGN KEY (job_card_item_id) REFERENCES job_card_items(id) ON DELETE SET NULL,
  CONSTRAINT fk_payment_items_purchase FOREIGN KEY (purchased_item_id) REFERENCES purchased_items(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS receipts (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  branch_id VARCHAR(64),
  payment_id VARCHAR(64) NOT NULL,
  receipt_ref VARCHAR(60) NOT NULL,
  receipt_date DATE NOT NULL,
  amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  qr_payload TEXT,
  sync_status ENUM('PENDING','SYNCED','FAILED') NOT NULL DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_receipt_ref (business_id, receipt_ref),
  CONSTRAINT fk_receipts_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_receipts_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_receipts_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  branch_id VARCHAR(64),
  expense_date DATE NOT NULL,
  expense_category_id VARCHAR(64),
  expense_item_name VARCHAR(255) NOT NULL,
  amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  comment TEXT,
  record_mode ENUM('TRIAL','OFFICIAL') NOT NULL DEFAULT 'TRIAL',
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  archived_at TIMESTAMP NULL,
  archive_reason VARCHAR(255),
  sync_status ENUM('PENDING','SYNCED','FAILED') NOT NULL DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_expenses_date (business_id, branch_id, expense_date),
  CONSTRAINT fk_expenses_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_expenses_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_expenses_category FOREIGN KEY (expense_category_id) REFERENCES expense_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_expenses_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS commissions (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  branch_id VARCHAR(64),
  commission_date DATE NOT NULL,
  job_card_id VARCHAR(64) NOT NULL,
  attendant_id VARCHAR(64),
  type VARCHAR(80),
  rate DECIMAL(14,2) NOT NULL DEFAULT 0,
  amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  status ENUM('PENDING','PAID') NOT NULL DEFAULT 'PAID',
  record_mode ENUM('TRIAL','OFFICIAL') NOT NULL DEFAULT 'TRIAL',
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  archived_at TIMESTAMP NULL,
  archive_reason VARCHAR(255),
  sync_status ENUM('PENDING','SYNCED','FAILED') NOT NULL DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_commissions_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_commissions_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_commissions_job FOREIGN KEY (job_card_id) REFERENCES job_cards(id) ON DELETE CASCADE,
  CONSTRAINT fk_commissions_attendant FOREIGN KEY (attendant_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_cards (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  branch_id VARCHAR(64),
  job_card_id VARCHAR(64) NOT NULL,
  current_mileage VARCHAR(80),
  next_service_mileage VARCHAR(80),
  next_service_date DATE,
  service_interval_comment TEXT,
  attended_by VARCHAR(255),
  reviewed_by VARCHAR(255),
  sync_status ENUM('PENDING','SYNCED','FAILED') NOT NULL DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_service_cards_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_service_cards_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_service_cards_job FOREIGN KEY (job_card_id) REFERENCES job_cards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_card_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  service_card_id VARCHAR(64) NOT NULL,
  service_item_name VARCHAR(255) NOT NULL,
  done TINYINT(1) NOT NULL DEFAULT 0,
  remarks TEXT,
  sync_status ENUM('PENDING','SYNCED','FAILED') NOT NULL DEFAULT 'SYNCED',
  last_synced_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_service_card_items_card FOREIGN KEY (service_card_id) REFERENCES service_cards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS licenses (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64),
  business_name VARCHAR(255),
  device_id VARCHAR(255),
  license_type VARCHAR(120),
  activation_date DATE,
  expiry_date DATE,
  status VARCHAR(80),
  activation_code TEXT,
  request_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_license_device (device_id),
  CONSTRAINT fk_licenses_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activation_requests (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64),
  device_id VARCHAR(255) NOT NULL,
  request_type ENUM('ACTIVATION','EXTENSION','RESET_PASSWORD') NOT NULL DEFAULT 'ACTIVATION',
  requested_duration VARCHAR(80),
  request_code TEXT NOT NULL,
  activation_code TEXT,
  status ENUM('PENDING','APPROVED','REJECTED','USED') NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_activation_requests_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_requests (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64),
  user_id INT,
  device_id VARCHAR(255),
  reset_token TEXT NOT NULL,
  reset_code TEXT,
  status ENUM('PENDING','APPROVED','USED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_password_reset_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL,
  CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_settings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  business_id VARCHAR(64),
  branch_id VARCHAR(64),
  settings_json JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_app_settings_scope (business_id, branch_id),
  CONSTRAINT fk_app_settings_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_app_settings_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vasma_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vasma_data_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS business_sync_state (
  business_id VARCHAR(64) PRIMARY KEY,
  data JSON NOT NULL,
  server_sequence BIGINT NOT NULL DEFAULT 0,
  last_device_id VARCHAR(255),
  last_user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_business_sync_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sync_audit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  business_id VARCHAR(64),
  branch_id VARCHAR(64),
  action VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL,
  message VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sync_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_sync_audit_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL,
  CONSTRAINT fk_sync_audit_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  business_id VARCHAR(64),
  branch_id VARCHAR(64),
  user_id INT,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(120),
  entity_id VARCHAR(64),
  before_json JSON,
  after_json JSON,
  ip_address VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_entity (business_id, entity_type, entity_id),
  CONSTRAINT fk_audit_logs_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL,
  CONSTRAINT fk_audit_logs_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_methods (
  id VARCHAR(64) PRIMARY KEY,
  method_name VARCHAR(160) NOT NULL,
  account_name VARCHAR(255),
  account_number VARCHAR(160),
  instructions TEXT,
  active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscription_payments (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL,
  subscription_id VARCHAR(64),
  payment_method_id VARCHAR(64),
  payment_date DATE NOT NULL,
  amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  reference VARCHAR(160),
  status ENUM('PENDING','CONFIRMED','REJECTED') NOT NULL DEFAULT 'PENDING',
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_subscription_payments_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  CONSTRAINT fk_subscription_payments_subscription FOREIGN KEY (subscription_id) REFERENCES business_subscriptions(id) ON DELETE SET NULL,
  CONSTRAINT fk_subscription_payments_method FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS landing_pages (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  content_json JSON,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS demo_registrations (
  id VARCHAR(64) PRIMARY KEY,
  package_code VARCHAR(32) NOT NULL,
  package_name VARCHAR(255) NOT NULL,
  allowed_services TEXT,
  business_name VARCHAR(255),
  owner_name VARCHAR(255),
  user_name VARCHAR(255),
  mobile VARCHAR(80),
  location VARCHAR(255),
  status VARCHAR(40) NOT NULL DEFAULT 'DEMO',
  registered_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO service_categories (id, service_key, name) VALUES
('svc_tire', 'tire', 'Tire Service'),
('svc_carwash', 'carWash', 'Car Wash'),
('svc_general', 'general', 'General Service');

INSERT IGNORE INTO subscription_plans (id, plan_code, plan_name, billing_period, duration_days, branch_limit, price) VALUES
('plan_tire_monthly', 'VASMA-1-MONTHLY', 'Tyre Service Only', 'MONTHLY', 30, 1, 0),
('plan_carwash_monthly', 'VASMA-2-MONTHLY', 'Car Wash Only', 'MONTHLY', 30, 1, 0),
('plan_general_monthly', 'VASMA-3-MONTHLY', 'General Service Only', 'MONTHLY', 30, 1, 0),
('plan_tire_carwash_monthly', 'VASMA-12-MONTHLY', 'Tyre Service + Car Wash', 'MONTHLY', 30, 1, 0),
('plan_tire_general_monthly', 'VASMA-13-MONTHLY', 'Tyre Service + General Service', 'MONTHLY', 30, 1, 0),
('plan_carwash_general_monthly', 'VASMA-23-MONTHLY', 'Car Wash + General Service', 'MONTHLY', 30, 1, 0),
('plan_full_monthly', 'VASMA-123-MONTHLY', 'Full Service Package', 'MONTHLY', 30, 1, 0);

INSERT IGNORE INTO subscription_plan_services (plan_id, service_category_id) VALUES
('plan_tire_monthly', 'svc_tire'),
('plan_carwash_monthly', 'svc_carwash'),
('plan_general_monthly', 'svc_general'),
('plan_tire_carwash_monthly', 'svc_tire'),
('plan_tire_carwash_monthly', 'svc_carwash'),
('plan_tire_general_monthly', 'svc_tire'),
('plan_tire_general_monthly', 'svc_general'),
('plan_carwash_general_monthly', 'svc_carwash'),
('plan_carwash_general_monthly', 'svc_general'),
('plan_full_monthly', 'svc_tire'),
('plan_full_monthly', 'svc_carwash'),
('plan_full_monthly', 'svc_general');

INSERT INTO users (username, password, role, name)
VALUES ('admin', '$2a$10$qvFAYqEghrwQ011zAxkwtOAGAH/rsglovkQ2xINVMWAK5QCPk.EMi', 'admin', 'Administrator')
ON DUPLICATE KEY UPDATE username = username;
