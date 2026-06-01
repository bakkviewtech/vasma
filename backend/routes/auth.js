const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/mysql");

const router = express.Router();

const SERVICE_CODES = {
  "1": { packageName: "Tyre Service Only", allowedServices: ["tire"] },
  "2": { packageName: "Car Wash Only", allowedServices: ["carWash"] },
  "3": { packageName: "General Service Only", allowedServices: ["general"] },
  "12": { packageName: "Tyre Service + Car Wash", allowedServices: ["tire", "carWash"] },
  "13": { packageName: "Tyre Service + General Service", allowedServices: ["tire", "general"] },
  "23": { packageName: "Car Wash + General Service", allowedServices: ["carWash", "general"] },
  "123": { packageName: "Full Service Package", allowedServices: ["tire", "carWash", "general"] }
};

function parseBusinessCode(code) {
  const match = String(code || "").trim().toUpperCase().match(/^VASMA-(1|2|3|12|13|23|123)-([0-9]{2,})$/);
  if (!match) return null;
  const serviceCode = match[1];
  return {
    businessCode: `VASMA-${serviceCode}-${match[2]}`,
    serviceCode,
    businessNumber: match[2],
    ...SERVICE_CODES[serviceCode]
  };
}

function seedPinForCode(serviceCode, businessNumber) {
  const known = {
    "1-01": "1010",
    "2-02": "2020",
    "3-03": "3030",
    "12-04": "1204",
    "13-05": "1305",
    "23-06": "2306",
    "123-07": "1230"
  };
  return known[`${serviceCode}-${businessNumber}`] || `${serviceCode}${businessNumber}`.slice(0, 8);
}

function packageName(serviceCode) {
  return SERVICE_CODES[String(serviceCode || "")]?.packageName || "Full Service Package";
}

function serviceKeysFromCode(serviceCode) {
  return SERVICE_CODES[String(serviceCode || "")]?.allowedServices || ["tire", "carWash", "general"];
}

async function ensureUser(username, password, role) {
  const [existing] = await db.query("SELECT id, username, password, role FROM users WHERE username = ?", [username]);
  if (existing.length) return existing[0];

  const hashed = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hashed, role]
  );
  return { id: result.insertId, username, password: hashed, role };
}

function signUser(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: "Username and password are required" });
  }

  try {
    const normalizedUsername = String(username).trim();
    const configuredAdminPassword = process.env.ADMIN_PASSWORD || "Vasma@app123";
    if (normalizedUsername === "admin") {
      if (password !== configuredAdminPassword) {
        return res.status(401).json({ success: false, error: "Invalid credentials" });
      }
      const admin = await ensureUser("admin", configuredAdminPassword, "admin");
      const token = signUser(admin);
      return res.json({
        success: true,
        token,
        role: "admin",
        user: { id: admin.id, username: "admin", name: "Administrator", role: "admin" }
      });
    }

    const [rows] = await db.query(
      "SELECT id, username, password, role FROM users WHERE username = ?",
      [normalizedUsername]
    );
    if (!rows.length) return res.status(401).json({ success: false, error: "Invalid credentials" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, error: "Invalid credentials" });

    const token = signUser(user);

    res.json({
      success: true,
      token,
      role: user.role,
      user: { id: user.id, username: user.username, name: user.username, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/business-login", async (req, res, next) => {
  const { businessCode, pin } = req.body;
  if (!businessCode || !pin) {
    return res.status(400).json({ success: false, error: "Business code and PIN are required" });
  }

  try {
    let business;
    let expectedPin;
    if (String(businessCode).trim().toLowerCase() === "demo" && pin === "demo123") {
      business = {
        businessId: `VSM-${new Date().toISOString().replace(/\D/g, "").slice(2, 12)}`,
        businessCode: "DEMO-TRIAL",
        serviceCode: "123",
        businessNumber: "00",
        packageName: "Full Service Package",
        allowedServices: ["tire", "carWash", "general"],
        businessName: "VASMA Demo Business",
        ownerName: "Demo User",
        userName: "Demo User",
        location: "Demo Location",
        mobile: "",
        pin: "demo123",
        temporaryPin: "demo123",
        mustChangePin: true,
        status: "TRIAL",
        trialStartDate: new Date().toISOString().slice(0, 10),
        trialDays: 14
      };
      expectedPin = "demo123";
    } else {
      const [registered] = await db.query(
        `SELECT u.*, b.business_uid, b.business_code, b.business_name, b.owner_name, b.mobile, b.location,
                b.business_number, b.status AS business_status,
                bs.status AS subscription_status, bs.expiry_date, sp.plan_name,
                (SELECT GROUP_CONCAT(sc.service_key ORDER BY sc.service_key SEPARATOR ',')
                   FROM subscription_services ss
                   JOIN service_categories sc ON sc.id = ss.service_category_id
                  WHERE ss.subscription_id = bs.id AND ss.active = 1) AS services
         FROM users u
         JOIN business_users bu ON bu.user_id = u.id
         JOIN businesses b ON b.id = bu.business_id
         LEFT JOIN business_subscriptions bs ON bs.business_id = b.id
         LEFT JOIN subscription_plans sp ON sp.id = bs.plan_id
         WHERE u.username = ?
         ORDER BY bs.updated_at DESC
         LIMIT 1`,
        [String(businessCode).trim()]
      );
      if (registered.length) {
        const account = registered[0];
        const valid = await bcrypt.compare(pin, account.password);
        if (!valid) return res.status(401).json({ success: false, error: "Invalid business code or PIN" });
        const serviceCodeText = String(account.business_code || "").match(/^VASMA-(\d+)-/)?.[1] || "";
        business = {
          businessId: account.business_uid,
          businessCode: account.business_code,
          serviceCode: serviceCodeText,
          businessNumber: account.business_number || String(account.business_code || "").match(/-(\d{2,})$/)?.[1] || "",
          packageName: account.plan_name || packageName(serviceCodeText),
          allowedServices: account.services ? account.services.split(",") : serviceKeysFromCode(serviceCodeText),
          businessName: account.business_name,
          ownerName: account.owner_name,
          userName: account.name || account.owner_name,
          location: account.location,
          mobile: account.mobile,
          pin,
          temporaryPin: pin,
          mustChangePin: false,
          status: account.subscription_status || account.business_status || "PENDING",
          expiryDate: account.expiry_date
        };
        expectedPin = pin;
      } else {
        const parsed = parseBusinessCode(businessCode);
        if (!parsed) return res.status(401).json({ success: false, error: "Invalid business code or PIN" });
        expectedPin = seedPinForCode(parsed.serviceCode, parsed.businessNumber);
        if (pin !== expectedPin) return res.status(401).json({ success: false, error: "Invalid business code or PIN" });
        business = {
          businessId: `VSM-${new Date().toISOString().replace(/\D/g, "").slice(2, 12)}`,
          ...parsed,
          pin: expectedPin,
          temporaryPin: expectedPin,
          mustChangePin: true,
          status: "TRIAL",
          trialStartDate: new Date().toISOString().slice(0, 10)
        };
      }
    }

    const user = await ensureUser(business.businessCode, expectedPin, "business");
    const valid = await bcrypt.compare(pin, user.password);
    if (!valid) return res.status(401).json({ success: false, error: "Invalid business code or PIN" });

    const token = signUser(user);
    res.json({
      success: true,
      token,
      role: "business",
      user: {
        id: user.id,
        username: business.businessCode,
        name: business.ownerName || business.businessCode,
        role: "business",
        businessName: business.businessName || business.businessCode,
        businessId: business.businessId
      },
      business
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
