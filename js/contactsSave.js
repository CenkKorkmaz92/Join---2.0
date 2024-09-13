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


function getInputValues() {
    const email = document.getElementById('newContactEmail').value.toLowerCase();
    return {
        name: document.getElementById('newContactName').value,
        email: email,
        phone: document.getElementById('newContactPhone').value
    };
}


document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('addNewContactForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            handleAddNewContact();
        });
    }
});


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


async function processNewContact(name, email, phone) {
    const contactId = generateRandomId();
    const newContact = createContactObject(name, email.toLowerCase(), phone, contactId);
    await saveDataToFirebase(contactId, newContact);
    updateContactList(newContact);
    closeNewContact();
    successfullCreationContact();
    await loadContacts();
}


function isEmailDuplicate(email) {
    return contacts.some(contact => contact.email === email);
}


function generateRandomId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


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


async function saveUpdatedTasks(updatedTasks) {
    await putData('tasks', updatedTasks);
}


function getOriginalContactId() {
    return document.getElementById('editContact').dataset.originalContactId;
}


function createContactData() {
    return {
        id: getOriginalContactId(),
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactMailAdress').value,
        phone: document.getElementById('contactPhone').value,
        color: getRandomColor()
    };
}


async function updateContactInDatabase(originalContactId, contactData) {
    await saveDataToFirebase(originalContactId, contactData);
}


function updateExistingContact(id, contactData) {
    const index = contacts.findIndex(contact => contact.id === id);
    if (index !== -1) {
        contacts[index] = { id, ...contactData };
    }
}