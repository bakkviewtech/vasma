const express = require("express");
const db = require("../db/mysql");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

const SERVICE_CATEGORY_IDS = {
  tire: "svc_tire",
  carwash: "svc_carwash",
  "car wash": "svc_carwash",
  carWash: "svc_carwash",
  general: "svc_general",
  "general service": "svc_general",
  "tire service": "svc_tire",
  "tyre service": "svc_tire"
};

function cleanId(value, fallback) {
  const text = String(value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 58);
  return text || fallback;
}

function compactDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const text = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : new Date().toISOString().slice(0, 10);
}

function money(value) {
  const parsed = Number(String(value ?? 0).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function bool(value) {
  return value === true || value === 1 || value === "1";
}

function recordMode(value) {
  return String(value || "").toUpperCase() === "OFFICIAL" ? "OFFICIAL" : "TRIAL";
}

function tableRows(collection) {
  return Array.isArray(collection) ? collection : [];
}

function byId(collection, id) {
  return tableRows(collection).find((item) => String(item.id) === String(id));
}

function serviceCategoryId(category) {
  const name = String(category?.name || category || "").trim();
  const key = name.toLowerCase();
  return SERVICE_CATEGORY_IDS[key] || SERVICE_CATEGORY_IDS[category?.service_key] || cleanId(category?.id, `cat_${Date.now()}`);
}

function enabledServicePlan(settings = {}) {
  const services = Array.isArray(settings.enabledServices) ? settings.enabledServices : ["tire", "carWash", "general"];
  const normalized = services
    .map((service) => ({ tire: "1", carWash: "2", general: "3" }[service]))
    .filter(Boolean)
    .sort()
    .join("");
  return {
    serviceCode: normalized || "123",
    planId: {
      "1": "plan_tire_monthly",
      "2": "plan_carwash_monthly",
      "3": "plan_general_monthly",
      "12": "plan_tire_carwash_monthly",
      "13": "plan_tire_general_monthly",
      "23": "plan_carwash_general_monthly",
      "123": "plan_full_monthly"
    }[normalized] || "plan_full_monthly"
  };
}

function businessUidFromDate(date, minuteOffset = 0) {
  const stamp = new Date(date.getTime() + minuteOffset * 60000);
  const yy = String(stamp.getFullYear()).slice(-2);
  const mm = String(stamp.getMonth() + 1).padStart(2, "0");
  const dd = String(stamp.getDate()).padStart(2, "0");
  const hh = String(stamp.getHours()).padStart(2, "0");
  const min = String(stamp.getMinutes()).padStart(2, "0");
  return `VSM-${yy}${mm}${dd}${hh}${min}`;
}

async function nextBusinessUid() {
  const base = new Date();
  for (let offset = 0; offset < 1440; offset += 1) {
    const uid = businessUidFromDate(base, offset);
    const [rows] = await db.query("SELECT id FROM businesses WHERE business_uid = ? LIMIT 1", [uid]);
    if (!rows.length) return uid;
  }
  return `VSM-${Date.now()}`;
}

function accessError(message, statusCode = 403, code = "ACCESS_DENIED") {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function transactionFingerprint(data = {}) {
  const important = {
    jobCards: tableRows(data.jobCards),
    payments: tableRows(data.payments),
    expenses: tableRows(data.expenses),
    commissions: tableRows(data.commissions)
  };
  return JSON.stringify(important);
}

async function currentSavedData(userId) {
  const [rows] = await db.query("SELECT data FROM vasma_data WHERE user_id = ? LIMIT 1", [userId]);
  return rows[0]?.data || null;
}

async function ensureBusinessSyncStateTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS business_sync_state (
      business_id VARCHAR(64) PRIMARY KEY,
      data JSON NOT NULL,
      server_sequence BIGINT NOT NULL DEFAULT 0,
      last_device_id VARCHAR(255),
      last_user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_business_sync_updated (updated_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function currentBusinessSyncState(connection, businessId) {
  await ensureBusinessSyncStateTable();
  const runner = connection || db;
  const [rows] = await runner.query(
    "SELECT business_id, data, server_sequence, updated_at FROM business_sync_state WHERE business_id = ? LIMIT 1",
    [businessId]
  );
  return rows[0] || null;
}

function parseJsonData(value) {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return typeof value === "object" ? value : null;
}

function recordTimestamp(record) {
  const candidates = [record?.updatedAt, record?.updated_at, record?.createdAt, record?.created_at, record?.date, record?._syncUpdatedAt];
  for (const value of candidates) {
    const time = value ? new Date(value).getTime() : NaN;
    if (Number.isFinite(time)) return time;
  }
  return 0;
}

function mergeById(existingRows, incomingRows) {
  const merged = new Map();
  for (const row of tableRows(existingRows)) {
    if (!row?.id) continue;
    merged.set(String(row.id), row);
  }
  for (const row of tableRows(incomingRows)) {
    if (!row?.id) continue;
    const key = String(row.id);
    const previous = merged.get(key);
    if (!previous || recordTimestamp(row) >= recordTimestamp(previous)) {
      merged.set(key, row);
    }
  }
  const orderedIds = [];
  for (const row of [...tableRows(existingRows), ...tableRows(incomingRows)]) {
    if (row?.id && !orderedIds.includes(String(row.id))) orderedIds.push(String(row.id));
  }
  return orderedIds.map((id) => merged.get(id)).filter(Boolean);
}

function mergeCategories(existingRows, incomingRows) {
  const merged = mergeById(existingRows, incomingRows);
  return merged.map((category) => {
    const existing = tableRows(existingRows).find((row) => row?.id === category.id);
    const incoming = tableRows(incomingRows).find((row) => row?.id === category.id);
    if (!existing || !incoming) return category;
    return {
      ...category,
      items: mergeById(existing.items, incoming.items).map((item) => {
        const existingItem = tableRows(existing.items).find((row) => row?.id === item.id);
        const incomingItem = tableRows(incoming.items).find((row) => row?.id === item.id);
        return existingItem && incomingItem ? { ...item, subItems: mergeById(existingItem.subItems, incomingItem.subItems) } : item;
      })
    };
  });
}

function applyDeletedIds(data, deletedIds = {}) {
  const next = { ...(data || {}) };
  const listKeys = [
    "customers",
    "employees",
    "packages",
    "expenseItems",
    "actions",
    "jobCards",
    "payments",
    "expenses",
    "commissions",
    "serviceCards"
  ];
  for (const key of listKeys) {
    const removed = new Set(tableRows(deletedIds[key]).map(String));
    if (removed.size) next[key] = tableRows(next[key]).filter((row) => !removed.has(String(row?.id)));
  }
  if (deletedIds.categories?.length) {
    const removed = new Set(tableRows(deletedIds.categories).map(String));
    next.categories = tableRows(next.categories).filter((row) => !removed.has(String(row?.id)));
  }
  return next;
}

function mergeStateSnapshots(existingData, incomingData, baseSequence, currentSequence, deletedIds = {}) {
  const existing = parseJsonData(existingData);
  const incoming = parseJsonData(incomingData) || {};
  if (!existing || Number(baseSequence || 0) >= Number(currentSequence || 0)) {
    return applyDeletedIds(incoming, deletedIds);
  }

  const merged = { ...existing, ...incoming };
  const listKeys = [
    "customers",
    "employees",
    "packages",
    "expenseItems",
    "actions",
    "jobCards",
    "payments",
    "expenses",
    "commissions",
    "serviceCards"
  ];
  for (const key of listKeys) merged[key] = mergeById(existing[key], incoming[key]);
  merged.categories = mergeCategories(existing.categories, incoming.categories);
  merged.settings = { ...(existing.settings || {}), ...(incoming.settings || {}) };
  return applyDeletedIds(merged, deletedIds);
}

async function getSubscriptionContext(connection, scope) {
  const [businessRows] = await connection.query(
    "SELECT id, status FROM businesses WHERE id = ? LIMIT 1",
    [scope.businessId]
  );
  const business = businessRows[0];
  const [subscriptionRows] = await connection.query(
    `SELECT bs.id, bs.status, bs.expiry_date, bs.branch_limit, bs.plan_id
     FROM business_subscriptions bs
     WHERE bs.business_id = ?
     ORDER BY bs.updated_at DESC, bs.created_at DESC
     LIMIT 1`,
    [scope.businessId]
  );
  const subscription = subscriptionRows[0] || null;
  const allowed = new Set();
  if (subscription) {
    const [serviceRows] = await connection.query(
      `SELECT service_category_id FROM subscription_services
       WHERE subscription_id = ? AND active = 1`,
      [subscription.id]
    );
    serviceRows.forEach((row) => allowed.add(row.service_category_id));
    if (!allowed.size) {
      const [planRows] = await connection.query(
        "SELECT service_category_id FROM subscription_plan_services WHERE plan_id = ?",
        [subscription.plan_id]
      );
      planRows.forEach((row) => allowed.add(row.service_category_id));
    }
  }
  return { business, subscription, allowedServiceIds: allowed };
}

function isExpired(context) {
  if (!context.business) return false;
  if (["PENDING", "EXPIRED", "SUSPENDED"].includes(context.business.status)) return true;
  if (!context.subscription) return false;
  if (["PENDING", "EXPIRED", "SUSPENDED", "CANCELLED"].includes(context.subscription.status)) return true;
  const expiry = context.subscription.expiry_date ? new Date(context.subscription.expiry_date) : null;
  if (!expiry || Number.isNaN(expiry.getTime())) return false;
  expiry.setHours(23, 59, 59, 999);
  return new Date() > expiry;
}

async function assertAccessRules(connection, req, data, scope, existingData) {
  if (req.user.role === "admin") return;

  const [userScopes] = await connection.query(
    `SELECT id FROM business_users
     WHERE user_id = ? AND business_id = ? AND (branch_id = ? OR branch_id IS NULL)
     LIMIT 1`,
    [req.user.id, scope.businessId, scope.branchId]
  );
  if (!userScopes.length) throw accessError("Access denied for this business or branch.");

  const context = await getSubscriptionContext(connection, scope);
  if (!context.business) throw accessError("Business account was not found.");
  if (context.business.status === "PENDING") throw accessError("Business account is pending Super Admin activation.");
  if (context.business.status === "SUSPENDED") throw accessError("Business account is suspended.");

  if (isExpired(context) && transactionFingerprint(existingData) !== transactionFingerprint(data)) {
    throw accessError("Subscription expired. Account is report-only; new transactions are blocked.", 403, "SUBSCRIPTION_EXPIRED");
  }

  if (context.allowedServiceIds.size) {
    for (const job of tableRows(data.jobCards)) {
      for (const item of tableRows(job.items)) {
        const category = byId(data.categories, item.categoryId);
        const categoryId = serviceCategoryId(category || item.categoryName || item.categoryId);
        if (!context.allowedServiceIds.has(categoryId)) {
          throw accessError(`Subscription does not allow this service category: ${category?.name || item.categoryName || item.categoryId}`);
        }
      }
    }
  }
}

async function ensureBusiness(req, data) {
  const settings = data.settings || {};
  const username = req.user.username || `user-${req.user.id}`;
  const businessCode = username === "admin" ? `ADMIN-${req.user.id}` : username;
  const businessId = cleanId(`biz_${businessCode}`, `biz_${req.user.id}`);
  const branchId = cleanId(`branch_${businessCode}_main`, `branch_${req.user.id}_main`);
  const businessName = settings.businessName || data.business?.businessName || businessCode;
  const ownerName = settings.ownerName || settings.userName || req.user.username;
  const businessNumber = String(businessCode).match(/-(\d{2,})$/)?.[1] || "00";
  const businessUid = settings.businessId || data.business?.businessId || await nextBusinessUid();

  await db.query(
    `INSERT INTO businesses (id, business_uid, business_code, business_name, owner_name, mobile, location, business_number, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       business_uid = COALESCE(business_uid, VALUES(business_uid)),
       business_name = VALUES(business_name),
       owner_name = VALUES(owner_name),
       mobile = VALUES(mobile),
       location = VALUES(location),
       business_number = VALUES(business_number),
       updated_at = CURRENT_TIMESTAMP`,
    [businessId, businessUid, businessCode, businessName, ownerName, settings.mobile || "", settings.location || "", businessNumber, "TRIAL"]
  );

  await db.query(
    `INSERT INTO branches (id, business_id, branch_code, branch_name, location, mobile, status)
     VALUES (?, ?, 'MAIN', 'Main Branch', ?, ?, 'ACTIVE')
     ON DUPLICATE KEY UPDATE location = VALUES(location), mobile = VALUES(mobile), updated_at = CURRENT_TIMESTAMP`,
    [branchId, businessId, settings.location || "", settings.mobile || ""]
  );

  await db.query(
    `INSERT INTO business_users (business_id, branch_id, user_id, role, is_default_branch)
     VALUES (?, ?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE role = VALUES(role), is_default_branch = 1`,
    [businessId, branchId, req.user.id, req.user.role || "business"]
  );

  const subscriptionId = cleanId(`sub_${businessCode}`, `sub_${req.user.id}`);
  const [existingSubscriptions] = await db.query(
    "SELECT id FROM business_subscriptions WHERE id = ? LIMIT 1",
    [subscriptionId]
  );
  const plan = enabledServicePlan(settings);
  await db.query(
    `INSERT INTO business_subscriptions (id, business_id, plan_id, status, start_date, expiry_date, branch_limit)
     VALUES (?, ?, ?, 'TRIAL', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 1)
     ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
    [subscriptionId, businessId, plan.planId]
  );
  if (!existingSubscriptions.length) {
    for (const service of tableRows(settings.enabledServices)) {
      const categoryId = SERVICE_CATEGORY_IDS[service] || SERVICE_CATEGORY_IDS[String(service).toLowerCase()];
      if (categoryId) {
        await db.query(
          "INSERT IGNORE INTO subscription_services (subscription_id, service_category_id, active) VALUES (?, ?, 1)",
          [subscriptionId, categoryId]
        );
      }
    }
  }

  return { businessId, branchId };
}

async function businessScopeForUser(userId) {
  const [rows] = await db.query(
    `SELECT b.id AS business_id, b.business_uid, b.business_code, b.business_name, b.status AS business_status,
            br.id AS branch_id, bs.id AS subscription_id, bs.status AS subscription_status, bs.plan_id
     FROM business_users bu
     JOIN businesses b ON b.id = bu.business_id
     LEFT JOIN branches br ON br.id = bu.branch_id
     LEFT JOIN business_subscriptions bs ON bs.business_id = b.id
     WHERE bu.user_id = ?
     ORDER BY bu.is_default_branch DESC, bs.updated_at DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

async function clearBusinessMirror(connection, businessId) {
  const deletes = [
    "DELETE FROM service_cards WHERE business_id = ?",
    "DELETE FROM commissions WHERE business_id = ?",
    "DELETE FROM receipts WHERE business_id = ?",
    "DELETE FROM payments WHERE business_id = ?",
    "DELETE FROM invoices WHERE business_id = ?",
    "DELETE FROM job_cards WHERE business_id = ?",
    "DELETE FROM expenses WHERE business_id = ?",
    "DELETE FROM customers WHERE business_id = ?",
    "DELETE FROM employees WHERE business_id = ?",
    "DELETE FROM packages WHERE business_id = ?",
    "DELETE FROM actions WHERE business_id = ?",
    "DELETE FROM expense_items WHERE business_id = ?",
    "DELETE FROM expense_categories WHERE business_id = ?",
    "DELETE FROM app_settings WHERE business_id = ?"
  ];
  for (const statement of deletes) await connection.query(statement, [businessId]);
}

async function syncMasters(connection, data, scope) {
  const { businessId, branchId } = scope;
  const categoryMap = new Map();
  const itemMap = new Map();

  for (const category of tableRows(data.categories)) {
    const categoryId = serviceCategoryId(category);
    categoryMap.set(category.id, categoryId);
    const serviceKey = SERVICE_CATEGORY_IDS[String(category.name || "").toLowerCase()]
      ? String(category.name).toLowerCase().replace(/\s+/g, "_")
      : `custom_${cleanId(category.id, categoryId)}`;
    await connection.query(
      `INSERT INTO service_categories (id, service_key, name, active)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), active = VALUES(active), updated_at = CURRENT_TIMESTAMP`,
      [categoryId, serviceKey, category.name || "Service Category", category.active === false ? 0 : 1]
    );

    for (const item of tableRows(category.items)) {
      const proposedItemId = cleanId(item.id, `item_${Date.now()}`);
      const [existingItems] = await connection.query(
        "SELECT id FROM service_items WHERE category_id = ? AND name = ? LIMIT 1",
        [categoryId, item.name || "Service Item"]
      );
      const itemId = existingItems[0]?.id || proposedItemId;
      itemMap.set(item.id, itemId);
      await connection.query(
        `INSERT INTO service_items (id, category_id, name, default_amount, active)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE category_id = VALUES(category_id), name = VALUES(name), active = VALUES(active), updated_at = CURRENT_TIMESTAMP`,
        [itemId, categoryId, item.name || "Service Item", money(item.defaultAmount), item.active === false ? 0 : 1]
      );
      for (const subItem of tableRows(item.subItems)) {
        const [existingSubItems] = await connection.query(
          "SELECT id FROM service_sub_items WHERE service_item_id = ? AND name = ? LIMIT 1",
          [itemId, subItem.name || "Sub Item"]
        );
        const subItemId = existingSubItems[0]?.id || cleanId(subItem.id, `sub_${Date.now()}`);
        await connection.query(
          `INSERT INTO service_sub_items (id, service_item_id, name, active)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE service_item_id = VALUES(service_item_id), name = VALUES(name), active = VALUES(active), updated_at = CURRENT_TIMESTAMP`,
          [subItemId, itemId, subItem.name || "Sub Item", subItem.active === false ? 0 : 1]
        );
      }
    }
  }

  for (const customer of tableRows(data.customers)) {
    await connection.query(
      `INSERT INTO customers (id, business_id, branch_id, name, vehicle, vehicle_model, contact, mobile, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanId(customer.id, `cust_${Date.now()}`),
        businessId,
        branchId,
        customer.name || "Customer",
        customer.vehicle || "",
        customer.vehicleModel || "",
        customer.contact || "",
        customer.mobile || "",
        customer.active === false ? 0 : 1
      ]
    );
  }

  for (const employee of tableRows(data.employees)) {
    await connection.query(
      `INSERT INTO employees (id, business_id, branch_id, name, mobile, role, active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanId(employee.id, `emp_${Date.now()}`),
        businessId,
        branchId,
        employee.name || "Employee",
        employee.mobile || "",
        employee.role || "",
        employee.active === false ? 0 : 1
      ]
    );
  }

  for (const action of tableRows(data.actions)) {
    await connection.query(
      "INSERT INTO actions (id, business_id, name, active) VALUES (?, ?, ?, ?)",
      [cleanId(action.id, `act_${Date.now()}`), businessId, action.name || String(action), action.active === false ? 0 : 1]
    );
  }

  for (const pkg of tableRows(data.packages)) {
    await connection.query(
      "INSERT INTO packages (id, business_id, name, services, active) VALUES (?, ?, ?, ?, ?)",
      [cleanId(pkg.id, `pkg_${Date.now()}`), businessId, pkg.name || "Package", pkg.services || "", pkg.active === false ? 0 : 1]
    );
  }

  for (const expenseCategory of tableRows(data.expenseItems)) {
    const categoryId = cleanId(expenseCategory.id, `expcat_${Date.now()}`);
    await connection.query(
      "INSERT INTO expense_categories (id, business_id, name, active) VALUES (?, ?, ?, ?)",
      [categoryId, businessId, expenseCategory.name || String(expenseCategory), expenseCategory.active === false ? 0 : 1]
    );
  }

  await connection.query(
    "INSERT INTO app_settings (business_id, branch_id, settings_json) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE settings_json = VALUES(settings_json), updated_at = CURRENT_TIMESTAMP",
    [businessId, branchId, JSON.stringify(data.settings || {})]
  );

  return { categoryMap, itemMap };
}

async function syncJobCards(connection, data, scope, maps) {
  const { businessId, branchId } = scope;
  for (const job of tableRows(data.jobCards)) {
    const customer = byId(data.customers, job.customerId);
    if (!customer) continue;
    const jobId = cleanId(job.id, `job_${Date.now()}`);
    const total = tableRows(job.items).reduce((sum, item) => sum + money(item.amount), 0) +
      tableRows(job.purchaseItems).reduce((sum, item) => sum + money(item.amount), 0);
    const paid = tableRows(data.payments)
      .filter((payment) => payment.jobId === job.id)
      .reduce((sum, payment) => sum + tableRows(payment.items).reduce((itemSum, item) => itemSum + money(item.amount), 0), 0);
    const paymentStatus = paid >= total && total > 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";
    const confirmed = tableRows(job.items).some((item) => bool(item.confirmed));

    await connection.query(
      `INSERT INTO job_cards
       (id, business_id, branch_id, customer_id, ref, invoice_ref, job_date, mileage, notes, confirmation_status, payment_status, service_card_json, record_mode, is_archived, archived_at, archive_reason, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jobId,
        businessId,
        branchId,
        cleanId(job.customerId, ""),
        job.ref || jobId,
        job.invoiceRef || `INV-${String(job.ref || jobId).replace(/-/g, "")}`,
        compactDate(job.date),
        String(job.mileage || ""),
        job.notes || "",
        confirmed ? "CONFIRMED" : "PENDING",
        paymentStatus,
        job.serviceCard ? JSON.stringify(job.serviceCard) : null,
        recordMode(job.recordMode),
        job.isArchived ? 1 : 0,
        job.archivedAt || null,
        job.archiveReason || null,
        data._syncUserId || null
      ]
    );

    await connection.query(
      `INSERT INTO invoices (id, business_id, branch_id, job_card_id, invoice_ref, invoice_date, total_amount, paid_amount, status, qr_payload)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanId(`inv_${job.id}`, `inv_${Date.now()}`),
        businessId,
        branchId,
        jobId,
        job.invoiceRef || `INV-${String(job.ref || jobId).replace(/-/g, "")}`,
        compactDate(job.date),
        total,
        paid,
        paymentStatus,
        JSON.stringify({ ref: job.ref, total, paid, paymentStatus })
      ]
    );

    for (const item of tableRows(job.items)) {
      const itemId = cleanId(item.id, `jobitem_${Date.now()}`);
      await connection.query(
        `INSERT INTO job_card_items
         (id, job_card_id, category_id, service_item_id, attendant_id, action, status, confirmed, amount, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          jobId,
          maps.categoryMap.get(item.categoryId) || cleanId(item.categoryId, ""),
          maps.itemMap.get(item.itemId) || cleanId(item.itemId, ""),
          item.attendantId ? cleanId(item.attendantId, "") : null,
          item.action || item.status || "",
          item.status || item.action || "",
          bool(item.confirmed) ? 1 : 0,
          money(item.amount),
          item.remarks || ""
        ]
      );

      for (const subItemId of tableRows(item.subItemIds)) {
        const subItem = tableRows(byId(byId(data.categories, item.categoryId)?.items, item.itemId)?.subItems).find((entry) => entry.id === subItemId);
        await connection.query(
          `INSERT INTO job_card_item_sub_items (job_card_item_id, sub_item_id, sub_item_name, done, remarks)
           VALUES (?, ?, ?, ?, ?)`,
          [
            itemId,
            cleanId(subItemId, ""),
            subItem?.name || subItemId,
            item.subItemStatus?.[subItemId] ? 1 : bool(item.confirmed) ? 1 : 0,
            item.remarks || ""
          ]
        );
      }
    }

    for (const purchase of tableRows(job.purchaseItems)) {
      await connection.query(
        `INSERT INTO purchased_items
         (id, job_card_id, category_id, service_item_id, item_name, unit, quantity, unit_cost, amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cleanId(purchase.id, `pur_${Date.now()}`),
          jobId,
          null,
          null,
          purchase.name || "Purchased Item",
          purchase.unit || "",
          money(purchase.qty),
          money(purchase.unitCost),
          money(purchase.amount),
          purchase.status || ""
        ]
      );
    }

    if (job.serviceCard) {
      const serviceCardId = cleanId(`svc_card_${job.id}`, `svc_card_${Date.now()}`);
      await connection.query(
        `INSERT INTO service_cards
         (id, business_id, branch_id, job_card_id, current_mileage, next_service_mileage, next_service_date, service_interval_comment, attended_by, reviewed_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          serviceCardId,
          businessId,
          branchId,
          jobId,
          String(job.serviceCard.currentMileage || job.mileage || ""),
          String(job.serviceCard.nextMileage || ""),
          job.serviceCard.nextDate ? compactDate(job.serviceCard.nextDate) : null,
          job.serviceCard.intervalComment || "",
          job.serviceCard.attendedBy || "",
          job.serviceCard.reviewedBy || ""
        ]
      );
      for (const line of tableRows(job.serviceCard.lines)) {
        await connection.query(
          "INSERT INTO service_card_items (service_card_id, service_item_name, done, remarks) VALUES (?, ?, ?, ?)",
          [serviceCardId, line.serviceItem || line.name || "Service Item", bool(line.done) ? 1 : 0, line.remarks || ""]
        );
      }
    }
  }
}

async function syncPaymentsAndFinance(connection, data, scope) {
  const { businessId, branchId } = scope;
  for (const payment of tableRows(data.payments)) {
    const job = byId(data.jobCards, payment.jobId);
    if (!job) continue;
    const paymentId = cleanId(payment.id, `pay_${Date.now()}`);
    const amount = tableRows(payment.items).reduce((sum, item) => sum + money(item.amount), 0);
    await connection.query(
      `INSERT INTO payments
       (id, business_id, branch_id, job_card_id, invoice_id, ref, payment_date, method, amount, comment, attachment_name, record_mode, is_archived, archived_at, archive_reason, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentId,
        businessId,
        branchId,
        cleanId(payment.jobId, ""),
        cleanId(`inv_${payment.jobId}`, ""),
        payment.ref || paymentId,
        compactDate(payment.date),
        payment.method || "",
        amount,
        payment.comment || "",
        payment.attachmentName || "",
        recordMode(payment.recordMode),
        payment.isArchived ? 1 : 0,
        payment.archivedAt || null,
        payment.archiveReason || null,
        data._syncUserId || null
      ]
    );
    for (const item of tableRows(payment.items)) {
      const lineId = item.lineId || item.jobItemId;
      const serviceLine = tableRows(job.items).some((entry) => entry.id === lineId);
      const purchaseLine = tableRows(job.purchaseItems).some((entry) => entry.id === lineId);
      await connection.query(
        "INSERT INTO payment_items (id, payment_id, job_card_item_id, purchased_item_id, label, amount) VALUES (?, ?, ?, ?, ?, ?)",
        [
          cleanId(`${payment.id}_${lineId}`, `payitem_${Date.now()}`),
          paymentId,
          serviceLine ? cleanId(lineId, "") : null,
          purchaseLine ? cleanId(lineId, "") : null,
          item.label || lineId || "Payment Line",
          money(item.amount)
        ]
      );
    }
    await connection.query(
      `INSERT INTO receipts (id, business_id, branch_id, payment_id, receipt_ref, receipt_date, amount, qr_payload)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanId(`rcpt_${payment.id}`, `rcpt_${Date.now()}`),
        businessId,
        branchId,
        paymentId,
        payment.ref || paymentId,
        compactDate(payment.date),
        amount,
        JSON.stringify({ ref: payment.ref || paymentId, amount })
      ]
    );
  }

  for (const expense of tableRows(data.expenses)) {
    const categoryId = cleanId(`expcat_${businessId}_${expense.itemName || "general"}`, `expcat_${Date.now()}`);
    await connection.query(
      "INSERT IGNORE INTO expense_categories (id, business_id, name, active) VALUES (?, ?, ?, 1)",
      [categoryId, businessId, expense.itemName || "Expense"]
    );
    await connection.query(
      `INSERT INTO expenses (id, business_id, branch_id, expense_date, expense_category_id, expense_item_name, amount, comment, record_mode, is_archived, archived_at, archive_reason, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanId(expense.id, `exp_${Date.now()}`),
        businessId,
        branchId,
        compactDate(expense.date),
        categoryId,
        expense.expenseItem || expense.itemName || "Expense",
        money(expense.amount),
        expense.comment || "",
        recordMode(expense.recordMode),
        expense.isArchived ? 1 : 0,
        expense.archivedAt || null,
        expense.archiveReason || null,
        data._syncUserId || null
      ]
    );
  }

  for (const commission of tableRows(data.commissions)) {
    if (!byId(data.jobCards, commission.jobId)) continue;
    await connection.query(
      `INSERT INTO commissions
       (id, business_id, branch_id, commission_date, job_card_id, attendant_id, type, rate, amount, status, record_mode, is_archived, archived_at, archive_reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanId(commission.id, `comm_${Date.now()}`),
        businessId,
        branchId,
        compactDate(commission.date),
        cleanId(commission.jobId, ""),
        commission.attendantId ? cleanId(commission.attendantId, "") : null,
        commission.type || "Amount",
        money(commission.rate || commission.amount),
        money(commission.amount),
        "PAID",
        recordMode(commission.recordMode),
        commission.isArchived ? 1 : 0,
        commission.archivedAt || null,
        commission.archiveReason || null
      ]
    );
  }
}

async function syncNormalizedData(req, data, existingData) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const scope = await ensureBusiness(req, data);
    await assertAccessRules(connection, req, data, scope, existingData);
    data._syncUserId = req.user.id;
    await clearBusinessMirror(connection, scope.businessId);
    const maps = await syncMasters(connection, data, scope);
    await syncJobCards(connection, data, scope, maps);
    await syncPaymentsAndFinance(connection, data, scope);
    await connection.query(
      "INSERT INTO sync_audit (user_id, business_id, branch_id, action, status, message) VALUES (?, ?, ?, 'NORMALIZED_SAVE', 'SUCCESS', ?)",
      [req.user.id, scope.businessId, scope.branchId, "Saved JSON state and normalized transaction tables"]
    );
    await connection.commit();
    return scope;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

router.post("/save", verifyToken, async (req, res, next) => {
  const { data, deviceId, baseSequence, deletedIds } = req.body;
  if (!data || typeof data !== "object") {
    return res.status(400).json({ success: false, error: "Data payload is required" });
  }

  try {
    await ensureBusinessSyncStateTable();
    const initialScope = await ensureBusiness(req, data);
    const businessState = await currentBusinessSyncState(null, initialScope.businessId);
    const existingData = parseJsonData(businessState?.data) || parseJsonData(await currentSavedData(req.user.id));
    const mergedData = mergeStateSnapshots(existingData, data, baseSequence, businessState?.server_sequence || 0, deletedIds);
    mergedData._sync = {
      ...(mergedData._sync || {}),
      savedAt: new Date().toISOString(),
      appVersion: data._sync?.appVersion,
      deviceId: deviceId || data._sync?.deviceId || null
    };

    const scope = await syncNormalizedData(req, mergedData, existingData);
    await db.query(
      `INSERT INTO vasma_data (user_id, data)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, JSON.stringify(mergedData)]
    );
    const nextSequence = Number(businessState?.server_sequence || 0) + 1;
    await db.query(
      `INSERT INTO business_sync_state (business_id, data, server_sequence, last_device_id, last_user_id)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         data = VALUES(data),
         server_sequence = VALUES(server_sequence),
         last_device_id = VALUES(last_device_id),
         last_user_id = VALUES(last_user_id),
         updated_at = CURRENT_TIMESTAMP`,
      [scope.businessId, JSON.stringify(mergedData), nextSequence, deviceId || null, req.user.id]
    );
    res.json({ success: true, normalized: true, serverSequence: nextSequence, data: mergedData, ...scope });
  } catch (error) {
    next(error);
  }
});

router.get("/load", verifyToken, async (req, res, next) => {
  try {
    await ensureBusinessSyncStateTable();
    const scope = await businessScopeForUser(req.user.id);
    if (scope?.business_id) {
      const businessState = await currentBusinessSyncState(null, scope.business_id);
      if (businessState) {
        return res.json({
          success: true,
          data: businessState.data,
          serverSequence: businessState.server_sequence,
          record: {
            business_id: businessState.business_id,
            updated_at: businessState.updated_at,
            server_sequence: businessState.server_sequence
          }
        });
      }
    }
    const [rows] = await db.query(
      "SELECT id, user_id, data, created_at, updated_at FROM vasma_data WHERE user_id = ? LIMIT 1",
      [req.user.id]
    );
    res.json({ success: true, data: rows[0]?.data || null, serverSequence: 0, record: rows[0] || null });
  } catch (error) {
    next(error);
  }
});

router.get("/records", verifyToken, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id, user_id, created_at, updated_at FROM vasma_data WHERE user_id = ? ORDER BY updated_at DESC",
      [req.user.id]
    );
    res.json({ success: true, records: rows });
  } catch (error) {
    next(error);
  }
});

router.get("/context", verifyToken, async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      const [businesses] = await db.query("SELECT id, business_code, business_name, status FROM businesses ORDER BY business_name");
      return res.json({ success: true, role: "admin", businesses });
    }

    const [rows] = await db.query(
      `SELECT b.id AS business_id, b.business_code, b.business_name, b.status AS business_status,
              br.id AS branch_id, br.branch_code, br.branch_name, br.status AS branch_status,
              bu.role AS business_role,
              bs.id AS subscription_id, bs.status AS subscription_status, bs.expiry_date, bs.branch_limit, bs.plan_id
       FROM business_users bu
       JOIN businesses b ON b.id = bu.business_id
       LEFT JOIN branches br ON br.id = bu.branch_id
       LEFT JOIN business_subscriptions bs ON bs.business_id = b.id
       WHERE bu.user_id = ?
       ORDER BY bu.is_default_branch DESC, bs.updated_at DESC
       LIMIT 1`,
      [req.user.id]
    );
    const context = rows[0] || null;
    const allowedServices = [];
    if (context?.subscription_id) {
      const [services] = await db.query(
        `SELECT sc.id, sc.service_key, sc.name
         FROM subscription_services ss
         JOIN service_categories sc ON sc.id = ss.service_category_id
         WHERE ss.subscription_id = ? AND ss.active = 1
         ORDER BY sc.name`,
        [context.subscription_id]
      );
      allowedServices.push(...services);
    }
    res.json({ success: true, role: req.user.role, context, allowedServices });
  } catch (error) {
    next(error);
  }
});

router.get("/subscription-options", verifyToken, async (req, res, next) => {
  try {
    const scope = await businessScopeForUser(req.user.id);
    if (!scope) return res.status(404).json({ success: false, error: "Business account was not found" });
    const [plans] = await db.query(`
      SELECT sp.id, sp.plan_code, sp.plan_name, sp.billing_period, sp.duration_days, sp.branch_limit, sp.price,
             GROUP_CONCAT(sc.service_key ORDER BY sc.service_key SEPARATOR ',') AS services
      FROM subscription_plans sp
      LEFT JOIN subscription_plan_services sps ON sps.plan_id = sp.id
      LEFT JOIN service_categories sc ON sc.id = sps.service_category_id
      WHERE sp.active = 1
      GROUP BY sp.id
      ORDER BY sp.price, sp.plan_name`);
    const [methods] = await db.query("SELECT id, method_name, account_name, account_number, instructions FROM payment_methods WHERE active = 1 ORDER BY sort_order, method_name");
    const [payments] = await db.query("SELECT * FROM subscription_payments WHERE business_id = ? ORDER BY created_at DESC LIMIT 10", [scope.business_id]);
    res.json({
      success: true,
      context: scope,
      packages: plans.map((plan) => ({ ...plan, services: plan.services ? plan.services.split(",") : [] })),
      paymentMethods: methods,
      subscriptionPayments: payments
    });
  } catch (error) {
    next(error);
  }
});

router.post("/subscription-request", verifyToken, async (req, res, next) => {
  const { planId } = req.body;
  if (!planId) return res.status(400).json({ success: false, error: "Package is required" });
  try {
    const scope = await businessScopeForUser(req.user.id);
    if (!scope) return res.status(404).json({ success: false, error: "Business account was not found" });
    const subscriptionId = scope.subscription_id || cleanId(`sub_${scope.business_code}`, `sub_${req.user.id}`);
    const [plans] = await db.query("SELECT id, branch_limit FROM subscription_plans WHERE id = ? AND active = 1 LIMIT 1", [planId]);
    if (!plans.length) return res.status(404).json({ success: false, error: "Selected package was not found" });
    await db.query(
      `INSERT INTO business_subscriptions (id, business_id, plan_id, status, start_date, expiry_date, branch_limit)
       VALUES (?, ?, ?, 'PENDING', CURDATE(), CURDATE(), ?)
       ON DUPLICATE KEY UPDATE plan_id = VALUES(plan_id), status = 'PENDING', branch_limit = VALUES(branch_limit), updated_at = CURRENT_TIMESTAMP`,
      [subscriptionId, scope.business_id, planId, Number(plans[0].branch_limit || 1)]
    );
    await db.query("DELETE FROM subscription_services WHERE subscription_id = ?", [subscriptionId]);
    const [services] = await db.query("SELECT service_category_id FROM subscription_plan_services WHERE plan_id = ?", [planId]);
    for (const service of services) {
      await db.query("INSERT IGNORE INTO subscription_services (subscription_id, service_category_id, active) VALUES (?, ?, 1)", [subscriptionId, service.service_category_id]);
    }
    await db.query("UPDATE businesses SET status = 'PENDING', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [scope.business_id]);
    res.json({ success: true, subscriptionId, status: "PENDING" });
  } catch (error) {
    next(error);
  }
});

router.post("/subscription-payment", verifyToken, async (req, res, next) => {
  const { subscriptionId, paymentMethodId, paymentDate, amount, reference, comment } = req.body;
  try {
    const scope = await businessScopeForUser(req.user.id);
    if (!scope) return res.status(404).json({ success: false, error: "Business account was not found" });
    const subId = subscriptionId || scope.subscription_id;
    if (!subId) return res.status(400).json({ success: false, error: "Subscription request is required" });
    const id = cleanId(`subpay_${subId}_${Date.now()}`, "subpay");
    await db.query(
      `INSERT INTO subscription_payments (id, business_id, subscription_id, payment_method_id, payment_date, amount, reference, status, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [id, scope.business_id, subId, paymentMethodId || null, paymentDate || new Date().toISOString().slice(0, 10), money(amount), reference || "", comment || ""]
    );
    await db.query("UPDATE business_subscriptions SET status = 'PAYMENT_SUBMITTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [subId]);
    await db.query("UPDATE businesses SET status = 'PAYMENT_SUBMITTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [scope.business_id]);
    res.json({ success: true, paymentId: id, status: "PAYMENT_SUBMITTED" });
  } catch (error) {
    next(error);
  }
});

router.post("/trial-extension-request", verifyToken, async (req, res, next) => {
  try {
    const scope = await businessScopeForUser(req.user.id);
    if (!scope) return res.status(404).json({ success: false, error: "Business account was not found" });
    const id = cleanId(`ext_${scope.business_code}_${Date.now()}`, "ext");
    const requestCode = Buffer.from(JSON.stringify({
      businessCode: scope.business_code,
      businessName: scope.business_name,
      requestedDuration: req.body.requestedDuration || "14 days",
      deviceId: req.body.deviceId || "",
      requestedAt: new Date().toISOString()
    })).toString("base64url");
    await db.query(
      `INSERT INTO activation_requests (id, business_id, device_id, request_type, requested_duration, request_code, status)
       VALUES (?, ?, ?, 'EXTENSION', ?, ?, 'PENDING')`,
      [id, scope.business_id, req.body.deviceId || "UNKNOWN", req.body.requestedDuration || "14 days", requestCode]
    );
    res.json({ success: true, requestId: id, requestCode });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
