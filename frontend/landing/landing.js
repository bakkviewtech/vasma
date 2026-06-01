const API_URL = window.VASMA_API_URL || localStorage.getItem("vasma_api_url") || "";
const packageWrap = document.querySelector("#packages");
const packageSelect = document.querySelector("#packageSelect");
const result = document.querySelector("#result");

function money(value) {
  return new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function serviceText(services = []) {
  const labels = { tire: "Tire Service", carWash: "Car Wash", general: "General Service" };
  return services.map((service) => labels[service] || service);
}

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) throw new Error(data.error || "Request failed");
  return data;
}

async function loadLanding() {
  const [{ landingPage }, { packages }] = await Promise.all([
    api("/api/public/landing/home"),
    api("/api/public/packages")
  ]);
  if (landingPage) {
    document.querySelector("#landingTitle").textContent = landingPage.title;
    document.querySelector("#landingSubtitle").textContent = landingPage.subtitle || "Choose your package and register your business.";
  }
  packageSelect.innerHTML = packages.map((plan) => `<option value="${plan.id}">${plan.plan_name}</option>`).join("");
  packageWrap.innerHTML = packages.map((plan) => `
    <article class="package">
      <h3>${plan.plan_name}</h3>
      <p>${serviceText(plan.services).map((name) => `<span class="pill">${name}</span>`).join("")}</p>
      <div class="price">${money(plan.price)}</div>
      <p>${plan.billing_period} • ${plan.duration_days} days • ${plan.branch_limit} branch(es)</p>
      <button type="button" data-plan="${plan.id}">Choose</button>
    </article>
  `).join("");
  document.querySelectorAll("[data-plan]").forEach((button) => button.addEventListener("click", () => {
    packageSelect.value = button.dataset.plan;
    document.querySelector("#registerForm").scrollIntoView({ behavior: "smooth" });
  }));
}

document.querySelector("#registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const payload = Object.fromEntries(new FormData(event.target).entries());
    const data = await api("/api/public/register-business", { method: "POST", body: payload });
    result.hidden = false;
    result.innerHTML = `Registration complete.<br>Business ID: <strong>${data.businessId}</strong><br>Business Code: <strong>${data.businessCode}</strong><br>PIN: <strong>${data.initialPin}</strong><br><a href="../login.html">Open login page</a>`;
    event.target.reset();
  } catch (error) {
    result.hidden = false;
    result.style.background = "#fee2e2";
    result.style.color = "#991b1b";
    result.textContent = error.message;
  }
});

loadLanding().catch((error) => {
  packageWrap.innerHTML = `<div class="package">${error.message}</div>`;
});
