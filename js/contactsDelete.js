/**
 * Löscht einen Kontakt und aktualisiert alle zugewiesenen Aufgaben entsprechend.
 *
 * @async
 * @param {string} contactId - Die ID des zu löschenden Kontakts.
 * @returns {Promise<void>}
 */
async function deleteContactAndUpdateTasks(contactId) {
    try {
        await removeData(`contacts/${contactId}`);
        await removeContactFromTasks(contactId);
        contacts = contacts.filter(contact => contact.id !== contactId);
        renderContactList();
        location.reload();
    } catch (error) {
        console.error('Error deleting contact and updating tasks:', error);
    }
}

/**
 * Öffnet das Lösch-Popup für einen bestimmten Kontakt.
 *
 * @param {string} contactId - Die ID des Kontakts, der gelöscht werden soll.
 */
function openDeletePopUp(contactId) {
    let deletePopUp = document.getElementById('deletePopUp');
    deletePopUp.innerHTML = "";
    deletePopUp.innerHTML = openDeletePopUpHtml(contactId, 'deleteContactAndUpdateTasks');
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
 * Entfernt einen Kontakt aus allen zugewiesenen Aufgaben.
 *
 * @async
 * @param {string} contactId - Die ID des Kontakts, der aus den Aufgaben entfernt werden soll.
 * @returns {Promise<void>}
 */
async function removeContactFromTasks(contactId) {
    try {
        const tasks = await getData('tasks');
        if (!tasks) return;
        const updatedTasks = {};
        for (const [taskId, task] of Object.entries(tasks)) {
            let assignedTo = task.Assigned_to || {};
            if (Array.isArray(assignedTo)) {
                assignedTo = assignedTo.filter(contact => contact.id !== contactId);
            }
            else if (typeof assignedTo === 'object') {
                assignedTo = Object.fromEntries(
                    Object.entries(assignedTo).filter(([key, contact]) => contact.id !== contactId)
                );
            }
            updatedTasks[taskId] = {
                ...task,
                Assigned_to: assignedTo
            };
        }
        await putData('tasks', updatedTasks);
    } catch (error) {
        console.error('Error removing contact from tasks:', error);
    }
}

/**
 * Handhabt die Löschung eines Kontakts, indem er gelöscht und die Aufgaben aktualisiert werden.
 *
 * @async
 * @param {string} contactId - Die ID des zu löschenden Kontakts.
 * @returns {Promise<void>}
 */
async function handleDeleteContact(contactId) {
    await deleteContactAndUpdateTasks(contactId);
}
