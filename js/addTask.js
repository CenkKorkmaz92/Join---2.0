const fields = [
    { id: 'title', element: document.getElementById('title') },
    { id: 'category', element: document.getElementById('category'), fieldElement: document.getElementById('category-field') },
    { id: 'due-date', element: document.getElementById('due-date') }
];


/**
 * Toggles the visibility of the contact list.
 */
function toggleContactList() {
    const contactList = document.getElementById("contact-list");
    const contactSearch = document.getElementById("contact-search");
    const selectedContacts = document.getElementById("selected-contacts");
    const toggleButton = document.getElementById("toggle-list");
    const dropdownIcon = toggleButton.querySelector(".dropdown-icon");
    contactList.classList.toggle("hidden");
    if (contactList.classList.contains("hidden")) {
        hideContactList(contactSearch, dropdownIcon, selectedContacts);
    } else {
        showContactList(contactSearch, dropdownIcon, selectedContacts);
    }
}


/**
 * Hides the contact list and updates related elements.
 * @param {HTMLElement} contactSearch - The contact search input element.
 * @param {HTMLElement} dropdownIcon - The dropdown icon element.
 * @param {HTMLElement} selectedContacts - The selected contacts container element.
 */
function hideContactList(contactSearch, dropdownIcon, selectedContacts) {
    contactSearch.style.borderRadius = "10px";
    dropdownIcon.src = "./assets/icons/arrow_drop_down.svg";
    selectedContacts.style.display = "flex";
    document.removeEventListener('click', closeContactListOnClickOutside);
    contactSearch.value = '';
}


/**
 * Shows the contact list and updates related elements.
 * @param {HTMLElement} contactSearch - The contact search input element.
 * @param {HTMLElement} dropdownIcon - The dropdown icon element.
 * @param {HTMLElement} selectedContacts - The selected contacts container element.
 */
function showContactList(contactSearch, dropdownIcon, selectedContacts) {
    contactSearch.style.borderRadius = "10px 10px 0 0";
    dropdownIcon.src = "./assets/icons/arrow_drop_up.svg";
    selectedContacts.style.display = "none";
    document.addEventListener('click', closeContactListOnClickOutside);
}


/**
 * Filters the contact list based on the search term entered in the contact search field.
 */
function filterContacts() {
    const searchTerm = document.getElementById("contact-search").value.toLowerCase();
    const contactItems = document.querySelectorAll("#contact-list .contact-item");
    contactItems.forEach(item => {
        const name = item.textContent.toLowerCase();
        item.style.display = name.includes(searchTerm) ? "" : "none";
    });
    const contactList = document.getElementById("contact-list");
    const isListOpen = !contactList.classList.contains("hidden");
    if (!isListOpen) {
        toggleContactList();
    }
}


/**
 * Closes the contact list when the user clicks outside of it.
 *
 * @param {Event} event - The click event.
 */
function closeContactListOnClickOutside(event) {
    const contactList = document.getElementById("contact-list");
    const contactSearch = document.getElementById("contact-search");
    const toggleButton = document.getElementById("toggle-list");
    const selectedContacts = document.getElementById("selected-contacts");
    if (!contactList.contains(event.target) &&
        !contactSearch.contains(event.target) &&
        !toggleButton.contains(event.target)) {
        toggleContactList();
        selectedContacts.style.display = "flex";
        contactSearch.value = '';
    }
}


/**
 * Initializes the contact list on page load.
 * Fetches contacts from Firebase, creates contact items, and sets up event listeners.
 */
document.addEventListener("DOMContentLoaded", async () => {
    const contactList = document.getElementById("contact-list");
    const contactSearch = document.getElementById("contact-search");
    try {
        const contactsData = await getData("contacts");
        if (contactsData) {
            const firebaseContacts = Object.values(contactsData);
            firebaseContacts.forEach(contact => createContactItem(contact, contactList));
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
    contactSearch.addEventListener("input", filterContacts);
    setPriority('medium');
});


/**
 * Creates a contact item element and appends it to the contact list.
 * @param {Object} contact - The contact data.
 * @param {HTMLElement} contactList - The contact list element.
 */
function createContactItem(contact, contactList) {
    const contactItem = document.createElement("div");
    contactItem.classList.add("contact-item");
    const nameParts = contact.name.split(" ");
    const initials = nameParts[0].charAt(0) + nameParts[1].charAt(0);
    contactItem.innerHTML = `
      <div class="contact-logo" style="background-color: ${contact.color};" data-background="${contact.color}">
          ${initials} 
      </div>
      <span>${contact.name}</span>
      <div class="contact-checkbox" data-email="${contact.email}"></div>
    `;
    contactList.appendChild(contactItem);
}


/**
 * Adds a click event listener to the contact list.
 * When a contact item is clicked, it toggles the 'checked' class on the checkbox and the contact item itself,
 * and then updates the display of selected contacts.
 */
document.getElementById("contact-list").addEventListener("click", (event) => {
    const contactItem = event.target.closest(".contact-item");
    if (contactItem) {
        const checkbox = contactItem.querySelector(".contact-checkbox");
        checkbox.classList.toggle("checked");
        contactItem.classList.toggle("checked");
        updateSelectedContacts();
    }
});


/**
 * Updates the display of selected contacts.
 */
function updateSelectedContacts() {
    const selectedContacts = document.getElementById("selected-contacts");
    selectedContacts.innerHTML = '';
    const selectedCheckboxes = document.querySelectorAll("#contact-list .contact-checkbox.checked");
    selectedCheckboxes.forEach(checkbox => {
        const contactItem = checkbox.parentElement;
        const logo = contactItem.querySelector(".contact-logo");
        selectedContacts.innerHTML += `
            <div class="selected-contact" style="background-color: ${logo.dataset.background}">
                ${logo.innerText}
            </div>
        `;
    });
}


document.getElementById('contact-search').addEventListener('input', function () {
    document.getElementById('contact-list').style.display = 'block';
    filterContacts();
});


/**
 * Clears all input fields, resets styles, and clears error messages.
 */
function clearFields() {
    clearInputFields();
    resetInputBorders();
    removeErrorMessages();
    resetContactCheckboxes();
    clearSelectedContacts();
    clearSubtaskList();
    resetPriority();
}


/**
 * Clears the values of all specified input fields.
 */
function clearInputFields() {
    const inputIds = ["title", "description", "contact-search", "due-date", "category", "subtask-input"];
    inputIds.forEach(id => document.getElementById(id).value = "");
}


/**
 * Resets the borders of all specified input fields to their default style.
 */
function resetInputBorders() {
    const inputIds = ["title", "description", "due-date", "category-field", "contact-search", "subtask-input"];
    inputIds.forEach(id => document.getElementById(id).style.border = '1px solid rgba(209, 209, 209, 1)');
}


/**
 * Removes all error messages from the form.
 */
function removeErrorMessages() {
    const errorIds = ["title", "due-date"];
    errorIds.forEach(id => removeErrorMessage(document.getElementById(id)));
    document.querySelectorAll('.error-message').forEach(errorElement => errorElement.textContent = '');
    removeErrorMessageCategory();
}


/**
 * Resets all contact checkboxes in the contact list to their unchecked state.
 */
function resetContactCheckboxes() {
    document.querySelectorAll(".contact-checkbox").forEach(checkbox => {
        checkbox.classList.remove("checked");
        checkbox.parentElement.classList.remove("checked");
    });
}


/**
 * Clears the display of selected contacts.
 */
function clearSelectedContacts() {
    document.getElementById("selected-contacts").innerHTML = "";
}


/**
 * Clears the subtask list.
 */
function clearSubtaskList() {
    document.getElementById("subtask-list").innerHTML = "";
}


/**
 * Resets the priority buttons to the default 'medium' priority.
 */
function resetPriority() {
    setPriority('medium');
    currentPriority = "medium";
}


/**
 * Removes the error message associated with a specific field.
 *
 * @param {HTMLElement} field - The input field for which to remove the error message.
 */
function removeErrorMessage(field) {
    let errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
}


/**
 * Validates the due date to ensure it's in the correct format (YYYY-MM-DD) and a future date.
 *
 * @param {string} dueDate - The due date string to validate.
 * @returns {string} An error message if the date is invalid, otherwise an empty string.
 */
function validateDueDate(dueDate) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(dueDate)) {
        return 'Please enter a valid date in YYYY-MM-DD format.';
    }
    const today = new Date();
    const selectedDate = new Date(dueDate);
    if (selectedDate <= today) {
        return 'Please enter a future date.';
    }
    return '';
}


/**
 * Validates all input fields in the form except for the category field.
 *
 * @returns {boolean} True if all fields are valid, otherwise false.
 */
function validateFields() {
    return validateTitleDueDate() && validateCategory();
}


/**
 * Validates the title and due date input fields in the form.
 *
 * @returns {boolean} True if both fields are valid, otherwise false.
 */
function validateTitleDueDate() {
    let isValid = true;
    const fieldsToValidate = fields.filter(field => field.id !== 'category');
    fieldsToValidate.forEach(field => {
        if (field.element.value.trim() === "") {
            (field.fieldElement || field.element).style.border = '1px solid rgba(255, 129, 144, 1)';
            showErrorMessage(field.element, 'This field is required');
            isValid = false;
        } else if (field.id === 'due-date') {
            const errorMessage = validateDueDate(field.element.value);
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


/**
 * Validates the category input field in the form.
 *
 * @returns {boolean} True if the field is valid, otherwise false.
 */
function validateCategory() {
    const categoryField = fields.find(field => field.id === 'category');
    let isValid = true;

    if (categoryField.element.value.trim() === "") {
        (categoryField.fieldElement || categoryField.element).style.border = '1px solid rgba(255, 129, 144, 1)';
        showErrorMessageCategory('This field is required');
        isValid = false;
    } else {
        (categoryField.fieldElement || categoryField.element).style.border = '1px solid rgba(41, 171, 226, 1)';
        removeErrorMessageCategory();
    }
    return isValid;
}


/**
* Handles the form submission event.
* Prevents the default form submission behavior and calls the `createTask` function.
*
* @param {Event} event - The form submission event.
*/
document.getElementById('recipeForm').onsubmit = function (event) {
    event.preventDefault();
    createTask();
};


/**
 * Shows an error message for a specific field.
 * 
 * @param {HTMLElement} field - The input field for which to show the error message.
 * @param {string} message - The error message to display.
 */
function showErrorMessage(field, message) {
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    errorElement.textContent = message;
}


/**
* Removes the error message associated with a specific field.
*
* @param {HTMLElement} field - The input field for which to remove the error message.
*/
function removeErrorMessage(field) {
    let errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
}


/**
* Sends a POST request to the Firebase database to save data.
*
* @param {string} path - The path in the Firebase database where the data should be saved.
* @param {object} data - The data to be saved.
* @returns {Promise<object>} A promise that resolves with the response from the Firebase database.
*/
async function postData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return responseAsJson = await response.json();
}