<script>
/* =====================================================
   DATA
===================================================== */
let vehicle = JSON.parse(localStorage.getItem("vehicle")) || {
    name: "My Car",
    number: "Not Added",
    mileage: 0
};

let services = JSON.parse(localStorage.getItem("services")) || [];

/* =====================================================
   LOGIN
===================================================== */
function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !email.includes("@") || !password) {
        document.getElementById("loginError").classList.remove("hidden");
        return;
    }

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("loggedUser", email);

    showDashboard();
}

/* =====================================================
   SHOW DASHBOARD
===================================================== */
function showDashboard() {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("appPage").classList.remove("hidden");
    document.getElementById("loggedUser").innerText = localStorage.getItem("loggedUser") || "";

    loadDashboard();
}

/* =====================================================
   LOGOUT & CLEAR DATA
===================================================== */
function logout() {
    const confirmLogout = confirm(
        "Logout karne par vehicle, mileage aur service history ka saara saved data delete ho jayega.\n\nContinue?"
    );

    if (!confirmLogout) return;

    localStorage.clear();

    vehicle = {
        name: "My Car",
        number: "Not Added",
        mileage: 0
    };

    services = [];

    document.getElementById("appPage").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    alert("Logout successful. All saved vehicle data has been deleted.");
}

/* =====================================================
   VEHICLE MODAL & STORAGE
===================================================== */
function openVehicleModal() {
    document.getElementById("vehicleModal").classList.remove("hidden");
    document.getElementById("vehicleNameInput").value = vehicle.name;
    document.getElementById("vehicleNumberInput").value = vehicle.number;
}

function closeVehicleModal() {
    document.getElementById("vehicleModal").classList.add("hidden");
}

function saveVehicle() {
    const name = document.getElementById("vehicleNameInput").value.trim();
    const number = document.getElementById("vehicleNumberInput").value.trim().toUpperCase();

    if (!name || !number) {
        alert("Please enter vehicle name and number.");
        return;
    }

    vehicle.name = name;
    vehicle.number = number;

    localStorage.setItem("vehicle", JSON.stringify(vehicle));

    closeVehicleModal();
    loadDashboard();
}

/* =====================================================
   MILEAGE MANAGEMENT
===================================================== */
function updateMileage() {
    const input = document.getElementById("mileageInput");
    const mileage = Number(input.value);

    if (input.value === "" || mileage < 0) {
        alert("Please enter a valid mileage.");
        return;
    }

    if (vehicle.mileage > 0 && mileage < vehicle.mileage) {
        alert("New mileage cannot be lower than previous mileage.\n\nIf the previous mileage is wrong, delete it first.");
        return;
    }

    vehicle.mileage = mileage;
    localStorage.setItem("vehicle", JSON.stringify(vehicle));
    input.value = "";

    loadDashboard();
}

function deleteMileage() {
    if (vehicle.mileage === 0) {
        alert("No mileage is currently saved.");
        return;
    }

    const confirmDelete = confirm(
        "Delete current mileage?\n\nCurrent mileage: " + vehicle.mileage.toLocaleString() + " km"
    );

    if (!confirmDelete) return;

    vehicle.mileage = 0;
    localStorage.setItem("vehicle", JSON.stringify(vehicle));
    document.getElementById("mileageInput").value = "";

    loadDashboard();
    alert("Mileage deleted. Enter the correct mileage now.");
}

/* =====================================================
   SERVICE CALCULATION ENGINE
===================================================== */
function calculateNextService() {
    const interval = 10000;
    const current = vehicle.mileage;

    let next = Math.floor(current / interval + 1) * interval;
    let remaining = next - current;

    document.getElementById("nextService").innerText = next.toLocaleString() + " km";
    document.getElementById("serviceRemaining").innerText = remaining.toLocaleString() + " km remaining";
    document.getElementById("oilAlert").innerText = remaining.toLocaleString() + " km remaining";
    document.getElementById("tyreAlert").innerText = remaining.toLocaleString() + " km remaining";

    const batteryInterval = 20000;
    let nextBattery = Math.floor(current / batteryInterval + 1) * batteryInterval;
    let batteryRemaining = nextBattery - current;

    document.getElementById("batteryAlert").innerText = batteryRemaining.toLocaleString() + " km remaining";

    const status = document.getElementById("maintenanceStatus");
    const message = document.getElementById("maintenanceMessage");

    if (remaining <= 1000) {
        status.innerText = "Due Soon";
        status.className = "text-2xl font-black text-orange-500 mt-2";
        message.innerText = "Service is due within " + remaining.toLocaleString() + " km.";
    } else {
        status.innerText = "Good";
        status.className = "text-2xl font-black text-green-600 mt-2";
        message.innerText = "Next service in " + remaining.toLocaleString() + " km.";
    }
}

/* =====================================================
   SERVICE MODAL & CRUD
===================================================== */
function openServiceModal() {
    document.getElementById("serviceModal").classList.remove("hidden");
    document.getElementById("serviceDate").value = new Date().toISOString().split("T")[0];
    document.getElementById("serviceMileage").value = vehicle.mileage;
}

function closeServiceModal() {
    document.getElementById("serviceModal").classList.add("hidden");
}

function addService() {
    const date = document.getElementById("serviceDate").value;
    const mileage = Number(document.getElementById("serviceMileage").value);
    const type = document.getElementById("serviceType").value;
    const cost = Number(document.getElementById("serviceCost").value);

    if (!date || mileage <= 0 || !type || cost < 0) {
        alert("Please fill all service details.");
        return;
    }

    services.unshift({
        id: Date.now(),
        date: date,
        mileage: mileage,
        type: type,
        cost: cost
    });

    localStorage.setItem("services", JSON.stringify(services));

    if (mileage > vehicle.mileage) {
        vehicle.mileage = mileage;
        localStorage.setItem("vehicle", JSON.stringify(vehicle));
    }

    closeServiceModal();
    loadDashboard();
    alert("Service record added successfully.");
}

function displayServices() {
    const table = document.getElementById("serviceTable");
    table.innerHTML = "";

    if (services.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-10 text-slate-400">
                    No service records yet.
                </td>
            </tr>
        `;
        return;
    }

    services.forEach(service => {
        table.innerHTML += `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3">${service.date}</td>
                <td class="p-3 font-semibold">${Number(service.mileage).toLocaleString()} km</td>
                <td class="p-3">${service.type}</td>
                <td class="p-3 font-semibold">₹${Number(service.cost).toLocaleString()}</td>
                <td class="p-3">
                    <button onclick="deleteService(${service.id})" class="text-red-500 hover:text-red-700 font-semibold">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

function deleteService(id) {
    const confirmDelete = confirm("Delete this service record?");
    if (!confirmDelete) return;

    services = services.filter(service => service.id !== id);
    localStorage.setItem("services", JSON.stringify(services));
    loadDashboard();
}

/* =====================================================
   MAIN VIEW RENDERER
===================================================== */
function loadDashboard() {
    document.getElementById("vehicleName").innerText = vehicle.name;
    document.getElementById("vehicleNumber").innerText = "Vehicle Number: " + vehicle.number;
    document.getElementById("currentMileage").innerText = vehicle.mileage.toLocaleString() + " km";
    document.getElementById("totalServices").innerText = services.length;

    calculateNextService();
    displayServices();
}

/* =====================================================
   EVENT LISTENERS & INITIALIZATION
===================================================== */
document.getElementById("vehicleModal").addEventListener("click", function(e) {
    if (e.target === this) closeVehicleModal();
});

document.getElementById("serviceModal").addEventListener("click", function(e) {
    if (e.target === this) closeServiceModal();
});

if (localStorage.getItem("loggedIn") === "true") {
    showDashboard();
}
</script>