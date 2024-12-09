// Patient data array
let patients = [];
let currentPage = 1;
const patientsPerPage = 10;

// Load data from localStorage
function loadPatients() {
  const storedPatients = localStorage.getItem("patients");
  patients = storedPatients ? JSON.parse(storedPatients) : [];
}

// Save data to localStorage
function savePatients() {
  localStorage.setItem("patients", JSON.stringify(patients));
}

// Render patients in the table
function renderPatients(filter = "") {
  const tableBody = document.getElementById("patientTable").querySelector("tbody");
  tableBody.innerHTML = ""; // Clear existing rows

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(filter.toLowerCase()) ||
    patient.condition.toLowerCase().includes(filter.toLowerCase())
  );

  // Determine pagination
  const start = (currentPage - 1) * patientsPerPage;
  const end = start + patientsPerPage;

  const paginatedPatients = filteredPatients.slice(start, end);

  paginatedPatients.forEach((patient, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${patient.name}</td>
        <td>${patient.age}</td>
        <td>${patient.condition}</td>
        <td><button class="delete-btn" data-index="${index + start}">Delete</button></td>
      `;

      tableBody.appendChild(row);
    });

  // Add event listeners for delete buttons
  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", event => {
      const index = parseInt(event.target.dataset.index, 10);
      deletePatient(index);
    });
  });

  // Render updated pagination
  renderPagination(filteredPatients.length);
}

// Add Patient
function addPatient(event) {
  event.preventDefault();

  // Collect data from form fields
  const name = document.getElementById("name").value.trim();
  const age = parseInt(document.getElementById("age").value.trim(), 10);
  const condition = document.getElementById("condition").value.trim();

  // Validating input fields
  if (!name || isNaN(age) || !condition) {
    alert("Please fill in all fields correctly.");
    return;
  }

  // Create a new patient object
  const patient = { name, age, condition };

  // Add patient to the list
  patients.push(patient);
  savePatients();
  renderPatients();
  updateChart();

  // Clear the form fields
  document.getElementById("patientForm").reset();
}

// Delete Patient
function deletePatient(index) {
  patients.splice(index, 1);
  savePatients();
  loadPatients();
  renderPatients();
  updateChart();
}

// Search functionality
document.getElementById("searchBar").addEventListener("input", event => {
  const filter = event.target.value;
  renderPatients(filter);
});

function renderPagination(totalPatients) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(totalPatients / patientsPerPage);

    // Create Previous Button
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            const filter = document.getElementById("searchBar").value;
            renderPatients(filter);
        }
    });
    pagination.appendChild(prevButton);

    // Display Current Page
    const currentPageDisplay = document.createElement("span");
    currentPageDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
    pagination.appendChild(currentPageDisplay);

    // Create Next Button
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            const filter = document.getElementById("searchBar").value;
            renderPatients(filter);
        }
    });
    pagination.appendChild(nextButton);
}


// Chart.js setup
let chart;

function updateChart() {
  const conditionCounts = patients.reduce((counts, patient) => {
    counts[patient.condition] = (counts[patient.condition] || 0) + 1;
    return counts;
  }, {});

  const labels = Object.keys(conditionCounts);
  const data = Object.values(conditionCounts);

  if (chart) {
    chart.destroy();
  }

  const ctx = document.getElementById("patientChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Patients by Condition",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Initialize application
document.getElementById("patientForm").addEventListener("submit", addPatient);
loadPatients();
renderPatients();
updateChart();


