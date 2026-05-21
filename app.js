const STORE_KEY = "vasma-service-manager-v1";
const LICENSE_STORE_KEY = "vasma-license-store-v1";
const DEVICE_ID_KEY = "vasma-device-id";
const INSTALL_DATE_KEY = "vasma-install-date";
const APP_VERSION = "v43";
const TRIAL_DAYS = 7;
const money = new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 2 });
const DEFAULT_APP_NAME = "VASMA System - Vehicle Auto Service Management System";
const REQUEST_PUBLIC_KEY = {"key_ops":["encrypt"],"ext":true,"alg":"RSA-OAEP-256","kty":"RSA","n":"hz1uChIGsnwpJq82OWdXymV2G9gqB8ioeaL7B2oxZpv8Na8MpqgUN6um1MwtH8VMnTlXbvjJFZj8XAp8N90ScOS-IbXQ86VsLTaduzGsy73_RnMNywjzmRWqbAzSGfQDoJz_wBs45pcqnwyzEjkEAuiPuP-dzey2JJFpU3_VNHT4SKWNEOPKMG2r05Vg9nysCBDgxQnfXGGnt2Ir-aeMxS3Vf5Z4ov4DK-ySLmpaVl4_0UuLR0sIWKtQ9fKSfMfFlYlMlcL5I8YE1XbdsvzkOg11M4ZhPNLcz5ZUn5NY1H2ZAX1yNWzba1RzTzh_ENNS9-cKts98qDKrElh1iizGHw","e":"AQAB"};
const ACTIVATION_PUBLIC_KEY = {"key_ops":["verify"],"ext":true,"kty":"EC","x":"CLRLzb_XuU3ayPeSbTgSY6SdxliE684ECGBvh_yUlOQ","y":"mDtY3kNpiLxUizqFqWvbQa2SKkSCiOzJD8u11r8tWoo","crv":"P-256"};

const seed = {
  customers: [
    { id: uid(), name: "Sample Transport Ltd", vehicle: "T 123 ABC", vehicleModel: "Mitsubishi Pickup", contact: "Asha Mhando", mobile: "+255 712 000 000" }
  ],
  employees: [
    { id: uid(), name: "Juma Said", mobile: "+255 713 111 111", role: "Attendant" },
    { id: uid(), name: "Neema John", mobile: "+255 714 222 222", role: "Attendant" },
    { id: uid(), name: "Peter Joseph", mobile: "+255 715 333 333", role: "Supervisor" }
  ],
  categories: [
    {
      id: uid(),
      name: "Tire Service",
      items: [
        "Puncture Repair",
        "Tire Fitting / Replacement",
        "Tube Replacement",
        "Valve Replacement",
        "Wheel Balancing",
        "Wheel Alignment",
        "Tire Rotation",
        "Tire Pressure Adjustment",
        "Rim Cleaning"
      ].map((name) => ({ id: uid(), name }))
    },
    {
      id: uid(),
      name: "General Service",
      items: [
        "Engine Oil Change",
        "Oil Filter Replacement",
        "Air Filter Cleaning",
        "Air Filter Replacement",
        "Fuel Filter Replacement",
        "Cabin / AC Filter Replacement",
        "Spark Plug Replacement",
        "Gear Oil Change",
        "Differential Oil Change",
        "Brake Fluid Top-up / Change",
        "Coolant Top-up / Change",
        "Power Steering Fluid Top-up / Change",
        "Battery Terminal Cleaning",
        "Brake Inspection & Adjustment",
        "General Vehicle Inspection",
        "Service Labour Charge"
      ].map((name) => ({ id: uid(), name }))
    },
    {
      id: uid(),
      name: "Car Wash",
      items: [
        "Basic Wash",
        "Standard Wash",
        "Full Wash",
        "Premium Wash",
        "Engine Wash",
        "Underbody Wash",
        "Interior Deep Cleaning",
        "Seat Cleaning Package",
        "Carpet / Floor Mat Cleaning",
        "Body Polish / Waxing",
        "Complete Detailing",
        "Motorcycle Wash"
      ].map((name) => ({ id: uid(), name }))
    }
  ],
  packages: [
    { id: uid(), name: "Basic Wash", services: "Kuosha body ya nje tu" },
    { id: uid(), name: "Standard Wash", services: "Body wash + kusafisha ndani kwa kawaida" },
    { id: uid(), name: "Full Wash", services: "Body wash + interior cleaning + vacuum + tyre cleaning" },
    { id: uid(), name: "Premium Wash", services: "Full wash + dashboard polish + tyre shine" },
    { id: uid(), name: "Complete Detailing", services: "Full wash + interior deep cleaning + polish + tyre shine" }
  ],
  expenseItems: ["Utilities", "Consumables", "Rent", "Salaries", "Maintenance", "Transport"].map((name) => ({ id: uid(), name })),
  actions: ["Checked", "Changed", "Replaced", "Repaired"].map((name) => ({ id: uid(), name })),
  settings: {
    appName: DEFAULT_APP_NAME,
    businessName: "VASMA System",
    location: "",
    ownerName: "",
    mobile: "",
    userName: "Admin",
    password: "",
    loginEnabled: false,
    autoLockMinutes: "15",
    lockWhenHidden: false,
    lastUnlockAt: "",
    theme: "light",
    language: "en",
    jobCardPageSetup: "compact",
    billPageSetup: "compact",
    receiptPageSetup: "compact",
    creator: "Bakari Kamanga"
  },
  jobCards: [],
  payments: [],
  expenses: [],
  commissions: []
};

let state = loadState();
let activeView = "dashboard";
let deferredInstallPrompt = null;
let pendingPrintPreview = { title: "", html: "" };

const views = {
  dashboard: document.querySelector("#dashboard"),
  customers: document.querySelector("#customers"),
  jobs: document.querySelector("#jobs"),
  confirmation: document.querySelector("#confirmation"),
  serviceCards: document.querySelector("#serviceCards"),
  payments: document.querySelector("#payments"),
  expenses: document.querySelector("#expenses"),
  commissions: document.querySelector("#commissions"),
  admin: document.querySelector("#admin"),
  master: document.querySelector("#master"),
  reports: document.querySelector("#reports"),
  analysis: document.querySelector("#analysis"),
  license: document.querySelector("#license"),
  security: document.querySelector("#security"),
  settings: document.querySelector("#settings")
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  migrateState();
  applyTheme();
  applyBrand();
  initMobileMenu();
  initSecurity();
  document.querySelector("#backDashboard")?.addEventListener("click", () => showView("dashboard"));
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    renderSettings();
  });
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./service-worker.js");
  renderAll();
  enforceSecurityLock();
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    return saved ? mergeState(seed, saved) : structuredClone(seed);
  } catch {
    return structuredClone(seed);
  }
}

function mergeState(base, saved) {
  const merged = { ...structuredClone(base), ...saved };
  merged.settings = { ...base.settings, ...(saved.settings || {}) };
  return merged;
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function migrateState() {
  if (!state.settings) state.settings = structuredClone(seed.settings);
  state.settings.appName = DEFAULT_APP_NAME;
  if (!state.settings.businessName) state.settings.businessName = "VASMA System";
  if (!("password" in state.settings)) state.settings.password = "";
  if (!("loginEnabled" in state.settings)) state.settings.loginEnabled = false;
  if (!("autoLockMinutes" in state.settings)) state.settings.autoLockMinutes = "15";
  if (!("lockWhenHidden" in state.settings)) state.settings.lockWhenHidden = false;
  if (!("lastUnlockAt" in state.settings)) state.settings.lastUnlockAt = "";
  state.customers.forEach((customer) => {
    if (!("vehicleModel" in customer)) customer.vehicleModel = "";
    if (!("active" in customer)) customer.active = true;
  });
  state.categories.forEach((category) => {
    if (!("active" in category)) category.active = true;
  });
  state.jobCards.forEach((job) => {
    job.ref = normalizeJobRef(job.ref);
    job.invoiceRef = invoiceRef(job);
    if (!("mileage" in job)) job.mileage = "";
    if (!Array.isArray(job.purchaseItems)) job.purchaseItems = [];
    if (!job.serviceCard) job.serviceCard = { nextServiceMileage: "", nextServiceDate: "", lines: [] };
    if (!Array.isArray(job.serviceCard.lines)) job.serviceCard.lines = [];
    job.items.forEach((item) => {
      if (!item.categoryId) item.categoryId = job.categoryId || state.categories[0]?.id || "";
      if (!item.action && item.status) item.action = item.status;
      if (!("confirmed" in item)) item.confirmed = false;
    });
    job.purchaseItems.forEach((item) => {
      if (!item.id) item.id = uid();
      if (!("status" in item)) item.status = "";
    });
  });
  state.payments.forEach((payment) => {
    if (!payment.ref) payment.ref = nextReceiptRef();
  });
  if (!state.actions?.length) state.actions = structuredClone(seed.actions);
  save();
}

function normalizeJobRef(ref = "") {
  const match = String(ref).match(/(\d+)/g);
  const number = match ? Number(match[match.length - 1]) : 0;
  return number ? `JC-${String(number).padStart(6, "0")}` : ref;
}

function renderAll() {
  renderDashboard();
  renderCustomers();
  renderJobs();
  renderConfirmation();
  renderServiceCards();
  renderPayments();
  renderExpenses();
  renderCommissions();
  renderAdminEdit();
  renderMaster();
  renderReports();
  renderAnalysis();
  renderLicense();
  renderSecurity();
  renderSettings();
  applyLanguage();
  applyBrand();
  updateBackButton();
}

function showView(view) {
  if (licenseExpired() && !["dashboard", "license", "settings", "security"].includes(view)) {
    activeView = "license";
    view = "license";
    toast("Trial ended. Enter activation code to continue.");
  }
  activeView = view;
  document.querySelector("#viewTitle").textContent = titleCase(view);
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  document.querySelectorAll(".view").forEach((section) => section.classList.toggle("active", section.id === view));
  closeMobileMenu();
  renderAll();
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

function updateBackButton() {
  const button = document.querySelector("#backDashboard");
  if (button) button.hidden = activeView === "dashboard";
}

function initMobileMenu() {
  const toggle = document.querySelector("#menuToggle");
  const overlay = document.querySelector("#sidebarOverlay");
  toggle?.addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
    const isOpen = document.body.classList.contains("menu-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    overlay.hidden = !isOpen;
  });
  overlay?.addEventListener("click", closeMobileMenu);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });
}

function closeMobileMenu() {
  document.body.classList.remove("menu-open");
  const toggle = document.querySelector("#menuToggle");
  const overlay = document.querySelector("#sidebarOverlay");
  toggle?.setAttribute("aria-expanded", "false");
  if (overlay) overlay.hidden = true;
}

function initSecurity() {
  document.querySelector("#securityUnlockForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    unlockApp();
  });
  ["click", "keydown", "touchstart", "mousemove"].forEach((eventName) => {
    window.addEventListener(eventName, resetSecurityTimer, { passive: true });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && securityEnabled() && state.settings?.lockWhenHidden) lockApp();
    else resetSecurityTimer();
  });
  resetSecurityTimer();
}

function securityEnabled() {
  return Boolean(state.settings?.loginEnabled && state.settings?.password);
}

function securityUnlocked() {
  return !securityEnabled() || sessionStorage.getItem("vasma-security-unlocked") === "true";
}

function enforceSecurityLock() {
  if (!securityUnlocked()) showSecurityLock();
  else hideSecurityLock();
}

function showSecurityLock() {
  const lock = document.querySelector("#securityLock");
  const input = document.querySelector("#securityUnlockPassword");
  if (!lock) return;
  lock.hidden = false;
  document.body.classList.add("locked");
  closeMobileMenu();
  setTimeout(() => input?.focus(), 0);
}

function hideSecurityLock() {
  const lock = document.querySelector("#securityLock");
  if (!lock) return;
  lock.hidden = true;
  document.body.classList.remove("locked");
}

function unlockApp() {
  const input = document.querySelector("#securityUnlockPassword");
  const error = document.querySelector("#securityUnlockError");
  if ((input?.value || "") !== (state.settings?.password || "")) {
    if (error) error.textContent = "Wrong password or PIN.";
    input?.select();
    return;
  }
  sessionStorage.setItem("vasma-security-unlocked", "true");
  state.settings.lastUnlockAt = new Date().toISOString();
  save();
  if (input) input.value = "";
  if (error) error.textContent = "";
  hideSecurityLock();
  resetSecurityTimer();
  renderSecurity();
}

function lockApp() {
  if (!securityEnabled()) return;
  sessionStorage.removeItem("vasma-security-unlocked");
  showSecurityLock();
}

function resetSecurityTimer() {
  clearTimeout(window.vasmaSecurityTimer);
  if (!securityEnabled() || !securityUnlocked()) return;
  const minutes = Math.max(1, parseMoney(state.settings?.autoLockMinutes || 15));
  window.vasmaSecurityTimer = setTimeout(lockApp, minutes * 60 * 1000);
}

function titleCase(value) {
  if (value === "confirmation") return "Work Confirmation";
  if (value === "serviceCards") return "Service Cards";
  if (value === "admin") return "Admin Edit";
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toast(message) {
  const toastEl = document.querySelector("#toast");
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2400);
}

function formatMoney(value) {
  return money.format(Number(value || 0));
}

function parseMoney(value) {
  if (typeof value === "number") return value;
  const parsed = Number(String(value || "0").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  return `${day}-${month}-${date.getFullYear()}`;
}

function formatDateRange(from, to) {
  return `From: ${formatDate(from)}    to: ${formatDate(to)}`;
}

function addMonths(value, months) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  if (Number.isNaN(date.getTime())) return today();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function formatMileage(value) {
  const numeric = parseMoney(value);
  return numeric ? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(numeric)} km` : "";
}

function compactJobRef(jobOrRef) {
  const ref = typeof jobOrRef === "string" ? jobOrRef : jobOrRef?.ref;
  const number = String(ref || "").match(/(\d+)/g)?.at(-1) || "0";
  return `JC${String(Number(number)).padStart(6, "0")}`;
}

function invoiceRef(job) {
  return `INV-${compactJobRef(job)}`;
}

function nextReceiptRef() {
  const max = state.payments.reduce((highest, payment) => {
    const value = Number(String(payment.ref || "").match(/(\d+)/g)?.at(-1) || 0);
    return Math.max(highest, value);
  }, 0);
  return `RCPT-JC${String(max + 1).padStart(6, "0")}`;
}

function qrMarkup(data, label) {
  const text = typeof data === "string" ? data : JSON.stringify(data);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=10&ecc=H&format=svg&data=${encodeURIComponent(text)}`;
  return `<div class="document-qr"><div class="qr-block"><img class="qr-code" src="${src}" alt="${escapeAttr(label)}"><span class="qr-label">${escapeHtml(label)}</span></div></div>`;
}

function pageSetupClass(type) {
  const key = `${type}PageSetup`;
  const value = state.settings?.[key] || "compact";
  return `page-${type} page-${value}`;
}

function invoiceQrData(job) {
  const customer = byId(state.customers, job.customerId) || {};
  const total = jobTotal(job);
  const paid = paidForJob(job.id);
  return {
    type: "invoice",
    invoice: invoiceRef(job),
    bill: job.ref,
    date: formatDate(job.date),
    customer: customer.name || "",
    vehicle: customer.vehicle || "",
    total,
    status: paid >= total ? "Full Paid" : paid > 0 ? "Partially Paid" : "Not Paid"
  };
}

function receiptQrData(payment) {
  const job = byId(state.jobCards, payment.jobId) || {};
  const customer = byId(state.customers, job.customerId) || {};
  return {
    type: "receipt",
    receipt: payment.ref,
    paymentReference: payment.ref,
    bill: job.ref || "",
    invoice: job.id ? invoiceRef(job) : "",
    date: formatDate(payment.date),
    customer: customer.name || "",
    vehicle: customer.vehicle || "",
    amount: paymentAmount(payment)
  };
}

function byId(collection, id) {
  return collection.find((item) => item.id === id);
}

function customerName(id) {
  const customer = byId(state.customers, id);
  return customer ? `${customer.name} (${customer.vehicle})` : "Unknown";
}

function customerVehicleModel(id) {
  return byId(state.customers, id)?.vehicleModel || "";
}

function profileName() {
  return state.settings?.userName || state.settings?.ownerName || "User";
}

function employeeName(id) {
  return byId(state.employees, id)?.name || "Unassigned";
}

function categoryName(id) {
  return byId(state.categories, id)?.name || "Unknown";
}

function jobCategorySummary(job) {
  const names = [...new Set(job.items.map((item) => categoryName(item.categoryId || job.categoryId)))];
  return names.join(", ") || "Unknown";
}

function itemName(categoryId, itemId) {
  return byId(byId(state.categories, categoryId)?.items || [], itemId)?.name || "Unknown";
}

function jobTotal(job) {
  return serviceTotal(job) + purchaseTotal(job);
}

function serviceTotal(job) {
  return job.items.reduce((sum, item) => sum + parseMoney(item.amount), 0);
}

function purchaseTotal(job) {
  return (job.purchaseItems || []).reduce((sum, item) => sum + parseMoney(item.amount || parseMoney(item.qty) * parseMoney(item.unitCost)), 0);
}

function paidForJob(jobId) {
  return state.payments.filter((payment) => payment.jobId === jobId).reduce((sum, payment) => sum + payment.items.reduce((itemSum, item) => itemSum + parseMoney(item.amount), 0), 0);
}

function outstandingForJob(jobId, excludePaymentId = "") {
  const job = byId(state.jobCards, jobId);
  if (!job) return 0;
  return Math.max(0, jobTotal(job) - paidForJobExcept(jobId, excludePaymentId));
}

function paidForJobExcept(jobId, excludePaymentId = "") {
  return state.payments
    .filter((payment) => payment.jobId === jobId && payment.id !== excludePaymentId)
    .reduce((sum, payment) => sum + payment.items.reduce((itemSum, item) => itemSum + parseMoney(item.amount), 0), 0);
}

function paidForLine(jobId, lineId, excludePaymentId = "") {
  return state.payments
    .filter((payment) => payment.jobId === jobId && payment.id !== excludePaymentId)
    .reduce((sum, payment) => {
      return sum + payment.items
        .filter((item) => (item.lineId || item.jobItemId) === lineId)
        .reduce((itemSum, item) => itemSum + parseMoney(item.amount), 0);
    }, 0);
}

function commissionForJob(jobId) {
  return state.commissions.filter((entry) => entry.jobId === jobId).reduce((sum, entry) => sum + parseMoney(entry.amount), 0);
}

function expensesForDate(date) {
  return state.expenses.filter((expense) => expense.date === date).reduce((sum, expense) => sum + parseMoney(expense.amount), 0);
}

function statusPill(job) {
  const total = jobTotal(job);
  const paid = paidForJob(job.id);
  if (paid >= total && total > 0) return '<span class="pill good">Paid</span>';
  if (paid > 0) return '<span class="pill warn">Partial</span>';
  return '<span class="pill bad">Outstanding</span>';
}

function activePill(active) {
  return active === false ? '<span class="pill bad">Inactive</span>' : '<span class="pill good">Active</span>';
}

function activeCustomers(selectedId = "") {
  return state.customers.filter((customer) => customer.active !== false || customer.id === selectedId);
}

function activeCategories(selectedId = "") {
  return state.categories.filter((category) => category.active !== false || category.id === selectedId);
}

function firstActiveCustomerId() {
  return activeCustomers()[0]?.id || state.customers[0]?.id || "";
}

function firstActiveCategoryId() {
  return activeCategories()[0]?.id || state.categories[0]?.id || "";
}

function renderDashboard() {
  const range = dashboardDateRange();
  const dashboardJobs = filterByDate(state.jobCards, range);
  const dashboardPayments = filterByDate(state.payments, range);
  const dashboardExpenses = filterByDate(state.expenses, range);
  const dashboardCommissions = filterByDate(state.commissions, range);
  const totalBilled = dashboardJobs.reduce((sum, job) => sum + jobTotal(job), 0);
  const totalPaid = dashboardPayments.reduce((sum, payment) => sum + payment.items.reduce((x, item) => x + parseMoney(item.amount), 0), 0);
  const totalOutstanding = dashboardJobs.reduce((sum, job) => sum + outstandingForJob(job.id), 0);
  const expenses = dashboardExpenses.reduce((sum, expense) => sum + parseMoney(expense.amount), 0);
  const commissions = dashboardCommissions.reduce((sum, entry) => sum + parseMoney(entry.amount), 0);
  views.dashboard.innerHTML = `
    <div class="panel dashboard-range">
      <div>
        <span class="eyebrow">Dashboard View</span>
        <strong>${dashboardRangeLabel(range)}</strong>
      </div>
      <label>Period
        <select id="dashboardRangeMode">
          <option value="today" ${range.mode === "today" ? "selected" : ""}>Today</option>
          <option value="weekly" ${range.mode === "weekly" ? "selected" : ""}>Weekly</option>
          <option value="monthly" ${range.mode === "monthly" ? "selected" : ""}>Monthly</option>
          <option value="custom" ${range.mode === "custom" ? "selected" : ""}>Custom</option>
        </select>
      </label>
      <label class="${range.mode === "custom" ? "" : "dashboard-custom-date"}">From<input type="date" id="dashboardDateFrom" value="${range.from}"></label>
      <label class="${range.mode === "custom" ? "" : "dashboard-custom-date"}">To<input type="date" id="dashboardDateTo" value="${range.to}"></label>
    </div>
    <div class="dashboard-metrics">
      ${metric("Job Cards", dashboardJobs.length)}
      ${metric("Billed", formatMoney(totalBilled))}
      ${metric("Paid", formatMoney(totalPaid))}
      ${metric("Outstanding", formatMoney(totalOutstanding))}
    </div>
    <div class="dashboard-switch" role="tablist" aria-label="Dashboard view">
      ${dashboardSwitchButton("recent", "Recent Job Cards")}
      ${dashboardSwitchButton("snapshot", "Business Snapshot")}
    </div>
    <div class="dashboard-main single">
      ${dashboardActivePanel() === "recent" ? `
      <div class="panel dashboard-recent dashboard-active-panel">
        <h2>Recent Job Cards</h2>
        <div class="table-wrap dashboard-table">
          ${jobTable(dashboardJobs.slice(-6).reverse())}
        </div>
      </div>` : `
      <div class="panel dashboard-snapshot dashboard-active-panel">
        <h2>Business Snapshot</h2>
        <table>
          <tbody>
            <tr><th>Income received</th><td>${formatMoney(totalPaid)}</td></tr>
            <tr><th>Commissions</th><td>${formatMoney(commissions)}</td></tr>
            <tr><th>Expenses</th><td>${formatMoney(expenses)}</td></tr>
            <tr><th>Balance</th><td><strong>${formatMoney(totalPaid - commissions - expenses)}</strong></td></tr>
          </tbody>
        </table>
      </div>`}
    </div>`;
  wireDashboardRange();
  document.querySelectorAll("[data-dashboard-panel]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem("vasma-dashboard-panel", button.dataset.dashboardPanel);
      renderDashboard();
    });
  });
}

function metric(label, value) {
  return `<div class="metric"><span class="muted">${label}</span><strong>${value}</strong></div>`;
}

function dashboardActivePanel() {
  return localStorage.getItem("vasma-dashboard-panel") === "snapshot" ? "snapshot" : "recent";
}

function dashboardSwitchButton(key, label) {
  const active = dashboardActivePanel() === key;
  return `<button type="button" class="dashboard-switch-button ${active ? "active" : ""}" data-dashboard-panel="${key}" role="tab" aria-selected="${active}">${label}</button>`;
}

function dashboardDateRange() {
  const mode = localStorage.getItem("vasma-dashboard-range-mode") || "today";
  const now = new Date();
  const end = today();
  if (mode === "weekly") {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return { mode, from: start.toISOString().slice(0, 10), to: end };
  }
  if (mode === "monthly") {
    return { mode, from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10), to: end };
  }
  if (mode === "custom") {
    return {
      mode,
      from: localStorage.getItem("vasma-dashboard-date-from") || end,
      to: localStorage.getItem("vasma-dashboard-date-to") || end
    };
  }
  return { mode: "today", from: end, to: end };
}

function dashboardRangeLabel(range) {
  const labels = { today: "Today", weekly: "Weekly", monthly: "Monthly", custom: "Custom" };
  return `${labels[range.mode] || "Today"}: ${formatDateRange(range.from, range.to)}`;
}

function wireDashboardRange() {
  document.querySelector("#dashboardRangeMode")?.addEventListener("change", (event) => {
    localStorage.setItem("vasma-dashboard-range-mode", event.target.value);
    renderDashboard();
  });
  document.querySelector("#dashboardDateFrom")?.addEventListener("change", (event) => {
    localStorage.setItem("vasma-dashboard-range-mode", "custom");
    localStorage.setItem("vasma-dashboard-date-from", event.target.value);
    renderDashboard();
  });
  document.querySelector("#dashboardDateTo")?.addEventListener("change", (event) => {
    localStorage.setItem("vasma-dashboard-range-mode", "custom");
    localStorage.setItem("vasma-dashboard-date-to", event.target.value);
    renderDashboard();
  });
}

function renderCustomers() {
  views.customers.innerHTML = `
    <div class="toolbar"><h2>Customer Registration</h2><button class="primary" onclick="openCustomerForm()">Add Customer</button></div>
    <div class="panel table-wrap">
      <table>
        <thead><tr><th>Customer</th><th>Truck / Vehicle #</th><th>Vehicle Model</th><th>Contact Person</th><th>Mobile</th><th>Status</th></tr></thead>
        <tbody>${state.customers.map((c) => `
          <tr>
            <td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.vehicle)}</td><td>${escapeHtml(c.vehicleModel || "")}</td><td>${escapeHtml(c.contact)}</td><td>${escapeHtml(c.mobile)}</td><td>${activePill(c.active)}</td>
          </tr>`).join("") || emptyRow(6)}
        </tbody>
      </table>
    </div>`;
}

function openCustomerForm(id = "") {
  const c = byId(state.customers, id) || { name: "", vehicle: "", vehicleModel: "", contact: "", mobile: "", active: true };
  openModal(`
    <h2>${id ? "Edit" : "Add"} Customer</h2>
    <form id="customerForm" class="form-grid">
      <label>Customer Name<input name="name" value="${escapeAttr(c.name)}" required></label>
      <label>Truck / Vehicle Number<input name="vehicle" value="${escapeAttr(c.vehicle)}" required></label>
      <label>Vehicle Model<input name="vehicleModel" value="${escapeAttr(c.vehicleModel || "")}" placeholder="Toyota Land Cruiser V8" required></label>
      <label>Mobile Number<input name="mobile" value="${escapeAttr(c.mobile)}" required></label>
      <label>Status<select name="active"><option value="true" ${c.active !== false ? "selected" : ""}>Active</option><option value="false" ${c.active === false ? "selected" : ""}>Inactive</option></select></label>
      <label class="wide">Contact Person<input name="contact" value="${escapeAttr(c.contact)}" required></label>
      <div class="wide actions"><button class="primary">Save Customer</button></div>
    </form>`);
  document.querySelector("#customerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.target);
    data.active = data.active === "true";
    if (id) Object.assign(c, data);
    else state.customers.push({ id: uid(), ...data });
    commit("Customer saved");
  });
}

function renderJobs() {
  views.jobs.innerHTML = `
    <div class="toolbar"><h2>Job Cards</h2><button class="primary" onclick="openJobForm()">New Job Card</button></div>
    <div class="panel table-wrap">${jobTable(state.jobCards)}</div>`;
}

function jobTable(jobs) {
  if (!jobs.length) return '<div class="empty">No job cards yet.</div>';
  return `
    <table>
      <thead><tr><th>Date</th><th>Job Card Ref</th><th>Vehicle</th><th>Vehicle Model</th><th>Mileage</th><th>Customer</th><th>Billed</th><th>Paid</th><th>Status</th><th></th></tr></thead>
      <tbody>${jobs.map((job) => {
        const customer = byId(state.customers, job.customerId) || {};
        return `<tr>
          <td>${formatDate(job.date)}</td><td><strong>${job.ref}</strong></td><td>${escapeHtml(customer.vehicle || "")}</td><td>${escapeHtml(customer.vehicleModel || "")}</td><td>${formatMileage(job.mileage)}</td><td>${escapeHtml(customer.name || "")}</td>
          <td>${formatMoney(jobTotal(job))}</td><td>${formatMoney(paidForJob(job.id))}</td><td>${statusPill(job)}</td>
          <td class="inline-actions"><button class="secondary" onclick="viewJob('${job.id}')">View</button></td>
        </tr>`;
      }).join("")}</tbody>
    </table>`;
}

function openJobForm(id = "") {
  const job = byId(state.jobCards, id) || {
    date: today(),
    customerId: firstActiveCustomerId(),
    mileage: "",
    items: [],
    purchaseItems: [],
    notes: ""
  };
  if (!job.items.length) job.items = [{ id: uid(), categoryId: firstActiveCategoryId(), itemId: "", attendantId: state.employees[0]?.id || "", action: "", amount: "" }];
  openModal(`
    <h2>${id ? "Edit" : "New"} Job Card</h2>
    <form id="jobForm" class="stack">
      <div class="form-grid four-fields">
        <label>Date<input type="date" name="date" value="${job.date}" required></label>
        <label>Customer<select name="customerId" id="jobCustomer" required>${options(activeCustomers(job.customerId), job.customerId, (c) => `${c.name} - ${c.vehicle}${c.active === false ? " (Inactive)" : ""}`)}</select></label>
        <label>Vehicle Model<input id="jobVehicleModel" value="${escapeAttr(customerVehicleModel(job.customerId))}" disabled></label>
        <label>Mileage<input name="mileage" value="${escapeAttr(job.mileage || "")}" inputmode="numeric" placeholder="125000"></label>
      </div>
      <div>
        <div class="toolbar"><h3>Service Items</h3><button type="button" class="secondary" id="addServiceRow">Add Item</button></div>
        <div class="line-heading service-line-heading">
          <span>Category</span><span>Service Item</span><span>Attendant</span><span>Amount (Tsh)</span><span></span>
        </div>
        <div id="serviceRows" class="stack"></div>
      </div>
      <div>
        <div class="toolbar"><h3>Purchased Items</h3><button type="button" class="secondary" id="addPurchaseRow">Add Purchased Item</button></div>
        <div class="line-heading purchase-line-heading">
          <span>Item name</span><span>Unit</span><span>Qnty</span><span>Unit cost</span><span>Amount</span><span></span>
        </div>
        <div id="purchaseRows" class="stack"></div>
      </div>
      <div class="actions"><button type="button" class="secondary" id="toggleNote">Add Note</button></div>
      <label class="wide note-field" id="noteField" ${job.notes ? "" : "hidden"}>Additional Instruction / Note<textarea name="notes">${escapeHtml(job.notes || "")}</textarea></label>
      <div class="actions"><button class="primary">Save Job Card</button></div>
    </form>`);
  const rows = document.querySelector("#serviceRows");
  const purchaseRows = document.querySelector("#purchaseRows");
  const customerInput = document.querySelector("#jobCustomer");
  const renderRows = () => {
    rows.innerHTML = job.items.map((item, index) => serviceRow(index, item)).join("");
    rows.querySelectorAll("[data-remove]").forEach((button) => button.addEventListener("click", () => {
      job.items.splice(Number(button.dataset.remove), 1);
      renderRows();
    }));
    rows.querySelectorAll("[name=categoryId]").forEach((select) => select.addEventListener("change", () => {
      const row = select.closest(".service-row");
      row.querySelector("[name=itemId]").innerHTML = options(byId(state.categories, select.value)?.items || [], "");
    }));
  };
  const renderPurchaseRows = () => {
    purchaseRows.innerHTML = (job.purchaseItems || []).map((item, index) => purchaseRow(index, item)).join("");
    purchaseRows.querySelectorAll("[data-remove-purchase]").forEach((button) => button.addEventListener("click", () => {
      job.purchaseItems.splice(Number(button.dataset.removePurchase), 1);
      renderPurchaseRows();
    }));
    purchaseRows.querySelectorAll("[name=qty],[name=unitCost]").forEach((input) => input.addEventListener("input", () => {
      const row = input.closest(".purchase-row");
      row.querySelector("[name=amount]").value = (parseMoney(row.querySelector("[name=qty]").value) * parseMoney(row.querySelector("[name=unitCost]").value)).toFixed(2);
    }));
  };
  customerInput.addEventListener("change", () => {
    document.querySelector("#jobVehicleModel").value = customerVehicleModel(customerInput.value);
  });
  document.querySelector("#addServiceRow").addEventListener("click", () => {
    job.items.push({ id: uid(), categoryId: firstActiveCategoryId(), itemId: "", attendantId: state.employees[0]?.id || "", action: "", amount: "" });
    renderRows();
  });
  document.querySelector("#addPurchaseRow").addEventListener("click", () => {
    if (!Array.isArray(job.purchaseItems)) job.purchaseItems = [];
    job.purchaseItems.push({ id: uid(), name: "", unit: "", qty: "", unitCost: "", amount: "", status: "" });
    renderPurchaseRows();
  });
  document.querySelector("#toggleNote").addEventListener("click", () => {
    document.querySelector("#noteField").hidden = false;
  });
  renderRows();
  renderPurchaseRows();
  document.querySelector("#jobForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.target);
    const items = Array.from(rows.querySelectorAll(".service-row")).map((row) => ({
      id: row.dataset.id || uid(),
      categoryId: row.querySelector("[name=categoryId]").value,
      itemId: row.querySelector("[name=itemId]").value,
      attendantId: row.querySelector("[name=attendantId]").value,
      action: row.dataset.action || "",
      status: row.dataset.action || "",
      confirmed: row.dataset.confirmed === "true",
      amount: parseMoney(row.querySelector("[name=amount]").value)
    })).filter((item) => item.categoryId && item.itemId && item.amount > 0);
    const purchaseItems = Array.from(purchaseRows.querySelectorAll(".purchase-row")).map((row) => ({
      id: row.dataset.id || uid(),
      name: row.querySelector("[name=name]").value,
      unit: row.querySelector("[name=unit]").value,
      qty: parseMoney(row.querySelector("[name=qty]").value),
      unitCost: parseMoney(row.querySelector("[name=unitCost]").value),
      amount: parseMoney(row.querySelector("[name=amount]").value),
      status: row.querySelector("[name=status]").value
    })).filter((item) => item.name && item.amount > 0);
    if (!items.length) return toast("Add at least one service item with amount");
    data.mileage = parseMoney(data.mileage);
    const payload = { ...data, items, purchaseItems };
    if (id) Object.assign(byId(state.jobCards, id), payload);
    else state.jobCards.push({ id: uid(), ref: nextJobRef(), ...payload });
    commit("Job card saved");
  });
}

function serviceRow(index, item) {
  const categoryId = item.categoryId || firstActiveCategoryId();
  return `
    <div class="service-row" data-id="${item.id || ""}" data-confirmed="${Boolean(item.confirmed)}" data-action="${escapeAttr(item.action || item.status || "")}">
      <select name="categoryId" aria-label="Category" required>${options(activeCategories(categoryId), categoryId, (category) => `${category.name}${category.active === false ? " (Inactive)" : ""}`)}</select>
      <select name="itemId" aria-label="Service Item" required>${options(byId(state.categories, categoryId)?.items || [], item.itemId)}</select>
      <select name="attendantId" aria-label="Attendant" required>${options(state.employees, item.attendantId)}</select>
      <input name="amount" aria-label="Amount (Tsh)" inputmode="decimal" value="${item.amount || ""}" placeholder="1,000.00" required>
      <button type="button" class="danger icon" data-remove="${index}" aria-label="Remove">x</button>
    </div>`;
}

function purchaseRow(index, item) {
  const amount = parseMoney(item.amount || parseMoney(item.qty) * parseMoney(item.unitCost));
  return `
    <div class="purchase-row" data-id="${item.id || ""}">
      <input name="name" aria-label="Item Name" value="${escapeAttr(item.name || "")}" placeholder="Engine Oil">
      <input name="unit" aria-label="Unit" value="${escapeAttr(item.unit || "")}" placeholder="Litre">
      <input name="qty" aria-label="Qnty" value="${item.qty || ""}" inputmode="decimal">
      <input name="unitCost" aria-label="Unit Cost" value="${item.unitCost || ""}" inputmode="decimal">
      <input name="amount" aria-label="Amount" value="${amount || ""}" inputmode="decimal">
      <input name="status" value="${escapeAttr(item.status || "")}" hidden>
      <button type="button" class="danger icon" data-remove-purchase="${index}" aria-label="Remove">x</button>
    </div>`;
}

function nextJobRef() {
  const max = state.jobCards.reduce((highest, job) => {
    const value = Number(String(job.ref || "").match(/(\d+)/g)?.at(-1) || 0);
    return Math.max(highest, value || 0);
  }, 0);
  return `JC-${String(max + 1).padStart(6, "0")}`;
}

function viewJob(id) {
  const job = byId(state.jobCards, id);
  if (!job) return;
  openModal(`
    <div class="actions no-print" style="margin-bottom:12px"><button class="secondary" onclick="printJobCard('${job.id}')">Print Preview</button></div>
    <h2>${job.ref}</h2>
    <div class="grid two">
      <div class="panel"><h3>Customer</h3><p>${customerName(job.customerId)}</p><p>${escapeHtml(customerVehicleModel(job.customerId))} - ${formatDate(job.date)}</p><p>Mileage: <strong>${formatMileage(job.mileage) || "N/A"}</strong></p></div>
      <div class="panel"><h3>Totals</h3><p>Billed: <strong>${formatMoney(jobTotal(job))}</strong></p><p>Paid: <strong>${formatMoney(paidForJob(job.id))}</strong></p><p>Outstanding: <strong>${formatMoney(jobTotal(job) - paidForJob(job.id))}</strong></p></div>
    </div>
    <div class="panel table-wrap" style="margin-top:12px">${jobItemsTable(job)}${purchaseItemsTable(job)}</div>`);
}

function jobCardMarkup(job) {
  const customer = byId(state.customers, job.customerId) || {};
  const settings = state.settings || seed.settings;
  return `
    <div class="bill-paper ${pageSetupClass("jobCard")}">
      <div class="bill-head">
        <div>
          <h2>${escapeHtml(settings.businessName || "VASMA System")}</h2>
          <p>${escapeHtml(settings.location || "")}</p>
          <p>${escapeHtml(settings.mobile || "")}</p>
        </div>
        <div>
          <h3>Job Card ${job.ref}</h3>
          <p>Date: ${formatDate(job.date)}</p>
        </div>
      </div>
      <div class="grid two">
        <div><h3>Customer</h3><p>${escapeHtml(customer.name || "")}</p><p>${escapeHtml(customer.contact || "")} ${escapeHtml(customer.mobile || "")}</p></div>
        <div><h3>Vehicle</h3><p>${escapeHtml(customer.vehicle || "")}</p><p>${escapeHtml(customer.vehicleModel || "")}</p><p>Mileage: ${formatMileage(job.mileage) || "N/A"}</p></div>
      </div>
      <div class="table-wrap" style="margin-top:14px">${jobItemsTable(job)}${purchaseItemsTable(job)}</div>
      ${job.notes ? `<h3 style="margin-top:16px">Notes</h3><p>${escapeHtml(job.notes)}</p>` : ""}
      <table style="margin-top:16px"><tbody>
        <tr><th>Total Estimated Amount</th><td>${formatMoney(jobTotal(job))}</td></tr>
      </tbody></table>
      <p style="margin-top:18px">Prepared by ${escapeHtml(profileName())}</p>
    </div>`;
}

function printJobCard(jobId) {
  const job = byId(state.jobCards, jobId);
  if (!job) return toast("Job card not found");
  openPrintPreview(`Job Card ${job.ref}`, jobCardMarkup(job));
}

function jobItemsTable(job) {
  return `<h3>Service Items</h3><table><thead><tr><th>Category</th><th>Item</th><th>Attendant</th><th>Status</th><th>Amount</th></tr></thead><tbody>
    ${job.items.map((item) => `<tr><td>${categoryName(item.categoryId || job.categoryId)}</td><td>${itemName(item.categoryId || job.categoryId, item.itemId)}</td><td>${employeeName(item.attendantId)}</td><td>${escapeHtml(item.status || item.action || (item.confirmed ? "Confirmed" : ""))}</td><td>${formatMoney(item.amount)}</td></tr>`).join("")}
  </tbody></table>`;
}

function purchaseItemsTable(job) {
  const items = job.purchaseItems || [];
  if (!items.length) return "";
  return `<h3 style="margin-top:16px">Purchased Items</h3><table><thead><tr><th>Item name</th><th>Unit</th><th>Qnty</th><th>Unit cost</th><th>Amount</th><th>Status</th></tr></thead><tbody>
    ${items.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.unit || "")}</td><td>${item.qty || ""}</td><td>${formatMoney(item.unitCost)}</td><td>${formatMoney(item.amount)}</td><td>${escapeHtml(item.status || "")}</td></tr>`).join("")}
  </tbody></table>`;
}

function billLines(job) {
  if (!job) return [];
  const serviceLines = job.items.map((item) => ({
    id: item.id,
    type: "Service",
    label: `${categoryName(item.categoryId || job.categoryId)} - ${itemName(item.categoryId || job.categoryId, item.itemId)}`,
    attendantId: item.attendantId,
    amount: parseMoney(item.amount)
  }));
  const materialLines = (job.purchaseItems || []).map((item) => ({
    id: item.id,
    type: "Purchased",
    label: item.name,
    attendantId: "",
    amount: parseMoney(item.amount)
  }));
  return [...serviceLines, ...materialLines];
}

function outstandingBillLines(job, excludePaymentId = "") {
  return billLines(job)
    .map((line) => {
      const paid = paidForLine(job.id, line.id, excludePaymentId);
      return { ...line, paid, outstanding: Math.max(0, line.amount - paid) };
    })
    .filter((line) => line.outstanding > 0);
}

function findJob(query) {
  if (!query) return null;
  return state.jobCards.find((job) => {
    const customer = byId(state.customers, job.customerId) || {};
    return job.ref.toLowerCase().includes(query) || compactJobRef(job).toLowerCase().includes(query) || invoiceRef(job).toLowerCase().includes(query) || String(customer.vehicle || "").toLowerCase().includes(query);
  });
}

function renderConfirmation() {
  const selectedJobId = localStorage.getItem("vasma-confirmation-job") || "";
  views.confirmation.innerHTML = `
    <div class="toolbar">
      <div><h2>Work Confirmation and Bill Printing</h2><p class="muted">Filter by job card number, verify work, then preview and export the bill.</p></div>
    </div>
    <div class="panel filter-row">
      <label>Job Card Number<select id="confirmationJobFilter"><option value="">Select job card...</option>${state.jobCards.map((job) => `<option value="${job.id}" ${job.id === selectedJobId ? "selected" : ""}>${escapeHtml(job.ref)} - ${escapeHtml(customerName(job.customerId))}</option>`).join("")}</select></label>
    </div>
    <div id="confirmationResult" style="margin-top:14px">${state.jobCards.length ? '<div class="empty">Select a job card to display work confirmation.</div>' : '<div class="empty">No job cards available.</div>'}</div>`;
  document.querySelector("#confirmationJobFilter")?.addEventListener("change", (event) => {
    if (!event.target.value) {
      localStorage.removeItem("vasma-confirmation-job");
      document.querySelector("#confirmationResult").innerHTML = '<div class="empty">Select a job card to display work confirmation.</div>';
      return;
    }
    localStorage.setItem("vasma-confirmation-job", event.target.value);
    showConfirmationJob(event.target.value);
  });
  if (selectedJobId) showConfirmationJob(selectedJobId);
}

function showConfirmationJob(jobId) {
  const job = byId(state.jobCards, jobId);
  const customer = byId(state.customers, job.customerId) || {};
  document.querySelector("#confirmationResult").innerHTML = `
    <div class="grid two">
      <div class="panel">
        <h3>${job.ref}</h3>
        <p><strong>${escapeHtml(customer.name || "")}</strong></p>
        <p>${escapeHtml(customer.vehicle || "")} - ${escapeHtml(customer.vehicleModel || "")}</p>
        <p>Mileage: <strong>${formatMileage(job.mileage) || "N/A"}</strong></p>
        <p>${escapeHtml(customer.contact || "")} ${escapeHtml(customer.mobile || "")}</p>
      </div>
      <div class="panel">
        <h3>Bill Summary</h3>
        <p>Services: <strong>${formatMoney(serviceTotal(job))}</strong></p>
        <p>Purchased items: <strong>${formatMoney(purchaseTotal(job))}</strong></p>
        <p>Total bill: <strong>${formatMoney(jobTotal(job))}</strong></p>
      </div>
    </div>
    <form id="confirmForm" class="panel table-wrap" style="margin-top:14px">
      ${confirmationLines(job)}
      <div class="actions" style="margin-top:14px">
        <button class="primary">Save Confirmation</button>
        <button type="button" class="secondary" onclick="previewBill('${job.id}')">Preview Bill</button>
        <button type="button" class="secondary" onclick="printBill('${job.id}')">Export PDF</button>
      </div>
    </form>`;
  document.querySelector("#confirmForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveConfirmation(job.id);
  });
}

function confirmationLines(job) {
  return `
    <h3>Service Confirmation</h3>
    <table>
      <thead><tr><th>Category</th><th>Service Item</th><th>Attendant</th><th>Action</th><th>Done</th></tr></thead>
      <tbody>${job.items.map((item) => `<tr data-service-id="${item.id}">
        <td>${categoryName(item.categoryId || job.categoryId)}</td>
        <td>${itemName(item.categoryId || job.categoryId, item.itemId)}</td>
        <td>${employeeName(item.attendantId)}</td>
        <td><select name="action">${state.actions.map((a) => `<option value="${escapeAttr(a.name)}" ${((item.action || item.status) === a.name) ? "selected" : ""}>${escapeHtml(a.name)}</option>`).join("")}</select></td>
        <td><input type="checkbox" name="confirmed" ${item.confirmed ? "checked" : ""}></td>
      </tr>`).join("")}</tbody>
    </table>
    ${job.purchaseItems?.length ? `<h3 style="margin-top:16px">Purchased Material Confirmation</h3>
    <table>
      <thead><tr><th>Item name</th><th>Unit</th><th>Qnty</th><th>Amount</th><th>Status</th></tr></thead>
      <tbody>${job.purchaseItems.map((item) => `<tr data-purchase-id="${item.id}">
        <td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.unit || "")}</td><td>${item.qty || ""}</td><td>${formatMoney(item.amount)}</td>
        <td><select name="status"><option value=""></option>${state.actions.map((a) => `<option value="${escapeAttr(a.name)}" ${item.status === a.name ? "selected" : ""}>${escapeHtml(a.name)}</option>`).join("")}</select></td>
      </tr>`).join("")}</tbody>
    </table>` : ""}`;
}

function saveConfirmation(jobId) {
  const job = byId(state.jobCards, jobId);
  document.querySelectorAll("[data-service-id]").forEach((row) => {
    const item = byId(job.items, row.dataset.serviceId);
    item.action = row.querySelector("[name=action]").value;
    item.status = item.action;
    item.confirmed = row.querySelector("[name=confirmed]").checked;
  });
  document.querySelectorAll("[data-purchase-id]").forEach((row) => {
    const item = byId(job.purchaseItems, row.dataset.purchaseId);
    item.status = row.querySelector("[name=status]").value;
  });
  save();
  renderAll();
  showConfirmationJob(jobId);
  toast("Work confirmation saved");
}

function generalServiceItems(job) {
  return job.items.filter((item) => categoryName(item.categoryId || job.categoryId).toLowerCase() === "general service");
}

function generalServiceJobs() {
  return state.jobCards.filter((job) => serviceCardBaseItems(job).length);
}

function defaultNextServiceMileage(job) {
  const mileage = parseMoney(job.mileage);
  return mileage ? mileage + 5000 : "";
}

function serviceCardLine(job, item) {
  return (job.serviceCard?.lines || []).find((line) => line.jobItemId === item.id) || {};
}

function isServiceCardCategory(name) {
  return ["general service", "tire service"].includes(String(name || "").toLowerCase());
}

function serviceCardSelectableItems() {
  return state.categories
    .filter((category) => isServiceCardCategory(category.name))
    .flatMap((category) => category.items.map((item) => ({ id: `${category.id}:${item.id}`, name: item.name })));
}

function serviceCardBaseItems(job) {
  return job.items.filter((item) => isServiceCardCategory(categoryName(item.categoryId || job.categoryId)));
}

function serviceCardRows(job) {
  const saved = job.serviceCard?.lines || [];
  if (saved.length) {
    return saved.map((line) => ({
      id: line.id || line.jobItemId || uid(),
      jobItemId: line.jobItemId || "",
      itemName: line.itemName || itemName(byId(job.items, line.jobItemId)?.categoryId || "", byId(job.items, line.jobItemId)?.itemId || ""),
      checked: Boolean(line.checked ?? line.done),
      remarks: line.remarks || ""
    }));
  }
  return serviceCardBaseItems(job).map((item) => ({
    id: item.id,
    jobItemId: item.id,
    itemName: itemName(item.categoryId || job.categoryId, item.itemId),
    checked: Boolean(item.confirmed),
    remarks: ""
  }));
}

function renderServiceCards() {
  const jobs = generalServiceJobs();
  const selectedJobId = localStorage.getItem("vasma-service-card-job") || "";
  views.serviceCards.innerHTML = `
    <div class="toolbar">
      <div><h2>Service Cards</h2><p class="muted">Create a General Service card from job card items and set the next service details.</p></div>
    </div>
    <div class="panel filter-row">
      <label>Job Card Number<select id="serviceCardJobFilter"><option value="">Select job card...</option>${jobs.map((job) => `<option value="${job.id}" ${job.id === selectedJobId ? "selected" : ""}>${escapeHtml(job.ref)} - ${escapeHtml(customerName(job.customerId))}</option>`).join("")}</select></label>
    </div>
    <div id="serviceCardResult" style="margin-top:14px">${jobs.length ? '<div class="empty">Select a General Service job card to display the service card.</div>' : '<div class="empty">No General Service job cards available.</div>'}</div>`;
  document.querySelector("#serviceCardJobFilter")?.addEventListener("change", (event) => {
    if (!event.target.value) {
      localStorage.removeItem("vasma-service-card-job");
      document.querySelector("#serviceCardResult").innerHTML = '<div class="empty">Select a General Service job card to display the service card.</div>';
      return;
    }
    localStorage.setItem("vasma-service-card-job", event.target.value);
    showServiceCardJob(event.target.value);
  });
  if (selectedJobId && jobs.some((job) => job.id === selectedJobId)) showServiceCardJob(selectedJobId);
}

function showServiceCardJob(jobId) {
  const job = byId(state.jobCards, jobId);
  if (!job) return;
  const customer = byId(state.customers, job.customerId) || {};
  const card = job.serviceCard || {};
  const nextMileage = card.nextServiceMileage || defaultNextServiceMileage(job);
  const nextDate = card.nextServiceDate || addMonths(job.date, 3);
  const selectable = serviceCardSelectableItems();
  document.querySelector("#serviceCardResult").innerHTML = `
    <form id="serviceCardForm" class="panel stack">
      <div class="grid two">
        <div>
          <h3>${escapeHtml(job.ref)} - General Service</h3>
          <p><strong>${escapeHtml(customer.name || "")}</strong></p>
          <p>${escapeHtml(customer.vehicle || "")} - ${escapeHtml(customer.vehicleModel || "")}</p>
        </div>
        <div>
          <h3>Service Details</h3>
          <p>Date: <strong>${formatDate(job.date)}</strong></p>
          <p>Mileage: <strong>${formatMileage(job.mileage) || "N/A"}</strong></p>
        </div>
      </div>
      <div class="service-add-row">
        <label>Service Item<select id="serviceCardItemSelect">${selectable.map((item) => `<option value="${escapeAttr(item.name)}">${escapeHtml(item.name)}</option>`).join("")}</select></label>
        <button type="button" class="secondary" id="addServiceCardLine">Add Service Item</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Service Item</th><th>Check box</th><th>Remarks</th><th></th></tr></thead>
          <tbody id="serviceCardRows">${serviceCardRows(job).map(serviceCardRowMarkup).join("")}</tbody>
        </table>
      </div>
      <div class="form-grid">
        <label>Service Mileage<input name="serviceMileage" value="${escapeAttr(job.mileage || "")}" inputmode="numeric"></label>
        <label>Next Service Mileage<input name="nextServiceMileage" value="${escapeAttr(nextMileage)}" inputmode="numeric"></label>
        <label>Next Service Date<input type="date" name="nextServiceDate" value="${nextDate}"></label>
        <label>Service Interval<input value="Mileage set or 3 months from service date" disabled></label>
      </div>
      <div class="actions">
        <button class="primary">Save Service Card</button>
        <button type="button" class="secondary" onclick="previewServiceCard('${job.id}')">Preview Service Card</button>
        <button type="button" class="secondary" onclick="printServiceCard('${job.id}')">Export Service Card</button>
      </div>
    </form>`;
  document.querySelector("#serviceCardForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveServiceCard(job.id);
  });
  document.querySelector("#addServiceCardLine").addEventListener("click", () => {
    const select = document.querySelector("#serviceCardItemSelect");
    if (!select.value) return toast("Select service item");
    document.querySelector("#serviceCardRows").insertAdjacentHTML("beforeend", serviceCardRowMarkup({ id: uid(), itemName: select.value, checked: false, remarks: "" }));
  });
}

function serviceCardRowMarkup(line) {
  return `<tr data-service-card-line="${escapeAttr(line.id || uid())}">
    <td><input name="itemName" value="${escapeAttr(line.itemName || "")}"></td>
    <td><input class="small-check" type="checkbox" name="checked" ${line.checked ? "checked" : ""}></td>
    <td><input name="remarks" value="${escapeAttr(line.remarks || "")}" placeholder="Optional"></td>
    <td><button type="button" class="danger icon" onclick="this.closest('tr').remove()" aria-label="Remove">x</button></td>
  </tr>`;
}

function saveServiceCard(jobId) {
  const job = byId(state.jobCards, jobId);
  const form = document.querySelector("#serviceCardForm");
  const data = formData(form);
  job.serviceCard = {
    serviceMileage: parseMoney(data.serviceMileage || job.mileage),
    nextServiceMileage: parseMoney(data.nextServiceMileage),
    nextServiceDate: data.nextServiceDate,
    lines: Array.from(form.querySelectorAll("[data-service-card-line]")).map((row) => ({
      id: row.dataset.serviceCardLine,
      jobItemId: row.dataset.serviceCardLine,
      itemName: row.querySelector("[name=itemName]").value,
      checked: row.querySelector("[name=checked]").checked,
      done: row.querySelector("[name=checked]").checked,
      remarks: row.querySelector("[name=remarks]").value
    })).filter((line) => line.itemName)
  };
  save();
  renderAll();
  showServiceCardJob(jobId);
  toast("Service card saved");
}

function serviceCardMarkup(job) {
  const customer = byId(state.customers, job.customerId) || {};
  const settings = state.settings || seed.settings;
  const card = job.serviceCard || {};
  const rows = serviceCardRows(job);
  const serviceMileage = card.serviceMileage || job.mileage || "";
  const nextMileage = card.nextServiceMileage || defaultNextServiceMileage(job);
  const nextDate = card.nextServiceDate || addMonths(job.date, 3);
  return `
    <div class="bill-paper service-card-paper page-compact">
      <h2 class="service-card-business">${escapeHtml(settings.businessName || "VASMA System")}</h2>
      <div class="service-card-head">
        <div></div>
        <div>
          <h3>General Service Card</h3>
          <p>${escapeHtml(settings.location || "")} ${escapeHtml(settings.mobile || "")}</p>
        </div>
        <div>
          <p><strong>${escapeHtml(customer.name || "")}</strong></p>
          <p>${escapeHtml(customer.mobile || customer.contact || "")}</p>
          <p>${escapeHtml(customer.vehicle || "")} - ${escapeHtml(customer.vehicleModel || "")}</p>
          <p>Job Card: ${escapeHtml(job.ref)}</p>
          <p>Date: ${formatDate(job.date)}</p>
        </div>
      </div>
      <table class="service-card-table">
        <thead><tr><th>Service Item</th><th>Check box</th><th>Remarks</th></tr></thead>
        <tbody>${rows.map((line) => {
          return `<tr>
            <td>${escapeHtml(line.itemName || "")}</td>
            <td>${line.checked ? "☑" : "☐"}</td>
            <td>${escapeHtml(line.remarks || "")}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
      <div class="service-card-next">
        <div><strong>Service Mileage</strong><span>${formatMileage(serviceMileage) || "N/A"}</span></div>
        <div><strong>Next Service Mileage</strong><span>${formatMileage(nextMileage) || "N/A"}</span></div>
        <div><strong>Next Service Date</strong><span>${formatDate(nextDate)}</span></div>
      </div>
      <p class="muted" style="margin-top:8px">Service interval: Mileage set or 3 months from service date.</p>
      <div class="signature-row">
        <span>Attended by: ____________________<br>Name and Signature</span>
        <span>Reviewed by: ____________________<br>Name and Signature</span>
      </div>
    </div>`;
}

function previewServiceCard(jobId) {
  const job = byId(state.jobCards, jobId);
  if (!job) return toast("Job card not found");
  openModal(`<div class="actions no-print" style="margin-bottom:12px"><button class="secondary" onclick="printServiceCard('${job.id}')">Print Preview</button></div>${serviceCardMarkup(job)}`);
}

function printServiceCard(jobId) {
  const job = byId(state.jobCards, jobId);
  if (!job) return toast("Job card not found");
  openPrintPreview(`Service Card ${job.ref}`, serviceCardMarkup(job));
}

function billMarkup(job) {
  const customer = byId(state.customers, job.customerId) || {};
  const settings = state.settings || seed.settings;
  return `
    <div class="bill-paper ${pageSetupClass("bill")}">
      <div class="bill-head">
        <div>
          <h2>${escapeHtml(settings.businessName || "VASMA System")}</h2>
          <p>${escapeHtml(settings.location || "")}</p>
          <p>${escapeHtml(settings.mobile || "")}</p>
        </div>
        <div>
          <h3>Bill ${job.ref}</h3>
          <p>Date: ${formatDate(job.date)}</p>
        </div>
      </div>
      <div class="grid two">
        <div><h3>Customer</h3><p>${escapeHtml(customer.name || "")}</p><p>${escapeHtml(customer.contact || "")} ${escapeHtml(customer.mobile || "")}</p></div>
        <div><h3>Vehicle</h3><p>${escapeHtml(customer.vehicle || "")}</p><p>${escapeHtml(customer.vehicleModel || "")}</p><p>Mileage: ${formatMileage(job.mileage) || "N/A"}</p></div>
      </div>
      <div class="table-wrap" style="margin-top:14px">${jobItemsTable(job)}${purchaseItemsTable(job)}</div>
      ${job.notes ? `<h3 style="margin-top:16px">Notes</h3><p>${escapeHtml(job.notes)}</p>` : ""}
      <table style="margin-top:16px"><tbody>
        <tr><th>Service Total</th><td>${formatMoney(serviceTotal(job))}</td></tr>
        <tr><th>Purchased Items Total</th><td>${formatMoney(purchaseTotal(job))}</td></tr>
        <tr><th>Total Bill</th><td><strong>${formatMoney(jobTotal(job))}</strong></td></tr>
        <tr><th>Paid</th><td>${formatMoney(paidForJob(job.id))}</td></tr>
        <tr><th>Outstanding</th><td>${formatMoney(jobTotal(job) - paidForJob(job.id))}</td></tr>
      </tbody></table>
      ${qrMarkup(invoiceQrData(job), "Scan to verify invoice")}
      <p style="margin-top:18px">Prepared by ${escapeHtml(profileName())}</p>
    </div>`;
}

function previewBill(jobId) {
  const job = byId(state.jobCards, jobId);
  openModal(`<div class="actions no-print" style="margin-bottom:12px"><button class="secondary" onclick="printBill('${job.id}')">Print Preview</button></div>${billMarkup(job)}`);
}

function printBill(jobId) {
  const job = byId(state.jobCards, jobId);
  if (!job) return toast("Bill not found");
  openPrintPreview(`Bill ${job.ref}`, billMarkup(job));
}

function renderPayments() {
  const filters = paymentFilters();
  const payments = filteredPayments(filters);
  views.payments.innerHTML = `
    <div class="toolbar">
      <div><h2>Payment Module</h2><p class="muted">Record payments, filter receipts from table headers, then export receipts.</p></div>
      <button class="primary" onclick="openPaymentForm()">Record Payment</button>
    </div>
    <div class="panel table-wrap">
      <table>
        <thead>
          <tr><th>Date</th><th>Receipt Ref</th><th>Customer</th><th>Vehicle #</th><th>Job Card</th><th>Method</th><th>Amount</th><th>Reference / Comment</th><th></th></tr>
          <tr class="table-filter-row">
            ${paymentFilterCell("date", filters.date, uniquePaymentValues("date"))}
            ${paymentFilterCell("ref", filters.ref, uniquePaymentValues("ref"))}
            ${paymentFilterCell("customer", filters.customer, uniquePaymentValues("customer"))}
            ${paymentFilterCell("vehicle", filters.vehicle, uniquePaymentValues("vehicle"))}
            ${paymentFilterCell("job", filters.job, uniquePaymentValues("job"))}
            ${paymentFilterCell("method", filters.method, uniquePaymentValues("method"))}
            <th></th>
            ${paymentFilterCell("comment", filters.comment, uniquePaymentValues("comment"))}
            <th><button class="secondary small-button" id="clearPaymentFilters">Clear</button></th>
          </tr>
        </thead>
        <tbody>${payments.map((payment) => {
          const job = byId(state.jobCards, payment.jobId) || {};
          const customer = byId(state.customers, job.customerId) || {};
          return `<tr>
            <td>${formatDate(payment.date)}</td><td>${escapeHtml(payment.ref || "")}</td><td>${escapeHtml(customer.name || "")}</td><td>${escapeHtml(customer.vehicle || "")}</td><td>${job.ref || ""}</td><td>${payment.method}</td><td>${formatMoney(paymentAmount(payment))}</td><td>${escapeHtml(payment.comment || payment.attachmentName || "")}</td>
            <td class="inline-actions"><button class="secondary" onclick="viewReceipt('${payment.id}')">View Receipt</button></td>
          </tr>`;
        }).join("") || emptyRow(9)}</tbody>
      </table>
    </div>`;
  document.querySelectorAll("[data-payment-filter]").forEach((input) => input.addEventListener("input", () => {
    const next = paymentFilters();
    next[input.dataset.paymentFilter] = input.value;
    localStorage.setItem("vasma-payment-filters", JSON.stringify(next));
    renderPayments();
  }));
  document.querySelector("#clearPaymentFilters").addEventListener("click", () => {
    localStorage.removeItem("vasma-payment-filters");
    renderPayments();
  });
}

function paymentAmount(payment) {
  return payment.items.reduce((sum, item) => sum + parseMoney(item.amount), 0);
}

function paymentFilters() {
  try {
    return JSON.parse(localStorage.getItem("vasma-payment-filters")) || {};
  } catch {
    return {};
  }
}

function paymentFilterCell(key, value, values) {
  const datalist = `paymentFilterOptions-${key}`;
  return `<th><input class="header-filter" data-payment-filter="${key}" list="${datalist}" value="${escapeAttr(value || "")}" placeholder="Search"><datalist id="${datalist}">${values.map((item) => `<option value="${escapeAttr(item)}"></option>`).join("")}</datalist></th>`;
}

function paymentField(payment, key) {
  const job = byId(state.jobCards, payment.jobId) || {};
  const customer = byId(state.customers, job.customerId) || {};
  const fields = {
    date: formatDate(payment.date),
    ref: payment.ref || "",
    customer: customer.name || "",
    vehicle: customer.vehicle || "",
    job: job.ref || "",
    method: payment.method || "",
    amount: formatMoney(paymentAmount(payment)),
    comment: payment.comment || payment.attachmentName || ""
  };
  return fields[key] || "";
}

function uniquePaymentValues(key) {
  return [...new Set(state.payments.map((payment) => paymentField(payment, key)).filter(Boolean))].sort();
}

function filteredPayments(filters) {
  const entries = Object.entries(filters || {}).filter(([, value]) => String(value || "").trim());
  if (!entries.length) return state.payments;
  return state.payments.filter((payment) => {
    return entries.every(([key, value]) => paymentField(payment, key).toLowerCase().includes(String(value).toLowerCase()));
  });
}

function openPaymentForm(id = "") {
  const payableJobs = state.jobCards.filter((job) => outstandingForJob(job.id, id) > 0 || byId(state.payments, id)?.jobId === job.id);
  const payment = byId(state.payments, id) || { date: today(), jobId: payableJobs[0]?.id || "", method: "Cash", comment: "", attachmentName: "", items: [] };
  openModal(`
    <h2>${id ? "Edit" : "Record"} Payment</h2>
    <form id="paymentForm" class="stack">
      <div class="form-grid">
        <label>Date<input type="date" name="date" value="${payment.date}" required></label>
        <label>Job Card<select name="jobId" id="paymentJob" required>${options(payableJobs, payment.jobId, (j) => `${j.ref} - outstanding ${formatMoney(outstandingForJob(j.id, id))}`)}</select></label>
        <label>Method<select name="method">${["Cash", "Mobile Money", "Bank"].map((m) => `<option ${payment.method === m ? "selected" : ""}>${m}</option>`).join("")}</select></label>
        <label class="wide">SMS / Bank Comment<textarea name="comment">${escapeHtml(payment.comment || "")}</textarea></label>
        <label class="wide">Upload Screenshot<input type="file" id="paymentFile" accept="image/*"></label>
      </div>
      <div class="panel"><h3>Outstanding Bill Lines</h3><div id="paymentRows" class="stack"></div><p id="paymentSummary" class="muted"></p></div>
      <div class="actions"><button class="primary">Save Payment</button></div>
    </form>`);
  const rows = document.querySelector("#paymentRows");
  const jobInput = document.querySelector("#paymentJob");
  const renderRows = () => {
    const job = byId(state.jobCards, jobInput.value);
    const outstandingLines = job ? outstandingBillLines(job, id) : [];
    rows.innerHTML = job && outstandingLines.length ? outstandingLines.map((line) => {
      const existing = payment.items.find((x) => (x.lineId || x.jobItemId) === line.id) || {};
      return `<div class="payment-row" data-id="${line.id}">
        <label>Bill Line<input value="${escapeAttr(`${line.type}: ${line.label}`)}" disabled></label>
        <label>Outstanding<input value="${formatMoney(line.outstanding)}" disabled></label>
        <label>Attendant<select name="attendantId"><option value="">N/A</option>${options(state.employees, existing.attendantId || line.attendantId)}</select></label>
        <label>Paid Amount<input name="amount" value="${existing.amount || ""}" data-max="${line.outstanding}" placeholder="0.00"></label>
        <button type="button" class="ghost icon" onclick="this.closest('.payment-row').querySelector('[name=amount]').value='${line.outstanding}'">=</button>
      </div>`;
    }).join("") : '<div class="empty">No outstanding bill lines found. Fully paid bills cannot receive another payment.</div>';
    updatePaymentSummary();
    rows.querySelectorAll("[name=amount]").forEach((input) => input.addEventListener("input", updatePaymentSummary));
  };
  const updatePaymentSummary = () => {
    const total = Array.from(rows.querySelectorAll("[name=amount]")).reduce((sum, input) => sum + parseMoney(input.value), 0);
    const job = byId(state.jobCards, jobInput.value);
    const billed = job ? jobTotal(job) : 0;
    const alreadyPaid = job ? paidForJobExcept(job.id, id) : 0;
    document.querySelector("#paymentSummary").textContent = `This payment: ${formatMoney(total)}. Bill outstanding after save: ${formatMoney(Math.max(0, billed - alreadyPaid - total))}.`;
  };
  jobInput.addEventListener("change", renderRows);
  renderRows();
  document.querySelector("#paymentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.target);
    const file = document.querySelector("#paymentFile").files[0];
    const job = byId(state.jobCards, data.jobId);
    if (!job || outstandingForJob(job.id, id) <= 0) return toast("This bill is already fully paid");
    const items = Array.from(rows.querySelectorAll(".payment-row")).map((row) => ({
      lineId: row.dataset.id,
      jobItemId: row.dataset.id,
      attendantId: row.querySelector("[name=attendantId]").value,
      amount: parseMoney(row.querySelector("[name=amount]").value)
    })).filter((item) => item.amount > 0);
    if (!items.length) return toast("Enter a paid amount");
    const overpaid = Array.from(rows.querySelectorAll(".payment-row")).some((row) => {
      const input = row.querySelector("[name=amount]");
      return parseMoney(input.value) > parseMoney(input.dataset.max);
    });
    if (overpaid) return toast("Payment cannot exceed the outstanding amount");
    const payload = { ...data, items, ref: payment.ref || nextReceiptRef(), attachmentName: file?.name || payment.attachmentName || "" };
    if (id) Object.assign(payment, payload);
    else state.payments.push({ id: uid(), ...payload });
    commit("Payment saved");
  });
}

function receiptMarkup(payment) {
  const job = byId(state.jobCards, payment.jobId) || {};
  const customer = byId(state.customers, job.customerId) || {};
  const settings = state.settings || seed.settings;
  const receiptNo = payment.ref || nextReceiptRef();
  return `
    <div class="bill-paper ${pageSetupClass("receipt")}">
      <div class="bill-head">
        <div>
          <h2>${escapeHtml(settings.businessName || "VASMA System")}</h2>
          <p>${escapeHtml(settings.location || "")}</p>
          <p>${escapeHtml(settings.mobile || "")}</p>
        </div>
        <div>
          <h3>Receipt ${receiptNo}</h3>
          <p>Date: ${formatDate(payment.date)}</p>
        </div>
      </div>
      <div class="grid two">
        <div><h3>Received From</h3><p>${escapeHtml(customer.name || "")}</p><p>${escapeHtml(customer.contact || "")} ${escapeHtml(customer.mobile || "")}</p></div>
        <div><h3>Vehicle / Bill</h3><p>${escapeHtml(customer.vehicle || "")} ${escapeHtml(customer.vehicleModel || "")}</p><p>${escapeHtml(job.ref || "")}</p></div>
      </div>
      <table>
        <thead><tr><th>Payment Method</th><th>Reference / Comment</th><th>Amount Paid</th></tr></thead>
        <tbody>
          <tr><td>${escapeHtml(payment.method || "")}</td><td>${escapeHtml(payment.comment || payment.attachmentName || "")}</td><td><strong>${formatMoney(paymentAmount(payment))}</strong></td></tr>
        </tbody>
      </table>
      <h3 style="margin-top:16px">Paid Lines</h3>
      <table>
        <thead><tr><th>Bill Line</th><th>Attendant</th><th>Paid Amount</th></tr></thead>
        <tbody>${payment.items.map((item) => `<tr><td>${escapeHtml(receiptLineLabel(job, item))}</td><td>${employeeName(item.attendantId)}</td><td>${formatMoney(item.amount)}</td></tr>`).join("")}</tbody>
      </table>
      <table style="margin-top:16px"><tbody>
        <tr><th>Bill Amount</th><td>${formatMoney(jobTotal(job))}</td></tr>
        <tr><th>Total Paid To Date</th><td>${formatMoney(paidForJob(job.id))}</td></tr>
        <tr><th>Outstanding</th><td>${formatMoney(Math.max(0, jobTotal(job) - paidForJob(job.id)))}</td></tr>
      </tbody></table>
      ${qrMarkup(receiptQrData(payment), "Scan to view bill details")}
      <p style="margin-top:18px">Prepared by ${escapeHtml(profileName())}</p>
    </div>`;
}

function receiptLineLabel(job, paymentItem) {
  const line = billLines(job).find((entry) => entry.id === (paymentItem.lineId || paymentItem.jobItemId));
  return line ? `${line.type}: ${line.label}` : "Bill line";
}

function viewReceipt(paymentId) {
  const payment = byId(state.payments, paymentId);
  if (!payment) return toast("Receipt not found");
  openModal(`<div class="actions no-print" style="margin-bottom:12px"><button class="secondary" onclick="printReceipt('${payment.id}')">Print Preview</button></div>${receiptMarkup(payment)}`);
}

function printReceipt(paymentId) {
  const payment = byId(state.payments, paymentId);
  if (!payment) return toast("Receipt not found");
  openPrintPreview(`Receipt ${payment.ref || ""}`, receiptMarkup(payment));
}

function renderExpenses() {
  views.expenses.innerHTML = `
    <div class="toolbar"><h2>Expense Module</h2><button class="primary" onclick="openExpenseForm()">Add Expense</button></div>
    <div class="panel table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Expense Item</th><th>Amount</th><th>Comment</th></tr></thead>
        <tbody>${state.expenses.map((expense) => `<tr><td>${formatDate(expense.date)}</td><td>${expense.itemName}</td><td>${formatMoney(expense.amount)}</td><td>${escapeHtml(expense.comment || "")}</td></tr>`).join("") || emptyRow(4)}</tbody>
      </table>
    </div>`;
}

function openExpenseForm(id = "") {
  const expense = byId(state.expenses, id) || { date: today(), itemName: state.expenseItems[0]?.name || "", amount: "", comment: "" };
  openModal(`
    <h2>${id ? "Edit" : "Add"} Expense</h2>
    <form id="expenseForm" class="form-grid">
      <label>Date<input type="date" name="date" value="${expense.date}" required></label>
      <label>Expense Item<select name="itemName" id="expenseItem">${state.expenseItems.map((item) => `<option ${expense.itemName === item.name ? "selected" : ""}>${item.name}</option>`).join("")}<option value="__new">Add new...</option></select></label>
      <label>Amount<input name="amount" value="${expense.amount}" required></label>
      <label class="wide">Comment<textarea name="comment">${escapeHtml(expense.comment || "")}</textarea></label>
      <div class="wide actions"><button class="primary">Save Expense</button></div>
    </form>`);
  document.querySelector("#expenseItem").addEventListener("change", (event) => {
    if (event.target.value === "__new") {
      const name = prompt("New expense item name");
      if (name) {
        state.expenseItems.push({ id: uid(), name });
        event.target.insertAdjacentHTML("beforeend", `<option selected>${escapeHtml(name)}</option>`);
      }
    }
  });
  document.querySelector("#expenseForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.target);
    data.amount = parseMoney(data.amount);
    if (id) Object.assign(expense, data);
    else state.expenses.push({ id: uid(), ...data });
    commit("Expense saved");
  });
}

function renderCommissions() {
  views.commissions.innerHTML = `
    <div class="toolbar"><h2>Commission Module</h2><button class="primary" onclick="openCommissionForm()">Allocate Commission</button></div>
    <div class="panel table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Job Card</th><th>Attendant</th><th>Type</th><th>Commission</th></tr></thead>
        <tbody>${state.commissions.map((entry) => `<tr><td>${formatDate(entry.date)}</td><td>${byId(state.jobCards, entry.jobId)?.ref || ""}</td><td>${employeeName(entry.attendantId)}</td><td>${entry.type}</td><td>${formatMoney(entry.amount)}</td></tr>`).join("") || emptyRow(5)}</tbody>
      </table>
    </div>`;
}

function openCommissionForm(id = "") {
  const entry = byId(state.commissions, id) || { date: today(), jobId: state.jobCards[0]?.id || "", attendantId: state.employees[0]?.id || "", type: "Amount", rate: "", amount: "" };
  openModal(`
    <h2>${id ? "Edit" : "Allocate"} Commission</h2>
    <form id="commissionForm" class="stack">
      <div class="form-grid">
        <label>Date<input type="date" name="date" value="${entry.date}" required></label>
        <label>Job Card<select name="jobId" id="commissionJob" required>${options(state.jobCards, entry.jobId, (j) => `${j.ref} - paid ${formatMoney(paidForJob(j.id))}`)}</select></label>
        <label>Attendant<select name="attendantId" required>${options(state.employees, entry.attendantId)}</select></label>
        <label>Type<select name="type" id="commissionType"><option ${entry.type === "Amount" ? "selected" : ""}>Amount</option><option ${entry.type === "Percent" ? "selected" : ""}>Percent</option></select></label>
        <label>Rate / Amount<input name="rate" id="commissionRate" value="${entry.rate || entry.amount || ""}" required></label>
        <label>Commission Amount<input name="amount" id="commissionAmount" value="${entry.amount || ""}" required></label>
      </div>
      <div class="panel" id="commissionSummary"></div>
      <div class="actions"><button class="primary">Save Commission</button></div>
    </form>`);
  const update = () => {
    const job = byId(state.jobCards, document.querySelector("#commissionJob").value);
    const paid = paidForJob(job?.id);
    const rate = parseMoney(document.querySelector("#commissionRate").value);
    const type = document.querySelector("#commissionType").value;
    const amount = type === "Percent" ? paid * (rate / 100) : rate;
    document.querySelector("#commissionAmount").value = amount ? amount.toFixed(2) : "";
    document.querySelector("#commissionSummary").innerHTML = job ? `<h3>${job.ref}</h3>${jobItemsTable(job)}<p>Paid: <strong>${formatMoney(paid)}</strong>. Commission deducts from paid amount.</p>` : '<div class="empty">Create a job card and payment first.</div>';
  };
  ["commissionJob", "commissionType", "commissionRate"].forEach((id) => document.querySelector(`#${id}`).addEventListener("input", update));
  update();
  document.querySelector("#commissionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.target);
    data.amount = parseMoney(data.amount);
    if (id) Object.assign(entry, data);
    else state.commissions.push({ id: uid(), ...data });
    commit("Commission saved");
  });
}

function adminRecordTypes() {
  return [
    { key: "customers", label: "Customers", items: state.customers, edit: openCustomerForm, del: (id) => deleteRecord("customers", id), labelFn: (c) => `${c.name} - ${c.vehicle}` },
    { key: "jobCards", label: "Job Cards", items: state.jobCards, edit: openJobForm, del: deleteJob, labelFn: (j) => `${j.ref} - ${customerName(j.customerId)}` },
    { key: "payments", label: "Payments", items: state.payments, edit: openPaymentForm, del: (id) => deleteRecord("payments", id), labelFn: (p) => `${p.ref || ""} - ${formatDate(p.date)} - ${byId(state.jobCards, p.jobId)?.ref || ""} - ${formatMoney(p.items.reduce((sum, item) => sum + parseMoney(item.amount), 0))}` },
    { key: "expenses", label: "Expenses", items: state.expenses, edit: openExpenseForm, del: (id) => deleteRecord("expenses", id), labelFn: (e) => `${formatDate(e.date)} - ${e.itemName} - ${formatMoney(e.amount)}` },
    { key: "commissions", label: "Commissions", items: state.commissions, edit: openCommissionForm, del: (id) => deleteRecord("commissions", id), labelFn: (c) => `${formatDate(c.date)} - ${employeeName(c.attendantId)} - ${formatMoney(c.amount)}` }
  ];
}

function renderAdminEdit() {
  const types = adminRecordTypes();
  const selectedType = localStorage.getItem("vasma-admin-type") || "jobCards";
  const config = types.find((type) => type.key === selectedType) || types[0];
  const selectedRecord = localStorage.getItem(`vasma-admin-record-${config.key}`) || config.items[0]?.id || "";
  views.admin.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Admin Edit</h2>
        <p class="muted">Edit and delete transactional records from one controlled admin page.</p>
      </div>
    </div>
    <div class="panel master-select-row">
      <label>Record Type
        <select id="adminRecordType">
          ${types.map((type) => `<option value="${type.key}" ${type.key === config.key ? "selected" : ""}>${type.label}</option>`).join("")}
        </select>
      </label>
      <label>Record
        <select id="adminRecordId">
          ${config.items.map((item) => `<option value="${item.id}" ${item.id === selectedRecord ? "selected" : ""}>${escapeHtml(config.labelFn(item))}</option>`).join("")}
        </select>
      </label>
      <button class="secondary" id="adminEditButton" ${config.items.length ? "" : "disabled"}>Edit</button>
      <button class="danger" id="adminDeleteButton" ${config.items.length ? "" : "disabled"}>Delete</button>
    </div>
    <div class="panel table-wrap" style="margin-top:14px">
      ${adminPreviewTable(config)}
    </div>`;
  document.querySelector("#adminRecordType").addEventListener("change", (event) => {
    localStorage.setItem("vasma-admin-type", event.target.value);
    renderAdminEdit();
  });
  document.querySelector("#adminRecordId").addEventListener("change", (event) => {
    localStorage.setItem(`vasma-admin-record-${config.key}`, event.target.value);
  });
  document.querySelector("#adminEditButton").addEventListener("click", () => {
    const id = document.querySelector("#adminRecordId").value;
    if (!id) return toast("Select a record");
    config.edit(id);
  });
  document.querySelector("#adminDeleteButton").addEventListener("click", () => {
    const id = document.querySelector("#adminRecordId").value;
    if (!id) return toast("Select a record");
    config.del(id);
    localStorage.removeItem(`vasma-admin-record-${config.key}`);
    renderAdminEdit();
  });
}

function adminPreviewTable(config) {
  if (!config.items.length) return '<div class="empty">No records available for this type.</div>';
  return `<table>
    <thead><tr><th>Record</th><th>Details</th></tr></thead>
    <tbody>${config.items.map((item) => `<tr><td><strong>${escapeHtml(config.labelFn(item))}</strong></td><td>${adminRecordDetails(config.key, item)}</td></tr>`).join("")}</tbody>
  </table>`;
}

function adminRecordDetails(type, item) {
  if (type === "customers") return `${escapeHtml(item.contact || "")} ${escapeHtml(item.mobile || "")}`;
  if (type === "jobCards") return `Date: ${formatDate(item.date)} | Total: ${formatMoney(jobTotal(item))} | Paid: ${formatMoney(paidForJob(item.id))}`;
  if (type === "payments") return `Method: ${escapeHtml(item.method || "")} | Comment: ${escapeHtml(item.comment || item.attachmentName || "")}`;
  if (type === "expenses") return `Comment: ${escapeHtml(item.comment || "")}`;
  if (type === "commissions") return `Job: ${byId(state.jobCards, item.jobId)?.ref || ""} | Type: ${escapeHtml(item.type || "")}`;
  return "";
}

function renderMaster() {
  const selectedEmployee = localStorage.getItem("vasma-master-employee") || state.employees[0]?.id || "";
  const selectedPackage = localStorage.getItem("vasma-master-package") || state.packages[0]?.id || "";
  const selectedCategory = localStorage.getItem("vasma-master-category") || state.categories[0]?.id || "";
  const selectedItem = localStorage.getItem("vasma-master-item") || byId(state.categories, selectedCategory)?.items[0]?.id || "";
  const selectedExpense = localStorage.getItem("vasma-master-expense") || state.expenseItems[0]?.id || "";
  const selectedAction = localStorage.getItem("vasma-master-action") || state.actions[0]?.id || "";
  views.master.innerHTML = `
    <div class="grid two">
      <div class="panel">
        <div class="toolbar"><h2>Employees</h2><button class="primary" onclick="openEmployeeForm()">Add Employee</button></div>
        ${masterSelect("employee", state.employees, selectedEmployee, "Select employee", "openEmployeeForm", "deleteRecord('employees', selectedMaster('employee'))")}
      </div>
      <div class="panel">
        <div class="toolbar"><h2>Car Wash Packages</h2><button class="primary" onclick="openPackageForm()">Add Package</button></div>
        ${masterSelect("package", state.packages, selectedPackage, "Select package", "openPackageForm", "deleteRecord('packages', selectedMaster('package'))")}
      </div>
      <div class="panel">
        <div class="toolbar"><h2>Service Categories and Items</h2><button class="primary" onclick="openCategoryForm()">Add Category</button></div>
        ${masterSelect("category", state.categories, selectedCategory, "Select category", "openCategoryForm", "deleteCategory(selectedMaster('category'))")}
        <div class="toolbar" style="margin-top:14px"><h3>Service Items</h3><button class="primary" onclick="openItemForm(selectedMaster('category'))">Add Item</button></div>
        ${masterSelect("item", byId(state.categories, selectedCategory)?.items || [], selectedItem, "Select service item", "openSelectedItemForm", "deleteSelectedItem()")}
      </div>
      <div class="panel">
        <div class="toolbar"><h2>Expense Items</h2><button class="primary" onclick="openExpenseItemForm()">Add Expense Item</button></div>
        ${masterSelect("expense", state.expenseItems, selectedExpense, "Select expense item", "openExpenseItemForm", "deleteRecord('expenseItems', selectedMaster('expense'))")}
      </div>
      <div class="panel">
        <div class="toolbar"><h2>Actions</h2><button class="primary" onclick="openActionForm()">Add Action</button></div>
        ${masterSelect("action", state.actions, selectedAction, "Select action", "openActionForm", "deleteRecord('actions', selectedMaster('action'))")}
      </div>
    </div>`;
  document.querySelectorAll("[data-master-select]").forEach((select) => {
    select.addEventListener("change", () => {
      localStorage.setItem(`vasma-master-${select.dataset.masterSelect}`, select.value);
      if (select.dataset.masterSelect === "category") localStorage.removeItem("vasma-master-item");
      renderMaster();
    });
  });
}

function masterSelect(key, items, selected, label, editFn, deleteCall) {
  return `<div class="master-select-row">
    <label>${label}<select data-master-select="${key}">${items.map((item) => `<option value="${item.id}" ${item.id === selected ? "selected" : ""}>${escapeHtml(item.name)}${"active" in item && item.active === false ? " (Inactive)" : ""}</option>`).join("")}</select></label>
    ${items.length && "active" in items[0] ? `<div>${activePill(byId(items, selected)?.active)}</div>` : ""}
    <button class="secondary" onclick="${editFn}(selectedMaster('${key}'))" ${items.length ? "" : "disabled"}>Edit</button>
    <button class="danger" onclick="${deleteCall}" ${items.length ? "" : "disabled"}>Delete</button>
  </div>`;
}

function selectedMaster(key) {
  return document.querySelector(`[data-master-select="${key}"]`)?.value || "";
}

function openSelectedItemForm() {
  openItemForm(selectedMaster("category"), selectedMaster("item"));
}

function deleteSelectedItem() {
  deleteItem(selectedMaster("category"), selectedMaster("item"));
}

function openEmployeeForm(id = "") {
  const employee = byId(state.employees, id) || { name: "", mobile: "", role: "Attendant" };
  openSimpleForm("employeeForm", id ? "Edit Employee" : "Add Employee", [
    ["name", "Name", employee.name],
    ["mobile", "Mobile", employee.mobile],
    ["role", "Role", employee.role]
  ], (data) => {
    if (id) Object.assign(employee, data);
    else state.employees.push({ id: uid(), ...data });
    commit("Employee saved");
  });
}

function openPackageForm(id = "") {
  const pack = byId(state.packages, id) || { name: "", services: "" };
  openSimpleForm("packageForm", id ? "Edit Package" : "Add Package", [
    ["name", "Package Name", pack.name],
    ["services", "Huduma Zinazojumuishwa", pack.services]
  ], (data) => {
    if (id) Object.assign(pack, data);
    else state.packages.push({ id: uid(), ...data });
    commit("Package saved");
  });
}

function openCategoryForm(id = "") {
  const category = byId(state.categories, id) || { name: "", active: true };
  openModal(`
    <h2>${id ? "Edit Category" : "Add Category"}</h2>
    <form id="categoryForm" class="form-grid">
      <label>Category Name<input name="name" value="${escapeAttr(category.name)}" required></label>
      <label>Status<select name="active"><option value="true" ${category.active !== false ? "selected" : ""}>Active</option><option value="false" ${category.active === false ? "selected" : ""}>Inactive</option></select></label>
      <div class="wide actions"><button class="primary">Save</button></div>
    </form>`);
  document.querySelector("#categoryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.target);
    data.active = data.active === "true";
    if (id) Object.assign(category, data);
    else state.categories.push({ id: uid(), name: data.name, active: data.active, items: [] });
    commit("Category saved");
  });
}

function openItemForm(categoryId, itemId = "") {
  const category = byId(state.categories, categoryId);
  if (!category) return toast("Select a category first");
  const item = byId(category.items, itemId) || { name: "" };
  openSimpleForm("itemForm", itemId ? "Edit Item" : "Add Item", [["name", "Item Name", item.name]], (data) => {
    if (itemId) Object.assign(item, data);
    else category.items.push({ id: uid(), ...data });
    commit("Service item saved");
  });
}

function openExpenseItemForm(id = "") {
  const item = byId(state.expenseItems, id) || { name: "" };
  openSimpleForm("expenseItemForm", id ? "Edit Expense Item" : "Add Expense Item", [["name", "Expense Item", item.name]], (data) => {
    if (id) Object.assign(item, data);
    else state.expenseItems.push({ id: uid(), ...data });
    commit("Expense item saved");
  });
}

function openActionForm(id = "") {
  const action = byId(state.actions, id) || { name: "" };
  openSimpleForm("actionForm", id ? "Edit Action" : "Add Action", [["name", "Action", action.name]], (data) => {
    if (id) Object.assign(action, data);
    else state.actions.push({ id: uid(), ...data });
    commit("Action saved");
  });
}

function renderReports() {
  const filters = getReportFilters();
  const jobs = filterByDate(state.jobCards, filters);
  const rows = reportRows(jobs);
  views.reports.innerHTML = `
    <div class="toolbar">
      <div><h2>Reports</h2><p class="muted">Professional table reports with PDF print and Excel-compatible CSV export.</p></div>
      <div class="actions"><button class="secondary" onclick="previewReportPrint()">Print Preview</button><button class="secondary" onclick="exportReportCsv()">Export Excel</button></div>
    </div>
    ${filterMarkup(filters, "reports")}
    <div class="panel table-wrap">
      <h3 class="print-title">VASMA Report</h3>
      <p class="report-range"><strong>${formatDateRange(filters.from, filters.to)}</strong></p>
      <label style="max-width:340px">Report Type<select id="reportType">${["Outstanding Report", "Income Statement per Job Card", "Commission Report", "Payment Report"].map((type) => `<option ${filters.type === type ? "selected" : ""}>${type}</option>`).join("")}</select></label>
      <div id="reportTable" style="margin-top:14px">${buildReportTable(filters.type, rows)}</div>
      <p class="muted" style="margin-top:14px">Prepared by ${escapeHtml(profileName())}</p>
    </div>`;
  wireFilters("reports");
  document.querySelector("#reportType").addEventListener("change", (event) => {
    localStorage.setItem("vasma-report-type", event.target.value);
    renderReports();
  });
}

function getReportFilters() {
  return {
    type: localStorage.getItem("vasma-report-type") || "Outstanding Report",
    from: localStorage.getItem("vasma-date-from") || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    to: localStorage.getItem("vasma-date-to") || today()
  };
}

function filterMarkup(filters, scope) {
  return `<div class="panel filters" style="margin-bottom:14px">
    <div class="wide report-range"><strong>${formatDateRange(filters.from, filters.to)}</strong></div>
    <label>From<input type="date" id="${scope}DateFrom" value="${filters.from}"></label>
    <label>To<input type="date" id="${scope}DateTo" value="${filters.to}"></label>
    <button class="secondary" id="${scope}ThisWeek">This Week</button>
    <button class="secondary" id="${scope}ThisMonth">This Month</button>
  </div>`;
}

function wireFilters(scope) {
  document.querySelector(`#${scope}DateFrom`).addEventListener("change", (e) => { localStorage.setItem("vasma-date-from", e.target.value); renderAll(); });
  document.querySelector(`#${scope}DateTo`).addEventListener("change", (e) => { localStorage.setItem("vasma-date-to", e.target.value); renderAll(); });
  document.querySelector(`#${scope}ThisWeek`).addEventListener("click", () => setRange(7));
  document.querySelector(`#${scope}ThisMonth`).addEventListener("click", () => {
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    localStorage.setItem("vasma-date-from", start);
    localStorage.setItem("vasma-date-to", today());
    renderAll();
  });
}

function setRange(days) {
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  localStorage.setItem("vasma-date-from", start.toISOString().slice(0, 10));
  localStorage.setItem("vasma-date-to", today());
  renderAll();
}

function filterByDate(items, filters) {
  return items.filter((item) => item.date >= filters.from && item.date <= filters.to);
}

function reportRows(jobs) {
  return jobs.map((job) => {
    const customer = byId(state.customers, job.customerId) || {};
    const billed = jobTotal(job);
    const paid = paidForJob(job.id);
    return { job, customer, billed, paid, outstanding: billed - paid, commission: commissionForJob(job.id), expenses: expensesForDate(job.date) };
  });
}

function buildReportTable(type, rows) {
  if (type === "Payment Report") {
    const filters = getReportFilters();
    const payments = filterByDate(state.payments, filters);
    const total = payments.reduce((sum, payment) => sum + paymentAmount(payment), 0);
    return `<table><thead><tr><th>Date</th><th>Receipt Ref</th><th>Customer</th><th>Vehicle #</th><th>Job Card</th><th>Method</th><th>Amount</th><th>Reference / Comment</th></tr></thead><tbody>${payments.map((payment) => {
      const job = byId(state.jobCards, payment.jobId) || {};
      const customer = byId(state.customers, job.customerId) || {};
      return `<tr><td>${formatDate(payment.date)}</td><td>${escapeHtml(payment.ref || "")}</td><td>${escapeHtml(customer.name || "")}</td><td>${escapeHtml(customer.vehicle || "")}</td><td>${escapeHtml(job.ref || "")}</td><td>${escapeHtml(payment.method || "")}</td><td>${formatMoney(paymentAmount(payment))}</td><td>${escapeHtml(payment.comment || payment.attachmentName || "")}</td></tr>`;
    }).join("")}<tr><th colspan="6">Total</th><th>${formatMoney(total)}</th><th></th></tr></tbody></table>`;
  }
  if (type === "Commission Report") {
    const filters = getReportFilters();
    const entries = filterByDate(state.commissions, filters);
    const total = entries.reduce((sum, entry) => sum + parseMoney(entry.amount), 0);
    return `<table><thead><tr><th>Date</th><th>Job card ref</th><th>Attendant Name</th><th>Paid Commission Amount</th></tr></thead><tbody>${entries.map((entry) => `<tr><td>${formatDate(entry.date)}</td><td>${byId(state.jobCards, entry.jobId)?.ref || ""}</td><td>${employeeName(entry.attendantId)}</td><td>${formatMoney(entry.amount)}</td></tr>`).join("")}${totalRow(3, total)}</tbody></table>`;
  }
  if (type === "Income Statement per Job Card") {
    const totals = rows.reduce((sum, row) => {
      sum.paid += row.paid;
      sum.commission += row.commission;
      sum.expenses += row.expenses;
      sum.balance += row.paid - row.commission - row.expenses;
      return sum;
    }, { paid: 0, commission: 0, expenses: 0, balance: 0 });
    return `<table><thead><tr><th>Date</th><th>Job card ref</th><th>Vehicle #</th><th>Service category</th><th>Paid Amount</th><th>Commission</th><th>Expenses</th><th>Balance</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${formatDate(r.job.date)}</td><td>${r.job.ref}</td><td>${escapeHtml(r.customer.vehicle || "")}</td><td>${jobCategorySummary(r.job)}</td><td>${formatMoney(r.paid)}</td><td>${formatMoney(r.commission)}</td><td>${formatMoney(r.expenses)}</td><td>${formatMoney(r.paid - r.commission - r.expenses)}</td></tr>`).join("")}<tr><th colspan="4">Total</th><th>${formatMoney(totals.paid)}</th><th>${formatMoney(totals.commission)}</th><th>${formatMoney(totals.expenses)}</th><th>${formatMoney(totals.balance)}</th></tr></tbody></table>`;
  }
  return `<table><thead><tr><th>Date</th><th>Job card ref</th><th>Vehicle #</th><th>Contact person</th><th>Service category</th><th>Job Card Amount</th><th>Paid Amount</th><th>Outstanding</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${formatDate(r.job.date)}</td><td>${r.job.ref}</td><td>${escapeHtml(r.customer.vehicle || "")}</td><td>${escapeHtml(r.customer.contact || "")}</td><td>${jobCategorySummary(r.job)}</td><td>${formatMoney(r.billed)}</td><td>${formatMoney(r.paid)}</td><td>${formatMoney(r.outstanding)}</td></tr>`).join("")}${summaryRow(rows, ["billed", "paid", "outstanding"])}</tbody></table>`;
}

function renderAnalysis() {
  const filters = getReportFilters();
  const jobs = filterByDate(state.jobCards, filters);
  const view = localStorage.getItem("vasma-analysis-view") || "Current View";
  const panels = [
    ["Service Category Income", rankJobItems(jobs, (job, item) => categoryName(item.categoryId || job.categoryId))],
    ["Service Item Income", rankJobItems(jobs)],
    ["Attendant Income", rankCommissionsByAttendant(filterByDate(state.commissions, filters))],
    ["Date Income", rank(jobs, (job) => formatDate(job.date), jobTotal)]
  ];
  views.analysis.innerHTML = `
    <div class="toolbar"><div><h2>Analysis</h2><p class="muted">Rankings and charts from high income to low for the selected period.</p></div></div>
    ${filterMarkup(filters, "analysis")}
    <div class="panel" style="margin-bottom:14px">
      <label style="max-width:320px">Analysis View<select id="analysisView">${["Current View", "Bar Chart", "Pie Chart", "Graph"].map((item) => `<option ${view === item ? "selected" : ""}>${item}</option>`).join("")}</select></label>
    </div>
    <div class="grid two">
      ${panels.map(([title, rows]) => analysisPanel(title, rows, view)).join("")}
    </div>`;
  wireFilters("analysis");
  document.querySelector("#analysisView").addEventListener("change", (event) => {
    localStorage.setItem("vasma-analysis-view", event.target.value);
    renderAnalysis();
  });
}

function renderLicense() {
  const screen = localStorage.getItem("vasma-license-screen") || "status";
  const license = licenseStore();
  const status = licenseStatus(license);
  views.license.innerHTML = `
    <div class="toolbar">
      <div><h2>Offline License Activation</h2><p class="muted">Generate a request code, send it to Admin, then activate this device offline.</p></div>
    </div>
    <div class="license-tabs">
      ${licenseTab("status", "License Status", screen)}
      ${licenseTab("request", "Generate Request Code", screen)}
      ${licenseTab("activate", "Enter Activation Code", screen)}
      ${licenseTab("records", "License Records", screen)}
    </div>
    ${licenseScreenMarkup(screen, license, status)}`;
  document.querySelector("#licenseScreenSelect")?.addEventListener("change", (event) => {
    localStorage.setItem("vasma-license-screen", event.target.value);
    renderLicense();
  });
  document.querySelectorAll("[data-license-screen]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem("vasma-license-screen", button.dataset.licenseScreen);
      renderLicense();
    });
  });
  document.querySelector("#generateRequestCode")?.addEventListener("click", generateRequestCode);
  document.querySelector("#copyRequestCode")?.addEventListener("click", () => copyField("requestCodeOutput"));
  document.querySelector("#copyDeviceId")?.addEventListener("click", () => copyText(deviceId()));
  document.querySelector("#activationForm")?.addEventListener("submit", activateLicense);
  document.querySelector("#clearLicenseRecords")?.addEventListener("click", () => {
    if (!confirm("Clear local license records? Current activation will remain.")) return;
    const current = licenseStore();
    saveLicenseStore({ ...current, records: [] });
    renderLicense();
  });
}

function licenseTab(key, label, active) {
  return `<button type="button" class="settings-tab ${active === key ? "active" : ""}" data-license-screen="${key}">${label}</button>`;
}

function licenseScreenMarkup(screen, license, status) {
  const statusCards = `
    <div class="grid four" style="margin-bottom:14px">
      ${securityMetric("License", status.label, status.tone)}
      ${securityMetric("License Type", license.licenseType || "Not set", license.licenseType ? "good" : "warn")}
      ${securityMetric("Expiry Date", license.expiryDate ? formatDate(license.expiryDate) : "Not active", status.tone)}
      ${securityMetric("Device ID", shortDeviceId(), "good")}
    </div>`;
  if (screen === "request") return `${statusCards}
    <div class="panel stack">
      <h2>Generate Request Code Screen</h2>
      <div class="form-grid">
        <label>Requested License Type<select id="requestLicenseType">
          <option>Trial</option><option selected>Standard</option><option>Professional</option><option>Lifetime</option>
        </select></label>
        <label>Business Name<input id="requestBusinessName" value="${escapeAttr(state.settings?.businessName || "VASMA System")}"></label>
        <label>Device ID<input value="${escapeAttr(deviceId())}" readonly></label>
      </div>
      <div class="actions"><button type="button" class="primary" id="generateRequestCode">Generate Request Code</button><button type="button" class="secondary" id="copyDeviceId">Copy Device ID</button></div>
      <label>Request Code<textarea id="requestCodeOutput" readonly placeholder="Generated encrypted request code will appear here"></textarea></label>
      <p class="muted">Send this code to Admin. It is encrypted and cannot be read normally by the user.</p>
    </div>`;
  if (screen === "activate") return `${statusCards}
    <form id="activationForm" class="panel stack">
      <h2>Enter Activation Code Screen</h2>
      <label>Activation Code<textarea name="activationCode" required placeholder="Paste activation code from Admin"></textarea></label>
      <div class="actions"><button class="primary">Activate Offline</button></div>
      <p class="muted">Activation code must match this device ID and must be signed by Admin.</p>
    </form>`;
  if (screen === "records") {
    const rows = (license.records || []).map((record) => `<tr><td>${formatDate(record.date)}</td><td>${escapeHtml(record.action)}</td><td>${escapeHtml(record.licenseType || "")}</td><td>${formatDate(record.expiryDate || "")}</td><td>${escapeHtml(record.deviceId || "")}</td></tr>`).join("");
    return `${statusCards}<div class="panel table-wrap">
      <div class="toolbar"><h2>License Records Screen</h2><button class="secondary" id="clearLicenseRecords">Clear Records</button></div>
      <table><thead><tr><th>Date</th><th>Action</th><th>License Type</th><th>Expiry</th><th>Device ID</th></tr></thead><tbody>${rows || emptyRow(5)}</tbody></table>
    </div>`;
  }
  return `${statusCards}
    <div class="panel stack">
      <h2>License Status Screen</h2>
      <table><tbody>
        <tr><th>Status</th><td>${escapeHtml(status.label)}</td></tr>
        <tr><th>Business Name</th><td>${escapeHtml(license.businessName || state.settings?.businessName || "VASMA System")}</td></tr>
        <tr><th>Device ID</th><td>${escapeHtml(deviceId())}</td></tr>
        <tr><th>Installation Date</th><td>${formatDate(installDate())}</td></tr>
        <tr><th>Trial Period</th><td>${TRIAL_DAYS} days, ends ${formatDate(trialStatus().expiryDate)}</td></tr>
        <tr><th>Activation Date</th><td>${formatDate(license.activationDate || "")}</td></tr>
        <tr><th>Expiry Date</th><td>${formatDate(license.expiryDate || "")}</td></tr>
        <tr><th>App Version</th><td>${APP_VERSION}</td></tr>
      </tbody></table>
      <p class="muted">${escapeHtml(status.message)}</p>
    </div>`;
}

function licenseStatus(license = licenseStore()) {
  const trial = trialStatus();
  if (!license.activationCode && trial.active) return { label: `Trial - ${trial.daysRemaining} day(s) left`, tone: trial.daysRemaining <= 2 ? "warn" : "good", message: `Free trial is active until ${formatDate(trial.expiryDate)}. After ${TRIAL_DAYS} days, activation code will be required.` };
  if (!license.activationCode) return { label: "Trial ended", tone: "bad", message: "The 7-day trial has ended. Generate a request code and enter an activation code to continue." };
  if (licenseExpired(license)) return { label: "Expired", tone: "bad", message: "License has expired. Renew activation to continue transactional work." };
  const days = Math.ceil((new Date(`${license.expiryDate}T23:59:59`) - new Date()) / 86400000);
  return { label: "Active", tone: days <= 7 ? "warn" : "good", message: `License is active. ${Math.max(0, days)} day(s) remaining.` };
}

function licenseExpired(license = licenseStore()) {
  if (!license.activationCode) return !trialStatus().active;
  return Boolean(license.expiryDate && today() > license.expiryDate);
}

function trialStatus() {
  const start = installDate();
  const expiry = new Date(`${start}T00:00:00`);
  expiry.setDate(expiry.getDate() + TRIAL_DAYS - 1);
  const expiryDate = expiry.toISOString().slice(0, 10);
  const daysRemaining = Math.max(0, Math.ceil((new Date(`${expiryDate}T23:59:59`) - new Date()) / 86400000));
  return { startDate: start, expiryDate, active: today() <= expiryDate, daysRemaining };
}

function licenseStore() {
  try {
    const raw = localStorage.getItem(LICENSE_STORE_KEY);
    return raw ? JSON.parse(decodeLocalSecure(raw)) : { records: [] };
  } catch {
    return { records: [] };
  }
}

function saveLicenseStore(store) {
  localStorage.setItem(LICENSE_STORE_KEY, encodeLocalSecure(JSON.stringify({ records: [], ...store })));
}

function deviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `DEV-${cryptoRandomId()}-${Date.now().toString(36).toUpperCase()}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function shortDeviceId() {
  const id = deviceId();
  return `${id.slice(0, 8)}...${id.slice(-6)}`;
}

function installDate() {
  let value = localStorage.getItem(INSTALL_DATE_KEY);
  if (!value) {
    value = today();
    localStorage.setItem(INSTALL_DATE_KEY, value);
  }
  return value;
}

function cryptoRandomId() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

async function generateRequestCode() {
  const payload = {
    appName: DEFAULT_APP_NAME,
    businessName: document.querySelector("#requestBusinessName")?.value || state.settings?.businessName || "VASMA System",
    deviceId: deviceId(),
    installationDate: installDate(),
    appVersion: APP_VERSION,
    requestedLicenseType: document.querySelector("#requestLicenseType")?.value || "Standard",
    requestedAt: new Date().toISOString()
  };
  const code = await encryptRequestPayload(payload);
  document.querySelector("#requestCodeOutput").value = code;
}

async function activateLicense(event) {
  event.preventDefault();
  const code = formData(event.target).activationCode.trim();
  try {
    const payload = await verifyActivationCode(code);
    if (payload.appName !== DEFAULT_APP_NAME) throw new Error("Activation code is for another app.");
    if (payload.deviceId !== deviceId()) throw new Error("Activation code is for another device.");
    if (payload.businessName && payload.businessName !== state.settings.businessName) state.settings.businessName = payload.businessName;
    const current = licenseStore();
    const next = {
      activationCode: code,
      status: "Active",
      businessName: payload.businessName,
      deviceId: payload.deviceId,
      licenseType: payload.licenseType,
      activationDate: payload.activationDate,
      expiryDate: payload.expiryDate,
      appVersion: payload.appVersion,
      records: [...(current.records || []), { date: today(), action: "Activated", licenseType: payload.licenseType, expiryDate: payload.expiryDate, deviceId: payload.deviceId }]
    };
    saveLicenseStore(next);
    save();
    applyBrand();
    localStorage.setItem("vasma-license-screen", "status");
    renderAll();
    toast("License activated successfully");
  } catch (error) {
    toast(error.message || "Invalid activation code");
  }
}

async function encryptRequestPayload(payload) {
  const dataKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = utf8Encode(JSON.stringify(payload));
  const encryptedData = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, dataKey, data));
  const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", dataKey));
  const publicKey = await crypto.subtle.importKey("jwk", REQUEST_PUBLIC_KEY, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
  const encryptedKey = new Uint8Array(await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, rawKey));
  return `VREQ1.${base64UrlEncode(encryptedKey)}.${base64UrlEncode(iv)}.${base64UrlEncode(encryptedData)}`;
}

async function verifyActivationCode(code) {
  const parts = String(code || "").trim().split(".");
  if (parts.length !== 3 || parts[0] !== "VACT1") throw new Error("Invalid activation code format.");
  const payloadText = utf8Decode(base64UrlDecode(parts[1]));
  const signature = base64UrlDecode(parts[2]);
  const publicKey = await crypto.subtle.importKey("jwk", ACTIVATION_PUBLIC_KEY, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, publicKey, signature, utf8Encode(payloadText));
  if (!valid) throw new Error("Activation signature is invalid.");
  const payload = JSON.parse(payloadText);
  if (payload.expiryDate && today() > payload.expiryDate) throw new Error("Activation code is already expired.");
  return payload;
}

function encodeLocalSecure(text) {
  return base64UrlEncode(xorBytes(utf8Encode(text), utf8Encode(deviceId() + DEFAULT_APP_NAME)));
}

function decodeLocalSecure(text) {
  return utf8Decode(xorBytes(base64UrlDecode(text), utf8Encode(deviceId() + DEFAULT_APP_NAME)));
}

function xorBytes(bytes, key) {
  return bytes.map((byte, index) => byte ^ key[index % key.length]);
}

function utf8Encode(value) {
  return new TextEncoder().encode(value);
}

function utf8Decode(bytes) {
  return new TextDecoder().decode(bytes);
}

function base64UrlEncode(bytes) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function copyField(id) {
  const value = document.querySelector(`#${id}`)?.value || "";
  await copyText(value);
}

async function copyText(value) {
  if (!value) return toast("Nothing to copy");
  try {
    await navigator.clipboard.writeText(value);
    toast("Copied");
  } catch {
    toast("Copy failed. Select and copy manually.");
  }
}

function renderSecurity() {
  const settings = state.settings || seed.settings;
  const enabled = securityEnabled();
  const lastUnlock = settings.lastUnlockAt ? new Date(settings.lastUnlockAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Not yet";
  views.security.innerHTML = `
    <div class="toolbar">
      <div><h2>Security</h2><p class="muted">Protect local business data with app lock, session timeout, and safer access controls.</p></div>
      <button class="secondary" id="securityLockNow" ${enabled ? "" : "disabled"}>Lock Now</button>
    </div>
    <div class="grid four" style="margin-bottom:14px">
      ${securityMetric("App Lock", enabled ? "Enabled" : "Disabled", enabled ? "good" : "warn")}
      ${securityMetric("Password / PIN", settings.password ? "Set" : "Not Set", settings.password ? "good" : "bad")}
      ${securityMetric("Auto Lock", `${settings.autoLockMinutes || 15} min`, "good")}
      ${securityMetric("Last Unlock", lastUnlock, settings.lastUnlockAt ? "good" : "warn")}
    </div>
    <div class="grid two">
      <form id="securityForm" class="panel stack">
        <h2>Access Control</h2>
        <div class="form-grid">
          <label>App Lock<select name="loginEnabled"><option value="true" ${settings.loginEnabled ? "selected" : ""}>Enabled</option><option value="false" ${!settings.loginEnabled ? "selected" : ""}>Disabled</option></select></label>
          <label>User Name<input name="userName" value="${escapeAttr(settings.userName || "")}" placeholder="Admin"></label>
          <label>Auto Lock<select name="autoLockMinutes">${["5", "15", "30", "60"].map((value) => `<option value="${value}" ${String(settings.autoLockMinutes || "15") === value ? "selected" : ""}>${value} minutes</option>`).join("")}</select></label>
          <label>Lock When App Is Hidden<select name="lockWhenHidden"><option value="false" ${!settings.lockWhenHidden ? "selected" : ""}>No</option><option value="true" ${settings.lockWhenHidden ? "selected" : ""}>Yes</option></select></label>
          <label>New Password / PIN<input name="password" type="password" autocomplete="new-password" placeholder="${settings.password ? "Leave blank to keep current" : "Required when app lock is enabled"}"></label>
          <label>Confirm Password / PIN<input name="confirmPassword" type="password" autocomplete="new-password" placeholder="Repeat password or PIN"></label>
        </div>
        <div class="actions">
          <button class="primary">Save Security</button>
          <button type="button" class="danger" id="securityReset">Disable Security</button>
        </div>
      </form>
      <div class="panel stack">
        <h2>Security Features</h2>
        <table>
          <tbody>
            <tr><th>App lock</th><td>Requires password/PIN before opening business data.</td></tr>
            <tr><th>Auto lock</th><td>Locks the app after inactivity.</td></tr>
            <tr><th>Hidden app lock</th><td>Can lock when the tab/app is hidden.</td></tr>
            <tr><th>Admin protection</th><td>Edit/delete actions remain centralized in Admin Edit.</td></tr>
            <tr><th>Backup safety</th><td>Use Settings > App Tools to export backups regularly.</td></tr>
          </tbody>
        </table>
        <p class="muted">This app stores data locally in the browser. Use a strong device password and keep backups private.</p>
      </div>
    </div>`;
  document.querySelector("#securityLockNow")?.addEventListener("click", lockApp);
  document.querySelector("#securityReset")?.addEventListener("click", () => {
    if (!confirm("Disable app lock and remove the saved password/PIN?")) return;
    state.settings.loginEnabled = false;
    state.settings.password = "";
    sessionStorage.removeItem("vasma-security-unlocked");
    save();
    renderAll();
    toast("Security disabled");
  });
  document.querySelector("#securityForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.target);
    const enableLock = data.loginEnabled === "true";
    const newPassword = data.password || "";
    if (newPassword && newPassword !== data.confirmPassword) return toast("Password confirmation does not match");
    if (enableLock && !newPassword && !state.settings.password) return toast("Set a password or PIN before enabling app lock");
    if (newPassword && newPassword.length < 4) return toast("Use at least 4 characters for password or PIN");
    state.settings.userName = data.userName || state.settings.userName || "Admin";
    state.settings.loginEnabled = enableLock;
    state.settings.autoLockMinutes = data.autoLockMinutes || "15";
    state.settings.lockWhenHidden = data.lockWhenHidden === "true";
    if (newPassword) state.settings.password = newPassword;
    if (enableLock) sessionStorage.setItem("vasma-security-unlocked", "true");
    save();
    resetSecurityTimer();
    renderAll();
    toast("Security settings saved");
  });
}

function securityMetric(label, value, tone = "good") {
  return `<div class="metric security-metric"><span class="muted">${label}</span><strong>${escapeHtml(value)}</strong><span class="pill ${tone}">${tone === "good" ? "Protected" : tone === "bad" ? "Action needed" : "Review"}</span></div>`;
}

function renderSettings() {
  const settings = state.settings || seed.settings;
  const section = localStorage.getItem("vasma-settings-section") || "business";
  views.settings.innerHTML = `
    <div class="panel settings-shell">
      <label class="settings-section-picker">Settings Section
        <select id="settingsSectionSelect">
          ${settingsSectionOptions(section)}
        </select>
      </label>
      <form id="settingsForm" class="stack">
        ${settingsSectionMarkup(section, settings)}
        ${["tools", "about"].includes(section) ? "" : '<div class="actions"><button class="primary">Save Settings</button></div>'}
      </form>
    </div>`;
  document.querySelector("#settingsSectionSelect")?.addEventListener("change", (event) => {
    localStorage.setItem("vasma-settings-section", event.target.value);
    renderSettings();
  });
  document.querySelector("#settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.target);
    const current = state.settings || {};
    data.businessName = data.businessName ?? current.businessName ?? "";
    data.appName = DEFAULT_APP_NAME;
    data.location = data.location ?? current.location ?? "";
    data.ownerName = data.ownerName ?? current.ownerName ?? "";
    data.mobile = data.mobile ?? current.mobile ?? "";
    data.userName = data.userName ?? current.userName ?? "";
    data.password = data.password ?? current.password ?? "";
    data.theme = data.theme ?? current.theme ?? "light";
    data.language = data.language ?? current.language ?? "en";
    data.jobCardPageSetup = data.jobCardPageSetup ?? current.jobCardPageSetup ?? "compact";
    data.billPageSetup = data.billPageSetup ?? current.billPageSetup ?? "compact";
    data.receiptPageSetup = data.receiptPageSetup ?? current.receiptPageSetup ?? "compact";
    data.loginEnabled = data.loginEnabled ?? String(Boolean(current.loginEnabled));
    data.loginEnabled = data.loginEnabled === "true";
    state.settings = { ...state.settings, ...data, creator: "Bakari Kamanga" };
    save();
    applyTheme();
    applyBrand();
    renderAll();
    toast("Settings saved");
  });
  document.querySelector("#settingsBackupData")?.addEventListener("click", exportBackup);
  document.querySelector("#settingsRestoreData")?.addEventListener("change", importBackup);
  const installButton = document.querySelector("#settingsInstallApp");
  installButton?.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    deferredInstallPrompt = null;
    renderSettings();
  });
}

function settingsTab(key, label, active) {
  return `<button type="button" class="settings-tab ${active === key ? "active" : ""}" data-settings-section="${key}">${label}</button>`;
}

function settingsSectionOptions(selected) {
  return [
    ["business", "Business Setup"],
    ["profile", "User Profile"],
    ["theme", "Theme"],
    ["language", "Language"],
    ["pages", "Page Setup"],
    ["tools", "App Tools"],
    ["about", "About the App"]
  ].map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`).join("");
}

function settingsSectionMarkup(section, settings) {
  const sections = {
    business: `
      <div class="settings-section">
        <h2>Business Setup</h2>
        <div class="form-grid">
          <label>Business Name<input name="businessName" value="${escapeAttr(settings.businessName || "")}" required></label>
          <label>Location<input name="location" value="${escapeAttr(settings.location || "")}"></label>
          <label>Owner Name<input name="ownerName" value="${escapeAttr(settings.ownerName || "")}"></label>
          <label>Mobile Number<input name="mobile" value="${escapeAttr(settings.mobile || "")}"></label>
        </div>
      </div>`,
    profile: `
      <div class="settings-section">
        <h2>User Profile</h2>
        <div class="form-grid">
          <label>User Name<input name="userName" value="${escapeAttr(settings.userName || "")}"></label>
          <label>Password<input name="password" type="password" value="${escapeAttr(settings.password || "")}" placeholder="Optional"></label>
          <label>Login Setup<select name="loginEnabled"><option value="false" ${!settings.loginEnabled ? "selected" : ""}>Disabled</option><option value="true" ${settings.loginEnabled ? "selected" : ""}>Enabled</option></select></label>
        </div>
      </div>`,
    theme: `
      <div class="settings-section">
        <h2>Theme</h2>
        <div class="form-grid">
          <label>Theme<select name="theme"><option value="light" ${settings.theme !== "dark" ? "selected" : ""}>Light mode</option><option value="dark" ${settings.theme === "dark" ? "selected" : ""}>Dark mode</option></select></label>
        </div>
      </div>`,
    language: `
      <div class="settings-section">
        <h2>Language</h2>
        <div class="form-grid">
          <label>Language<select name="language"><option value="en" ${settings.language !== "sw" ? "selected" : ""}>English</option><option value="sw" ${settings.language === "sw" ? "selected" : ""}>Swahili</option></select></label>
        </div>
      </div>`,
    pages: `
      <div class="settings-section">
        <h2>Page Setup</h2>
        <div class="form-grid">
          <label>Job Card Page Setup<select name="jobCardPageSetup">${pageSetupOptions(settings.jobCardPageSetup)}</select></label>
          <label>Bill / Invoice Page Setup<select name="billPageSetup">${pageSetupOptions(settings.billPageSetup)}</select></label>
          <label>Receipt Page Setup<select name="receiptPageSetup">${pageSetupOptions(settings.receiptPageSetup)}</select></label>
        </div>
      </div>`,
    tools: `
      <div class="settings-section">
        <h2>App Tools</h2>
        <div class="actions">
          <button type="button" class="secondary" id="settingsInstallApp" ${deferredInstallPrompt ? "" : "hidden"}>Install</button>
          <button type="button" class="secondary" id="settingsBackupData">Export Backup</button>
          <label class="secondary file-action">Import Backup<input id="settingsRestoreData" type="file" accept="application/json" /></label>
        </div>
      </div>`,
    about: `
      <div class="settings-section">
        <h2>About the App</h2>
        <p>${escapeHtml(DEFAULT_APP_NAME)} is a professional application for vehicle service job cards, billing, payments, expenses, commissions, reporting, and analysis.</p>
        <table>
          <tbody>
            <tr><th>App Name</th><td>${escapeHtml(DEFAULT_APP_NAME)}</td></tr>
            <tr><th>Business Name</th><td>${escapeHtml(settings.businessName || "VASMA System")}</td></tr>
            <tr><th>Platform</th><td>Android, iOS, Windows, Web, and Mac through PWA install</td></tr>
            <tr><th>App Developer</th><td><strong>Bakari Kamanga</strong></td></tr>
            <tr><th>Company</th><td>ViewPoint Tech Services</td></tr>
            <tr><th>Developer Mobile</th><td>+255 767 528 039</td></tr>
            <tr><th>Data storage</th><td>Local browser storage with backup and restore</td></tr>
          </tbody>
        </table>
      </div>`
  };
  return sections[section] || sections.business;
}

function applyTheme() {
  document.body.classList.toggle("dark", state.settings?.theme === "dark");
}

function applyBrand() {
  const settings = state.settings || seed.settings;
  const appName = DEFAULT_APP_NAME;
  const businessName = settings.businessName || "VASMA System";
  const topNames = document.querySelector("#dashboardTopNames");
  document.title = appName;
  document.querySelector("#brandBusinessName").textContent = businessName;
  document.querySelector("#brandAppName").textContent = appName;
  document.querySelector(".brand-mark").textContent = (appName || businessName).trim().charAt(0).toUpperCase() || "V";
  if (topNames) {
    topNames.hidden = activeView !== "dashboard";
    topNames.innerHTML = `<p class="brand-signature">${escapeHtml(appName)}</p><h2>${escapeHtml(businessName)}</h2>`;
  }
}

const swTranslations = {
  "Dashboard": "Dashibodi",
  "Customers": "Wateja",
  "Job Cards": "Kadi za Kazi",
  "Work Confirmation": "Uthibitisho wa Kazi",
  "Service Cards": "Kadi za Huduma",
  "Payments": "Malipo",
  "Expenses": "Matumizi",
  "Commissions": "Kamisheni",
  "Admin Edit": "Marekebisho ya Admin",
  "Master Data": "Taarifa za Msingi",
  "Reports": "Ripoti",
  "Analysis": "Uchambuzi",
  "License": "Leseni",
  "Security": "Usalama",
  "Settings": "Mipangilio",
  "Customer Registration": "Usajili wa Wateja",
  "Add Customer": "Ongeza Mteja",
  "Customer": "Mteja",
  "Customer Name": "Jina la Mteja",
  "Truck / Vehicle #": "Namba ya Gari",
  "Vehicle Model": "Modeli ya Gari",
  "Mileage": "Kilomita",
  "Contact Person": "Mtu wa Mawasiliano",
  "Mobile": "Simu",
  "Mobile Number": "Namba ya Simu",
  "Save Customer": "Hifadhi Mteja",
  "New Job Card": "Kadi Mpya ya Kazi",
  "Job Card Ref": "Rejea ya Kadi ya Kazi",
  "Date": "Tarehe",
  "Billed": "Jumla ya Bili",
  "Paid": "Imelipwa",
  "Status": "Hali",
  "View": "Tazama",
  "Service Items": "Huduma",
  "Purchased Items": "Vifaa Vilivyonunuliwa",
  "Add Item": "Ongeza Kipengele",
  "Add Purchased Item": "Ongeza Kifaa Kilichonunuliwa",
  "Category": "Kategoria",
  "Service Item": "Huduma",
  "Attendant": "Mhudumu",
  "Action": "Kitendo",
  "Amount (Tsh)": "Kiasi (Tsh)",
  "Add Note": "Ongeza Maelezo",
  "Save Job Card": "Hifadhi Kadi ya Kazi",
  "Save Service Card": "Hifadhi Kadi ya Huduma",
  "Preview Service Card": "Tazama Kadi ya Huduma",
  "Export Service Card": "Hamisha Kadi ya Huduma",
  "Next Service Mileage": "Kilomita za Huduma Inayofuata",
  "Next Service Date": "Tarehe ya Huduma Inayofuata",
  "Service Interval": "Muda wa Huduma",
  "Service Provided": "Huduma Iliyotolewa",
  "Remarks": "Maoni",
  "Job Card Number": "Namba ya Kadi ya Kazi",
  "Select job card...": "Chagua kadi ya kazi...",
  "Save Confirmation": "Hifadhi Uthibitisho",
  "Preview Bill": "Tazama Bili",
  "Export PDF": "Hamisha PDF",
  "Payment Module": "Moduli ya Malipo",
  "Record Payment": "Rekodi Malipo",
  "Filter Receipts": "Chuja Risiti",
  "Clear": "Futa",
  "View Receipt": "Tazama Risiti",
  "Payment Method": "Njia ya Malipo",
  "Reference / Comment": "Rejea / Maoni",
  "Amount Paid": "Kiasi Kilicholipwa",
  "Outstanding Bill Lines": "Vipengele Vilivyobaki Kulipwa",
  "Save Payment": "Hifadhi Malipo",
  "Expense Module": "Moduli ya Matumizi",
  "Add Expense": "Ongeza Matumizi",
  "Expense Item": "Kipengele cha Matumizi",
  "Save Expense": "Hifadhi Matumizi",
  "Commission Module": "Moduli ya Kamisheni",
  "Allocate Commission": "Panga Kamisheni",
  "Commission": "Kamisheni",
  "Save Commission": "Hifadhi Kamisheni",
  "Business Setup": "Mipangilio ya Biashara",
  "Business Name": "Jina la Biashara",
  "Location": "Eneo",
  "Owner Name": "Jina la Mmiliki",
  "User Name": "Jina la Mtumiaji",
  "Password": "Nenosiri",
  "Password / PIN": "Nenosiri / PIN",
  "Security settings saved": "Mipangilio ya usalama imehifadhiwa",
  "Login Setup": "Mipangilio ya Kuingia",
  "App Lock": "Kufunga App",
  "Auto Lock": "Kufunga Kiotomatiki",
  "Lock Now": "Funga Sasa",
  "Save Security": "Hifadhi Usalama",
  "Disable Security": "Zima Usalama",
  "Access Control": "Udhibiti wa Kuingia",
  "New Password / PIN": "Nenosiri / PIN Mpya",
  "Confirm Password / PIN": "Thibitisha Nenosiri / PIN",
  "Security Features": "Vipengele vya Usalama",
  "Offline License Activation": "Uwezeshaji wa Leseni Bila Mtandao",
  "License Status": "Hali ya Leseni",
  "Generate Request Code": "Tengeneza Request Code",
  "Enter Activation Code": "Ingiza Activation Code",
  "License Records": "Kumbukumbu za Leseni",
  "Requested License Type": "Aina ya Leseni Inayoombwa",
  "Activation Code": "Activation Code",
  "Activate Offline": "Wezesha Bila Mtandao",
  "Expiry Date": "Tarehe ya Mwisho",
  "Theme": "Muonekano",
  "Language": "Lugha",
  "Job Card Page Setup": "Mpangilio wa Ukurasa wa Kadi ya Kazi",
  "Bill / Invoice Page Setup": "Mpangilio wa Ukurasa wa Bili/Ankara",
  "Receipt Page Setup": "Mpangilio wa Ukurasa wa Risiti",
  "Save Settings": "Hifadhi Mipangilio",
  "About the App": "Kuhusu App",
  "App Tools": "Zana za App",
  "Install": "Sakinisha",
  "Export Backup": "Hamisha Nakala Rudufu",
  "Import Backup": "Ingiza Nakala Rudufu",
  "Report Type": "Aina ya Ripoti",
  "Export Excel": "Hamisha Excel",
  "From": "Kuanzia",
  "To": "Mpaka",
  "This Week": "Wiki Hii",
  "This Month": "Mwezi Huu",
  "No job cards available.": "Hakuna kadi za kazi.",
  "Select a job card to display work confirmation.": "Chagua kadi ya kazi ili kuonyesha uthibitisho wa kazi.",
  "No records yet.": "Hakuna rekodi bado."
};

function applyLanguage() {
  if (state.settings?.language !== "sw") return;
  translateNode(document.body);
  document.querySelectorAll("input[placeholder]").forEach((input) => {
    const translated = swTranslations[input.placeholder];
    if (translated) input.placeholder = translated;
  });
}

function translateNode(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA", "OPTION"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const text = node.nodeValue.trim();
    if (swTranslations[text]) node.nodeValue = node.nodeValue.replace(text, swTranslations[text]);
  });
}

function pageSetupOptions(selected = "compact") {
  const options = [
    ["compact", "Fit one page - Compact"],
    ["normal", "Normal"],
    ["dense", "Maximum fit - Dense"]
  ];
  return options.map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`).join("");
}

function rank(items, labelFn, valueFn) {
  const totals = {};
  items.forEach((item) => {
    const label = labelFn(item);
    totals[label] = (totals[label] || 0) + valueFn(item);
  });
  return Object.entries(totals).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function rankJobItems(jobs, labelFn = (job, item) => itemName(item.categoryId || job.categoryId, item.itemId)) {
  const totals = {};
  jobs.forEach((job) => job.items.forEach((item) => {
    const label = labelFn(job, item);
    totals[label] = (totals[label] || 0) + parseMoney(item.amount);
  }));
  return Object.entries(totals).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function rankCommissionsByAttendant(entries) {
  const totals = {};
  entries.forEach((entry) => {
    const label = employeeName(entry.attendantId);
    totals[label] = (totals[label] || 0) + parseMoney(entry.amount);
  });
  return Object.entries(totals).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function rankingPanel(title, rows) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return `<div class="panel"><h3>${title}</h3>${rows.length ? rows.map((row) => `<div class="bar"><strong>${escapeHtml(row.label)}</strong><div class="bar-track"><div class="bar-fill" style="width:${(row.value / max) * 100}%"></div></div><span>${formatMoney(row.value)}</span></div>`).join("") : '<div class="empty">No data for this period.</div>'}</div>`;
}

function analysisPanel(title, rows, view) {
  if (view === "Pie Chart") return piePanel(title, rows);
  if (view === "Graph") return graphPanel(title, rows);
  return rankingPanel(title, rows);
}

function piePanel(title, rows) {
  if (!rows.length) return `<div class="panel"><h3>${title}</h3><div class="empty">No data for this period.</div></div>`;
  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
  const colors = ["#155e75", "#f59e0b", "#15803d", "#b91c1c", "#7c3aed", "#0891b2"];
  let start = 0;
  const stops = rows.slice(0, 6).map((row, index) => {
    const end = start + (row.value / total) * 100;
    const stop = `${colors[index % colors.length]} ${start}% ${end}%`;
    start = end;
    return stop;
  }).join(", ");
  return `<div class="panel"><h3>${title}</h3><div class="pie-chart" style="background:conic-gradient(${stops})"></div>${rows.slice(0, 6).map((row, index) => `<div class="legend"><span style="background:${colors[index % colors.length]}"></span>${escapeHtml(row.label)} - ${formatMoney(row.value)}</div>`).join("")}</div>`;
}

function graphPanel(title, rows) {
  if (!rows.length) return `<div class="panel"><h3>${title}</h3><div class="empty">No data for this period.</div></div>`;
  const max = Math.max(...rows.map((row) => row.value), 1);
  const points = rows.slice(0, 8).map((row, index, list) => {
    const x = list.length === 1 ? 50 : (index / (list.length - 1)) * 100;
    const y = 100 - (row.value / max) * 90;
    return `${x},${y}`;
  }).join(" ");
  return `<div class="panel"><h3>${title}</h3><svg class="line-chart" viewBox="0 0 100 110" preserveAspectRatio="none"><polyline points="${points}" fill="none" stroke="#155e75" stroke-width="3"></polyline></svg>${rows.slice(0, 8).map((row) => `<div class="legend">${escapeHtml(row.label)} - ${formatMoney(row.value)}</div>`).join("")}</div>`;
}

function previewReportPrint() {
  const report = document.querySelector("#reports .panel.table-wrap");
  if (!report) return toast("Report not ready");
  openPrintPreview("VASMA Report", `<div class="bill-paper page-compact">${report.innerHTML}<p style="margin-top:18px">Prepared by ${escapeHtml(profileName())}</p></div>`);
}

function openPrintPreview(title, html) {
  pendingPrintPreview = { title, html };
  openModal(`
    <div class="print-preview-shell">
      <div class="toolbar no-print">
        <div>
          <h2>${escapeHtml(title)}</h2>
          <p class="muted">Preview is shown below. After checking it, open the system print dialog to print or choose Save as PDF.</p>
        </div>
        <div class="actions">
          <button type="button" class="primary" onclick="printPreviewDocument()">Open Print Dialog / Save as PDF</button>
          <button type="button" class="secondary" onclick="closeModal()">Close</button>
        </div>
      </div>
      <div class="print-preview-note no-print">If the Windows/Codex print window says preview is not supported, use this VASMA preview as the document preview, then click Print or select Microsoft Print to PDF.</div>
      <div class="print-preview-page">${html}</div>
    </div>`);
}

function printPreviewDocument() {
  if (!pendingPrintPreview.html) return toast("Nothing to print");
  const original = document.body.innerHTML;
  document.title = pendingPrintPreview.title || DEFAULT_APP_NAME;
  document.body.innerHTML = pendingPrintPreview.html;
  window.print();
  document.body.innerHTML = original;
  window.location.reload();
}

function exportReportCsv() {
  const rows = Array.from(document.querySelectorAll("#reportTable tr")).map((tr) => Array.from(tr.children).map((cell) => `"${cell.textContent.replace(/"/g, '""')}"`).join(","));
  download(`vasma-report-${today()}.csv`, rows.join("\n"), "text/csv");
}

function exportBackup() {
  download(`vasma-backup-${today()}.json`, JSON.stringify(state, null, 2), "application/json");
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = mergeState(seed, JSON.parse(reader.result));
      save();
      renderAll();
      toast("Backup imported");
    } catch {
      toast("Could not import backup");
    }
  };
  reader.readAsText(file);
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function openSimpleForm(formId, title, fields, onSubmit) {
  openModal(`<h2>${title}</h2><form id="${formId}" class="form-grid">${fields.map(([name, label, value]) => `<label>${label}<input name="${name}" value="${escapeAttr(value)}" required></label>`).join("")}<div class="wide actions"><button class="primary">Save</button></div></form>`);
  document.querySelector(`#${formId}`).addEventListener("submit", (event) => {
    event.preventDefault();
    onSubmit(formData(event.target));
  });
}

function openModal(html) {
  document.querySelector("#modalBody").innerHTML = html;
  document.querySelector("#modal").showModal();
  applyLanguage();
}

function closeModal() {
  document.querySelector("#modal").close();
}

function commit(message) {
  save();
  closeModal();
  renderAll();
  toast(message);
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function options(items, selected, labelFn = (item) => item.name || item.ref) {
  return items.map((item) => `<option value="${item.id}" ${item.id === selected ? "selected" : ""}>${escapeHtml(labelFn(item))}</option>`).join("");
}

function deleteRecord(collection, id) {
  if (!confirm("Delete this record?")) return;
  state[collection] = state[collection].filter((item) => item.id !== id);
  save();
  renderAll();
  toast("Record deleted");
}

function deleteJob(id) {
  if (!confirm("Delete this job card and linked payments/commissions?")) return;
  state.jobCards = state.jobCards.filter((job) => job.id !== id);
  state.payments = state.payments.filter((payment) => payment.jobId !== id);
  state.commissions = state.commissions.filter((entry) => entry.jobId !== id);
  save();
  renderAll();
  toast("Job card deleted");
}

function deleteCategory(id) {
  if (!confirm("Delete this service category?")) return;
  state.categories = state.categories.filter((category) => category.id !== id);
  save();
  renderAll();
}

function deleteItem(categoryId, itemId) {
  if (!confirm("Delete this service item?")) return;
  const category = byId(state.categories, categoryId);
  category.items = category.items.filter((item) => item.id !== itemId);
  save();
  renderAll();
}

function emptyRow(cols) {
  return `<tr><td colspan="${cols}" class="muted">No records yet.</td></tr>`;
}

function totalRow(span, total) {
  return `<tr><th colspan="${span}">Total</th><th>${formatMoney(total)}</th></tr>`;
}

function summaryRow(rows, keys) {
  const totals = keys.map((key) => rows.reduce((sum, row) => sum + row[key], 0));
  return `<tr><th colspan="${8 - keys.length}">Total</th>${totals.map((total) => `<th>${formatMoney(total)}</th>`).join("")}</tr>`;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function escapeAttr(value = "") {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
