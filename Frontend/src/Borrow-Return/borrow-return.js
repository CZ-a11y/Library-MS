document.addEventListener("DOMContentLoaded", function () {
  const borrowReturnForm = document.getElementById("borrowReturnForm");

  borrowReturnForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const member = document.getElementById("member").value;
    const book = document.getElementById("book").value;
    const action = document.getElementById("action").value;
    const dueDate = document.getElementById("dueDate").value;

    // Get the selected member and book names
    const memberName =
      document.getElementById("member").options[
        document.getElementById("member").selectedIndex
      ].text;
    const bookName =
      document.getElementById("book").options[
        document.getElementById("book").selectedIndex
      ].text;

    // Add new transaction to the table
    const tableBody = document.querySelector(".recent-transactions tbody");
    const newRow = tableBody.insertRow();

    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);
    const cell5 = newRow.insertCell(4);
    const cell6 = newRow.insertCell(5);
    const cell7 = newRow.insertCell(6);

    cell1.textContent = tableBody.rows.length + 1;
    cell2.textContent = memberName;
    cell3.textContent = bookName;
    cell4.textContent = action.charAt(0).toUpperCase() + action.slice(1);
    cell5.textContent = new Date().toISOString().split("T")[0];
    cell6.textContent = dueDate;
    cell7.innerHTML =
      action === "borrow"
        ? '<span class="status active">Active</span>'
        : '<span class="status returned">Returned</span>';

    // Reset form
    borrowReturnForm.reset();
    alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} transaction added successfully.`,
    );
  });
});
