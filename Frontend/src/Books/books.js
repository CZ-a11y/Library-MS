function initBooks() {
  console.log("Books page initialized");

  // DOM Elements
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const addBookBtn = document.querySelector(".add-book-btn");
  const exportBtn = document.querySelector(".export-btn");
  const addBookModal = document.getElementById("addBookModal");
  const editBookModal = document.getElementById("editBookModal");
  const deleteBookModal = document.getElementById("deleteBookModal");
  const closeButtons = document.querySelectorAll(".close");
  const confirmDeleteBtn = document.getElementById("confirmDelete");
  const toast = document.getElementById("toast");

  let currentBookRow = null;

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

  // Add Book
  addBookBtn.addEventListener("click", () => {
    addBookModal.style.display = "block";
    addBookModal.classList.add("show");
  });

  // Export to PDF
  exportBtn.addEventListener("click", exportToPDF);

  function exportToPDF() {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("BookNest - Book List", 105, 15, { align: "center" });

    // Table headers
    const headers = ["ID", "Title", "Author", "Category", "ISBN", "Quantity"];
    const rows = [];

    // Extract table data
    document.querySelectorAll("#booksTable tbody tr").forEach((row, index) => {
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
    doc.save(`BookNest_BookList_${new Date().toISOString().split("T")[0]}.pdf`);
    showToast("Book list exported to PDF successfully!", "success");
  }

  // Add Book Form Submission
  document
    .getElementById("addBookForm")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();

      const newTitle = document.getElementById("addTitle").value;
      const newAuthor = document.getElementById("addAuthor").value;
      const newCategory = document.getElementById("addCategory").value;
      const newIsbn = document.getElementById("addIsbn").value;
      const newQuantity = document.getElementById("addQuantity").value;

      const tableBody = document.querySelector("#booksTable tbody");
      if (!tableBody) {
        console.warn("Books table not found");
        return;
      }

      const newRow = tableBody.insertRow();
      newRow.classList.add("fade-in");
      newRow.style.animationDelay = `${tableBody.rows.length * 0.1}s`;

      newRow.innerHTML = `
      <td>${tableBody.rows.length + 1}</td>
      <td>${newTitle}</td>
      <td>${newAuthor}</td>
      <td>${newCategory}</td>
      <td>${newIsbn}</td>
      <td>${newQuantity}</td>
      <td>
        <button class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
        <button class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
      </td>
    `;

      document.getElementById("addBookForm").reset();
      addBookModal.style.display = "none";
      showToast("Book added successfully!", "success");

      addEditDeleteListeners(newRow);
    });

  // Edit/Delete Logic
  function addEditDeleteListeners(row) {
    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    editBtn?.addEventListener("click", () => {
      currentBookRow = row;
      document.getElementById("editTitle").value = row.children[1].textContent;
      document.getElementById("editAuthor").value = row.children[2].textContent;
      document.getElementById("editCategory").value =
        row.children[3].textContent;
      document.getElementById("editIsbn").value = row.children[4].textContent;
      document.getElementById("editQuantity").value =
        row.children[5].textContent;

      editBookModal.style.display = "block";
      editBookModal.classList.add("show");
    });

    deleteBtn?.addEventListener("click", () => {
      currentBookRow = row;
      deleteBookModal.style.display = "block";
      deleteBookModal.classList.add("show");
    });
  }

  // Attach to existing rows
  document.querySelectorAll("#booksTable tbody tr").forEach((row) => {
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
    if (currentBookRow) {
      currentBookRow.classList.add("fade-out");
      setTimeout(() => {
        currentBookRow.remove();
        showToast("Book deleted successfully!", "success");
      }, 300);
      deleteBookModal.style.display = "none";
      deleteBookModal.classList.remove("show");
    }
  });

  // Edit Save
  document
    .getElementById("editBookForm")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();

      if (currentBookRow) {
        currentBookRow.children[1].textContent =
          document.getElementById("editTitle").value;
        currentBookRow.children[2].textContent =
          document.getElementById("editAuthor").value;
        currentBookRow.children[3].textContent =
          document.getElementById("editCategory").value;
        currentBookRow.children[4].textContent =
          document.getElementById("editIsbn").value;
        currentBookRow.children[5].textContent =
          document.getElementById("editQuantity").value;

        editBookModal.style.display = "none";
        editBookModal.classList.remove("show");
        showToast("Book updated successfully!", "success");
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
    if (event.target === addBookModal) {
      addBookModal.style.display = "none";
      addBookModal.classList.remove("show");
    }
    if (event.target === editBookModal) {
      editBookModal.style.display = "none";
      editBookModal.classList.remove("show");
    }
    if (event.target === deleteBookModal) {
      deleteBookModal.style.display = "none";
      deleteBookModal.classList.remove("show");
    }
  });
}

// Expose to router
window.initBooks = initBooks;
