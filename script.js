// Detect user's locale & currency
const userLocale = navigator.language;

function getUserCurrency() {
    const currencyMap = {
        "en-IN": "INR",
        "en-US": "USD",
        "en-GB": "GBP",
        "de-DE": "EUR",
        "fr-FR": "EUR",
        "ja-JP": "JPY",
        "en-AU": "AUD",
        "en-CA": "CAD"
    };

    return currencyMap[userLocale] || "USD"; // fallback
}

const userCurrency = getUserCurrency();
const categoryImages = {
    "Housing": "images/housing.png",
    "Utilities": "images/utilities.png",
    "Food": "images/food.png",
    "Transportation": "images/transportation.png",
    "Healthcare": "images/healthcare.png",
    "Electronics": "images/electronics.png",
    "Education": "images/education.png",
    "Entertainment": "images/entertainment.png",
    "Personal Care": "images/personal-care.png",
    "Savings & Investments": "images/savings.png",
    "Other": "images/other.png",
    "General": "images/other.png"
};
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Open form
function openForm() {
    document.getElementById("formContainer").classList.add("active");

    const now = new Date();
    const formatted = now.toISOString().slice(0,16);
    document.getElementById("datetime").value = formatted;

    document.getElementById("useCurrentTime").checked = true;
    toggleDateTimeMode();
}
// Close form
function closeForm() {
    document.getElementById("formContainer").classList.remove("active");
    resetForm();
}

// Reset form
function resetForm() {
    document.getElementById("title").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
    document.getElementById("note").value = "";
    document.getElementById("customCategory").value = "";
}

// Save expense
function saveExpense() {
    const title = document.getElementById("title").value.trim();
    let amount = document.getElementById("amount").value.replace(/[^0-9.]/g, '');
amount = parseFloat(amount);
    let category = document.getElementById("category").value;
const customCat = document.getElementById("customCategory").value;

if (category === "Other" && customCat) {
    category = customCat;
}   
    const note = document.getElementById("note").value;

   if (!title || isNaN(amount) || amount <= 0) {
    alert("Please fill required fields (*)");
    return;
}

    const useCurrent = document.getElementById("useCurrentTime").checked;
    let dateTime;

    if (useCurrent) {
        dateTime = new Date().toLocaleString();
    } else {
        const customDate = document.getElementById("datetime").value;
        dateTime = new Date(customDate).toLocaleString();
    }

    const expense = {
        id: Date.now(),
        title,
        amount: parseFloat(amount),
        category: category || "General",
        note,
        dateTime
    };

    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));

    renderExpenses();
    updateTopTotal();
    closeForm();
}
// Render expenses
function renderExpenses() {
    const list = document.getElementById("cravingsList");
    list.innerHTML = "";

    expenses.forEach(e => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
    <div class="menu top-menu">
        <span class="menu-btn" onclick="toggleMenu(${e.id})">⋮</span>
        <div class="menu-dropdown" id="menu-${e.id}">
            <div onclick="editExpense(${e.id})">Edit</div>
            <div onclick="deleteExpense(${e.id})">Delete</div>
        </div>
    </div>

  <img src="${categoryImages[e.category] || categoryImages['Other']}" class="expense-image">

    <div class="card-content">
        <strong>${e.title}</strong>
        <div>Category: ${e.category}</div>
        <div>${e.dateTime}</div>
    </div>

    <div class="price bottom-price">
    ${new Intl.NumberFormat(userLocale, {
    style: "currency",
    currency: userCurrency
}).format(e.amount)}
</div>
`;

        list.appendChild(div);
    });
}

renderExpenses();
updateTopTotal();

function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses();
    updateTopTotal();
    calculateStats();
}
function editExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    document.getElementById("title").value = expense.title;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("note").value = expense.note;

    // Uncheck current time when editing
    document.getElementById("useCurrentTime").checked = false;
    toggleDateTimeMode();

    // Restore original date
    const originalDate = new Date(expense.dateTime);
    const iso = originalDate.toISOString().slice(0,16);
    document.getElementById("datetime").value = iso;

    document.getElementById("formContainer").classList.add("active");
}
function toggleMenu(id) {
    const menu = document.getElementById(`menu-${id}`);

    document.querySelectorAll(".menu-dropdown").forEach(m => {
        if (m !== menu) m.style.display = "none";
    });

    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}

function toggleDateTimeMode() {
    const checkbox = document.getElementById("useCurrentTime");
    const wrapper = document.getElementById("datetimeWrapper");
    const input = document.getElementById("datetime");

    if (checkbox.checked) {
        input.readOnly = true;
        wrapper.classList.add("disabled");

        const now = new Date();
        input.value = now.toISOString().slice(0,16);
    } else {
        input.readOnly = false;
        wrapper.classList.remove("disabled");
    }
}

function openDatePicker() {
    const input = document.getElementById("datetime");
    input.showPicker();
}


function closeHelp() {
    document.getElementById("helpModal").classList.remove("active");
    localStorage.setItem("spendthrift_onboarding_seen", "true");
}
document.getElementById("category").addEventListener("change", function() {
    const custom = document.getElementById("customCategory");

    if (this.value === "Other") {
        custom.classList.remove("hidden");
    } else {
        custom.classList.add("hidden");
    }
});

function formatAmount(input) {
    let value = input.value;

    // Remove everything except digits and dot
    value = value.replace(/[^0-9.]/g, '');

    // Allow only one decimal
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }

    if (value === '') {
        input.value = '';
        return;
    }

    // Get currency symbol only
    const symbol = new Intl.NumberFormat(userLocale, {
        style: "currency",
        currency: userCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })
    .format(0)
    .replace(/0/g, '')
    .trim();

    input.value = symbol + value;
}
document.addEventListener("DOMContentLoaded", function () {
    const seen = localStorage.getItem("spendthrift_onboarding_seen");

    if (!seen) {
        const modal = document.getElementById("helpModal");
        modal.classList.add("active");
        showStep(1);
    }
});

let currentStep = 1;

function showStep(step) {
    document.querySelectorAll(".help-step").forEach(el => {
        el.classList.add("hidden");
    });

    document.getElementById(`step-${step}`).classList.remove("hidden");
    currentStep = step;
}

function nextStep() {
    if (currentStep < 3) {
        showStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function openHelp() {
    const modal = document.getElementById("helpModal");
    modal.classList.add("active");
    showStep(1);
}
document.addEventListener("click", function (e) {
    // If click is NOT inside menu or menu button
    if (!e.target.closest(".menu")) {
        document.querySelectorAll(".menu-dropdown").forEach(menu => {
            menu.style.display = "none";
        });
    }
});
function toggleStats() {
    const statsBox = document.getElementById("statsContainer");

    statsBox.classList.toggle("hidden");

    if (!statsBox.classList.contains("hidden")) {
        calculateStats();
    }
}

function calculateStats() {
    let total = 0;

    expenses.forEach(e => {
        total += e.amount;
    });

    const formattedTotal = new Intl.NumberFormat(userLocale, {
        style: "currency",
        currency: userCurrency
    }).format(total);

    document.getElementById("totalAmount").innerText = formattedTotal;
}
function updateTopTotal() {
    let total = 0;

    expenses.forEach(e => {
        total += e.amount;
    });

    const formatted = new Intl.NumberFormat(userLocale, {
        style: "currency",
        currency: userCurrency
    }).format(total);

    document.getElementById("topTotal").innerText = "-" + formatted;

}
function openStatsPage() {
    document.getElementById("cravingsList").classList.add("hidden");
    document.getElementById("statsPage").classList.remove("hidden");
}

function closeStatsPage() {
    document.getElementById("statsPage").classList.add("hidden");
    document.getElementById("cravingsList").classList.remove("hidden");
}
