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


function validateEmail(email, elementIds = { inputId: 'newContactEmail', errorId: 'emailError' }) {
    const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$/i;
    if (!EMAIL_PATTERN.test(email)) {
        addErrorClass(elementIds.inputId, elementIds.errorId);
        return 'Please enter a valid email address.';
    }
    removeErrorClass(elementIds.inputId, elementIds.errorId);
    return '';
}


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


function addErrorClass(inputId, errorId) {
    document.getElementById(inputId).classList.add('input-error');
    document.getElementById(errorId).style.display = 'block';
}


function removeErrorClass(inputId, errorId) {
    document.getElementById(inputId).classList.remove('input-error');
    document.getElementById(errorId).style.display = 'none';
}