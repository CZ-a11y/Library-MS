function initMembers() {
  console.log("Members page initialized");

  // DOM Elements
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const addMemberBtn = document.querySelector(".add-member-btn");
  const exportBtn = document.getElementById("exportBtn");
  const addMemberModal = document.getElementById("addMemberModal");
  const editMemberModal = document.getElementById("editMemberModal");
  const deleteMemberModal = document.getElementById("deleteMemberModal");
  const closeButtons = document.querySelectorAll(".close");
  const confirmDeleteBtn = document.getElementById("confirmDelete");
  const toast = document.getElementById("toast");

  let currentMemberRow = null;

  // Toggle Sidebar
  function toggleSidebar() {
    sidebar?.classList.toggle("open");
    sidebarOverlay?.classList.toggle("show");
  }

  function closeSidebar() {
    sidebar?.classList.remove("open");
    sidebarOverlay?.classList.remove("show");
  }

  menuToggle?.addEventListener("click", toggleSidebar);
  sidebarOverlay?.addEventListener("click", closeSidebar);

  // Add Member
  addMemberBtn.addEventListener("click", () => {
    addMemberModal.style.display = "block";
    addMemberModal.classList.add("show");
  });

  // Export to PDF
  exportBtn.addEventListener("click", exportToPDF);

  function exportToPDF() {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("BookNest - Member List", 105, 15, { align: "center" });

    // Table headers
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Membership Date",
      "Status",
    ];
    const rows = [];

    // Extract table data
    document
      .querySelectorAll("#membersTable tbody tr")
      .forEach((row, index) => {
        const rowData = [
          row.cells[0].textContent,
          row.cells[1].textContent,
          row.cells[2].textContent,
          row.cells[3].textContent,
          row.cells[4].textContent,
          row.cells[5].textContent,
        ];
        rows.push(rowData);
      });

    // Add table to PDF
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 25,
      styles: {
        fontSize: 10,
        cellPadding: 2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount} | Exported on ${new Date().toLocaleDateString()}`,
        105,
        200,
        { align: "center" },
      );
    }

    // Save the PDF
    doc.save(
      `BookNest_MemberList_${new Date().toISOString().split("T")[0]}.pdf`,
    );
    showToast("Member list exported to PDF successfully!", "success");
  }

  // Add Member Form Submission
  document
    .getElementById("addMemberForm")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();

      const newName = document.getElementById("addName").value;
      const newEmail = document.getElementById("addEmail").value;
      const newPhone = document.getElementById("addPhone").value;
      const newStatus = document.getElementById("addStatus").value;

      const tableBody = document.querySelector("#membersTable tbody");
      if (!tableBody) {
        console.warn("Members table not found");
        return;
      }

      const newRow = tableBody.insertRow();
      newRow.classList.add("fade-in");
      newRow.style.animationDelay = `${tableBody.rows.length * 0.1}s`;

      newRow.innerHTML = `
      <td>${tableBody.rows.length + 1}</td>
      <td>${newName}</td>
      <td>${newEmail}</td>
      <td>${newPhone}</td>
      <td>${new Date().toISOString().split("T")[0]}</td>
      <td><span class="status ${newStatus.toLowerCase()}">${newStatus}</span></td>
      <td>
        <button class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
        <button class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
      </td>
    `;

      document.getElementById("addMemberForm").reset();
      addMemberModal.style.display = "none";
      addMemberModal.classList.remove("show");
      showToast("Member added successfully!", "success");

      addEditDeleteListeners(newRow);
    });

  // Edit/Delete Logic
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
      editMemberModal.classList.add("show");
    });

    deleteBtn?.addEventListener("click", () => {
      currentMemberRow = row;
      deleteMemberModal.style.display = "block";
      deleteMemberModal.classList.add("show");
    });
  }

  // Attach to existing rows
  document.querySelectorAll("#membersTable tbody tr").forEach((row) => {
    addEditDeleteListeners(row);
  });

  // Close Modals
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".modal").style.display = "none";
      btn.closest(".modal").classList.remove("show");
    });
  });

  // Delete Confirm
  confirmDeleteBtn?.addEventListener("click", () => {
    if (currentMemberRow) {
      currentMemberRow.classList.add("fade-out");
      setTimeout(() => {
        currentMemberRow.remove();
        showToast("Member deleted successfully!", "success");
      }, 300);
      deleteMemberModal.style.display = "none";
      deleteMemberModal.classList.remove("show");
    }
  });

  // Edit Save
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
        editMemberModal.classList.remove("show");
        showToast("Member updated successfully!", "success");
      }
    });

  // Toast Notification
  function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === addMemberModal) {
      addMemberModal.style.display = "none";
      addMemberModal.classList.remove("show");
    }
    if (event.target === editMemberModal) {
      editMemberModal.style.display = "none";
      editMemberModal.classList.remove("show");
    }
    if (event.target === deleteMemberModal) {
      deleteMemberModal.style.display = "none";
      deleteMemberModal.classList.remove("show");
    }
  });
}

// Expose to router
window.initMembers = initMembers;
