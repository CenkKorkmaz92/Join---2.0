let subtasksToDelete = [];


async function editTask(taskId) {
    const task = await fetchTaskData(taskId);
    if (!task) return;
    clearPopupContent();
    renderEditPopup(task);
    populateEditForm(task);
    selectedContactsDataEdit = { ...task.Assigned_to };
    await populateContactList(task);
    setupContactListListeners();
    setupSubtaskInputListener();
    setupEditFormListeners();
}


async function fetchTaskData(taskId) {
    const task = await getTaskByIdToEdit(taskId);
    if (!task) {
        console.error('Task not found!');
        return null;
    }
    return task;
}


function clearPopupContent() {
    document.getElementById('taskDetailsPopup').innerHTML = '';
}


function renderEditPopup(task) {
    const editTaskPopupHTML = `
        <div id="editTaskDetailsPopup" class="task-details-content edit-task-details-content" 
             data-task-id="${task.id}" 
             data-firebase-id="${task.firebaseId}"> 
            <img src="./assets/icons/close-contact.svg" alt="Close" class="close-popup-edit-button" onclick="closeTaskDetailsPopup()">
            ${generateEditTaskFormHTML(task)}
        </div>
    `;
    document.getElementById('taskDetailsPopup').innerHTML = editTaskPopupHTML;
}


function populateEditForm(task) {
    document.getElementById('editTitle').value = task.Title;
    document.getElementById('editDescription').value = task.Description;
    document.getElementById('editDueDate').value = task.Due_date;
    setPrio(task.Prio);
}


async function populateContactList(task) {
    const contactList = document.getElementById("contact-list-edit");
    try {
        const contactsData = await getData("contacts");
        if (contactsData) {
            const firebaseContacts = Object.values(contactsData);
            const assignedContacts = task.Assigned_to && typeof task.Assigned_to === 'object'
                ? Object.values(task.Assigned_to)
                : [];
            firebaseContacts.forEach(contact =>
                createContactItemEdit(contact, contactList, assignedContacts)
            );
            updateSelectedContactsEdit();
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}


function setupContactListListeners() {
    const contactList = document.getElementById("contact-list-edit");
    const contactSearch = document.getElementById("contact-search-edit");
    contactSearch.addEventListener("input", filterContactsEdit);
    contactList.addEventListener("click", (event) => {
        const contactItem = event.target.closest(".contact-item");
        if (contactItem) {
            const checkbox = contactItem.querySelector(".contact-checkbox");
            checkbox.classList.toggle("checked");
            contactItem.classList.toggle("checked");
            updateSelectedContactsEdit();
        }
    });
}


function setupSubtaskInputListener() {
    document.getElementById('subtask-input-edit').addEventListener('keydown', (event) => {
        handleEnterKey(event, addSubtaskEditTask);
    });
}


function setupEditFormListeners() {
    document.addEventListener('DOMContentLoaded', (event) => {
        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.addEventListener('input', (event) => {
                if (event.target.matches('#editTitle, #editDescription, #editDueDate')) {
                    handleInputEdit(event);
                }
            });
        } else {
            console.error("Element with ID 'editForm' not found!");
        }
    });
}


function setPrio(level) {
    const buttons = document.querySelectorAll('.prio-btn');
    buttons.forEach(button => resetBtnsStyles(button));
    const activeButton = document.getElementById(`${level}-btn`);
    activeButton.classList.add(level);
    activeButton.querySelector('img').src = `./assets/icons/${level}White.svg`;
    activeButton.classList.add('selected');
    currentPriority = level;
}


function resetBtnsStyles(button) {
    button.classList.remove('selected');
    button.classList.remove('urgent', 'medium', 'low');
    const img = button.querySelector('img');
    switch (button.id) {
        case 'urgent-btn':
            img.src = './assets/icons/urgent.svg';
            break;
        case 'medium-btn':
            img.src = './assets/icons/medium.svg';
            break;
        case 'low-btn':
            img.src = './assets/icons/low.svg';
            break;
    }
}


document.addEventListener('DOMContentLoaded', (event) => {
    document.body.addEventListener('submit', function (event) {
        if (event.target.id === 'editForm') {
            event.preventDefault();
        }
    });
});


function populateEditForm(task) {
    document.getElementById('editTitle').value = task.Title;
    document.getElementById('editDescription').value = task.Description;
    document.getElementById('editDueDate').value = task.Due_date;
    setPrio(task.Prio);
}


async function saveEditTask(taskId, firebaseId) {
    if (!validateFieldsEditTask()) return;
    const originalTask = await fetchOriginalTask(taskId);
    if (!originalTask || !validateSubtasks(originalTask)) return;
    const updatedTask = createUpdatedTask(originalTask);
    await updateTaskInFirebase(firebaseId, updatedTask);
    if (subtasksToDelete.length > 0) {
        for (const subtaskId of subtasksToDelete) {
            try {
                await deleteData(`tasks/${firebaseId}/Subtasks/${subtaskId}`);
            } catch (error) {
                console.error(`Error deleting subtask ${subtaskId}:`, error);
            }
        }
        subtasksToDelete = [];
    }
    closeTaskDetailsPopup();
    updateBoard();
}


async function fetchOriginalTask(taskId) {
    const originalTask = await getTaskByIdToEdit(taskId);
    if (!originalTask) {
        console.error('Task not found!');
        return null;
    }
    return originalTask;
}


function validateSubtasks(originalTask) {
    const subtasks = getSubtasksEditTask(originalTask);
    for (const subtaskId in subtasks) {
        if (subtasks[subtaskId].description.trim() === '') {
            highlightEmptySubtask(subtaskId);
            return false;
        }
    }
    return true;
}


function highlightEmptySubtask(subtaskId) {
    const subtaskItem = document.querySelector(`.subtask-item[data-subtask-id="${subtaskId}"]`);
    const subtaskInput = subtaskItem.querySelector('.input-field-editing');
    subtaskInput.style.borderBottom = '2px solid rgb(255, 129, 144)';
}


function createUpdatedTask(originalTask) {
    const updatedTask = { ...originalTask };
    updatedTask.Title = document.getElementById('editTitle').value;
    updatedTask.Description = document.getElementById('editDescription').value;
    updatedTask.Due_date = document.getElementById('editDueDate').value;
    updatedTask.Prio = currentPriority;
    updatedTask.Assigned_to = Object.keys(selectedContactsDataEdit).length > 0
        ? { ...selectedContactsDataEdit }
        : {};
    updatedTask.Subtasks = getSubtasksEditTask(originalTask);
    return updatedTask;
}


async function updateTaskInFirebase(firebaseId, updatedTask) {
    try {
        await putData(`tasks/${firebaseId}`, updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
    }
}


function validateDueDateEdit(editDueDate) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(editDueDate)) {
        return 'Please enter a valid date in YYYY-MM-DD format.';
    }
    const today = new Date();
    const selectedDate = new Date(editDueDate);
    if (selectedDate <= today) {
        return 'Please enter a future date.';
    }
    return '';
}


function validateFieldsEditTask() {
    return validateEditTitle() && validateEditDueDate();
}


function validateEditDueDate() {
    let isValid = true;
    const dueDateInput = document.getElementById('editDueDate');
    if (dueDateInput.value.trim() === "") {
        dueDateInput.style.border = '1px solid rgba(255, 129, 144, 1)';
        showErrorMessage(dueDateInput, 'This field is required');
        isValid = false;
    } else {
        const errorMessage = validateDueDateEdit(dueDateInput.value);
        if (errorMessage) {
            dueDateInput.style.border = '1px solid rgba(255, 129, 144, 1)';
            showErrorMessage(dueDateInput, errorMessage);
            isValid = false;
        } else {
            dueDateInput.style.border = '1px solid rgba(41, 171, 226, 1)';
            removeErrorMessage(dueDateInput);
        }
    }
    return isValid;
}
