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


function getSubtaskText() {
    const subtaskInput = document.getElementById('subtask-input-edit');
    return subtaskInput.value.trim();
}


function getTaskIds() {
    const taskDetailsContent = document.getElementById('editTaskDetailsPopup');
    const taskId = taskDetailsContent.dataset.taskId;
    const firebaseId = taskDetailsContent.dataset.firebaseId;
    return { taskId, firebaseId };
}


function generateSubtaskId() {
    return `-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}


function addNewSubtaskToTask(task, newSubtaskId, subtaskText) {
    task.Subtasks = task.Subtasks || {};
    task.Subtasks[newSubtaskId] = { id: newSubtaskId, description: subtaskText, isChecked: false };
}


function updateSubtaskList(subtaskText, newSubtaskId, task) {
    const subtaskList = document.getElementById('subtask-list-edit');
    subtaskList.appendChild(createSubtaskItemEditTask(subtaskText, newSubtaskId, task));
}


function clearSubtaskInput() {
    const subtaskInput = document.getElementById('subtask-input-edit');
    subtaskInput.value = '';
    toggleEditDeleteVisibilityEditTask();
}


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


function resetSubtaskInputEditTask() {
    const subtaskInput = document.getElementById('subtask-input-edit');
    subtaskInput.value = '';
    toggleEditDeleteVisibilityEditTask();
}


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


function handleEnterKey(event, callback) {
    if (event.key === 'Enter') {
        event.preventDefault();
        callback();
    }
}
