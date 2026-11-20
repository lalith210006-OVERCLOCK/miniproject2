/* =====================================
   TASKFLOW - PROJECT MANAGEMENT SYSTEM
   Custom Categories
===================================== */

const STORAGE_KEYS = {
    tasks: "taskflow_tasks",
    categories: "taskflow_categories"
};

const createId = () =>
    window.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;


// =====================================
// LOAD AND SAVE DATA
// =====================================

function loadData(key) {
    try {
        const saved = localStorage.getItem(key);

        if (saved === null) return [];

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {
        console.error("Storage loading error:", error);
        return [];
    }
}

let categories = loadData(STORAGE_KEYS.categories);
let tasks = loadData(STORAGE_KEYS.tasks);


function saveData() {
    try {

        localStorage.setItem(
            STORAGE_KEYS.categories,
            JSON.stringify(categories)
        );

        localStorage.setItem(
            STORAGE_KEYS.tasks,
            JSON.stringify(tasks)
        );

    } catch (error) {
        console.error("Storage saving error:", error);
        showToast("Unable to save data.");
    }
}


// =====================================
// DOM ELEMENTS
// =====================================

const dashboardView = document.getElementById("dashboard-view");
const tasksView = document.getElementById("tasks-view");
const categoriesView = document.getElementById("categories-view");

const taskModal = document.getElementById("task-modal");
const categoryModal = document.getElementById("category-modal");

const taskForm = document.getElementById("task-form");
const categoryForm = document.getElementById("category-form");

const allTaskList = document.getElementById("all-task-list");
const recentTaskList = document.getElementById("recent-task-list");
const categoryList = document.getElementById("category-list");

const toast = document.getElementById("toast");


// =====================================
// HTML ESCAPING
// =====================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}


// =====================================
// TOAST NOTIFICATION
// =====================================

let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// =====================================
// GET  CATEGORY NAMES
// =====================================


function getCategoryName(categoryId) {
    const category = categories.find(
        item => item.id === categoryId
    );

    return category ? category.name : "Uncategorized";
}


// =====================================
// NAVIGATION
// =====================================

function navigate(view) {

    const views = {
        dashboard: dashboardView,
        tasks: tasksView,
        categories: categoriesView
    };

    Object.values(views).forEach(section => {
        if (section) section.classList.add("hidden");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
    });

    if (!views[view]) return;

    views[view].classList.remove("hidden");

    const selectedLink = document.querySelector(
        `.nav-link[data-view="${view}"]`
    );

    if (selectedLink) {
        selectedLink.classList.add("active");
    }

    const titles = {
        dashboard: "Dashboard",
        tasks: "My Tasks",
        categories: "Categories"
    };

    document.getElementById("page-title").textContent =
        titles[view];
}

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        navigate(link.dataset.view);
    });
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        navigate(button.dataset.go);
    });
});
// =====================================
// STATUS AND PRIORITY FORMATTING
// =====================================

function statusClass(status) {
    return String(status).toLowerCase().replaceAll(" ", "-");
}


// =====================================
// TASK TABLE ROW
// =====================================

function renderTaskRow(task, showActions = false) {

    return `
        <tr>
            <td>${escapeHTML(task.name)}</td>

            
            <td>
                <span class="category-badge">
                    ${escapeHTML(getCategoryName(task.categoryId))}
                </span>
            </td>

            <td>
                <span class="badge-priority priority-${statusClass(task.priority)}">
                    ${escapeHTML(task.priority)}
                </span>
            </td>

            <td>
                <span class="badge-status status-${statusClass(task.status)}">
                    ${escapeHTML(task.status)}
                </span>
            </td>

            <td>${escapeHTML(task.dueDate)}</td>

            ${showActions ? `
                <td>
                    <button class="action-btn"
                        data-action="edit"
                        data-id="${escapeHTML(task.id)}">
                        Edit
                    </button>

                    <button class="action-btn delete-btn"
                        data-action="delete"
                        data-id="${escapeHTML(task.id)}">
                        Delete
                    </button>
                </td>
            ` : ""}
        </tr>
    `;
}


// =====================================
// DASHBOARD
// =====================================

function renderDashboard() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.status === "Completed"
    ).length;

    const inProgress = tasks.filter(
        task => task.status === "In Progress"
    ).length;

    const pending = tasks.filter(
        task => task.status === "Pending"
    ).length;

    const percentage = total
        ? Math.round((completed / total) * 100)
        : 0;

    document.getElementById("total-tasks").textContent = total;

    document.getElementById("completed-tasks").textContent =
        completed;

    document.getElementById("progress-tasks").textContent =
        inProgress;

    document.getElementById("pending-tasks").textContent =
        pending;

    document.getElementById("progress-percent").textContent =
        `${percentage}%`;

    document.getElementById("progress-fill").style.width =
        `${percentage}%`;

    const recent = [...tasks].slice(-5).reverse();

    recentTaskList.innerHTML = recent.length
        ? recent.map(task => renderTaskRow(task)).join("")
        : `
            <tr>
                <td colspan="6" class="empty-message">
                    No tasks available. Create your first task!
                </td>
            </tr>
        `;
}


// =====================================
// ALL TASKS + SEARCH + FILTER
// =====================================

function renderTasks() {

    const search = document.getElementById(
        "search-task"
    ).value.toLowerCase();

    const status = document.getElementById(
        "status-filter"
    ).value;

    const priority = document.getElementById(
        "priority-filter"
    ).value;

    const category = document.getElementById(
        "category-filter"
    ).value;

    const filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.name.toLowerCase().includes(search) ||
            getCategoryName(task.categoryId).toLowerCase().includes(search);

        const matchesStatus =
            status === "all" || task.status === status;

        const matchesPriority =
            priority === "all" || task.priority === priority;

        const matchesCategory =
            category === "all" || task.categoryId === category;

        return matchesSearch &&
            matchesStatus &&
            matchesPriority &&
            matchesCategory;
    });

    allTaskList.innerHTML = filteredTasks.length
        ? filteredTasks.map(task => renderTaskRow(task, true)).join("")
        : `
            <tr>
                <td colspan="7" class="empty-message">
                    No matching tasks found.
                </td>
            </tr>
        `;
}




// =====================================
// CUSTOM CATEGORIES
// =====================================

function renderCategories() {

    if (!categories.length) {
        categoryList.innerHTML = `
            <div class="empty-card">
                <h3>No Categories Yet</h3>
                <p>Create your own categories to organize tasks.</p>
            </div>
        `;
        return;
    }

    categoryList.innerHTML = categories.map(category => {

        const categoryTasks = tasks.filter(
            task => task.categoryId === category.id
        );

        return `
            <div class="category-card">

                <div class="category-icon">▤</div>

                <h3>${escapeHTML(category.name)}</h3>

                <p>${escapeHTML(category.description)}</p>

                <small>
                    ${categoryTasks.length} Tasks Assigned
                </small>

                <div class="card-actions">

                    <small>Custom Category</small>

                    <button class="action-btn delete-btn"
                        data-category-delete="${escapeHTML(category.id)}">
                        Delete
                    </button>

                </div>

            </div>
        `;

    }).join("");
}




// =====================================
// CATEGORY DROPDOWNS
// =====================================

function populateCategoryDropdowns() {

    const taskDropdown = document.getElementById("task-category");

    const filterDropdown = document.getElementById("category-filter");

    const taskSelected = taskDropdown.value;

    const filterSelected = filterDropdown.value;

    taskDropdown.innerHTML = `
        <option value="">Select a category</option>

        ${categories.map(category => `
            <option value="${escapeHTML(category.id)}">
                ${escapeHTML(category.name)}
            </option>
        `).join("")}
    `;

    filterDropdown.innerHTML = `
        <option value="all">All Categories</option>

        ${categories.map(category => `
            <option value="${escapeHTML(category.id)}">
                ${escapeHTML(category.name)}
            </option>
        `).join("")}
    `;

    if (categories.some(item => item.id === taskSelected)) {
        taskDropdown.value = taskSelected;
    }

    if (categories.some(item => item.id === filterSelected)) {
        filterDropdown.value = filterSelected;
    }
}


// =====================================
// REFRESH ENTIRE APPLICATION
// =====================================

function renderApp() {

    saveData();

    renderDashboard();

    renderTasks();

    renderCategories();

    populateCategoryDropdowns();
}
// =====================================
// OPEN AND CLOSE MODALS
// =====================================

function openModal(modal) {
    modal.classList.remove("hidden");
}

function closeModal(modal) {
    modal.classList.add("hidden");
}


// =====================================
// ADD NEW TASK BUTTON
// =====================================

document.getElementById("add-task-btn").addEventListener(
    "click", () => {


        if (!categories.length) {
            showToast("Please create a category first!");
            navigate("categories");
            return;
        }

        taskForm.reset();

        document.getElementById("task-id").value = "";

        document.getElementById("modal-title").textContent =
            "Create New Task";

        openModal(taskModal);
    }
);





// =====================================
// ADD NEW CATEGORY BUTTON
// =====================================

document.getElementById("add-category-btn").addEventListener(
    "click", () => {

        categoryForm.reset();

        openModal(categoryModal);
    }
);


// =====================================
// CLOSE MODALS
// =====================================

document.querySelectorAll("[data-close]").forEach(button => {

    button.addEventListener("click", () => {

        const modal = document.getElementById(
            button.dataset.close
        );

        if (modal) closeModal(modal);
    });
});


document.querySelectorAll(".modal-overlay").forEach(modal => {

    modal.addEventListener("click", event => {

        if (event.target === modal) {
            closeModal(modal);
        }
    });
});


// =====================================
// CREATE OR UPDATE TASK
// =====================================

taskForm.addEventListener("submit", event => {

    event.preventDefault();

    const id = document.getElementById("task-id").value;

    const taskData = {

        id: id || createId(),

        name: document.getElementById("task-name")
            .value.trim(),

        description: document.getElementById("task-description")
            .value.trim(),

        categoryId: document.getElementById("task-category")
            .value,

        priority: document.getElementById("task-priority")
            .value,

        status: document.getElementById("task-status")
            .value,

        dueDate: document.getElementById("task-date")
            .value
    };


    if (!taskData.name ||
        !taskData.categoryId ||
        !taskData.dueDate) {

        showToast("Please complete all required fields.");

        return;
    }


    if (!categories.some(c => c.id === taskData.categoryId))
    {

        showToast("Please select a valid category.");

        return;
    }


    if (id) {

        tasks = tasks.map(task =>
            task.id === id ? taskData : task
        );

        showToast("Task updated successfully!");

    } else {

        tasks.push(taskData);

        showToast("New task created successfully!");
    }


    renderApp();

    closeModal(taskModal);

    taskForm.reset();
});


// =====================================
// EDIT AND DELETE TASKS
// =====================================

allTaskList.addEventListener("click", event => {

    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = button.dataset.id;

    const task = tasks.find(item => item.id === id);

    if (!task) return;


    // EDIT TASK

    if (button.dataset.action === "edit") {

        document.getElementById("task-id").value =
            task.id;

        document.getElementById("task-name").value =
            task.name;

        document.getElementById("task-description").value =
            task.description;

        document.getElementById("task-category").value =
            task.categoryId;

        document.getElementById("task-priority").value =
            task.priority;

        document.getElementById("task-status").value =
            task.status;

        document.getElementById("task-date").value =
            task.dueDate;

        document.getElementById("modal-title").textContent =
            "Edit Task";

        openModal(taskModal);
    }


    // DELETE TASK

    if (button.dataset.action === "delete") {

        if (!confirm("Are you sure you want to delete this task?")) {
            return;
        }

        tasks = tasks.filter(item => item.id !== id);

        renderApp();

        showToast("Task deleted successfully!");
    }

});




// =====================================
// CREATE CUSTOM CATEGORY
// =====================================

categoryForm.addEventListener("submit", event => {

    event.preventDefault();

    const name = document.getElementById("category-name")
        .value.trim();

    const description = document.getElementById("category-description")
        .value.trim();


    if (!name) {
        showToast("Please enter a category name.");
        return;
    }


    const duplicate = categories.some(
        category => category.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
        showToast("This category already exists!");
        return;
    }


    categories.push({

        id: createId(),

        name: name,

        description: description

    });


    renderApp();

    closeModal(categoryModal);

    categoryForm.reset();

    showToast("Category created successfully!");
});




// =====================================
// DELETE CATEGORY
// =====================================

categoryList.addEventListener("click", event => {

    const button = event.target.closest("[data-category-delete]");

    if (!button) return;

    const id = button.dataset.categoryDelete;

    const hasTasks = tasks.some(
        task => task.categoryId === id
    );

    if (hasTasks) {
        showToast("Delete or reassign its tasks first!");
        return;
    }

    if (!confirm("Delete this category?")) return;

    categories = categories.filter(
        category => category.id !== id
    );

    renderApp();

    showToast("Category deleted successfully!");
});
// =====================================
// SEARCH TASKS
// =====================================

document.getElementById("search-task").addEventListener(
    "input",
    renderTasks
);


// =====================================
// FILTER BY STATUS
// =====================================

document.getElementById("status-filter").addEventListener(
    "change",
    renderTasks
);


// =====================================
// FILTER BY PRIORITY
// =====================================

document.getElementById("priority-filter").addEventListener(
    "change",
    renderTasks
);


// =====================================
// FILTER BY CATEGORY
// =====================================

document.getElementById("category-filter").addEventListener(
    "change",
    renderTasks
);


// =====================================
// APPLICATION STARTUP
// =====================================

function initializeApp() {

    renderApp();

    navigate("dashboard");

    console.log("TaskFlow application started successfully!");
}


// Start application
initializeApp();
