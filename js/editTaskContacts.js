/**
 * Validiert den Titel eines bearbeiteten Kontakts.
 *
 * @returns {boolean} True, wenn der Titel gültig ist, sonst false.
 */
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

/**
 * Handhabt die Eingabe in bearbeiteten Feldern.
 * Ändert die Rahmenfarbe und entfernt Fehlermeldungen, wenn das Feld nicht leer ist.
 *
 * @param {Event} event - Das Eingabe-Event.
 */
function handleInputEdit(event) {
    const field = event.target;
    if (field.value.trim() !== "") {
        field.style.border = '1px solid rgba(41, 171, 226, 1)';
        removeErrorMessage(field);
    }
}

/**
 * Handhabt das Verlassen eines bearbeiteten Feldes.
 * Ändert die Rahmenfarbe basierend auf dem Inhalt des Feldes und zeigt Fehlermeldungen an, falls erforderlich.
 *
 * @param {Event} event - Das Blur-Event.
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
 * Toggles die Sichtbarkeit der Kontaktliste im Bearbeitungsmodus.
 * Ändert die Rahmenradien, Icons und die Anzeige der ausgewählten Kontakte basierend auf dem aktuellen Zustand.
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
 * Filtert die Kontakte im Bearbeitungsmodus basierend auf dem Suchbegriff.
 * Zeigt nur Kontakte an, deren Namen den Suchbegriff enthalten.
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
 * Schließt die Kontaktliste im Bearbeitungsmodus, wenn außerhalb geklickt wird.
 *
 * @param {Event} event - Das Click-Event.
 */
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

/**
 * Zeigt die ausgewählten Kontakte im Bearbeitungsmodus an.
 *
 * @param {Object} task - Das Aufgabenobjekt, das die zugewiesenen Kontakte enthält.
 * @returns {string} Das HTML zur Anzeige der ausgewählten Kontakte.
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
 * Erstellt ein Kontakt-Element im Bearbeitungsmodus und fügt es der Kontaktliste hinzu.
 *
 * @param {Object} contact - Das Kontaktobjekt.
 * @param {HTMLElement} contactList - Das DOM-Element der Kontaktliste.
 * @param {Array<Object>} assignedContacts - Das Array der zugewiesenen Kontakte.
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
 * Aktualisiert die Anzeige der ausgewählten Kontakte im Bearbeitungsmodus.
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
 * Holt die Unteraufgaben eines ursprünglichen Tasks und aktualisiert sie basierend auf den Eingaben im Bearbeitungsmodus.
 *
 * @param {Object} originalTask - Das ursprüngliche Aufgabenobjekt.
 * @returns {Object} Das aktualisierte Unteraufgabenobjekt.
 */
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

/**
 * Handhabt den Klick auf eine Kontakt-Checkbox im Bearbeitungsmodus.
 * Toggle den Status der Checkbox und aktualisiert die ausgewählten Kontakte.
 *
 * @param {Event} event - Das Click-Event.
 */
function handleContactCheckboxClickEdit(event) {
    const checkbox = event.target.closest(".contact-checkbox");
    if (checkbox) {
        checkbox.classList.toggle("checked");
        checkbox.parentElement.classList.toggle("checked");
        updateSelectedContactsEdit();
    }
}

/**
 * Speichert die bearbeitete Unteraufgabe und aktualisiert sie in Firebase.
 *
 * @param {HTMLElement} element - Das Element, das die Aktion ausgelöst hat.
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
    subtaskInput.style.borderBottom = '';
    li.innerHTML = generateSavedSubtaskHTML(newText, originalText);
}

/**
 * Behandelt eine leere Unteraufgabe im Bearbeitungsmodus.
 * Entfernt die Unteraufgabe, wenn keine ID vorhanden ist, sonst zeigt einen Fehler an.
 *
 * @param {HTMLElement} li - Das Listen-Element der Unteraufgabe.
 */
function handleEmptySubtask(li) {
    if (!li.dataset.subtaskId) {
        li.remove();
    } else {
        const subtaskInput = li.querySelector('input');
        subtaskInput.style.borderBottom = '2px solid rgb(255, 129, 144)';
    }
}

/**
 * Aktualisiert die Beschreibung einer Unteraufgabe in Firebase.
 *
 * @async
 * @param {HTMLElement} li - Das Listen-Element der Unteraufgabe.
 * @param {string} newText - Die neue Beschreibung der Unteraufgabe.
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
    } catch (error) {
        console.error('Error updating subtask in Firebase:', error);
    }
}

/**
 * Öffnet das Bearbeitungsfenster für eine Unteraufgabe und macht das Eingabefeld fokussiert.
 *
 * @param {HTMLElement} element - Das Element, das die Aktion ausgelöst hat.
 * @param {string} originalText - Der ursprüngliche Text der Unteraufgabe.
 */
function editSubtaskEditTask(element, originalText) {
    const li = element.closest('li');
    li.dataset.originalText = originalText;
    li.innerHTML = generateEditSubtaskHTMLEditTask(originalText);
    const subtaskInput = li.querySelector('input');
    subtaskInput.focus();
}

/**
 * Löscht eine Unteraufgabe im Bearbeitungsmodus und markiert sie zur Löschung.
 *
 * @async
 * @param {HTMLElement} element - Das Element, das die Aktion ausgelöst hat.
 */
async function deleteSubtaskEditTask(element) {
    const listItem = element.closest('.subtask-item');
    const subtaskId = listItem.dataset.subtaskId;
    subtasksToDelete.push(subtaskId);
    listItem.remove();
}
