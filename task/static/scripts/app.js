const menuList = document.querySelectorAll(".menu-list__item");
const titlepanelHead = document.querySelector(".panel__title");
const managelistWrappers = document.querySelectorAll(".manage-list__wrapper");
const panelthemChange = document.querySelectorAll(".panel-them__change");
const statusTask = document.querySelectorAll(".status-task__item");
const addProject = document.querySelector(".panel__svg");
const accountForm = document.getElementById("account-form");
const accountEditBtn = document.getElementById("account-edit-btn");
const accountSaveBtn = document.getElementById("account-save-btn");
const headerProfile = document.querySelector(".nav__item--profile");
const themeToggleItem = document.getElementById("panel-theme-toggle");

const NotificationManager = (function () {
  const STORAGE_KEY = "taskulo_notifications";
  const DEDUPE_WINDOW_MS = 2000;
  const recent = new Map();
  const toastContainer = (function () {
    const el = document.getElementById("toast-container");
    if (el) return el;
    const created = document.createElement("div");
    created.id = "toast-container";
    created.className = "toast-container";
    created.style.position = "fixed";
    created.style.right = "20px";
    created.style.top = "20px";
    created.style.display = "flex";
    created.style.flexDirection = "column";
    created.style.gap = "12px";
    created.style.zIndex = "999999";
    document.body.appendChild(created);
    return created;
  })();

  const dropdown = document.getElementById("notification-options");

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function saveAll(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
    } catch {}
  }
  function colorClass(type) {
    switch (type) {
      case "success":
        return "green";
      case "error":
        return "red";
      case "warning":
        return "yellow";
      case "update":
        return "blue";
      case "info":
      default:
        return "blue";
    }
  }
  function svgIcon(type) {
    if (type === "success")
      return '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>';
    if (type === "error")
      return '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>';
    if (type === "warning")
      return '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l9 16H3l9-16Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v5"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 17h.01"/></svg>';
    if (type === "update")
      return '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12a9 9 0 0 1 15.54-5.94"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 0 1-15.54 5.94"/><path stroke-linecap="round" stroke-linejoin="round" d="M4 7V4h3"/><path stroke-linecap="round" stroke-linejoin="round" d="M20 17v3h-3"/></svg>';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"/></svg>';
  }
  function closeIcon() {
    return '<svg xmlns="http://www.w3.org/2000/svg" fill="none" width="21" height="21" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>';
  }

  function renderDropdownItem(item, prepend = true) {
    if (!dropdown) return;
    const empty = dropdown.querySelector(".notification-empty");
    if (empty) empty.remove();
    const wrapper = document.createElement("div");
    wrapper.className = `notification-option ${colorClass(item.type)}`;
    wrapper.setAttribute("data-id", item.id);
    wrapper.innerHTML = `
      <div class="notification-start-icon">${svgIcon(item.type)}</div>
      <div class="notification-text">
        <div class="notification-title">${item.title || ""}</div>
        <div class="notification-description">${item.description || ""}</div>
      </div>
      <div class="notification-end-icon" data-action="notif-dismiss" aria-label="Dismiss notification">${closeIcon()}</div>
    `;
    if (prepend) dropdown.prepend(wrapper);
    else dropdown.appendChild(wrapper);
  }

  function rebuildDropdown() {
    if (!dropdown) return;

    dropdown
      .querySelectorAll(".notification-option[data-id]")
      ?.forEach((el) => el.remove());
    const all = loadAll();
    all.forEach((it) => renderDropdownItem(it, false));
  }

  function archive(item) {
    const all = loadAll();
    all.unshift(item);
    saveAll(all);
    renderDropdownItem(item, true);
  }

  function showToast(item) {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = "toast-item";
    toast.style.minWidth = "280px";
    toast.style.maxWidth = "360px";
    toast.style.borderRadius = "14px";

    toast.style.background = "transparent";
    toast.style.boxShadow = "none";
    toast.classList.add("toast-enter");
    toast.style.animation =
      toast.style.animation ||
      "toastIn 420ms cubic-bezier(.22,1,.36,1) forwards";
    toast.innerHTML = `
      <div class="notification-option ${colorClass(
        item.type
      )}" style="margin:0;">
        <div class="notification-start-icon">${svgIcon(item.type)}</div>
        <div class="notification-text">
          <div class="notification-title">${item.title || ""}</div>
          <div class="notification-description">${item.description || ""}</div>
        </div>
      </div>`;
    toastContainer.appendChild(toast);

    let closed = false;
    function closeNow() {
      if (closed) return;
      closed = true;
      toast.classList.add("toast-leave");
      toast.style.animation =
        toast.style.animation ||
        "toastOut 340ms cubic-bezier(.55,.06,.68,.19) forwards";
      setTimeout(() => toast.remove(), 260);
    }
    setTimeout(() => {
      closeNow();
      archive(item);
    }, 5000);
  }

  function notify({ title = "", description = "", type = "info" }) {
    const key = `${type}|${title}|${description}`;
    const now = Date.now();
    const last = recent.get(key) || 0;
    if (now - last < DEDUPE_WINDOW_MS) {
      return;
    }
    recent.set(key, now);
    const item = {
      id: String(Date.now()) + Math.random().toString(36).slice(2),
      title,
      description,
      type,
      ts: Date.now(),
    };
    showToast(item);
  }

  document.addEventListener("DOMContentLoaded", rebuildDropdown);

  dropdown &&
    dropdown.addEventListener("click", function (e) {
      const closeBtn = e.target.closest('[data-action="notif-dismiss"]');
      if (!closeBtn) return;

      e.stopPropagation();
      const option = closeBtn.closest(".notification-option[data-id]");
      if (!option) return;
      const id = option.getAttribute("data-id");
      option.remove();
      const all = loadAll().filter((it) => it.id !== id);
      saveAll(all);

      if (
        dropdown &&
        !dropdown.querySelector(".notification-option[data-id]")
      ) {
        const empty = document.createElement("div");
        empty.className = "notification-empty";
        empty.textContent =
          "فعلاً هیچ نوتیفی نداری! وقتی کاری انجام بدی، اینجا ظاهر می‌شه. 🚀";
        dropdown.appendChild(empty);
      }

      if (dropdown) dropdown.style.display = "block";
    });


document.addEventListener("click", function (e) {
  const btn = e.target.closest(".task__title--check");
  if (!btn) return;
  const card = btn.closest(".task");
  if (!card) return;
  const nextStatus = btn.getAttribute("data-next-status");
  if (!nextStatus) return;
  const editUrl = card.getAttribute("data-edit-url");
  if (!editUrl) return;

  const formData = new FormData();
  formData.append("status", nextStatus);
  const csrf = document.querySelector("[name=csrfmiddlewaretoken]")?.value || "";
  if (csrf) formData.append("csrfmiddlewaretoken", csrf);


  let animated = false;
  const runRequest = () => {
    fetch(editUrl, {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      body: formData,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.status) {
          try {
            NotificationManager.notify({
              title: "Task status updated",
              description: `${card.getAttribute("data-title") || ""} → ${data.status}`,
              type: "update",
            });
          } catch {}

          let activeLi = null;
          const activeSpan = document.querySelector(
            ".project-link span.status-project__item--active"
          );
          if (activeSpan) activeLi = activeSpan.closest(".project-link");
          if (!activeLi)
            activeLi = document.querySelector(
              '.status-project__item.project-link[data-id="0"]'
            );
          const url = activeLi ? activeLi.dataset.url : null;
          if (url) {
            fetch(withSort(url), { headers: { "X-Requested-With": "XMLHttpRequest" } })
              .then((r) => r.text())
              .then((html) => {
                const taskContainer = document.getElementById("task-container");
                if (taskContainer) {
                  taskContainer.innerHTML = html;

                  requestAnimationFrame(() => {
                    taskContainer
                      .querySelectorAll(".task")
                      .forEach((el) => {
                        el.classList.add("task--enter");
                        setTimeout(() => el.classList.remove("task--enter"), 420);
                      });
                  });
                }
              });
          }
        }
      })
      .catch((err) => {
        console.error("Status update error", err);
        try {
          NotificationManager.notify({
            title: "Server error",
            description: "Could not update status",
            type: "error",
          });
        } catch {}
      });
  };

  card.classList.add("task--moving");
  const onAnimEnd = (ev) => {
    if (ev && ev.target !== card) return;
    if (animated) return;
    animated = true;
    card.removeEventListener("animationend", onAnimEnd);
    runRequest();
  };
  card.addEventListener("animationend", onAnimEnd, { once: true });

  setTimeout(onAnimEnd, 320);
});

  return { notify };
})();

try {
  window.NotificationManager = NotificationManager;
} catch {}

document.addEventListener("DOMContentLoaded", function () {
  const notifOptions = document.getElementById("notification-options");
  if (notifOptions) {
    notifOptions.addEventListener(
      "click",
      function (e) {
        e.stopPropagation();
      },
      false
    );
  }


  try {
    const timeEl = document.querySelector(".nav__item--date .date");
    if (timeEl) {
      const now = new Date();
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const dd = String(now.getDate());
      const mm = monthNames[now.getMonth()];
      const yyyy = now.getFullYear();
      timeEl.textContent = `${dd} ${mm} ${yyyy}`;

      try { timeEl.setAttribute("datetime", `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`); } catch {}
    }
  } catch {}
});

function openSidebarContent(contentId) {
  const contentElement = document.querySelector(contentId);
  if (!contentElement) return;

  const activeItem = document.querySelector(".menu-list__item--active");
  const activeContent = document.querySelector(".panel__content.content--show");

  activeItem?.classList.remove("menu-list__item--active");
  activeContent?.classList.remove("content--show");

  const targetItem = document.querySelector(
    '.menu-list__item[data-content-id="' + contentId + '"]'
  );
  if (targetItem) {
    targetItem.classList.add("menu-list__item--active");
  }

  contentElement.classList.add("content--show");
  document.querySelector(".panel").classList.remove("paenl--close");
  document.querySelector(".wrapper").classList.add("wrapper--close");

  if (titlepanelHead) {
    if (contentId === "#panel-account") {
      titlepanelHead.textContent = "Account";
    } else if (contentId === "#panel-home") {
      titlepanelHead.textContent = "Projects";
    } else if (contentId === "#panel-messages") {
      titlepanelHead.textContent = "Messages";
    }
  }
}

if (themeToggleItem) {
  themeToggleItem.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    const isDark = !document.body.classList.contains("theme-dark");
    document.body.classList.toggle("theme-dark", isDark);
    document.body.classList.toggle("theme-light", !isDark);
  });
}

if (headerProfile) {
  headerProfile.addEventListener("click", function () {
    const panel = document.querySelector(".panel");
    const isPanelOpen = panel && !panel.classList.contains("paenl--close");
    const isAccountActive = document
      .querySelector("#panel-account")
      ?.classList.contains("content--show");

    if (isPanelOpen && isAccountActive) {
      panel.classList.add("paenl--close");
      document.querySelector(".wrapper").classList.remove("wrapper--close");
      document
        .querySelector(".menu-list__item--active")
        ?.classList.remove("menu-list__item--active");
      document
        .querySelector("#panel-account")
        ?.classList.remove("content--show");
      return;
    }

    openSidebarContent("#panel-account");
  });
}

menuList.forEach((item) => {
  item.addEventListener("click", function (e) {
    if (this.id === "panel-theme-toggle") {
      return;
    }
    let contentId = this.getAttribute("data-content-id");
    let contentElement = document.querySelector(contentId);
    let activeItem = document.querySelector(".menu-list__item--active");
    let activeContent = document.querySelector(".panel__content.content--show");

    if (activeItem === this) {
      this.classList.remove("menu-list__item--active");
      activeContent?.classList.remove("content--show");
      document.querySelector(".panel").classList.add("paenl--close");
      document.querySelector(".wrapper").classList.remove("wrapper--close");
    } else {
      activeItem?.classList.remove("menu-list__item--active");
      activeContent?.classList.remove("content--show");

      this.classList.add("menu-list__item--active");
      contentElement?.classList.add("content--show");
      document.querySelector(".panel").classList.remove("paenl--close");
      document.querySelector(".wrapper").classList.add("wrapper--close");

      if (titlepanelHead) {
        if (contentId === "#panel-account") {
          titlepanelHead.textContent = "Account";
        } else if (contentId === "#panel-home") {
          titlepanelHead.textContent = "Projects";
        } else if (contentId === "#panel-messages") {
          titlepanelHead.textContent = "Messages";
        }
      }
    }
  });
});

managelistWrappers.forEach((wrapper) => {
  wrapper.addEventListener("click", function () {
    const content = this.nextElementSibling;
    const isActive = this.classList.contains("manage-list--active");
    this.classList.toggle("manage-list--active");
    content.classList.toggle("manage-list__content--active");
  });
});

panelthemChange.forEach((panelthemChange) => {
  panelthemChange.addEventListener("click", function () {
    document
      .querySelector(".panel-them--active")
      ?.classList.remove("panel-them--active");
    this.classList.add("panel-them--active");

    const isDark = this.classList.contains("panel-them__dark");
    document.body.classList.toggle("theme-dark", isDark);
    document.body.classList.toggle("theme-light", !isDark);
  });
});

statusTask.forEach((statusTask) => {
  statusTask.addEventListener("click", function () {
    isActiveCurrent = document.querySelector(".status-task__item--active");
    isActive = this.lastChild;
    isActiveCurrent.classList.remove("status-task__item--active");
    isActive.classList.toggle("status-task__item--active");
  });
});

function toggleSortOptions() {
  const sortWrapper = document.querySelector(".sort__wrapper");
  const sortOptions = document.getElementById("sort-options");
  if (!sortOptions || !sortWrapper) return;
  const isOpen = sortOptions.style.display === "block";
  sortOptions.style.display = isOpen ? "none" : "block";
  sortWrapper.classList.toggle("open", !isOpen);
}


function getSelectedSortKey() {
  const el = document.querySelector(".sort__text");
  const txt = (el && el.textContent ? el.textContent : "").trim().toLowerCase();
  if (txt === "oldest") return "oldest";
  if (txt === "due soon") return "due";
  if (txt === "high priority") return "priority";
  if (txt === "a-z") return "az";
  return "newest";
}


function withSort(url) {
  const key = getSelectedSortKey();
  try {
    const u = new URL(url, window.location.origin);
    if (key && key !== "newest") u.searchParams.set("sort", key);
    else u.searchParams.delete("sort");
    return u.pathname + (u.search || "");
  } catch (e) {
    if (key && key !== "newest")
      return (
        url +
        (url.includes("?") ? "&" : "?") +
        "sort=" +
        encodeURIComponent(key)
      );
    return url;
  }
}

document.addEventListener("click", function (event) {
  const sortWrapper = document.querySelector(".sort__wrapper");
  const sortOptions = document.getElementById("sort-options");

  if (sortOptions && sortWrapper && !sortWrapper.contains(event.target)) {
    sortOptions.style.display = "none";
    sortWrapper.classList.remove("open");
  }
});

function selectOption(option) {
  const sortText = document.querySelector(".sort__text");
  const sortOptions = document.getElementById("sort-options");
  const sortWrapper = document.querySelector(".sort__wrapper");
  if (sortText) sortText.textContent = option;
  if (sortOptions) {
    sortOptions.querySelectorAll(".sort-option").forEach(function (el) {
      el.classList.toggle("active", el.textContent.trim() === option.trim());
    });
    sortOptions.style.display = "none";
  }
  if (sortWrapper) sortWrapper.classList.remove("open");


  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  if (form && input && input.value && input.value.trim().length > 0) {
    performSearch(input.value);
  } else {

    let activeLi = null;
    const activeSpan = document.querySelector(
      ".project-link span.status-project__item--active"
    );
    if (activeSpan) activeLi = activeSpan.closest(".project-link");
    if (!activeLi)
      activeLi = document.querySelector(
        '.status-project__item.project-link[data-id="0"]'
      );
    const base = activeLi ? activeLi.dataset.url : null;
    if (base) {
      const url = withSort(base);
      fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
        .then((r) => r.text())
        .then((html) => {
          const taskContainer = document.getElementById("task-container");
          if (taskContainer) taskContainer.innerHTML = html;
        });
    }
  }
}

function toggleDatePicker() {
  const picker = document.getElementById("date-picker");
  if (!picker) return;
  if (picker.style.display === "block") {
    picker.style.display = "none";
  } else {
    if (typeof window.__openHeaderCalendar === "function") {
      window.__openHeaderCalendar();
    } else {
      picker.style.display = "block";
    }
  }
}

document.addEventListener("click", function (event) {
  const dateWrapper = document.querySelector(".nav__item--date");
  const picker = document.getElementById("date-picker");
  if (picker && dateWrapper && !dateWrapper.contains(event.target)) {
    picker.style.display = "none";
  }
  const searchForm = document.querySelector(".nav__item--search");
  const sugg = document.getElementById("search-suggestions");
  if (sugg && searchForm && !searchForm.contains(event.target)) {
    sugg.style.display = "none";
  }
});

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const picker = document.getElementById("date-picker");
    const grid = document.getElementById("calendar-grid");
    const title = document.getElementById("calendar-title");
    const prevBtn = document.querySelector(".calendar__nav--prev");
    const nextBtn = document.querySelector(".calendar__nav--next");
    if (!picker || !grid || !title || !prevBtn || !nextBtn) return;

    let current = new Date();
    let selected = null;

    function getActiveProjectIdFromDOM() {
      let activeLi = null;
      const activeSpan = document.querySelector(
        ".project-link span.status-project__item--active"
      );
      if (activeSpan) activeLi = activeSpan.closest(".project-link");
      if (!activeLi)
        activeLi = document.querySelector(
          '.status-project__item.project-link[data-id="0"]'
        );
      const pid = activeLi ? activeLi.getAttribute("data-id") : "0";
      return pid || "0";
    }

    function renderCalendar(date) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      title.textContent = `${monthNames[month]} ${year}`;
      grid.innerHTML = "";

      const firstDay = new Date(year, month, 1);
      const startDayOfWeek = firstDay.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = document.createElement("div");
        d.className = "calendar__day calendar__day--muted";
        d.textContent = String(daysInPrevMonth - i);
        grid.appendChild(d);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const d = document.createElement("button");
        d.type = "button";
        d.className = "calendar__day";
        d.textContent = String(day);
        const thisDate = new Date(year, month, day);
        const today = new Date();
        if (thisDate.toDateString() === today.toDateString()) {
          d.classList.add("calendar__day--today");
        }
        if (selected && thisDate.toDateString() === selected.toDateString()) {
          d.classList.add("calendar__day--selected");
        }
        d.addEventListener("click", function () {
          selected = thisDate;
          const timeEl = document.querySelector(".nav__item--date .date");
          if (timeEl) {
            const dd = String(thisDate.getDate());
            const mm = monthNames[thisDate.getMonth()];
            const yyyy = thisDate.getFullYear();
            timeEl.textContent = `${dd} ${mm} ${yyyy}`;
          }

          const iso = `${thisDate.getFullYear()}-${String(
            thisDate.getMonth() + 1
          ).padStart(2, "0")}-${String(thisDate.getDate()).padStart(2, "0")}`;
          const formEl = document.getElementById("search-form");
          const searchUrl = formEl ? formEl.dataset.searchUrl : null;
          const projectId = getActiveProjectIdFromDOM();
          if (searchUrl) {
            const url = `${searchUrl}?date=${encodeURIComponent(
              iso
            )}&project=${encodeURIComponent(projectId)}`;
            fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
              .then((r) => r.text())
              .then((html) => {
                const taskContainer = document.getElementById("task-container");
                if (taskContainer) taskContainer.innerHTML = html;
              })
              .catch(() => {});
          }
          picker.style.display = "none";
        });
        grid.appendChild(d);
      }

      const filled = grid.children.length;
      const totalCells = Math.ceil(filled / 7) * 7;
      for (let day = 1; filled + day <= totalCells; day++) {
        const d = document.createElement("div");
        d.className = "calendar__day calendar__day--muted";
        d.textContent = String(day);
        grid.appendChild(d);
      }
    }

    prevBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      current.setMonth(current.getMonth() - 1);
      renderCalendar(current);
    });
    nextBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      current.setMonth(current.getMonth() + 1);
      renderCalendar(current);
    });

    window.__openHeaderCalendar = function () {
      renderCalendar(current);
      picker.style.display = "block";
    };

    renderCalendar(current);
  });
})();

function toggleActions(taskId) {
  const allMenus = document.querySelectorAll(".task-options");
  allMenus.forEach((menu) => {
    menu.style.display = "none";
  });

  const menu = document.getElementById(`task-options-${taskId}`);
  const trigger = menu?.closest(".task__title--icon");
  document.querySelectorAll(".task__title--icon.open").forEach(function (el) {
    el.classList.remove("open");
  });
  if (menu.style.display === "block") {
    menu.style.display = "none";
    trigger && trigger.classList.remove("open");
  } else {
    menu.style.display = "block";
    trigger && trigger.classList.add("open");
  }
}

document.addEventListener("click", function (event) {
  if (!event.target.matches(".task__title--icon")) {
    const allMenus = document.querySelectorAll(".task-options");
    allMenus.forEach((menu) => {
      menu.style.display = "none";
    });
    document.querySelectorAll(".task__title--icon.open").forEach(function (el) {
      el.classList.remove("open");
    });
  }
});

document.addEventListener("click", async function (e) {
  const optionEl = e.target.closest(".task-option");
  if (!optionEl) return;
  const menu = optionEl.closest(".task-options");
  if (!menu) return;

  if (optionEl.closest("form")) {
    return;
  }

  const taskCard = menu.closest(".task");
  if (!taskCard) return;
  const label = optionEl.textContent.trim().toLowerCase();

  if (label === "delete") {
    const taskId = taskCard.getAttribute("data-id");
    if (!taskId) return;

    if (!confirm("آیا مطمئنی می‌خوای این تسک رو حذف کنی؟")) {
      return;
    }

    const csrf =
      document.querySelector("[name=csrfmiddlewaretoken]")?.value || "";
    const deleteUrl =
      taskCard.getAttribute("data-delete-url") || `/delete-task/${taskId}/`;

    try {
      const response = await fetch(deleteUrl, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrf,
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      const data = await response.json();

      if (data.success) {
        taskCard.remove();

        try {
          const tTitle = taskCard.getAttribute("data-title") || "";
          NotificationManager.notify({
            title: "Task deleted",
            description: tTitle,
            type: "error",
          });
        } catch {}

        let activeLi = null;
        const activeSpan = document.querySelector(
          ".project-link span.status-project__item--active"
        );
        if (activeSpan) activeLi = activeSpan.closest(".project-link");
        if (!activeLi)
          activeLi = document.querySelector(
            '.status-project__item.project-link[data-id="0"]'
          );
        const url = activeLi ? activeLi.dataset.url : null;
        if (url) {
          fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
            .then((r) => r.text())
            .then((html) => {
              const taskContainer = document.getElementById("task-container");
              if (taskContainer) taskContainer.innerHTML = html;
            });
        }
      } else {
        alert(data.message || "خطا در حذف تسک");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("مشکلی در ارتباط با سرور پیش اومد.");
    }
  } else if (label === "edit") {
    enterTaskEditMode(taskCard);
  }

  menu.style.display = "none";
  const trigger = menu.closest(".task__title--icon");
  trigger && trigger.classList.remove("open");
});

function enterTaskEditMode(taskCard) {
  if (!taskCard || taskCard.classList.contains("task--form")) return;
  const taskId = taskCard.getAttribute("data-id") || "";
  const editUrl =
    taskCard.getAttribute("data-edit-url") || `/update-task/${taskId}/`;
  const currentTitle = taskCard.getAttribute("data-title") || "";
  const currentDesc = taskCard.getAttribute("data-description") || "";
  const currentDue = taskCard.getAttribute("data-due-date") || "";
  const currentPriority = taskCard.getAttribute("data-priority") || "normal";

  const csrf =
    document.querySelector("[name=csrfmiddlewaretoken]")?.value || "";

  const originalHTML = taskCard.innerHTML;
  taskCard.classList.add("task--form");
  taskCard.innerHTML = `
    <form method="post" action="${editUrl}" class="task-form" novalidate style="animation: formPop .18s ease;">
      <input type="hidden" name="csrfmiddlewaretoken" value="${csrf}">
      <div class="task-form__header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:.6rem;">
        <h4 style="margin:0; font-family: 'Exo2-Bold'; font-size:1.4rem; color: var(--text-first-color);">Edit Task</h4>
      </div>
      <div class="task-form__row">
        <input class="task-form__input" name="title" type="text" placeholder="Task title" required value="${currentTitle.replace(
          /"/g,
          "&quot;"
        )}">
      </div>
      <div class="task-form__row">
        <textarea class="task-form__textarea" name="description" rows="2" placeholder="Short description">${currentDesc
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</textarea>
      </div>
      <div class="task-form__grid">
        <input class="task-form__input" name="due_date" type="date" value="${currentDue}">
        <select class="task-form__select" name="priority">
          <option value="normal" ${
            currentPriority === "normal" ? "selected" : ""
          }>Priority: Normal</option>
          <option value="high" ${
            currentPriority === "high" ? "selected" : ""
          }>Priority: High</option>
          <option value="low" ${
            currentPriority === "low" ? "selected" : ""
          }>Priority: Low</option>
        </select>
      </div>
      <div class="task-form__actions">
        <button type="button" class="btn btn--ghost" data-action="cancel-inline-edit">Cancel</button>
        <button type="submit" class="btn btn--primary">Save</button>
      </div>
    </form>
  `;

  const cancelBtn = taskCard.querySelector(
    '[data-action="cancel-inline-edit"]'
  );
  if (cancelBtn) {
    cancelBtn.addEventListener(
      "click",
      function () {
        taskCard.innerHTML = originalHTML;
        taskCard.classList.remove("task--form");
      },
      { once: true }
    );
  }
}

function attachProjectActions(projectItem) {
  if (!projectItem || projectItem.querySelector(".project-actions")) return;
  const labelEl = projectItem.querySelector("span");
  if (!labelEl) return;
  const isAllProjects = /all\s*projects/i.test(labelEl.textContent);
  const actions = document.createElement("div");
  actions.className = "project-actions";
  actions.innerHTML = `
     <button type="button" class="project-action-btn project-action-btn--edit" aria-label="Edit project">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
      </button>
      <button type="button" class="project-action-btn project-action-btn--delete" aria-label="Delete project">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M14 6V4a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v2"/></svg>
      </button>`;
  projectItem.appendChild(actions);
  if (isAllProjects) actions.style.display = "none";

  const editBtn = actions.querySelector(".project-action-btn--edit");
  const deleteBtn = actions.querySelector(".project-action-btn--delete");

  editBtn &&
    editBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      const current = labelEl.textContent.trim();
      const csrfToken = document.querySelector(
        'input[name="csrfmiddlewaretoken"]'
      ).value;
      const input = document.createElement("input");
      input.type = "text";
      input.className = "project-rename-input";
      input.value = current;
      labelEl.style.display = "none";
      projectItem.insertBefore(input, actions);
      projectItem.classList.add("editing");
      actions.style.display = "none";
      input.focus();
      input.select();

      let isSubmittingRename = false;
      let renameCommitted = false;

      function commitRename() {
        if (renameCommitted || isSubmittingRename) return;
        const val = input.value.trim();
        const newName = val || current;
        renameCommitted = true;
        isSubmittingRename = true;
        input.disabled = true;

        $.ajax({
          url: "/project/update-project/",
          type: "POST",
          data: {
            id: projectItem.dataset.id,
            name: newName,
            csrfmiddlewaretoken: csrfToken,
          },
          success: function (data) {
            labelEl.textContent = data.name || newName;
            input.remove();
            labelEl.style.display = "";

            actions.style.display = "";
            projectItem.classList.remove("editing");
            try {
              NotificationManager.notify({
                title: "Project renamed",
                description: data.name || newName,
                type: "success",
              });
            } catch {}
          },
          error: function (xhr) {
            console.error("Rename error:", xhr.responseText);
            input.remove();
            labelEl.style.display = "";

            actions.style.display = "";
            projectItem.classList.remove("editing");
          },
          complete: function () {
            isSubmittingRename = false;
          },
        });
      }

      function cancelRename() {
        if (renameCommitted) return;
        input.remove();
        labelEl.style.display = "";

        actions.style.display = "";
        projectItem.classList.remove("editing");
      }

      input.addEventListener(
        "keydown",
        function (ev) {
          if (ev.key === "Enter") commitRename();
          else if (ev.key === "Escape") cancelRename();
        },
        { once: false }
      );
      input.addEventListener(
        "blur",
        function () {
          if (!renameCommitted) commitRename();
        },
        { once: true }
      );
    });

  deleteBtn &&
    deleteBtn.addEventListener("click", function (e) {
      e.stopPropagation();

      const csrfToken = document.querySelector(
        'input[name="csrfmiddlewaretoken"]'
      ).value;

      $.ajax({
        url: "/project/delete-project/",
        type: "POST",
        data: {
          id: projectItem.dataset.id,
          csrfmiddlewaretoken: csrfToken,
        },
        success: function (data) {
          var pTitle =
            projectItem && projectItem.textContent
              ? projectItem.textContent.trim()
              : "";
          projectItem.remove();
          var allProjectsLi = document.querySelector(
            '.status-project__item.project-link[data-id="0"]'
          );
          if (allProjectsLi) {
            var spanAll = allProjectsLi.querySelector("span");
            if (spanAll)
              spanAll.textContent =
                "All projects (" + (data.total_project || 0) + ")";
          } else {
            $(".status-project__item--active").text(
              "All projects " + "(" + (data.total_project || 0) + ")"
            );
          }
          try {
            NotificationManager.notify({
              title: "Project deleted",
              description: pTitle,
              type: "error",
            });
          } catch {}
        },
        error: function (xhr) {
          console.error("Delete error:", xhr.responseText);
        },
      });
    });
}

document
  .querySelectorAll(".status-task > .status-project__item")
  .forEach(function (li) {
    attachProjectActions(li);
  });

addProject.addEventListener("click", function () {
  const addList = document.querySelector(".status-task");
  if (!addList || addList.querySelector(".add-project")) return;

  const newProject = document.createElement("li");
  newProject.classList.add("status-project__item");

  const fieldWrap = document.createElement("div");
  fieldWrap.className = "add-project__field-wrap";

  const text = document.createElement("input");
  text.classList.add("add-project");

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.id = "add_project";
  saveBtn.className = "add-project__btn btn btn--primary";
  saveBtn.setAttribute("aria-label", "Add project");
  saveBtn.innerHTML =
    '<svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.9"><path d="M9 5L1 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 9L5 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></g></svg>';

  let clickingSave = false;
  let enterPressed = false;
  let isSubmitting = false;
  let saved = false;

  saveBtn.addEventListener("mousedown", function () {
    clickingSave = true;
  });

  text.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (text.value.trim() !== "") {
        enterPressed = true;
        saveText();
      }
    }
  });

  text.addEventListener("blur", function () {
    if (clickingSave) {
      clickingSave = false;
      return;
    }
    if (enterPressed) {
      enterPressed = false;
      return;
    }
    const value = text.value.trim();
    if (value !== "") {
      saveText();
    } else {
      newProject.remove();
    }
  });

  saveBtn.addEventListener("click", function () {
    clickingSave = false;
    if (text.value.trim() !== "") saveText();
  });

  function saveText() {
    const value = text.value.trim();
    if (!value) return;
    if (isSubmitting || saved) return;
    isSubmitting = true;
    saveBtn.disabled = true;

    const csrfToken = document.querySelector(
      'input[name="csrfmiddlewaretoken"]'
    ).value;

    $.ajax({
      url: "/project/add-project/",
      type: "POST",
      data: {
        name: value,
        csrfmiddlewaretoken: csrfToken,
      },
      success: function (data) {
        fieldWrap.remove();
        const item = document.createElement("span");
        item.textContent = data.name || value;
        newProject.setAttribute("data-id", data.id);

        newProject.classList.add("project-link");
        newProject.setAttribute(
          "data-url",
          `/dashboard/projects/${data.id}/tasks/`
        );
        newProject.appendChild(item);
        attachProjectActions(newProject);
        var allProjectsLi = document.querySelector(
          '.status-project__item.project-link[data-id="0"]'
        );
        if (allProjectsLi) {
          var spanAll = allProjectsLi.querySelector("span");
          if (spanAll)
            spanAll.textContent =
              "All projects (" + (data.total_project || 0) + ")";
        } else {
          $(".status-project__item--active").text(
            "All projects " + "(" + (data.total_project || 0) + ")"
          );
        }
        saved = true;
        try {
          NotificationManager.notify({
            title: "Project added",
            description: data.name || value,
            type: "success",
          });
        } catch {}
      },
      error: function (xhr, status, error) {
        console.log("ERROR:", xhr.status, error, xhr.responseText);
        alert("Server error");
      },
      complete: function () {
        isSubmitting = false;
        saveBtn.disabled = false;
      },
    });
  }

  fieldWrap.appendChild(text);
  fieldWrap.appendChild(saveBtn);
  newProject.appendChild(fieldWrap);
  addList.appendChild(newProject);
  text.scrollIntoView({ behavior: "smooth", block: "center" });
  text.focus();
});

function toggleNotificationOptions() {
  const notifOptions = document.getElementById("notification-options");
  if (
    notifOptions.style.display === "none" ||
    notifOptions.style.display === ""
  ) {
    notifOptions.style.display = "block";
  } else {
    notifOptions.style.display = "none";
  }
}

document.addEventListener("click", function (event) {
  const notiftWrapper = document.querySelector(".nav__item--notification");
  const notifOptions = document.getElementById("notification-options");

  if (notifOptions && notifOptions.contains(event.target)) {
    event.stopPropagation();
    return;
  }
  if (notifOptions && notiftWrapper && !notiftWrapper.contains(event.target)) {
    notifOptions.style.display = "none";
  }
});

if (accountEditBtn && accountForm) {
  accountEditBtn.addEventListener("click", function () {
    const isEdit = accountForm.classList.toggle("edit-mode");
    if (isEdit) {
      const fields = ["name", "lastname", "username", "gmail"];
      fields.forEach(function (field) {
        const span = accountForm.querySelector(
          '.account-value[data-field="' + field + '"]'
        );
        const input = accountForm.querySelector("#" + field);
        if (span && input) {
          input.value = span.textContent.trim();
        }
      });

      accountForm.querySelectorAll(".account-value").forEach(function (el) {
        el.style.display = "none";
      });
      accountForm.querySelectorAll(".account-input").forEach(function (el) {
        el.style.display = "block";
      });
      accountEditBtn.textContent = "Cancel";
      if (accountSaveBtn) accountSaveBtn.style.display = "inline-block";
    } else {
      accountForm.querySelectorAll(".account-value").forEach(function (el) {
        el.style.display = "inline";
      });
      accountForm.querySelectorAll(".account-input").forEach(function (el) {
        el.style.display = "none";
      });
      accountEditBtn.textContent = "Edit";
      if (accountSaveBtn) accountSaveBtn.style.display = "none";
    }
  });

  accountForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!accountForm.classList.contains("edit-mode")) return;

    const fields = ["name", "lastname", "username", "gmail"];
    fields.forEach(function (field) {
      const span = accountForm.querySelector(
        '.account-value[data-field="' + field + '"]'
      );
      const input = accountForm.querySelector("#" + field);
      if (span && input) {
        span.textContent = input.value.trim();
      }
    });

    accountForm.classList.remove("edit-mode");

    accountForm.querySelectorAll(".account-value").forEach(function (el) {
      el.style.display = "inline";
    });
    accountForm.querySelectorAll(".account-input").forEach(function (el) {
      el.style.display = "none";
    });
    accountEditBtn.textContent = "Edit";
    if (accountSaveBtn) accountSaveBtn.style.display = "none";
  });
}

const usernameField = document.getElementById("username");
if (usernameField) {
  usernameField.addEventListener("input", function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_]/g, "");
  });
}

const gmailField = document.getElementById("gmail");
if (gmailField) {
  gmailField.addEventListener("input", function () {
    this.value = this.value.replace(/[^a-zA-Z0-9@._-]/g, "");
  });
}

document.addEventListener("click", function (e) {
  const fromActions = e.target.closest(
    ".project-actions, .project-rename-input"
  );
  if (fromActions) return;
  const projectLink = e.target.closest(".project-link");
  if (!projectLink) return;

  e.preventDefault();

  let url = projectLink.dataset.url;
  if (!url || url === "#") {
    const id = projectLink.getAttribute("data-id");
    if (id) {
      url = `/dashboard/projects/${id}/tasks/`;
      projectLink.setAttribute("data-url", url);
    }
  }
  if (!url) return;

  document
    .querySelectorAll(".status-project__item span")
    .forEach(function (span) {
      span.classList.remove("status-project__item--active");
    });
  const spanEl = projectLink.querySelector("span");
  if (spanEl) spanEl.classList.add("status-project__item--active");

  fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
    .then(function (response) {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.text();
    })
    .then(function (html) {
      const taskContainer = document.getElementById("task-container");
      if (taskContainer) taskContainer.innerHTML = html;
    })
    .catch(function (error) {
      console.error("Error loading project tasks:", error);
    });
});

document.addEventListener("click", function (e) {
  const addTaskBtn = e.target.closest(".add-task");
  if (!addTaskBtn) return;

  const column = addTaskBtn.closest(".content__items");
  const serverForm = column && column.querySelector("#server-task-form");
  if (serverForm) {
    serverForm.style.display = "block";
    serverForm.style.animation = "formPop .18s ease";
  }
});

document.addEventListener("click", function (e) {
  const cancelBtn = e.target.closest('[data-action="cancel"]');
  if (!cancelBtn) return;
  const formWrap = cancelBtn.closest("#server-task-form");
  if (formWrap) {
    formWrap.style.display = "none";
  }
});

let isCreatingTaskSubmitting = false;
document.addEventListener("submit", function (e) {
  const form = e.target.closest("#server-task-form form.task-form");
  if (!form) return;
  e.preventDefault();
  if (isCreatingTaskSubmitting) return;
  isCreatingTaskSubmitting = true;

  const formData = new FormData(form);
  fetch(form.action, {
    method: "POST",
    headers: { "X-Requested-With": "XMLHttpRequest" },
    body: formData,
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data.errors) {
        try {
          NotificationManager.notify({
            title: "Validation warning",
            description: "Please check the fields",
            type: "warning",
          });
        } catch {}
        alert("Validation error");
        return;
      }
      const formWrap = form.closest("#server-task-form");
      if (formWrap) {
        form.reset();
        formWrap.style.display = "none";
      }

      let activeLi = null;
      const activeSpan = document.querySelector(
        ".project-link span.status-project__item--active"
      );
      if (activeSpan) {
        activeLi = activeSpan.closest(".project-link");
      }
      if (!activeLi) {
        activeLi = document.querySelector(
          '.status-project__item.project-link[data-id="0"]'
        );
      }
      const url = activeLi ? activeLi.dataset.url : null;
      if (url) {
        try {
          suppressUpdateToastUntil = Date.now() + 2000;
        } catch {}
        fetch(withSort(url), {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        })
          .then(function (r) {
            return r.text();
          })
          .then(function (html) {
            const taskContainer = document.getElementById("task-container");
            if (taskContainer) taskContainer.innerHTML = html;
            try {
              NotificationManager.notify({
                title: "Task created",
                description: (data && data.title) || "",
                type: "success",
              });
            } catch {}
          });
      }
    })
    .catch(function (err) {
      console.error("Create task error", err);
      try {
        NotificationManager.notify({
          title: "Server error",
          description: "Could not create task",
          type: "error",
        });
      } catch {}
    })
    .finally(function () {
      isCreatingTaskSubmitting = false;
    });
});

let suppressUpdateToastUntil = 0;

document.addEventListener("submit", function (e) {
  const editForm = e.target.closest(".task.task--form form.task-form");
  if (!editForm) return;
  e.preventDefault();

  if (!/update-task\//.test(editForm.action)) return;

  const formData = new FormData(editForm);
  fetch(editForm.action, {
    method: "POST",
    headers: { "X-Requested-With": "XMLHttpRequest" },
    body: formData,
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data.errors) {
        try {
          NotificationManager.notify({
            title: "Validation warning",
            description: "Please check the fields",
            type: "warning",
          });
        } catch {}
        alert("Validation error");
        return;
      }

      let activeLi = null;
      const activeSpan = document.querySelector(
        ".project-link span.status-project__item--active"
      );
      if (activeSpan) activeLi = activeSpan.closest(".project-link");
      if (!activeLi)
        activeLi = document.querySelector(
          '.status-project__item.project-link[data-id="0"]'
        );
      const url = activeLi ? activeLi.dataset.url : null;
      if (url) {
        fetch(withSort(url), {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        })
          .then((r) => r.text())
          .then((html) => {
            const taskContainer = document.getElementById("task-container");
            if (taskContainer) taskContainer.innerHTML = html;
            try {
              if (Date.now() >= suppressUpdateToastUntil) {
                NotificationManager.notify({
                  title: "Task updated",
                  description: data.title || "",
                  type: "update",
                });
              }
            } catch {}
          });
      }
    })
    .catch(function (err) {
      console.error("Update task error", err);
      try {
        NotificationManager.notify({
          title: "Server error",
          description: "Could not update task",
          type: "error",
        });
      } catch {}
    });
});

(function () {
  const form = document.getElementById("search-form");
  if (!form) return;

  const input = document.getElementById("search-input");
  const btn = document.getElementById("search-btn");
  const suggestBox = document.getElementById("search-suggestions");
  const suggestUrl = form.dataset.suggestUrl;
  const searchUrl = form.dataset.searchUrl;

  let timerId = null;

  function debounce(fn, delay) {
    return function (...args) {
      clearTimeout(timerId);
      timerId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function getActiveProjectId() {
    const activeSpan = document.querySelector(
      ".project-link span.status-project__item--active"
    );
    const link = activeSpan ? activeSpan.closest(".project-link") : null;
    if (link && link.dataset.id) return link.dataset.id;
    const allLink = document.querySelector(
      '.status-project__item.project-link[data-id="0"]'
    );
    return (allLink && allLink.dataset.id) || "0";
  }

  function renderSuggestions(items) {
    if (!suggestBox) return;
    suggestBox.innerHTML = "";
    if (!items || items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "search-suggestion";
      empty.textContent = "No results";
      empty.setAttribute("aria-disabled", "true");
      suggestBox.appendChild(empty);
      suggestBox.style.display = "block";
      suggestBox.style.position = suggestBox.style.position || "absolute";
      suggestBox.style.zIndex = suggestBox.style.zIndex || "9999";
      return;
    }
    items.forEach((item) => {
      const div = document.createElement("div");
      div.className = "search-suggestion";
      div.textContent = item.title;
      div.dataset.id = item.id;
      div.dataset.status = item.status;
      suggestBox.appendChild(div);
    });
    suggestBox.style.display = "block";
    suggestBox.style.position = suggestBox.style.position || "absolute";
    suggestBox.style.zIndex = suggestBox.style.zIndex || "9999";
  }

  function clearSuggestions() {
    if (!suggestBox) return;
    suggestBox.innerHTML = "";
    suggestBox.style.display = "none";
  }

  const fetchSuggest = debounce(function (q) {
    if (!q || q.trim().length === 0) {
      clearSuggestions();
      return;
    }
    if (!suggestUrl) return;
    fetch(`${suggestUrl}?q=${encodeURIComponent(q)}`, {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((data) => renderSuggestions((data && data.results) || []))
      .catch(() => clearSuggestions());
  }, 200);

  function performSearch(q) {
    if (!searchUrl) return;
    const project = getActiveProjectId();
    const base = `${searchUrl}?q=${encodeURIComponent(
      q || ""
    )}&project=${encodeURIComponent(project)}`;
    const url = withSort(base);
    fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then((r) => r.text())
      .then((html) => {
        const taskContainer = document.getElementById("task-container");
        if (taskContainer) taskContainer.innerHTML = html;
        clearSuggestions();
      })
      .catch(() => {});
  }

  if (input) {
    input.addEventListener("input", function () {
      fetchSuggest(this.value);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch(input.value);
      }
    });
    input.addEventListener("focus", function () {
      if (this.value && this.value.trim().length > 0) {
        fetchSuggest(this.value);
      }
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      performSearch(input ? input.value : "");
    });
  }

  if (btn) {
    btn.addEventListener("click", function () {
      performSearch(input ? input.value : "");
    });
  }

  if (suggestBox) {
    suggestBox.addEventListener("click", function (e) {
      const item = e.target.closest(".search-suggestion");
      if (!item) return;
      if (input) input.value = item.textContent.trim();
      performSearch(input ? input.value : "");
    });
  }

  document.addEventListener("click", function (e) {
    if (!form.contains(e.target)) clearSuggestions();
  });
})();

document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", function (e) {
    const title = e.target.closest(".task-title");
    if (!title) return;

    const taskDiv = title.closest(".task");
    if (!taskDiv) return;
    if (taskDiv.dataset.status === "done") return; // روی done کاری نکن
    if (taskDiv.classList.contains("empty-box")) return; // روی باکس خالی کاری نکن

    // چرخه وضعیت
    let nextStatus = "in progress";
    if (taskDiv.dataset.status === "in progress") nextStatus = "done";

    // ارسال AJAX برای تغییر وضعیت
    fetch(`/task/update-task-status/${taskDiv.dataset.id}/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: nextStatus }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          moveTaskWithTransition(taskDiv, nextStatus);
        }
      });
  });
});

// تابع گرفتن CSRF
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// جابه‌جایی با transition نرم
function moveTaskWithTransition(taskDiv, nextStatus) {
  // پیدا کردن ستون مقصد
  const columns = {
    todo: document.querySelector('.content__items[data-status="todo"]'),
    "in progress": document.querySelector(
      '.content__items[data-status="in progress"]'
    ),
    done: document.querySelector('.content__items[data-status="done"]'),
  };
  const targetCol = columns[nextStatus];
  if (!targetCol) return;

  // انیمیشن fade out
  taskDiv.style.transition =
    "opacity 0.4s cubic-bezier(.4,2,.6,1), transform 0.4s cubic-bezier(.4,2,.6,1)";
  taskDiv.style.opacity = "0";
  taskDiv.style.transform = "scale(0.95)";
  setTimeout(() => {
    taskDiv.style.opacity = "";
    taskDiv.style.transform = "";
    taskDiv.dataset.status = nextStatus;
    targetCol.appendChild(taskDiv);
    // انیمیشن fade in
    taskDiv.style.opacity = "0";
    setTimeout(() => {
      taskDiv.style.transition =
        "opacity 0.4s cubic-bezier(.4,2,.6,1), transform 0.4s cubic-bezier(.4,2,.6,1)";
      taskDiv.style.opacity = "1";
      taskDiv.style.transform = "scale(1)";
      setTimeout(() => {
        taskDiv.style.transition = "";
        taskDiv.style.transform = "";
      }, 400);
    }, 10);
  }, 400);
}
