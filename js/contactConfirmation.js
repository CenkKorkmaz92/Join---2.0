/**
 * Validiert die Eingaben für Kontakte basierend auf Name, E-Mail und Telefonnummer.
 *
 * @param {string} name - Der Name des Kontakts.
 * @param {string} email - Die E-Mail-Adresse des Kontakts.
 * @param {string} phone - Die Telefonnummer des Kontakts.
 * @param {string} formType - Der Typ des Formulars ('new' oder andere Typen).
 * @returns {boolean} True, wenn alle Eingaben gültig sind, sonst false.
 */
function validateContactInputs(name, email, phone, formType) {
    let valid = true;
    const nameErrorId = formType === 'new' ? 'nameError' : 'nameError';
    const emailErrorId = formType === 'new' ? 'emailError' : 'emailError';
    const phoneErrorId = formType === 'new' ? 'phoneError' : 'phoneError';
    const nameError = validateName(name, {
        inputId: formType === 'new' ? 'newContactName' : 'contactName',
        errorId: nameErrorId
    });
    const emailError = validateEmail(email, {
        inputId: formType === 'new' ? 'newContactEmail' : 'contactMailAdress',
        errorId: emailErrorId
    });
    const phoneError = validatePhone(phone, {
        inputId: formType === 'new' ? 'newContactPhone' : 'contactPhone',
        errorId: phoneErrorId
    });
    if (nameError) {
        setErrorMessage(nameErrorId, nameError);
        valid = false;
    }
    if (emailError) {
        setErrorMessage(emailErrorId, emailError);
        valid = false;
    }
    if (phoneError) {
        setErrorMessage(phoneErrorId, phoneError);
        valid = false;
    }
    return valid;
}

/**
 * Validiert den Namen eines Kontakts.
 *
 * @param {string} name - Der Name des Kontakts.
 * @param {Object} [elementIds] - Optionales Objekt mit IDs für das Eingabefeld und die Fehlermeldung.
 * @param {string} [elementIds.inputId='newContactName'] - Die ID des Eingabefelds.
 * @param {string} [elementIds.errorId='nameError'] - Die ID des Fehlermeldungsfelds.
 * @returns {string} Eine Fehlermeldung, wenn der Name ungültig ist, sonst ein leerer String.
 */
function validateName(name, elementIds = { inputId: 'newContactName', errorId: 'nameError' }) {
    const NAME_PATTERN = /^[A-ZÄÖÜ][a-zäöü]+(?: [A-ZÄÖÜ][a-zäöü]+)$/;
    if (!name) {
        addErrorClass(elementIds.inputId, elementIds.errorId);
        return 'Please enter a first and last name.';
    }
    if (!NAME_PATTERN.test(name)) {
        addErrorClass(elementIds.inputId, elementIds.errorId);
        return 'Enter a valid name. E.g. Max Muster';
    }
    removeErrorClass(elementIds.inputId, elementIds.errorId);
    return '';
}

/**
 * Validiert die E-Mail-Adresse eines Kontakts.
 *
 * @param {string} email - Die E-Mail-Adresse des Kontakts.
 * @param {Object} [elementIds] - Optionales Objekt mit IDs für das Eingabefeld und die Fehlermeldung.
 * @param {string} [elementIds.inputId='newContactEmail'] - Die ID des Eingabefelds.
 * @param {string} [elementIds.errorId='emailError'] - Die ID des Fehlermeldungsfelds.
 * @returns {string} Eine Fehlermeldung, wenn die E-Mail ungültig ist, sonst ein leerer String.
 */
function validateEmail(email, elementIds = { inputId: 'newContactEmail', errorId: 'emailError' }) {
    const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$/i;
    if (!EMAIL_PATTERN.test(email)) {
        addErrorClass(elementIds.inputId, elementIds.errorId);
        return 'Please enter a valid email address.';
    }
    removeErrorClass(elementIds.inputId, elementIds.errorId);
    return '';
}

/**
 * Validiert die Telefonnummer eines Kontakts.
 *
 * @param {string} phone - Die Telefonnummer des Kontakts.
 * @param {Object} [elementIds] - Optionales Objekt mit IDs für das Eingabefeld und die Fehlermeldung.
 * @param {string} [elementIds.inputId='newContactPhone'] - Die ID des Eingabefelds.
 * @param {string} [elementIds.errorId='phoneError'] - Die ID des Fehlermeldungsfelds.
 * @returns {string} Eine Fehlermeldung, wenn die Telefonnummer ungültig ist, sonst ein leerer String.
 */
function validatePhone(phone, elementIds = { inputId: 'newContactPhone', errorId: 'phoneError' }) {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
        addErrorClass(elementIds.inputId, elementIds.errorId);
        return 'Please enter a phone number.';
    }
    const PHONE_PATTERN = /^[\+\d\s]+$/;
    if (!PHONE_PATTERN.test(trimmedPhone)) {
        addErrorClass(elementIds.inputId, elementIds.errorId);
        return 'Please use only numbers, the plus sign (+), and spaces.';
    }
    const digitsOnly = trimmedPhone.replace(/\D+/g, '');
    if (digitsOnly.length < 9) {
        addErrorClass(elementIds.inputId, elementIds.errorId);
        return 'The phone number must be at least 9 digits long.';
    }
    removeErrorClass(elementIds.inputId, elementIds.errorId);
    return '';
}

/**
 * Fügt einem Eingabefeld eine Fehlerklasse hinzu und zeigt die entsprechende Fehlermeldung an.
 *
 * @param {string} inputId - Die ID des Eingabefelds.
 * @param {string} errorId - Die ID des Fehlermeldungsfelds.
 */
function addErrorClass(inputId, errorId) {
    document.getElementById(inputId).classList.add('input-error');
    document.getElementById(errorId).style.display = 'block';
}

/**
 * Entfernt die Fehlerklasse von einem Eingabefeld und versteckt die entsprechende Fehlermeldung.
 *
 * @param {string} inputId - Die ID des Eingabefelds.
 * @param {string} errorId - Die ID des Fehlermeldungsfelds.
 */
function removeErrorClass(inputId, errorId) {
    document.getElementById(inputId).classList.remove('input-error');
    document.getElementById(errorId).style.display = 'none';
}
