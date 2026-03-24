function initBorrowReturn() {
  console.log("Borrow/Return page initialized");

  const borrowReturnForm = document.getElementById("borrowReturnForm");

  // ✅ Prevent crash if form is missing
  if (!borrowReturnForm) {
    console.warn("borrowReturnForm not found");
    return;
  }

  borrowReturnForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const memberSelect = document.getElementById("member");
    const bookSelect = document.getElementById("book");
    const action = document.getElementById("action").value;
    const dueDate = document.getElementById("dueDate").value;

    const memberName = memberSelect.options[memberSelect.selectedIndex].text;

    const bookName = bookSelect.options[bookSelect.selectedIndex].text;

    const tableBody = document.querySelector(".recent-transactions tbody");

    if (!tableBody) {
      console.warn("Transactions table not found");
      return;
    }

    const newRow = tableBody.insertRow();

    newRow.innerHTML = `
      <td>${tableBody.rows.length}</td>
      <td>${memberName}</td>
      <td>${bookName}</td>
      <td>${action.charAt(0).toUpperCase() + action.slice(1)}</td>
      <td>${new Date().toISOString().split("T")[0]}</td>
      <td>${dueDate}</td>
      <td>
        ${
          action === "borrow"
            ? '<span class="status active">Active</span>'
            : '<span class="status returned">Returned</span>'
        }
      </td>
    `;

    borrowReturnForm.reset();

    alert(
      `${
        action.charAt(0).toUpperCase() + action.slice(1)
      } transaction added successfully.`,
    );
  });
}

// 🔥 REQUIRED for router
window.initBorrowReturn = initBorrowReturn;
