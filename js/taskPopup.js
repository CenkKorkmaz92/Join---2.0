/**
 * Objekt zur Speicherung der ausgewählten Kontakte während der Bearbeitung.
 *
 * @type {Object}
 */
let selectedContactsDataEdit = {};

/**
 * Öffnet das Detail-Popup für eine Aufgabe, indem die Aufgabendaten geladen und angezeigt werden.
 *
 * @async
 * @param {number|string} taskId - Die ID der zu öffnenden Aufgabe.
 * @returns {Promise<void>}
 */
async function openTaskDetails(taskId) {
    const task = await getTaskById(taskId);
    if (!task) {
        console.error('Task not found!');
        return;
    }
    const popupHTML = generateTaskDetailsPopupHTML(task);
    let popup = document.getElementById('taskDetailsPopup');
    popup.innerHTML = popupHTML;
    popup.style.display = 'flex';
    popup.classList.add('show');
    popup.classList.remove('hidden');
}

/**
 * Überprüft die Kategorie einer Aufgabe und gibt die entsprechende CSS-Klasse zurück.
 *
 * @param {string} category - Die Kategorie der Aufgabe.
 * @returns {string} Die entsprechende CSS-Klasse für die Kategorie.
 */
function checkSingleTaskCategoryPopup(category) {
    if (category === 'Technical Task') {
        return 'technical-task';
    } else if (category === 'User Story') {
        return 'user-story';
    } else {
        return '';
    }
}

/**
 * Gibt den HTML-Code für das Prioritätssymbol basierend auf der Priorität zurück.
 *
 * @param {string} priority - Die Priorität der Aufgabe (z.B. 'urgent', 'medium', 'low').
 * @returns {string} Der HTML-Code für das Prioritätssymbol.
 */
function getPriorityIcon(priority) {
    switch (priority?.toLowerCase()) {
        case 'urgent':
            return `<p>Urgent</p><img src="./assets/icons/priorityUrgent.svg" alt="Urgent Priority">`;
        case 'medium':
            return `<p>Medium</p><img src="./assets/icons/priorityMedium.svg" alt="Medium Priority">`;
        case 'low':
            return `<p>Low</p><img src="./assets/icons/priorityLow.svg" alt="Low Priority">`;
        default:
            return '';
    }
}

/**
 * Generiert den HTML-Code zur Anzeige der zugewiesenen Kontakte einer Aufgabe.
 *
 * @param {Object} contacts - Die zugewiesenen Kontakte der Aufgabe.
 * @returns {string} Der HTML-Code zur Anzeige der zugewiesenen Kontakte.
 */
function displayAssignedContacts(contacts) {
    if (!contacts || Object.keys(contacts).length === 0) {
        return '<p class="no-assigned">No one.</p>';
    }
    let html = '';
    for (const contactId in contacts) {
        const contact = contacts[contactId];
        const initials = contact.name.split(' ').map(part => part.charAt(0)).join('');
        html += /*html*/ `
            <div class="contact-item-assigned">
              <div class="contact-logo" style="background-color: ${contact.color}">${initials}</div>
              <span>${contact.name}</span>
            </div>
        `;
    }
    return html;
}

/**
 * Generiert den HTML-Code zur Anzeige der Unteraufgaben einer Aufgabe.
 *
 * @param {Object} subtasks - Die Unteraufgaben der Aufgabe.
 * @returns {string} Der HTML-Code zur Anzeige der Unteraufgaben.
 */
function displaySubtasks(subtasks) {
    if (!subtasks || Object.keys(subtasks).length === 0) {
        return '<p>You don`t have any subtasks.</p>';
    }
    let html = '';
    for (const subtaskId in subtasks) {
        const subtask = subtasks[subtaskId];
        const checkboxImg = subtask.isChecked ? './assets/icons/checkedBox.svg' : './assets/icons/uncheckedBox.svg';
        html += /*html*/ `
            <div class="subtask-item-popup ${subtask.isChecked ? 'checked' : ''}" data-subtask-id="${subtaskId}">
                <div class="subtask-checkbox" onclick="toggleSubtaskCheck('${subtaskId}');"> 
                    <img src="${checkboxImg}" alt="" id="checkbox-img-${subtaskId}">
                </div>
                <span>${subtask.description}</span> 
            </div>`;
    }
    return html;
}

/**
 * Toggle den Status einer Unteraufgabe zwischen abgeschlossen und nicht abgeschlossen.
 *
 * @async
 * @param {string} subtaskId - Die ID der zu toggelnden Unteraufgabe.
 * @returns {Promise<void>}
 */
async function toggleSubtaskCheck(subtaskId) {
    const taskElement = document.querySelector('.task-details-content');
    const taskId = taskElement.dataset.taskId;
    const task = await getTaskByIdToEdit(taskId);
    if (!task) {
        console.error('Task not found!');
        return;
    }
    task.Subtasks[subtaskId].isChecked = !task.Subtasks[subtaskId].isChecked;
    const checkboxImg = document.getElementById(`checkbox-img-${subtaskId}`);
    checkboxImg.src = task.Subtasks[subtaskId].isChecked ? './assets/icons/checkedBox.svg' : './assets/icons/uncheckedBox.svg';
    await putData(`tasks/${task.firebaseId}`, task);
    await updateBoard();
}

/**
 * Toggle das Bild einer Checkbox zwischen aktiviert und deaktiviert.
 *
 * @param {HTMLElement} checkboxDiv - Das Div-Element, das die Checkbox enthält.
 */
function toggleCheckboxImage(checkboxDiv) {
    const img = checkboxDiv.querySelector('img');
    img.src = img.src.includes('checkedBox.svg') ? './assets/icons/uncheckedBox.svg' : './assets/icons/checkedBox.svg';
}

/**
 * Holt eine Aufgabe anhand ihrer ID aus der Firebase Realtime Database.
 *
 * @async
 * @param {number|string} taskId - Die ID der Aufgabe.
 * @returns {Promise<Object|null>} Das Aufgabenobjekt mit Firebase-ID oder null, wenn nicht gefunden.
 */
async function getTaskById(taskId) {
    try {
        const allTasks = await getData('tasks');
        for (const firebaseId in allTasks) {
            if (allTasks[firebaseId].id === parseInt(taskId)) {
                return {
                    firebaseId,
                    ...allTasks[firebaseId]
                };
            }
        }
        console.warn(`Task with ID ${taskId} not found.`);
        return null;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return null;
    }
}

/**
 * Holt eine Aufgabe zum Bearbeiten anhand ihrer ID aus der Firebase Realtime Database.
 *
 * @async
 * @param {number|string} taskId - Die ID der Aufgabe.
 * @returns {Promise<Object|null>} Das Aufgabenobjekt mit Firebase-ID oder null, wenn nicht gefunden.
 */
async function getTaskByIdToEdit(taskId) {
    let firebaseId;
    const tasks = await getData('tasks');
    for (const id in tasks) {
        if (tasks[id].id === parseInt(taskId)) {
            firebaseId = id;
            return {
                firebaseId,
                ...tasks[id]
            };
        }
    }
    console.warn(`Task with ID ${taskId} not found.`);
    return null;
}

/**
 * Schließt das Detail-Popup der Aufgabe.
 */
function closeTaskDetailsPopup() {
    let popup = document.getElementById('taskDetailsPopup');
    popup.classList.add('hidden');
    popup.classList.remove('show');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 400);
    subtasksToDelete = [];
}

/**
 * Löscht eine Aufgabe anhand ihrer Firebase-ID und aktualisiert das Board.
 *
 * @async
 * @param {string} taskId - Die Firebase-ID der zu löschenden Aufgabe.
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
    try {
        await deleteData(`tasks/${taskId}`);
        closeTaskDetailsPopup();
        location.reload();
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

/**
 * Öffnet ein Lösch-Popup für eine Aufgabe.
 *
 * @param {string} taskId - Die ID der zu löschenden Aufgabe.
 */
function openDeletePopUp(taskId) {
    let deletePopUp = document.getElementById('deletePopUp');
    deletePopUp.innerHTML = "";
    deletePopUp.innerHTML = openDeletePopUpHtml(taskId, 'deleteTask');
    deletePopUp.classList.remove('d-none-important');
}

/**
 * Schließt das Lösch-Popup.
 */
function closeDeletePopUp() {
    let deletePopUp = document.getElementById('deletePopUp');
    deletePopUp.classList.add('d-none-important');
}

/**
 * Schließt das Detail-Popup der Aufgabe, wenn außerhalb des Popups geklickt wird.
 *
 * @param {Event} event - Das Klick-Event.
 */
window.addEventListener('click', (event) => {
    const popup = document.getElementById('taskDetailsPopup');
    if (event.target === popup) {
        closeTaskDetailsPopup();
    }
});
