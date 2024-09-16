/**
 * Creates a new task object with the status "To do" and saves it to Firebase.
 * This function is called when the "Create task" button is clicked in the popup.
 */
async function createTask() {
    if (!validateFields()) return;
    const newTask = await buildNewTaskObject('to do'); // Default status is 'to do'
    try {
        const response = await postData("tasks", newTask);
        newTask.firebaseId = response.name;
        clearFields();
        showTaskCreatedPopup();
        setTimeout(() => { window.location.href = 'board.html'; }, 2000);
    } catch (error) {
        console.error("Error creating task:", error);
    }

}


/**
 * Gets an array of objects representing the assigned contacts, each with name and ID and color.
 * It fetches contact data from Firebase and matches the selected contact names with their IDs and color.
 *
 * @returns {Promise<Array<object>>} A promise that resolves with an array of assigned contact objects.
 */
async function getAssignedContacts() {
    const assignedContacts = [];
    const checkboxes = document.querySelectorAll('.contact-list .contact-checkbox.checked');
    try {
        const contactsData = await getData("contacts");
        for (const checkbox of checkboxes) {
            const contactName = checkbox.parentElement.querySelector("span:nth-child(2)").textContent;
            const contact = Object.values(contactsData).find(c => c.name === contactName);
            if (contact) {
                assignedContacts.push({ name: contactName, id: contact.id, color: contact.color });
            } else {
                console.warn(`Contact not found for ${contactName}`);
            }
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
    return assignedContacts;
}


/**
 * Gets an object of subtask objects from the subtask list, each with an ID, description, and isChecked status.
 *
 * @returns {object} An object of subtask objects.
 */
function getSubtasks() {
    const subtasks = {};
    const subtaskItems = document.querySelectorAll("#subtask-list .subtask-item");
    subtaskItems.forEach(item => {
        const subtaskTextElement = item.querySelector('.subtask-text');
        const subtaskText = subtaskTextElement ? subtaskTextElement.innerText : '';
        const subtaskId = `-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        subtasks[subtaskId] = {
            id: subtaskId,
            description: subtaskText,
            isChecked: false
        };
    });
    return subtasks;
}


/**
 * Shows a popup message indicating that the task has been created successfully.
 */
function showTaskCreatedPopup() {
    const popup = document.getElementById('taskCreatedPopup');
    popup.classList.add('show');
    setTimeout(() => {
        popup.classList.remove('show');
    }, 2000);
}


/**
 * Handles the input event on input fields, resetting the border color and removing error messages.
 *
 * @param {Event} event - The input event.
 */
function handleInput(event) {
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
function handleBlur(event) {
    const field = event.target;
    if (field.value.trim() !== "") {
        field.style.border = '1px solid rgba(209, 209, 209, 1)';
    } else {
        if (field.id !== 'description') {
            field.style.border = '1px solid rgba(255, 129, 144, 1)';
            showErrorMessage(field, 'This field is required');
        } else {
            field.style.border = '1px solid rgba(209, 209, 209, 1)';
            removeErrorMessage(field);
        }
    }
    if (field.id !== 'category') {
        document.getElementById('category-field').style.border = '1px solid rgba(209, 209, 209, 1)';
    }
}


/**
 * Adds input event listeners to the 'title', 'description', 'due-date', and 'category-field' input fields.
 * The `handleInput` function will be called whenever the user types into these fields.
 */
document.getElementById('title').addEventListener('input', handleInput);
document.getElementById('description').addEventListener('input', handleInput);
document.getElementById('due-date').addEventListener('input', handleInput);
document.getElementById('category-field').addEventListener('input', handleInput);


/**
 * Adds blur event listeners to the 'title', 'description', 'due-date', and 'category-field' input fields.
 * The `handleBlur` function will be called when the user moves focus away from these fields.
 */
document.getElementById('title').addEventListener('blur', handleBlur);
document.getElementById('description').addEventListener('blur', handleBlur);
document.getElementById('due-date').addEventListener('blur', handleBlur);
document.getElementById('category-field').addEventListener('blur', handleBlur);


/**
 * Prevents the default form submission behavior for the form with the ID 'recipeForm'.
 * This is likely used to handle form submission using JavaScript instead of the default browser behavior.
 */
document.getElementById('recipeForm').onsubmit = function (event) {
    event.preventDefault();
};


//for Prio buttons
let currentPriority = "medium";
/**
 * Sets the priority level for the task.
 *
 * @param {string} level - The priority level ('urgent', 'medium', or 'low').
 */
function setPriority(level) {
    const buttons = document.querySelectorAll('.priority-button');
    buttons.forEach(button => resetButtonStyles(button));
    const activeButton = document.getElementById(`${level}-button`);
    activeButton.classList.add(level);
    activeButton.querySelector('img').src = `./assets/icons/${level}White.svg`;
    activeButton.classList.add('selected');
    currentPriority = level;
}


/**
 * Resets the styles of a priority button to their default state.
 *
 * @param {HTMLElement} button - The priority button to reset.
 */
function resetButtonStyles(button) {
    button.classList.remove('selected');
    button.classList.remove('urgent', 'medium', 'low');
    const img = button.querySelector('img');
    switch (button.id) {
        case 'urgent-button':
            img.src = './assets/icons/urgent.svg';
            break;
        case 'medium-button':
            img.src = './assets/icons/medium.svg';
            break;
        case 'low-button':
            img.src = './assets/icons/low.svg';
            break;
    }
}


/**
 * Gets the background color for a priority level.
 *
 * @param {string} level - The priority level ('urgent', 'medium', or 'low').
 * @returns {string} The background color for the priority level.
 */
function getPriorityColor(level) {
    switch (level) {
        case 'urgent':
            return 'rgba(255, 61, 0, 1)';
        case 'medium':
            return 'rgba(255, 168, 0, 1)';
        case 'low':
            return 'rgba(122, 226, 41, 1)';
        default:
            return 'rgba(255, 255, 255, 1)';
    }
}


/**
 * Shows an error message for the category field.
 *
 * @param {string} message - The error message to display.
 */
function showErrorMessageCategory(message) {
    const categoryField = document.getElementById('category-dropdown');
    let errorElement = categoryField.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        categoryField.parentNode.insertBefore(errorElement, categoryField.nextSibling);
    }
    errorElement.textContent = message;
}


/**
 * Removes the error message for the category field.
 */
function removeErrorMessageCategory() {
    const categoryField = document.getElementById('category-dropdown');
    const errorElement = categoryField.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
}


/**
 * Selects a category from the dropdown and updates the input field and styles.
 *
 * @param {string} category - The selected category.
 */
function selectCategory(category) {
    const categoryInput = document.getElementById('category');
    const categoryField = document.getElementById('category-field');
    categoryInput.value = category;
    toggleCategoryDropdown();
    categoryField.style.border = '1px solid rgba(41, 171, 226, 1)';
    removeErrorMessageCategory();
}


/**
 * Ensures the category dropdown icon is set correctly on page load.
 * If the dropdown is displayed, it sets the icon to 'arrow_drop_up.svg', otherwise to 'arrow_drop_down.svg'.
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('category-dropdown');
    const dropdownIcon = document.querySelector('.dropdown-icon-category');
    if (dropdown.style.display === 'flex') {
        dropdownIcon.src = './assets/icons/arrow_drop_up.svg';
    } else {
        dropdownIcon.src = './assets/icons/arrow_drop_down.svg';
    }
});


/**
 * Hides the category dropdown when the user clicks outside of it.
 * 
 * @param {Event} event - The click event.
 */
document.addEventListener('click', function (event) {
    const categoryField = document.querySelector('.category-field');
    const dropdown = document.getElementById('category-dropdown');
    if (!categoryField.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});


/**
 * Adds a new subtask to the subtask list.
 */
function addSubtask() {
    const subtaskInput = document.getElementById('subtask-input');
    const subtaskList = document.getElementById('subtask-list');
    const subtaskText = subtaskInput.value.trim();
    if (subtaskText === '') return;
    const li = createSubtaskItem(subtaskText);
    subtaskList.appendChild(li);
    subtaskInput.value = '';
    toggleEditDeleteVisibility();
}


/**
 * Deletes a subtask from the list.
 *
 * @param {HTMLElement} element - The element that triggered the delete action (e.g., the delete icon).
 */
function deleteSubtask(element) {
    element.closest('li').remove();
}


/**
 * Edits a subtask, replacing its text with an input field for editing.
 *
 * @param {HTMLElement} element - The element that triggered the edit action.
 */
function editSubtask(element) {
    const subtask = document.getElementById("subtask-list");
    const li = element.closest('li');
    const subtaskText = element.tagName.toLowerCase() === 'div' ? element.innerText : element.closest('li').querySelector('.subtask-text').innerText;
    subtask.style.paddingLeft = '0px';
    li.style.paddingLeft = '0';
    li.innerHTML = generateEditSubtaskHTML(subtaskText);
    const subtaskInput = li.querySelector('input');
    subtaskInput.focus();
}


/**
 * Saves the edited subtask, replacing the input field with the updated text.
 *
 * @param {HTMLElement} element - The element that triggered the save action.
 */
function saveSubtask(element) {
    const subtask = document.getElementById("subtask-list");
    const li = element.closest('li');
    const subtaskInput = li.querySelector('input');
    const newText = subtaskInput.value.trim();
    if (newText === '') return;
    subtask.style.paddingLeft = '20px';
    li.style.paddingLeft = '20px';
    li.innerHTML = generateSavedSubtaskHTML(newText);
}


/**
 * Toggles the visibility of the edit/delete icons for subtasks.
 * When a subtask item is clicked, its edit/delete icons are shown.
 * For all other subtask items, the edit/delete icons are hidden.
 */
document.addEventListener('click', (event) => {
    const isSubtaskItem = event.target.closest('.subtask-item');
    document.querySelectorAll('.subtask-item').forEach(item => {
        if (item === isSubtaskItem) {
            const editDelete = item.querySelector('.edit-delete-icons');
            if (editDelete) editDelete.style.display = 'flex';
        } else {
            const editDelete = item.querySelector('.edit-delete-icons');
            if (editDelete) editDelete.style.display = 'none';
        }
    });
});


/**
 * Resets the subtask input field to an empty string.
 */
function resetSubtaskInput() {
    const subtaskInput = document.getElementById('subtask-input');
    subtaskInput.value = '';
    toggleEditDeleteVisibility();
}