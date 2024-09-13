function validateEditTitle() {
    let isValid = true;
    const titleInput = document.getElementById('editTitle');
    if (titleInput.value.trim() === "") {
        titleInput.style.border = '1px solid rgba(255, 129, 144, 1)';
        showErrorMessage(titleInput, 'This field is required');
        isValid = false;
    } else {
        titleInput.style.border = '1px solid rgba(41, 171, 226, 1)';
        removeErrorMessage(titleInput);
    }
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
    document.querySelectorAll("#subtask-list-edit .subtask-item").forEach(item => {
        const subtaskText = item.querySelector('.subtask-edit-input')?.value.trim()
            || item.querySelector('.subtask-text')?.innerText.trim() || '';
        const subtaskId = item.dataset.subtaskId;
        if (subtasks[subtaskId]) {
            subtasks[subtaskId].description = subtaskText;
        } else {
            subtasks[subtaskId] = { id: subtaskId, description: subtaskText, isChecked: false };
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
    } else {
        const subtaskInput = li.querySelector('input');
        subtaskInput.style.borderBottom = '2px solid rgb(255, 129, 144)';
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
}