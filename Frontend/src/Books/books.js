document.addEventListener("DOMContentLoaded", function () {
  const editButtons = document.querySelectorAll(".edit-btn");
  const deleteButtons = document.querySelectorAll(".delete-btn");
  const addBookBtn = document.querySelector(".add-book-btn");

  const addBookModal = document.getElementById("addBookModal");
  const editBookModal = document.getElementById("editBookModal");
  const deleteBookModal = document.getElementById("deleteBookModal");
  const closeButtons = document.querySelectorAll(".close");
  const confirmDeleteBtn = document.getElementById("confirmDelete");

  let currentBookRow = null;

  // Add Book Button Event Listener
  addBookBtn.addEventListener("click", function () {
    addBookModal.style.display = "block";
  });

  // Add Book Form Submission
  document
    .getElementById("addBookForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const newTitle = document.getElementById("addTitle").value;
      const newAuthor = document.getElementById("addAuthor").value;
      const newCategory = document.getElementById("addCategory").value;
      const newIsbn = document.getElementById("addIsbn").value;
      const newQuantity = document.getElementById("addQuantity").value;

      // Add new book to the table
      const tableBody = document.querySelector(".books-table tbody");
      const newRow = tableBody.insertRow();

      const cell1 = newRow.insertCell(0);
      const cell2 = newRow.insertCell(1);
      const cell3 = newRow.insertCell(2);
      const cell4 = newRow.insertCell(3);
      const cell5 = newRow.insertCell(4);
      const cell6 = newRow.insertCell(5);

      cell1.textContent = tableBody.rows.length + 1;
      cell2.textContent = newTitle;
      cell3.textContent = newAuthor;
      cell4.textContent = newCategory;
      cell5.textContent = newQuantity;
      cell6.innerHTML = `<button class="edit-btn">Edit</button> <button class="delete-btn">Delete</button>`;

      // Reset form and close modal
      document.getElementById("addBookForm").reset();
      addBookModal.style.display = "none";
      alert("Book added successfully.");

      // Add event listeners to new buttons
      addEditDeleteListeners(newRow);
    });

  // Edit Button Event Listeners
  function addEditDeleteListeners(row) {
    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    editBtn.addEventListener("click", function () {
      currentBookRow = row;
      const bookTitle = row.querySelector("td:nth-child(2)").textContent;
      const bookAuthor = row.querySelector("td:nth-child(3)").textContent;
      const bookCategory = row.querySelector("td:nth-child(4)").textContent;
      const bookIsbn = "ISBN" + Math.floor(Math.random() * 1000000000000); // Placeholder
      const bookQuantity = row.querySelector("td:nth-child(5)").textContent;

      document.getElementById("editTitle").value = bookTitle;
      document.getElementById("editAuthor").value = bookAuthor;
      document.getElementById("editCategory").value = bookCategory;
      document.getElementById("editIsbn").value = bookIsbn;
      document.getElementById("editQuantity").value = bookQuantity;

      editBookModal.style.display = "block";
    });

    deleteBtn.addEventListener("click", function () {
      currentBookRow = row;
      deleteBookModal.style.display = "block";
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
      addBookModal.style.display = "none";
      editBookModal.style.display = "none";
      deleteBookModal.style.display = "none";
    });
  });

  // Confirm Delete Button Event Listener
  confirmDeleteBtn.addEventListener("click", function () {
    if (currentBookRow) {
      currentBookRow.remove();
      alert("Book deleted successfully.");
      deleteBookModal.style.display = "none";
    }
  });

  // Save Changes in Edit Modal
  document
    .getElementById("editBookForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      if (currentBookRow) {
        const newTitle = document.getElementById("editTitle").value;
        const newAuthor = document.getElementById("editAuthor").value;
        const newCategory = document.getElementById("editCategory").value;
        const newQuantity = document.getElementById("editQuantity").value;

        currentBookRow.querySelector("td:nth-child(2)").textContent = newTitle;
        currentBookRow.querySelector("td:nth-child(3)").textContent = newAuthor;
        currentBookRow.querySelector("td:nth-child(4)").textContent =
          newCategory;
        currentBookRow.querySelector("td:nth-child(5)").textContent =
          newQuantity;

        editBookModal.style.display = "none";
        alert("Book updated successfully.");
      }
    });
});
