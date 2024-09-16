/**
 * Creates a new subtask item represented as an <li> element.
 * The subtask has editable text and delete options which are hidden initially.
 *
 * @param {string} subtaskText - The text content of the subtask to be added.
 * @returns {HTMLElement} The created <li> element containing the subtask HTML.
 */
function createSubtaskItem(subtaskText) {
  const li = document.createElement('li');
  li.className = 'subtask-item';
  li.innerHTML = `
      <div ondblclick="editSubtask(this)" class="subtask-text"><li>${subtaskText}</li></div>
      <div class="edit-delete-icons" style="display: none;">
        <img src="./assets/icons/edit.svg" alt="Edit" onclick="editSubtask(this)">
        <div class="vertical-line"></div>
        <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteSubtask(this)">
      </div>
    `;
  return li;
}

/**
 * Generates the HTML for editing a subtask.
 * This HTML includes an input field for editing the subtask text and icons for saving or deleting.
 *
 * @param {string} subtaskText - The current text of the subtask to be edited.
 * @returns {string} HTML string that represents the editable subtask.
 */
function generateEditSubtaskHTML(subtaskText) {
  return `
      <div class="subtask-content">
        <div class="edit-div">
          <input type="text" class="input-field-editing" value="${subtaskText}">
          <div class="edit-delete">
            <img src="./assets/icons/done.svg" alt="Done" onclick="saveSubtask(this)">
            <div class="vertical-line"></div>
            <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteSubtask(this)">
          </div>
        </div>
      </div>
    `;
}

/**
 * Generates the HTML for displaying a saved subtask.
 * This HTML shows the subtask text, along with hidden edit and delete options.
 * 
 * @param {string} newText - The updated text content of the subtask.
 * @returns {string} HTML string representing the saved subtask.
 */
function generateSavedSubtaskHTML(newText) {
  return `
      <div ondblclick="editSubtask(this)" class="subtask-text"><li>${newText}</li></div>
      <div class="edit-delete-icons" style="display: none;">
        <img src="./assets/icons/edit.svg" alt="Edit" onclick="editSubtask(this)">
        <div class="vertical-line"></div>
        <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteSubtask(this)">
      </div>
    `;
}
