const form = document.getElementById("appForm");
const tableBody = document.querySelector("#appTable tbody");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    company: company.value,
    role: role.value,
    status: status.value
  };

  await fetch("http://localhost:5000/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  form.reset();
  loadApplications();
});

async function loadApplications() {
  const res = await fetch("http://localhost:5000/applications");
  const apps = await res.json();

  tableBody.innerHTML = "";
  apps.forEach(app => {
    const row = `<tr>
      <td>${app.company}</td>
      <td>${app.role}</td>
      <td>${app.status}</td>
    </tr>`;
    tableBody.innerHTML += row;
  });
}

loadApplications();
