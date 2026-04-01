function initBooks() {
  // Check if LibraryAPI is available
  if (typeof LibraryAPI === "undefined") {
    console.warn("LibraryAPI not yet available, retrying...");
    setTimeout(initBooks, 200);
    return;
  }

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
  const booksTable = document.getElementById("booksTable");
  const searchInput = document.getElementById("searchInput");

  let currentBookId = null;
  let currentBookRow = null;
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

  // Search functionality with debounce
  searchInput?.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const searchTerm = searchInput.value.trim();
      try {
        let books;
        if (searchTerm) {
          books = await LibraryAPI.request(
            `/books?search=${encodeURIComponent(searchTerm)}`,
          );
        } else {
          books = await LibraryAPI.request("/books");
        }
        renderBooks(books);
      } catch (error) {
        console.error("Error searching books:", error);
        showToast(error.message || "Failed to search books", "error");
      }
    }, 300); // 300ms debounce delay
  });

  // Load books from API
  async function loadBooks() {
    try {
      const books = await LibraryAPI.request("/books");
      renderBooks(books);
    } catch (error) {
      console.error("Error loading books:", error);
      showToast(error.message || "Failed to load books", "error");
    }
  }

  // Render books to table
  function renderBooks(books) {
    const tableBody = booksTable.querySelector("tbody");
    if (!tableBody) return;

    // Clear existing rows
    tableBody.innerHTML = "";

    // Add each book as a row
    books.forEach((book) => {
      const row = tableBody.insertRow();
      row.innerHTML = `
        <td>${book.id}</td>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.category}</td>
        <td>${book.isbn}</td>
        <td>${book.quantity}</td>
        <td>
          <button class="edit-btn" data-id="${book.id}"><i class="fas fa-edit"></i> Edit</button>
          <button class="delete-btn" data-id="${book.id}"><i class="fas fa-trash"></i> Delete</button>
        </td>
      `;
    });

    // Add event listeners to all edit/delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", handleEdit);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", handleDelete);
    });
  }

  // Add Book
  addBookBtn.addEventListener("click", () => {
    // Reset form
    document.getElementById("addBookForm").reset();
    addBookModal.style.display = "block";
    addBookModal.classList.add("show");
  });

  // Export to PDF with proper jsPDF check
  exportBtn.addEventListener("click", () => {
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
      doc.text("BookNest - Book List", 105, 15, { align: "center" });

      // Get current date for footer
      const currentDate = new Date().toLocaleDateString();

      // Table headers
      const headers = ["ID", "Title", "Author", "Category", "ISBN", "Quantity"];

      // Table data - get from the current table
      const rows = [];
      document.querySelectorAll("#booksTable tbody tr").forEach((row) => {
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
          `Page ${i} of ${pageCount} | Exported on ${currentDate}`,
          105,
          200,
          { align: "center" },
        );
      }

      // Save the PDF
      doc.save(
        `BookNest_BookList_${new Date().toISOString().split("T")[0]}.pdf`,
      );
      showToast("Book list exported to PDF successfully!", "success");
    } catch (error) {
      console.error("Error in exportToPDF:", error);
      showToast("Failed to export PDF: " + error.message, "error");
    }
  }

  // Add Book Form Submission
  document
    .getElementById("addBookForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const newBook = {
        title: document.getElementById("addTitle").value,
        author: document.getElementById("addAuthor").value,
        category: document.getElementById("addCategory").value,
        isbn: document.getElementById("addIsbn").value,
        quantity: parseInt(document.getElementById("addQuantity").value),
      };

      try {
        await LibraryAPI.request("/books", "POST", newBook);
        showToast("Book added successfully!", "success");

        // Reset form and close modal
        document.getElementById("addBookForm").reset();
        addBookModal.style.display = "none";
        addBookModal.classList.remove("show");

        // Refresh the book list
        loadBooks();
      } catch (error) {
        console.error("Error adding book:", error);
        showToast(error.message || "Failed to add book", "error");
      }
    });

  // Edit Book
  function handleEdit(event) {
    currentBookId = event.currentTarget.getAttribute("data-id");
    currentBookRow = event.currentTarget.closest("tr");

    // Get the book data from API
    getBookDetails(currentBookId);
  }

  async function getBookDetails(bookId) {
    try {
      const book = await LibraryAPI.request(`/books/${bookId}`);

      // Populate edit form
      document.getElementById("editTitle").value = book.title;
      document.getElementById("editAuthor").value = book.author;
      document.getElementById("editCategory").value = book.category;
      document.getElementById("editIsbn").value = book.isbn;
      document.getElementById("editQuantity").value = book.quantity;

      editBookModal.style.display = "block";
      editBookModal.classList.add("show");
    } catch (error) {
      console.error("Error getting book details:", error);
      showToast(error.message || "Failed to get book details", "error");
    }
  }

  // Delete Book
  function handleDelete(event) {
    currentBookId = event.currentTarget.getAttribute("data-id");
    currentBookRow = event.currentTarget.closest("tr");

    deleteBookModal.style.display = "block";
    deleteBookModal.classList.add("show");
  }

  // Edit Save
  document
    .getElementById("editBookForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const updatedBook = {
        title: document.getElementById("editTitle").value,
        author: document.getElementById("editAuthor").value,
        category: document.getElementById("editCategory").value,
        isbn: document.getElementById("editIsbn").value,
        quantity: parseInt(document.getElementById("editQuantity").value),
      };

      try {
        await LibraryAPI.request(`/books/${currentBookId}`, "PUT", updatedBook);
        showToast("Book updated successfully!", "success");

        // Close modal
        editBookModal.style.display = "none";
        editBookModal.classList.remove("show");

        // Refresh the book list
        loadBooks();
      } catch (error) {
        console.error("Error updating book:", error);
        showToast(error.message || "Failed to update book", "error");
      }
    });

  // Delete Confirm
  confirmDeleteBtn.addEventListener("click", async () => {
    try {
      await LibraryAPI.request(`/books/${currentBookId}`, "DELETE");
      showToast("Book deleted successfully!", "success");

      // Close modal
      deleteBookModal.style.display = "none";
      deleteBookModal.classList.remove("show");

      // Refresh the book list
      loadBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      showToast(error.message || "Failed to delete book", "error");
    }
  });

  // Close Modals
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".modal").style.display = "none";
      btn.closest(".modal").classList.remove("show");
    });
  });

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

  // Toast Notification
  function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // Load books when page initializes
  loadBooks();
}

// Expose to router
window.initBooks = initBooks;
