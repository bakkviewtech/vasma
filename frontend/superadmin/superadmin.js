const API_URL = window.VASMA_API_URL || localStorage.getItem("vasma_api_url") || "";
const token = localStorage.getItem("vasma_token") || sessionStorage.getItem("vasma_token") || "";
const user = JSON.parse(localStorage.getItem("vasma_user") || "null");

const content = document.querySelector("#content");
const message = document.querySelector("#message");
const pageTitle = document.querySelector("#pageTitle");
let selectedSubscriptionId = null;

const featureOptions = [
  ["reports", "Reports"],
  ["analysis", "Analysis"],
  ["service_cards", "Service Cards"],
  ["qr_documents", "QR Documents"],
  ["backup", "Backup Tools"],
  ["multi_branch", "Multi-branch"]
];

const billingDurationDays = {
  MONTHLY: 30,
  QUARTERLY: 90,
  SEMI_ANNUAL: 180,
  YEARLY: 365
};

if (!token || user?.role !== "admin") {
  location.replace("../admin-login.html");
}

function showMessage(text, error = false) {
  message.hidden = false;
  message.textContent = text;
  message.style.background = error ? "#fee2e2" : "#e0f2fe";
  message.style.color = error ? "#991b1b" : "#075985";
  setTimeout(() => (message.hidden = true), 4500);
}

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    },
    body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) throw new Error(data.error || "Request failed");
  return data;
}

function money(value) {
  return new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 2 }).format(Number(value || 0));
}

function number(value) {
  return new Intl.NumberFormat("en-TZ").format(Number(value || 0));
}

function percent(part, total) {
  const numerator = Number(part || 0);
  const denominator = Number(total || 0);
  if (!denominator) return "0%";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function dateOnly(value) {
  return value ? String(value).slice(0, 10) : "";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + Number(days || 30));
  return date.toISOString().slice(0, 10);
}

function servicesText(services = []) {
  const names = { tire: "Tire", carWash: "Car Wash", general: "General" };
  return services.map((service) => names[service] || service).join(", ") || "None";
}

function statusPill(status) {
  const value = String(status || "").toUpperCase();
  const cls = ["ACTIVE", "TRIAL", "CONFIRMED"].includes(value) ? "ok" : ["SUSPENDED", "EXPIRED", "CANCELLED", "REJECTED"].includes(value) ? "bad" : "";
  return `<span class="pill ${cls}">${value || "N/A"}</span>`;
}

function titleText(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(filename, rows) {
  if (!rows.length) return showMessage("No detail rows to export", true);
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function detailTable(title, rows) {
  if (!rows.length) return `<div class="panel"><h2>${title}</h2><p class="muted">No records found for this selection.</p></div>`;
  const headers = Object.keys(rows[0]);
  return `
    <div class="panel table-wrap" id="detailReportPrintArea">
      <h2>${title}</h2>
      <table>
        <thead><tr>${headers.map((header) => `<th>${titleText(header)}${/(amount|income|price)$/i.test(header) ? " (Tsh)" : ""}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((row) => `<tr>${headers.map((header) => `<td>${/(amount|income|price)$/i.test(header) ? money(row[header]) : row[header] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>`;
}

function printDetailReport(title) {
  const area = document.querySelector("#detailReportPrintArea");
  if (!area) return showMessage("Load a detail report first", true);
  const win = window.open("", "_blank");
  win.document.write(`
    <html><head><title>${title}</title>
    <style>
      body{font-family:Segoe UI,Arial,sans-serif;padding:24px;color:#061733}
      h1{font-size:22px;margin:0 0 6px} p{color:#64748b;margin:0 0 18px}
      table{width:100%;border-collapse:collapse;font-size:11px}
      th,td{border:1px solid #d8e2ec;padding:7px;text-align:left;vertical-align:top}
      th{background:#e8f5ff;text-transform:uppercase;font-size:10px}
    </style></head><body>
      <h1>${title}</h1><p>Generated by VASMA Super Admin on ${new Date().toLocaleString()}</p>
      ${area.innerHTML}
    </body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function selectedServices(form) {
  return Array.from(form.querySelectorAll("[name=services]:checked")).map((input) => input.value);
}

function subscriptionPayload(id) {
  const row = document.querySelector(`[data-subscription-row="${id}"]`);
  return {
    planId: row.querySelector("[name=planId]")?.value || "",
    status: row.querySelector("[name=status]")?.value || "PENDING",
    startDate: row.querySelector("[name=startDate]")?.value || today(),
    expiryDate: row.querySelector("[name=expiryDate]")?.value || today(),
    branchLimit: row.querySelector("[name=branchLimit]")?.value || "1",
    services: Array.from(row.querySelectorAll("[name=services]:checked")).map((input) => input.value)
  };
}

function branchCountText(sub) {
  const count = Number(sub.branch_count ?? sub.branches ?? 0);
  const limit = Number(sub.branch_limit || sub.plan_branch_limit || 1);
  return `${count} branch${count === 1 ? "" : "es"} / limit ${limit}`;
}

function branchList(sub) {
  return String(sub.branch_list || "")
    .split("||")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function selectedFeatures(form) {
  return featureOptions.map(([featureKey, featureName]) => ({
    featureKey,
    featureName,
    enabled: form.querySelector(`[name=feature_${featureKey}]`)?.checked || false
  }));
}

async function renderOverview() {
  pageTitle.textContent = "Overview";
  const { summary } = await api("/api/admin/summary");
  content.innerHTML = `
    <div class="grid cards">
      <div class="card"><span>Registered Businesses</span><strong>${summary.businesses || 0}</strong></div>
      <div class="card"><span>Pending Requests</span><strong>${summary.pendingSubscriptions || 0}</strong></div>
      <div class="card"><span>Active Businesses</span><strong>${summary.activeBusinesses || 0}</strong></div>
      <div class="card"><span>Active Subscriptions</span><strong>${summary.activeSubscriptions || 0}</strong></div>
      <div class="card"><span>Demo Registrations</span><strong>${summary.demoRegistrations || 0}</strong><small>${summary.activeDemoRegistrations || 0} active, ${summary.demoRegistrationsToday || 0} today</small></div>
      <div class="card"><span>Packages</span><strong>${summary.packages || 0}</strong></div>
    </div>
    <div class="panel" style="margin-top:16px">
      <h2>Super Admin Workflow</h2>
      <p>Business owners register from the landing page and their subscription appears here as a pending request. The system owner reviews the request, confirms payment, edits package/period/branch limit when required, then activates the subscription.</p>
    </div>`;
}

async function renderPackages() {
  pageTitle.textContent = "Manage Packages";
  const { packages } = await api("/api/admin/packages");
  content.innerHTML = `
    <div class="panel package-builder">
      <div class="toolbar">
        <div>
          <h2>Create / Update Package</h2>
          <p class="muted">Define package identity, period, branch limit, allowed services, and feature access.</p>
        </div>
      </div>
      <form id="packageForm" class="package-form">
        <div class="package-fields">
          <label>Package Code<input name="planCode" placeholder="VASMA-PRO-MONTHLY" required></label>
          <label>Package Name<input name="planName" placeholder="Full Service Package" required></label>
          <label>Billing Period<select name="billingPeriod"><option>MONTHLY</option><option>QUARTERLY</option><option>SEMI_ANNUAL</option><option>YEARLY</option><option>CUSTOM</option></select></label>
          <label>Duration Days<input name="durationDays" type="number" value="30"></label>
          <label>Branch Limit<input name="branchLimit" type="number" value="1"></label>
          <label>Price (Tsh)<input name="price" inputmode="decimal" value="0"></label>
        </div>
        <section class="package-option-card">
          <h3>Service Access</h3>
          <p class="muted">Choose the service modules that will open for this package.</p>
          <div class="package-choice-grid">
            <label><input type="checkbox" name="services" value="tire"><span>Tire Service</span></label>
            <label><input type="checkbox" name="services" value="carWash"><span>Car Wash</span></label>
            <label><input type="checkbox" name="services" value="general"><span>General Service</span></label>
          </div>
        </section>
        <section class="package-option-card">
          <h3>Package Features</h3>
          <p class="muted">Turn on the tools included in the package.</p>
          <div class="package-choice-grid feature-grid">
            ${featureOptions.map(([key, name]) => `<label><input type="checkbox" name="feature_${key}" checked><span>${name}</span></label>`).join("")}
          </div>
        </section>
        <div class="package-actions">
          <button class="primary">Save Package</button>
        </div>
      </form>
    </div>
    <div class="panel table-wrap">
      <div class="toolbar"><h2>Packages</h2></div>
      <table>
        <thead><tr><th>Code</th><th>Name</th><th>Services</th><th>Period</th><th>Branches</th><th>Price</th><th>Status</th><th></th></tr></thead>
        <tbody>${packages.map((plan) => `
          <tr data-package-row="${plan.id}">
            <td>${plan.plan_code}</td><td>${plan.plan_name}</td><td>${servicesText(plan.services)}</td>
            <td>${plan.billing_period} / ${plan.duration_days} days</td><td>${plan.branch_limit}</td><td>${money(plan.price)}</td>
            <td>${plan.active ? statusPill("ACTIVE") : statusPill("DISABLED")}</td>
            <td><button class="danger" data-disable-package="${plan.id}">Disable</button></td>
          </tr>`).join("")}</tbody>
      </table>
    </div>`;
  document.querySelector("#packageForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formValues(event.target);
    payload.services = selectedServices(event.target);
    payload.features = selectedFeatures(event.target);
    await api("/api/admin/packages", { method: "POST", body: payload });
    showMessage("Package saved");
    renderPackages();
  });
  const packageForm = document.querySelector("#packageForm");
  const billingPeriod = packageForm.querySelector("[name=billingPeriod]");
  const durationDays = packageForm.querySelector("[name=durationDays]");
  billingPeriod.addEventListener("change", () => {
    const days = billingDurationDays[billingPeriod.value];
    if (days) {
      durationDays.value = days;
      durationDays.readOnly = true;
    } else {
      durationDays.readOnly = false;
      durationDays.focus();
    }
  });
  billingPeriod.dispatchEvent(new Event("change"));
  document.querySelectorAll("[data-disable-package]").forEach((button) => button.addEventListener("click", async () => {
    if (!confirm("Disable this package?")) return;
    await api(`/api/admin/packages/${button.dataset.disablePackage}`, { method: "DELETE" });
    showMessage("Package disabled");
    renderPackages();
  }));
}

async function renderBusinesses() {
  pageTitle.textContent = "Registered Businesses";
  const { businesses } = await api("/api/admin/businesses");
  content.innerHTML = `
    <div class="panel table-wrap">
      <div class="toolbar"><h2>Businesses Registered From Landing Page</h2></div>
      <table>
        <thead><tr><th>Business</th><th>Owner</th><th>Mobile</th><th>Package</th><th>Branches</th><th>Jobs</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${businesses.map((business) => `
          <tr>
            <td><strong>${business.business_name}</strong><br><span class="pill">${business.business_uid || "No Business ID"}</span><br><span class="pill">${business.business_code}</span></td>
            <td>${business.owner_name || ""}</td><td>${business.mobile || ""}</td>
            <td>${business.plan_name || "Not assigned"}</td><td>${business.branches || 0}</td><td>${business.job_cards || 0}</td>
            <td>${statusPill(business.status)}</td>
            <td>
              <select data-business-status="${business.id}">
                ${["PENDING","TRIAL","APPROVED_AWAITING_PAYMENT","PAYMENT_SUBMITTED","ACTIVE","EXPIRED","SUSPENDED"].map((status) => `<option ${business.status === status ? "selected" : ""}>${status}</option>`).join("")}
              </select>
            </td>
          </tr>`).join("")}</tbody>
      </table>
    </div>`;
  document.querySelectorAll("[data-business-status]").forEach((select) => select.addEventListener("change", async () => {
    await api(`/api/admin/businesses/${select.dataset.businessStatus}/status`, { method: "PATCH", body: { status: select.value } });
    showMessage("Business status updated");
    renderBusinesses();
  }));
}

async function renderReports() {
  pageTitle.textContent = "Super Admin Reports";
  const defaultTo = today();
  const defaultFromDate = new Date();
  defaultFromDate.setDate(defaultFromDate.getDate() - 6);
  const defaultFrom = defaultFromDate.toISOString().slice(0, 10);
  const existingFrom = document.querySelector("[name=reportFrom]")?.value || defaultFrom;
  const existingTo = document.querySelector("[name=reportTo]")?.value || defaultTo;
  const { reports } = await api(`/api/admin/reports?from=${encodeURIComponent(existingFrom)}&to=${encodeURIComponent(existingTo)}`);
  const business = reports.businessSummary || {};
  const subscription = reports.subscriptionSummary || {};
  const income = reports.incomeSummary || {};
  const payment = reports.paymentSummary || {};
  const trial = reports.trialSummary || {};
  const branchUsers = reports.branchUserSummary || {};
  const demo = reports.demoSummary || {};
  const conversionRate = percent(trial.convertedOrActive, Number(trial.convertedOrActive || 0) + Number(trial.inTrial || 0) + Number(trial.expiredTrials || 0));

  content.innerHTML = `
    <div class="panel report-filter-panel">
      <div>
        <h2>System Owner Summary</h2>
        <p class="muted">Business registrations, subscription status, platform income, trial activity, packages, branches, and users.</p>
      </div>
      <form id="reportFilterForm" class="report-filter">
        <label>From<input type="date" name="reportFrom" value="${existingFrom}"></label>
        <label>To<input type="date" name="reportTo" value="${existingTo}"></label>
        <button class="primary">Apply Custom Range</button>
      </form>
    </div>

    <div class="panel report-detail-controls">
      <div>
        <h2>Detailed Report Viewer</h2>
        <p class="muted">Load detailed rows, then export to Excel-compatible CSV or print/save as PDF.</p>
      </div>
      <form id="detailReportForm" class="detail-report-form">
        <label>Report Type<select name="type">
          <option value="businesses">Business Details</option>
          <option value="subscriptions">Subscription Details</option>
          <option value="payments">Subscription Payment Details</option>
          <option value="trials">Trial Business Details</option>
          <option value="demo">Demo Registration Details</option>
          <option value="packages">Package Performance</option>
        </select></label>
        <label>Status<select name="status">
          <option value="">All</option>
          <option>ACTIVE</option><option>TRIAL</option><option>PENDING</option><option>APPROVED_AWAITING_PAYMENT</option>
          <option>PAYMENT_SUBMITTED</option><option>EXPIRED</option><option>SUSPENDED</option><option>CANCELLED</option>
          <option>CONFIRMED</option><option>REJECTED</option>
        </select></label>
        <label>Payment Period<select name="period">
          <option value="custom">Custom</option><option value="today">Today</option><option value="week">This Week</option><option value="mtd">MTD</option><option value="ytd">YTD</option>
        </select></label>
        <button class="primary">Load Details</button>
      </form>
      <div class="detail-report-actions">
        <button class="secondary" id="exportDetailExcel" type="button">Export Excel</button>
        <button class="secondary" id="printDetailPdf" type="button">Print / Save PDF</button>
      </div>
    </div>
    <div id="detailReportHost"></div>

    <div class="grid cards report-cards">
      <div class="card"><span>Businesses Registered</span><strong>${number(business.totalBusinesses)}</strong><small>${number(business.pendingBusinesses)} pending approval</small></div>
      <div class="card"><span>Active Businesses</span><strong>${number(business.activeBusinesses)}</strong><small>${percent(business.activeBusinesses, business.totalBusinesses)} of registered</small></div>
      <div class="card"><span>Trial Businesses</span><strong>${number(business.trialBusinesses)}</strong><small>${number(trial.trialsExpiring7)} expiring in 7 days</small></div>
      <div class="card"><span>Demo Registrations</span><strong>${number(demo.totalDemoRegistrations)}</strong><small>${number(demo.activeDemoRegistrations)} active, ${number(demo.demoLast7Days)} last 7 days</small></div>
      <div class="card"><span>Expired / Suspended</span><strong>${number(Number(business.expiredBusinesses || 0) + Number(business.suspendedBusinesses || 0))}</strong><small>${number(business.expiredBusinesses)} expired, ${number(business.suspendedBusinesses)} suspended</small></div>
      <div class="card"><span>Income Today</span><strong>${money(income.today)}</strong><small>Confirmed subscription income</small></div>
      <div class="card"><span>This Week</span><strong>${money(income.thisWeek)}</strong><small>Confirmed subscription income</small></div>
      <div class="card"><span>MTD Income</span><strong>${money(income.mtd)}</strong><small>Month to date</small></div>
      <div class="card"><span>YTD Income</span><strong>${money(income.ytd)}</strong><small>Year to date</small></div>
    </div>

    <div class="report-grid">
      <section class="panel report-panel">
        <h2>Subscription Income</h2>
        <table class="compact-report-table">
          <thead><tr><th>Period</th><th>Amount (Tsh)</th></tr></thead>
          <tbody>
            <tr><td>Today</td><td>${money(income.today)}</td></tr>
            <tr><td>This Week</td><td>${money(income.thisWeek)}</td></tr>
            <tr><td>MTD</td><td>${money(income.mtd)}</td></tr>
            <tr><td>YTD</td><td>${money(income.ytd)}</td></tr>
            <tr><td>Custom: ${dateOnly(existingFrom)} to ${dateOnly(existingTo)}</td><td>${money(income.custom)}</td></tr>
          </tbody>
        </table>
      </section>

      <section class="panel report-panel">
        <h2>Payment Review</h2>
        <table class="compact-report-table">
          <thead><tr><th>Status</th><th>Count</th><th>Amount (Tsh)</th></tr></thead>
          <tbody>
            <tr><td>Pending</td><td>${number(payment.pendingPayments)}</td><td>${money(payment.pendingAmount)}</td></tr>
            <tr><td>Confirmed</td><td>${number(payment.confirmedPayments)}</td><td>${money(payment.confirmedAmount)}</td></tr>
            <tr><td>Rejected</td><td>${number(payment.rejectedPayments)}</td><td>${money(payment.rejectedAmount)}</td></tr>
          </tbody>
        </table>
      </section>

      <section class="panel report-panel">
        <h2>Trial and Conversion</h2>
        <table class="compact-report-table">
          <thead><tr><th>Metric</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>Currently in trial</td><td>${number(trial.inTrial)}</td></tr>
            <tr><td>Trials expiring in 7 days</td><td>${number(trial.trialsExpiring7)}</td></tr>
            <tr><td>Expired trials</td><td>${number(trial.expiredTrials)}</td></tr>
            <tr><td>Pending extension requests</td><td>${number(trial.pendingExtensionRequests)}</td></tr>
            <tr><td>Approved extension requests</td><td>${number(trial.approvedExtensionRequests)}</td></tr>
            <tr><td>Approx. trial to active conversion</td><td>${conversionRate}</td></tr>
          </tbody>
        </table>
      </section>

      <section class="panel report-panel">
        <h2>Branches and Users</h2>
        <table class="compact-report-table">
          <thead><tr><th>Metric</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>Total branches</td><td>${number(branchUsers.totalBranches)}</td></tr>
            <tr><td>Active branches</td><td>${number(branchUsers.activeBranches)}</td></tr>
            <tr><td>Inactive branches</td><td>${number(branchUsers.inactiveBranches)}</td></tr>
            <tr><td>Total business-user links</td><td>${number(branchUsers.totalBusinessUsers)}</td></tr>
            <tr><td>Unique business users</td><td>${number(branchUsers.uniqueBusinessUsers)}</td></tr>
            <tr><td>Businesses at branch limit</td><td>${number(branchUsers.businessesAtBranchLimit)}</td></tr>
          </tbody>
        </table>
      </section>
    </div>

    <div class="report-grid">
      <section class="panel table-wrap report-panel">
        <h2>Business Status Summary</h2>
        <table>
          <thead><tr><th>Status</th><th>Businesses</th><th>Share</th></tr></thead>
          <tbody>${(reports.businessStatusRows || []).map((row) => `
            <tr><td>${statusPill(row.status)}</td><td>${number(row.count)}</td><td>${percent(row.count, business.totalBusinesses)}</td></tr>
          `).join("") || `<tr><td colspan="3">No businesses registered.</td></tr>`}</tbody>
        </table>
      </section>
      <section class="panel table-wrap report-panel">
        <h2>Subscription Status Summary</h2>
        <table>
          <thead><tr><th>Status</th><th>Subscriptions</th><th>Share</th></tr></thead>
          <tbody>${(reports.subscriptionStatusRows || []).map((row) => `
            <tr><td>${statusPill(row.status)}</td><td>${number(row.count)}</td><td>${percent(row.count, subscription.totalSubscriptions)}</td></tr>
          `).join("") || `<tr><td colspan="3">No subscriptions found.</td></tr>`}</tbody>
        </table>
      </section>
    </div>

    <div class="panel table-wrap">
      <h2>Package Performance</h2>
      <table>
        <thead><tr><th>Package</th><th>Period</th><th>Businesses</th><th>Active</th><th>Trial</th><th>Inactive</th><th>Income (Tsh)</th></tr></thead>
        <tbody>${(reports.packagePerformance || []).map((plan) => `
          <tr>
            <td><strong>${plan.plan_name}</strong><br><span class="pill">${plan.plan_code}</span></td>
            <td>${plan.billing_period || ""}</td>
            <td>${number(plan.businesses)}</td>
            <td>${number(plan.active)}</td>
            <td>${number(plan.trial)}</td>
            <td>${number(plan.inactive)}</td>
            <td>${money(plan.income)}</td>
          </tr>
        `).join("") || `<tr><td colspan="7">No package data found.</td></tr>`}</tbody>
      </table>
    </div>

    <div class="report-grid">
      <section class="panel table-wrap report-panel">
        <h2>Demo Package Statistics</h2>
        <table>
          <thead><tr><th>Package</th><th>Total</th><th>Active</th><th>Expired</th></tr></thead>
          <tbody>${(reports.demoPackageRows || []).map((row) => `
            <tr><td>${row.package_name}</td><td>${number(row.count)}</td><td>${number(row.active)}</td><td>${number(row.expired)}</td></tr>
          `).join("") || `<tr><td colspan="4">No demo registrations yet.</td></tr>`}</tbody>
        </table>
      </section>
      <section class="panel table-wrap report-panel">
        <h2>Recent Demo Registrations</h2>
        <table>
          <thead><tr><th>Business</th><th>Package</th><th>Registered</th><th>Expires</th><th>Status</th></tr></thead>
          <tbody>${(reports.recentDemoRegistrations || []).map((entry) => `
            <tr>
              <td><strong>${entry.business_name || "VASMA Demo Panel"}</strong><br>${entry.owner_name || ""}<br>${entry.mobile || ""}</td>
              <td>${entry.package_name}</td>
              <td>${dateOnly(entry.registered_at)}</td>
              <td>${dateOnly(entry.expires_at)}</td>
              <td>${statusPill(entry.status)}</td>
            </tr>
          `).join("") || `<tr><td colspan="5">No demo registrations yet.</td></tr>`}</tbody>
        </table>
      </section>
    </div>

    <div class="report-grid">
      <section class="panel table-wrap report-panel">
        <h2>Subscriptions Expiring Soon</h2>
        <table>
          <thead><tr><th>Business</th><th>Package</th><th>Status</th><th>Expiry</th><th>Days</th></tr></thead>
          <tbody>${(reports.expiringSubscriptions || []).map((sub) => `
            <tr>
              <td><strong>${sub.business_name}</strong><br><span class="pill">${sub.business_uid || "No Business ID"}</span><br><span class="pill">${sub.business_code}</span><br><small>${sub.owner_name || ""}${sub.mobile ? ` - ${sub.mobile}` : ""}</small></td>
              <td>${sub.plan_name || ""}</td>
              <td>${statusPill(sub.status)}</td>
              <td>${dateOnly(sub.expiry_date)}</td>
              <td>${number(sub.days_remaining)}</td>
            </tr>
          `).join("") || `<tr><td colspan="5">No subscriptions expiring in the next 30 days.</td></tr>`}</tbody>
        </table>
      </section>
      <section class="panel table-wrap report-panel">
        <h2>Recent Subscription Payments</h2>
        <table>
          <thead><tr><th>Business</th><th>Package</th><th>Date</th><th>Amount (Tsh)</th><th>Status</th></tr></thead>
          <tbody>${(reports.recentPayments || []).map((pay) => `
            <tr>
              <td><strong>${pay.business_name}</strong><br><span class="pill">${pay.business_uid || "No Business ID"}</span><br><span class="pill">${pay.business_code}</span></td>
              <td>${pay.plan_name || ""}</td>
              <td>${dateOnly(pay.payment_date)}</td>
              <td>${money(pay.amount)}</td>
              <td>${statusPill(pay.status)}</td>
            </tr>
          `).join("") || `<tr><td colspan="5">No subscription payments submitted yet.</td></tr>`}</tbody>
        </table>
      </section>
    </div>
  `;

  document.querySelector("#reportFilterForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await renderReports();
  });
  let detailRows = [];
  let detailTitle = "Detailed Report";
  document.querySelector("#detailReportForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = formValues(event.target);
    const data = await api(`/api/admin/report-details?type=${encodeURIComponent(values.type)}&status=${encodeURIComponent(values.status)}&period=${encodeURIComponent(values.period)}&from=${encodeURIComponent(existingFrom)}&to=${encodeURIComponent(existingTo)}`);
    detailRows = data.rows || [];
    detailTitle = data.title || "Detailed Report";
    document.querySelector("#detailReportHost").innerHTML = detailTable(detailTitle, detailRows);
  });
  document.querySelector("#exportDetailExcel").addEventListener("click", () => {
    downloadCsv(`${detailTitle.replace(/\s+/g, "_").toLowerCase()}_${today()}.csv`, detailRows);
  });
  document.querySelector("#printDetailPdf").addEventListener("click", () => printDetailReport(detailTitle));
}

async function renderSubscriptions() {
  pageTitle.textContent = "Super Admin Subscription Management";
  const [{ subscriptions }, { packages }] = await Promise.all([
    api("/api/admin/subscriptions"),
    api("/api/admin/packages")
  ]);
  const activePackages = packages.filter((plan) => plan.active);
  const selectedSub = subscriptions.find((sub) => sub.id === selectedSubscriptionId);
  if (!selectedSub) selectedSubscriptionId = null;
  const selectedPackage = selectedSub ? activePackages.find((plan) => plan.id === selectedSub.plan_id) : null;
  content.innerHTML = `
    <div class="panel">
      <h2>Review Registered Subscription Requests</h2>
      <p>Subscriptions are created when a business owner registers from the landing page. Super Admin reviews the request, edits details when required, confirms payment outside the app, then activates or suspends the subscription.</p>
    </div>
    ${selectedSub ? `
      <div class="panel subscription-detail" data-subscription-row="${selectedSub.id}">
        <div class="toolbar">
          <div>
            <h2>${selectedSub.business_name}</h2>
            <p class="muted">${selectedSub.owner_name || ""}${selectedSub.mobile ? ` - ${selectedSub.mobile}` : ""}</p>
          </div>
          <button class="secondary" data-back-sub-list>Back to Business List</button>
        </div>
        <div class="subscription-summary">
          <span class="pill">${selectedSub.business_uid || "No Business ID"}</span>
          <span class="pill">${selectedSub.business_code}</span>
          ${statusPill(selectedSub.status)}
          <span class="pill">${branchCountText(selectedSub)}</span>
          <span class="pill">${servicesText(selectedSub.services)}</span>
        </div>
        <div class="subscription-setup-grid">
          <section class="setup-card">
            <h3>Business Setup</h3>
            <p><strong>Business:</strong> ${selectedSub.business_name}</p>
            <p><strong>Owner:</strong> ${selectedSub.owner_name || "N/A"}</p>
            <p><strong>Mobile:</strong> ${selectedSub.mobile || "N/A"}</p>
            <p><strong>Location:</strong> ${selectedSub.location || "N/A"}</p>
          </section>
          <section class="setup-card">
            <h3>Branches</h3>
            <p><strong>${branchCountText(selectedSub)}</strong></p>
            ${branchList(selectedSub).length ? `<ul class="branch-list">${branchList(selectedSub).map((branch) => `<li>${branch}</li>`).join("")}</ul>` : `<p class="muted">No branch records found yet.</p>`}
          </section>
          <section class="setup-card setup-form-card">
            <h3>Package and Period</h3>
            <label>Package<select name="planId" required>${activePackages.map((plan) => `<option value="${plan.id}" ${plan.id === selectedSub.plan_id ? "selected" : ""} data-duration="${plan.duration_days}" data-branches="${plan.branch_limit}">${plan.plan_name}</option>`).join("")}</select></label>
            <label>Branch Limit<input name="branchLimit" type="number" min="1" value="${selectedSub.branch_limit || selectedSub.plan_branch_limit || selectedPackage?.branch_limit || 1}"></label>
            <label>Status<select name="status">
              ${["PENDING","TRIAL","APPROVED_AWAITING_PAYMENT","PAYMENT_SUBMITTED","ACTIVE","EXPIRED","SUSPENDED","CANCELLED"].map((status) => `<option ${selectedSub.status === status ? "selected" : ""}>${status}</option>`).join("")}
            </select></label>
            <label>Start<input name="startDate" type="date" value="${dateOnly(selectedSub.start_date) || today()}"></label>
            <label>Expiry<input name="expiryDate" type="date" value="${dateOnly(selectedSub.expiry_date) || addDays(selectedSub.plan_duration_days)}"></label>
          </section>
          <section class="setup-card">
            <h3>Allowed Services</h3>
            <p class="muted">Services selected here are the only modules this business can use.</p>
            <div class="package-choice-grid compact-services">
              ${["tire","carWash","general"].map((service) => `<label><input type="checkbox" name="services" value="${service}" ${selectedSub.services.includes(service) ? "checked" : ""}><span>${servicesText([service])}</span></label>`).join("")}
            </div>
          </section>
        </div>
        <div class="subscription-detail-actions">
          <button class="primary" data-save-sub="${selectedSub.id}">Save Changes</button>
          <button class="secondary" data-approve-sub="${selectedSub.id}">Approve</button>
          <button class="secondary" data-activate-sub="${selectedSub.id}" data-duration="${selectedSub.plan_duration_days || 30}">Confirm Payment & Activate</button>
          <button class="danger" data-cancel-sub="${selectedSub.id}">Cancel Subscription</button>
        </div>
      </div>
    ` : `
      <div class="panel table-wrap">
        <div class="toolbar">
          <h2>Business Subscription List</h2>
          <span class="pill">${subscriptions.length} account${subscriptions.length === 1 ? "" : "s"}</span>
        </div>
        <table class="business-subscription-table">
          <thead><tr><th>Business</th><th>Package</th><th>Services</th><th>Status</th><th>Branches</th><th>Expiry</th><th>Action</th></tr></thead>
          <tbody>${subscriptions.map((sub) => `
            <tr class="clickable-row" data-open-sub="${sub.id}">
              <td>
                <strong>${sub.business_name}</strong><br>
                <span class="pill">${sub.business_uid || "No Business ID"}</span><br>
                <span class="pill">${sub.business_code}</span><br>
                <small>${sub.owner_name || ""}${sub.mobile ? ` - ${sub.mobile}` : ""}</small>
              </td>
              <td><strong>${sub.plan_name || "Not assigned"}</strong><br><small>${sub.plan_code || ""}</small></td>
              <td>${servicesText(sub.services)}</td>
              <td>${statusPill(sub.status)}</td>
              <td><span class="pill branch-pill">${branchCountText(sub)}</span></td>
              <td>${dateOnly(sub.expiry_date) || "N/A"}</td>
              <td><button class="primary" data-open-sub="${sub.id}">Setup</button></td>
            </tr>`).join("") || `<tr><td colspan="7">No subscription requests found.</td></tr>`}</tbody>
        </table>
      </div>
    `}`;
  document.querySelectorAll("[data-open-sub]").forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation();
    selectedSubscriptionId = button.dataset.openSub;
    renderSubscriptions();
  }));
  document.querySelector("[data-back-sub-list]")?.addEventListener("click", () => {
    selectedSubscriptionId = null;
    renderSubscriptions();
  });
  document.querySelectorAll("[data-save-sub]").forEach((button) => button.addEventListener("click", async () => {
    const payload = subscriptionPayload(button.dataset.saveSub);
    await api(`/api/admin/subscriptions/${button.dataset.saveSub}`, { method: "PUT", body: payload });
    showMessage("Subscription request updated");
    selectedSubscriptionId = null;
    renderSubscriptions();
  }));
  document.querySelectorAll("[data-approve-sub]").forEach((button) => button.addEventListener("click", async () => {
    const payload = subscriptionPayload(button.dataset.approveSub);
    payload.status = "APPROVED_AWAITING_PAYMENT";
    await api(`/api/admin/subscriptions/${button.dataset.approveSub}`, { method: "PUT", body: payload });
    showMessage("Subscription approved. Waiting for business payment submission.");
    selectedSubscriptionId = null;
    renderSubscriptions();
  }));
  document.querySelectorAll("[data-activate-sub]").forEach((button) => button.addEventListener("click", async () => {
    const row = document.querySelector(`[data-subscription-row="${button.dataset.activateSub}"]`);
    const payload = subscriptionPayload(button.dataset.activateSub);
    const packageOption = row.querySelector("[name=planId]")?.selectedOptions?.[0];
    payload.status = "ACTIVE";
    payload.startDate = today();
    payload.expiryDate = addDays(packageOption?.dataset.duration || button.dataset.duration || 30);
    payload.branchLimit = payload.branchLimit || packageOption?.dataset.branches || 1;
    await api(`/api/admin/subscriptions/${button.dataset.activateSub}`, { method: "PUT", body: payload });
    showMessage("Subscription activated");
    selectedSubscriptionId = null;
    renderSubscriptions();
  }));
  document.querySelectorAll("[data-cancel-sub]").forEach((button) => button.addEventListener("click", async () => {
    if (!confirm("Cancel this subscription?")) return;
    await api(`/api/admin/subscriptions/${button.dataset.cancelSub}`, { method: "DELETE" });
    showMessage("Subscription cancelled");
    selectedSubscriptionId = null;
    renderSubscriptions();
  }));
}

async function renderPayments() {
  pageTitle.textContent = "Payment Methods";
  const [{ paymentMethods }, { subscriptionPayments }] = await Promise.all([
    api("/api/admin/payment-methods"),
    api("/api/admin/subscription-payments")
  ]);
  content.innerHTML = `
    <div class="panel table-wrap">
      <h2>Subscription Payment Confirmations</h2>
      <table>
        <thead><tr><th>Business</th><th>Package</th><th>Date</th><th>Amount</th><th>Reference</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${subscriptionPayments.map((payment) => `
          <tr>
            <td><strong>${payment.business_name}</strong><br><span class="pill">${payment.business_uid || "No Business ID"}</span><br><span class="pill">${payment.business_code}</span></td>
            <td>${payment.plan_name || ""}</td>
            <td>${dateOnly(payment.payment_date)}</td>
            <td>${money(payment.amount)}</td>
            <td>${payment.reference || payment.comment || ""}</td>
            <td>${statusPill(payment.status)}</td>
            <td class="subscription-actions">
              <button class="secondary" data-confirm-sub-payment="${payment.id}" ${payment.status === "CONFIRMED" ? "disabled" : ""}>Confirm & Activate</button>
              <button class="danger" data-reject-sub-payment="${payment.id}" ${payment.status === "REJECTED" ? "disabled" : ""}>Reject</button>
            </td>
          </tr>`).join("") || `<tr><td colspan="7">No subscription payments submitted yet.</td></tr>`}</tbody>
      </table>
    </div>
    <div class="panel">
      <h2>Create / Update Payment Method</h2>
      <form id="paymentMethodForm">
        <label>Method Name<input name="methodName" placeholder="M-Pesa" required></label>
        <label>Account Name<input name="accountName" placeholder="Viewtech"></label>
        <label>Account Number<input name="accountNumber" placeholder="+255..."></label>
        <label class="wide">Instructions<textarea name="instructions" placeholder="Payment instructions for subscription users"></textarea></label>
        <button class="primary">Save Method</button>
      </form>
    </div>
    <div class="panel table-wrap">
      <h2>Payment Methods</h2>
      <table>
        <thead><tr><th>Method</th><th>Account</th><th>Number</th><th>Instructions</th><th>Status</th><th></th></tr></thead>
        <tbody>${paymentMethods.map((method) => `
          <tr><td>${method.method_name}</td><td>${method.account_name || ""}</td><td>${method.account_number || ""}</td>
          <td>${method.instructions || ""}</td><td>${method.active ? statusPill("ACTIVE") : statusPill("DISABLED")}</td>
          <td><button class="danger" data-disable-method="${method.id}">Disable</button></td></tr>`).join("")}</tbody>
      </table>
    </div>`;
  document.querySelectorAll("[data-confirm-sub-payment]").forEach((button) => button.addEventListener("click", async () => {
    if (!confirm("Confirm this payment and activate the business subscription?")) return;
    await api(`/api/admin/subscription-payments/${button.dataset.confirmSubPayment}/confirm`, { method: "PATCH", body: {} });
    showMessage("Payment confirmed and subscription activated");
    renderPayments();
  }));
  document.querySelectorAll("[data-reject-sub-payment]").forEach((button) => button.addEventListener("click", async () => {
    const comment = prompt("Reason for rejection") || "Rejected";
    await api(`/api/admin/subscription-payments/${button.dataset.rejectSubPayment}/reject`, { method: "PATCH", body: { comment } });
    showMessage("Payment rejected");
    renderPayments();
  }));
  document.querySelector("#paymentMethodForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await api("/api/admin/payment-methods", { method: "POST", body: formValues(event.target) });
    showMessage("Payment method saved");
    renderPayments();
  });
  document.querySelectorAll("[data-disable-method]").forEach((button) => button.addEventListener("click", async () => {
    await api(`/api/admin/payment-methods/${button.dataset.disableMethod}`, { method: "DELETE" });
    showMessage("Payment method disabled");
    renderPayments();
  }));
}

async function renderLanding() {
  pageTitle.textContent = "Landing Pages";
  const { landingPages } = await api("/api/admin/landing-pages");
  content.innerHTML = `
    <div class="panel">
      <h2>Create Landing Page</h2>
      <form id="landingForm">
        <label>Slug<input name="slug" value="home" required></label>
        <label>Title<input name="title" value="VASMA System" required></label>
        <label class="wide">Subtitle<input name="subtitle" value="Vehicle Auto Service Management System"></label>
        <label class="full">Call to Action<textarea name="cta">Choose package and register your business</textarea></label>
        <button class="primary">Save Landing Page</button>
      </form>
    </div>
    <div class="panel table-wrap">
      <h2>Landing Pages</h2>
      <table>
        <thead><tr><th>Slug</th><th>Title</th><th>Subtitle</th><th>Status</th><th>Public Path</th></tr></thead>
        <tbody>${landingPages.map((page) => `<tr><td>${page.slug}</td><td>${page.title}</td><td>${page.subtitle || ""}</td><td>${page.active ? statusPill("ACTIVE") : statusPill("DISABLED")}</td><td>/landing/${page.slug}</td></tr>`).join("")}</tbody>
      </table>
    </div>`;
  document.querySelector("#landingForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formValues(event.target);
    payload.content = { cta: payload.cta };
    delete payload.cta;
    await api("/api/admin/landing-pages", { method: "POST", body: payload });
    showMessage("Landing page saved");
    renderLanding();
  });
}

const views = {
  overview: renderOverview,
  packages: renderPackages,
  subscriptions: renderSubscriptions,
  businesses: renderBusinesses,
  reports: renderReports,
  landing: renderLanding,
  payments: renderPayments
};

document.querySelectorAll(".nav").forEach((button) => {
  button.addEventListener("click", async () => {
    document.querySelectorAll(".nav").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    try {
      await views[button.dataset.view]();
    } catch (error) {
      showMessage(error.message, true);
    }
  });
});

document.querySelector("#logoutBtn").addEventListener("click", () => {
  ["vasma_token", "vasma_user", "vasma_login_time", "vasma_business_session"].forEach((key) => localStorage.removeItem(key));
  location.replace("../admin-login.html");
});

renderOverview().catch((error) => showMessage(error.message, true));
