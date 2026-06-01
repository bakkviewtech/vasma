const STORE_KEY = "vasma-service-manager-v1";
const LICENSE_STORE_KEY = "vasma-license-store-v1";
const DEVICE_ID_KEY = "vasma-device-id";
const SYNC_SEQUENCE_KEY = "vasma-sync-server-sequence";
const LAST_SYNC_STATE_KEY = "vasma-last-synced-state";
const INSTALL_DATE_KEY = "vasma-install-date";
const APP_VERSION = "v100";
const DEVELOPER_EDITS_KEY = "vasma-developer-edits";
const DEVELOPER_MODE_KEY = "vasma-developer-mode";
const API_URL = window.VASMA_API_URL || localStorage.getItem("vasma_api_url") || (location.port === "3000" ? "" : "http://localhost:3000");
const TRIAL_DAYS = 14;
const SERVICE_OPTIONS = [
  { key: "tire", label: "Tire Service", category: "Tire Service" },
  { key: "carWash", label: "Car Wash", category: "Car Wash" },
  { key: "general", label: "General Service", category: "General Service" }
];
const SERVICE_AUTH_CODES = {
  "tire": "VASMA-TIRE",
  "carWash": "VASMA-CARWASH",
  "general": "VASMA-GENERAL",
  "carWash|tire": "VASMA-TIRE-CARWASH",
  "general|tire": "VASMA-TIRE-GENERAL",
  "carWash|general": "VASMA-CARWASH-GENERAL",
  "carWash|general|tire": "VASMA-ALL-SERVICES"
};
const money = new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 2 });
const DEFAULT_APP_NAME = "VASMA System - Vehicle Auto Service Management System";
const REQUEST_PUBLIC_KEY = {"key_ops":["encrypt"],"ext":true,"alg":"RSA-OAEP-256","kty":"RSA","n":"hz1uChIGsnwpJq82OWdXymV2G9gqB8ioeaL7B2oxZpv8Na8MpqgUN6um1MwtH8VMnTlXbvjJFZj8XAp8N90ScOS-IbXQ86VsLTaduzGsy73_RnMNywjzmRWqbAzSGfQDoJz_wBs45pcqnwyzEjkEAuiPuP-dzey2JJFpU3_VNHT4SKWNEOPKMG2r05Vg9nysCBDgxQnfXGGnt2Ir-aeMxS3Vf5Z4ov4DK-ySLmpaVl4_0UuLR0sIWKtQ9fKSfMfFlYlMlcL5I8YE1XbdsvzkOg11M4ZhPNLcz5ZUn5NY1H2ZAX1yNWzba1RzTzh_ENNS9-cKts98qDKrElh1iizGHw","e":"AQAB"};
const ACTIVATION_PUBLIC_KEY = {"key_ops":["verify"],"ext":true,"kty":"EC","x":"CLRLzb_XuU3ayPeSbTgSY6SdxliE684ECGBvh_yUlOQ","y":"mDtY3kNpiLxUizqFqWvbQa2SKkSCiOzJD8u11r8tWoo","crv":"P-256"};

const seed = {
  customers: [
    { id: uid(), name: "Sample Transport Ltd", vehicle: "T 123 ABC", vehicleModel: "Mitsubishi Pickup", contact: "Asha Mhando", mobile: "+255 712 000 000" }
  ],
  employees: [
    { id: uid(), name: "Juma Said", mobile: "+255 713 111 111", role: "Supervisor" },
    { id: uid(), name: "Neema John", mobile: "+255 714 222 222", role: "Supervisor" },
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
      ].map((name) => ({ id: uid(), name, subItems: defaultSubItems("Tire Service", name) }))
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
      ].map((name) => ({ id: uid(), name, subItems: defaultSubItems("General Service", name) }))
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
      ].map((name) => ({ id: uid(), name, subItems: defaultSubItems("Car Wash", name) }))
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
    enabledServices: ["tire", "carWash", "general"],
    dataView: "official",
    serviceAuthorization: {
      code: "VASMA-ALL-SERVICES",
      authorizedAt: "",
      authorizedServices: ["tire", "carWash", "general"]
    },
    jobCardPageSetup: "compact",
    billPageSetup: "compact",
    receiptPageSetup: "compact",
    creator: "Bakari Kamanga",
    developerEdits: {},
    developerGraphHeight: "390",
    developerLayout: {},
    developerCustomBlocks: {}
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
let remoteSaveTimer = null;
let hydratingFromBackend = false;
let syncInProgress = false;

function defaultSubItems(categoryNameValue, itemNameValue) {
  const category = String(categoryNameValue || "").toLowerCase();
  const item = String(itemNameValue || "").toLowerCase();
  let names = [];
  if (category.includes("car wash")) {
    names = ["Exterior body wash", "Interior cleaning", "Vacuum cleaning", "Tyre cleaning"];
    if (item.includes("premium") || item.includes("full") || item.includes("detailing")) names.push("Dashboard polish", "Tyre shine");
    if (item.includes("engine")) names = ["Engine bay wash", "Engine degreasing", "Final engine wipe"];
    if (item.includes("underbody")) names = ["Underbody wash", "Mud removal", "Chassis rinse"];
    if (item.includes("interior") || item.includes("seat") || item.includes("carpet") || item.includes("detailing")) names.push("Seat cleaning", "Carpet cleaning");
    if (item.includes("polish") || item.includes("wax") || item.includes("detailing")) names.push("Body polish", "Waxing");
  } else if (category.includes("tire")) {
    names = ["Inspect tyre", "Remove wheel", "Repair / replace", "Fit wheel", "Inflate pressure"];
    if (item.includes("balancing")) names = ["Remove wheel", "Balance wheel", "Fit wheel", "Road check"];
    if (item.includes("alignment")) names = ["Inspect alignment", "Adjust alignment", "Road test"];
    if (item.includes("rotation")) names = ["Inspect tyre positions", "Rotate tyres", "Inflate pressure"];
    if (item.includes("valve")) names = ["Remove valve", "Fit new valve", "Leak test"];
  } else if (category.includes("general")) {
    names = ["Inspect vehicle", "Perform service", "Test and verify"];
    if (item.includes("engine oil")) names = ["Drain old oil", "Replace engine oil", "Check oil level"];
    if (item.includes("oil filter")) names = ["Remove old oil filter", "Fit new oil filter", "Leak check"];
    if (item.includes("air filter")) names = ["Remove air filter", item.includes("replacement") ? "Fit new air filter" : "Clean air filter", "Recheck fitting"];
    if (item.includes("fuel filter")) names = ["Remove fuel filter", "Fit new fuel filter", "Leak check"];
    if (item.includes("brake")) names = ["Inspect brakes", "Adjust / service brakes", "Road test"];
    if (item.includes("battery")) names = ["Clean terminals", "Tighten terminals", "Check charging"];
    if (item.includes("inspection")) names = ["Engine check", "Fluid level check", "Lights check", "Brake check", "Road test"];
  }
  return [...new Set(names)].map((name) => ({ id: uid(), name }));
}

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
  businessAdmin: document.querySelector("#businessAdmin"),
  master: document.querySelector("#master"),
  reports: document.querySelector("#reports"),
  analysis: document.querySelector("#analysis"),
  license: document.querySelector("#license"),
  security: document.querySelector("#security"),
  settings: document.querySelector("#settings")
};

document.addEventListener("DOMContentLoaded", () => {
  init().catch((error) => {
    console.error("App initialization failed", error);
    renderAll();
    toast("App started with local data. MySQL sync needs attention.");
  });
});

async function init() {
  hydratingFromBackend = true;
  migrateState();
  hydratingFromBackend = false;
  applyTheme();
  applyBrand();
  initMobileMenu();
  initSecurity();
  document.querySelector("#backDashboard")?.addEventListener("click", () => showView("dashboard"));
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.menu) {
        toggleNavGroup(button.dataset.menu);
        showView(button.dataset.view, { keepNavFlyout: true, keepMobileMenu: true });
      } else {
        closeNavFlyouts();
        showView(button.dataset.view);
      }
    });
  });
  document.querySelectorAll(".nav-subitem").forEach((button) => {
    button.addEventListener("click", () => {
      applyNavSubAction(button.dataset.subkey, button.dataset.subvalue);
      setNavGroupOpen(button.closest("[data-menu-group]")?.dataset.menuGroup, true);
      showView(button.dataset.view, { keepNavFlyout: true });
    });
  });
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    renderSettings();
  });
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./service-worker.js");
  window.addEventListener("online", () => scheduleRemoteSave(250));
  window.addEventListener("focus", () => {
    if (localStorage.getItem("vasma_sync_status") !== "synced") scheduleRemoteSave(250);
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && localStorage.getItem("vasma_sync_status") !== "synced") scheduleRemoteSave(250);
  });
  setInterval(() => {
    if (localStorage.getItem("vasma_sync_status") !== "synced") scheduleRemoteSave(500);
  }, 30000);
  const loadedFromMysql = await hydrateStateFromBackend({ render: false });
  renderAll();
  if (!loadedFromMysql) scheduleRemoteSave(100);
  enforceSecurityLock();
  promptBusinessProfileSetup();
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

function serverSequence() {
  return Number(localStorage.getItem(SYNC_SEQUENCE_KEY) || 0);
}

function setServerSequence(value) {
  const sequence = Number(value || 0);
  if (Number.isFinite(sequence)) localStorage.setItem(SYNC_SEQUENCE_KEY, String(sequence));
}

function lastSyncedState() {
  try {
    return JSON.parse(localStorage.getItem(LAST_SYNC_STATE_KEY) || "null");
  } catch {
    return null;
  }
}

function rememberLastSyncedState(data = state) {
  try {
    localStorage.setItem(LAST_SYNC_STATE_KEY, JSON.stringify(data));
  } catch {
    // Best-effort cache used only for offline deletion replay.
  }
}

function deletedIdsSinceLastSync() {
  const previous = lastSyncedState();
  if (!previous) return {};
  const deleted = {};
  const listKeys = ["customers", "employees", "packages", "expenseItems", "actions", "jobCards", "payments", "expenses", "commissions", "serviceCards", "categories"];
  for (const key of listKeys) {
    const currentIds = new Set((Array.isArray(state[key]) ? state[key] : []).map((row) => String(row?.id)));
    const removed = (Array.isArray(previous[key]) ? previous[key] : [])
      .map((row) => row?.id)
      .filter((id) => id && !currentIds.has(String(id)));
    if (removed.length) deleted[key] = removed;
  }
  return deleted;
}

function save(options = {}) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  localStorage.setItem("vasma_sync_status", options.localOnly ? "local" : "pending");
  if (!options.localOnly) scheduleRemoteSave(options.delayMs);
}

function getAuthToken() {
  return localStorage.getItem("vasma_token") || sessionStorage.getItem("vasma_token") || "";
}

async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || "API request failed");
  return data;
}

function scheduleRemoteSave(delayMs = 250) {
  if (hydratingFromBackend || !getAuthToken()) return;
  clearTimeout(remoteSaveTimer);
  remoteSaveTimer = setTimeout(pushStateToBackend, delayMs);
}

async function pushStateToBackend() {
  if (hydratingFromBackend || syncInProgress || !getAuthToken()) return;
  if (navigator.onLine === false) {
    localStorage.setItem("vasma_sync_status", "pending");
    return;
  }
  syncInProgress = true;
  try {
    const baseSequence = serverSequence();
    const payload = { ...state, _sync: { savedAt: new Date().toISOString(), appVersion: APP_VERSION, deviceId: deviceId(), baseSequence } };
    const result = await apiRequest("/api/data/save", { method: "POST", body: { data: payload, deviceId: deviceId(), baseSequence, deletedIds: deletedIdsSinceLastSync() } });
    if (result.data && typeof result.data === "object") {
      delete result.data._sync;
      hydratingFromBackend = true;
      state = mergeState(seed, result.data);
      migrateState();
      save({ localOnly: true });
      hydratingFromBackend = false;
      renderAll();
    }
    setServerSequence(result.serverSequence);
    rememberLastSyncedState(state);
    localStorage.setItem("vasma_sync_status", "synced");
    localStorage.setItem("vasma_last_mysql_sync", new Date().toISOString());
  } catch (error) {
    localStorage.setItem("vasma_sync_status", "failed");
    console.warn("Backend sync failed; local copy is still saved.", error);
  } finally {
    syncInProgress = false;
  }
}

async function hydrateStateFromBackend(options = {}) {
  if (!getAuthToken()) return false;
  hydratingFromBackend = true;
  try {
    const result = await apiRequest("/api/data/load");
    const payload = typeof result.data === "string" ? JSON.parse(result.data) : result.data;
    if (payload && typeof payload === "object") {
      delete payload._sync;
      state = mergeState(seed, payload);
      migrateState();
      save({ localOnly: true });
      applyTheme();
      applyBrand();
      setServerSequence(result.serverSequence || result.record?.server_sequence || 0);
      rememberLastSyncedState(state);
      localStorage.setItem("vasma_sync_status", "synced");
      localStorage.setItem("vasma_last_mysql_sync", result.record?.updated_at || new Date().toISOString());
      if (options.render !== false) renderAll();
      return true;
    } else {
      await pushStateToBackend();
      return false;
    }
  } catch (error) {
    localStorage.setItem("vasma_sync_status", "failed");
    console.warn("Backend load failed; using local data.", error);
    return false;
  } finally {
    hydratingFromBackend = false;
  }
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
  if (!state.settings.developerEdits || typeof state.settings.developerEdits !== "object") state.settings.developerEdits = developerEdits();
  if (!state.settings.developerGraphHeight) state.settings.developerGraphHeight = "390";
  if (!state.settings.developerLayout || typeof state.settings.developerLayout !== "object") state.settings.developerLayout = {};
  if (!state.settings.developerCustomBlocks || typeof state.settings.developerCustomBlocks !== "object") state.settings.developerCustomBlocks = {};
  ensureBusinessAdminStore();
  if (!Array.isArray(state.settings.enabledServices)) state.settings.enabledServices = ["tire", "carWash", "general"];
  if (!state.settings.dataView) state.settings.dataView = "official";
  if (!state.settings.serviceAuthorization) {
    state.settings.serviceAuthorization = { code: "VASMA-ALL-SERVICES", authorizedAt: "", authorizedServices: [...state.settings.enabledServices] };
  }
  state.customers.forEach((customer) => {
    if (!("vehicleModel" in customer)) customer.vehicleModel = "";
    if (!("active" in customer)) customer.active = true;
  });
  state.employees.forEach((employee) => {
    if (!("active" in employee)) employee.active = true;
  });
  state.categories.forEach((category) => {
    if (!("active" in category)) category.active = true;
    if (!Array.isArray(category.items)) category.items = [];
    category.items = category.items.map((item) => typeof item === "string" ? { id: uid(), name: item } : item);
    category.items.forEach((item) => {
      if (!Array.isArray(item.subItems)) item.subItems = defaultSubItems(category.name, item.name);
    });
  });
  state.jobCards.forEach((job) => {
    if (!job.recordMode) job.recordMode = licenseStore().activationCode ? "OFFICIAL" : "TRIAL";
    if (!("isArchived" in job)) job.isArchived = false;
    job.ref = normalizeJobRef(job.ref);
    job.invoiceRef = invoiceRef(job);
    if (!("mileage" in job)) job.mileage = "";
    if (!Array.isArray(job.purchaseItems)) job.purchaseItems = [];
    if (!job.serviceCard) job.serviceCard = { nextServiceMileage: "", nextServiceDate: "", lines: [] };
    if (!Array.isArray(job.serviceCard.lines)) job.serviceCard.lines = [];
    if (!Array.isArray(job.items)) job.items = [];
    job.items.forEach((item) => {
      if (!item.categoryId) item.categoryId = job.categoryId || state.categories[0]?.id || "";
      if (!item.action && item.status) item.action = item.status;
      if (!("confirmed" in item)) item.confirmed = false;
      if (!Array.isArray(item.subItemIds)) item.subItemIds = [];
      if (!item.subItemStatus || typeof item.subItemStatus !== "object") item.subItemStatus = {};
      if (!("remarks" in item)) item.remarks = "";
      if (!item.categoryName) item.categoryName = categoryName(item.categoryId || job.categoryId);
      if (!item.serviceItemName) item.serviceItemName = itemName(item.categoryId || job.categoryId, item.itemId);
      if (!item.attendantName) item.attendantName = employeeName(item.attendantId);
    });
    if (!("confirmationRemarks" in job)) job.confirmationRemarks = "";
    job.purchaseItems.forEach((item) => {
      if (!item.id) item.id = uid();
      if (!("status" in item)) item.status = "";
    });
  });
  state.payments.forEach((payment) => {
    if (!payment.ref) payment.ref = nextReceiptRef();
    if (!payment.recordMode) payment.recordMode = byId(state.jobCards, payment.jobId)?.recordMode || "TRIAL";
    if (!("isArchived" in payment)) payment.isArchived = false;
  });
  state.expenses.forEach((expense) => {
    if (!expense.recordMode) expense.recordMode = licenseStore().activationCode ? "OFFICIAL" : "TRIAL";
    if (!("isArchived" in expense)) expense.isArchived = false;
  });
  state.commissions.forEach((entry) => {
    if (!entry.recordMode) entry.recordMode = byId(state.jobCards, entry.jobId)?.recordMode || "TRIAL";
    if (!("isArchived" in entry)) entry.isArchived = false;
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
  renderSafe("dashboard", renderDashboard);
  renderSafe("customers", renderCustomers);
  renderSafe("jobs", renderJobs);
  renderSafe("confirmation", renderConfirmation);
  renderSafe("serviceCards", renderServiceCards);
  renderSafe("payments", renderPayments);
  renderSafe("expenses", renderExpenses);
  renderSafe("commissions", renderCommissions);
  renderSafe("admin", renderAdminEdit);
  renderSafe("businessAdmin", renderBusinessAdmin);
  renderSafe("master", renderMaster);
  renderSafe("reports", renderReports);
  renderSafe("analysis", renderAnalysis);
  renderSafe("license", renderLicense);
  renderSafe("security", renderSecurity);
  renderSafe("settings", renderSettings);
  applyLanguage();
  applyBrand();
  applyDeveloperEdits();
  applyDeveloperGraphSize();
  applyDeveloperLayout();
  updateServiceVisibility();
  updateBackButton();
  updateDeveloperAccessButton();
  renderDeveloperToolbar();
}

function renderSafe(viewKey, renderer) {
  try {
    renderer();
  } catch (error) {
    console.error(`Render failed: ${viewKey}`, error);
    if (views[viewKey]) {
      views[viewKey].innerHTML = `<div class="panel"><h2>${escapeHtml(titleCase(viewKey))}</h2><p class="muted">This module could not load because one record needs repair: ${escapeHtml(error.message || "Unknown error")}</p></div>`;
    }
  }
}

function showView(view, options = {}) {
  if (!canAccessView(view)) {
    toast("Access Denied");
    view = licenseExpired() ? "reports" : "dashboard";
  }
  if (view === "serviceCards" && !isServiceEnabled("general")) {
    view = "dashboard";
    toast("Service Cards are available when General Service is authorized.");
  }
  activeView = view;
  document.querySelector("#viewTitle").textContent = titleCase(view);
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  document.querySelectorAll(".view").forEach((section) => section.classList.toggle("active", section.id === view));
  updateNavSubItems();
  if (document.body.classList.contains("menu-open") && !options.keepMobileMenu) closeMobileMenu();
  else if (!options.keepNavFlyout) closeNavFlyouts();
  renderAll();
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

function updateBackButton() {
  const button = document.querySelector("#backDashboard");
  if (button) button.hidden = activeView === "dashboard";
}

function transactionViews() {
  return ["customers", "jobs", "confirmation", "payments", "expenses", "commissions", "admin", "businessAdmin", "master"];
}

function reportOnlyViews() {
  return ["dashboard", "reports", "analysis", "license", "settings", "security"];
}

function canAccessView(view) {
  if (!licenseExpired()) return true;
  return reportOnlyViews().includes(view);
}

function requireTransactionAccess() {
  if (!licenseExpired()) return true;
  toast("Expired account is in report-only mode. Renew activation to continue transactions.");
  return false;
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

function toggleNavGroup(group) {
  const submenu = document.querySelector(`[data-submenu="${group}"]`);
  const isOpen = submenu && !submenu.hidden;
  setNavGroupOpen(group, !isOpen);
}

function setNavGroupOpen(group, open) {
  if (!group) return;
  const submenu = document.querySelector(`[data-submenu="${group}"]`);
  const button = document.querySelector(`[data-menu="${group}"]`);
  if (!submenu || !button) return;
  if (open) {
    document.querySelectorAll("[data-submenu]").forEach((item) => {
      if (item.dataset.submenu !== group) item.hidden = true;
    });
    document.querySelectorAll("[data-menu]").forEach((item) => {
      if (item.dataset.menu !== group) {
        item.setAttribute("aria-expanded", "false");
        item.classList.remove("open");
      }
    });
  }
  submenu.hidden = !open;
  button.setAttribute("aria-expanded", String(open));
  button.classList.toggle("open", open);
  syncNavFlyoutState();
}

function closeNavFlyouts() {
  document.querySelectorAll("[data-submenu]").forEach((item) => item.hidden = true);
  document.querySelectorAll("[data-menu]").forEach((item) => {
    item.setAttribute("aria-expanded", "false");
    item.classList.remove("open");
  });
  syncNavFlyoutState();
}

function syncNavFlyoutState() {
  const hasOpen = [...document.querySelectorAll("[data-submenu]")].some((item) => !item.hidden);
  document.body.classList.toggle("nav-flyout-open", hasOpen);
}

function applyNavSubAction(key, value) {
  if (!key) return;
  const actions = {
    settingsSection: ["vasma-settings-section", value],
    reportType: ["vasma-report-type", value],
    analysisView: ["vasma-analysis-view", value],
    licenseScreen: ["vasma-license-screen", value],
    securitySection: ["vasma-security-section", value],
    adminType: ["vasma-admin-type", value],
    businessAdminSection: ["vasma-business-admin-section", value],
    masterFocus: ["vasma-master-focus", value]
  };
  const action = actions[key];
  if (action) localStorage.setItem(action[0], action[1]);
}

function updateNavSubItems() {
  const current = {
    settingsSection: localStorage.getItem("vasma-settings-section") || "business",
    reportType: localStorage.getItem("vasma-report-type") || "Outstanding Report",
    analysisView: localStorage.getItem("vasma-analysis-view") || "Current View",
    licenseScreen: localStorage.getItem("vasma-license-screen") || "status",
    securitySection: localStorage.getItem("vasma-security-section") || "access",
    adminType: localStorage.getItem("vasma-admin-type") || "jobCards",
    businessAdminSection: localStorage.getItem("vasma-business-admin-section") || "profile",
    masterFocus: localStorage.getItem("vasma-master-focus") || "employee"
  };
  document.querySelectorAll(".nav-subitem").forEach((item) => {
    const key = item.dataset.subkey;
    item.classList.toggle("active", Boolean(key && current[key] === item.dataset.subvalue && item.dataset.view === activeView));
  });
}

function closeMobileMenu() {
  document.body.classList.remove("menu-open");
  const toggle = document.querySelector("#menuToggle");
  const overlay = document.querySelector("#sidebarOverlay");
  toggle?.setAttribute("aria-expanded", "false");
  if (overlay) overlay.hidden = true;
  closeNavFlyouts();
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
  if (value === "admin") return "Transaction Edit";
  if (value === "businessAdmin") return "Business Admin";
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

function formatShortAmount(value) {
  const amount = Number(value || 0);
  if (Math.abs(amount) >= 1000000) {
    const millions = amount / 1000000;
    return `${Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    const thousands = amount / 1000;
    return `${Number.isInteger(thousands) ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
  }
  return String(amount);
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
  return tableRows(collection).find((item) => item.id === id);
}

function tableRows(collection) {
  return Array.isArray(collection) ? collection : [];
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

function jobItemEmployeeName(item) {
  return byId(state.employees, item.attendantId)?.name || item.attendantName || "Unassigned";
}

function categoryName(id) {
  return byId(state.categories, id)?.name || "Unknown";
}

function jobItemCategoryName(job, item) {
  return byId(state.categories, item.categoryId || job.categoryId)?.name || item.categoryName || "Unknown";
}

function jobCategorySummary(job) {
  const names = [...new Set(tableRows(job.items).map((item) => jobItemCategoryName(job, item)))];
  return names.join(", ") || "Unknown";
}

function itemName(categoryId, itemId) {
  return byId(byId(state.categories, categoryId)?.items || [], itemId)?.name || "Unknown";
}

function jobItemServiceName(job, item) {
  return byId(byId(state.categories, item.categoryId || job.categoryId)?.items || [], item.itemId)?.name || item.serviceItemName || "Unknown";
}

function serviceItemRecord(categoryId, itemId) {
  return byId(byId(state.categories, categoryId)?.items || [], itemId);
}

function serviceSubItems(categoryId, itemId) {
  return serviceItemRecord(categoryId, itemId)?.subItems || [];
}

function serviceSubItemNames(categoryId, itemId, subItemIds = []) {
  const subItems = serviceSubItems(categoryId, itemId);
  return (subItemIds || []).map((id) => byId(subItems, id)?.name).filter(Boolean);
}

function subItemChoicesMarkup(categoryId, itemId, selectedIds = [], inputName = "subItemIds") {
  const subItems = serviceSubItems(categoryId, itemId);
  if (!subItems.length) return '<div class="muted small-note">No sub items configured for this service item.</div>';
  const selected = new Set(selectedIds || []);
  return subItems.map((subItem) => `
    <label class="subitem-choice">
      <input type="checkbox" name="${inputName}" value="${subItem.id}" ${selected.has(subItem.id) ? "checked" : ""}>
      <span>${escapeHtml(subItem.name)}</span>
    </label>`).join("");
}

function jobTotal(job) {
  return serviceTotal(job) + purchaseTotal(job);
}

function serviceTotal(job) {
  return tableRows(job.items).reduce((sum, item) => sum + parseMoney(item.amount), 0);
}

function purchaseTotal(job) {
  return (job.purchaseItems || []).reduce((sum, item) => sum + parseMoney(item.amount || parseMoney(item.qty) * parseMoney(item.unitCost)), 0);
}

function paidForJob(jobId) {
  return state.payments.filter((payment) => payment.jobId === jobId).reduce((sum, payment) => sum + tableRows(payment.items).reduce((itemSum, item) => itemSum + parseMoney(item.amount), 0), 0);
}

function outstandingForJob(jobId, excludePaymentId = "") {
  const job = byId(state.jobCards, jobId);
  if (!job) return 0;
  return Math.max(0, jobTotal(job) - paidForJobExcept(jobId, excludePaymentId));
}

function paidForJobExcept(jobId, excludePaymentId = "") {
  return state.payments
    .filter((payment) => payment.jobId === jobId && payment.id !== excludePaymentId)
    .reduce((sum, payment) => sum + tableRows(payment.items).reduce((itemSum, item) => itemSum + parseMoney(item.amount), 0), 0);
}

function paidForLine(jobId, lineId, excludePaymentId = "") {
  return state.payments
    .filter((payment) => payment.jobId === jobId && payment.id !== excludePaymentId)
    .reduce((sum, payment) => {
      return sum + tableRows(payment.items)
        .filter((item) => (item.lineId || item.jobItemId) === lineId)
        .reduce((itemSum, item) => itemSum + parseMoney(item.amount), 0);
    }, 0);
}

function commissionForJob(jobId) {
  return state.commissions.filter((entry) => entry.jobId === jobId).reduce((sum, entry) => sum + parseMoney(entry.amount), 0);
}

function commissionForJobExcept(jobId, excludeCommissionId = "") {
  return state.commissions
    .filter((entry) => entry.jobId === jobId && entry.id !== excludeCommissionId)
    .reduce((sum, entry) => sum + parseMoney(entry.amount), 0);
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
  return state.categories.filter((category) => {
    if (category.id === selectedId) return true;
    return category.active !== false && isCategoryServiceEnabled(category);
  });
}

function activeEmployees(selectedId = "") {
  return state.employees.filter((employee) => employee.active !== false || employee.id === selectedId);
}

function serviceKeyForCategory(category) {
  const name = String(category?.name || "").trim().toLowerCase();
  if (name === "tire service") return "tire";
  if (name === "car wash") return "carWash";
  if (name === "general service") return "general";
  return "";
}

function enabledServiceKeys() {
  const session = businessSession();
  if (session?.allowedServices?.length) return session.allowedServices;
  const services = state.settings?.enabledServices;
  return Array.isArray(services) && services.length ? services : ["tire", "carWash", "general"];
}

function isServiceEnabled(key) {
  return enabledServiceKeys().includes(key);
}

function isCategoryServiceEnabled(category) {
  const key = serviceKeyForCategory(category);
  return !key || isServiceEnabled(key);
}

function updateServiceVisibility() {
  document.querySelectorAll('[data-view="serviceCards"]').forEach((item) => {
    item.hidden = !isServiceEnabled("general");
  });
  if (licenseExpired()) {
    document.querySelectorAll(".nav-item, .nav-subitem").forEach((item) => {
      if (transactionViews().includes(item.dataset.view)) item.hidden = true;
    });
  }
}

function firstActiveCustomerId() {
  return activeCustomers()[0]?.id || state.customers[0]?.id || "";
}

function firstActiveCategoryId() {
  return activeCategories()[0]?.id || state.categories[0]?.id || "";
}

function firstActiveEmployeeId() {
  return activeEmployees()[0]?.id || state.employees[0]?.id || "";
}

function businessSession() {
  try {
    return JSON.parse(localStorage.getItem("vasma_business_session") || "null");
  } catch {
    return null;
  }
}

function currentRecordMode() {
  const session = businessSession();
  if (session?.status === "ACTIVE" || licenseStore().activationCode) return "OFFICIAL";
  return "TRIAL";
}

function dataViewMode() {
  return state.settings?.dataView || "official";
}

function recordMatchesDataView(record) {
  const mode = dataViewMode();
  if (mode === "all") return true;
  if (mode === "trialArchived") return record.recordMode === "TRIAL" && record.isArchived === true;
  return record.isArchived !== true;
}

function recordsForView(collection) {
  return tableRows(collection).filter(recordMatchesDataView);
}

function viewJobCards() {
  return recordsForView(state.jobCards);
}

function viewPayments() {
  const jobIds = new Set(viewJobCards().map((job) => job.id));
  return recordsForView(state.payments).filter((payment) => !payment.jobId || jobIds.has(payment.jobId));
}

function viewExpenses() {
  return recordsForView(state.expenses);
}

function viewCommissions() {
  const jobIds = new Set(viewJobCards().map((job) => job.id));
  return recordsForView(state.commissions).filter((entry) => !entry.jobId || jobIds.has(entry.jobId));
}

function archiveTrialRecords() {
  const stamp = new Date().toISOString();
  state.jobCards.forEach((job) => {
    if (job.recordMode === "TRIAL") {
      job.isArchived = true;
      job.archivedAt = stamp;
      job.archiveReason = "User archived trial records after activation setup";
    }
  });
  [state.payments, state.expenses, state.commissions].forEach((collection) => {
    collection.forEach((record) => {
      if (record.recordMode === "TRIAL") {
        record.isArchived = true;
        record.archivedAt = stamp;
        record.archiveReason = "User archived trial records after activation setup";
      }
    });
  });
}

function promoteTrialRecordsToOfficial() {
  [state.jobCards, state.payments, state.expenses, state.commissions].forEach((collection) => {
    collection.forEach((record) => {
      if (record.recordMode === "TRIAL") {
        record.recordMode = "OFFICIAL";
        record.isArchived = false;
      }
    });
  });
}

function serviceKeysFromCode(serviceCode = "") {
  const code = String(serviceCode);
  const services = [];
  if (code.includes("1")) services.push("tire");
  if (code.includes("2")) services.push("carWash");
  if (code.includes("3")) services.push("general");
  return services;
}

function promptBusinessProfileSetup() {
  const session = businessSession();
  const user = JSON.parse(localStorage.getItem("vasma_user") || "{}");
  if (!session?.mustChangePin || user.role !== "business") return;
  openModal(`
    <h2>Business Setup and User Profile</h2>
    <p class="muted">Complete your business profile, user signature name, and create a new PIN/password before continuing.</p>
    <form id="businessProfileForm" class="form-grid">
      <label>Business ID<input value="${escapeAttr(session.businessId || "")}" readonly></label>
      <label>Business Code<input value="${escapeAttr(session.businessCode)}" readonly></label>
      <label>Package<input value="${escapeAttr(session.packageName || session.serviceCode)}" readonly></label>
      <label>Business Name<input name="businessName" value="${escapeAttr(session.businessName || "")}" required></label>
      <label>Owner Name<input name="ownerName" value="${escapeAttr(session.ownerName || "")}" required></label>
      <label>User Name / Signature Name<input name="userName" value="${escapeAttr(session.userName || session.ownerName || "")}" required></label>
      <label>Business Location<input name="location" value="${escapeAttr(session.location || "")}" required></label>
      <label>Mobile Number<input name="mobile" value="${escapeAttr(session.mobile || "")}" required></label>
      <div class="wide feature-list">
        ${["tire", "carWash", "general"].map((service) => `<label><input type="checkbox" name="setupServices" value="${service}" ${(session.allowedServices || ["tire", "carWash", "general"]).includes(service) ? "checked" : ""}> ${escapeHtml(serviceLabel(service))}</label>`).join("")}
      </div>
      <label>New PIN / Password<input name="newPin" type="password" required minlength="4"></label>
      <label>Confirm PIN / Password<input name="confirmPin" type="password" required minlength="4"></label>
      <label class="wide">Trial Data Decision<select name="trialDataAction">
        <option value="continue">Continue with trial records as official records</option>
        <option value="archive">Archive trial records and start official records clean</option>
      </select></label>
      <div class="wide actions"><button class="primary">Save Profile and Continue</button></div>
    </form>`);
  document.querySelector("#modal .close-modal").hidden = true;
  document.querySelector("#businessProfileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.target);
    if (data.newPin !== data.confirmPin) return toast("PIN confirmation does not match");
    const requestedServices = [...event.target.querySelectorAll("[name=setupServices]:checked")].map((input) => input.value);
    if (!requestedServices.length) return toast("Select at least one service.");
    const updated = { ...session, ...data, allowedServices: requestedServices, pin: data.newPin, mustChangePin: false, status: session.status || "TRIAL" };
    delete updated.newPin;
    delete updated.confirmPin;
    localStorage.setItem("vasma_business_session", JSON.stringify(updated));
    updateStoredBusinessAccount(updated);
    state.settings = {
      ...state.settings,
      businessId: session.businessId || state.settings.businessId,
      businessName: data.businessName,
      ownerName: data.ownerName,
      userName: data.userName || data.ownerName,
      location: data.location,
      mobile: data.mobile,
      enabledServices: requestedServices
    };
    if (data.trialDataAction === "archive") {
      archiveTrialRecords();
      state.settings.dataView = "official";
    } else {
      promoteTrialRecordsToOfficial();
      state.settings.dataView = "official";
    }
    save();
    document.querySelector("#modal .close-modal").hidden = false;
    closeModal();
    renderAll();
    toast("Business profile saved");
  });
}

function updateStoredBusinessAccount(session) {
  try {
    const accounts = JSON.parse(localStorage.getItem("vasma_business_accounts") || "[]");
    const next = accounts.map((account) => account.businessCode === session.businessCode ? { ...account, ...session } : account);
    localStorage.setItem("vasma_business_accounts", JSON.stringify(next));
  } catch {
    // local account cache is optional
  }
}

function renderDashboard() {
  const range = dashboardDateRange();
  const dashboardJobs = filterByDate(viewJobCards(), range);
  const dashboardPayments = filterByDate(viewPayments(), range);
  const dashboardExpenses = filterByDate(viewExpenses(), range);
  const dashboardCommissions = filterByDate(viewCommissions(), range);
  const totalBilled = dashboardJobs.reduce((sum, job) => sum + jobTotal(job), 0);
  const totalPaid = dashboardPayments.reduce((sum, payment) => sum + tableRows(payment.items).reduce((x, item) => x + parseMoney(item.amount), 0), 0);
  const totalOutstanding = dashboardJobs.reduce((sum, job) => sum + outstandingForJob(job.id), 0);
  const expenses = dashboardExpenses.reduce((sum, expense) => sum + parseMoney(expense.amount), 0);
  const commissions = dashboardCommissions.reduce((sum, entry) => sum + parseMoney(entry.amount), 0);
  const panel = dashboardActivePanel();
  const statusRows = dashboardStatusTotals(dashboardJobs);
  const pendingCommissions = commissionPendingJobs(dashboardJobs);
  const totals = { totalBilled, totalPaid, totalOutstanding, expenses, commissions, pendingCommissions };
  views.dashboard.innerHTML = `
    <div class="dashboard-metrics dashboard-template-metrics">
      ${dashboardMetricCard("Job Cards", dashboardJobs.length, `${statusRows.confirmed} confirmed`, miniBars([dashboardJobs.length, statusRows.confirmed, statusRows.unconfirmed]))}
      ${dashboardMetricCard("Billed", formatMoney(totalBilled), `Avg ${formatMoney(dashboardJobs.length ? totalBilled / dashboardJobs.length : 0)}`, miniWave([totalBilled, totalPaid, totalOutstanding]))}
      ${dashboardMetricCard("Paid", formatMoney(totalPaid), `${formatShortAmount(totalPaid)} received`, miniBars([totalPaid, commissions, expenses]))}
      ${dashboardMetricCard("Outstanding", formatMoney(totalOutstanding), `${pendingCommissions.length} commission pending`, miniBars([totalOutstanding, pendingCommissions.length, statusRows.unpaid]))}
    </div>
    <div class="dashboard-template-grid">
      <section class="panel dashboard-chart-shell">
        <div class="dashboard-chart-header">
          <div class="dashboard-switch" role="tablist" aria-label="Dashboard view">
            ${dashboardSwitchButton("snapshot", "Overview")}
            ${dashboardSwitchButton("status", "Job Status")}
            ${dashboardSwitchButton("performance", "Service Performance")}
          </div>
          <div class="dashboard-range">
            <div class="period-tabs" role="tablist" aria-label="Dashboard period">
              ${dashboardPeriodButton("today", "Today")}
              ${dashboardPeriodButton("mtd", "MTD")}
              ${dashboardPeriodButton("ytd", "YTD")}
              ${dashboardPeriodButton("custom", "Custom")}
            </div>
            <label class="${range.mode === "custom" ? "" : "dashboard-custom-date"}">From<input type="date" id="dashboardDateFrom" value="${range.from}"></label>
            <label class="${range.mode === "custom" ? "" : "dashboard-custom-date"}">To<input type="date" id="dashboardDateTo" value="${range.to}"></label>
            <span class="dashboard-range-pill">${formatDateRange(range.from, range.to)}</span>
          </div>
        </div>
        <div class="dashboard-main single">
          ${dashboardPanelMarkup(panel, dashboardJobs, dashboardCommissions, totals)}
        </div>
      </section>
      ${dashboardInsightPanel(panel, dashboardJobs, dashboardCommissions, totals)}
    </div>`;
  wireDashboardRange();
  document.querySelectorAll("[data-dashboard-period]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem("vasma-dashboard-range-mode", button.dataset.dashboardPeriod);
      renderDashboard();
    });
  });
  document.querySelectorAll("[data-dashboard-panel]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem("vasma-dashboard-panel", button.dataset.dashboardPanel);
      renderDashboard();
    });
  });
  document.querySelectorAll("[data-dashboard-performance]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem("vasma-dashboard-performance-panel", button.dataset.dashboardPerformance);
      renderDashboard();
    });
  });
}

function metric(label, value) {
  return `<div class="metric"><span class="muted">${label}</span><strong>${value}</strong></div>`;
}

function dashboardMetricCard(label, value, detail, visual = "") {
  return `<div class="metric dashboard-card">
    <div>
      <span class="muted">${escapeHtml(label)}</span>
      <strong>${value}</strong>
      <small>${escapeHtml(detail || "")}</small>
    </div>
    ${visual}
  </div>`;
}

function miniBars(values = []) {
  const max = Math.max(...values.map((value) => Number(value) || 0), 1);
  return `<div class="mini-bars" aria-hidden="true">${values.map((value, index) => {
    const height = Math.max(8, ((Number(value) || 0) / max) * 52);
    return `<span class="mini-bar mini-bar-${index + 1}" style="height:${height}px"></span>`;
  }).join("")}</div>`;
}

function miniWave(values = []) {
  const max = Math.max(...values.map((value) => Number(value) || 0), 1);
  const points = values.length ? values.map((value, index) => {
    const x = values.length === 1 ? 100 : (index / (values.length - 1)) * 200;
    const y = 64 - ((Number(value) || 0) / max) * 50;
    return `${x},${y}`;
  }).join(" ") : "0,58 100,58 200,58";
  return `<svg class="mini-wave" viewBox="0 0 200 70" aria-hidden="true">
    <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline>
  </svg>`;
}

function dashboardActivePanel() {
  const panel = localStorage.getItem("vasma-dashboard-panel") || "snapshot";
  return ["snapshot", "status", "performance"].includes(panel) ? panel : "snapshot";
}

function dashboardSwitchButton(key, label) {
  const active = dashboardActivePanel() === key;
  return `<button type="button" class="dashboard-switch-button ${active ? "active" : ""}" data-dashboard-panel="${key}" role="tab" aria-selected="${active}">${label}</button>`;
}

function dashboardDateRange() {
  const mode = localStorage.getItem("vasma-dashboard-range-mode") || "today";
  const now = new Date();
  const end = today();
  if (mode === "mtd") {
    return { mode, from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10), to: end };
  }
  if (mode === "ytd") {
    return { mode, from: new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10), to: end };
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
  const labels = { today: "Today", mtd: "MTD", ytd: "YTD", custom: "Custom" };
  return `${labels[range.mode] || "Today"}: ${formatDateRange(range.from, range.to)}`;
}

function wireDashboardRange() {
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

function dashboardPeriodButton(key, label) {
  const active = dashboardDateRange().mode === key;
  return `<button type="button" class="dashboard-switch-button ${active ? "active" : ""}" data-dashboard-period="${key}" role="tab" aria-selected="${active}">${label}</button>`;
}

function dashboardPanelMarkup(panel, jobs, commissions, totals) {
  if (panel === "status") return dashboardStatusPanel(jobs);
  if (panel === "performance") return dashboardPerformancePanel(jobs, commissions);
  return dashboardSnapshotPanel(totals);
}

function dashboardSnapshotPanel({ totalPaid, commissions, expenses, totalBilled, totalOutstanding }) {
  return `<div class="panel dashboard-snapshot dashboard-active-panel">
    <h2>Overview</h2>
    <table>
      <tbody>
        <tr><th>Income received</th><td>${formatMoney(totalPaid)}</td></tr>
        <tr><th>Billed</th><td>${formatMoney(totalBilled)}</td></tr>
        <tr><th>Outstanding</th><td>${formatMoney(totalOutstanding)}</td></tr>
        <tr><th>Commissions</th><td>${formatMoney(commissions)}</td></tr>
        <tr><th>Expenses</th><td>${formatMoney(expenses)}</td></tr>
        <tr><th>Balance</th><td><strong>${formatMoney(totalPaid - commissions - expenses)}</strong></td></tr>
      </tbody>
    </table>
  </div>`;
}

function dashboardFinancePanel({ totalPaid, commissions, expenses, totalBilled, totalOutstanding }) {
  const balance = totalPaid - commissions - expenses;
  const rows = [
    { label: "Billed", value: totalBilled },
    { label: "Paid", value: totalPaid },
    { label: "Outstanding", value: totalOutstanding },
    { label: "Commissions", value: commissions },
    { label: "Expenses", value: expenses },
    { label: "Balance", value: balance }
  ];
  return `<div class="dashboard-active-panel">
    <div class="dashboard-status-grid">
      ${metric("Income Received", formatMoney(totalPaid))}
      ${metric("Balance", formatMoney(balance))}
    </div>
    ${ratioBarChartPanel("Finance Summary", rows, "Finance Category")}
  </div>`;
}

function dashboardCommissionPanel(jobs, commissions, totals) {
  const attendantRows = rankCommissionsByAttendant(commissions).slice(0, 7);
  const pending = totals.pendingCommissions || commissionPendingJobs(jobs);
  return `<div class="dashboard-active-panel">
    <div class="dashboard-status-grid">
      ${metric("Commission Paid", formatMoney(totals.commissions || 0))}
      ${metric("Commission Pending", pending.length)}
    </div>
    ${ratioBarChartPanel("Attendant Commission Summary", attendantRows, "Attendant")}
  </div>`;
}

function dashboardStatusPanel(jobs) {
  const pendingCommissions = commissionPendingJobs(jobs);
  const statusRows = dashboardStatusTotals(jobs);
  const chartRows = [
    { label: "Total Job Cards", value: jobs.length },
    { label: "Paid", value: statusRows.paid },
    { label: "Partially Paid", value: statusRows.partial },
    { label: "Unpaid", value: statusRows.unpaid },
    { label: "Confirmed Work", value: statusRows.confirmed },
    { label: "Pending Confirmation", value: statusRows.unconfirmed },
    { label: "Commission Pending", value: pendingCommissions.length }
  ];
  return `<div class="panel dashboard-active-panel">
    <h2>Job Card Status</h2>
    ${jobStatusBarChart(chartRows)}
  </div>`;
}

function dashboardInsightPanel(panel, jobs, commissions, totals) {
  const rows = dashboardInsightRows(panel, jobs, commissions, totals);
  return `<aside class="panel dashboard-insights">
    <span class="eyebrow">Quick Insight</span>
    <h2>${dashboardInsightTitle(panel)}</h2>
    <div class="dashboard-insight-list">
      ${rows.length ? rows.map((row, index) => `
        <div class="dashboard-insight-row">
          <span>${index + 1}</span>
          <div><strong>${escapeHtml(row.label)}</strong><small>${escapeHtml(row.meta || "")}</small></div>
          <b>${escapeHtml(row.value)}</b>
        </div>`).join("") : '<div class="empty">No data for this period.</div>'}
    </div>
  </aside>`;
}

function dashboardInsightTitle(panel) {
  if (panel === "status") return "Pending Confirmation";
  if (panel === "performance") return "Top Service Items";
  return "Top Service Items";
}

function dashboardInsightRows(panel, jobs, commissions, totals) {
  if (panel === "status") {
    return jobs.filter((job) => !tableRows(job.items).every((item) => item.confirmed)).slice(0, 6).map((job) => ({
      label: job.ref,
      meta: customerName(job.customerId),
      value: formatMoney(jobTotal(job))
    }));
  }
  if (panel === "performance") {
    return rankJobItems(jobs).slice(0, 6).map((row) => ({
      label: row.label,
      meta: "Service item",
      value: formatShortAmount(row.value)
    }));
  }
  return rankJobItems(jobs).slice(0, 6).map((row) => ({
    label: row.label,
    meta: "Service item",
    value: formatShortAmount(row.value)
  }));
}

function dashboardStatusTotals(jobs) {
  return jobs.reduce((totals, job) => {
    const total = jobTotal(job);
    const paid = paidForJob(job.id);
    if (paid >= total && total > 0) totals.paid += 1;
    else if (paid > 0) totals.partial += 1;
    else totals.unpaid += 1;
    if (tableRows(job.items).every((item) => item.confirmed)) totals.confirmed += 1;
    else totals.unconfirmed += 1;
    return totals;
  }, { paid: 0, partial: 0, unpaid: 0, confirmed: 0, unconfirmed: 0 });
}

function jobStatusBarChart(rows) {
  const chartWidth = 920;
  const chartHeight = 390;
  const left = 72;
  const right = 24;
  const top = 48;
  const bottom = 116;
  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const maxY = Math.max(7, ...rows.map((row) => row.value), 1);
  const step = plotWidth / rows.length;
  const barWidth = Math.min(82, step * 0.65);
  const grid = Array.from({ length: maxY + 1 }, (_, value) => value);
  return `<div class="status-chart-card">
    <svg class="status-bar-chart" viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="Job Card Status Summary bar chart">
      <title>Job Card Status Summary</title>
      <text class="status-chart-title" x="${chartWidth / 2}" y="26" text-anchor="middle">Job Card Status Summary</text>
      ${grid.map((value) => {
        const y = top + plotHeight - (value / maxY) * plotHeight;
        return `<g>
          <line class="status-grid-line" x1="${left}" y1="${y}" x2="${chartWidth - right}" y2="${y}"></line>
          <text class="status-axis-tick" x="${left - 14}" y="${y + 4}" text-anchor="end">${value}</text>
        </g>`;
      }).join("")}
      <line class="status-axis-line" x1="${left}" y1="${top}" x2="${left}" y2="${top + plotHeight}"></line>
      <line class="status-axis-line" x1="${left}" y1="${top + plotHeight}" x2="${chartWidth - right}" y2="${top + plotHeight}"></line>
      <text class="status-axis-title" transform="translate(24 ${top + plotHeight / 2}) rotate(-90)" text-anchor="middle">Number of Job Cards</text>
      <text class="status-axis-title" x="${left + plotWidth / 2}" y="${chartHeight - 8}" text-anchor="middle">Status Category</text>
      ${rows.map((row, index) => {
        const x = left + step * index + (step - barWidth) / 2;
        const barHeight = row.value ? (row.value / maxY) * plotHeight : 2;
        const y = top + plotHeight - barHeight;
        const labelX = x + barWidth / 2;
        const labelY = top + plotHeight + 26;
        return `<g>
          <rect class="status-bar" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="2"></rect>
          <text class="status-bar-value" x="${labelX}" y="${Math.max(top + 14, y - 8)}" text-anchor="middle">${row.value}</text>
          <text class="status-x-label" x="${labelX}" y="${labelY}" text-anchor="end" transform="rotate(-25 ${labelX} ${labelY})">${escapeHtml(row.label)}</text>
        </g>`;
      }).join("")}
    </svg>
  </div>`;
}

function ratioBarChartPanel(title, rows, xAxisTitle = "Category") {
  if (!rows.length) return `<div class="panel"><h3>${title}</h3><div class="empty">No data for this period.</div></div>`;
  return `<div class="panel ratio-chart-panel">
    ${ratioBarChart(title, rows.slice(0, 7), xAxisTitle)}
  </div>`;
}

function ratioBarChart(title, rows, xAxisTitle = "Category") {
  const chartWidth = 920;
  const chartHeight = 390;
  const left = 72;
  const right = 24;
  const top = 48;
  const bottom = 116;
  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  const step = plotWidth / rows.length;
  const barWidth = Math.min(82, step * 0.65);
  const grid = [0, 25, 50, 75, 100];
  return `<div class="status-chart-card">
    <svg class="status-bar-chart ratio-bar-chart" viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="${escapeAttr(title)} bar chart">
      <title>${escapeHtml(title)}</title>
      <text class="status-chart-title" x="${chartWidth / 2}" y="26" text-anchor="middle">${escapeHtml(title)}</text>
      ${grid.map((value) => {
        const y = top + plotHeight - (value / 100) * plotHeight;
        return `<g>
          <line class="status-grid-line" x1="${left}" y1="${y}" x2="${chartWidth - right}" y2="${y}"></line>
          <text class="status-axis-tick" x="${left - 14}" y="${y + 4}" text-anchor="end">${value}%</text>
        </g>`;
      }).join("")}
      <line class="status-axis-line" x1="${left}" y1="${top}" x2="${left}" y2="${top + plotHeight}"></line>
      <line class="status-axis-line" x1="${left}" y1="${top + plotHeight}" x2="${chartWidth - right}" y2="${top + plotHeight}"></line>
      <text class="status-axis-title" transform="translate(24 ${top + plotHeight / 2}) rotate(-90)" text-anchor="middle">Ratio to Highest Value</text>
      <text class="status-axis-title" x="${left + plotWidth / 2}" y="${chartHeight - 8}" text-anchor="middle">${escapeHtml(xAxisTitle)}</text>
      ${rows.map((row, index) => {
        const ratio = maxValue ? (row.value / maxValue) * 100 : 0;
        const x = left + step * index + (step - barWidth) / 2;
        const barHeight = ratio ? (ratio / 100) * plotHeight : 2;
        const y = top + plotHeight - barHeight;
        const labelX = x + barWidth / 2;
        const labelY = top + plotHeight + 26;
        return `<g>
          <rect class="status-bar ratio-status-bar" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="2"></rect>
          <text class="status-bar-value" x="${labelX}" y="${Math.max(top + 14, y - 8)}" text-anchor="middle">${formatShortAmount(row.value)}</text>
          <text class="status-x-label" x="${labelX}" y="${labelY}" text-anchor="end" transform="rotate(-25 ${labelX} ${labelY})">${escapeHtml(row.label)}</text>
        </g>`;
      }).join("")}
    </svg>
  </div>`;
}

function commissionPendingJobs(jobs = state.jobCards) {
  return jobs.filter((job) => {
    const hasConfirmedWork = tableRows(job.items).some((item) => item.confirmed);
    const hasPayment = paidForJob(job.id) > 0;
    return (hasConfirmedWork || hasPayment) && commissionForJob(job.id) <= 0;
  });
}

function commissionAllocationJobs(currentJobId = "") {
  const pending = commissionPendingJobs(viewJobCards());
  if (!currentJobId || pending.some((job) => job.id === currentJobId)) return pending;
  const currentJob = byId(viewJobCards(), currentJobId);
  return currentJob ? [currentJob, ...pending] : pending;
}

function showCommissionPendingDashboard() {
  const jobs = commissionPendingJobs(filterByDate(viewJobCards(), dashboardDateRange()));
  openModal(`
    <div class="stack">
      <h2>Commission Pending</h2>
      <p class="muted">Job cards with confirmed work or payment recorded, but no commission allocated.</p>
      <div class="panel table-wrap">
        <table>
          <thead><tr><th>Job Card</th><th>Customer</th><th>Paid</th><th>Total</th></tr></thead>
          <tbody>${jobs.map((job) => `<tr><td><strong>${escapeHtml(job.ref)}</strong></td><td>${escapeHtml(customerName(job.customerId))}</td><td>${formatMoney(paidForJob(job.id))}</td><td>${formatMoney(jobTotal(job))}</td></tr>`).join("") || emptyRow(4)}</tbody>
        </table>
      </div>
      <div class="actions"><button class="primary" onclick="document.querySelector('#modal').close()">OK</button></div>
    </div>`);
}

function dashboardPerformancePanel(jobs, commissions = []) {
  const categoryRows = rankJobItems(jobs, (job, item) => jobItemCategoryName(job, item)).slice(0, 7);
  const serviceRows = rankJobItems(jobs).slice(0, 7);
  const attendantRows = rankCommissionsByAttendant(commissions).slice(0, 7);
  const purchaseTotalAmount = jobs.reduce((sum, job) => sum + purchaseTotal(job), 0);
  const billed = jobs.reduce((sum, job) => sum + jobTotal(job), 0);
  const averageBill = jobs.length ? billed / jobs.length : 0;
  const active = dashboardPerformanceActivePanel();
  const graph = active === "items"
    ? ratioBarChartPanel("Service Item Summary", serviceRows, "Service Item")
    : active === "commission"
      ? ratioBarChartPanel("Attendant Commission Summary", attendantRows, "Attendant")
      : ratioBarChartPanel("Service Category Summary", categoryRows, "Service Category");
  return `<div class="dashboard-performance dashboard-active-panel">
    <div class="panel">
      <h2>Service Performance</h2>
      <div class="dashboard-switch sub-tabs" role="tablist" aria-label="Service performance view">
        ${dashboardPerformanceSwitchButton("category", "Service Category")}
        ${dashboardPerformanceSwitchButton("items", "Service Item")}
        ${dashboardPerformanceSwitchButton("commission", "Commission")}
      </div>
      <div class="dashboard-status-grid">
        ${metric("Purchased Materials", formatMoney(purchaseTotalAmount))}
        ${metric("Average Bill Value", formatMoney(averageBill))}
      </div>
    </div>
    <div class="dashboard-performance-graph">${graph}</div>
  </div>`;
}

function dashboardPerformanceActivePanel() {
  const panel = localStorage.getItem("vasma-dashboard-performance-panel") || "category";
  return ["category", "items", "commission"].includes(panel) ? panel : "category";
}

function dashboardPerformanceSwitchButton(key, label) {
  const active = dashboardPerformanceActivePanel() === key;
  return `<button type="button" class="dashboard-switch-button ${active ? "active" : ""}" data-dashboard-performance="${key}" role="tab" aria-selected="${active}">${label}</button>`;
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
  if (!requireTransactionAccess()) return;
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
    <div class="panel table-wrap">${jobTable(viewJobCards())}</div>`;
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
  if (!requireTransactionAccess()) return;
  if (id && paidForJob(id) > 0 && !arguments[1]?.admin) {
    return toast("Paid job cards are locked. Use Transaction Edit for controlled changes.");
  }
  const job = byId(state.jobCards, id) || {
    date: today(),
    customerId: firstActiveCustomerId(),
    mileage: "",
    items: [],
    purchaseItems: [],
    notes: ""
  };
  if (!job.items.length) job.items = [{ id: uid(), categoryId: firstActiveCategoryId(), itemId: "", attendantId: firstActiveEmployeeId(), action: "", amount: "" }];
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
      const itemSelect = row.querySelector("[name=itemId]");
      itemSelect.innerHTML = options(byId(state.categories, select.value)?.items || [], "");
      row.querySelector("[data-subitems]").innerHTML = subItemChoicesMarkup(select.value, itemSelect.value, []);
    }));
    rows.querySelectorAll("[name=itemId]").forEach((select) => select.addEventListener("change", () => {
      const row = select.closest(".service-row");
      row.querySelector("[data-subitems]").innerHTML = subItemChoicesMarkup(row.querySelector("[name=categoryId]").value, select.value, []);
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
    job.items.push({ id: uid(), categoryId: firstActiveCategoryId(), itemId: "", attendantId: firstActiveEmployeeId(), action: "", amount: "" });
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
      amount: parseMoney(row.querySelector("[name=amount]").value),
      subItemIds: Array.from(row.querySelectorAll("[name=subItemIds]:checked")).map((input) => input.value),
      subItemStatus: {},
      remarks: row.dataset.remarks || "",
      categoryName: categoryName(row.querySelector("[name=categoryId]").value),
      serviceItemName: itemName(row.querySelector("[name=categoryId]").value, row.querySelector("[name=itemId]").value),
      attendantName: employeeName(row.querySelector("[name=attendantId]").value)
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
    if (state.jobCards.some((entry) => entry.id !== id && entry.ref === job.ref)) return toast("Job Card Ref must be unique");
    data.mileage = parseMoney(data.mileage);
    const payload = { ...data, items, purchaseItems };
    if (id) Object.assign(byId(state.jobCards, id), payload);
    else state.jobCards.push({ id: uid(), ref: nextJobRef(), recordMode: currentRecordMode(), isArchived: false, ...payload });
    commit("Job card saved");
  });
}

function serviceRow(index, item) {
  const categoryId = item.categoryId || firstActiveCategoryId();
  const itemId = item.itemId || byId(state.categories, categoryId)?.items?.[0]?.id || "";
  return `
    <div class="service-row" data-id="${item.id || ""}" data-confirmed="${Boolean(item.confirmed)}" data-action="${escapeAttr(item.action || item.status || "")}" data-remarks="${escapeAttr(item.remarks || "")}">
      <select name="categoryId" aria-label="Category" required>${options(activeCategories(categoryId), categoryId, (category) => `${category.name}${category.active === false ? " (Inactive)" : ""}`)}</select>
      <select name="itemId" aria-label="Service Item" required>${options(byId(state.categories, categoryId)?.items || [], itemId)}</select>
      <select name="attendantId" aria-label="Attendant" required>${options(activeEmployees(item.attendantId), item.attendantId, (employee) => `${employee.name}${employee.active === false ? " (Inactive)" : ""}`)}</select>
      <input name="amount" aria-label="Amount (Tsh)" inputmode="decimal" value="${item.amount || ""}" placeholder="1,000.00" required>
      <button type="button" class="danger icon" data-remove="${index}" aria-label="Remove">x</button>
      <div class="subitem-choices" data-subitems>${subItemChoicesMarkup(categoryId, itemId, item.subItemIds || [])}</div>
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
  return `<h3>Service Items</h3><table><thead><tr><th>Category</th><th>Item</th><th>Sub Items</th><th>Attendant</th><th>Status</th><th>Amount</th></tr></thead><tbody>
    ${tableRows(job.items).map((item) => `<tr class="job-service-detail-row">
      <td><strong>${escapeHtml(jobItemCategoryName(job, item))}</strong></td>
      <td><strong>${escapeHtml(jobItemServiceName(job, item))}</strong></td>
      <td>${jobSubItemsMarkup(item)}</td>
      <td>${escapeHtml(jobItemEmployeeName(item))}</td>
      <td>${escapeHtml(item.status || item.action || (item.confirmed ? "Confirmed" : ""))}</td>
      <td>${formatMoney(item.amount)}</td>
    </tr>`).join("")}
  </tbody></table>`;
}

function jobSubItemsMarkup(item) {
  const names = serviceSubItemNames(item.categoryId, item.itemId, item.subItemIds);
  const subItems = names.length ? names : serviceSubItems(item.categoryId, item.itemId).map((subItem) => subItem.name);
  if (!subItems.length) return '<span class="muted">No sub items</span>';
  return `<div class="job-subitems-list">
    ${subItems.map((name) => `<span class="job-subitem-chip">${escapeHtml(name)}</span>`).join("")}
  </div>`;
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
  const serviceLines = tableRows(job.items).map((item) => ({
    id: item.id,
    type: "Service",
    label: `${jobItemCategoryName(job, item)} - ${jobItemServiceName(job, item)}`,
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
  const jobs = confirmationJobs();
  let selectedJobId = localStorage.getItem("vasma-confirmation-job") || "";
  if (selectedJobId && !jobs.some((job) => job.id === selectedJobId)) {
    localStorage.removeItem("vasma-confirmation-job");
    selectedJobId = "";
  }
  views.confirmation.innerHTML = `
    <div class="toolbar">
      <div><h2>Work Confirmation and Bill Printing</h2><p class="muted">Filter by job card number, verify work, then preview and export the bill.</p></div>
    </div>
    <div class="panel filter-row">
      <label>Job Card Number<select id="confirmationJobFilter"><option value="">Select job card...</option>${jobs.map((job) => `<option value="${job.id}" ${job.id === selectedJobId ? "selected" : ""}>${escapeHtml(job.ref)} - ${escapeHtml(customerName(job.customerId))}</option>`).join("")}</select></label>
    </div>
    <div id="confirmationResult" style="margin-top:14px">${jobs.length ? '<div class="empty">Select a job card to display work confirmation.</div>' : '<div class="empty">No unpaid or partially paid job cards available for confirmation.</div>'}</div>`;
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

function confirmationJobs() {
  return state.jobCards.filter((job) => outstandingForJob(job.id) > 0);
}

function showConfirmationJob(jobId) {
  const job = byId(state.jobCards, jobId);
  if (!job || outstandingForJob(job.id) <= 0) {
    localStorage.removeItem("vasma-confirmation-job");
    document.querySelector("#confirmationResult").innerHTML = '<div class="empty">This job card is fully paid and no longer appears in bill confirmation.</div>';
    return;
  }
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
      <label class="wide confirmation-remarks">Comments / Remarks<textarea name="confirmationRemarks" placeholder="Add final comments or remarks">${escapeHtml(job.confirmationRemarks || "")}</textarea></label>
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
      <thead><tr><th>Category</th><th>Service Item</th><th>Attendant</th><th>Job Status</th><th>Completed Sub Items</th></tr></thead>
      <tbody>${job.items.map((item) => `<tr data-service-id="${item.id}">
        <td>${escapeHtml(jobItemCategoryName(job, item))}</td>
        <td>${escapeHtml(jobItemServiceName(job, item))}</td>
        <td>${escapeHtml(jobItemEmployeeName(item))}</td>
        <td><select name="jobStatus">${state.actions.map((a) => `<option value="${escapeAttr(a.name)}" ${((item.action || item.status) === a.name) ? "selected" : ""}>${escapeHtml(a.name)}</option>`).join("")}</select></td>
        <td><div class="subitem-choices confirmation-subitems">${confirmationSubItemsMarkup(item)}</div></td>
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
    item.action = row.querySelector("[name=jobStatus]").value;
    item.status = item.action;
    item.subItemStatus = {};
    row.querySelectorAll("[name=completedSubItem]").forEach((input) => {
      item.subItemStatus[input.value] = input.checked;
    });
    item.confirmed = row.querySelectorAll("[name=completedSubItem]").length
      ? Array.from(row.querySelectorAll("[name=completedSubItem]")).some((input) => input.checked)
      : row.querySelector("[name=lineConfirmed]")?.checked || false;
  });
  job.confirmationRemarks = document.querySelector("[name=confirmationRemarks]")?.value || "";
  document.querySelectorAll("[data-purchase-id]").forEach((row) => {
    const item = byId(job.purchaseItems, row.dataset.purchaseId);
    item.status = row.querySelector("[name=status]").value;
  });
  save();
  renderAll();
  if (outstandingForJob(jobId) > 0) showConfirmationJob(jobId);
  toast("Work confirmation saved");
  alertUnpaidCommission(job);
}

function confirmationSubItemsMarkup(item) {
  const selectedSubItems = (item.subItemIds || []).length
    ? item.subItemIds.map((id) => byId(serviceSubItems(item.categoryId, item.itemId), id)).filter(Boolean)
    : serviceSubItems(item.categoryId, item.itemId);
  if (!selectedSubItems.length) {
    return `<label class="subitem-choice"><input type="checkbox" name="lineConfirmed" ${item.confirmed ? "checked" : ""}><span>Service done</span></label>`;
  }
  return selectedSubItems.map((subItem) => `
    <label class="subitem-choice">
      <input type="checkbox" name="completedSubItem" value="${subItem.id}" ${item.subItemStatus?.[subItem.id] ? "checked" : ""}>
      <span>${escapeHtml(subItem.name)}</span>
    </label>`).join("");
}

function alertUnpaidCommission(job) {
  const hasConfirmedWork = tableRows(job.items).some((item) => item.confirmed);
  if (!hasConfirmedWork || commissionForJob(job.id) > 0) return;
  openModal(`
    <div class="stack">
      <h2>Commission Not Allocated</h2>
      <p>This job card has confirmed work, but commission has not been allocated or paid.</p>
      <div class="panel">
        <p>Job Card Number</p>
        <h2>${escapeHtml(job.ref)}</h2>
      </div>
      <div class="actions">
        <button class="primary" onclick="document.querySelector('#modal').close()">OK</button>
      </div>
    </div>`);
}

function generalServiceItems(job) {
  return tableRows(job.items).filter((item) => jobItemCategoryName(job, item).toLowerCase() === "general service");
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
  return String(name || "").toLowerCase() === "general service";
}

function serviceCardSelectableItems() {
  return state.categories
    .filter((category) => isServiceCardCategory(category.name) && isCategoryServiceEnabled(category))
    .flatMap((category) => category.items.map((item) => ({ id: `${category.id}:${item.id}`, categoryId: category.id, itemId: item.id, name: item.name })));
}

function serviceCardItemOptions(selectedName = "") {
  return serviceCardSelectableItems()
    .map((item) => `<option value="${escapeAttr(item.name)}" ${item.name === selectedName ? "selected" : ""}>${escapeHtml(item.name)}</option>`)
    .join("");
}

function serviceCardBaseItems(job) {
  return tableRows(job.items).filter((item) => isServiceCardCategory(jobItemCategoryName(job, item)) && isCategoryServiceEnabled(byId(state.categories, item.categoryId || job.categoryId)));
}

function serviceCardRows(job) {
  const saved = job.serviceCard?.lines || [];
  const selectableNames = new Set(serviceCardSelectableItems().map((item) => item.name));
  if (saved.length) {
    return saved.map((line) => ({
      id: line.id || line.jobItemId || uid(),
      jobItemId: line.jobItemId || "",
      itemName: line.itemName || itemName(byId(tableRows(job.items), line.jobItemId)?.categoryId || "", byId(tableRows(job.items), line.jobItemId)?.itemId || ""),
      checked: Boolean(line.checked ?? line.done),
      remarks: line.remarks || ""
    })).filter((line) => selectableNames.has(line.itemName));
  }
  return serviceCardBaseItems(job).map((item) => ({
    id: item.id,
    jobItemId: item.id,
    itemName: jobItemServiceName(job, item),
    checked: Boolean(item.confirmed),
    remarks: ""
  }));
}

function renderServiceCards() {
  if (!isServiceEnabled("general")) {
    views.serviceCards.innerHTML = `
      <div class="panel stack">
        <h2>Service Cards</h2>
        <p class="muted">General Service is not authorized for this business setup. Select the right package on the landing page or ask Super Admin to update this business package.</p>
      </div>`;
    return;
  }
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
        <label>Service Item<select id="serviceCardItemSelect"><option value="">Select general service item...</option>${selectable.map((item) => `<option value="${escapeAttr(item.name)}">${escapeHtml(item.name)}</option>`).join("")}</select></label>
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
    <td><select name="itemName" required><option value="">Select general service item...</option>${serviceCardItemOptions(line.itemName || "")}</select></td>
    <td><input class="small-check" type="checkbox" name="checked" ${line.checked ? "checked" : ""}></td>
    <td><input name="remarks" value="${escapeAttr(line.remarks || "")}" placeholder="Optional"></td>
    <td><button type="button" class="danger icon" onclick="this.closest('tr').remove()" aria-label="Remove">x</button></td>
  </tr>`;
}

function saveServiceCard(jobId) {
  const job = byId(state.jobCards, jobId);
  const form = document.querySelector("#serviceCardForm");
  const data = formData(form);
  const selectableNames = new Set(serviceCardSelectableItems().map((item) => item.name));
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
    })).filter((line) => selectableNames.has(line.itemName))
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
  return tableRows(payment.items).reduce((sum, item) => sum + parseMoney(item.amount), 0);
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
  return [...new Set(viewPayments().map((payment) => paymentField(payment, key)).filter(Boolean))].sort();
}

function filteredPayments(filters) {
  const entries = Object.entries(filters || {}).filter(([, value]) => String(value || "").trim());
  if (!entries.length) return viewPayments();
  return viewPayments().filter((payment) => {
    return entries.every(([key, value]) => paymentField(payment, key).toLowerCase().includes(String(value).toLowerCase()));
  });
}

function openPaymentForm(id = "") {
  if (!requireTransactionAccess()) return;
  const payableJobs = viewJobCards().filter((job) => outstandingForJob(job.id, id) > 0 || byId(state.payments, id)?.jobId === job.id);
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
      const existing = tableRows(payment.items).find((x) => (x.lineId || x.jobItemId) === line.id) || {};
      return `<div class="payment-row" data-id="${line.id}">
        <label>Bill Line<input value="${escapeAttr(`${line.type}: ${line.label}`)}" disabled></label>
        <label>Outstanding<input value="${formatMoney(line.outstanding)}" disabled></label>
        <label>Attendant<select name="attendantId"><option value="">N/A</option>${options(activeEmployees(existing.attendantId || line.attendantId), existing.attendantId || line.attendantId, (employee) => `${employee.name}${employee.active === false ? " (Inactive)" : ""}`)}</select></label>
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
      attendantName: employeeName(row.querySelector("[name=attendantId]").value),
      amount: parseMoney(row.querySelector("[name=amount]").value)
    })).filter((item) => item.amount > 0);
    if (!items.length) return toast("Enter a paid amount");
    const overpaid = Array.from(rows.querySelectorAll(".payment-row")).some((row) => {
      const input = row.querySelector("[name=amount]");
      return parseMoney(input.value) > parseMoney(input.dataset.max);
    });
    if (overpaid && !confirm("Paid amount exceeds the outstanding amount. Admin confirmation is required. Continue as overpayment?")) return;
    const payload = { ...data, items, ref: payment.ref || nextReceiptRef(), attachmentName: file?.name || payment.attachmentName || "" };
    if (id) Object.assign(payment, payload);
    else state.payments.push({ id: uid(), recordMode: byId(state.jobCards, payload.jobId)?.recordMode || currentRecordMode(), isArchived: false, ...payload });
    commit("Payment saved");
    alertCommissionNotAllocated(job);
  });
}

function alertCommissionNotAllocated(job) {
  if (!job || paidForJob(job.id) <= 0 || commissionForJob(job.id) > 0) return;
  openModal(`
    <div class="stack">
      <h2>Commission Not Allocated</h2>
      <p>This bill has payment recorded, but commission has not been allocated or paid.</p>
      <div class="panel">
        <p>Job Card Number</p>
        <h2>${escapeHtml(job.ref)}</h2>
      </div>
      <div class="actions">
        <button class="primary" onclick="document.querySelector('#modal').close()">OK</button>
      </div>
    </div>`);
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
        <tbody>${tableRows(payment.items).map((item) => `<tr><td>${escapeHtml(receiptLineLabel(job, item))}</td><td>${escapeHtml(byId(state.employees, item.attendantId)?.name || item.attendantName || "N/A")}</td><td>${formatMoney(item.amount)}</td></tr>`).join("")}</tbody>
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
        <thead><tr><th>Date</th><th>Expense Category</th><th>Expense Item</th><th>Amount</th><th>Comment</th></tr></thead>
        <tbody>${viewExpenses().map((expense) => `<tr><td>${formatDate(expense.date)}</td><td>${escapeHtml(expense.itemName || "")}</td><td>${escapeHtml(expense.expenseItem || "")}</td><td>${formatMoney(expense.amount)}</td><td>${escapeHtml(expense.comment || "")}</td></tr>`).join("") || emptyRow(5)}</tbody>
      </table>
    </div>`;
}

function openExpenseForm(id = "") {
  if (!requireTransactionAccess()) return;
  const expense = byId(state.expenses, id) || { date: today(), itemName: state.expenseItems[0]?.name || "", expenseItem: "", amount: "", comment: "" };
  openModal(`
    <h2>${id ? "Edit" : "Add"} Expense</h2>
    <form id="expenseForm" class="form-grid">
      <label>Date<input type="date" name="date" value="${expense.date}" required></label>
      <label>Expense Category<select name="itemName" id="expenseCategory">${state.expenseItems.map((item) => `<option ${expense.itemName === item.name ? "selected" : ""}>${item.name}</option>`).join("")}<option value="__new">Add new...</option></select></label>
      <label>Expense Item<input name="expenseItem" value="${escapeAttr(expense.expenseItem || "")}" placeholder="Free entry"></label>
      <label>Amount<input name="amount" value="${expense.amount}" required></label>
      <label class="wide">Comment<textarea name="comment">${escapeHtml(expense.comment || "")}</textarea></label>
      <div class="wide actions"><button class="primary">Save Expense</button></div>
    </form>`);
  document.querySelector("#expenseCategory").addEventListener("change", (event) => {
    if (event.target.value === "__new") {
      const name = prompt("New expense category name");
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
    data.expenseItem = data.expenseItem || "";
    if (id) Object.assign(expense, data);
    else state.expenses.push({ id: uid(), recordMode: currentRecordMode(), isArchived: false, ...data });
    commit("Expense saved");
  });
}

function renderCommissions() {
  views.commissions.innerHTML = `
    <div class="toolbar"><h2>Commission Module</h2><button class="primary" onclick="openCommissionForm()">Allocate Commission</button></div>
    <div class="panel table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Job Card</th><th>Attendant</th><th>Type</th><th>Commission</th></tr></thead>
        <tbody>${viewCommissions().map((entry) => `<tr><td>${formatDate(entry.date)}</td><td>${byId(state.jobCards, entry.jobId)?.ref || ""}</td><td>${employeeName(entry.attendantId)}</td><td>${entry.type}</td><td>${formatMoney(entry.amount)}</td></tr>`).join("") || emptyRow(5)}</tbody>
      </table>
    </div>`;
}

function openCommissionForm(id = "") {
  if (!requireTransactionAccess()) return;
  const existing = byId(state.commissions, id);
  const allocationJobs = commissionAllocationJobs(existing?.jobId || "");
  const entry = existing || { date: today(), jobId: allocationJobs[0]?.id || "", attendantId: state.employees[0]?.id || "", type: "Amount", rate: "", amount: "" };
  const canSave = Boolean(entry.jobId);
  openModal(`
    <h2>${id ? "Edit" : "Allocate"} Commission</h2>
    <form id="commissionForm" class="stack">
      <div class="form-grid">
        <label>Date<input type="date" name="date" value="${entry.date}" required></label>
        <label>Job Card<select name="jobId" id="commissionJob" required ${canSave ? "" : "disabled"}>${options(allocationJobs, entry.jobId, (j) => `${j.ref} - paid ${formatMoney(paidForJob(j.id))}`)}</select></label>
        <label>Attendant<select name="attendantId" required>${options(activeEmployees(entry.attendantId), entry.attendantId, (employee) => `${employee.name}${employee.active === false ? " (Inactive)" : ""}`)}</select></label>
        <label>Type<select name="type" id="commissionType"><option ${entry.type === "Amount" ? "selected" : ""}>Amount</option><option ${entry.type === "Percent" ? "selected" : ""}>Percent</option></select></label>
        <label>Rate / Amount<input name="rate" id="commissionRate" value="${entry.rate || entry.amount || ""}" required></label>
        <label>Commission Amount<input name="amount" id="commissionAmount" value="${entry.amount || ""}" required></label>
      </div>
      <div class="panel" id="commissionSummary"></div>
      <div class="actions"><button class="primary" ${canSave ? "" : "disabled"}>Save Commission</button></div>
    </form>`);
  const update = () => {
    const job = byId(state.jobCards, document.querySelector("#commissionJob").value);
    const paid = paidForJob(job?.id);
    const rate = parseMoney(document.querySelector("#commissionRate").value);
    const type = document.querySelector("#commissionType").value;
    const amount = type === "Percent" ? paid * (rate / 100) : rate;
    document.querySelector("#commissionAmount").value = amount ? amount.toFixed(2) : "";
    document.querySelector("#commissionSummary").innerHTML = job
      ? `<h3>${job.ref}</h3>${jobItemsTable(job)}<p>Paid: <strong>${formatMoney(paid)}</strong>. Commission deducts from paid amount.</p>`
      : '<div class="empty">No unprocessed commission job cards found.</div>';
  };
  ["commissionJob", "commissionType", "commissionRate"].forEach((id) => document.querySelector(`#${id}`).addEventListener("input", update));
  update();
  document.querySelector("#commissionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.target);
    data.amount = parseMoney(data.amount);
    const paid = paidForJob(data.jobId);
    const otherCommissions = commissionForJobExcept(data.jobId, id);
    if (data.amount + otherCommissions > paid) return toast("Commission cannot exceed paid amount");
    if (id) Object.assign(entry, data);
    else state.commissions.push({ id: uid(), recordMode: byId(state.jobCards, data.jobId)?.recordMode || currentRecordMode(), isArchived: false, ...data });
    commit("Commission saved");
  });
}

function adminRecordTypes() {
  return [
    { key: "customers", label: "Customers", items: state.customers, edit: openCustomerForm, del: (id) => deleteRecord("customers", id), labelFn: (c) => `${c.name} - ${c.vehicle}` },
    { key: "jobCards", label: "Job Cards", items: viewJobCards(), edit: (id) => openJobForm(id, { admin: true }), del: deleteJob, labelFn: (j) => `${j.ref} - ${customerName(j.customerId)}` },
    { key: "payments", label: "Payments", items: viewPayments(), edit: openPaymentForm, del: (id) => deleteRecord("payments", id), labelFn: (p) => `${p.ref || ""} - ${formatDate(p.date)} - ${byId(state.jobCards, p.jobId)?.ref || ""} - ${formatMoney(paymentAmount(p))}` },
    { key: "expenses", label: "Expenses", items: viewExpenses(), edit: openExpenseForm, del: (id) => deleteRecord("expenses", id), labelFn: (e) => `${formatDate(e.date)} - ${e.itemName || ""}${e.expenseItem ? ` - ${e.expenseItem}` : ""} - ${formatMoney(e.amount)}` },
    { key: "commissions", label: "Commissions", items: viewCommissions(), edit: openCommissionForm, del: (id) => deleteRecord("commissions", id), labelFn: (c) => `${formatDate(c.date)} - ${employeeName(c.attendantId)} - ${formatMoney(c.amount)}` }
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
        <h2>Transaction Edit - ${escapeHtml(config.label)}</h2>
        <p class="muted">Edit and delete ${escapeHtml(config.label.toLowerCase())} from one controlled transaction page.</p>
      </div>
    </div>
    <div class="panel master-select-row">
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
  if (type === "expenses") return `Category: ${escapeHtml(item.itemName || "")} | Item: ${escapeHtml(item.expenseItem || "")} | Comment: ${escapeHtml(item.comment || "")}`;
  if (type === "commissions") return `Job: ${byId(state.jobCards, item.jobId)?.ref || ""} | Type: ${escapeHtml(item.type || "")}`;
  return "";
}

function ensureBusinessAdminStore() {
  if (!state.settings.businessAdmin || typeof state.settings.businessAdmin !== "object") state.settings.businessAdmin = {};
  const store = state.settings.businessAdmin;
  if (!Array.isArray(store.branches) || !store.branches.length) {
    store.branches = [{
      id: "main",
      code: "MAIN",
      name: "Main Branch",
      location: state.settings.location || "",
      mobile: state.settings.mobile || "",
      active: true
    }];
  }
  if (!Array.isArray(store.users) || !store.users.length) {
    store.users = [{
      id: "owner",
      name: state.settings.ownerName || state.settings.userName || "Business Owner",
      username: "owner",
      mobile: state.settings.mobile || "",
      role: "Admin",
      branchId: store.branches[0]?.id || "main",
      active: true
    }];
  }
  if (!store.permissions || typeof store.permissions !== "object") {
    store.permissions = {
      Admin: ["all"],
      Supervisor: ["dashboard", "customers", "jobs", "confirmation", "payments", "serviceCards", "expenses", "reports", "analysis"],
      User: ["dashboard", "customers", "jobs", "confirmation", "payments", "reports"]
    };
  }
  if (!Array.isArray(store.auditLogs)) store.auditLogs = [];
  return store;
}

function businessAdminStore() {
  return ensureBusinessAdminStore();
}

function businessAdminModules() {
  return [
    ["dashboard", "Dashboard"],
    ["customers", "Customers"],
    ["jobs", "Job Cards"],
    ["confirmation", "Work Confirmation"],
    ["payments", "Payments"],
    ["serviceCards", "Service Cards"],
    ["expenses", "Expenses"],
    ["commissions", "Commissions"],
    ["reports", "Reports"],
    ["analysis", "Analysis"],
    ["settings", "Settings"]
  ];
}

function businessAdminLog(action, details = "") {
  const store = businessAdminStore();
  store.auditLogs.unshift({
    id: uid(),
    date: new Date().toISOString(),
    user: state.settings.userName || state.settings.ownerName || "Business Admin",
    action,
    details
  });
  store.auditLogs = store.auditLogs.slice(0, 100);
}

function renderBusinessAdmin() {
  const store = businessAdminStore();
  const section = localStorage.getItem("vasma-business-admin-section") || "profile";
  const sections = [
    ["profile", "Business Profile"],
    ["branches", "Branches"],
    ["users", "Users & Roles"],
    ["permissions", "Permissions"],
    ["audit", "Audit Logs"]
  ];
  views.businessAdmin.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Business Admin</h2>
        <p class="muted">Manage this business account only. Platform packages and subscriptions remain in the separate Super Admin panel.</p>
      </div>
    </div>
    <div class="settings-tabs">
      ${sections.map(([key, label]) => `<button class="settings-tab ${section === key ? "active" : ""}" data-business-admin-section="${key}">${label}</button>`).join("")}
    </div>
    ${businessAdminSectionMarkup(section, store)}`;

  document.querySelectorAll("[data-business-admin-section]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem("vasma-business-admin-section", button.dataset.businessAdminSection);
      renderBusinessAdmin();
      updateNavSubItems();
    });
  });
  document.querySelector("#businessAdminProfileForm")?.addEventListener("submit", saveBusinessAdminProfile);
  document.querySelector("#addBusinessBranch")?.addEventListener("click", () => openBusinessBranchForm());
  document.querySelectorAll("[data-edit-branch]").forEach((button) => button.addEventListener("click", () => openBusinessBranchForm(button.dataset.editBranch)));
  document.querySelectorAll("[data-toggle-branch]").forEach((button) => button.addEventListener("click", () => toggleBusinessBranch(button.dataset.toggleBranch)));
  document.querySelector("#addBusinessUser")?.addEventListener("click", () => openBusinessUserForm());
  document.querySelectorAll("[data-edit-business-user]").forEach((button) => button.addEventListener("click", () => openBusinessUserForm(button.dataset.editBusinessUser)));
  document.querySelectorAll("[data-toggle-business-user]").forEach((button) => button.addEventListener("click", () => toggleBusinessUser(button.dataset.toggleBusinessUser)));
  document.querySelector("#businessPermissionsForm")?.addEventListener("submit", saveBusinessPermissions);
}

function businessAdminSectionMarkup(section, store) {
  if (section === "branches") return businessBranchesMarkup(store);
  if (section === "users") return businessUsersMarkup(store);
  if (section === "permissions") return businessPermissionsMarkup(store);
  if (section === "audit") return businessAuditMarkup(store);
  return businessProfileMarkup();
}

function businessProfileMarkup() {
  const session = businessSession();
  return `
    <form id="businessAdminProfileForm" class="panel form-grid">
      <label>Business ID<input value="${escapeAttr(state.settings.businessId || session?.businessId || "")}" readonly></label>
      <label>Business Code<input value="${escapeAttr(session?.businessCode || "")}" readonly></label>
      <label>Business Name<input name="businessName" value="${escapeAttr(state.settings.businessName || "")}" required></label>
      <label>Owner Name<input name="ownerName" value="${escapeAttr(state.settings.ownerName || "")}"></label>
      <label>User / Signature Name<input name="userName" value="${escapeAttr(state.settings.userName || state.settings.ownerName || "")}"></label>
      <label>Mobile Number<input name="mobile" value="${escapeAttr(state.settings.mobile || "")}"></label>
      <label>Business Location<input name="location" value="${escapeAttr(state.settings.location || "")}"></label>
      <div class="wide actions"><button class="primary">Save Business Profile</button></div>
    </form>`;
}

function businessBranchesMarkup(store) {
  return `
    <div class="panel">
      <div class="toolbar"><h2>Branches</h2><button class="primary" id="addBusinessBranch">Add Branch</button></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Branch Name</th><th>Location</th><th>Mobile</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${store.branches.map((branch) => `
            <tr>
              <td>${escapeHtml(branch.code || "")}</td>
              <td><strong>${escapeHtml(branch.name || "")}</strong></td>
              <td>${escapeHtml(branch.location || "")}</td>
              <td>${escapeHtml(branch.mobile || "")}</td>
              <td>${activePill(branch.active !== false)}</td>
              <td class="actions"><button class="secondary" data-edit-branch="${branch.id}">Edit</button><button class="danger" data-toggle-branch="${branch.id}">${branch.active === false ? "Activate" : "Deactivate"}</button></td>
            </tr>`).join("")}</tbody>
        </table>
      </div>
    </div>`;
}

function businessUsersMarkup(store) {
  return `
    <div class="panel">
      <div class="toolbar"><h2>Users & Roles</h2><button class="primary" id="addBusinessUser">Add User</button></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Branch</th><th>Mobile</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${store.users.map((user) => `
            <tr>
              <td><strong>${escapeHtml(user.name || "")}</strong></td>
              <td>${escapeHtml(user.username || "")}</td>
              <td>${escapeHtml(user.role || "")}</td>
              <td>${escapeHtml(branchName(user.branchId))}</td>
              <td>${escapeHtml(user.mobile || "")}</td>
              <td>${activePill(user.active !== false)}</td>
              <td class="actions"><button class="secondary" data-edit-business-user="${user.id}">Edit</button><button class="danger" data-toggle-business-user="${user.id}">${user.active === false ? "Activate" : "Deactivate"}</button></td>
            </tr>`).join("")}</tbody>
        </table>
      </div>
    </div>`;
}

function businessPermissionsMarkup(store) {
  const roles = ["Admin", "Supervisor", "User"];
  const modules = businessAdminModules();
  return `
    <form id="businessPermissionsForm" class="panel">
      <h2>Role Permissions</h2>
      <p class="muted">These permissions define the business owner panel behavior. Backend database restrictions still protect business, branch, and subscription access.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Module</th>${roles.map((role) => `<th>${role}</th>`).join("")}</tr></thead>
          <tbody>${modules.map(([key, label]) => `
            <tr>
              <td><strong>${label}</strong></td>
              ${roles.map((role) => {
                const checked = store.permissions[role]?.includes("all") || store.permissions[role]?.includes(key);
                return `<td><input type="checkbox" name="${role}:${key}" ${checked ? "checked" : ""} ${role === "Admin" ? "disabled" : ""}></td>`;
              }).join("")}
            </tr>`).join("")}</tbody>
        </table>
      </div>
      <div class="actions"><button class="primary">Save Permissions</button></div>
    </form>`;
}

function businessAuditMarkup(store) {
  return `
    <div class="panel table-wrap">
      <h2>Audit Logs</h2>
      ${store.auditLogs.length ? `<table>
        <thead><tr><th>Date</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
        <tbody>${store.auditLogs.map((log) => `
          <tr><td>${formatDate(log.date)}</td><td>${escapeHtml(log.user || "")}</td><td><strong>${escapeHtml(log.action || "")}</strong></td><td>${escapeHtml(log.details || "")}</td></tr>`).join("")}</tbody>
      </table>` : '<div class="empty">No business admin activity yet.</div>'}
    </div>`;
}

function saveBusinessAdminProfile(event) {
  event.preventDefault();
  const data = formData(event.target);
  Object.assign(state.settings, data);
  businessAdminLog("Business profile updated", data.businessName || "");
  save();
  renderAll();
  toast("Business profile saved");
}

function openBusinessBranchForm(id = "") {
  if (!requireTransactionAccess()) return;
  const store = businessAdminStore();
  const branch = store.branches.find((entry) => entry.id === id) || { code: "", name: "", location: "", mobile: "", active: true };
  openModal(`
    <h2>${id ? "Edit" : "Add"} Branch</h2>
    <form id="businessBranchForm" class="form-grid">
      <label>Branch Code<input name="code" value="${escapeAttr(branch.code || "")}" required></label>
      <label>Branch Name<input name="name" value="${escapeAttr(branch.name || "")}" required></label>
      <label>Location<input name="location" value="${escapeAttr(branch.location || "")}"></label>
      <label>Mobile<input name="mobile" value="${escapeAttr(branch.mobile || "")}"></label>
      <label>Status<select name="active"><option value="true" ${branch.active !== false ? "selected" : ""}>Active</option><option value="false" ${branch.active === false ? "selected" : ""}>Inactive</option></select></label>
      <div class="wide actions"><button class="primary">Save Branch</button></div>
    </form>`);
  document.querySelector("#businessBranchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.target);
    data.active = data.active === "true";
    if (id) Object.assign(branch, data);
    else store.branches.push({ id: uid(), ...data });
    businessAdminLog(id ? "Branch updated" : "Branch added", data.name);
    commit("Branch saved");
  });
}

function toggleBusinessBranch(id) {
  const branch = businessAdminStore().branches.find((entry) => entry.id === id);
  if (!branch) return;
  branch.active = branch.active === false;
  businessAdminLog(branch.active ? "Branch activated" : "Branch deactivated", branch.name);
  save();
  renderAll();
  toast("Branch status updated");
}

function openBusinessUserForm(id = "") {
  if (!requireTransactionAccess()) return;
  const store = businessAdminStore();
  const user = store.users.find((entry) => entry.id === id) || { name: "", username: "", mobile: "", role: "User", branchId: store.branches[0]?.id || "", active: true };
  openModal(`
    <h2>${id ? "Edit" : "Add"} Business User</h2>
    <form id="businessUserForm" class="form-grid">
      <label>Name<input name="name" value="${escapeAttr(user.name || "")}" required></label>
      <label>Username<input name="username" value="${escapeAttr(user.username || "")}" required></label>
      <label>Mobile<input name="mobile" value="${escapeAttr(user.mobile || "")}"></label>
      <label>Role<select name="role">${["Admin", "Supervisor", "User"].map((role) => `<option ${user.role === role ? "selected" : ""}>${role}</option>`).join("")}</select></label>
      <label>Branch<select name="branchId">${options(store.branches, user.branchId, (branch) => `${branch.code || ""} - ${branch.name || ""}`)}</select></label>
      <label>Status<select name="active"><option value="true" ${user.active !== false ? "selected" : ""}>Active</option><option value="false" ${user.active === false ? "selected" : ""}>Inactive</option></select></label>
      <div class="wide actions"><button class="primary">Save User</button></div>
    </form>`);
  document.querySelector("#businessUserForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.target);
    data.active = data.active === "true";
    if (id) Object.assign(user, data);
    else store.users.push({ id: uid(), ...data });
    businessAdminLog(id ? "Business user updated" : "Business user added", data.username);
    commit("Business user saved");
  });
}

function toggleBusinessUser(id) {
  const user = businessAdminStore().users.find((entry) => entry.id === id);
  if (!user) return;
  user.active = user.active === false;
  businessAdminLog(user.active ? "Business user activated" : "Business user deactivated", user.username);
  save();
  renderAll();
  toast("User status updated");
}

function saveBusinessPermissions(event) {
  event.preventDefault();
  const store = businessAdminStore();
  const modules = businessAdminModules().map(([key]) => key);
  store.permissions.Admin = ["all"];
  ["Supervisor", "User"].forEach((role) => {
    store.permissions[role] = modules.filter((key) => event.target.elements[`${role}:${key}`]?.checked);
  });
  businessAdminLog("Permissions updated", "Business role permissions changed");
  save();
  renderAll();
  toast("Permissions saved");
}

function branchName(id) {
  const branch = businessAdminStore().branches.find((entry) => entry.id === id);
  return branch ? `${branch.code || ""}${branch.code ? " - " : ""}${branch.name || ""}` : "";
}

function renderMaster() {
  const masterPanels = ["employee", "package", "category", "expense", "action"];
  const focus = masterPanels.includes(localStorage.getItem("vasma-master-focus")) ? localStorage.getItem("vasma-master-focus") : "employee";
  const selectedEmployee = localStorage.getItem("vasma-master-employee") || state.employees[0]?.id || "";
  const selectedPackage = localStorage.getItem("vasma-master-package") || state.packages[0]?.id || "";
  const selectedCategory = localStorage.getItem("vasma-master-category") || state.categories[0]?.id || "";
  const selectedItem = localStorage.getItem("vasma-master-item") || byId(state.categories, selectedCategory)?.items[0]?.id || "";
  const selectedSubItem = localStorage.getItem("vasma-master-subitem") || byId(byId(state.categories, selectedCategory)?.items || [], selectedItem)?.subItems?.[0]?.id || "";
  const selectedExpense = localStorage.getItem("vasma-master-expense") || state.expenseItems[0]?.id || "";
  const selectedAction = localStorage.getItem("vasma-master-action") || state.actions[0]?.id || "";
  const panels = {
    employee: `
      <div class="panel" data-master-panel="employee">
        <div class="toolbar"><h2>Employees</h2><button class="primary" onclick="openEmployeeForm()">Add Employee</button></div>
        ${masterSelect("employee", state.employees, selectedEmployee, "Select employee", "openEmployeeForm", "deleteRecord('employees', selectedMaster('employee'))")}
      </div>`,
    package: `
      <div class="panel" data-master-panel="package">
        <div class="toolbar"><h2>Car Wash Packages</h2><button class="primary" onclick="openPackageForm()">Add Package</button></div>
        ${masterSelect("package", state.packages, selectedPackage, "Select package", "openPackageForm", "deleteRecord('packages', selectedMaster('package'))")}
      </div>`,
    category: `
      <div class="panel" data-master-panel="category">
        <div class="toolbar"><h2>Service Categories and Items</h2><button class="primary" onclick="openCategoryForm()">Add Category</button></div>
        ${masterSelect("category", state.categories, selectedCategory, "Select category", "openCategoryForm", "deleteCategory(selectedMaster('category'))")}
        <div class="toolbar" style="margin-top:14px"><h3>Service Items</h3><button class="primary" onclick="openItemForm(selectedMaster('category'))">Add Item</button></div>
        ${masterSelect("item", byId(state.categories, selectedCategory)?.items || [], selectedItem, "Select service item", "openSelectedItemForm", "deleteSelectedItem()")}
        <div class="toolbar" style="margin-top:14px"><h3>Sub Items</h3><button class="primary" onclick="openSubItemForm(selectedMaster('category'), selectedMaster('item'))">Add Sub Item</button></div>
        ${masterSelect("subitem", byId(byId(state.categories, selectedCategory)?.items || [], selectedItem)?.subItems || [], selectedSubItem, "Select sub item", "openSelectedSubItemForm", "deleteSelectedSubItem()")}
      </div>`,
    expense: `
      <div class="panel" data-master-panel="expense">
        <div class="toolbar"><h2>Expense Categories</h2><button class="primary" onclick="openExpenseItemForm()">Add Expense Category</button></div>
        ${masterSelect("expense", state.expenseItems, selectedExpense, "Select expense category", "openExpenseItemForm", "deleteRecord('expenseItems', selectedMaster('expense'))")}
      </div>`,
    action: `
      <div class="panel" data-master-panel="action">
        <div class="toolbar"><h2>Actions</h2><button class="primary" onclick="openActionForm()">Add Action</button></div>
        ${masterSelect("action", state.actions, selectedAction, "Select action", "openActionForm", "deleteRecord('actions', selectedMaster('action'))")}
      </div>`
  };
  views.master.innerHTML = `
    <div class="master-single-panel">
      ${panels[focus]}
    </div>`;
  document.querySelectorAll("[data-master-select]").forEach((select) => {
    select.addEventListener("change", () => {
      localStorage.setItem(`vasma-master-${select.dataset.masterSelect}`, select.value);
      if (select.dataset.masterSelect === "category") localStorage.removeItem("vasma-master-item");
      if (["category", "item"].includes(select.dataset.masterSelect)) localStorage.removeItem("vasma-master-subitem");
      renderMaster();
    });
  });
}

function focusMasterPanel() {
  const focus = localStorage.getItem("vasma-master-focus");
  if (!focus || activeView !== "master") return;
  setTimeout(() => {
    document.querySelectorAll("[data-master-panel]").forEach((panel) => panel.classList.toggle("focus-panel", panel.dataset.masterPanel === focus));
    document.querySelector(`[data-master-panel="${focus}"]`)?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, 0);
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

function openSelectedSubItemForm() {
  openSubItemForm(selectedMaster("category"), selectedMaster("item"), selectedMaster("subitem"));
}

function deleteSelectedSubItem() {
  deleteSubItem(selectedMaster("category"), selectedMaster("item"), selectedMaster("subitem"));
}

function openEmployeeForm(id = "") {
  const employee = byId(state.employees, id) || { name: "", mobile: "", role: "Supervisor", active: true };
  openModal(`
    <h2>${id ? "Edit Employee" : "Add Employee"}</h2>
    <form id="employeeForm" class="form-grid">
      <label>Name<input name="name" value="${escapeAttr(employee.name)}" required></label>
      <label>Mobile<input name="mobile" value="${escapeAttr(employee.mobile)}" required></label>
      <label>Role<select name="role" required><option value="Supervisor" ${employee.role === "Supervisor" ? "selected" : ""}>Supervisor</option><option value="Admin" ${employee.role === "Admin" ? "selected" : ""}>Admin</option></select></label>
      <label>Status<select name="active"><option value="true" ${employee.active !== false ? "selected" : ""}>Active</option><option value="false" ${employee.active === false ? "selected" : ""}>Inactive</option></select></label>
      <div class="wide actions"><button class="primary">Save</button></div>
    </form>`);
  document.querySelector("#employeeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formData(event.target);
    data.active = data.active === "true";
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
  const item = byId(category.items, itemId) || { name: "", subItems: [] };
  openSimpleForm("itemForm", itemId ? "Edit Item" : "Add Item", [["name", "Item Name", item.name]], (data) => {
    if (itemId) Object.assign(item, data);
    else category.items.push({ id: uid(), ...data, subItems: defaultSubItems(category.name, data.name) });
    commit("Service item saved");
  });
}

function openSubItemForm(categoryId, itemId, subItemId = "") {
  const item = serviceItemRecord(categoryId, itemId);
  if (!item) return toast("Select a service item first");
  if (!Array.isArray(item.subItems)) item.subItems = [];
  const subItem = byId(item.subItems, subItemId) || { name: "" };
  openSimpleForm("subItemForm", subItemId ? "Edit Sub Item" : "Add Sub Item", [["name", "Sub Item Name", subItem.name]], (data) => {
    if (subItemId) Object.assign(subItem, data);
    else item.subItems.push({ id: uid(), ...data });
    commit("Sub item saved");
  });
}

function openExpenseItemForm(id = "") {
  const item = byId(state.expenseItems, id) || { name: "" };
  openSimpleForm("expenseItemForm", id ? "Edit Expense Category" : "Add Expense Category", [["name", "Expense Category", item.name]], (data) => {
    if (id) Object.assign(item, data);
    else state.expenseItems.push({ id: uid(), ...data });
    commit("Expense category saved");
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
  const jobs = filterByDate(viewJobCards(), filters);
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
      <h2>${escapeHtml(filters.type)}</h2>
      <div id="reportTable" style="margin-top:14px">${buildReportTable(filters.type, rows)}</div>
      <p class="muted" style="margin-top:14px">Prepared by ${escapeHtml(profileName())}</p>
    </div>`;
  wireFilters("reports");
}

function getReportFilters() {
  const range = sharedPeriodRange("vasma-date");
  return {
    type: localStorage.getItem("vasma-report-type") || "Outstanding Report",
    mode: range.mode,
    from: range.from,
    to: range.to
  };
}

function filterMarkup(filters, scope) {
  return `<div class="panel filters" style="margin-bottom:14px">
    <div class="wide report-range"><strong>${formatDateRange(filters.from, filters.to)}</strong></div>
    <div class="period-tabs wide" role="tablist" aria-label="${scope} period">
      ${periodTabButton(scope, "today", "Today", filters.mode)}
      ${periodTabButton(scope, "mtd", "MTD", filters.mode)}
      ${periodTabButton(scope, "ytd", "YTD", filters.mode)}
      ${periodTabButton(scope, "custom", "Custom", filters.mode)}
    </div>
    <label class="${filters.mode === "custom" ? "" : "dashboard-custom-date"}">From<input type="date" id="${scope}DateFrom" value="${filters.from}"></label>
    <label class="${filters.mode === "custom" ? "" : "dashboard-custom-date"}">To<input type="date" id="${scope}DateTo" value="${filters.to}"></label>
  </div>`;
}

function wireFilters(scope) {
  document.querySelectorAll(`[data-period-scope="${scope}"]`).forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem("vasma-date-mode", button.dataset.periodMode);
      renderAll();
    });
  });
  document.querySelector(`#${scope}DateFrom`)?.addEventListener("change", (e) => {
    localStorage.setItem("vasma-date-mode", "custom");
    localStorage.setItem("vasma-date-from", e.target.value);
    renderAll();
  });
  document.querySelector(`#${scope}DateTo`)?.addEventListener("change", (e) => {
    localStorage.setItem("vasma-date-mode", "custom");
    localStorage.setItem("vasma-date-to", e.target.value);
    renderAll();
  });
}

function sharedPeriodRange(prefix) {
  const mode = localStorage.getItem(`${prefix}-mode`) || "mtd";
  const now = new Date();
  const end = today();
  if (mode === "today") return { mode, from: end, to: end };
  if (mode === "ytd") return { mode, from: new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10), to: end };
  if (mode === "custom") {
    return {
      mode,
      from: localStorage.getItem(`${prefix}-from`) || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
      to: localStorage.getItem(`${prefix}-to`) || end
    };
  }
  return { mode: "mtd", from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10), to: end };
}

function periodTabButton(scope, key, label, activeMode) {
  const active = activeMode === key;
  return `<button type="button" class="dashboard-switch-button ${active ? "active" : ""}" data-period-scope="${scope}" data-period-mode="${key}" role="tab" aria-selected="${active}">${label}</button>`;
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
    const payments = filterByDate(viewPayments(), filters);
    const total = payments.reduce((sum, payment) => sum + paymentAmount(payment), 0);
    return `<table><thead><tr><th>Date</th><th>Receipt Ref</th><th>Customer</th><th>Vehicle #</th><th>Job Card</th><th>Method</th><th>Amount</th><th>Reference / Comment</th></tr></thead><tbody>${payments.map((payment) => {
      const job = byId(state.jobCards, payment.jobId) || {};
      const customer = byId(state.customers, job.customerId) || {};
      return `<tr><td>${formatDate(payment.date)}</td><td>${escapeHtml(payment.ref || "")}</td><td>${escapeHtml(customer.name || "")}</td><td>${escapeHtml(customer.vehicle || "")}</td><td>${escapeHtml(job.ref || "")}</td><td>${escapeHtml(payment.method || "")}</td><td>${formatMoney(paymentAmount(payment))}</td><td>${escapeHtml(payment.comment || payment.attachmentName || "")}</td></tr>`;
    }).join("")}<tr><th colspan="6">Total</th><th>${formatMoney(total)}</th><th></th></tr></tbody></table>`;
  }
  if (type === "Commission Report") {
    const filters = getReportFilters();
    const entries = filterByDate(viewCommissions(), filters);
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
  const jobs = filterByDate(viewJobCards(), filters);
  let view = localStorage.getItem("vasma-analysis-view") || "Current View";
  if (view === "Graph") {
    view = "Current View";
    localStorage.setItem("vasma-analysis-view", view);
  }
  const panels = [
    ["Service Category Income", rankJobItems(jobs, (job, item) => jobItemCategoryName(job, item))],
    ["Service Item Income", rankJobItems(jobs)],
    ["Attendant Income", rankCommissionsByAttendant(filterByDate(viewCommissions(), filters))],
    ["Date Income", rank(jobs, (job) => formatDate(job.date), jobTotal)]
  ];
  views.analysis.innerHTML = `
    <div class="toolbar"><div><h2>Analysis</h2><p class="muted">Rankings and charts from high income to low for the selected period.</p></div></div>
    ${filterMarkup(filters, "analysis")}
    <h2>${escapeHtml(view)}</h2>
    <div class="grid two">
      ${panels.map(([title, rows]) => analysisPanel(title, rows, view)).join("")}
    </div>`;
  wireFilters("analysis");
}

function renderLicense() {
  const screen = localStorage.getItem("vasma-license-screen") || "status";
  const license = licenseStore();
  const status = licenseStatus(license);
  views.license.innerHTML = `
    <div class="toolbar">
      <div><h2>Offline License Activation</h2><p class="muted">Generate a request code, send it to Admin, then activate this device offline.</p></div>
    </div>
    ${licenseScreenMarkup(screen, license, status)}`;
  document.querySelector("#generateRequestCode")?.addEventListener("click", generateRequestCode);
  document.querySelector("#copyRequestCode")?.addEventListener("click", () => copyField("requestCodeOutput"));
  document.querySelector("#copyDeviceId")?.addEventListener("click", () => copyText(deviceId()));
  document.querySelector("#activationForm")?.addEventListener("submit", activateLicense);
  document.querySelector("#trialExtensionForm")?.addEventListener("submit", requestTrialExtension);
  document.querySelector("#subscriptionRequestForm")?.addEventListener("submit", requestBusinessSubscription);
  document.querySelector("#subscriptionPaymentForm")?.addEventListener("submit", submitSubscriptionPayment);
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
        <label>Business Name<input id="requestBusinessName" value="${escapeAttr(state.settings?.businessName || "VASMA System")}" readonly></label>
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
    </div>
    ${subscriptionSelfServiceMarkup()}`;
}

function subscriptionSelfServiceMarkup() {
  return `
    <div class="grid two">
      <form id="trialExtensionForm" class="panel stack">
        <h2>Request Trial Extension</h2>
        <label>Requested Duration<select name="requestedDuration"><option>7 days</option><option selected>14 days</option><option>30 days</option></select></label>
        <label>Comment<textarea name="comment" placeholder="Reason for extension"></textarea></label>
        <button class="secondary">Submit Extension Request</button>
      </form>
      <form id="subscriptionRequestForm" class="panel stack">
        <h2>Request Subscription</h2>
        <p class="muted">Open the landing packages page, choose package, then submit request for Super Admin review.</p>
        <label>Package ID<input name="planId" placeholder="Example: plan_full_monthly" required></label>
        <button class="primary">Submit Subscription Request</button>
      </form>
    </div>
    <form id="subscriptionPaymentForm" class="panel stack">
      <h2>Submit Subscription Payment</h2>
      <div class="form-grid">
        <label>Subscription ID<input name="subscriptionId" placeholder="Leave blank for current subscription"></label>
        <label>Payment Method ID<input name="paymentMethodId" placeholder="Optional"></label>
        <label>Payment Date<input type="date" name="paymentDate" value="${today()}"></label>
        <label>Amount<input name="amount" required></label>
        <label>Reference<input name="reference" placeholder="M-Pesa / Bank reference"></label>
        <label>Comment<input name="comment" placeholder="Payment details"></label>
      </div>
      <div class="actions"><button class="primary">Submit Payment for Super Admin Confirmation</button></div>
    </form>`;
}

async function requestTrialExtension(event) {
  event.preventDefault();
  try {
    const payload = { ...formData(event.target), deviceId: deviceId() };
    const response = await apiRequest("/api/data/trial-extension-request", { method: "POST", body: payload });
    toast(`Extension request sent. Token: ${response.requestCode}`);
  } catch (error) {
    toast(error.message || "Could not request extension");
  }
}

async function requestBusinessSubscription(event) {
  event.preventDefault();
  try {
    await apiRequest("/api/data/subscription-request", { method: "POST", body: formData(event.target) });
    toast("Subscription request sent to Super Admin for review");
  } catch (error) {
    toast(error.message || "Could not submit subscription request");
  }
}

async function submitSubscriptionPayment(event) {
  event.preventDefault();
  try {
    await apiRequest("/api/data/subscription-payment", { method: "POST", body: formData(event.target) });
    toast("Payment submitted. Super Admin will confirm and activate the package.");
  } catch (error) {
    toast(error.message || "Could not submit subscription payment");
  }
}

function licenseStatus(license = licenseStore()) {
  const trial = trialStatus();
  if (!license.activationCode && trial.active) return { label: `Trial - ${trial.daysRemaining} day(s) left`, tone: trial.daysRemaining <= 2 ? "warn" : "good", message: `Free trial is active until ${formatDate(trial.expiryDate)} at 23:59. After that time, activation code will be required.` };
  if (!license.activationCode) return { label: "Trial ended", tone: "bad", message: `The ${TRIAL_DAYS}-day trial has ended. Generate a request code and enter an activation code to continue.` };
  if (licenseExpired(license)) return { label: "Expired", tone: "bad", message: "License has expired. Renew activation to continue transactional work." };
  const days = Math.ceil((expiryCutoff(license.expiryDate) - new Date()) / 86400000);
  return { label: "Active", tone: days <= 7 ? "warn" : "good", message: `License is active until ${formatDate(license.expiryDate)} at 23:59. ${Math.max(0, days)} day(s) remaining.` };
}

function licenseExpired(license = licenseStore()) {
  if (!license.activationCode) return !trialStatus().active;
  return Boolean(license.expiryDate && new Date() > expiryCutoff(license.expiryDate));
}

function expiryCutoff(dateValue) {
  const cutoff = new Date(`${dateValue}T23:59:59.999`);
  return Number.isNaN(cutoff.getTime()) ? new Date(0) : cutoff;
}

function trialStatus() {
  const start = installDate();
  const expiry = new Date(`${start}T00:00:00`);
  expiry.setDate(expiry.getDate() + TRIAL_DAYS - 1);
  const expiryDate = expiry.toISOString().slice(0, 10);
  const cutoff = expiryCutoff(expiryDate);
  const daysRemaining = Math.max(0, Math.ceil((cutoff - new Date()) / 86400000));
  return { startDate: start, expiryDate, active: new Date() <= cutoff, daysRemaining };
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
  if (payload.expiryDate && new Date() > expiryCutoff(payload.expiryDate)) throw new Error("Activation code is already expired.");
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
  const section = localStorage.getItem("vasma-security-section") || "access";
  const lastUnlock = settings.lastUnlockAt ? new Date(settings.lastUnlockAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Not yet";
  const accessControl = `
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
      </form>`;
  const securityFeatures = `
      <div class="panel stack">
        <h2>Security Features</h2>
        <table>
          <tbody>
            <tr><th>App lock</th><td>Requires password/PIN before opening business data.</td></tr>
            <tr><th>Auto lock</th><td>Locks the app after inactivity.</td></tr>
            <tr><th>Hidden app lock</th><td>Can lock when the tab/app is hidden.</td></tr>
            <tr><th>Admin protection</th><td>Edit/delete actions remain centralized in Transaction Edit.</td></tr>
            <tr><th>Backup safety</th><td>Use Settings > App Tools to export backups regularly.</td></tr>
          </tbody>
        </table>
        <p class="muted">This app stores data locally in the browser. Use a strong device password and keep backups private.</p>
      </div>`;
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
    ${section === "features" ? securityFeatures : accessControl}`;
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
  let section = localStorage.getItem("vasma-settings-section") || "business";
  if (section === "profile" || section === "services") {
    section = "business";
    localStorage.setItem("vasma-settings-section", section);
  }
  views.settings.innerHTML = `
    <div class="panel settings-shell">
      <form id="settingsForm" class="stack">
        ${settingsSectionMarkup(section, settings)}
        ${["tools", "about"].includes(section) ? "" : '<div class="actions"><button class="primary">Save Settings</button></div>'}
      </form>
    </div>`;
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
    data.dataView = data.dataView ?? current.dataView ?? "official";
    data.enabledServices = Array.isArray(current.enabledServices) ? [...current.enabledServices] : ["tire", "carWash", "general"];
    data.serviceAuthorization = current.serviceAuthorization || { code: "VASMA-ALL-SERVICES", authorizedAt: "", authorizedServices: [...data.enabledServices] };
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
        <h2>Business Setup and User Profile</h2>
        <div class="form-grid">
          <label>Business Name<input name="businessName" value="${escapeAttr(settings.businessName || "")}" required></label>
          <label>Location<input name="location" value="${escapeAttr(settings.location || "")}"></label>
          <label>Owner Name<input name="ownerName" value="${escapeAttr(settings.ownerName || "")}"></label>
          <label>User Name / Signature Name<input name="userName" value="${escapeAttr(settings.userName || settings.ownerName || "")}"></label>
          <label>Mobile Number<input name="mobile" value="${escapeAttr(settings.mobile || "")}"></label>
          <label>Data View<select name="dataView">
            <option value="official" ${settings.dataView !== "trialArchived" && settings.dataView !== "all" ? "selected" : ""}>Official Records</option>
            <option value="trialArchived" ${settings.dataView === "trialArchived" ? "selected" : ""}>Trial / Archived Records</option>
            <option value="all" ${settings.dataView === "all" ? "selected" : ""}>All Records</option>
          </select></label>
        </div>
        <p class="muted">Data View controls dashboard, reports, job cards, payments, expenses, and commissions. Trial records can only be archived, not deleted or reset, unless approved by system order.</p>
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
            <tr><th>Developer Company Name</th><td>Viewtech</td></tr>
            <tr><th>Developer Mobile</th><td>+255 767 528 039</td></tr>
            <tr><th>Data storage</th><td>Local browser storage with backup and restore</td></tr>
          </tbody>
        </table>
      </div>`
  };
  return sections[section] || sections.business;
}

function serviceLabel(key) {
  return SERVICE_OPTIONS.find((service) => service.key === key)?.label || key;
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
  const brandMark = document.querySelector(".brand-mark");
  if (brandMark && !brandMark.querySelector("img")) brandMark.textContent = (appName || businessName).trim().charAt(0).toUpperCase() || "V";
  if (topNames) {
    topNames.hidden = activeView !== "dashboard";
    topNames.innerHTML = `<p class="brand-signature">${escapeHtml(appName)}</p><h2>${escapeHtml(businessName)}</h2>`;
  }
}

function developerEdits() {
  try {
    return state?.settings?.developerEdits || JSON.parse(localStorage.getItem(DEVELOPER_EDITS_KEY) || "{}");
  } catch {
    return {};
  }
}

function persistDeveloperEdits(edits) {
  if (!state.settings) state.settings = structuredClone(seed.settings);
  state.settings.developerEdits = edits;
  localStorage.setItem(DEVELOPER_EDITS_KEY, JSON.stringify(edits));
  save();
}

function applyDeveloperGraphSize() {
  const height = Math.max(260, Math.min(560, Number(state.settings?.developerGraphHeight || 390)));
  document.documentElement.style.setProperty("--graph-height", `${height}px`);
}

function developerLayout() {
  return state.settings?.developerLayout || {};
}

function persistDeveloperLayout(layout) {
  if (!state.settings) state.settings = structuredClone(seed.settings);
  state.settings.developerLayout = layout;
  save();
}

function activeCustomBlocks() {
  const blocks = state.settings?.developerCustomBlocks || {};
  return blocks[activeView] || [];
}

function applyDeveloperLayout() {
  renderDeveloperCustomBlocks();
  const layout = developerLayout();
  developerBlockElements().forEach((element, index) => {
    const key = developerBlockKey(element, index);
    element.dataset.devBlockKey = key;
    const rule = layout[key];
    if (!rule) return;
    element.classList.toggle("developer-block-hidden", Boolean(rule.hidden));
    if (rule.width) element.style.width = rule.width;
    if (rule.height) element.style.minHeight = rule.height;
  });
  if (developerModeActive()) enableDeveloperBlockEditing();
}

function renderDeveloperCustomBlocks() {
  const view = views[activeView];
  if (!view) return;
  view.querySelectorAll("[data-developer-custom-block]").forEach((block) => block.remove());
  activeCustomBlocks().forEach((block) => {
    view.insertAdjacentHTML("beforeend", `
      <div class="panel developer-custom-block" data-developer-custom-block="${escapeAttr(block.id)}">
        <h2>${escapeHtml(block.title || "Custom Block")}</h2>
        <p class="muted">${escapeHtml(block.body || "Edit this text in Developer Mode.")}</p>
      </div>`);
  });
}

function developerBlockElements() {
  const selectors = [
    ".view.active > .toolbar",
    ".view.active > .panel",
    ".view.active > .grid",
    ".view.active > .dashboard-metrics",
    ".view.active > .dashboard-switch",
    ".view.active > .dashboard-main",
    ".view.active .panel.table-wrap",
    ".view.active .dashboard-performance > .panel"
  ];
  return [...new Set(Array.from(document.querySelectorAll(selectors.join(","))))]
    .filter((element) => element.offsetParent !== null && !element.closest("#developerToolbar") && !element.closest("#modal"));
}

function developerBlockKey(element, index) {
  const customId = element.dataset.developerCustomBlock;
  if (customId) return `${activeView}:custom:${customId}`;
  const title = element.querySelector("h1,h2,h3,strong")?.textContent || element.className || element.tagName;
  const seed = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 36);
  return `${activeView}:block:${index}:${seed}`;
}

function enableDeveloperBlockEditing() {
  developerBlockElements().forEach((element, index) => {
    if (element.classList.contains("developer-block-hidden")) return;
    element.dataset.devBlockKey = element.dataset.devBlockKey || developerBlockKey(element, index);
    element.classList.add("developer-block-editable");
    if (!element.querySelector(":scope > .developer-block-tools")) {
      element.insertAdjacentHTML("afterbegin", `
        <div class="developer-block-tools" contenteditable="false">
          <button type="button" class="secondary tiny" onclick="toggleDeveloperBlockSize(this)">Size</button>
          <button type="button" class="danger tiny" onclick="hideDeveloperBlock(this)">Hide</button>
        </div>`);
    }
  });
}

function toggleDeveloperBlockSize(button) {
  const block = button.closest("[data-dev-block-key]");
  if (!block) return;
  block.classList.toggle("developer-resizable-block");
  button.textContent = block.classList.contains("developer-resizable-block") ? "Sizing" : "Size";
}

function hideDeveloperBlock(button) {
  const block = button.closest("[data-dev-block-key]");
  if (!block) return;
  const layout = developerLayout();
  layout[block.dataset.devBlockKey] = { ...(layout[block.dataset.devBlockKey] || {}), hidden: true };
  persistDeveloperLayout(layout);
  block.classList.add("developer-block-hidden");
}

function addDeveloperBlock() {
  if (!state.settings.developerCustomBlocks) state.settings.developerCustomBlocks = {};
  if (!state.settings.developerCustomBlocks[activeView]) state.settings.developerCustomBlocks[activeView] = [];
  state.settings.developerCustomBlocks[activeView].push({
    id: uid(),
    title: "Custom Block",
    body: "Edit this text in Developer Mode."
  });
  save();
  renderAll();
  toast("Custom block added");
}

function developerModeActive() {
  const user = JSON.parse(localStorage.getItem("vasma_user") || "{}");
  if (user.role === "developer") return localStorage.getItem(DEVELOPER_MODE_KEY) !== "false";
  return localStorage.getItem(DEVELOPER_MODE_KEY) === "true";
}

function switchDeveloperMode() {
  const user = JSON.parse(localStorage.getItem("vasma_user") || "{}");
  if (user.role !== "developer") return toast("Login as Developer to use edit mode");
  localStorage.setItem(DEVELOPER_MODE_KEY, "true");
  renderAll();
  toast("Developer edit mode enabled");
}

function updateDeveloperAccessButton() {
  const button = document.querySelector(".top-dev-btn");
  if (!button) return;
  const user = JSON.parse(localStorage.getItem("vasma_user") || "{}");
  button.hidden = user.role !== "developer";
}

function renderDeveloperToolbar() {
  document.querySelector("#developerToolbar")?.remove();
  document.body.classList.toggle("developer-mode", developerModeActive());
  if (!developerModeActive()) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div id="developerToolbar" class="developer-toolbar">
      <strong>Developer Mode</strong>
      <span>Edit headings and labels, then save.</span>
      <label class="developer-size-control">Graph height <input id="developerGraphHeight" type="range" min="260" max="560" step="10" value="${escapeAttr(state.settings?.developerGraphHeight || "390")}"><output>${escapeHtml(state.settings?.developerGraphHeight || "390")}px</output></label>
      <button type="button" class="secondary" onclick="addDeveloperBlock()">Add Block</button>
      <button type="button" class="primary" onclick="saveDeveloperEdits()">Save Changes</button>
      <button type="button" class="secondary" onclick="cancelDeveloperMode()">View Mode</button>
      <button type="button" class="danger" onclick="resetDeveloperEdits()">Reset Text</button>
      <button type="button" class="danger" onclick="resetDeveloperLayout()">Reset Layout</button>
    </div>`);
  document.querySelector("#developerGraphHeight")?.addEventListener("input", (event) => {
    event.target.nextElementSibling.textContent = `${event.target.value}px`;
    document.documentElement.style.setProperty("--graph-height", `${event.target.value}px`);
  });
  enableDeveloperEditing();
  enableDeveloperBlockEditing();
}

function editableDeveloperElements() {
  const selectors = [
    ".view.active h1",
    ".view.active h2",
    ".view.active h3",
    ".view.active .toolbar p",
    ".view.active .muted",
    ".view.active th",
    ".view.active .dashboard-switch-button",
    ".view.active .metric span",
    ".topbar .brand-signature",
    ".topbar h2"
  ];
  return Array.from(document.querySelectorAll(selectors.join(",")))
    .filter((element) => element.offsetParent !== null && !element.closest("#developerToolbar") && !element.closest("table tbody"));
}

function developerElementKey(element, index) {
  const viewId = element.closest(".view")?.id || "global";
  const tag = element.tagName.toLowerCase();
  const textSeed = (element.dataset.devOriginal || element.textContent || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 34);
  return `${viewId}:${tag}:${index}:${textSeed}`;
}

function applyDeveloperEdits() {
  const edits = developerEdits();
  editableDeveloperElements().forEach((element, index) => {
    if (!element.dataset.devOriginal) element.dataset.devOriginal = element.textContent.trim();
    const key = developerElementKey(element, index);
    element.dataset.devKey = key;
    if (edits[key]) element.textContent = edits[key];
  });
  if (developerModeActive()) enableDeveloperEditing();
}

function enableDeveloperEditing() {
  editableDeveloperElements().forEach((element, index) => {
    if (!element.dataset.devOriginal) element.dataset.devOriginal = element.textContent.trim();
    element.dataset.devKey = developerElementKey(element, index);
    element.contentEditable = "true";
    element.spellcheck = false;
    element.classList.add("developer-editable");
  });
}

function saveDeveloperEdits() {
  const edits = developerEdits();
  const layout = developerLayout();
  developerBlockElements().forEach((element, index) => {
    const key = element.dataset.devBlockKey || developerBlockKey(element, index);
    const rect = element.getBoundingClientRect();
    const current = layout[key] || {};
    layout[key] = {
      ...current,
      hidden: element.classList.contains("developer-block-hidden") || current.hidden || false,
      width: element.style.width || (element.classList.contains("developer-resizable-block") ? `${Math.round(rect.width)}px` : current.width || ""),
      height: element.style.minHeight || (element.classList.contains("developer-resizable-block") ? `${Math.round(rect.height)}px` : current.height || "")
    };
    element.classList.remove("developer-block-editable", "developer-resizable-block");
    element.querySelector(":scope > .developer-block-tools")?.remove();
  });
  document.querySelectorAll("[data-developer-custom-block]").forEach((block) => {
    const custom = activeCustomBlocks().find((entry) => entry.id === block.dataset.developerCustomBlock);
    if (!custom) return;
    custom.title = block.querySelector("h1,h2,h3")?.textContent.trim() || custom.title;
    custom.body = block.querySelector("p")?.textContent.trim() || custom.body;
  });
  editableDeveloperElements().forEach((element, index) => {
    const key = element.dataset.devKey || developerElementKey(element, index);
    const original = element.dataset.devOriginal || "";
    const current = element.textContent.trim();
    if (current && current !== original) edits[key] = current;
    else delete edits[key];
    element.contentEditable = "false";
    element.classList.remove("developer-editable");
  });
  state.settings.developerGraphHeight = document.querySelector("#developerGraphHeight")?.value || state.settings.developerGraphHeight || "390";
  persistDeveloperLayout(layout);
  persistDeveloperEdits(edits);
  localStorage.setItem(DEVELOPER_MODE_KEY, "false");
  renderAll();
  toast("Developer changes saved");
}

function cancelDeveloperMode() {
  localStorage.setItem(DEVELOPER_MODE_KEY, "false");
  document.body.classList.remove("developer-mode");
  document.querySelector("#developerToolbar")?.remove();
  editableDeveloperElements().forEach((element) => {
    element.contentEditable = "false";
    element.classList.remove("developer-editable");
  });
  developerBlockElements().forEach((element) => {
    element.classList.remove("developer-block-editable", "developer-resizable-block");
    element.querySelector(":scope > .developer-block-tools")?.remove();
  });
  renderAll();
  toast("View mode enabled");
}

function resetDeveloperEdits() {
  if (!confirm("Reset all developer text edits?")) return;
  persistDeveloperEdits({});
  localStorage.removeItem(DEVELOPER_MODE_KEY);
  renderAll();
  toast("Developer text edits reset");
}

function resetDeveloperLayout() {
  if (!confirm("Reset all developer layout changes and custom blocks?")) return;
  if (!state.settings) state.settings = structuredClone(seed.settings);
  state.settings.developerLayout = {};
  state.settings.developerCustomBlocks = {};
  state.settings.developerGraphHeight = "390";
  save();
  renderAll();
  toast("Developer layout reset");
}

Object.assign(window, {
  switchDeveloperMode,
  saveDeveloperEdits,
  cancelDeveloperMode,
  resetDeveloperEdits,
  resetDeveloperLayout,
  addDeveloperBlock,
  toggleDeveloperBlockSize,
  hideDeveloperBlock
});

const swTranslations = {
  "Dashboard": "Dashibodi",
  "Customers": "Wateja",
  "Job Cards": "Kadi za Kazi",
  "Work Confirmation": "Uthibitisho wa Kazi",
  "Service Cards": "Kadi za Huduma",
  "Payments": "Malipo",
  "Expenses": "Matumizi",
  "Commissions": "Kamisheni",
  "Transaction Edit": "Marekebisho ya Miamala",
  "Business Admin": "Usimamizi wa Biashara",
  "Business Profile": "Wasifu wa Biashara",
  "Branches": "Matawi",
  "Users & Roles": "Watumiaji na Majukumu",
  "Permissions": "Ruhusa",
  "Audit Logs": "Kumbukumbu za Ukaguzi",
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

function rankJobItems(jobs, labelFn = (job, item) => jobItemServiceName(job, item)) {
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
  if (view === "Bar Chart") return verticalBarPanel(title, rows);
  if (view === "Pie Chart") return piePanel(title, rows);
  return rankingPanel(title, rows);
}

function verticalBarPanel(title, rows) {
  const axis = title.includes("Attendant") ? "Attendant" : title.includes("Item") ? "Service Item" : title.includes("Category") ? "Service Category" : "Category";
  return ratioBarChartPanel(title, rows, axis);
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
  const table = document.querySelector("#reportTable table");
  if (!table) return toast("Report not ready");
  const headerCells = Array.from(table.querySelectorAll("thead tr:first-child th"));
  const headers = headerCells.map((cell) => cleanCsvText(cell.textContent));
  const moneyColumns = headers
    .map((header, index) => ({ header, index }))
    .filter(({ header }) => isMoneyReportHeader(header))
    .map(({ index }) => index);
  const exportHeaders = headers.map((header, index) => moneyColumns.includes(index) ? amountHeader(header) : header);
  const bodyRows = Array.from(table.querySelectorAll("tbody tr")).map((tr) => {
    const cells = expandCsvCells(tr, headers.length);
    return headers.map((_, index) => {
      const value = cleanCsvText(cells[index] || "");
      return moneyColumns.includes(index) ? cleanMoneyForExcel(value) : value;
    });
  });
  const csvRows = [exportHeaders, ...bodyRows].map((row) => row.map(csvCell).join(","));
  download(`vasma-report-${today()}.csv`, csvRows.join("\n"), "text/csv");
}

function expandCsvCells(tr, columnCount) {
  const values = [];
  Array.from(tr.children).forEach((cell) => {
    const text = cell.textContent;
    const span = Number(cell.getAttribute("colspan") || 1);
    values.push(text);
    for (let i = 1; i < span; i += 1) values.push("");
  });
  while (values.length < columnCount) values.push("");
  return values.slice(0, columnCount);
}

function amountHeader(header) {
  const clean = String(header || "").replace(/\s*\((Tsh|TZS)\)\s*$/i, "").trim();
  return `${clean} (Tsh)`;
}

function isMoneyReportHeader(header) {
  const text = String(header || "").toLowerCase();
  return [
    "amount",
    "paid",
    "commission",
    "expense",
    "expenses",
    "balance",
    "outstanding",
    "billed",
    "income",
    "total bill",
    "job card amount",
    "kiasi",
    "imelipwa",
    "kamisheni",
    "matumizi",
    "salio",
    "baki",
    "jumla"
  ].some((term) => text.includes(term));
}

function cleanMoneyForExcel(value) {
  const normalized = String(value || "")
    .replace(/TSh|TZS|Tsh|Â/gi, "")
    .replace(/[^\d.,-]/g, "")
    .replace(/,/g, "")
    .trim();
  if (!normalized) return "";
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : normalized;
}

function cleanCsvText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
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

function deleteSubItem(categoryId, itemId, subItemId) {
  if (!confirm("Delete this sub item?")) return;
  const item = serviceItemRecord(categoryId, itemId);
  if (!item) return;
  item.subItems = (item.subItems || []).filter((subItem) => subItem.id !== subItemId);
  state.jobCards.forEach((job) => {
    job.items.forEach((line) => {
      if (line.categoryId === categoryId && line.itemId === itemId) {
        line.subItemIds = (line.subItemIds || []).filter((id) => id !== subItemId);
        if (line.subItemStatus) delete line.subItemStatus[subItemId];
      }
    });
  });
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
