"use strict";

const STORAGE_KEY = "workflow-ticket-demo-v1";
const OPEN_STATUSES = ["New", "In Progress", "Blocked"];
const STATUSES = ["New", "In Progress", "Blocked", "Resolved", "Closed"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const TICKET_TYPES = ["Bug", "Support", "Feature", "Deployment", "Internal"];
const ENVIRONMENTS = [
  "Production",
  "Staging",
  "Development",
  "Not Applicable",
];

let persistenceAvailable = true;
let state = loadData();
let pendingAlert = null;
let pendingDeleteId = null;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function relativeDate(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function relativeDateTime(daysAgo, hoursAgo = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(date.getUTCHours() - hoursAgo);
  return date.toISOString();
}

function buildInitialData() {
  return {
    projects: [
      { id: 1, name: "Acme Retail — Checkout Platform" },
      { id: 2, name: "Northstar Health — Client Portal" },
      { id: 3, name: "Atlas Logistics — Tracking API" },
      { id: 4, name: "Internal Platform" },
    ],
    categories: [
      { id: 1, name: "API" },
      { id: 2, name: "User experience" },
      { id: 3, name: "Infrastructure" },
      { id: 4, name: "Security" },
      { id: 5, name: "Reporting" },
    ],
    tickets: [
      {
        id: 1,
        title: "Checkout API returning 500 in production",
        description:
          "Card payments intermittently fail after the tax calculation step.\n\n" +
          "Reproduce with a basket containing items from two tax regions. " +
          "Expected: a successful order and one payment authorisation. " +
          "Investigate the null tax-rate response and add a regression test.",
        type: "Bug",
        status: "In Progress",
        priority: "Critical",
        projectId: 1,
        categoryId: 1,
        environment: "Production",
        assignee: "Alex Morgan",
        dueDate: relativeDate(-1),
        createdAt: relativeDateTime(14),
        updatedAt: relativeDateTime(0),
      },
      {
        id: 2,
        title: "Add CSV export to reporting dashboard",
        description:
          "Allow support staff to export the currently filtered report. " +
          "Include column headings, UTF-8 encoding and a dated filename. " +
          "The export must respect the same filters as the dashboard.",
        type: "Feature",
        status: "New",
        priority: "Medium",
        projectId: 2,
        categoryId: 5,
        environment: "Development",
        assignee: "Priya Shah",
        dueDate: relativeDate(7),
        createdAt: relativeDateTime(13),
        updatedAt: relativeDateTime(0, 3),
      },
      {
        id: 3,
        title: "Staging deployment failing after dependency update",
        description:
          "The build succeeds but the application fails its readiness check " +
          "after the dependency update. Compare startup logs with the last " +
          "successful release. Waiting for the platform team's updated base image.",
        type: "Deployment",
        status: "Blocked",
        priority: "High",
        projectId: 3,
        categoryId: 3,
        environment: "Staging",
        assignee: "Sam Rivera",
        dueDate: relativeDate(-2),
        createdAt: relativeDateTime(12),
        updatedAt: relativeDateTime(0, 6),
      },
      {
        id: 4,
        title: "Client unable to reset password",
        description:
          "A fictional client reports that password-reset links expire " +
          "immediately. Check token timestamps and email delivery delay. " +
          "Confirm that a new link works without exposing account details.",
        type: "Support",
        status: "New",
        priority: "High",
        projectId: 2,
        categoryId: 4,
        environment: "Production",
        assignee: "",
        dueDate: relativeDate(1),
        createdAt: relativeDateTime(11),
        updatedAt: relativeDateTime(0, 9),
      },
      {
        id: 5,
        title: "Update dependency vulnerability",
        description:
          "Update the affected HTTP dependency to the approved patched " +
          "release. Run the integration suite and document any behaviour " +
          "changes before scheduling deployment.",
        type: "Internal",
        status: "In Progress",
        priority: "Critical",
        projectId: 4,
        categoryId: 4,
        environment: "Development",
        assignee: "Jamie Chen",
        dueDate: relativeDate(2),
        createdAt: relativeDateTime(10),
        updatedAt: relativeDateTime(0, 12),
      },
      {
        id: 6,
        title: "Database migration timing out in staging",
        description:
          "The new index exceeds the staging deployment timeout on a realistic " +
          "dataset. Review the query plan and migration strategy. Waiting for " +
          "a fresh anonymised staging snapshot.",
        type: "Deployment",
        status: "Blocked",
        priority: "High",
        projectId: 1,
        categoryId: 3,
        environment: "Staging",
        assignee: "Alex Morgan",
        dueDate: relativeDate(-3),
        createdAt: relativeDateTime(9),
        updatedAt: relativeDateTime(0, 15),
      },
      {
        id: 7,
        title: "Improve mobile navigation",
        description:
          "The navigation now collapses cleanly on small screens and exposes " +
          "labelled keyboard-accessible controls. Ready for product review on " +
          "mobile and desktop.",
        type: "Feature",
        status: "Resolved",
        priority: "Low",
        projectId: 2,
        categoryId: 2,
        environment: "Staging",
        assignee: "Priya Shah",
        dueDate: relativeDate(-1),
        createdAt: relativeDateTime(8),
        updatedAt: relativeDateTime(0, 18),
      },
      {
        id: 8,
        title: "Document local development setup",
        description:
          "Verified the setup guide with a clean checkout. Database setup, " +
          "seed data and test commands are documented and reviewed.",
        type: "Internal",
        status: "Closed",
        priority: "Low",
        projectId: 4,
        categoryId: 3,
        environment: "Not Applicable",
        assignee: "Jamie Chen",
        dueDate: "",
        createdAt: relativeDateTime(7),
        updatedAt: relativeDateTime(0, 21),
      },
      {
        id: 9,
        title: "Tracking endpoint returns stale delivery status",
        description:
          "The tracking API occasionally returns the previous delivery state " +
          "for several minutes. Review cache invalidation after a courier event " +
          "and add coverage for repeated updates.",
        type: "Bug",
        status: "New",
        priority: "Medium",
        projectId: 3,
        categoryId: 1,
        environment: "Production",
        assignee: "",
        dueDate: relativeDate(-1),
        createdAt: relativeDateTime(6),
        updatedAt: relativeDateTime(1),
      },
      {
        id: 10,
        title: "Review checkout keyboard focus order",
        description:
          "Check keyboard access through address entry, payment and confirmation. " +
          "Ensure error messages receive focus and all controls have visible " +
          "focus indicators.",
        type: "Internal",
        status: "In Progress",
        priority: "Medium",
        projectId: 1,
        categoryId: 2,
        environment: "Development",
        assignee: "Sam Rivera",
        dueDate: relativeDate(4),
        createdAt: relativeDateTime(5),
        updatedAt: relativeDateTime(1, 3),
      },
    ],
  };
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isRequiredString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasValidUniqueIds(records) {
  return (
    Array.isArray(records) &&
    records.every(
      (record) =>
        isRecord(record) && Number.isSafeInteger(record.id) && record.id > 0,
    ) &&
    new Set(records.map((record) => record.id)).size === records.length
  );
}

function isTimestamp(value) {
  return (
    typeof value === "string" &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value
  );
}

function isDueDate(value) {
  return (
    typeof value === "string" &&
    (value === "" ||
      (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
        isTimestamp(`${value}T00:00:00.000Z`)))
  );
}

function isValidData(data) {
  if (
    !isRecord(data) ||
    ![data.projects, data.categories].every(
      (records) =>
        hasValidUniqueIds(records) &&
        records.length > 0 &&
        records.every((record) => isRequiredString(record.name)),
    ) ||
    !hasValidUniqueIds(data.tickets)
  ) {
    return false;
  }

  const projectIds = new Set(data.projects.map((project) => project.id));
  const categoryIds = new Set(data.categories.map((category) => category.id));
  return data.tickets.every(
    (ticket) =>
      isRequiredString(ticket.title) &&
      isRequiredString(ticket.description) &&
      typeof ticket.assignee === "string" &&
      STATUSES.includes(ticket.status) &&
      PRIORITIES.includes(ticket.priority) &&
      TICKET_TYPES.includes(ticket.type) &&
      ENVIRONMENTS.includes(ticket.environment) &&
      projectIds.has(ticket.projectId) &&
      categoryIds.has(ticket.categoryId) &&
      isTimestamp(ticket.createdAt) &&
      isTimestamp(ticket.updatedAt) &&
      isDueDate(ticket.dueDate),
  );
}

function disablePersistence() {
  persistenceAvailable = false;
  document.getElementById("persistenceNotice").hidden = false;
}

function persistData(data) {
  if (!persistenceAvailable) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    disablePersistence();
  }
}

function loadData() {
  let stored;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    disablePersistence();
    return buildInitialData();
  }

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (isValidData(parsed)) {
        return parsed;
      }
    } catch {
      // Invalid JSON is replaced with the standard fictional dataset below.
    }
  }

  const initial = buildInitialData();
  persistData(initial);
  return initial;
}

function saveData() {
  persistData(state);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTicketNumber(id) {
  return `TKT-${String(id).padStart(6, "0")}`;
}

function projectById(id) {
  return state.projects.find((project) => project.id === Number(id));
}

function categoryById(id) {
  return state.categories.find((category) => category.id === Number(id));
}

function ticketById(id) {
  return state.tickets.find((ticket) => ticket.id === Number(id));
}

function isOpen(ticket) {
  return OPEN_STATUSES.includes(ticket.status);
}

function isOverdue(ticket) {
  return Boolean(ticket.dueDate && isOpen(ticket) && ticket.dueDate < todayIso());
}

function formatDate(value) {
  if (!value) {
    return "No due date";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(value));
}

function slug(value) {
  return String(value).toLowerCase().replaceAll(" ", "-");
}

function statusBadge(status) {
  return `
    <span class="badge status-${escapeHtml(slug(status))}">
      <span class="status-dot" aria-hidden="true"></span>${escapeHtml(status)}
    </span>
  `;
}

function priorityBadge(priority) {
  return `
    <span class="badge priority-${escapeHtml(slug(priority))}">
      ${escapeHtml(priority)}
    </span>
  `;
}

function parseLocation() {
  const raw = window.location.hash.slice(1) || "/";
  const separator = raw.indexOf("?");
  const path = separator === -1 ? raw : raw.slice(0, separator);
  const query = separator === -1 ? "" : raw.slice(separator + 1);
  return { path, params: new URLSearchParams(query) };
}

function setActiveNavigation(path) {
  const section = path.startsWith("/tickets")
    ? "tickets"
    : path.startsWith("/projects")
      ? "projects"
      : path.startsWith("/categories")
        ? "categories"
        : "overview";

  document.querySelectorAll("[data-nav]").forEach((link) => {
    const active = link.dataset.nav === section;
    link.classList.toggle("active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function queueAlert(message, type = "success") {
  pendingAlert = { message, type };
}

function renderAlert() {
  const region = document.getElementById("alertRegion");
  if (!pendingAlert) {
    region.innerHTML = "";
    return;
  }

  region.innerHTML = `
    <div class="alert alert-${escapeHtml(pendingAlert.type)} alert-dismissible fade show" role="alert">
      ${escapeHtml(pendingAlert.message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Dismiss notification"></button>
    </div>
  `;
  pendingAlert = null;
}

function navigate(hash, message = "", type = "success") {
  if (message) {
    queueAlert(message, type);
  }

  if (window.location.hash === hash) {
    render();
  } else {
    window.location.hash = hash;
  }
}

function ticketTable(tickets) {
  if (!tickets.length) {
    return `
      <div class="empty-state">
        <i class="bi bi-search" aria-hidden="true"></i>
        <h2 class="h5">No tickets to show</h2>
        <p>Try changing your filters or create a ticket to start tracking work.</p>
        <a class="btn btn-outline-primary" href="#/tickets/new">New ticket</a>
      </div>
    `;
  }

  const rows = tickets
    .map((ticket) => {
      const project = projectById(ticket.projectId);
      const overdue = isOverdue(ticket);
      return `
        <tr>
          <td class="ticket-title">
            <div class="ticket-number">${formatTicketNumber(ticket.id)}</div>
            <a class="ticket-link fw-semibold" href="#/tickets/${ticket.id}">
              ${escapeHtml(ticket.title)}
            </a>
          </td>
          <td>${statusBadge(ticket.status)}</td>
          <td>${priorityBadge(ticket.priority)}</td>
          <td class="project-cell">${escapeHtml(project?.name ?? "Unknown")}</td>
          <td>${escapeHtml(ticket.assignee || "Unassigned")}</td>
          <td class="${overdue ? "text-danger fw-semibold" : ""}">
            ${escapeHtml(formatDate(ticket.dueDate))}
            ${overdue ? '<span class="d-block small">Overdue</span>' : ""}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="table-responsive">
      <table class="table ticket-table align-middle mb-0">
        <thead>
          <tr>
            <th scope="col">Ticket</th>
            <th scope="col">Status</th>
            <th scope="col">Priority</th>
            <th scope="col">Project</th>
            <th scope="col">Assignee</th>
            <th scope="col">Due</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderDashboard() {
  const counts = Object.fromEntries(
    STATUSES.map((status) => [
      status,
      state.tickets.filter((ticket) => ticket.status === status).length,
    ]),
  );
  const open = state.tickets.filter(isOpen);
  const critical = open.filter((ticket) => ticket.priority === "Critical").length;
  const overdue = open.filter(isOverdue).length;
  const recent = [...state.tickets]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  const metrics = [
    ["Open tickets", open.length, "inbox", "primary", "#/tickets?view=open"],
    ["New", counts.New, "circle", "info", "#/tickets?status=New"],
    [
      "In progress",
      counts["In Progress"],
      "arrow-repeat",
      "primary",
      "#/tickets?status=In%20Progress",
    ],
    ["Blocked", counts.Blocked, "pause-circle", "warning", "#/tickets?status=Blocked"],
    [
      "Critical open",
      critical,
      "exclamation-triangle",
      "danger",
      "#/tickets?view=critical",
    ],
    ["Overdue open", overdue, "clock-history", "danger", "#/tickets?view=overdue"],
  ];

  return `
    <div class="page-heading">
      <div>
        <p class="eyebrow">YOUR WORKSPACE AT A GLANCE</p>
        <h1>Team overview</h1>
        <p class="text-secondary mb-0">
          A clear view of active work and what needs attention.
        </p>
      </div>
      <a class="btn btn-outline-secondary" href="#/tickets">
        View all tickets <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
      </a>
    </div>

    <div class="row g-3 mb-4">
      ${metrics
        .map(
          ([label, value, icon, color, href]) => `
            <div class="col-6 col-lg-4 col-xl-2">
              <a class="card metric-card h-100 text-decoration-none" href="${href}">
                <div class="card-body">
                  <div class="d-flex align-items-center justify-content-between mb-3">
                    <span class="small text-secondary">${label}</span>
                    <i class="bi bi-${icon} text-${color}" aria-hidden="true"></i>
                  </div>
                  <div class="metric-value">${value}</div>
                </div>
              </a>
            </div>
          `,
        )
        .join("")}
    </div>

    <div class="card">
      <div class="card-header bg-white d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
        <div>
          <h2 class="h5 mb-1">Recently updated</h2>
          <p class="small text-secondary mb-0">The latest work across your projects.</p>
        </div>
        <a href="#/tickets?view=unassigned" class="btn btn-sm btn-outline-secondary">
          Unassigned tickets
        </a>
      </div>
      ${ticketTable(recent)}
    </div>
    <p class="small text-secondary mt-3 mb-0">
      Open tickets include New, In Progress and Blocked. Demo dates adjust relative to today.
    </p>
  `;
}

function filteredTickets(params) {
  let tickets = [...state.tickets];
  const filters = {
    q: (params.get("q") ?? "").trim().slice(0, 200),
    status: params.get("status") ?? "",
    priority: params.get("priority") ?? "",
    type: params.get("type") ?? "",
    project: params.get("project") ?? "",
    category: params.get("category") ?? "",
    view: params.get("view") ?? "",
  };

  if (filters.q) {
    const term = filters.q.toLowerCase();
    tickets = tickets.filter((ticket) =>
      [
        formatTicketNumber(ticket.id),
        ticket.title,
        ticket.description,
        ticket.assignee,
      ].some((value) => String(value).toLowerCase().includes(term)),
    );
  }

  if (STATUSES.includes(filters.status)) {
    tickets = tickets.filter((ticket) => ticket.status === filters.status);
  } else {
    filters.status = "";
  }

  if (PRIORITIES.includes(filters.priority)) {
    tickets = tickets.filter((ticket) => ticket.priority === filters.priority);
  } else {
    filters.priority = "";
  }

  if (TICKET_TYPES.includes(filters.type)) {
    tickets = tickets.filter((ticket) => ticket.type === filters.type);
  } else {
    filters.type = "";
  }

  const projectIds = new Set(state.projects.map((project) => String(project.id)));
  if (projectIds.has(filters.project)) {
    tickets = tickets.filter(
      (ticket) => String(ticket.projectId) === filters.project,
    );
  } else {
    filters.project = "";
  }

  const categoryIds = new Set(
    state.categories.map((category) => String(category.id)),
  );
  if (categoryIds.has(filters.category)) {
    tickets = tickets.filter(
      (ticket) => String(ticket.categoryId) === filters.category,
    );
  } else {
    filters.category = "";
  }

  if (["open", "critical", "overdue", "unassigned"].includes(filters.view)) {
    tickets = tickets.filter(isOpen);
    if (filters.view === "critical") {
      tickets = tickets.filter((ticket) => ticket.priority === "Critical");
    } else if (filters.view === "overdue") {
      tickets = tickets.filter(isOverdue);
    } else if (filters.view === "unassigned") {
      tickets = tickets.filter((ticket) => !ticket.assignee);
    }
  } else {
    filters.view = "";
  }

  tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return { tickets, filters };
}

function optionList(values, selected, label = "") {
  const first = label ? `<option value="">${escapeHtml(label)}</option>` : "";
  return (
    first +
    values
      .map(
        (value) => `
          <option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>
            ${escapeHtml(value)}
          </option>
        `,
      )
      .join("")
  );
}

function renderTickets(params) {
  const { tickets, filters } = filteredTickets(params);
  const viewLabel = filters.view
    ? `
      <div class="mb-3 small">
        Current view: <strong>${escapeHtml(filters.view)} tickets</strong>
        <a class="ms-2" href="#/tickets">Clear view</a>
      </div>
    `
    : "";

  return `
    <div class="page-heading">
      <div>
        <p class="eyebrow">WORK QUEUE</p>
        <h1>Tickets</h1>
        <p class="text-secondary mb-0">
          Track issues, requests and delivery across the team.
        </p>
      </div>
      <a class="btn btn-primary" href="#/tickets/new">
        <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>New ticket
      </a>
    </div>

    <form class="card card-body mb-4" id="ticketFilters" role="search">
      ${viewLabel}
      <input type="hidden" name="view" value="${escapeHtml(filters.view)}">
      <div class="row g-3 align-items-end">
        <div class="col-12">
          <label class="form-label" for="q">Search tickets</label>
          <input
            class="form-control"
            id="q"
            name="q"
            type="search"
            maxlength="200"
            value="${escapeHtml(filters.q)}"
            placeholder="Number, title, description or assignee"
          >
        </div>
        <div class="col-6 col-lg">
          <label class="form-label" for="status">Status</label>
          <select class="form-select" id="status" name="status">
            ${optionList(STATUSES, filters.status, "All status")}
          </select>
        </div>
        <div class="col-6 col-lg">
          <label class="form-label" for="priority">Priority</label>
          <select class="form-select" id="priority" name="priority">
            ${optionList(PRIORITIES, filters.priority, "All priority")}
          </select>
        </div>
        <div class="col-6 col-lg">
          <label class="form-label" for="type">Type</label>
          <select class="form-select" id="type" name="type">
            ${optionList(TICKET_TYPES, filters.type, "All type")}
          </select>
        </div>
        <div class="col-6 col-lg">
          <label class="form-label" for="project">Project</label>
          <select class="form-select" id="project" name="project">
            <option value="">All projects</option>
            ${state.projects
              .map(
                (project) => `
                  <option value="${project.id}" ${String(project.id) === filters.project ? "selected" : ""}>
                    ${escapeHtml(project.name)}
                  </option>
                `,
              )
              .join("")}
          </select>
        </div>
        <div class="col-6 col-lg">
          <label class="form-label" for="category">Category</label>
          <select class="form-select" id="category" name="category">
            <option value="">All categories</option>
            ${state.categories
              .map(
                (category) => `
                  <option value="${category.id}" ${String(category.id) === filters.category ? "selected" : ""}>
                    ${escapeHtml(category.name)}
                  </option>
                `,
              )
              .join("")}
          </select>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3 mt-3">
        <button class="btn btn-primary btn-sm" type="submit">
          <i class="bi bi-funnel me-1" aria-hidden="true"></i>Apply filters
        </button>
        <a class="small" href="#/tickets">Reset filters</a>
      </div>
    </form>

    <div class="card">
      <div class="card-header bg-white py-3 d-flex justify-content-between">
        <h2 class="h6 mb-0">${tickets.length} ticket${tickets.length === 1 ? "" : "s"}</h2>
        <span class="small text-secondary">Most recently updated first</span>
      </div>
      ${ticketTable(tickets)}
    </div>
  `;
}

function renderTicketDetail(ticket) {
  const project = projectById(ticket.projectId);
  const category = categoryById(ticket.categoryId);
  const overdue = isOverdue(ticket);

  return `
    <a class="small text-secondary text-decoration-none" href="#/tickets">
      <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>All tickets
    </a>
    <div class="page-heading mt-3">
      <div class="detail-heading">
        <p class="ticket-number mb-2">
          ${formatTicketNumber(ticket.id)} <span class="mx-2">/</span>
          ${escapeHtml(ticket.type)}
        </p>
        <h1>${escapeHtml(ticket.title)}</h1>
        <div class="d-flex gap-2 mt-3">
          ${statusBadge(ticket.status)}${priorityBadge(ticket.priority)}
        </div>
      </div>
      <div class="d-flex gap-2 flex-shrink-0">
        <a class="btn btn-primary btn-sm" href="#/tickets/${ticket.id}/edit">
          <i class="bi bi-pencil me-1" aria-hidden="true"></i>Edit ticket
        </a>
        <button
          class="btn btn-outline-danger btn-sm"
          type="button"
          data-delete-ticket="${ticket.id}"
        >
          <i class="bi bi-trash me-1" aria-hidden="true"></i>Delete
        </button>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-8">
        <section class="card card-body p-4 h-100">
          <h2 class="h5 mb-4">Description</h2>
          <div class="description">${escapeHtml(ticket.description)}</div>
        </section>
      </div>
      <div class="col-lg-4">
        <section class="card card-body p-4">
          <h2 class="h5 mb-4">Ticket information</h2>
          <dl class="metadata mb-0">
            <dt>Project</dt>
            <dd>
              <a href="#/tickets?project=${ticket.projectId}">
                ${escapeHtml(project?.name ?? "Unknown")}
              </a>
            </dd>
            <dt>Category</dt>
            <dd>${escapeHtml(category?.name ?? "Unknown")}</dd>
            <dt>Type</dt>
            <dd>${escapeHtml(ticket.type)}</dd>
            <dt>Environment</dt>
            <dd>${escapeHtml(ticket.environment)}</dd>
            <dt>Assignee</dt>
            <dd>${escapeHtml(ticket.assignee || "Unassigned")}</dd>
            <dt>Due date</dt>
            <dd class="${overdue ? "text-danger fw-semibold" : ""}">
              ${escapeHtml(formatDate(ticket.dueDate))}
              ${overdue ? '<span class="small"> (Overdue)</span>' : ""}
            </dd>
            <dt>Created</dt>
            <dd>${escapeHtml(formatDateTime(ticket.createdAt))} UTC</dd>
            <dt>Updated</dt>
            <dd>${escapeHtml(formatDateTime(ticket.updatedAt))} UTC</dd>
          </dl>
        </section>
      </div>
    </div>
  `;
}

function projectOptions(selected) {
  return state.projects
    .map(
      (project) => `
        <option value="${project.id}" ${project.id === selected ? "selected" : ""}>
          ${escapeHtml(project.name)}
        </option>
      `,
    )
    .join("");
}

function categoryOptions(selected) {
  return state.categories
    .map(
      (category) => `
        <option value="${category.id}" ${category.id === selected ? "selected" : ""}>
          ${escapeHtml(category.name)}
        </option>
      `,
    )
    .join("");
}

function renderTicketForm(ticket = null) {
  const editing = Boolean(ticket);
  const values = ticket ?? {
    title: "",
    description: "",
    type: "Bug",
    status: "New",
    priority: "Medium",
    projectId: state.projects[0]?.id ?? 0,
    categoryId: state.categories[0]?.id ?? 0,
    environment: "Development",
    assignee: "",
    dueDate: "",
  };

  return `
    <div class="page-heading">
      <div>
        <a class="small text-secondary text-decoration-none" href="${editing ? `#/tickets/${ticket.id}` : "#/tickets"}">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          ${editing ? formatTicketNumber(ticket.id) : "All tickets"}
        </a>
        <h1 class="mt-3">${editing ? "Edit ticket" : "New ticket"}</h1>
        <p class="text-secondary mb-0">
          Give the team the context they need. Fields marked * are required.
        </p>
      </div>
    </div>

    <form class="card card-body p-lg-4" id="ticketForm">
      <input type="hidden" name="ticketId" value="${editing ? ticket.id : ""}">
      <div class="row g-4">
        <div class="col-lg-8">
          <h2 class="h5 mb-3">Ticket details</h2>
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label" for="title">Title *</label>
              <input
                class="form-control"
                id="title"
                name="title"
                maxlength="200"
                required
                value="${escapeHtml(values.title)}"
              >
              <div class="form-text">A short, specific summary of the work.</div>
            </div>
            <div class="col-12">
              <label class="form-label" for="description">Description *</label>
              <textarea
                class="form-control"
                id="description"
                name="description"
                rows="9"
                required
              >${escapeHtml(values.description)}</textarea>
              <div class="form-text">
                Include expected behaviour, steps to reproduce or acceptance criteria.
                Plain text only.
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="projectId">Project *</label>
              <select class="form-select" id="projectId" name="projectId" required>
                ${projectOptions(values.projectId)}
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="categoryId">Category *</label>
              <select class="form-select" id="categoryId" name="categoryId" required>
                ${categoryOptions(values.categoryId)}
              </select>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="metadata-form">
            <h2 class="h5 mb-3">Classification & ownership</h2>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label" for="type">Type *</label>
                <select class="form-select" id="type" name="type" required>
                  ${optionList(TICKET_TYPES, values.type)}
                </select>
              </div>
              <div class="col-md-6 col-lg-12">
                <label class="form-label" for="ticketStatus">Status *</label>
                <select class="form-select" id="ticketStatus" name="status" required>
                  ${optionList(STATUSES, values.status)}
                </select>
              </div>
              <div class="col-md-6 col-lg-12">
                <label class="form-label" for="ticketPriority">Priority *</label>
                <select class="form-select" id="ticketPriority" name="priority" required>
                  ${optionList(PRIORITIES, values.priority)}
                </select>
              </div>
              <div class="col-12">
                <label class="form-label" for="environment">Environment *</label>
                <select class="form-select" id="environment" name="environment" required>
                  ${optionList(ENVIRONMENTS, values.environment)}
                </select>
              </div>
              <div class="col-12">
                <label class="form-label" for="assignee">Assignee</label>
                <input
                  class="form-control"
                  id="assignee"
                  name="assignee"
                  maxlength="100"
                  value="${escapeHtml(values.assignee)}"
                >
                <div class="form-text">Optional. Leave blank for unassigned.</div>
              </div>
              <div class="col-12">
                <label class="form-label" for="dueDate">Due date</label>
                <input
                  class="form-control"
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value="${escapeHtml(values.dueDate)}"
                >
                <div class="form-text">
                  Optional. Past dates show as overdue while the ticket is open.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="border-top pt-3 mt-4 d-flex gap-2">
        <button class="btn btn-primary" type="submit">
          ${editing ? "Save changes" : "Create ticket"}
        </button>
        <a class="btn btn-outline-secondary" href="${editing ? `#/tickets/${ticket.id}` : "#/tickets"}">
          Cancel
        </a>
      </div>
    </form>
  `;
}

function renderReferences(kind) {
  const isProject = kind === "project";
  const records = isProject ? state.projects : state.categories;
  const title = isProject ? "Projects" : "Categories";
  const subtitle = isProject
    ? "The product areas represented in this fictional workspace."
    : "The work classifications used across the fictional ticket queue.";

  return `
    <div class="page-heading">
      <div>
        <p class="eyebrow">REFERENCE DATA</p>
        <h1>${title}</h1>
        <p class="text-secondary mb-0">${subtitle}</p>
      </div>
    </div>

    <div class="alert alert-light border demo-note" role="note">
      Reference data is read-only in the public demo. The Flask application
      includes full project and category management with guarded deletion.
    </div>

    <div class="card">
      <div class="list-group list-group-flush">
        ${records
          .map((record) => {
            const count = state.tickets.filter((ticket) =>
              isProject
                ? ticket.projectId === record.id
                : ticket.categoryId === record.id,
            ).length;
            const href = `#/tickets?${isProject ? "project" : "category"}=${record.id}`;
            return `
              <a class="list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-3 py-3" href="${href}">
                <span class="reference-name">${escapeHtml(record.name)}</span>
                <span class="reference-count">
                  ${count} ticket${count === 1 ? "" : "s"}
                </span>
              </a>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderNotFound() {
  return `
    <div class="empty-state card">
      <i class="bi bi-compass" aria-hidden="true"></i>
      <h1 class="h4">Page not found</h1>
      <p>The demo route you requested does not exist.</p>
      <a class="btn btn-primary" href="#/">Return to overview</a>
    </div>
  `;
}

function render() {
  const app = document.getElementById("app");
  const { path, params } = parseLocation();
  setActiveNavigation(path);

  if (path === "/") {
    app.innerHTML = renderDashboard();
  } else if (path === "/tickets") {
    app.innerHTML = renderTickets(params);
  } else if (path === "/tickets/new") {
    app.innerHTML = renderTicketForm();
  } else if (/^\/tickets\/\d+\/edit$/.test(path)) {
    const id = Number(path.split("/")[2]);
    const ticket = ticketById(id);
    app.innerHTML = ticket ? renderTicketForm(ticket) : renderNotFound();
  } else if (/^\/tickets\/\d+$/.test(path)) {
    const id = Number(path.split("/")[2]);
    const ticket = ticketById(id);
    app.innerHTML = ticket ? renderTicketDetail(ticket) : renderNotFound();
  } else if (path === "/projects") {
    app.innerHTML = renderReferences("project");
  } else if (path === "/categories") {
    app.innerHTML = renderReferences("category");
  } else {
    app.innerHTML = renderNotFound();
  }

  renderAlert();
  document.getElementById("main").focus({ preventScroll: true });
}

function filtersFromForm(form) {
  const data = new FormData(form);
  const params = new URLSearchParams();
  for (const [key, value] of data.entries()) {
    const trimmed = String(value).trim();
    if (trimmed) {
      params.set(key, trimmed);
    }
  }
  return params;
}

function handleTicketSubmit(form) {
  if (!form.reportValidity()) {
    return;
  }

  const data = new FormData(form);
  const id = Number(data.get("ticketId")) || null;
  const existing = id ? ticketById(id) : null;
  const projectId = Number(data.get("projectId"));
  const categoryId = Number(data.get("categoryId"));

  if (!projectById(projectId) || !categoryById(categoryId)) {
    queueAlert("Choose a valid project and category.", "danger");
    renderAlert();
    return;
  }

  const now = new Date().toISOString();
  const record = {
    id: existing?.id ?? Math.max(0, ...state.tickets.map((ticket) => ticket.id)) + 1,
    title: String(data.get("title")).trim().slice(0, 200),
    description: String(data.get("description")).trim(),
    type: String(data.get("type")),
    status: String(data.get("status")),
    priority: String(data.get("priority")),
    projectId,
    categoryId,
    environment: String(data.get("environment")),
    assignee: String(data.get("assignee")).trim().slice(0, 100),
    dueDate: String(data.get("dueDate")),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (
    !record.title ||
    !record.description ||
    !TICKET_TYPES.includes(record.type) ||
    !STATUSES.includes(record.status) ||
    !PRIORITIES.includes(record.priority) ||
    !ENVIRONMENTS.includes(record.environment)
  ) {
    queueAlert("Please complete the required ticket fields.", "danger");
    renderAlert();
    return;
  }

  if (!isDueDate(record.dueDate)) {
    queueAlert("Choose a valid due date or leave it blank.", "danger");
    renderAlert();
    return;
  }

  if (existing) {
    const index = state.tickets.findIndex((ticket) => ticket.id === existing.id);
    state.tickets[index] = record;
  } else {
    state.tickets.push(record);
  }

  saveData();
  navigate(
    `#/tickets/${record.id}`,
    `${formatTicketNumber(record.id)} ${existing ? "updated" : "created"} successfully.`,
  );
}

function showDeleteModal(id) {
  const ticket = ticketById(id);
  if (!ticket) {
    return;
  }

  pendingDeleteId = id;
  document.getElementById("deleteName").textContent = formatTicketNumber(id);
  bootstrap.Modal.getOrCreateInstance(document.getElementById("deleteModal")).show();
}

function deletePendingTicket() {
  if (!pendingDeleteId || !ticketById(pendingDeleteId)) {
    return;
  }

  const number = formatTicketNumber(pendingDeleteId);
  state.tickets = state.tickets.filter((ticket) => ticket.id !== pendingDeleteId);
  saveData();
  pendingDeleteId = null;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("deleteModal")).hide();
  navigate("#/tickets", `${number} deleted from this browser.`);
}

function resetDemo() {
  state = buildInitialData();
  saveData();
  bootstrap.Modal.getOrCreateInstance(document.getElementById("resetModal")).hide();
  navigate("#/", "Demo data restored to its original state.");
}

document.addEventListener("submit", (event) => {
  if (event.target.id === "ticketFilters") {
    event.preventDefault();
    const params = filtersFromForm(event.target);
    window.location.hash = `#/tickets${params.size ? `?${params}` : ""}`;
  } else if (event.target.id === "ticketForm") {
    event.preventDefault();
    handleTicketSubmit(event.target);
  }
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".skip-link")) {
    event.preventDefault();
    document.getElementById("main").focus();
    return;
  }

  const deleteButton = event.target.closest("[data-delete-ticket]");
  if (deleteButton) {
    showDeleteModal(Number(deleteButton.dataset.deleteTicket));
  }
});

document.getElementById("resetDemo").addEventListener("click", () => {
  bootstrap.Modal.getOrCreateInstance(document.getElementById("resetModal")).show();
});

document.getElementById("confirmReset").addEventListener("click", resetDemo);
document
  .getElementById("confirmDelete")
  .addEventListener("click", deletePendingTicket);

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
