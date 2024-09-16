/**
 * Adds a new subtask to the edit task popup and updates Firebase.
 */
async function addSubtaskEditTask() {
    const subtaskText = getSubtaskText();
    if (subtaskText === '') return;
    const { taskId, firebaseId } = getTaskIds();
    const newSubtaskId = generateSubtaskId();
    const task = await getTaskByIdToEdit(taskId);
    if (!task) return;
    addNewSubtaskToTask(task, newSubtaskId, subtaskText);
    updateSubtaskList(subtaskText, newSubtaskId, task);
    clearSubtaskInput();
}


/**
 * Gets the subtask text from the input field and trims whitespace.
 * 
 * @returns {string} The trimmed subtask text.
 */
function getSubtaskText() {
    const subtaskInput = document.getElementById('subtask-input-edit');
    return subtaskInput.value.trim();
}


/**
 * Retrieves the task ID and Firebase ID from the edit task popup.
 * 
 * @returns {Object} An object containing the task ID and Firebase ID.
 */
function getTaskIds() {
    const taskDetailsContent = document.getElementById('editTaskDetailsPopup');
    const taskId = taskDetailsContent.dataset.taskId;
    const firebaseId = taskDetailsContent.dataset.firebaseId;
    return { taskId, firebaseId };
}


/**
 * Generates a unique ID for a new subtask.
 * 
 * @returns {string} The generated subtask ID.
 */
function generateSubtaskId() {
    return `-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}


/**
 * Adds a new subtask to the task object.
 * 
 * @param {Object} task - The task object.
 * @param {string} newSubtaskId - The ID of the new subtask.
 * @param {string} subtaskText - The description of the new subtask.
 */
function addNewSubtaskToTask(task, newSubtaskId, subtaskText) {
    task.Subtasks = task.Subtasks || {};
    task.Subtasks[newSubtaskId] = { id: newSubtaskId, description: subtaskText, isChecked: false };
}


/**
 * Updates the subtask list in the UI with the new subtask.
 * 
 * @param {string} subtaskText - The description of the new subtask.
 * @param {string} newSubtaskId - The ID of the new subtask.
 * @param {Object} task - The task object.
 */
function updateSubtaskList(subtaskText, newSubtaskId, task) {
    const subtaskList = document.getElementById('subtask-list-edit');
    subtaskList.appendChild(createSubtaskItemEditTask(subtaskText, newSubtaskId, task));
}


/**
 * Clears the subtask input field and toggles the edit/delete visibility.
 */
function clearSubtaskInput() {
    const subtaskInput = document.getElementById('subtask-input-edit');
    subtaskInput.value = '';
    toggleEditDeleteVisibilityEditTask();
}


/**
 * Creates a new subtask list item element for the edit task popup.
 * 
 * @param {string} subtaskText - The text of the new subtask.
 * @param {string} subtaskId - The unique ID of the new subtask.
 * @param {Object} task - The parent task object.
 * @returns {HTMLElement} The created list item element.
 */
function createSubtaskItemEditTask(subtaskText, subtaskId, task) {
    const li = document.createElement('li');
    li.classList.add('subtask-item');
    li.classList.add('sub-hover');
    li.dataset.subtaskId = subtaskId;
    li.innerHTML = `<span>•</span>
        <div class="subtask-text" ondblclick="editSubtaskEditTask(this, '${subtaskText}')">${subtaskText}</div>
        <div class="edit-delete-icons-edit" style="display: flex;">
            <img src="./assets/icons/edit.svg" alt="Edit" onclick="editSubtaskEditTask(this, '${subtaskText}')">
            <div class="vertical-line"></div>
            <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteSubtaskEditTask(this, '${task.firebaseId}', '${subtaskId}')">
        </div>
    `;
    return li;
}


/**
 * Resets the subtask input field in the edit task popup to an empty string.
 */
function resetSubtaskInputEditTask() {
    const subtaskInput = document.getElementById('subtask-input-edit');
    subtaskInput.value = '';
    toggleEditDeleteVisibilityEditTask();
}


/**
 * Toggles the visibility of the edit/delete icons and the add button for subtasks in the edit task popup.
 */
function toggleEditDeleteVisibilityEditTask() {
    const subtaskInput = document.getElementById('subtask-input-edit');
    const editDelete = subtaskInput.nextElementSibling;
    const addTask = editDelete.nextElementSibling;
    if (subtaskInput.value.trim() !== '') {
        editDelete.style.display = 'flex';
        addTask.style.display = 'none';
    } else {
        editDelete.style.display = 'none';
        addTask.style.display = 'flex';
    }
}


/**
 * Handles the Enter key press in the subtask input field, adding a new subtask.
 *
 * @param {Event} event - The keyboard event.
 * @param {function} callback - The function to call when Enter is pressed (e.g., addSubtask).
 */
function handleEnterKey(event, callback) {
    if (event.key === 'Enter') {
        event.preventDefault();
        callback();
    }
}