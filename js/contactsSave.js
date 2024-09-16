/**
 * Handhabt das Hinzufügen eines neuen Kontakts.
 * Liest die Eingabewerte, validiert die Eingaben und erstellt einen neuen Kontakt.
 */
function handleAddNewContact() {
    const name = document.getElementById('newContactName').value;
    let email = document.getElementById('newContactEmail').value;
    const phone = document.getElementById('newContactPhone').value;
    const isValid = validateContactInputs(name, email, phone, 'new');
    if (!isValid) {
        console.error('Please fix the errors before saving.');
        return;
    }
    email = email.toLowerCase();
    createNewContact(name, email, phone);
}

/**
 * Erstellt einen neuen Kontakt nach der Validierung der Eingaben.
 *
 * @async
 */
async function createNewContact() {
    const { name, email, phone } = getInputValues();
    clearErrorMessages();
    if (checkForDuplicates(email, phone)) return;
    if (validateContactInputs(name, email, phone, 'new')) {
        try {
            await processNewContact(name, email, phone);
        } catch (error) {
            console.error('Error creating new contact:', error);
        }
    }
}

/**
 * Holt die Eingabewerte für einen neuen Kontakt.
 *
 * @returns {Object} Ein Objekt mit den Eingabewerten für Name, E-Mail und Telefon.
 */
function getInputValues() {
    const email = document.getElementById('newContactEmail').value.toLowerCase();
    return {
        name: document.getElementById('newContactName').value,
        email: email,
        phone: document.getElementById('newContactPhone').value
    };
}

// Event Listener für das Laden des Dokuments und Hinzufügen von Klick-Events zu Kontakten
document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('addNewContactForm');
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            handleAddNewContact();
        });
    }
});

/**
 * Überprüft, ob die E-Mail-Adresse oder Telefonnummer eines neuen Kontakts bereits existiert.
 *
 * @param {string} email - Die E-Mail-Adresse des neuen Kontakts.
 * @returns {boolean} True, wenn ein Duplikat gefunden wurde, sonst false.
 */
function checkForDuplicates(email) {
    let hasError = false;
    const emailInputField = document.getElementById('newContactEmail');
    if (isEmailDuplicate(email)) {
        setErrorMessage('emailError', 'This email address is already taken.');
        if (emailInputField) {
            emailInputField.classList.add('input-error');
        }
        hasError = true;
    } else {
        if (emailInputField) {
            emailInputField.classList.remove('input-error');
        }
    }
    return hasError;
}

/**
 * Verarbeitet die Erstellung eines neuen Kontakts und speichert ihn in der Datenbank.
 *
 * @async
 * @param {string} name - Der Name des neuen Kontakts.
 * @param {string} email - Die E-Mail-Adresse des neuen Kontakts.
 * @param {string} phone - Die Telefonnummer des neuen Kontakts.
 * @returns {Promise<void>}
 */
async function processNewContact(name, email, phone) {
    const contactId = generateRandomId();
    const newContact = createContactObject(name, email.toLowerCase(), phone, contactId);
    await saveDataToFirebase(contactId, newContact);
    updateContactList(newContact);
    closeNewContact();
    successfullCreationContact();
    await loadContacts();
}

/**
 * Überprüft, ob eine E-Mail-Adresse bereits in den Kontakten existiert.
 *
 * @param {string} email - Die zu überprüfende E-Mail-Adresse.
 * @returns {boolean} True, wenn die E-Mail-Adresse dupliziert ist, sonst false.
 */
function isEmailDuplicate(email) {
    return contacts.some(contact => contact.email === email);
}

/**
 * Generiert eine zufällige UUID.
 *
 * @returns {string} Eine zufällige UUID.
 */
function generateRandomId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Zeigt eine Erfolgsnachricht nach der erfolgreichen Erstellung eines Kontakts an.
 *
 * @returns {Promise<void>}
 */
function successfullCreationContact() {
    return new Promise((resolve) => {
        let overlay = document.getElementById('createContactSuccessfull');
        let container = overlay.querySelector('.create-contact-successfull-container');
        overlay.style.display = 'flex';
        container.style.animation = 'slideInFromRight 0.4s forwards';
        setTimeout(() => {
            container.style.animation = 'slideOutToRight 0.4s forwards';
            setTimeout(() => {
                overlay.style.display = 'none';
                container.style.animation = '';
                resolve();
                location.reload();
            }, 400);
        }, 1500);
    });
}

/**
 * Speichert die bearbeiteten Kontaktdaten nach der Validierung.
 *
 * @async
 */
async function saveEditingContact() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactMailAdress').value;
    const phone = document.getElementById('contactPhone').value;
    const isValid = validateContactInputs(name, email, phone, 'edit');
    if (!isValid) {
        console.error('Please fix the errors before saving.');
        return;
    }
    const originalContactId = getOriginalContactId();
    if (!originalContactId) {
        console.error('Original Contact ID is undefined.');
        return;
    }
    const contactData = createContactData();
    try {
        await updateContactInDatabase(originalContactId, contactData);
        await updateContactInTasks(originalContactId, contactData);
        updateContactList(originalContactId, contactData);
        closeEditContact();
        location.reload();
    } catch (error) {
        console.error('Error saving contact:', error);
    }
}

/**
 * Aktualisiert einen Kontakt in allen zugewiesenen Aufgaben.
 *
 * @async
 * @param {string} contactId - Die ID des Kontakts, der aktualisiert werden soll.
 * @param {Object} updatedContactData - Die aktualisierten Daten des Kontakts.
 * @returns {Promise<void>}
 */
async function updateContactInTasks(contactId, updatedContactData) {
    try {
        const tasks = await getData('tasks');
        if (!tasks) return;
        const updatedTasks = processTasks(tasks, contactId, updatedContactData);
        await saveUpdatedTasks(updatedTasks);
    } catch (error) {
        console.error('Error updating contact in tasks:', error);
    }
}

/**
 * Verarbeitet die Aufgaben, indem die zugewiesenen Kontakte aktualisiert werden.
 *
 * @param {Object} tasks - Das Objekt mit allen Aufgaben.
 * @param {string} contactId - Die ID des Kontakts, der aktualisiert werden soll.
 * @param {Object} updatedContactData - Die aktualisierten Daten des Kontakts.
 * @returns {Object} Das aktualisierte Aufgabenobjekt.
 */
function processTasks(tasks, contactId, updatedContactData) {
    const updatedTasks = {};
    for (const [taskId, task] of Object.entries(tasks)) {
        const updatedAssignedTo = updateAssignedTo(task.Assigned_to, contactId, updatedContactData);
        updatedTasks[taskId] = {
            ...task,
            Assigned_to: updatedAssignedTo
        };
    }
    return updatedTasks;
}

/**
 * Aktualisiert die zugewiesenen Kontakte einer Aufgabe.
 *
 * @param {Object|Array} assignedTo - Die aktuell zugewiesenen Kontakte.
 * @param {string} contactId - Die ID des Kontakts, der aktualisiert werden soll.
 * @param {Object} updatedContactData - Die aktualisierten Daten des Kontakts.
 * @returns {Object|Array} Die aktualisierten zugewiesenen Kontakte.
 */
function updateAssignedTo(assignedTo, contactId, updatedContactData) {
    if (Array.isArray(assignedTo)) {
        return assignedTo.map(contact =>
            contact.id === contactId ? { ...contact, ...updatedContactData } : contact
        );
    } else if (typeof assignedTo === 'object') {
        return Object.fromEntries(
            Object.entries(assignedTo).map(([key, contact]) =>
                contact.id === contactId ? [key, { ...contact, ...updatedContactData }] : [key, contact]
            )
        );
    }
    return assignedTo;
}

/**
 * Speichert die aktualisierten Aufgaben in der Datenbank.
 *
 * @async
 * @param {Object} updatedTasks - Das Objekt mit den aktualisierten Aufgaben.
 * @returns {Promise<void>}
 */
async function saveUpdatedTasks(updatedTasks) {
    await putData('tasks', updatedTasks);
}

/**
 * Holt die ursprüngliche Kontakt-ID aus dem Bearbeitungs-Overlay.
 *
 * @returns {string} Die ursprüngliche Kontakt-ID.
 */
function getOriginalContactId() {
    return document.getElementById('editContact').dataset.originalContactId;
}

/**
 * Erstellt ein Objekt mit den aktualisierten Kontaktdaten aus den Eingabefeldern.
 *
 * @returns {Object} Das Objekt mit den aktualisierten Kontaktdaten.
 */
function createContactData() {
    return {
        id: getOriginalContactId(),
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactMailAdress').value,
        phone: document.getElementById('contactPhone').value,
        color: getRandomColor()
    };
}

/**
 * Aktualisiert einen Kontakt in der Datenbank.
 *
 * @async
 * @param {string} originalContactId - Die ursprüngliche ID des Kontakts.
 * @param {Object} contactData - Die aktualisierten Kontaktdaten.
 * @returns {Promise<void>}
 */
async function updateContactInDatabase(originalContactId, contactData) {
    await saveDataToFirebase(originalContactId, contactData);
}

/**
 * Aktualisiert einen bestehenden Kontakt im lokalen Kontakt-Array.
 *
 * @param {string} id - Die ID des Kontakts, der aktualisiert werden soll.
 * @param {Object} contactData - Die aktualisierten Kontaktdaten.
 */
function updateExistingContact(id, contactData) {
    const index = contacts.findIndex(contact => contact.id === id);
    if (index !== -1) {
        contacts[index] = { id, ...contactData };
    }
}
