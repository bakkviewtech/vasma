const express = require("express");
const db = require("../db/mysql");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

const SERVICE_IDS = {
  tire: "svc_tire",
  carWash: "svc_carwash",
  general: "svc_general"
};

function adminOnly(req, _res, next) {
  if (req.user?.role !== "admin") {
    const error = new Error("Admin access required");
    error.statusCode = 403;
    error.code = "ADMIN_ACCESS_REQUIRED";
    return next(error);
  }
  next();
}

function cleanId(value, prefix = "id") {
  const text = String(value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 58);
  return text || `${prefix}_${Date.now()}`;
}

function money(value) {
  const parsed = Number(String(value ?? 0).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function serviceIds(services) {
  return (Array.isArray(services) ? services : [])
    .map((service) => SERVICE_IDS[service] || service)
    .filter(Boolean);
}

async function ensureDemoRegistrationsTable() {
  await db.query(`
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

function subscriptionStatus(value, fallback = "PENDING") {
  const status = String(value || fallback).toUpperCase();
  return ["PENDING", "TRIAL", "APPROVED_AWAITING_PAYMENT", "PAYMENT_SUBMITTED", "ACTIVE", "EXPIRED", "SUSPENDED", "CANCELLED"].includes(status) ? status : fallback;
}

function businessStatusFromSubscription(status) {
  if (status === "CANCELLED") return "SUSPENDED";
  return ["PENDING", "TRIAL", "APPROVED_AWAITING_PAYMENT", "PAYMENT_SUBMITTED", "ACTIVE", "EXPIRED", "SUSPENDED"].includes(status) ? status : "PENDING";
}

router.use(verifyToken, adminOnly);

router.get("/summary", async (_req, res, next) => {
  try {
    await ensureDemoRegistrationsTable();
    const [rows] = await db.query(`SELECT
      (SELECT COUNT(*) FROM businesses) AS businesses,
      (SELECT COUNT(*) FROM businesses WHERE status IN ('TRIAL','ACTIVE')) AS activeBusinesses,
      (SELECT COUNT(*) FROM business_subscriptions WHERE status IN ('TRIAL','ACTIVE')) AS activeSubscriptions,
      (SELECT COUNT(*) FROM business_subscriptions WHERE status = 'PENDING') AS pendingSubscriptions,
      (SELECT COUNT(*) FROM subscription_plans WHERE active = 1) AS packages,
      (SELECT COUNT(*) FROM payment_methods WHERE active = 1) AS paymentMethods,
      (SELECT COUNT(*) FROM demo_registrations) AS demoRegistrations,
      (SELECT COUNT(*) FROM demo_registrations WHERE expires_at >= NOW()) AS activeDemoRegistrations,
      (SELECT COUNT(*) FROM demo_registrations WHERE DATE(registered_at) = CURDATE()) AS demoRegistrationsToday`);
    res.json({ success: true, summary: rows[0] });
  } catch (error) {
    next(error);
  }
});

router.get("/reports", async (req, res, next) => {
  const fromDate = String(req.query.from || "").slice(0, 10);
  const toDate = String(req.query.to || "").slice(0, 10);
  const hasCustomRange = /^\d{4}-\d{2}-\d{2}$/.test(fromDate) && /^\d{4}-\d{2}-\d{2}$/.test(toDate);
  try {
    await ensureDemoRegistrationsTable();
    const [[businessSummary]] = await db.query(`
      SELECT
        COUNT(*) AS totalBusinesses,
        SUM(status = 'ACTIVE') AS activeBusinesses,
        SUM(status = 'TRIAL') AS trialBusinesses,
        SUM(status = 'EXPIRED') AS expiredBusinesses,
        SUM(status = 'SUSPENDED') AS suspendedBusinesses,
        SUM(status = 'PENDING') AS pendingBusinesses,
        SUM(status = 'APPROVED_AWAITING_PAYMENT') AS awaitingPaymentBusinesses,
        SUM(status = 'PAYMENT_SUBMITTED') AS paymentSubmittedBusinesses
      FROM businesses`);

    const [[subscriptionSummary]] = await db.query(`
      SELECT
        COUNT(*) AS totalSubscriptions,
        SUM(status = 'ACTIVE') AS activeSubscriptions,
        SUM(status = 'TRIAL') AS trialSubscriptions,
        SUM(status = 'EXPIRED') AS expiredSubscriptions,
        SUM(status = 'SUSPENDED') AS suspendedSubscriptions,
        SUM(status = 'PENDING') AS pendingSubscriptions,
        SUM(status = 'APPROVED_AWAITING_PAYMENT') AS approvedAwaitingPayment,
        SUM(status = 'PAYMENT_SUBMITTED') AS paymentSubmitted,
        SUM(status = 'CANCELLED') AS cancelledSubscriptions,
        SUM(status IN ('ACTIVE','TRIAL') AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)) AS expiring7,
        SUM(status IN ('ACTIVE','TRIAL') AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)) AS expiring30,
        SUM(status = 'TRIAL' AND expiry_date < CURDATE()) AS expiredTrials
      FROM business_subscriptions`);

    const [[incomeSummary]] = await db.query(
      `SELECT
        COALESCE(SUM(CASE WHEN status = 'CONFIRMED' AND payment_date = CURDATE() THEN amount ELSE 0 END), 0) AS today,
        COALESCE(SUM(CASE WHEN status = 'CONFIRMED' AND YEARWEEK(payment_date, 1) = YEARWEEK(CURDATE(), 1) THEN amount ELSE 0 END), 0) AS thisWeek,
        COALESCE(SUM(CASE WHEN status = 'CONFIRMED' AND YEAR(payment_date) = YEAR(CURDATE()) AND MONTH(payment_date) = MONTH(CURDATE()) THEN amount ELSE 0 END), 0) AS mtd,
        COALESCE(SUM(CASE WHEN status = 'CONFIRMED' AND YEAR(payment_date) = YEAR(CURDATE()) THEN amount ELSE 0 END), 0) AS ytd,
        COALESCE(SUM(CASE WHEN status = 'CONFIRMED' ${hasCustomRange ? "AND payment_date BETWEEN ? AND ?" : "AND 1 = 0"} THEN amount ELSE 0 END), 0) AS custom
      FROM subscription_payments`,
      hasCustomRange ? [fromDate, toDate] : []
    );

    const [[paymentSummary]] = await db.query(`
      SELECT
        COUNT(*) AS totalPayments,
        SUM(status = 'PENDING') AS pendingPayments,
        SUM(status = 'CONFIRMED') AS confirmedPayments,
        SUM(status = 'REJECTED') AS rejectedPayments,
        COALESCE(SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END), 0) AS pendingAmount,
        COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN amount ELSE 0 END), 0) AS confirmedAmount,
        COALESCE(SUM(CASE WHEN status = 'REJECTED' THEN amount ELSE 0 END), 0) AS rejectedAmount
      FROM subscription_payments`);

    const [[trialSummary]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM business_subscriptions WHERE status = 'TRIAL') AS inTrial,
        (SELECT COUNT(*) FROM business_subscriptions WHERE status = 'TRIAL' AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)) AS trialsExpiring7,
        (SELECT COUNT(*) FROM business_subscriptions WHERE status = 'TRIAL' AND expiry_date < CURDATE()) AS expiredTrials,
        (SELECT COUNT(*) FROM activation_requests WHERE request_type = 'EXTENSION' AND status = 'PENDING') AS pendingExtensionRequests,
        (SELECT COUNT(*) FROM activation_requests WHERE request_type = 'EXTENSION' AND status = 'APPROVED') AS approvedExtensionRequests,
        (SELECT COUNT(*) FROM business_subscriptions WHERE status = 'ACTIVE') AS convertedOrActive
      `);

    const [[branchUserSummary]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM branches) AS totalBranches,
        (SELECT COUNT(*) FROM branches WHERE status = 'ACTIVE') AS activeBranches,
        (SELECT COUNT(*) FROM branches WHERE status = 'INACTIVE') AS inactiveBranches,
        (SELECT COUNT(*) FROM business_users) AS totalBusinessUsers,
        (SELECT COUNT(DISTINCT user_id) FROM business_users) AS uniqueBusinessUsers,
        (SELECT COUNT(*) FROM businesses b WHERE (SELECT COUNT(*) FROM branches br WHERE br.business_id = b.id) >= COALESCE((SELECT bs.branch_limit FROM business_subscriptions bs WHERE bs.business_id = b.id ORDER BY bs.updated_at DESC LIMIT 1), 999999)) AS businessesAtBranchLimit
      `);

    const [packagePerformance] = await db.query(`
      SELECT
        sp.id,
        sp.plan_code,
        sp.plan_name,
        sp.billing_period,
        sp.price,
        COUNT(bs.id) AS businesses,
        SUM(bs.status = 'ACTIVE') AS active,
        SUM(bs.status = 'TRIAL') AS trial,
        SUM(bs.status IN ('EXPIRED','SUSPENDED','CANCELLED')) AS inactive,
        COALESCE(SUM(CASE WHEN spay.status = 'CONFIRMED' THEN spay.amount ELSE 0 END), 0) AS income
      FROM subscription_plans sp
      LEFT JOIN business_subscriptions bs ON bs.plan_id = sp.id
      LEFT JOIN subscription_payments spay ON spay.subscription_id = bs.id
      GROUP BY sp.id
      ORDER BY income DESC, businesses DESC, sp.plan_name`);

    const [businessStatusRows] = await db.query(`
      SELECT status, COUNT(*) AS count
      FROM businesses
      GROUP BY status
      ORDER BY FIELD(status, 'ACTIVE','TRIAL','PENDING','APPROVED_AWAITING_PAYMENT','PAYMENT_SUBMITTED','EXPIRED','SUSPENDED')`);

    const [subscriptionStatusRows] = await db.query(`
      SELECT status, COUNT(*) AS count
      FROM business_subscriptions
      GROUP BY status
      ORDER BY FIELD(status, 'ACTIVE','TRIAL','PENDING','APPROVED_AWAITING_PAYMENT','PAYMENT_SUBMITTED','EXPIRED','SUSPENDED','CANCELLED')`);

    const [expiringSubscriptions] = await db.query(`
      SELECT b.business_name, b.business_uid, b.business_code, b.owner_name, b.mobile, sp.plan_name, bs.status, bs.expiry_date,
             DATEDIFF(bs.expiry_date, CURDATE()) AS days_remaining
      FROM business_subscriptions bs
      JOIN businesses b ON b.id = bs.business_id
      JOIN subscription_plans sp ON sp.id = bs.plan_id
      WHERE bs.status IN ('ACTIVE','TRIAL') AND bs.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY bs.expiry_date ASC
      LIMIT 25`);

    const [recentPayments] = await db.query(`
      SELECT spay.id, spay.payment_date, spay.amount, spay.reference, spay.status,
             b.business_name, b.business_uid, b.business_code, sp.plan_name
      FROM subscription_payments spay
      JOIN businesses b ON b.id = spay.business_id
      LEFT JOIN business_subscriptions bs ON bs.id = spay.subscription_id
      LEFT JOIN subscription_plans sp ON sp.id = bs.plan_id
      ORDER BY spay.created_at DESC
      LIMIT 20`);

    const [[demoSummary]] = await db.query(`
      SELECT
        COUNT(*) AS totalDemoRegistrations,
        SUM(expires_at >= NOW()) AS activeDemoRegistrations,
        SUM(expires_at < NOW()) AS expiredDemoRegistrations,
        SUM(DATE(registered_at) = CURDATE()) AS demoToday,
        SUM(registered_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS demoLast7Days
      FROM demo_registrations`);

    const [demoPackageRows] = await db.query(`
      SELECT package_code, package_name, COUNT(*) AS count,
             SUM(expires_at >= NOW()) AS active,
             SUM(expires_at < NOW()) AS expired
      FROM demo_registrations
      GROUP BY package_code, package_name
      ORDER BY count DESC, package_name`);

    const [recentDemoRegistrations] = await db.query(`
      SELECT id, package_code, package_name, business_name, owner_name, mobile, location, registered_at, expires_at,
             IF(expires_at >= NOW(), 'DEMO', 'EXPIRED') AS status
      FROM demo_registrations
      ORDER BY registered_at DESC
      LIMIT 20`);

    res.json({
      success: true,
      reports: {
        range: { from: hasCustomRange ? fromDate : "", to: hasCustomRange ? toDate : "" },
        businessSummary,
        subscriptionSummary,
        incomeSummary,
        paymentSummary,
        trialSummary,
        branchUserSummary,
        packagePerformance,
        businessStatusRows,
        subscriptionStatusRows,
        expiringSubscriptions,
        recentPayments,
        demoSummary,
        demoPackageRows,
        recentDemoRegistrations
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/report-details", async (req, res, next) => {
  const type = String(req.query.type || "businesses");
  const status = String(req.query.status || "").toUpperCase();
  const period = String(req.query.period || "custom").toLowerCase();
  const fromDate = String(req.query.from || "").slice(0, 10);
  const toDate = String(req.query.to || "").slice(0, 10);
  const hasCustomRange = /^\d{4}-\d{2}-\d{2}$/.test(fromDate) && /^\d{4}-\d{2}-\d{2}$/.test(toDate);
  const periodWhere = {
    today: "spay.payment_date = CURDATE()",
    week: "YEARWEEK(spay.payment_date, 1) = YEARWEEK(CURDATE(), 1)",
    mtd: "YEAR(spay.payment_date) = YEAR(CURDATE()) AND MONTH(spay.payment_date) = MONTH(CURDATE())",
    ytd: "YEAR(spay.payment_date) = YEAR(CURDATE())",
    custom: hasCustomRange ? "spay.payment_date BETWEEN ? AND ?" : "1 = 1"
  }[period] || "1 = 1";
  try {
    await ensureDemoRegistrationsTable();
    if (type === "demo") {
      const [rows] = await db.query(
        `SELECT registered_at, expires_at, IF(expires_at >= NOW(), 'DEMO', 'EXPIRED') AS status,
                package_code, package_name, business_name, owner_name, user_name, mobile, location
         FROM demo_registrations
         ORDER BY registered_at DESC`
      );
      return res.json({ success: true, title: "Demo Registration Details", rows });
    }

    if (type === "payments") {
      const params = [];
      if (period === "custom" && hasCustomRange) params.push(fromDate, toDate);
      if (status) params.push(status);
      const [rows] = await db.query(
        `SELECT spay.payment_date AS date, b.business_uid AS business_id, b.business_code, b.business_name,
                subplan.plan_name AS package, spay.reference, spay.status, spay.amount, spay.comment
         FROM subscription_payments spay
         JOIN businesses b ON b.id = spay.business_id
         LEFT JOIN business_subscriptions bs ON bs.id = spay.subscription_id
         LEFT JOIN subscription_plans subplan ON subplan.id = bs.plan_id
         WHERE ${periodWhere} ${status ? "AND spay.status = ?" : ""}
         ORDER BY spay.payment_date DESC, spay.created_at DESC`,
        params
      );
      return res.json({ success: true, title: "Subscription Payment Details", rows });
    }

    if (type === "subscriptions") {
      const params = status ? [status] : [];
      const [rows] = await db.query(
        `SELECT b.business_uid AS business_id, b.business_code, b.business_name, b.owner_name, b.mobile,
                sp.plan_name AS package, bs.status, bs.start_date, bs.expiry_date, DATEDIFF(bs.expiry_date, CURDATE()) AS days_remaining,
                bs.branch_limit
         FROM business_subscriptions bs
         JOIN businesses b ON b.id = bs.business_id
         JOIN subscription_plans sp ON sp.id = bs.plan_id
         WHERE ${status ? "bs.status = ?" : "1 = 1"}
         ORDER BY bs.expiry_date ASC, b.business_name`,
        params
      );
      return res.json({ success: true, title: "Subscription Details", rows });
    }

    if (type === "trials") {
      const [rows] = await db.query(
        `SELECT b.business_uid AS business_id, b.business_code, b.business_name, b.owner_name, b.mobile,
                sp.plan_name AS package, bs.status, bs.start_date AS trial_start, bs.expiry_date AS trial_expiry,
                DATEDIFF(bs.expiry_date, CURDATE()) AS days_remaining
         FROM business_subscriptions bs
         JOIN businesses b ON b.id = bs.business_id
         JOIN subscription_plans sp ON sp.id = bs.plan_id
         WHERE bs.status = 'TRIAL'
         ORDER BY bs.expiry_date ASC, b.business_name`
      );
      return res.json({ success: true, title: "Trial Business Details", rows });
    }

    if (type === "packages") {
      const [rows] = await db.query(
        `SELECT sp.plan_code, sp.plan_name, sp.billing_period, sp.duration_days, sp.branch_limit, sp.price,
                COUNT(bs.id) AS businesses,
                SUM(bs.status = 'ACTIVE') AS active,
                SUM(bs.status = 'TRIAL') AS trial,
                SUM(bs.status IN ('EXPIRED','SUSPENDED','CANCELLED')) AS inactive,
                COALESCE(SUM(CASE WHEN spay.status = 'CONFIRMED' THEN spay.amount ELSE 0 END), 0) AS income
         FROM subscription_plans sp
         LEFT JOIN business_subscriptions bs ON bs.plan_id = sp.id
         LEFT JOIN subscription_payments spay ON spay.subscription_id = bs.id
         GROUP BY sp.id
         ORDER BY income DESC, businesses DESC, sp.plan_name`
      );
      return res.json({ success: true, title: "Package Performance Details", rows });
    }

    const params = status ? [status] : [];
    const [rows] = await db.query(
      `SELECT b.business_uid AS business_id, b.business_code, b.business_name, b.owner_name, b.mobile, b.location,
              b.status, sp.plan_name AS package,
              (SELECT COUNT(*) FROM branches br WHERE br.business_id = b.id) AS branches,
              (SELECT COUNT(*) FROM business_users bu WHERE bu.business_id = b.id) AS users,
              b.created_at AS registered_at
       FROM businesses b
       LEFT JOIN business_subscriptions bs ON bs.id = (
         SELECT bs2.id FROM business_subscriptions bs2
         WHERE bs2.business_id = b.id
         ORDER BY bs2.updated_at DESC, bs2.created_at DESC
         LIMIT 1
       )
       LEFT JOIN subscription_plans sp ON sp.id = bs.plan_id
       WHERE ${status ? "b.status = ?" : "1 = 1"}
       ORDER BY b.created_at DESC`,
      params
    );
    res.json({ success: true, title: "Business Details", rows });
  } catch (error) {
    next(error);
  }
});

router.get("/packages", async (_req, res, next) => {
  try {
    const [plans] = await db.query(`
      SELECT sp.*, GROUP_CONCAT(sc.service_key ORDER BY sc.service_key SEPARATOR ',') AS services
      FROM subscription_plans sp
      LEFT JOIN subscription_plan_services sps ON sps.plan_id = sp.id
      LEFT JOIN service_categories sc ON sc.id = sps.service_category_id
      GROUP BY sp.id
      ORDER BY sp.created_at DESC, sp.plan_name`);
    const [features] = await db.query("SELECT plan_id, feature_key, feature_name, enabled FROM package_features ORDER BY feature_name");
    res.json({
      success: true,
      packages: plans.map((plan) => ({
        ...plan,
        services: plan.services ? plan.services.split(",") : [],
        features: features.filter((feature) => feature.plan_id === plan.id)
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.post("/packages", async (req, res, next) => {
  const { planCode, planName, billingPeriod, durationDays, branchLimit, price, services, features } = req.body;
  if (!planCode || !planName) return res.status(400).json({ success: false, error: "Package code and name are required" });
  const id = cleanId(`plan_${planCode.toLowerCase()}`, "plan");
  try {
    await db.query(
      `INSERT INTO subscription_plans (id, plan_code, plan_name, billing_period, duration_days, branch_limit, price, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE plan_name = VALUES(plan_name), billing_period = VALUES(billing_period),
       duration_days = VALUES(duration_days), branch_limit = VALUES(branch_limit), price = VALUES(price),
       active = 1, updated_at = CURRENT_TIMESTAMP`,
      [id, planCode, planName, billingPeriod || "MONTHLY", Number(durationDays || 30), Number(branchLimit || 1), money(price)]
    );
    await db.query("DELETE FROM subscription_plan_services WHERE plan_id = ?", [id]);
    for (const serviceId of serviceIds(services)) {
      await db.query("INSERT IGNORE INTO subscription_plan_services (plan_id, service_category_id) VALUES (?, ?)", [id, serviceId]);
    }
    await db.query("DELETE FROM package_features WHERE plan_id = ?", [id]);
    for (const feature of Array.isArray(features) ? features : []) {
      if (!feature.featureKey && !feature.featureName) continue;
      await db.query(
        "INSERT INTO package_features (plan_id, feature_key, feature_name, enabled) VALUES (?, ?, ?, ?)",
        [id, cleanId(feature.featureKey || feature.featureName, "feature"), feature.featureName || feature.featureKey, feature.enabled === false ? 0 : 1]
      );
    }
    res.json({ success: true, id });
  } catch (error) {
    next(error);
  }
});

router.put("/packages/:id", async (req, res, next) => {
  try {
    const [existing] = await db.query("SELECT id, plan_code FROM subscription_plans WHERE id = ? OR plan_code = ? LIMIT 1", [req.params.id, req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, error: "Package not found" });
    const plan = existing[0];
    const { planName, billingPeriod, durationDays, branchLimit, price, services, features, active } = req.body;
    await db.query(
      `UPDATE subscription_plans
       SET plan_name = COALESCE(?, plan_name), billing_period = COALESCE(?, billing_period),
           duration_days = COALESCE(?, duration_days), branch_limit = COALESCE(?, branch_limit),
           price = COALESCE(?, price), active = COALESCE(?, active), updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        planName || null,
        billingPeriod || null,
        durationDays ? Number(durationDays) : null,
        branchLimit ? Number(branchLimit) : null,
        price === undefined ? null : money(price),
        active === undefined ? null : active === false ? 0 : 1,
        plan.id
      ]
    );
    if (Array.isArray(services)) {
      await db.query("DELETE FROM subscription_plan_services WHERE plan_id = ?", [plan.id]);
      for (const serviceId of serviceIds(services)) {
        await db.query("INSERT IGNORE INTO subscription_plan_services (plan_id, service_category_id) VALUES (?, ?)", [plan.id, serviceId]);
      }
    }
    if (Array.isArray(features)) {
      await db.query("DELETE FROM package_features WHERE plan_id = ?", [plan.id]);
      for (const feature of features) {
        if (!feature.featureKey && !feature.featureName) continue;
        await db.query(
          "INSERT INTO package_features (plan_id, feature_key, feature_name, enabled) VALUES (?, ?, ?, ?)",
          [plan.id, cleanId(feature.featureKey || feature.featureName, "feature"), feature.featureName || feature.featureKey, feature.enabled === false ? 0 : 1]
        );
      }
    }
    res.json({ success: true, id: plan.id });
  } catch (error) {
    next(error);
  }
});

router.delete("/packages/:id", async (req, res, next) => {
  try {
    await db.query("UPDATE subscription_plans SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR plan_code = ?", [req.params.id, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/businesses", async (_req, res, next) => {
  try {
    const [businesses] = await db.query(`
      SELECT b.*, bs.id AS subscription_id, bs.status AS subscription_status, bs.expiry_date,
             sp.plan_name, sp.plan_code,
             (SELECT COUNT(*) FROM branches br WHERE br.business_id = b.id) AS branches,
             (SELECT COUNT(*) FROM job_cards jc WHERE jc.business_id = b.id) AS job_cards
      FROM businesses b
      LEFT JOIN business_subscriptions bs ON bs.business_id = b.id
      LEFT JOIN subscription_plans sp ON sp.id = bs.plan_id
      ORDER BY b.updated_at DESC, b.created_at DESC`);
    res.json({ success: true, businesses });
  } catch (error) {
    next(error);
  }
});

router.patch("/businesses/:id/status", async (req, res, next) => {
  const status = String(req.body.status || "").toUpperCase();
  if (!["PENDING", "TRIAL", "APPROVED_AWAITING_PAYMENT", "PAYMENT_SUBMITTED", "ACTIVE", "EXPIRED", "SUSPENDED"].includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid business status" });
  }
  try {
    await db.query("UPDATE businesses SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, req.params.id]);
    if (["PENDING", "SUSPENDED", "EXPIRED"].includes(status)) {
      await db.query("UPDATE business_subscriptions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE business_id = ?", [status, req.params.id]);
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/subscriptions", async (_req, res, next) => {
  try {
    const [subscriptions] = await db.query(`
      SELECT bs.*, b.business_uid, b.business_code, b.business_name, b.owner_name, b.mobile, b.location,
             sp.plan_code, sp.plan_name, sp.duration_days AS plan_duration_days, sp.branch_limit AS plan_branch_limit,
             (SELECT COUNT(*) FROM branches br WHERE br.business_id = b.id) AS branch_count,
             (SELECT GROUP_CONCAT(CONCAT(COALESCE(br.branch_code, ''), ' - ', COALESCE(br.branch_name, '')) SEPARATOR '||') FROM branches br WHERE br.business_id = b.id) AS branch_list,
             GROUP_CONCAT(sc.service_key ORDER BY sc.service_key SEPARATOR ',') AS services
      FROM business_subscriptions bs
      JOIN businesses b ON b.id = bs.business_id
      JOIN subscription_plans sp ON sp.id = bs.plan_id
      LEFT JOIN subscription_services ss ON ss.subscription_id = bs.id AND ss.active = 1
      LEFT JOIN service_categories sc ON sc.id = ss.service_category_id
      GROUP BY bs.id
      ORDER BY FIELD(bs.status, 'PENDING','TRIAL','APPROVED_AWAITING_PAYMENT','PAYMENT_SUBMITTED','ACTIVE','SUSPENDED','EXPIRED','CANCELLED'), bs.updated_at DESC, bs.expiry_date DESC`);
    res.json({ success: true, subscriptions: subscriptions.map((sub) => ({ ...sub, services: sub.services ? sub.services.split(",") : [] })) });
  } catch (error) {
    next(error);
  }
});

router.post("/subscriptions", async (req, res, next) => {
  const { businessId, planId, status, startDate, expiryDate, branchLimit, services } = req.body;
  if (!businessId || !planId) return res.status(400).json({ success: false, error: "Business and package are required" });
  const id = cleanId(req.body.id || `sub_${businessId}`, "sub");
  try {
    await db.query(
      `INSERT INTO business_subscriptions (id, business_id, plan_id, status, start_date, expiry_date, branch_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE plan_id = VALUES(plan_id), status = VALUES(status), start_date = VALUES(start_date),
       expiry_date = VALUES(expiry_date), branch_limit = VALUES(branch_limit), updated_at = CURRENT_TIMESTAMP`,
      [id, businessId, planId, subscriptionStatus(status, "ACTIVE"), startDate || new Date().toISOString().slice(0, 10), expiryDate || new Date().toISOString().slice(0, 10), Number(branchLimit || 1)]
    );
    await db.query("DELETE FROM subscription_services WHERE subscription_id = ?", [id]);
    for (const serviceId of serviceIds(services)) {
      await db.query("INSERT IGNORE INTO subscription_services (subscription_id, service_category_id, active) VALUES (?, ?, 1)", [id, serviceId]);
    }
    await db.query("UPDATE businesses SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [businessStatusFromSubscription(subscriptionStatus(status, "ACTIVE")), businessId]);
    res.json({ success: true, id });
  } catch (error) {
    next(error);
  }
});

router.put("/subscriptions/:id", async (req, res, next) => {
  const { planId, status, startDate, expiryDate, branchLimit, services } = req.body;
  const normalizedStatus = subscriptionStatus(status);
  if (!planId) return res.status(400).json({ success: false, error: "Package is required" });
  if (!startDate || !expiryDate) return res.status(400).json({ success: false, error: "Start date and expiry date are required" });
  try {
    const [existing] = await db.query("SELECT id, business_id FROM business_subscriptions WHERE id = ? LIMIT 1", [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, error: "Subscription request not found" });
    await db.query(
      `UPDATE business_subscriptions
       SET plan_id = ?, status = ?, start_date = ?, expiry_date = ?, branch_limit = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [planId, normalizedStatus, startDate, expiryDate, Number(branchLimit || 1), req.params.id]
    );
    await db.query("DELETE FROM subscription_services WHERE subscription_id = ?", [req.params.id]);
    for (const serviceId of serviceIds(services)) {
      await db.query("INSERT IGNORE INTO subscription_services (subscription_id, service_category_id, active) VALUES (?, ?, 1)", [req.params.id, serviceId]);
    }
    await db.query(
      "UPDATE businesses SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [businessStatusFromSubscription(normalizedStatus), existing[0].business_id]
    );
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    next(error);
  }
});

router.delete("/subscriptions/:id", async (req, res, next) => {
  try {
    await db.query("UPDATE business_subscriptions SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/subscription-payments", async (_req, res, next) => {
  try {
    const [payments] = await db.query(`
      SELECT spay.*, b.business_uid, b.business_code, b.business_name, bs.plan_id, subplan.plan_name, bs.branch_limit, subplan.duration_days
      FROM subscription_payments spay
      JOIN businesses b ON b.id = spay.business_id
      LEFT JOIN business_subscriptions bs ON bs.id = spay.subscription_id
      LEFT JOIN subscription_plans subplan ON subplan.id = bs.plan_id
      ORDER BY FIELD(spay.status, 'PENDING','CONFIRMED','REJECTED'), spay.created_at DESC`);
    res.json({ success: true, subscriptionPayments: payments });
  } catch (error) {
    next(error);
  }
});

router.patch("/subscription-payments/:id/confirm", async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT spay.*, bs.plan_id, spl.duration_days, bs.branch_limit
       FROM subscription_payments spay
       LEFT JOIN business_subscriptions bs ON bs.id = spay.subscription_id
       LEFT JOIN subscription_plans spl ON spl.id = bs.plan_id
       WHERE spay.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: "Subscription payment not found" });
    const payment = rows[0];
    const duration = Number(req.body.durationDays || payment.duration_days || 30);
    await db.query("UPDATE subscription_payments SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);
    await db.query(
      `UPDATE business_subscriptions
       SET status = 'ACTIVE', start_date = CURDATE(), expiry_date = DATE_ADD(CURDATE(), INTERVAL ? DAY), updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [duration, payment.subscription_id]
    );
    await db.query("UPDATE businesses SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [payment.business_id]);
    res.json({ success: true, status: "ACTIVE" });
  } catch (error) {
    next(error);
  }
});

router.patch("/subscription-payments/:id/reject", async (req, res, next) => {
  try {
    await db.query("UPDATE subscription_payments SET status = 'REJECTED', comment = CONCAT(COALESCE(comment,''), ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?", [`\nAdmin: ${req.body.comment || "Rejected"}`, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/payment-methods", async (_req, res, next) => {
  try {
    const [methods] = await db.query("SELECT * FROM payment_methods ORDER BY sort_order, method_name");
    res.json({ success: true, paymentMethods: methods });
  } catch (error) {
    next(error);
  }
});

router.post("/payment-methods", async (req, res, next) => {
  const { methodName, accountName, accountNumber, instructions, active } = req.body;
  if (!methodName) return res.status(400).json({ success: false, error: "Payment method name is required" });
  const id = cleanId(req.body.id || `paymethod_${methodName}`, "paymethod");
  try {
    await db.query(
      `INSERT INTO payment_methods (id, method_name, account_name, account_number, instructions, active)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE method_name = VALUES(method_name), account_name = VALUES(account_name),
       account_number = VALUES(account_number), instructions = VALUES(instructions), active = VALUES(active),
       updated_at = CURRENT_TIMESTAMP`,
      [id, methodName, accountName || "", accountNumber || "", instructions || "", active === false ? 0 : 1]
    );
    res.json({ success: true, id });
  } catch (error) {
    next(error);
  }
});

router.delete("/payment-methods/:id", async (req, res, next) => {
  try {
    await db.query("UPDATE payment_methods SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/landing-pages", async (_req, res, next) => {
  try {
    const [pages] = await db.query("SELECT * FROM landing_pages ORDER BY updated_at DESC");
    res.json({ success: true, landingPages: pages });
  } catch (error) {
    next(error);
  }
});

router.post("/landing-pages", async (req, res, next) => {
  const { slug, title, subtitle, content, active } = req.body;
  if (!slug || !title) return res.status(400).json({ success: false, error: "Landing page slug and title are required" });
  const id = cleanId(req.body.id || `landing_${slug}`, "landing");
  try {
    await db.query(
      `INSERT INTO landing_pages (id, slug, title, subtitle, content_json, active)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title), subtitle = VALUES(subtitle), content_json = VALUES(content_json),
       active = VALUES(active), updated_at = CURRENT_TIMESTAMP`,
      [id, slug, title, subtitle || "", JSON.stringify(content || {}), active === false ? 0 : 1]
    );
    res.json({ success: true, id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
