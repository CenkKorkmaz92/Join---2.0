let subtasksToDelete = [];


/**
 * Edits the task details within a popup.
 * 
 * @param {string} taskId - The ID of the task to edit.
 */
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


/**
 * Fetches the task data from Firebase.
 * 
 * @param {string} taskId - The ID of the task to fetch.
 * @returns {Promise<Object|null>} A promise that resolves with the task object if found, otherwise null.
 */
async function fetchTaskData(taskId) {
    const task = await getTaskByIdToEdit(taskId);
    if (!task) {
        console.error('Task not found!');
        return null;
    }
    return task;
}


/**
 * Clears the existing content of the task details popup.
 */
function clearPopupContent() {
    document.getElementById('taskDetailsPopup').innerHTML = '';
}


/**
 * Renders the edit task popup with the task data.
 * 
 * @param {Object} task - The task object containing the task details.
 */
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


/**
 * Populates the edit task form with the existing task data.
 * 
 * @param {Object} task - The task object containing the task details.
 */
function populateEditForm(task) {
    document.getElementById('editTitle').value = task.Title;
    document.getElementById('editDescription').value = task.Description;
    document.getElementById('editDueDate').value = task.Due_date;
    setPrio(task.Prio);
}


/**
 * Populates the contact list in the edit popup with contacts from Firebase.
 * 
 * @param {Object} task - The task object containing the assigned contacts.
 */
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


/**
 * Sets up event listeners for the contact list elements in the edit popup.
 */
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


/**
 * Sets up the event listener for the subtask input field in the edit popup.
 */
function setupSubtaskInputListener() {
    document.getElementById('subtask-input-edit').addEventListener('keydown', (event) => {
        handleEnterKey(event, addSubtaskEditTask);
    });
}


/**
 * Sets up event listeners for the edit form elements in the edit popup.
 */
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


/**
 * Sets the priority level for the task.
 *
 * @param {string} level - The priority level ('urgent', 'medium', or 'low').
 */
function setPrio(level) {
    const buttons = document.querySelectorAll('.prio-btn');
    // Reset all buttons first
    buttons.forEach(button => resetBtnsStyles(button));
    // Set the styles for the clicked button
    const activeButton = document.getElementById(`${level}-btn`);
    activeButton.classList.add(level); // Add the level as a class for styling
    activeButton.querySelector('img').src = `./assets/icons/${level}White.svg`;
    // Remove hover effect from the selected button
    activeButton.classList.add('selected');
    // Update the current priority
    currentPriority = level;
}


/**
 * Resets the styles of a priority button to their default state.
 *
 * @param {HTMLElement} button - The priority button to reset.
 */
function resetBtnsStyles(button) {
    button.classList.remove('selected'); // Remove the class when resetting
    button.classList.remove('urgent', 'medium', 'low'); // Remove all priority classes

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
            // Your form submission logic here
        }
    });
});


/**
 * Populates the edit task form with the existing task data.
 * 
 * @param {Object} task - The task object containing the task details.
 */
function populateEditForm(task) {
    document.getElementById('editTitle').value = task.Title;
    document.getElementById('editDescription').value = task.Description;
    document.getElementById('editDueDate').value = task.Due_date;
    setPrio(task.Prio); // Assuming you have a function to set the priority

}


/**
 * Saves the edited task details to Firebase.
 * 
 * @param {string} taskId - The ID of the task to update.
 * @param {string} firebaseId - The Firebase ID of the task to update.
 */
async function saveEditTask(taskId, firebaseId) {
    if (!validateFieldsEditTask()) return;
    const originalTask = await fetchOriginalTask(taskId);
    if (!originalTask || !validateSubtasks(originalTask)) return;

    const updatedTask = createUpdatedTask(originalTask);
    await updateTaskInFirebase(firebaseId, updatedTask);

    // Check if there are subtasks to delete
    if (subtasksToDelete.length > 0) {
        for (const subtaskId of subtasksToDelete) {
            try {
                await deleteData(`tasks/${firebaseId}/Subtasks/${subtaskId}`);
            } catch (error) {
                console.error(`Error deleting subtask ${subtaskId}:`, error);
            }
        }

        subtasksToDelete = []; // Clear the array after deleting
    }
    closeTaskDetailsPopup();
    updateBoard();
}


/**
 * Fetches the original task data from Firebase.
 * 
 * @param {string} taskId - The ID of the task to fetch.
 * @returns {Promise<Object|null>} A promise that resolves with the task object if found, otherwise null.
 */
async function fetchOriginalTask(taskId) {
    const originalTask = await getTaskByIdToEdit(taskId);
    if (!originalTask) {
        console.error('Task not found!');
        return null;
    }
    return originalTask;
}


/**
 * Validates subtask descriptions to ensure they are not empty.
 * 
 * @param {Object} originalTask - The original task object containing the subtasks.
 * @returns {boolean} True if all subtask descriptions are valid, otherwise false.
 */
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


/**
 * Highlights the input field of an empty subtask with a red border.
 * 
 * @param {string} subtaskId - The ID of the subtask with the empty description.
 */
function highlightEmptySubtask(subtaskId) {
    const subtaskItem = document.querySelector(`.subtask-item[data-subtask-id="${subtaskId}"]`);
    const subtaskInput = subtaskItem.querySelector('.input-field-editing');
    subtaskInput.style.borderBottom = '2px solid rgb(255, 129, 144)';
    console.log('Error: Subtask description cannot be empty.');
}


/**
 * Creates an updated task object with the edited values.
 * 
 * @param {Object} originalTask - The original task object.
 * @returns {Object} The updated task object.
 */
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


/**
 * Updates the task in Firebase with the edited data.
 * 
 * @param {string} firebaseId - The Firebase ID of the task to update.
 * @param {Object} updatedTask - The updated task object.
 */
async function updateTaskInFirebase(firebaseId, updatedTask) {
    try {
        await putData(`tasks/${firebaseId}`, updatedTask);
        console.log('Task updated successfully!');
    } catch (error) {
        console.error('Error updating task:', error);
    }
}


// /**
//  * Validates the due date to ensure it's in the correct format (YYYY-MM-DD) and a future date.
//  *
//  * @param {string} dueDate - The due date string to validate.
//  * @returns {string} An error message if the date is invalid, otherwise an empty string.
//  */
function validateDueDateEdit(editDueDate) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/; // Regular expression for YYYY-MM-DD format
    if (!datePattern.test(editDueDate)) {
        return 'Please enter a valid date in YYYY-MM-DD format.';
    }
    const today = new Date();
    const selectedDate = new Date(editDueDate);

    if (selectedDate <= today) {
        return 'Please enter a future date.';
    }

    return ''; // No error
}


function validateFieldsEditTask() {
    let isValid = true;
    const EditFields = [
        { id: 'editTitle', element: document.getElementById('editTitle') },
        { id: 'editDueDate', element: document.getElementById('editDueDate') }
    ];

    // Filter the fields array to exclude the 'category' field
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

// --------------------------------------------------




/**
 * Handles the input event on input fields, resetting the border color and removing error messages.
 *
 * @param {Event} event - The input event.
 */
function handleInputEdit(event) {
    const field = event.target;
    if (field.value.trim() !== "") {
        field.style.border = '1px solid rgba(41, 171, 226, 1)';
        removeErrorMessage(field);
    }
}


/**
 * Handles the blur event on input fields, validating the input and displaying error messages if necessary.
 *
 * @param {Event} event - The blur event.
 */
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


/**
 * Toggles the visibility of the contact list in the edit task popup.
 * Updates the search field border radius, dropdown icon, and selected contacts display.
 * Also manages the event listener for closing the list on outside clicks.
 */
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


/**
 * Filters the contact list based on the search term entered in the contact search field.
 */
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


/**
 * Closes the contact list when the user clicks outside of it.
 *
 * @param {Event} event - The click event.
 */
function closeContactListOnClickOutsideEdit(event) {
    const contactList = document.getElementById("contact-list-edit");
    const contactSearch = document.getElementById("contact-search-edit");
    const toggleButton = document.getElementById("toggle-list-edit");
    const selectedContacts = document.getElementById("selected-contacts-edit");

    if (!contactList.contains(event.target) &&
        !contactSearch.contains(event.target) &&
        !toggleButton.contains(event.target)) {
        toggleContactListEdit(); // Liste schließen
        selectedContacts.style.display = "flex"; // Selected Contacts anzeigen
        contactSearch.value = ''; // Clear the search field
    }
}


/**
 * Generates the HTML for displaying selected contacts in the edit task popup.
 * Iterates through the assigned contacts in the task object and creates HTML
 * for each selected contact, displaying their initials and background color.
 * 
 * @param {Object} task - The task object containing the assigned contacts.
 * @returns {string} The HTML string representing the selected contacts.
 */
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


/**
 * Creates a contact item element for the edit task popup and appends it to the contact list.
 * Checks if the contact is already assigned to the task and sets the checkbox accordingly.
 * 
 * @param {Object} contact - The contact data.
 * @param {HTMLElement} contactList - The contact list element.
 * @param {Array} assignedContacts - An array of assigned contact objects.
 */
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


/**
 * Updates the display of selected contacts in the edit task popup.
 * Clears existing selected contacts, iterates through checked checkboxes,
 * and updates the `selectedContactsDataEdit` object and the display.
 */
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


/**
 * Retrieves the subtasks from the edit task form, including their descriptions and checked status.
 * Prioritizes the text from input fields if a subtask is being edited.
 * 
 * @param {Object} originalTask - The original task object containing the subtasks.
 * @returns {Object} An object containing the updated subtask data.
 */
function getSubtasksEditTask(originalTask) {
    const subtasks = { ...originalTask.Subtasks }; // Start with original subtasks
    const subtaskItems = document.querySelectorAll("#subtask-list-edit .subtask-item");

    subtaskItems.forEach(item => {
        const subtaskTextDiv = item.querySelector('.subtask-text');
        const subtaskInput = item.querySelector('.subtask-edit-input');
        const subtaskId = item.dataset.subtaskId;

        // Get the correct subtask text:
        const subtaskText = subtaskInput
            ? subtaskInput.value.trim()
            : subtaskTextDiv?.innerText.trim() || '';

        // Check if subtaskId exists in originalTask.Subtasks
        if (originalTask.Subtasks && originalTask.Subtasks[subtaskId]) {
            // Update existing subtask
            subtasks[subtaskId].description = subtaskText;
        } else {
            // This is a new subtask, add it to subtasks
            subtasks[subtaskId] = {
                id: subtaskId,
                description: subtaskText,
                isChecked: false // New subtasks start unchecked
            };
        }
    });

    return subtasks;
}


/**
 * Handles the click event on a contact checkbox in the edit task popup.
 * Toggles the "checked" class on the checkbox and its parent contact item,
 * and updates the display of selected contacts.
 * 
 * @param {Event} event - The click event object.
 */
function handleContactCheckboxClickEdit(event) {
    const checkbox = event.target.closest(".contact-checkbox");
    if (checkbox) {
        checkbox.classList.toggle("checked");
        checkbox.parentElement.classList.toggle("checked");
        updateSelectedContactsEdit(); // Call to update selected contacts
    }
}


/**
 * Saves the edited subtask, updating the UI and Firebase.
 * Handles empty subtask descriptions and provides visual error indication.
 * 
 * @param {HTMLElement} element - The element that triggered the save action.
 */
function saveSubtaskEditTask(element) {
    const li = element.closest('li');
    const subtaskInput = li.querySelector('input');
    const newText = subtaskInput.value.trim();
    const originalText = li.dataset.originalText;

    if (newText === '') {
        handleEmptySubtask(li);
        return;
    }
    subtaskInput.style.borderBottom = ''; // Reset border
    li.innerHTML = generateSavedSubtaskHTML(newText, originalText);
    //  updateSubtaskInFirebase(li, newText);

}


/**
 * Handles the case when the subtask description is empty.
 * Removes the subtask if it's new or displays an error message if it's existing.
 * 
 * @param {HTMLElement} li - The list item element representing the subtask.
 */
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


/**
 * Updates a subtask in Firebase with the new description.
 * 
 * @param {HTMLElement} li - The list item element representing the subtask.
 * @param {string} newText - The updated subtask description.
 */
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


/**
 * Edits a subtask in the edit task popup, replacing its text with an input field for editing.
 * Stores the original subtask text in a data attribute for potential reversion.
 * 
 * @param {HTMLElement} element - The element that triggered the edit action (e.g., the subtask text div).
 * @param {string} originalText - The original text of the subtask.
 */
function editSubtaskEditTask(element, originalText) {
    const li = element.closest('li');

    // Store the original text as a data attribute on the li element
    li.dataset.originalText = originalText;

    li.innerHTML = generateEditSubtaskHTMLEditTask(originalText);
    const subtaskInput = li.querySelector('input');
    subtaskInput.focus();
}


/**
 * Deletes a subtask from the edit task popup and updates Firebase.
 * 
 * @param {HTMLElement} element - The element that triggered the delete action (e.g., the delete icon).
 */
async function deleteSubtaskEditTask(element) {
    const listItem = element.closest('.subtask-item');
    const subtaskId = listItem.dataset.subtaskId;

    // Add the subtask ID to the array for later deletion
    subtasksToDelete.push(subtaskId);

    // Update the UI by removing the list item
    listItem.remove();

    console.log('Subtask marked for deletion (will be deleted on save).');

}


// ------------------------------------------------



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

    // await saveTaskToFirebase(firebaseId, task);
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