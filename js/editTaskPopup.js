/**
 * Array zur Speicherung von Unteraufgaben, die gelöscht werden sollen.
 *
 * @type {Array<string>}
 */
let subtasksToDelete = [];

/**
 * Bearbeitet eine Aufgabe, indem sie geladen, das Bearbeitungs-Popup gerendert und die Formulare gefüllt werden.
 *
 * @async
 * @param {string} taskId - Die ID der zu bearbeitenden Aufgabe.
 * @returns {Promise<void>}
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
 * Holt die Daten einer Aufgabe basierend auf ihrer ID.
 *
 * @async
 * @param {string} taskId - Die ID der Aufgabe.
 * @returns {Promise<Object|null>} Das Aufgabenobjekt oder null, wenn nicht gefunden.
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
 * Leert den Inhalt des Popup-Fensters für Aufgabendetails.
 */
function clearPopupContent() {
    document.getElementById('taskDetailsPopup').innerHTML = '';
}

/**
 * Rendert das Bearbeitungs-Popup für eine Aufgabe.
 *
 * @param {Object} task - Das Aufgabenobjekt.
 */
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

/**
 * Füllt das Bearbeitungsformular mit den Daten der Aufgabe.
 *
 * @param {Object} task - Das Aufgabenobjekt.
 */
function populateEditForm(task) {
    document.getElementById('editTitle').value = task.Title;
    document.getElementById('editDescription').value = task.Description;
    document.getElementById('editDueDate').value = task.Due_date;
    setPrio(task.Prio);
}

/**
 * Lädt die Kontaktliste und rendert sie im Bearbeitungsmodus.
 *
 * @async
 * @param {Object} task - Das Aufgabenobjekt mit zugewiesenen Kontakten.
 * @returns {Promise<void>}
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
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}

/**
 * Richtet Event-Listener für die Kontaktliste im Bearbeitungsmodus ein.
 */
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

/**
 * Richtet Event-Listener für das Hinzufügen von Unteraufgaben im Bearbeitungsmodus ein.
 */
function setupSubtaskInputListener() {
    document.getElementById('subtask-input-edit').addEventListener('keydown', (event) => {
        handleEnterKey(event, addSubtaskEditTask);
    });
}

/**
 * Richtet Event-Listener für das Bearbeitungsformular ein.
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
 * Setzt die Priorität einer Aufgabe und aktualisiert die UI entsprechend.
 *
 * @param {string} level - Die Prioritätsstufe ('urgent', 'medium', 'low').
 */
function setPrio(level) {
    const buttons = document.querySelectorAll('.prio-btn');
    buttons.forEach(button => resetBtnsStyles(button));
    const activeButton = document.getElementById(`${level}-btn`);
    activeButton.classList.add(level);
    activeButton.querySelector('img').src = `./assets/icons/${level}White.svg`;
    activeButton.classList.add('selected');
    currentPriority = level;
}

/**
 * Setzt die Stile der Prioritätsbuttons zurück.
 *
 * @param {HTMLElement} button - Der Button, dessen Stile zurückgesetzt werden sollen.
 */
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

/**
 * Füllt das Bearbeitungsformular mit den Daten der Aufgabe.
 *
 * @param {Object} task - Das Aufgabenobjekt.
 */
function populateEditForm(task) {
    document.getElementById('editTitle').value = task.Title;
    document.getElementById('editDescription').value = task.Description;
    document.getElementById('editDueDate').value = task.Due_date;
    setPrio(task.Prio);
}

/**
 * Speichert die bearbeitete Aufgabe nach Validierung und Aktualisierung.
 *
 * @async
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {string} firebaseId - Die Firebase-ID der Aufgabe.
 * @returns {Promise<void>}
 */
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

/**
 * Holt die ursprüngliche Aufgabe basierend auf der Task-ID.
 *
 * @async
 * @param {string} taskId - Die ID der Aufgabe.
 * @returns {Promise<Object|null>} Das ursprüngliche Aufgabenobjekt oder null, wenn nicht gefunden.
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
 * Validiert die Unteraufgaben einer Aufgabe.
 *
 * @param {Object} originalTask - Das ursprüngliche Aufgabenobjekt.
 * @returns {boolean} True, wenn alle Unteraufgaben gültig sind, sonst false.
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
 * Hebt eine leere Unteraufgabe hervor, indem die Rahmenfarbe geändert wird.
 *
 * @param {string} subtaskId - Die ID der Unteraufgabe.
 */
function highlightEmptySubtask(subtaskId) {
    const subtaskItem = document.querySelector(`.subtask-item[data-subtask-id="${subtaskId}"]`);
    const subtaskInput = subtaskItem.querySelector('.input-field-editing');
    subtaskInput.style.borderBottom = '2px solid rgb(255, 129, 144)';
}

/**
 * Erstellt das aktualisierte Aufgabenobjekt basierend auf den Formulareingaben.
 *
 * @param {Object} originalTask - Das ursprüngliche Aufgabenobjekt.
 * @returns {Object} Das aktualisierte Aufgabenobjekt.
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
 * Aktualisiert eine Aufgabe in Firebase.
 *
 * @async
 * @param {string} firebaseId - Die Firebase-ID der Aufgabe.
 * @param {Object} updatedTask - Das aktualisierte Aufgabenobjekt.
 * @returns {Promise<void>}
 */
async function updateTaskInFirebase(firebaseId, updatedTask) {
    try {
        await putData(`tasks/${firebaseId}`, updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

/**
 * Validiert das Fälligkeitsdatum einer bearbeiteten Aufgabe.
 *
 * @param {string} editDueDate - Das zu validierende Fälligkeitsdatum im Format 'YYYY-MM-DD'.
 * @returns {string} Eine Fehlermeldung, wenn das Datum ungültig ist, sonst ein leerer String.
 */
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

/**
 * Validiert alle relevanten Felder im Bearbeitungsformular.
 *
 * @returns {boolean} True, wenn alle Felder gültig sind, sonst false.
 */
function validateFieldsEditTask() {
    return validateEditTitle() && validateEditDueDate();
}

/**
 * Validiert das Fälligkeitsdatum im Bearbeitungsformular.
 *
 * @returns {boolean} True, wenn das Datum gültig ist, sonst false.
 */
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
