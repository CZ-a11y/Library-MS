function initMembers() {
  // Check if LibraryAPI is available
  if (typeof LibraryAPI === "undefined") {
    console.warn("LibraryAPI not yet available, retrying...");
    setTimeout(initMembers, 200);
    return;
  }

  // Remove any existing event listeners to prevent duplicates
  removeExistingEventListeners();

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
  const membersTable = document.getElementById("membersTable");
  const searchInput = document.getElementById("searchInput");

  let currentMemberId = null;
  let currentMemberRow = null;
  let debounceTimer = null;
  let isProcessing = false;

  // Helper function to remove existing event listeners
  function removeExistingEventListeners() {
    // Remove all existing event listeners from forms
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
    });

    // Remove all existing event listeners from buttons
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    });
  }

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

  // Search functionality with debounce
  searchInput?.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const searchTerm = searchInput.value.trim();
      try {
        let endpoint = "/members";
        if (searchTerm) {
          endpoint = `/members?search=${encodeURIComponent(searchTerm)}`;
        }

        const response = await LibraryAPI.request(endpoint);
        if (!response.success) {
          throw new Error(response.message || "Failed to search members");
        }
        renderMembers(response.data || []);
      } catch (error) {
        console.error("Error searching members:", error);
        showToast(error.message || "Failed to search members", "error");
      }
    }, 300);
  });

  // Load members from API
  async function loadMembers() {
    try {
      isProcessing = true;
      const response = await LibraryAPI.request("/members");
      if (!response.success) {
        throw new Error(response.message || "Failed to load members");
      }
      renderMembers(response.data || []);
    } catch (error) {
      console.error("Error loading members:", error);
      showToast(error.message || "Failed to load members", "error");
    } finally {
      isProcessing = false;
    }
  }

  // Render members to table
  function renderMembers(members) {
    const tableBody = membersTable.querySelector("tbody");
    if (!tableBody) return;

    // Clear existing rows
    tableBody.innerHTML = "";

    // Add each member as a row
    members.forEach((member) => {
      const row = tableBody.insertRow();
      const membershipDate = member.membership_date
        ? new Date(member.membership_date).toLocaleDateString()
        : "N/A";

      row.innerHTML = `
        <td>${member.id}</td>
        <td>${member.name}</td>
        <td>${member.email}</td>
        <td>${member.phone}</td>
        <td>${member.address || "N/A"}</td>
        <td>${membershipDate}</td>
        <td><span class="status ${member.status?.toLowerCase() || "active"}">${member.status || "Active"}</span></td>
        <td>
          <button class="edit-btn" data-id="${member.id}"><i class="fas fa-edit"></i> Edit</button>
          <button class="delete-btn" data-id="${member.id}"><i class="fas fa-trash"></i> Delete</button>
        </td>
      `;
    });

    // Add event listeners to all edit/delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", handleEdit, { once: true });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", handleDelete, { once: true });
    });
  }

  // Add Member
  addMemberBtn.addEventListener("click", () => {
    // Reset form
    const form = document.getElementById("addMemberForm");
    if (form) form.reset();
    if (addMemberModal) {
      addMemberModal.style.display = "block";
      addMemberModal.classList.add("show");
    }
  });

  // Export to PDF
  exportBtn?.addEventListener("click", () => {
    if (!window.jsPDFReady || !window.jsPDF) {
      showToast("PDF library not loaded. Please refresh the page.", "error");
      return;
    }

    try {
      exportToPDF();
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      showToast("PDF export failed: " + error.message, "error");
    }
  });

  function exportToPDF() {
    try {
      // Create new PDF document
      const doc = new window.jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text("BookNest - Member List", 105, 15, { align: "center" });

      // Get current date for footer
      const currentDate = new Date().toLocaleDateString();

      // Table headers
      const headers = ["ID", "Name", "Email", "Phone"];
      const rows = [];

      // Check if address column exists in the table
      const hasAddressColumn =
        document
          .querySelector("#membersTable th:nth-child(5)")
          ?.textContent.trim() === "Address";

      if (hasAddressColumn) {
        headers.push("Address");
      }

      headers.push("Membership Date", "Status");

      // Table data - get from the current table
      document.querySelectorAll("#membersTable tbody tr").forEach((row) => {
        const rowData = [
          row.cells[0].textContent,
          row.cells[1].textContent,
          row.cells[2].textContent,
          row.cells[3].textContent,
        ];

        if (hasAddressColumn) {
          rowData.push(row.cells[4].textContent);
        }

        rowData.push(
          row.cells[hasAddressColumn ? 5 : 4].textContent,
          row.cells[hasAddressColumn ? 6 : 5].textContent,
        );

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
          `Page ${i} of ${pageCount} | Exported on ${currentDate}`,
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
    } catch (error) {
      console.error("Error in exportToPDF:", error);
      showToast("Failed to export PDF: " + error.message, "error");
    }
  }

  // Add Member Form Submission with improved handling
  document
    .getElementById("addMemberForm")
    ?.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (isProcessing) return;
      isProcessing = true;

      try {
        const nameInput = document.getElementById("addName");
        const emailInput = document.getElementById("addEmail");
        const phoneInput = document.getElementById("addPhone");
        const addressInput = document.getElementById("addAddress");
        const statusInput = document.getElementById("addStatus");

        if (!nameInput?.value || !emailInput?.value || !phoneInput?.value) {
          showToast("Name, email, and phone are required", "error");
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
          showToast("Please enter a valid email address", "error");
          return;
        }

        const newMember = {
          name: nameInput.value,
          email: emailInput.value,
          phone: phoneInput.value,
        };

        if (addressInput?.value) newMember.address = addressInput.value;
        if (statusInput?.value) newMember.status = statusInput.value;

        const response = await LibraryAPI.request(
          "/members",
          "POST",
          newMember,
        );

        if (!response.success) {
          throw new Error(response.message || "Failed to add member");
        }

        showToast("Member added successfully!", "success");
        document.getElementById("addMemberForm")?.reset();
        if (addMemberModal) {
          addMemberModal.style.display = "none";
          addMemberModal.classList.remove("show");
        }
        loadMembers();
      } catch (error) {
        console.error("Error adding member:", error);
        let errorMessage = "Failed to add member";

        if (error.message) {
          if (error.message.includes("Email already exists")) {
            errorMessage = "Email already exists";
          } else if (error.message.includes("Duplicate entry")) {
            errorMessage = "Email already exists";
          }
        }

        showToast(errorMessage, "error");
      } finally {
        isProcessing = false;
      }
    });

  // Edit Member
  function handleEdit(event) {
    currentMemberId = event.currentTarget.getAttribute("data-id");
    currentMemberRow = event.currentTarget.closest("tr");

    if (isProcessing) return;
    isProcessing = true;

    getMemberDetails(currentMemberId).finally(() => {
      isProcessing = false;
    });
  }

  // Updated getMemberDetails function with proper null checks
  async function getMemberDetails(memberId) {
    try {
      const response = await LibraryAPI.request(`/members/${memberId}`);

      if (!response.success) {
        throw new Error(response.message || "Member not found");
      }

      const member = response.data || response;

      // Check if form elements exist before setting values
      const editName = document.getElementById("editName");
      const editEmail = document.getElementById("editEmail");
      const editPhone = document.getElementById("editPhone");
      const editAddress = document.getElementById("editAddress");
      const editStatus = document.getElementById("editStatus");

      if (editName) editName.value = member.name || "";
      if (editEmail) editEmail.value = member.email || "";
      if (editPhone) editPhone.value = member.phone || "";
      if (editAddress) editAddress.value = member.address || "";
      if (editStatus) editStatus.value = member.status || "Active";

      if (editMemberModal) {
        editMemberModal.style.display = "block";
        editMemberModal.classList.add("show");
      }
    } catch (error) {
      console.error("Error getting member details:", error);
      showToast(error.message || "Failed to get member details", "error");
    }
  }

  // Delete Member
  function handleDelete(event) {
    currentMemberId = event.currentTarget.getAttribute("data-id");
    currentMemberRow = event.currentTarget.closest("tr");

    if (isProcessing) return;
    isProcessing = true;

    if (deleteMemberModal) {
      deleteMemberModal.style.display = "block";
      deleteMemberModal.classList.add("show");
    }
    isProcessing = false;
  }

  // Edit Save with improved handling
  document
    .getElementById("editMemberForm")
    ?.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (isProcessing) return;
      isProcessing = true;

      try {
        const nameInput = document.getElementById("editName");
        const emailInput = document.getElementById("editEmail");
        const phoneInput = document.getElementById("editPhone");
        const addressInput = document.getElementById("editAddress");
        const statusInput = document.getElementById("editStatus");

        if (!nameInput?.value || !emailInput?.value || !phoneInput?.value) {
          showToast("Name, email, and phone are required", "error");
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
          showToast("Please enter a valid email address", "error");
          return;
        }

        const updatedMember = {
          name: nameInput.value,
          email: emailInput.value,
          phone: phoneInput.value,
        };

        if (addressInput?.value) updatedMember.address = addressInput.value;
        if (statusInput?.value) updatedMember.status = statusInput.value;

        const response = await LibraryAPI.request(
          `/members/${currentMemberId}`,
          "PUT",
          updatedMember,
        );

        if (!response.success) {
          throw new Error(response.message || "Failed to update member");
        }

        showToast("Member updated successfully!", "success");
        if (editMemberModal) {
          editMemberModal.style.display = "none";
          editMemberModal.classList.remove("show");
        }
        loadMembers();
      } catch (error) {
        console.error("Error updating member:", error);
        let errorMessage = "Failed to update member";

        if (error.message) {
          if (error.message.includes("Email already exists")) {
            errorMessage = "Email already exists";
          } else if (error.message.includes("Duplicate entry")) {
            errorMessage = "Email already exists";
          }
        }

        showToast(errorMessage, "error");
      } finally {
        isProcessing = false;
      }
    });

  // Delete Confirm with improved handling
  confirmDeleteBtn?.addEventListener("click", async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      if (!currentMemberId) {
        throw new Error("No member selected for deletion");
      }

      const response = await LibraryAPI.request(
        `/members/${currentMemberId}`,
        "DELETE",
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to delete member");
      }

      showToast("Member deleted successfully!", "success");
      if (deleteMemberModal) {
        deleteMemberModal.style.display = "none";
        deleteMemberModal.classList.remove("show");
      }
      loadMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      showToast(error.message || "Failed to delete member", "error");
    } finally {
      isProcessing = false;
    }
  });

  // Close Modals
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      if (modal) {
        modal.style.display = "none";
        modal.classList.remove("show");
      }
    });
  });

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === addMemberModal) {
      if (addMemberModal) {
        addMemberModal.style.display = "none";
        addMemberModal.classList.remove("show");
      }
    }
    if (event.target === editMemberModal) {
      if (editMemberModal) {
        editMemberModal.style.display = "none";
        editMemberModal.classList.remove("show");
      }
    }
    if (event.target === deleteMemberModal) {
      if (deleteMemberModal) {
        deleteMemberModal.style.display = "none";
        deleteMemberModal.classList.remove("show");
      }
    }
  });

  // Toast Notification
  function showToast(message, type = "success") {
    if (toast) {
      toast.textContent = message;
      toast.className = `toast ${type}`;
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 3000);
    }
  }

  // Load members when page initializes
  loadMembers();
}

// Expose to router
window.initMembers = initMembers;
