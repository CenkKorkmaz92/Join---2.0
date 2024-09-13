let contacts = [];
let currentLetter = '';
let html = '';
let selectedContactElement = null;


async function initContacts() {
    displayDesktopSidebar();
    displayHeader();
    displayMobileNav();
    removeClassesIfNotLoggedIn();
    await getUsersData();
    displayInitialsHeaderUser();
    loadContacts();
}


function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


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


function renderContactList() {
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


function createContactObject(name, email, phone, id) {
    return {
        id,
        name,
        email,
        phone,
        color: getRandomColor(),
    };
}


function closeEditContact() {
    const addNewContactContainer = document.getElementById('editContact');
    addNewContactContainer.style.display = 'none';
}


function handleShowContactDetail(id) {
    if (window.innerWidth >= 850) {
        showContactDetail(id);
    } else {
        hideContactList();
        showContactDetailSmallScreen(id);
    }
}


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


function hideContactList() {
    const contactList = document.getElementById('contactListResponsive');
    if (contactList) {
        contactList.style.display = 'none';
    }
}


function showContactDetailSmallScreen(id) {
    const user = contacts.find(u => u.id === id);
    const contactDetail = document.getElementById('contactDetail');
    if (contactDetail) {
        contactDetail.innerHTML = generateContactDetailHTML(user, user.color);
        contactDetail.style.display = 'flex';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.single-contact').forEach(contactElement => {
        contactElement.onclick = function() {
            const name = this.getAttribute('data-name');
            handleShowContactDetail(name);
        };
    });
});


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


function sortAndRenderContacts() {
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderContactList();
}


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