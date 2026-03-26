function initBorrowReturn() {
  console.log("Borrow/Return page initialized");

  // DOM Elements
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const borrowReturnForm = document.getElementById("borrowReturnForm");
  const exportBtn = document.getElementById("exportBtn");
  const toast = document.getElementById("toast");

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

  // Form Submission
  borrowReturnForm?.addEventListener("submit", function (event) {
    event.preventDefault();

    const memberSelect = document.getElementById("member");
    const bookSelect = document.getElementById("book");
    const action = document.getElementById("action").value;
    const dueDate = document.getElementById("dueDate").value;

    const memberName = memberSelect.options[memberSelect.selectedIndex].text;
    const bookName = bookSelect.options[bookSelect.selectedIndex].text;

    const tableBody = document.querySelector("#transactionsTable tbody");
    if (!tableBody) {
      console.warn("Transactions table not found");
      return;
    }

    const newRow = tableBody.insertRow();
    newRow.classList.add("fade-in");
    newRow.style.animationDelay = `${tableBody.rows.length * 0.1}s`;

    newRow.innerHTML = `
      <td>${tableBody.rows.length + 1}</td>
      <td>${memberName}</td>
      <td>${bookName}</td>
      <td>${action.charAt(0).toUpperCase() + action.slice(1)}</td>
      <td>${new Date().toISOString().split("T")[0]}</td>
      <td>${dueDate}</td>
      <td>
        ${action === "borrow" ? '<span class="status active">Active</span>' : '<span class="status returned">Returned</span>'}
      </td>
    `;

    borrowReturnForm.reset();
    showToast("Transaction recorded successfully!", "success");
  });

  // Export to PDF
  exportBtn?.addEventListener("click", exportToPDF);

  function exportToPDF() {
    const doc = new jsPDF();

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
      .forEach((row, index) => {
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
      `BookNest_Transactions_${new Date().toISOString().split("T")[0]}.pdf`,
    );
    showToast("Transactions exported to PDF successfully!", "success");
  }

  // Toast Notification
  function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}

// Expose to router
window.initBorrowReturn = initBorrowReturn;
