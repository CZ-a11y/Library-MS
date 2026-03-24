function initBooks() {
  console.log("Books page initialized");

  const editButtons = document.querySelectorAll(".edit-btn");
  const deleteButtons = document.querySelectorAll(".delete-btn");
  const addBookBtn = document.querySelector(".add-book-btn");

  const addBookModal = document.getElementById("addBookModal");
  const editBookModal = document.getElementById("editBookModal");
  const deleteBookModal = document.getElementById("deleteBookModal");
  const closeButtons = document.querySelectorAll(".close");
  const confirmDeleteBtn = document.getElementById("confirmDelete");

  let currentBookRow = null;

  // ✅ Prevent crash if elements are missing
  if (!addBookBtn) {
    console.warn("Books elements not found");
    return;
  }

  // --- Add Book ---
  addBookBtn.addEventListener("click", () => {
    addBookModal.style.display = "block";
  });

  document
    .getElementById("addBookForm")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();

      const newTitle = document.getElementById("addTitle").value;
      const newAuthor = document.getElementById("addAuthor").value;
      const newCategory = document.getElementById("addCategory").value;
      const newIsbn = document.getElementById("addIsbn").value;
      const newQuantity = document.getElementById("addQuantity").value;

      const tableBody = document.querySelector(".books-table tbody");
      const newRow = tableBody.insertRow();

      newRow.innerHTML = `
        <td>${tableBody.rows.length}</td>
        <td>${newTitle}</td>
        <td>${newAuthor}</td>
        <td>${newCategory}</td>
        <td>${newQuantity}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;

      document.getElementById("addBookForm").reset();
      addBookModal.style.display = "none";
      alert("Book added successfully.");

      addEditDeleteListeners(newRow);
    });

  // --- Edit/Delete Logic ---
  function addEditDeleteListeners(row) {
    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    editBtn?.addEventListener("click", () => {
      currentBookRow = row;

      document.getElementById("editTitle").value = row.children[1].textContent;
      document.getElementById("editAuthor").value = row.children[2].textContent;
      document.getElementById("editCategory").value =
        row.children[3].textContent;
      document.getElementById("editQuantity").value =
        row.children[4].textContent;

      editBookModal.style.display = "block";
    });

    deleteBtn?.addEventListener("click", () => {
      currentBookRow = row;
      deleteBookModal.style.display = "block";
    });
  }

  // Attach to existing rows
  document.querySelectorAll(".books-table tbody tr").forEach((row) => {
    addEditDeleteListeners(row);
  });

  // --- Close Modals ---
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      addBookModal.style.display = "none";
      editBookModal.style.display = "none";
      deleteBookModal.style.display = "none";
    });
  });

  // --- Delete Confirm ---
  confirmDeleteBtn?.addEventListener("click", () => {
    if (currentBookRow) {
      currentBookRow.remove();
      deleteBookModal.style.display = "none";
      alert("Book deleted successfully.");
    }
  });

  // --- Edit Save ---
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
          document.getElementById("editQuantity").value;

        editBookModal.style.display = "none";
        alert("Book updated successfully.");
      }
    });
}

// 🔥 REQUIRED for router
window.initBooks = initBooks;
