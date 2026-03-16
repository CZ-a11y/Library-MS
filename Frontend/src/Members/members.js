document.addEventListener("DOMContentLoaded", function () {
  const editButtons = document.querySelectorAll(".edit-btn");
  const deleteButtons = document.querySelectorAll(".delete-btn");
  const addMemberBtn = document.querySelector(".add-member-btn");

  const addMemberModal = document.getElementById("addMemberModal");
  const editMemberModal = document.getElementById("editMemberModal");
  const deleteMemberModal = document.getElementById("deleteMemberModal");
  const closeButtons = document.querySelectorAll(".close");
  const confirmDeleteBtn = document.getElementById("confirmDelete");

  let currentMemberRow = null;

  // Add Member Button Event Listener
  addMemberBtn.addEventListener("click", function () {
    addMemberModal.style.display = "block";
  });

  // Add Member Form Submission
  document
    .getElementById("addMemberForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const newName = document.getElementById("addName").value;
      const newEmail = document.getElementById("addEmail").value;
      const newPhone = document.getElementById("addPhone").value;
      const newStatus = document.getElementById("addStatus").value;

      // Add new member to the table
      const tableBody = document.querySelector(".members-table tbody");
      const newRow = tableBody.insertRow();

      const cell1 = newRow.insertCell(0);
      const cell2 = newRow.insertCell(1);
      const cell3 = newRow.insertCell(2);
      const cell4 = newRow.insertCell(3);
      const cell5 = newRow.insertCell(4);
      const cell6 = newRow.insertCell(5);
      const cell7 = newRow.insertCell(6);

      cell1.textContent = tableBody.rows.length + 1;
      cell2.textContent = newName;
      cell3.textContent = newEmail;
      cell4.textContent = newPhone;
      cell5.textContent = new Date().toISOString().split("T")[0];
      cell6.innerHTML = `<span class="status ${newStatus.toLowerCase()}">${newStatus}</span>`;
      cell7.innerHTML = `<button class="edit-btn">Edit</button> <button class="delete-btn">Delete</button>`;

      // Reset form and close modal
      document.getElementById("addMemberForm").reset();
      addMemberModal.style.display = "none";
      alert("Member added successfully.");

      // Add event listeners to new buttons
      addEditDeleteListeners(newRow);
    });

  // Edit Button Event Listeners
  function addEditDeleteListeners(row) {
    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    editBtn.addEventListener("click", function () {
      currentMemberRow = row;
      const memberId = row.querySelector("td:first-child").textContent;
      const memberName = row.querySelector("td:nth-child(2)").textContent;
      const memberEmail = row.querySelector("td:nth-child(3)").textContent;
      const memberPhone = row.querySelector("td:nth-child(4)").textContent;
      const memberStatus = row.querySelector(".status").textContent;

      document.getElementById("editName").value = memberName;
      document.getElementById("editEmail").value = memberEmail;
      document.getElementById("editPhone").value = memberPhone;
      document.getElementById("editStatus").value = memberStatus;

      editMemberModal.style.display = "block";
    });

    deleteBtn.addEventListener("click", function () {
      currentMemberRow = row;
      deleteMemberModal.style.display = "block";
    });
  }

  // Add event listeners to existing buttons
  editButtons.forEach((button) => {
    const row = button.closest("tr");
    addEditDeleteListeners(row);
  });

  deleteButtons.forEach((button) => {
    const row = button.closest("tr");
    addEditDeleteListeners(row);
  });

  // Close Modal Event Listeners
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      addMemberModal.style.display = "none";
      editMemberModal.style.display = "none";
      deleteMemberModal.style.display = "none";
    });
  });

  // Confirm Delete Button Event Listener
  confirmDeleteBtn.addEventListener("click", function () {
    if (currentMemberRow) {
      currentMemberRow.remove();
      alert("Member deleted successfully.");
      deleteMemberModal.style.display = "none";
    }
  });

  // Save Changes in Edit Modal
  document
    .getElementById("editMemberForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      if (currentMemberRow) {
        const newName = document.getElementById("editName").value;
        const newEmail = document.getElementById("editEmail").value;
        const newPhone = document.getElementById("editPhone").value;
        const newStatus = document.getElementById("editStatus").value;

        currentMemberRow.querySelector("td:nth-child(2)").textContent = newName;
        currentMemberRow.querySelector("td:nth-child(3)").textContent =
          newEmail;
        currentMemberRow.querySelector("td:nth-child(4)").textContent =
          newPhone;
        currentMemberRow.querySelector(".status").textContent = newStatus;
        currentMemberRow.querySelector(".status").className =
          `status ${newStatus.toLowerCase()}`;

        editMemberModal.style.display = "none";
        alert("Member updated successfully.");
      }
    });
});
