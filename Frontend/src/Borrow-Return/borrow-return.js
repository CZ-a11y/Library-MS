function initBorrowReturn() {
  console.log("Borrow/Return page initialized");

  // Check if LibraryAPI is available
  if (typeof LibraryAPI === "undefined") {
    console.warn("LibraryAPI not yet available, retrying...");
    setTimeout(initBorrowReturn, 200);
    return;
  }

  // DOM Elements
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const borrowReturnForm = document.getElementById("borrowReturnForm");
  const exportBtn = document.getElementById("exportBtn");
  const toast = document.getElementById("toast");
  const transactionsTable = document.getElementById("transactionsTable");
  const searchInput = document.getElementById("searchInput");

  let isProcessing = false;
  let debounceTimer = null;

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

  // Load dropdown data
  async function loadDropdownData() {
    try {
      isProcessing = true;
      const response = await LibraryAPI.request("/transactions/dropdown-data");

      if (!response.success) {
        throw new Error(response.message || "Failed to load dropdown data");
      }

      populateDropdown("member", response.data.members, "name");
      populateDropdown("book", response.data.books, "title");
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      showToast(error.message || "Failed to load dropdown data", "error");
    } finally {
      isProcessing = false;
    }
  }

  // Populate dropdown with data
  function populateDropdown(dropdownId, data, displayField) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    // Clear existing options except the first one
    while (dropdown.options.length > 1) {
      dropdown.remove(1);
    }

    // Add new options
    data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item[displayField];
      dropdown.appendChild(option);
    });
  }

  // Load transactions
  async function loadTransactions() {
    try {
      isProcessing = true;
      const response = await LibraryAPI.request("/transactions");

      if (!response.success) {
        throw new Error(response.message || "Failed to load transactions");
      }

      renderTransactions(response.data || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
      showToast(error.message || "Failed to load transactions", "error");
    } finally {
      isProcessing = false;
    }
  }

  // Render transactions to table
  function renderTransactions(transactions) {
    const tableBody = transactionsTable.querySelector("tbody");
    if (!tableBody) return;

    // Clear existing rows
    tableBody.innerHTML = "";

    // Add each transaction as a row
    transactions.forEach((transaction, index) => {
      const row = tableBody.insertRow();
      row.classList.add("fade-in");
      row.style.animationDelay = `${index * 0.1}s`;

      const transactionDate = transaction.transaction_date
        ? new Date(transaction.transaction_date).toLocaleDateString()
        : "N/A";
      const dueDate = transaction.due_date
        ? new Date(transaction.due_date).toLocaleDateString()
        : "N/A";

      row.innerHTML = `
        <td>${transaction.id}</td>
        <td>${transaction.member_name || "N/A"}</td>
        <td>${transaction.book_title || "N/A"}</td>
        <td>${transaction.action.charAt(0).toUpperCase() + transaction.action.slice(1)}</td>
        <td>${transactionDate}</td>
        <td>${dueDate}</td>
        <td><span class="status ${transaction.status.toLowerCase()}">${transaction.status}</span></td>
      `;
    });
  }

  // Form Submission with backend integration
  borrowReturnForm?.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (isProcessing) return;
    isProcessing = true;

    try {
      const memberSelect = document.getElementById("member");
      const bookSelect = document.getElementById("book");
      const actionSelect = document.getElementById("action");
      const dueDateInput = document.getElementById("dueDate");

      const memberId = memberSelect.value;
      const bookId = bookSelect.value;
      const action = actionSelect.value;
      const dueDate = dueDateInput.value;

      if (!memberId || !bookId || !action || !dueDate) {
        showToast("All fields are required", "error");
        return;
      }

      const transactionData = {
        member_id: memberId,
        book_id: bookId,
        action: action,
        due_date: dueDate,
      };

      const response = await LibraryAPI.request(
        "/transactions",
        "POST",
        transactionData,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to record transaction");
      }

      showToast(
        response.message || "Transaction recorded successfully!",
        "success",
      );
      borrowReturnForm.reset();
      loadTransactions();
    } catch (error) {
      console.error("Error recording transaction:", error);
      showToast(error.message || "Failed to record transaction", "error");
    } finally {
      isProcessing = false;
    }
  });

  // Search functionality with debounce
  searchInput?.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const searchTerm = searchInput.value.trim();
      try {
        let endpoint = "/transactions";
        if (searchTerm) {
          endpoint = `/transactions?search=${encodeURIComponent(searchTerm)}`;
        }

        const response = await LibraryAPI.request(endpoint);

        if (!response.success) {
          throw new Error(response.message || "Failed to search transactions");
        }

        renderTransactions(response.data || []);
      } catch (error) {
        console.error("Error searching transactions:", error);
        showToast(error.message || "Failed to search transactions", "error");
      }
    }, 300);
  });

  // Export to PDF
  exportBtn?.addEventListener("click", exportToPDF);

  function exportToPDF() {
    if (!window.jsPDF || !window.jsPDFReady) {
      showToast("PDF library not loaded. Please refresh the page.", "error");
      return;
    }

    try {
      const doc = new window.jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text("BookNest - Transactions", 105, 15, { align: "center" });

      // Table headers
      const headers = [
        "ID",
        "Member",
        "Book",
        "Action",
        "Date",
        "Due Date",
        "Status",
      ];
      const rows = [];

      // Extract table data
      document
        .querySelectorAll("#transactionsTable tbody tr")
        .forEach((row) => {
          const rowData = [
            row.cells[0].textContent,
            row.cells[1].textContent,
            row.cells[2].textContent,
            row.cells[3].textContent,
            row.cells[4].textContent,
            row.cells[5].textContent,
            row.cells[6].textContent,
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
      const currentDate = new Date().toLocaleDateString();

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
        `BookNest_Transactions_${new Date().toISOString().split("T")[0]}.pdf`,
      );
      showToast("Transactions exported to PDF successfully!", "success");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      showToast("Failed to export PDF: " + error.message, "error");
    }
  }

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

  // Initialize the page
  loadDropdownData();
  loadTransactions();
}

// Expose to router
window.initBorrowReturn = initBorrowReturn;
