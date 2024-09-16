/**
 * Funktion zum Erstellen einer Aufgabe. Kann basierend auf dem Task-Status geändert werden.
 *
 * @type {Function}
 */
let createTaskFunction = createTask;

/**
 * Öffnet das Popup zum Hinzufügen einer neuen Aufgabe und setzt die entsprechende Erstellungsmethode basierend auf dem Task-Status.
 *
 * @param {string} taskStatus - Der Status der Aufgabe ('to do', 'in progress', 'await feedback').
 */
function openAddTaskPopup(taskStatus) {
    let popup = document.getElementById('addTaskPopup');
    popup.style.display = 'flex';
    popup.classList.add('show');
    popup.classList.remove('hidden');
    document.getElementById('add-task-mobile').classList.add('nav-mobile-links-active');
    document.getElementById('board-mobile').classList.remove('nav-mobile-links-active');
    switch (taskStatus) {
        case 'in progress':
            createTaskFunction = createTaskInProgress;
            break;
        case 'await feedback':
            createTaskFunction = createTaskAwaitFeedback;
            break;
        default:
            createTaskFunction = createTask;
    }
}

/**
 * Schließt das Popup zum Hinzufügen einer neuen Aufgabe.
 */
function closeAddTaskPopup() {
    let popup = document.getElementById('addTaskPopup');
    popup.classList.add('hidden');
    popup.classList.remove('show');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 400);
}

/**
 * Schließt das Add-Task-Popup, wenn ein Klick außerhalb des Popups erfolgt.
 *
 * @param {Event} event - Das Click-Event.
 */
window.addEventListener('click', (event) => {
    const popup = document.getElementById('addTaskPopup');
    if (event.target === popup) {
        closeAddTaskPopup();
    }
});

/**
 * Erstellt eine neue Aufgabe mit dem Status "Await Feedback" nach der Validierung der Eingabefelder.
 * Sendet die Aufgabe an Firebase, leert die Eingabefelder, zeigt ein Popup an und leitet zur Board-Seite weiter.
 */
async function createTaskAwaitFeedback() {
    if (!validateFields()) return;
    const newTask = await buildNewTaskObject('await feedback');
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
 * Erstellt eine neue Aufgabe mit dem Status "In Progress" nach der Validierung der Eingabefelder.
 * Sendet die Aufgabe an Firebase, leert die Eingabefelder, zeigt ein Popup an und leitet zur Board-Seite weiter.
 */
async function createTaskInProgress() {
    if (!validateFields()) return;
    const newTask = await buildNewTaskObject('in progress');
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
 * Baut ein neues Aufgabenobjekt basierend auf den eingegebenen Daten und dem angegebenen Status.
 *
 * @async
 * @param {string} status - Der Status der neuen Aufgabe ('to do', 'in progress', 'await feedback', etc.).
 * @returns {Promise<Object>} Das neu erstellte Aufgabenobjekt.
 */
async function buildNewTaskObject(status) {
    const assignedContacts = await getAssignedContacts();
    const assignedContactsWithIds = {};
    assignedContacts.forEach(contact => {
        const generatedId = `-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        assignedContactsWithIds[generatedId] = contact;
    });
    return {
        timestamp: Date.now(),
        id: Date.now(),
        Title: document.getElementById('title').value.trim(),
        Description: document.getElementById('description').value.trim(),
        Assigned_to: assignedContactsWithIds,
        Due_date: document.getElementById('due-date').value,
        Prio: currentPriority,
        Category: document.getElementById('category').value.trim(),
        Subtasks: getSubtasks(),
        Status: status
    };
}
