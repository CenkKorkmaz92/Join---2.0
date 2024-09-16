/**
 * Array zur Speicherung aller Kontakte.
 *
 * @type {Array<Object>}
 */
let contacts = [];

/**
 * Der aktuelle Buchstabe, der in der Kontaktliste angezeigt wird.
 *
 * @type {string}
 */
let currentLetter = '';

/**
 * HTML-Inhalt für die Kontaktliste.
 *
 * @type {string}
 */
let html = '';

/**
 * Das aktuell ausgewählte Kontakt-Element im DOM.
 *
 * @type {HTMLElement|null}
 */
let selectedContactElement = null;

/**
 * Initialisiert die Kontaktverwaltung, lädt Daten und richtet die Benutzeroberfläche ein.
 *
 * @async
 */
async function initContacts() {
    displayDesktopSidebar();
    displayHeader();
    displayMobileNav();
    removeClassesIfNotLoggedIn();
    await getUsersData();
    displayInitialsHeaderUser();
    loadContacts();
}

/**
 * Generiert eine zufällige Hexadezimalfarbe.
 *
 * @returns {string} Eine zufällige Hexadezimalfarbe im Format '#RRGGBB'.
 */
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * Lädt alle Kontakte aus der Datenquelle und rendert die Kontaktliste.
 *
 * @async
 */
async function loadContacts() {
    try {
        const data = await getData('contacts');
        if (data) {
            contacts = Object.values(data);
            contacts.sort((a, b) => a.name.localeCompare(b.name));
            renderContactList();
        } else {
            contacts = [];
            renderContactList();
        }
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

/**
 * Rendert die Kontaktliste im DOM, gruppiert nach dem ersten Buchstaben des Namens.
 */
function renderContactList() {
    const loadContactMenu = document.getElementById('loadContactMenu'); // Annahme: Dieses Element existiert im DOM
    loadContactMenu.innerHTML = '';
    currentLetter = '';
    html = '';
    contacts.forEach(user => {
        const firstLetter = user.name.charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            html += generateLetterSectionHTML(currentLetter);
        }
        html += generateContactHTML(user);
    });
    loadContactMenu.innerHTML = html;
}

/**
 * Setzt eine Fehlermeldung für ein bestimmtes Element.
 *
 * @param {string} elementId - Die ID des Elements, für das die Fehlermeldung gesetzt werden soll.
 * @param {string} message - Die Fehlermeldung, die angezeigt werden soll.
 */
function setErrorMessage(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.innerHTML = message;
        errorElement.style.display = 'block';
        errorElement.style.color = 'red';
    } else {
        console.error(`Element with ID ${elementId} not found.`);
    }
}

/**
 * Entfernt alle Fehlermeldungen und Fehlerklassen aus den Eingabefeldern.
 */
function clearErrorMessages() {
    const errorElements = document.querySelectorAll('.form-error-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
    });
    const inputFields = document.querySelectorAll('.input-error');
    inputFields.forEach(field => {
        field.classList.remove('input-error');
    });
}

/**
 * Erstellt ein Kontaktobjekt mit den gegebenen Daten.
 *
 * @param {string} name - Der Name des Kontakts.
 * @param {string} email - Die E-Mail-Adresse des Kontakts.
 * @param {string} phone - Die Telefonnummer des Kontakts.
 * @param {string} id - Die eindeutige ID des Kontakts.
 * @returns {Object} Das erstellte Kontaktobjekt.
 */
function createContactObject(name, email, phone, id) {
    return {
        id,
        name,
        email,
        phone,
        color: getRandomColor(),
    };
}

/**
 * Schließt das Bearbeitungsfenster für Kontakte.
 */
function closeEditContact() {
    const addNewContactContainer = document.getElementById('editContact');
    addNewContactContainer.style.display = 'none';
}

/**
 * Handhabt die Anzeige der Kontaktdetails, abhängig von der Bildschirmgröße.
 *
 * @param {string} id - Die ID des Kontakts, dessen Details angezeigt werden sollen.
 */
function handleShowContactDetail(id) {
    if (window.innerWidth >= 850) {
        showContactDetail(id);
    } else {
        hideContactList();
        showContactDetailSmallScreen(id);
    }
}

/**
 * Zeigt die Details eines Kontakts im Desktop-Layout an.
 *
 * @param {string} id - Die ID des Kontakts, dessen Details angezeigt werden sollen.
 */
function showContactDetail(id) {
    const user = contacts.find(u => u.id === id);
    const contactDetail = document.getElementById('contactDetail');
    contactDetail.innerHTML = generateContactDetailHTML(user, user.color);
    contactDetail.style.display = 'flex';
    if (selectedContactElement) {
        selectedContactElement.classList.remove('selected-contact');
    }
    const contactElement = document.querySelector(`.single-contact[data-id="${id}"]`);
    if (contactElement) {
        contactElement.classList.add('selected-contact');
        selectedContactElement = contactElement;
    }
}

/**
 * Verbirgt die Kontaktliste im responsiven Layout.
 */
function hideContactList() {
    const contactList = document.getElementById('contactListResponsive');
    if (contactList) {
        contactList.style.display = 'none';
    }
}

/**
 * Zeigt die Kontaktdetails im mobilen Layout an.
 *
 * @param {string} id - Die ID des Kontakts, dessen Details angezeigt werden sollen.
 */
function showContactDetailSmallScreen(id) {
    const user = contacts.find(u => u.id === id);
    const contactDetail = document.getElementById('contactDetail');
    if (contactDetail) {
        contactDetail.innerHTML = generateContactDetailHTML(user, user.color);
        contactDetail.style.display = 'flex';
    }
}

// Event Listener für das Laden des Dokuments und Hinzufügen von Klick-Events zu Kontakten
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.single-contact').forEach(contactElement => {
        contactElement.onclick = function () {
            const name = this.getAttribute('data-name');
            handleShowContactDetail(name);
        };
    });
});

/**
 * Öffnet das Bearbeitungsfenster für einen bestimmten Kontakt.
 *
 * @param {string} contactId - Die ID des Kontakts, der bearbeitet werden soll.
 */
function openEditingContact(contactId) {
    const user = contacts.find(u => u.id === contactId);
    if (user) {
        const initials = user.name.split(' ').map(n => n.charAt(0)).join('');
        const bgColor = user.color;
        const editContact = document.getElementById('editContact');
        editContact.dataset.originalContactId = contactId;
        editContact.innerHTML = generateEditContactHTML(user, initials, bgColor);
        editContact.style.display = 'flex';
        openEditContactWindow();
    }
}

/**
 * Sortiert die Kontakte alphabetisch und rendert die Kontaktliste erneut.
 */
function sortAndRenderContacts() {
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderContactList();
}

/**
 * Aktualisiert die Kontaktliste basierend auf den übergebenen Parametern.
 * - Wenn ein Objekt mit einer 'id' übergeben wird, wird der bestehende Kontakt aktualisiert.
 * - Wenn ein String und ein Objekt übergeben werden, wird der bestehende Kontakt aktualisiert.
 * - Wenn ein Objekt ohne 'id' übergeben wird, wird ein neuer Kontakt hinzugefügt.
 *
 * @param {Object|string} param1 - Entweder ein Kontaktobjekt mit einer 'id' oder die ID des Kontakts.
 * @param {Object} [param2] - Das Kontaktobjekt, falls param1 eine ID ist.
 */
function updateContactList(param1, param2) {
    if (typeof param1 === 'object' && param1.hasOwnProperty('id')) {
        updateExistingContact(param1.id, param1);
    } else if (typeof param1 === 'string' && typeof param2 === 'object') {
        updateExistingContact(param1, param2);
    } else if (typeof param1 === 'object' && !param1.hasOwnProperty('id')) {
        contacts.push(param1);
    } else {
        console.error('Invalid parameters.');
        return;
    }
    sortAndRenderContacts();
}

/**
 * Löscht die Kontaktinformationen aus den Eingabefeldern und setzt das Profilbild zurück.
 */
function clearContactInfo() {
    const userName = document.getElementById('contactName');
    const userMail = document.getElementById('contactMailAdress');
    const userPhone = document.getElementById('contactPhone');
    const profileContainer = document.getElementById('profileEditContact');
    if (userName) userName.value = '';
    if (userMail) userMail.value = '';
    if (userPhone) userPhone.value = '';
    if (profileContainer) {
        profileContainer.outerHTML = getProfileContainerHTML();
    }
}
