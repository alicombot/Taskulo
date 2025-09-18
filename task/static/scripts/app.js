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

        try {
            const response = await fetch(`/delete-task/${taskId}/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrf,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (data.success) {
                taskCard.remove();
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
            {once: true}
        );
    }
}



function attachProjectActions(projectItem) {
    if (!projectItem || projectItem.querySelector('.project-actions')) return;
    const labelEl = projectItem.querySelector('span');
    if (!labelEl) return;
    const isAllProjects = /all\s*projects/i.test(labelEl.textContent);
    const actions = document.createElement('div');
    actions.className = 'project-actions';
    actions.innerHTML = `
     <button type="button" class="project-action-btn project-action-btn--edit" aria-label="Edit project">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
      </button>
      <button type="button" class="project-action-btn project-action-btn--delete" aria-label="Delete project">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M14 6V4a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v2"/></svg>
      </button>`;
    projectItem.appendChild(actions);
    if (isAllProjects) actions.style.display = 'none';

    const editBtn = actions.querySelector('.project-action-btn--edit');
    const deleteBtn = actions.querySelector('.project-action-btn--delete');

    editBtn && editBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const current = labelEl.textContent.trim();
        const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'project-rename-input';
        input.value = current;
        labelEl.style.display = 'none';
        projectItem.insertBefore(input, actions);
        input.focus();
        input.select();

        function commitRename() {
            const val = input.value.trim();
            const newName = val || current;

            $.ajax({
                url: "/project/update-project/",
                type: "POST",
                data: {
                    id: projectItem.dataset.id,
                    name: newName,
                    csrfmiddlewaretoken: csrfToken
                },
                success: function (data) {
                    labelEl.textContent = data.name || newName;
                    input.remove();
                    labelEl.style.display = '';
                },
                error: function (xhr) {
                    console.error("Rename error:", xhr.responseText);
                    input.remove();
                    labelEl.style.display = '';
                }
            });
        }

        function cancelRename() {
            input.remove();
            labelEl.style.display = '';
        }

        input.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter') commitRename();
            else if (ev.key === 'Escape') cancelRename();
        });
        input.addEventListener('blur', commitRename);
    });

    deleteBtn && deleteBtn.addEventListener('click', function (e) {
        e.stopPropagation();

        const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

        $.ajax({
            url: "/project/delete-project/",
            type: "POST",
            data: {
                id: projectItem.dataset.id,
                csrfmiddlewaretoken: csrfToken
            },
            success: function () {
                projectItem.remove();
            },
            error: function (xhr) {
                console.error("Delete error:", xhr.responseText);
            }
        });
    });

}


document.querySelectorAll('.status-task > .status-project__item').forEach(function (li) {
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
    saveBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.9"><path d="M9 5L1 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 9L5 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></g></svg>';

    let clickingSave = false;
    saveBtn.addEventListener("mousedown", function () {
        clickingSave = true;
    });

    let enterPressed = false;

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
        if (enterPressed) {
            enterPressed = false;
            return;
        }
        if (text.value.trim() !== "") {
            saveText();
        } else {
            newProject.remove();
        }
    });

    saveBtn.addEventListener("click", function () {
        if (text.value.trim() !== "") saveText();
        clickingSave = false;
    });


    function saveText() {
        const value = text.value.trim();
        const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
        if (!value) return;
        let saved = false;

        if (!saved) {
            $.ajax({
                url: "/project/add-project/",
                type: "POST",
                data: {
                    name: value,
                    csrfmiddlewaretoken: csrfToken
                },
                success: function (data) {

                    fieldWrap.remove();
                    const item = document.createElement("span");
                    item.textContent = data.name || value;
                    newProject.setAttribute("data-id", data.id);
                    newProject.appendChild(item);
                    attachProjectActions(newProject);
                    $('.status-project__item--active').text('All projects ' + '(' + data.total_project + ')')
                    saved = true;
                },
                error: function (xhr, status, error) {
                    console.log("ERROR:", xhr.status, error, xhr.responseText);
                    alert("Server error");
                }
            });
        }
    }


    fieldWrap.appendChild(text);
    fieldWrap.appendChild(saveBtn);
    newProject.appendChild(fieldWrap);
    addList.appendChild(newProject);
    text.scrollIntoView({behavior: "smooth", block: "center"});
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
                {once: true}
            );
        }
        if (formEl) {
            formEl.addEventListener(
                "submit",
                function () {
                    formOpen = false;
                },
                {once: true}
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

document.getElementById("username").addEventListener("input", function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_]/g, "");
});

document.getElementById("gmail").addEventListener("input", function () {
    this.value = this.value.replace(/[^a-zA-Z0-9@._-]/g, "");
});