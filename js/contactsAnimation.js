/**
 * Schließt das Bearbeitungsfenster für Kontakte.
 * Fügt die Klasse 'hide' hinzu, entfernt die Klasse 'show' und versteckt das Element nach 400 ms.
 */
function closeEditContact() {
    const editContactContainer = document.getElementById('editContact');
    editContactContainer.classList.add('hide');
    editContactContainer.classList.remove('show');
    setTimeout(() => {
        editContactContainer.style.display = 'none';
    }, 400);
}

/**
 * Ändert das Icon eines Buttons.
 *
 * @param {HTMLElement} button - Das Button-Element, dessen Icon geändert werden soll.
 * @param {string} newIcon - Der Dateiname des neuen Icons.
 */
function changeIcon(button, newIcon) {
    const img = button.querySelector('img');
    if (img) {
        img.src = `./assets/icons/${newIcon}`;
    }
}

/**
 * Öffnet das Fenster zum Hinzufügen eines neuen Kontakts.
 * Setzt die Anzeige auf 'flex' und fügt Animationsklassen hinzu.
 */
function openNewContactWindow() {
    const newContactOverlay = document.getElementById('newContact');
    const newContactCard = document.getElementById('addNewContactCard');
    newContactOverlay.style.display = 'flex';
    newContactOverlay.classList.add('fadeInOverlayBg');
    newContactCard.classList.add('show');
}

/**
 * Öffnet das Fenster zum Bearbeiten eines bestehenden Kontakts.
 * Setzt die Anzeige auf 'flex' und fügt Animationsklassen hinzu.
 */
function openEditContactWindow() {
    const editContactOverlay = document.getElementById('editContact');
    const editContactCard = document.getElementById('editContactCard');
    editContactOverlay.style.display = 'flex';
    editContactOverlay.classList.add('fadeInOverlayBg');
    editContactCard.classList.add('show');
}

/**
 * Überprüft, ob ein Klick außerhalb des "Neuen Kontakt"-Containers erfolgt ist und schließt ihn gegebenenfalls.
 *
 * @param {Event} event - Das Click-Event.
 */
function checkClickOutsideAddNewContact(event) {
    const newContactContainer = document.getElementById('newContact');
    if (event.target === newContactContainer) {
        closeNewContact();
    }
}

/**
 * Überprüft, ob ein Klick außerhalb des "Bearbeiten Kontakt"-Containers erfolgt ist und schließt ihn gegebenenfalls.
 *
 * @param {Event} event - Das Click-Event.
 */
function checkClickOutsideEditContact(event) {
    const editContactContainer = document.getElementById('editContact');
    if (event.target === editContactContainer) {
        closeEditContact();
    }
}

/**
 * Schließt das Fenster zum Hinzufügen eines neuen Kontakts.
 * Entfernt Animationsklassen, versteckt das Overlay nach 2 Sekunden und lädt die Seite neu.
 */
function closeNewContact() {
    const newContactOverlay = document.getElementById('newContact');
    const newContactCard = document.getElementById('addNewContactCard');
    newContactCard.classList.remove('show');
    newContactCard.classList.add('hide');
    newContactOverlay.classList.remove('fadeInOverlayBg');
    newContactOverlay.classList.add('fadeOutOverlayBg');
    setTimeout(() => {
        newContactOverlay.style.display = 'none';
        newContactOverlay.classList.remove('fadeOutOverlayBg');
        newContactCard.classList.remove('hide');
        location.reload();
    }, 2000);
}

/**
 * Schließt das Bearbeitungsfenster für Kontakte.
 * Entfernt Animationsklassen und versteckt das Overlay nach 400 ms.
 */
function closeEditContact() {
    const editContactOverlay = document.getElementById('editContact');
    const editContactCard = document.getElementById('editContactCard');
    editContactCard.classList.remove('show');
    editContactCard.classList.add('hide');
    editContactOverlay.classList.remove('fadeInOverlayBg');
    editContactOverlay.classList.add('fadeOutOverlayBg');
    setTimeout(() => {
        editContactOverlay.style.display = "none";
        editContactOverlay.classList.remove('fadeOutOverlayBg');
        editContactCard.classList.remove('hide');
    }, 400);
}

/**
 * Verhindert die Weiterleitung von Klick-Events an übergeordnete Elemente.
 *
 * @param {Event} event - Das Event, das gestoppt werden soll.
 */
function preventClickPropagation(event) {
    event.stopPropagation();
}

/**
 * Schließt die Detailkarte eines Kontakts und lädt die Seite neu.
 */
function closeContactDetailCard() {
    window.location.reload();
}

/**
 * Toggles das Dropdown-Menü zum Bearbeiten von Kontaktdetails.
 * Fügt oder entfernt Klassen zur Animation und setzt Event-Listener entsprechend.
 */
function toggleContactDetailEditDropdown() {
    let dropdown = document.getElementById("contactDetailEditDropDown");
    if (dropdown.style.display === "flex") {
        slideOutContactDropdown(dropdown);
        document.removeEventListener("click", closeContactDetailEditDropdownOnClickOutside);
    } else {
        slideInContactDropdown(dropdown);
        document.addEventListener("click", closeContactDetailEditDropdownOnClickOutside);
    }
}

/**
 * Blendet das Dropdown-Menü zum Bearbeiten von Kontaktdetails ein und fügt Animationsklassen hinzu.
 *
 * @param {HTMLElement} element - Das Dropdown-Element.
 */
function slideInContactDropdown(element) {
    element.style.display = "flex";
    element.classList.remove("slide-out-contact-dropdown");
    element.classList.add("slide-in-contact-dropdown");
}

/**
 * Blendet das Dropdown-Menü zum Bearbeiten von Kontaktdetails aus und fügt Animationsklassen hinzu.
 *
 * @param {HTMLElement} element - Das Dropdown-Element.
 */
function slideOutContactDropdown(element) {
    element.classList.remove("slide-in-contact-dropdown");
    element.classList.add("slide-out-contact-dropdown");
    setTimeout(() => {
        element.style.display = "none";
        element.classList.remove("slide-out-contact-dropdown");
    }, 200);
}

/**
 * Schließt das Dropdown-Menü zum Bearbeiten von Kontaktdetails, wenn außerhalb geklickt wird.
 *
 * @param {Event} event - Das Click-Event.
 */
function closeContactDetailEditDropdownOnClickOutside(event) {
    let dropdown = document.getElementById("contactDetailEditDropDown");
    let toggleButton = document.querySelector(".contact-detail-edit-button-mobile");
    if (!dropdown.contains(event.target) && !toggleButton.contains(event.target)) {
        slideOutContactDropdown(dropdown);
        document.removeEventListener("click", closeContactDetailEditDropdownOnClickOutside);
    }
}
