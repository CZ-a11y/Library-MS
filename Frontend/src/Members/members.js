function initMembers() {
  console.log("Members page initialized");

  const addMemberBtn = document.querySelector(".add-member-btn");

  const addMemberModal = document.getElementById("addMemberModal");
  const editMemberModal = document.getElementById("editMemberModal");
  const deleteMemberModal = document.getElementById("deleteMemberModal");
  const closeButtons = document.querySelectorAll(".close");
  const confirmDeleteBtn = document.getElementById("confirmDelete");

  let currentMemberRow = null;

  // ✅ Prevent crash if page not ready
  if (!addMemberBtn) {
    console.warn("Members elements not found");
    return;
  }

  // --- Add Member ---
  addMemberBtn.addEventListener("click", () => {
    addMemberModal.style.display = "block";
  });

  document
    .getElementById("addMemberForm")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();

      const newName = document.getElementById("addName").value;
      const newEmail = document.getElementById("addEmail").value;
      const newPhone = document.getElementById("addPhone").value;
      const newStatus = document.getElementById("addStatus").value;

      const tableBody = document.querySelector(".members-table tbody");

      const newRow = tableBody.insertRow();

      newRow.innerHTML = `
        <td>${tableBody.rows.length}</td>
        <td>${newName}</td>
        <td>${newEmail}</td>
        <td>${newPhone}</td>
        <td>${new Date().toISOString().split("T")[0]}</td>
        <td><span class="status ${newStatus.toLowerCase()}">${newStatus}</span></td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;

      document.getElementById("addMemberForm").reset();
      addMemberModal.style.display = "none";
      alert("Member added successfully.");

      addEditDeleteListeners(newRow);
    });

  // --- Edit/Delete Logic ---
  function addEditDeleteListeners(row) {
    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    editBtn?.addEventListener("click", () => {
      currentMemberRow = row;

      document.getElementById("editName").value = row.children[1].textContent;
      document.getElementById("editEmail").value = row.children[2].textContent;
      document.getElementById("editPhone").value = row.children[3].textContent;
      document.getElementById("editStatus").value =
        row.querySelector(".status").textContent;

      editMemberModal.style.display = "block";
    });

    deleteBtn?.addEventListener("click", () => {
      currentMemberRow = row;
      deleteMemberModal.style.display = "block";
    });
  }

  // Attach to existing rows
  document.querySelectorAll(".members-table tbody tr").forEach((row) => {
    addEditDeleteListeners(row);
  });

  // --- Close Modals ---
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      addMemberModal.style.display = "none";
      editMemberModal.style.display = "none";
      deleteMemberModal.style.display = "none";
    });
  });

  // --- Delete Confirm ---
  confirmDeleteBtn?.addEventListener("click", () => {
    if (currentMemberRow) {
      currentMemberRow.remove();
      deleteMemberModal.style.display = "none";
      alert("Member deleted successfully.");
    }
  });

  // --- Edit Save ---
  document
    .getElementById("editMemberForm")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();

      if (currentMemberRow) {
        const newName = document.getElementById("editName").value;
        const newEmail = document.getElementById("editEmail").value;
        const newPhone = document.getElementById("editPhone").value;
        const newStatus = document.getElementById("editStatus").value;

        currentMemberRow.children[1].textContent = newName;
        currentMemberRow.children[2].textContent = newEmail;
        currentMemberRow.children[3].textContent = newPhone;

        const statusEl = currentMemberRow.querySelector(".status");
        statusEl.textContent = newStatus;
        statusEl.className = `status ${newStatus.toLowerCase()}`;

        editMemberModal.style.display = "none";
        alert("Member updated successfully.");
      }
    });
}

window.initMembers = initMembers;
