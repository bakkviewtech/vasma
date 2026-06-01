const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/mysql");

const router = express.Router();

function cleanId(value, prefix = "id") {
  const text = String(value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 58);
  return text || `${prefix}_${Date.now()}`;
}

function serviceCode(services = []) {
  const map = { tire: "1", carWash: "2", general: "3" };
  const code = services.map((service) => map[service]).filter(Boolean).sort().join("");
  return code || "123";
}

async function ensureDemoRegistrationsTable(connection = db) {
  await connection.query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
}

async function nextBusinessNumber() {
  const [rows] = await db.query("SELECT COUNT(*) AS count FROM businesses");
  return String(Number(rows[0].count || 0) + 1).padStart(2, "0");
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

async function nextBusinessUid(connection) {
  const base = new Date();
  for (let offset = 0; offset < 1440; offset += 1) {
    const uid = businessUidFromDate(base, offset);
    const [rows] = await connection.query("SELECT id FROM businesses WHERE business_uid = ? LIMIT 1", [uid]);
    if (!rows.length) return uid;
  }
  return `VSM-${Date.now()}`;
}

router.get("/landing/:slug", async (req, res, next) => {
  try {
    const [pages] = await db.query("SELECT * FROM landing_pages WHERE slug = ? AND active = 1 LIMIT 1", [req.params.slug]);
    res.json({ success: true, landingPage: pages[0] || null });
  } catch (error) {
    next(error);
  }
});

router.get("/packages", async (_req, res, next) => {
  try {
    const [plans] = await db.query(`
      SELECT sp.id, sp.plan_code, sp.plan_name, sp.billing_period, sp.duration_days, sp.branch_limit, sp.price,
             GROUP_CONCAT(sc.service_key ORDER BY sc.service_key SEPARATOR ',') AS services
      FROM subscription_plans sp
      LEFT JOIN subscription_plan_services sps ON sps.plan_id = sp.id
      LEFT JOIN service_categories sc ON sc.id = sps.service_category_id
      WHERE sp.active = 1
      GROUP BY sp.id
      ORDER BY sp.price, sp.plan_name`);
    res.json({ success: true, packages: plans.map((plan) => ({ ...plan, services: plan.services ? plan.services.split(",") : [] })) });
  } catch (error) {
    next(error);
  }
});

router.post("/register-business", async (req, res, next) => {
  const { planId, businessName, ownerName, mobile, location, pin } = req.body;
  if (!planId || !businessName || !ownerName || !mobile || !pin) {
    return res.status(400).json({ success: false, error: "Package, business name, owner name, mobile, and PIN are required" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [plans] = await connection.query(
      `SELECT sp.*, GROUP_CONCAT(sc.service_key ORDER BY sc.service_key SEPARATOR ',') AS services
       FROM subscription_plans sp
       LEFT JOIN subscription_plan_services sps ON sps.plan_id = sp.id
       LEFT JOIN service_categories sc ON sc.id = sps.service_category_id
       WHERE sp.id = ? AND sp.active = 1
       GROUP BY sp.id
       LIMIT 1`,
      [planId]
    );
    if (!plans.length) return res.status(404).json({ success: false, error: "Selected package was not found" });
    const plan = plans[0];
    const services = plan.services ? plan.services.split(",") : [];
    const businessNumber = await nextBusinessNumber();
    const businessUid = await nextBusinessUid(connection);
    const businessCode = `VASMA-${serviceCode(services)}-${businessNumber}`;
    const businessId = cleanId(`biz_${businessCode}`, "biz");
    const branchId = cleanId(`branch_${businessCode}_main`, "branch");
    const subscriptionId = cleanId(`sub_${businessCode}`, "sub");
    const hashed = await bcrypt.hash(pin, 10);

    const [userResult] = await connection.query(
      "INSERT INTO users (username, password, role, name) VALUES (?, ?, 'business', ?)",
      [businessCode, hashed, ownerName]
    );
    await connection.query(
      `INSERT INTO businesses (id, business_uid, business_code, business_name, owner_name, mobile, location, business_number, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [businessId, businessUid, businessCode, businessName, ownerName, mobile, location || "", businessNumber]
    );
    await connection.query(
      "INSERT INTO branches (id, business_id, branch_code, branch_name, location, mobile, status) VALUES (?, ?, 'MAIN', 'Main Branch', ?, ?, 'ACTIVE')",
      [branchId, businessId, location || "", mobile]
    );
    await connection.query(
      "INSERT INTO business_users (business_id, branch_id, user_id, role, is_default_branch) VALUES (?, ?, ?, 'admin', 1)",
      [businessId, branchId, userResult.insertId]
    );
    await connection.query(
      `INSERT INTO business_subscriptions (id, business_id, plan_id, status, start_date, expiry_date, branch_limit)
       VALUES (?, ?, ?, 'PENDING', CURDATE(), CURDATE(), ?)`,
      [subscriptionId, businessId, planId, Number(plan.branch_limit || 1)]
    );
    const [planServices] = await connection.query("SELECT service_category_id FROM subscription_plan_services WHERE plan_id = ?", [planId]);
    for (const service of planServices) {
      await connection.query("INSERT INTO subscription_services (subscription_id, service_category_id, active) VALUES (?, ?, 1)", [subscriptionId, service.service_category_id]);
    }
    await connection.commit();
    res.json({ success: true, businessId: businessUid, businessCode, initialPin: pin, packageName: plan.plan_name, status: "PENDING" });
  } catch (error) {
    await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, error: "Business code already exists. Please try again." });
    }
    next(error);
  } finally {
    connection.release();
  }
});

router.post("/demo-registration", async (req, res, next) => {
  const {
    id,
    packageCode,
    packageName,
    allowedServices,
    businessName,
    ownerName,
    userName,
    mobile,
    location,
    registeredAt,
    trialDays
  } = req.body || {};
  if (!packageCode || !packageName) {
    return res.status(400).json({ success: false, error: "Demo package is required" });
  }

  try {
    await ensureDemoRegistrationsTable();
    const demoId = cleanId(id || `demo_${Date.now()}`, "demo");
    const started = registeredAt ? new Date(registeredAt) : new Date();
    const expires = new Date(started);
    expires.setDate(expires.getDate() + Number(trialDays || 7));
    const services = JSON.stringify(Array.isArray(allowedServices) ? allowedServices : []);
    await db.query(
      `INSERT INTO demo_registrations
        (id, package_code, package_name, allowed_services, business_name, owner_name, user_name, mobile, location, status, registered_at, expires_at, last_seen_at, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DEMO', ?, ?, CURRENT_TIMESTAMP, ?)
       ON DUPLICATE KEY UPDATE
        package_code = VALUES(package_code),
        package_name = VALUES(package_name),
        allowed_services = VALUES(allowed_services),
        business_name = VALUES(business_name),
        owner_name = VALUES(owner_name),
        user_name = VALUES(user_name),
        mobile = VALUES(mobile),
        location = VALUES(location),
        status = IF(VALUES(expires_at) < NOW(), 'EXPIRED', 'DEMO'),
        expires_at = VALUES(expires_at),
        last_seen_at = CURRENT_TIMESTAMP,
        user_agent = VALUES(user_agent)`,
      [
        demoId,
        String(packageCode).slice(0, 32),
        String(packageName).slice(0, 255),
        services,
        businessName || "",
        ownerName || "",
        userName || "",
        mobile || "",
        location || "",
        started.toISOString().slice(0, 19).replace("T", " "),
        expires.toISOString().slice(0, 19).replace("T", " "),
        req.get("user-agent") || ""
      ]
    );
    res.json({ success: true, demoId, status: "DEMO" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
