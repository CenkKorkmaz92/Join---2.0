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
        <div id="editTaskDetailsPopup" class="task-details-content" 
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
        } else {
            console.log("No contacts found in Firebase.");
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}


function setupContactListListeners() {
    const contactSearch = document.getElementById("contact-search-edit");
    contactSearch.addEventListener("input", filterContactsEdit);

    document.getElementById("contact-list-edit").addEventListener("click", (event) => {
        const contactItem = event.target.closest(".contact-item");
        if (contactItem) {
            const checkbox = contactItem.querySelector(".contact-checkbox");
            checkbox.classList.toggle("checked");
            contactItem.classList.toggle("checked");
            updateSelectedContactsEdit();
        }
    });

    document.querySelectorAll(".contact-checkbox").forEach(checkbox => {
        checkbox.addEventListener("click", (event) => {
            checkbox.classList.toggle("checked");
            checkbox.parentElement.classList.toggle("checked");
            updateSelectedContacts();
        });
    });

    const contactListEdit = document.getElementById("contact-list-edit");
    contactListEdit.addEventListener("click", handleContactCheckboxClickEdit);
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
    console.log('Error: Subtask description cannot be empty.');
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
        console.log('Task updated successfully!');
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
    let isValid = true;
    const EditFields = [
        { id: 'editTitle', element: document.getElementById('editTitle') },
        { id: 'editDueDate', element: document.getElementById('editDueDate') }
    ];

    const fieldsToValidateEdit = EditFields.filter(field => field.id !== 'category');

    fieldsToValidateEdit.forEach(field => {
        if (field.element.value.trim() === "") {
            (field.fieldElement || field.element).style.border = '1px solid rgba(255, 129, 144, 1)';
            showErrorMessage(field.element, 'This field is required');
            isValid = false;
        } else if (field.id === 'editDueDate') {
            const errorMessage = validateDueDateEdit(field.element.value);
            if (errorMessage) {
                field.element.style.border = '1px solid rgba(255, 129, 144, 1)';
                showErrorMessage(field.element, errorMessage);
                isValid = false;
            }
        } else {
            (field.fieldElement || field.element).style.border = '1px solid rgba(41, 171, 226, 1)';
            removeErrorMessage(field.element);
        }
    });

    return isValid;
}


function handleInputEdit(event) {
    const field = event.target;
    if (field.value.trim() !== "") {
        field.style.border = '1px solid rgba(41, 171, 226, 1)';
        removeErrorMessage(field);
    }
}


function handleBlurEdit(event) {
    const field = event.target;
    if (field.value.trim() !== "") {
        field.style.border = '1px solid rgba(209, 209, 209, 1)';
    } else {
        if (field.id !== 'editDescription') {
            field.style.border = '1px solid rgba(255, 129, 144, 1)';
            showErrorMessage(field, 'This field is required');
        } else {
            field.style.border = '1px solid rgba(209, 209, 209, 1)';
            removeErrorMessage(field);
        }
    }

}


function toggleContactListEdit() {
    const contactList = document.getElementById("contact-list-edit");
    const contactSearch = document.getElementById("contact-search-edit");
    const selectedContacts = document.getElementById("selected-contacts-edit");
    const toggleButton = document.getElementById("toggle-list-edit");
    const dropdownIcon = toggleButton.querySelector(".dropdown-icon");
    contactList.classList.toggle("hidden");
    contactSearch.style.borderRadius = contactList.classList.contains("hidden") ? "10px" : "10px 10px 0 0";
    dropdownIcon.src = contactList.classList.contains("hidden") ? "./assets/icons/arrow_drop_down.svg" : "./assets/icons/arrow_drop_up.svg";
    selectedContacts.style.display = contactList.classList.contains("hidden") ? "flex" : "none";
    if (contactList.classList.contains("hidden")) {
        document.removeEventListener('click', closeContactListOnClickOutsideEdit);
        contactSearch.value = '';
    } else {
        document.addEventListener('click', closeContactListOnClickOutsideEdit);
    }
}


function filterContactsEdit() {
    const searchTerm = document.getElementById("contact-search-edit").value.toLowerCase();
    const contactItems = document.querySelectorAll("#contact-list-edit .contact-item");
    contactItems.forEach(item => {
        const name = item.textContent.toLowerCase();
        item.style.display = name.includes(searchTerm) ? "" : "none";
    });

    const contactList = document.getElementById("contact-list-edit");
    const isListOpen = !contactList.classList.contains("hidden");
    if (!isListOpen) {
        toggleContactListEdit();
    }
}


function closeContactListOnClickOutsideEdit(event) {
    const contactList = document.getElementById("contact-list-edit");
    const contactSearch = document.getElementById("contact-search-edit");
    const toggleButton = document.getElementById("toggle-list-edit");
    const selectedContacts = document.getElementById("selected-contacts-edit");

    if (!contactList.contains(event.target) &&
        !contactSearch.contains(event.target) &&
        !toggleButton.contains(event.target)) {
        toggleContactListEdit();
        selectedContacts.style.display = "flex";
        contactSearch.value = '';
    }
}


function displaySelectedContactsEdit(task) {
    let html = '';
    for (const contactId in task.Assigned_to) {
        const contact = task.Assigned_to[contactId];
        const initials = contact.name.split(' ').map(part => part.charAt(0)).join('');
        html += `
            <div class="selected-contact" style="background-color: ${contact.color}" data-contact-id="${contact.id}">
                ${initials}
            </div>
        `;
    }
    return html;
}


function createContactItemEdit(contact, contactList, assignedContacts) {
    const contactItem = document.createElement("div");
    contactItem.classList.add("contact-item");
    const initials = contact.name.split(" ").map(part => part.charAt(0)).join('');
    const isChecked = assignedContacts.some(c => c.id === contact.id);
    contactItem.innerHTML = `
        <div class="contact-logo" style="background-color: ${contact.color};" data-background="${contact.color}">
            ${initials} 
        </div>
        <span>${contact.name}</span>
        <div class="contact-checkbox ${isChecked ? 'checked' : ''}" data-contact-id="${contact.id}"></div> 
    `;
    if (isChecked) {
        contactItem.classList.add("checked");
    }
    contactList.appendChild(contactItem);
}


function updateSelectedContactsEdit() {
    const selectedContactsDiv = document.getElementById("selected-contacts-edit");
    selectedContactsDiv.innerHTML = '';
    const selectedCheckboxes = document.querySelectorAll("#contact-list-edit .contact-checkbox.checked");
    selectedContactsDataEdit = {};
    selectedCheckboxes.forEach(checkbox => {
        const contactId = checkbox.dataset.contactId;
        const contactItem = checkbox.parentElement;
        const logo = contactItem.querySelector(".contact-logo");
        const name = contactItem.querySelector("span").textContent;
        const color = logo.style.backgroundColor;
        selectedContactsDataEdit[contactId] = { name, id: contactId, color };
        selectedContactsDiv.innerHTML += `
            <div class="selected-contact" style="background-color: ${color}">
                ${logo.innerText}
            </div>
        `;
    });
}


function getSubtasksEditTask(originalTask) {
    const subtasks = { ...originalTask.Subtasks };
    const subtaskItems = document.querySelectorAll("#subtask-list-edit .subtask-item");

    subtaskItems.forEach(item => {
        const subtaskTextDiv = item.querySelector('.subtask-text');
        const subtaskInput = item.querySelector('.subtask-edit-input');
        const subtaskId = item.dataset.subtaskId;

        const subtaskText = subtaskInput
            ? subtaskInput.value.trim()
            : subtaskTextDiv?.innerText.trim() || '';

        if (originalTask.Subtasks && originalTask.Subtasks[subtaskId]) {

            subtasks[subtaskId].description = subtaskText;
        } else {

            subtasks[subtaskId] = {
                id: subtaskId,
                description: subtaskText,
                isChecked: false
            };
        }
    });

    return subtasks;
}


function handleContactCheckboxClickEdit(event) {
    const checkbox = event.target.closest(".contact-checkbox");
    if (checkbox) {
        checkbox.classList.toggle("checked");
        checkbox.parentElement.classList.toggle("checked");
        updateSelectedContactsEdit();
    }
}


function saveSubtaskEditTask(element) {
    const li = element.closest('li');
    const subtaskInput = li.querySelector('input');
    const newText = subtaskInput.value.trim();
    const originalText = li.dataset.originalText;

    if (newText === '') {
        handleEmptySubtask(li);
        return;
    }
    subtaskInput.style.borderBottom = '';
    li.innerHTML = generateSavedSubtaskHTML(newText, originalText);
}


function handleEmptySubtask(li) {
    if (!li.dataset.subtaskId) {
        li.remove();
        console.log('New subtask removed because it was empty.');
    } else {
        const subtaskInput = li.querySelector('input');
        subtaskInput.style.borderBottom = '2px solid rgb(255, 129, 144)';
        console.log('Error: Subtask description cannot be empty.');
    }
}


async function updateSubtaskInFirebase(li, newText) {
    const taskId = document.getElementById('editTaskDetailsPopup').dataset.taskId;
    const firebaseId = document.getElementById('editTaskDetailsPopup').dataset.firebaseId;
    const subtaskId = li.dataset.subtaskId;
    const task = await getTaskByIdToEdit(taskId);
    if (!task || !task.Subtasks || !task.Subtasks[subtaskId]) return;
    task.Subtasks[subtaskId].description = newText;
    try {
        await putData(`tasks/${firebaseId}`, task);
        console.log('Subtask updated successfully!');
    } catch (error) {
        console.error('Error updating subtask in Firebase:', error);
    }
}


function editSubtaskEditTask(element, originalText) {
    const li = element.closest('li');

    li.dataset.originalText = originalText;

    li.innerHTML = generateEditSubtaskHTMLEditTask(originalText);
    const subtaskInput = li.querySelector('input');
    subtaskInput.focus();
}


async function deleteSubtaskEditTask(element) {
    const listItem = element.closest('.subtask-item');
    const subtaskId = listItem.dataset.subtaskId;

    subtasksToDelete.push(subtaskId);

    listItem.remove();

    console.log('Subtask marked for deletion (will be deleted on save).');
}


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
