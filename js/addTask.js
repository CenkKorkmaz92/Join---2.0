/**
 * Konfiguriert die Felder, die validiert werden sollen.
 * Enthält die ID und das zugehörige DOM-Element für jedes Feld.
 *
 * @typedef {Object} Field
 * @property {string} id - Die ID des Feldes.
 * @property {HTMLElement} element - Das DOM-Element des Feldes.
 * @property {HTMLElement} [fieldElement] - Optionales zusätzliches DOM-Element für das Feld.
 */

/**
 * Array von Feldern, die validiert werden sollen.
 *
 * @type {Field[]}
 */
const fields = [
    { id: 'title', element: document.getElementById('title') },
    { id: 'category', element: document.getElementById('category'), fieldElement: document.getElementById('category-field') },
    { id: 'due-date', element: document.getElementById('due-date') }
];

/**
 * Schaltet die Sichtbarkeit der Kontaktliste um.
 * Zeigt oder versteckt die Kontaktliste und passt die UI entsprechend an.
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
 * Verbirgt die Kontaktliste und passt die UI entsprechend an.
 *
 * @param {HTMLElement} contactSearch - Das Suchfeld für Kontakte.
 * @param {HTMLElement} dropdownIcon - Das Dropdown-Icon-Element.
 * @param {HTMLElement} selectedContacts - Das Element, das die ausgewählten Kontakte anzeigt.
 */
function hideContactList(contactSearch, dropdownIcon, selectedContacts) {
    contactSearch.style.borderRadius = "10px";
    dropdownIcon.src = "./assets/icons/arrow_drop_down.svg";
    selectedContacts.style.display = "flex";
    document.removeEventListener('click', closeContactListOnClickOutside);
    contactSearch.value = '';
}

/**
 * Zeigt die Kontaktliste und passt die UI entsprechend an.
 *
 * @param {HTMLElement} contactSearch - Das Suchfeld für Kontakte.
 * @param {HTMLElement} dropdownIcon - Das Dropdown-Icon-Element.
 * @param {HTMLElement} selectedContacts - Das Element, das die ausgewählten Kontakte anzeigt.
 */
function showContactList(contactSearch, dropdownIcon, selectedContacts) {
    contactSearch.style.borderRadius = "10px 10px 0 0";
    dropdownIcon.src = "./assets/icons/arrow_drop_up.svg";
    selectedContacts.style.display = "none";
    document.addEventListener('click', closeContactListOnClickOutside);
}

/**
 * Filtert die angezeigten Kontakte basierend auf dem Suchbegriff.
 * Blendet Kontakte aus, die den Suchbegriff nicht enthalten.
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
 * Schließt die Kontaktliste, wenn ein Klick außerhalb der Liste erfolgt.
 *
 * @param {Event} event - Das Click-Event.
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
 * Initialisiert die Kontaktliste beim Laden des Dokuments.
 * Lädt Kontakte aus der Datenquelle und fügt Event-Listener hinzu.
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
 * Erstellt ein Kontakt-Item und fügt es der Kontaktliste hinzu.
 *
 * @param {Object} contact - Das Kontaktobjekt mit den Kontaktdaten.
 * @param {string|number} contact.id - Die eindeutige Kennung des Kontakts.
 * @param {string} contact.name - Der Name des Kontakts.
 * @param {string} contact.email - Die E-Mail-Adresse des Kontakts.
 * @param {string} contact.color - Die Hintergrundfarbe für das Profilbild des Kontakts.
 * @param {HTMLElement} contactList - Das DOM-Element der Kontaktliste.
 */
function createContactItem(contact, contactList) {
    const contactItem = document.createElement("div");
    contactItem.classList.add("contact-item");
    const nameParts = contact.name.split(" ");
    const initials = nameParts[0].charAt(0) + (nameParts[1] ? nameParts[1].charAt(0) : '');
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
 * Handhabt Klick-Ereignisse auf die Kontaktliste.
 * Schaltet das Auswahlkästchen und die CSS-Klasse 'checked' um.
 *
 * @param {Event} event - Das Click-Event.
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
 * Aktualisiert die Anzeige der ausgewählten Kontakte.
 * Fügt ausgewählte Kontakte zur Anzeige hinzu und entfernt nicht ausgewählte.
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

/**
 * Fügt einen zusätzlichen Event-Listener für das Suchfeld hinzu,
 * um die Kontaktliste bei Eingabe zu filtern.
 */
document.getElementById('contact-search').addEventListener('input', function () {
    document.getElementById('contact-list').style.display = 'block';
    filterContacts();
});

/**
 * Löscht alle Eingabefelder, setzt die Rahmen zurück, entfernt Fehlermeldungen,
 * setzt Auswahlkästchen zurück und löscht ausgewählte Kontakte und Unteraufgaben.
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
 * Löscht die Werte aller definierten Eingabefelder.
 */
function clearInputFields() {
    const inputIds = ["title", "description", "contact-search", "due-date", "category", "subtask-input"];
    inputIds.forEach(id => document.getElementById(id).value = "");
}

/**
 * Setzt die Rahmen aller definierten Eingabefelder zurück.
 */
function resetInputBorders() {
    const inputIds = ["title", "description", "due-date", "category-field", "contact-search", "subtask-input"];
    inputIds.forEach(id => document.getElementById(id).style.border = '1px solid rgba(209, 209, 209, 1)');
}

/**
 * Entfernt alle Fehlermeldungen aus den definierten Feldern.
 */
function removeErrorMessages() {
    const errorIds = ["title", "due-date"];
    errorIds.forEach(id => removeErrorMessage(document.getElementById(id)));
    document.querySelectorAll('.error-message').forEach(errorElement => errorElement.textContent = '');
    removeErrorMessageCategory();
}

/**
 * Setzt alle Auswahlkästchen für Kontakte zurück.
 */
function resetContactCheckboxes() {
    document.querySelectorAll(".contact-checkbox").forEach(checkbox => {
        checkbox.classList.remove("checked");
        checkbox.parentElement.classList.remove("checked");
    });
}

/**
 * Löscht die Anzeige der ausgewählten Kontakte.
 */
function clearSelectedContacts() {
    document.getElementById("selected-contacts").innerHTML = "";
}

/**
 * Löscht die Liste der Unteraufgaben.
 */
function clearSubtaskList() {
    document.getElementById("subtask-list").innerHTML = "";
}

/**
 * Setzt die Priorität auf 'medium' zurück und aktualisiert die aktuelle Priorität.
 */
function resetPriority() {
    setPriority('medium');
    currentPriority = "medium";
}

/**
 * Entfernt die Fehlermeldung für ein bestimmtes Feld.
 *
 * @param {HTMLElement} field - Das DOM-Element des Feldes.
 */
function removeErrorMessage(field) {
    let errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
}

/**
 * Validiert das Fälligkeitsdatum eines Tasks.
 *
 * @param {string} dueDate - Das Fälligkeitsdatum im Format YYYY-MM-DD.
 * @returns {string} Eine Fehlermeldung, falls das Datum ungültig ist, ansonsten ein leerer String.
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
 * Validiert alle erforderlichen Felder im Formular.
 *
 * @returns {boolean} True, wenn alle Felder gültig sind, sonst false.
 */
function validateFields() {
    return validateTitleDueDate() && validateCategory();
}

/**
 * Validiert die Titel- und Fälligkeitsfelder.
 *
 * @returns {boolean} True, wenn die Titel- und Fälligkeitsfelder gültig sind, sonst false.
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
 * Validiert das Kategorie-Feld.
 *
 * @returns {boolean} True, wenn das Kategorie-Feld gültig ist, sonst false.
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
 * Verhindert das Weiterleiten von Klick-Ereignissen an übergeordnete Elemente.
 *
 * @param {Event} event - Das Click-Event.
 */
function preventClickPropagation(event) {
    event.stopPropagation();
}

/**
 * Handhabt das Absenden des Formulars zum Erstellen eines neuen Tasks.
 *
 * @param {Event} event - Das Submit-Event.
 */
document.getElementById('recipeForm').onsubmit = function (event) {
    event.preventDefault();
    createTask();
};

/**
 * Zeigt eine Fehlermeldung für ein bestimmtes Feld an.
 *
 * @param {HTMLElement} field - Das DOM-Element des Feldes.
 * @param {string} message - Die Fehlermeldung, die angezeigt werden soll.
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
 * Entfernt eine Fehlermeldung von einem bestimmten Feld.
 *
 * @param {HTMLElement} field - Das DOM-Element des Feldes.
 */
function removeErrorMessage(field) {
    let errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
}

/**
 * Führt eine POST-Anfrage aus, um Daten an einen bestimmten Pfad zu senden.
 *
 * @async
 * @param {string} path - Der Pfad, an den die Daten gesendet werden sollen.
 * @param {Object} data - Die Daten, die gesendet werden sollen.
 * @returns {Promise<Object>} Das JSON-Antwortobjekt.
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
