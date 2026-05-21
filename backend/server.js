require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("./db");

const app = express();
const port = Number(process.env.PORT || 8080);

// JWT Secret (should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || "vasma_secret_key_2024";

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Authentication middleware
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// Optional API Key middleware (for external sync)
function requireApiKey(req, res, next) {
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) return next();
  if (req.header("x-api-key") !== apiKey) return res.status(401).json({ error: "Invalid API key" });
  next();
}

function asyncRoute(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function id() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);
}

// Initialize admin user
async function initializeAdminUser() {
  try {
    const [rows] = await pool.query("SELECT settings_json FROM app_settings WHERE id = 1");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    if (rows.length === 0) {
      const settings = {
        users: [{
          id: "admin_1",
          username: "admin",
          password: hashedPassword,
          name: "Administrator",
          role: "admin",
          created_at: new Date().toISOString()
        }]
      };
      await pool.query(
        "INSERT INTO app_settings (id, settings_json) VALUES (1, ?)",
        [JSON.stringify(settings)]
      );
      console.log("Admin user created successfully");
    } else {
      // Check if admin exists, if not add it
      const settings = rows[0].settings_json;
      if (!settings.users || !settings.users.find(u => u.username === "admin")) {
        if (!settings.users) settings.users = [];
        settings.users.push({
          id: "admin_1",
          username: "admin",
          password: hashedPassword,
          name: "Administrator",
          role: "admin",
          created_at: new Date().toISOString()
        });
        await pool.query(
          "UPDATE app_settings SET settings_json = ? WHERE id = 1",
          [JSON.stringify(settings)]
        );
        console.log("Admin user added to existing settings");
      }
    }
  } catch (error) {
    console.error("Error initializing admin user:", error);
  }
}

// ============ AUTHENTICATION ROUTES ============

// Login endpoint
app.post("/api/auth/login", asyncRoute(async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "Username and password are required" 
    });
  }
  
  const [rows] = await pool.query("SELECT settings_json FROM app_settings WHERE id = 1");
  
  if (rows.length === 0) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid credentials" 
    });
  }
  
  const settings = rows[0].settings_json;
  const users = settings.users || [];
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid credentials" 
    });
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid credentials" 
    });
  }
  
  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
  
  res.json({
    success: true,
    token: token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    },
    message: "Login successful"
  });
}));

// Change password endpoint
app.post("/api/auth/change-password", verifyToken, asyncRoute(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId;
  
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ 
      success: false, 
      message: "Old and new password are required" 
    });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: "New password must be at least 6 characters" 
    });
  }
  
  const [rows] = await pool.query("SELECT settings_json FROM app_settings WHERE id = 1");
  
  if (rows.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: "Settings not found" 
    });
  }
  
  const settings = rows[0].settings_json;
  const users = settings.users || [];
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: "User not found" 
    });
  }
  
  const isValidOldPassword = await bcrypt.compare(oldPassword, users[userIndex].password);
  
  if (!isValidOldPassword) {
    return res.status(401).json({ 
      success: false, 
      message: "Old password is incorrect" 
    });
  }
  
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  users[userIndex].password = hashedNewPassword;
  settings.users = users;
  
  await pool.query(
    "UPDATE app_settings SET settings_json = ? WHERE id = 1",
    [JSON.stringify(settings)]
  );
  
  res.json({
    success: true,
    message: "Password changed successfully"
  });
}));

// Verify token endpoint
app.get("/api/auth/verify", verifyToken, asyncRoute(async (req, res) => {
  res.json({ 
    success: true, 
    user: req.user,
    message: "Token is valid" 
  });
}));

// ============ HEALTH CHECK ============

app.get("/api/health", asyncRoute(async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true, service: "VASMA System Backend" });
}));

// ============ CUSTOMERS CRUD ============

app.get("/api/customers", verifyToken, asyncRoute(async (_req, res) => {
  const [rows] = await pool.query("SELECT id, name, vehicle, vehicle_model AS vehicleModel, contact, mobile, active FROM customers ORDER BY name");
  res.json(rows.map((row) => ({ ...row, active: Boolean(row.active) })));
}));

app.post("/api/customers", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  const customer = { id: req.body.id || id(), ...req.body };
  await pool.query(
    `INSERT INTO customers (id, name, vehicle, vehicle_model, contact, mobile, active)
     VALUES (:id, :name, :vehicle, :vehicleModel, :contact, :mobile, :active)
     ON DUPLICATE KEY UPDATE name=:name, vehicle=:vehicle, vehicle_model=:vehicleModel, contact=:contact, mobile=:mobile, active=:active`,
    { ...customer, active: customer.active === false ? 0 : 1 }
  );
  res.status(201).json(customer);
}));

app.put("/api/customers/:id", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  await pool.query(
    `UPDATE customers SET name=:name, vehicle=:vehicle, vehicle_model=:vehicleModel, contact=:contact, mobile=:mobile, active=:active WHERE id=:id`,
    { ...req.body, id: req.params.id, active: req.body.active === false ? 0 : 1 }
  );
  res.json({ id: req.params.id, ...req.body });
}));

app.delete("/api/customers/:id", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM customers WHERE id = ?", [req.params.id]);
  res.json({ success: true, message: "Customer deleted successfully" });
}));

// ============ EMPLOYEES CRUD ============

app.get("/api/employees", verifyToken, asyncRoute(async (_req, res) => {
  const [rows] = await pool.query("SELECT id, name, mobile, role, created_at FROM employees ORDER BY name");
  res.json({ success: true, data: rows });
}));

app.post("/api/employees", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  const { name, mobile, role } = req.body;
  const employeeId = id();
  
  await pool.query(
    "INSERT INTO employees (id, name, mobile, role) VALUES (?, ?, ?, ?)",
    [employeeId, name, mobile || null, role || null]
  );
  
  const [newEmployee] = await pool.query("SELECT * FROM employees WHERE id = ?", [employeeId]);
  res.json({ success: true, data: newEmployee[0] });
}));

app.put("/api/employees/:id", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  const { name, mobile, role } = req.body;
  
  await pool.query(
    "UPDATE employees SET name = ?, mobile = ?, role = ? WHERE id = ?",
    [name, mobile || null, role || null, req.params.id]
  );
  
  const [updated] = await pool.query("SELECT * FROM employees WHERE id = ?", [req.params.id]);
  res.json({ success: true, data: updated[0] });
}));

app.delete("/api/employees/:id", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM employees WHERE id = ?", [req.params.id]);
  res.json({ success: true, message: "Employee deleted successfully" });
}));

// ============ CATEGORIES CRUD ============

app.get("/api/categories", verifyToken, asyncRoute(async (_req, res) => {
  const [rows] = await pool.query("SELECT id, name, active FROM categories WHERE active = 1 ORDER BY name");
  res.json({ success: true, data: rows });
}));

app.post("/api/categories", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  const { name } = req.body;
  const categoryId = id();
  
  await pool.query(
    "INSERT INTO categories (id, name) VALUES (?, ?)",
    [categoryId, name]
  );
  
  const [newCategory] = await pool.query("SELECT * FROM categories WHERE id = ?", [categoryId]);
  res.json({ success: true, data: newCategory[0] });
}));

app.put("/api/categories/:id", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  const { name, active } = req.body;
  
  await pool.query(
    "UPDATE categories SET name = ?, active = ? WHERE id = ?",
    [name, active !== false ? 1 : 0, req.params.id]
  );
  
  const [updated] = await pool.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
  res.json({ success: true, data: updated[0] });
}));

app.delete("/api/categories/:id", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
  res.json({ success: true, message: "Category deleted successfully" });
}));

// ============ SERVICE ITEMS CRUD ============

app.get("/api/service-items", verifyToken, asyncRoute(async (_req, res) => {
  const [rows] = await pool.query(`
    SELECT si.*, c.name as category_name 
    FROM service_items si 
    LEFT JOIN categories c ON si.category_id = c.id 
    ORDER BY si.name ASC
  `);
  res.json({ success: true, data: rows });
}));

app.post("/api/service-items", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  const { category_id, name } = req.body;
  const itemId = id();
  
  await pool.query(
    "INSERT INTO service_items (id, category_id, name) VALUES (?, ?, ?)",
    [itemId, category_id, name]
  );
  
  const [newItem] = await pool.query("SELECT * FROM service_items WHERE id = ?", [itemId]);
  res.json({ success: true, data: newItem[0] });
}));

app.put("/api/service-items/:id", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  const { category_id, name } = req.body;
  
  await pool.query(
    "UPDATE service_items SET category_id = ?, name = ? WHERE id = ?",
    [category_id, name, req.params.id]
  );
  
  const [updated] = await pool.query("SELECT * FROM service_items WHERE id = ?", [req.params.id]);
  res.json({ success: true, data: updated[0] });
}));

app.delete("/api/service-items/:id", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM service_items WHERE id = ?", [req.params.id]);
  res.json({ success: true, message: "Service item deleted successfully" });
}));

// ============ JOB CARDS CRUD ============

app.get("/api/job-cards", verifyToken, asyncRoute(async (_req, res) => {
  const [jobs] = await pool.query("SELECT * FROM job_cards ORDER BY job_date DESC, ref DESC");
  const [items] = await pool.query("SELECT * FROM job_card_items");
  const [purchases] = await pool.query("SELECT * FROM purchased_items");
  res.json(jobs.map((job) => ({
    id: job.id,
    ref: job.ref,
    invoiceRef: job.invoice_ref,
    date: job.job_date,
    customerId: job.customer_id,
    mileage: job.mileage,
    notes: job.notes,
    serviceCard: job.service_card_json || {},
    items: items.filter((item) => item.job_card_id === job.id).map(mapJobItem),
    purchaseItems: purchases.filter((item) => item.job_card_id === job.id).map(mapPurchase)
  })));
}));

app.post("/api/job-cards", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  const job = { id: req.body.id || id(), items: [], purchaseItems: [], ...req.body };
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO job_cards (id, ref, invoice_ref, job_date, customer_id, mileage, notes, service_card_json)
       VALUES (:id, :ref, :invoiceRef, :date, :customerId, :mileage, :notes, :serviceCard)
       ON DUPLICATE KEY UPDATE ref=:ref, invoice_ref=:invoiceRef, job_date=:date, customer_id=:customerId, mileage=:mileage, notes=:notes, service_card_json=:serviceCard`,
      { ...job, serviceCard: JSON.stringify(job.serviceCard || {}) }
    );
    await conn.query("DELETE FROM job_card_items WHERE job_card_id = ?", [job.id]);
    await conn.query("DELETE FROM purchased_items WHERE job_card_id = ?", [job.id]);
    for (const item of job.items || []) await conn.query(
      `INSERT INTO job_card_items (id, job_card_id, category_id, item_id, attendant_id, action, status, confirmed, amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [item.id || id(), job.id, item.categoryId || null, item.itemId || null, item.attendantId || null, item.action || "", item.status || "", item.confirmed ? 1 : 0, Number(item.amount || 0)]
    );
    for (const item of job.purchaseItems || []) await conn.query(
      `INSERT INTO purchased_items (id, job_card_id, name, unit, qty, unit_cost, amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [item.id || id(), job.id, item.name, item.unit || "", Number(item.qty || 0), Number(item.unitCost || 0), Number(item.amount || 0), item.status || ""]
    );
    await conn.commit();
    res.status(201).json(job);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

app.delete("/api/job-cards/:id", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM job_cards WHERE id = ?", [req.params.id]);
  res.json({ success: true, message: "Job card deleted successfully" });
}));

// ============ EXPENSES CRUD ============

app.get("/api/expenses", verifyToken, asyncRoute(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM expenses ORDER BY expense_date DESC, created_at DESC");
  res.json({ success: true, data: rows });
}));

app.post("/api/expenses", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  const { expense_date, item_name, amount, comment } = req.body;
  const expenseId = id();
  
  await pool.query(
    "INSERT INTO expenses (id, expense_date, item_name, amount, comment) VALUES (?, ?, ?, ?, ?)",
    [expenseId, expense_date, item_name, amount, comment || null]
  );
  
  const [newExpense] = await pool.query("SELECT * FROM expenses WHERE id = ?", [expenseId]);
  res.json({ success: true, data: newExpense[0] });
}));

app.put("/api/expenses/:id", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  const { expense_date, item_name, amount, comment } = req.body;
  
  await pool.query(
    "UPDATE expenses SET expense_date = ?, item_name = ?, amount = ?, comment = ? WHERE id = ?",
    [expense_date, item_name, amount, comment || null, req.params.id]
  );
  
  const [updated] = await pool.query("SELECT * FROM expenses WHERE id = ?", [req.params.id]);
  res.json({ success: true, data: updated[0] });
}));

app.delete("/api/expenses/:id", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM expenses WHERE id = ?", [req.params.id]);
  res.json({ success: true, message: "Expense deleted successfully" });
}));

// ============ PAYMENTS CRUD ============

app.get("/api/payments", verifyToken, asyncRoute(async (_req, res) => {
  const [payments] = await pool.query("SELECT * FROM payments ORDER BY payment_date DESC, ref DESC");
  const [items] = await pool.query("SELECT * FROM payment_items");
  res.json(payments.map((payment) => ({
    id: payment.id,
    ref: payment.ref,
    date: payment.payment_date,
    jobId: payment.job_card_id,
    method: payment.method,
    comment: payment.comment,
    attachmentName: payment.attachment_name,
    items: items.filter((item) => item.payment_id === payment.id).map(mapPaymentItem)
  })));
}));

app.post("/api/payments", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  const payment = { id: req.body.id || id(), items: [], ...req.body };
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO payments (id, ref, payment_date, job_card_id, method, comment, attachment_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE ref=VALUES(ref), payment_date=VALUES(payment_date), job_card_id=VALUES(job_card_id), method=VALUES(method), comment=VALUES(comment), attachment_name=VALUES(attachment_name)`,
      [payment.id, payment.ref, payment.date, payment.jobId, payment.method || "", payment.comment || "", payment.attachmentName || ""]
    );
    await conn.query("DELETE FROM payment_items WHERE payment_id = ?", [payment.id]);
    for (const item of payment.items || []) await conn.query(
      `INSERT INTO payment_items (id, payment_id, line_id, job_item_id, attendant_id, amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.id || id(), payment.id, item.lineId || null, item.jobItemId || null, item.attendantId || null, Number(item.amount || 0)]
    );
    await conn.commit();
    res.status(201).json(payment);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

// ============ COMMISSIONS CRUD ============

app.get("/api/commissions", verifyToken, asyncRoute(async (_req, res) => {
  const [rows] = await pool.query(`
    SELECT c.*, e.name as attendant_name, jc.ref as job_ref 
    FROM commissions c
    LEFT JOIN employees e ON c.attendant_id = e.id
    LEFT JOIN job_cards jc ON c.job_card_id = jc.id
    ORDER BY c.commission_date DESC
  `);
  res.json({ success: true, data: rows });
}));

app.post("/api/commissions", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  const { commission_date, job_card_id, attendant_id, type, rate, amount } = req.body;
  const commissionId = id();
  
  await pool.query(
    `INSERT INTO commissions (id, commission_date, job_card_id, attendant_id, type, rate, amount) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [commissionId, commission_date, job_card_id, attendant_id || null, type || null, rate, amount]
  );
  
  const [newCommission] = await pool.query("SELECT * FROM commissions WHERE id = ?", [commissionId]);
  res.json({ success: true, data: newCommission[0] });
}));

app.delete("/api/commissions/:id", verifyToken, requireApiKey, asyncRoute(async (req, res) => {
  await pool.query("DELETE FROM commissions WHERE id = ?", [req.params.id]);
  res.json({ success: true, message: "Commission deleted successfully" });
}));

// ============ SYNC AND EXPORT ============

app.post("/api/sync/import-local-backup", requireApiKey, asyncRoute(async (req, res) => {
  const data = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const customer of data.customers || []) {
      await conn.query(
        `INSERT INTO customers (id, name, vehicle, vehicle_model, contact, mobile, active)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), vehicle=VALUES(vehicle), vehicle_model=VALUES(vehicle_model), contact=VALUES(contact), mobile=VALUES(mobile), active=VALUES(active)`,
        [customer.id, customer.name, customer.vehicle, customer.vehicleModel || "", customer.contact || "", customer.mobile || "", customer.active === false ? 0 : 1]
      );
    }
    await conn.commit();
    res.json({ ok: true, message: "Backup import started. Customers imported. Extend importer for remaining modules as needed." });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

app.get("/api/sync/export", verifyToken, asyncRoute(async (_req, res) => {
  const [customers] = await pool.query("SELECT id, name, vehicle, vehicle_model AS vehicleModel, contact, mobile, active FROM customers");
  const [employees] = await pool.query("SELECT id, name, mobile, role FROM employees");
  const [categories] = await pool.query("SELECT id, name, active FROM categories");
  const [serviceItems] = await pool.query("SELECT id, category_id AS categoryId, name FROM service_items");
  const [expenses] = await pool.query("SELECT * FROM expenses");
  const [commissions] = await pool.query("SELECT * FROM commissions");
  
  res.json({
    customers: customers.map((row) => ({ ...row, active: Boolean(row.active) })),
    employees,
    categories: categories.map((category) => ({ 
      ...category, 
      active: Boolean(category.active), 
      items: serviceItems.filter((item) => item.categoryId === category.id) 
    })),
    expenses,
    commissions
  });
}));

// ============ HELPER FUNCTIONS ============

function mapJobItem(item) {
  return {
    id: item.id,
    categoryId: item.category_id,
    itemId: item.item_id,
    attendantId: item.attendant_id,
    action: item.action,
    status: item.status,
    confirmed: Boolean(item.confirmed),
    amount: Number(item.amount || 0)
  };
}

function mapPurchase(item) {
  return {
    id: item.id,
    name: item.name,
    unit: item.unit,
    qty: Number(item.qty || 0),
    unitCost: Number(item.unit_cost || 0),
    amount: Number(item.amount || 0),
    status: item.status
  };
}

function mapPaymentItem(item) {
  return {
    id: item.id,
    lineId: item.line_id,
    jobItemId: item.job_item_id,
    attendantId: item.attendant_id,
    amount: Number(item.amount || 0)
  };
}

// ============ ERROR HANDLING ============

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: error.message || "Server error" });
});

// ============ START SERVER ============

async function startServer() {
  try {
    // Initialize admin user
    await initializeAdminUser();
    
    // Start listening
    app.listen(port, () => {
      console.log(`✅ VASMA backend running at http://127.0.0.1:${port}`);
      console.log(`📋 Available endpoints:`);
      console.log(`   POST   /api/auth/login - Login`);
      console.log(`   GET    /api/health - Health check`);
      console.log(`   GET    /api/customers - Get all customers`);
      console.log(`   POST   /api/customers - Create customer`);
      console.log(`   GET    /api/employees - Get all employees`);
      console.log(`   POST   /api/employees - Create employee`);
      console.log(`   GET    /api/expenses - Get all expenses`);
      console.log(`   POST   /api/expenses - Create expense`);
      console.log(`   GET    /api/job-cards - Get all job cards`);
      console.log(`   POST   /api/job-cards - Create job card`);
      console.log(`   GET    /api/payments - Get all payments`);
      console.log(`   POST   /api/payments - Create payment`);
      console.log(`   GET    /api/commissions - Get all commissions`);
      console.log(`   POST   /api/commissions - Create commission`);
      console.log(`\n🔐 Default login: admin / admin123`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();