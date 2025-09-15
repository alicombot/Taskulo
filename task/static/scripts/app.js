const menuList = document.querySelectorAll(".menu-list__item");
const titlepanelHead = document.querySelector(".panel__title");
const managelistWrappers = document.querySelectorAll(".manage-list__wrapper");
const chevronRight = document.querySelectorAll(".chevron-right");
const panelthemChange = document.querySelectorAll(".panel-them__change");
const panelContent = document.querySelectorAll(".panel__content");
const statusTask = document.querySelectorAll(".status-task__item");
const statusProject = document.querySelectorAll(".status-project__item");
const addProject = document.querySelector(".panel__svg");
const accountForm = document.getElementById("account-form");
const accountEditBtn = document.getElementById("account-edit-btn");
const accountSaveBtn = document.getElementById("account-save-btn");

const headerProfile = document.querySelector(".nav__item--profile");

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
    }
  }
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
  item.addEventListener("click", function () {
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

    if (!isActive) {
      const titlemanageList = this.querySelector(".manage-list__title");
      if (titlemanageList) {
        titlepanelHead.textContent = titlemanageList.textContent;
      }
    }
  });
});

panelthemChange.forEach((panelthemChange) => {
  panelthemChange.addEventListener("click", function () {
    document
      .querySelector(".panel-them--active")
      .classList.remove("panel-them--active");
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
}

function toggleDatePicker() {
  const picker = document.getElementById("date-picker");
  if (!picker) return;
  picker.style.display = picker.style.display === "block" ? "none" : "block";
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
  const picker = document.getElementById("date-picker");
  const grid = document.getElementById("calendar-grid");
  const title = document.getElementById("calendar-title");
  const prevBtn = document.querySelector(".calendar__nav--prev");
  const nextBtn = document.querySelector(".calendar__nav--next");
  if (!picker || !grid || !title || !prevBtn || !nextBtn) return;

  let current = new Date();
  let selected = null;

  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    title.textContent = date.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
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
      const d = document.createElement("div");
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
        const timeEl = document.querySelector(".nav .date");
        if (timeEl) {
          const formatted = thisDate.toLocaleDateString(undefined, {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          timeEl.textContent = formatted;
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

  renderCalendar(current);
})();

(function () {
  const input = document.querySelector(".nav__item--search input");
  const sugg = document.getElementById("search-suggestions");
  const btn = document.querySelector(".nav__item--search .search__btn");
  if (!input || !sugg || !btn) return;

  input.addEventListener("input", function () {
    if (this.value.trim().length > 0) {
      sugg.style.display = "block";
    } else {
      sugg.style.display = "none";
    }
  });

  input.addEventListener("focus", function () {
    if (this.value.trim().length > 0) sugg.style.display = "block";
  });

  sugg.querySelectorAll(".search-suggestion").forEach(function (item) {
    item.addEventListener("click", function () {
      input.value = this.textContent.trim();
      sugg.style.display = "none";
    });
  });

  btn.addEventListener("click", function () {
    sugg.style.display = "none";
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

document.addEventListener("click", function (e) {
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
    taskCard.remove();
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

addProject.addEventListener("click", function () {
  const addList = document.querySelector(".status-task");

  if (addList.querySelector(".add-project")) {
    return;
  }

  const newProject = document.createElement("li");
  const text = document.createElement("input");
  text.classList.add("add-project");

  text.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && text.value.trim() !== "") {
      saveText();
    }
  });

  text.addEventListener("blur", function () {
    if (text.value.trim() !== "") {
      saveText();
    } else {
      newProject.remove();
    }
  });

  function saveText() {
    const value = text.value.trim();
    if (value !== "") {
      text.remove();
      const item = document.createElement("span");
      item.textContent = value;
      newProject.appendChild(item);
    }
  }

  newProject.classList.add("status-project__item");
  newProject.appendChild(text);
  addList.appendChild(newProject);
  text.scrollIntoView({ behavior: "smooth", block: "center" });
  text.focus();
});

const taskList = document.querySelector(".status-task");
taskList.addEventListener("click", function (event) {
  if (event.target && event.target.tagName === "SPAN") {
    const allSpans = taskList.querySelectorAll("span");
    allSpans.forEach((span) => {
      span.classList.remove("status-project__item--active");
    });

    event.target.classList.add("status-project__item--active");
  }
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

  if (notifOptions && !notiftWrapper.contains(event.target)) {
    notifOptions.style.display = "none";
  }
});

(function () {
  const firstColumn = document.querySelector(".content .content__items");
  if (!firstColumn) return;
  const addTaskBtn = firstColumn.querySelector(".add-task");
  if (!addTaskBtn) return;

  let formOpen = false;

  function getServerTaskForm() {
    return document.getElementById("server-task-form");
  }

  addTaskBtn.addEventListener("click", function () {
    const serverForm = getServerTaskForm();
    if (!serverForm) return;
    if (formOpen) return;
    serverForm.style.display = "block";
    serverForm.style.animation = "formPop .18s ease";
    formOpen = true;

    const formEl = serverForm.querySelector("form");
    const cancelBtn = serverForm.querySelector('[data-action="cancel"]');
    if (cancelBtn) {
      cancelBtn.addEventListener(
        "click",
        function () {
          serverForm.style.display = "none";
          formOpen = false;
        },
        { once: true }
      );
    }
    if (formEl) {
      formEl.addEventListener(
        "submit",
        function () {
          formOpen = false;
        },
        { once: true }
      );
    }
  });
})();

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

const avatarEditBtn = document.getElementById("avatar-edit-btn");
const avatarFileInput = document.getElementById("avatar-file");
const avatarImg = document.getElementById("account-avatar");

if (avatarEditBtn && avatarFileInput && avatarImg) {
  avatarEditBtn.addEventListener("click", function () {
    avatarFileInput.click();
  });

  avatarFileInput.addEventListener("change", function () {
    const file = this.files && this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      if (typeof e.target.result === "string") {
        avatarImg.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  });
}

const changePasswordBtn = document.getElementById("change-password-btn");
if (changePasswordBtn) {
  changePasswordBtn.addEventListener("click", function () {
    window.location.href = "./password_change_form.html";
  });
}
