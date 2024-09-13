function closeEditContact() {
    const editContactContainer = document.getElementById('editContact');
    editContactContainer.classList.add('hide');
    editContactContainer.classList.remove('show');
    setTimeout(() => {
        editContactContainer.style.display = 'none';
    }, 400);
}


function changeIcon(button, newIcon) {
    const img = button.querySelector('img');
    if (img) {
        img.src = `./assets/icons/${newIcon}`;
    }
}


function openNewContactWindow() {
    const newContactOverlay = document.getElementById('newContact');
    const newContactCard = document.getElementById('addNewContactCard');
    newContactOverlay.style.display = 'flex';
    newContactOverlay.classList.add('fadeInOverlayBg');
    newContactCard.classList.add('show');
}


function openEditContactWindow() {
    const editContactOverlay = document.getElementById('editContact');
    const editContactCard = document.getElementById('editContactCard');
    editContactOverlay.style.display = 'flex';
    editContactOverlay.classList.add('fadeInOverlayBg');
    editContactCard.classList.add('show');
}


function checkClickOutsideAddNewContact(event) {
    const newContactContainer = document.getElementById('newContact');
    if (event.target === newContactContainer) {
        closeNewContact();
    }
}


function checkClickOutsideEditContact(event) {
    const editContactContainer = document.getElementById('editContact');
    if (event.target === editContactContainer) {
        closeEditContact();
    }
}


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


function preventClickPropagation(event) {
    event.stopPropagation();
}


function closeContactDetailCard() {
    window.location.reload();
}


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
  

function slideInContactDropdown(element) {
    element.style.display = "flex";
    element.classList.remove("slide-out-contact-dropdown");
    element.classList.add("slide-in-contact-dropdown");
}
  

function slideOutContactDropdown(element) {
    element.classList.remove("slide-in-contact-dropdown");
    element.classList.add("slide-out-contact-dropdown");
        setTimeout(() => {
     element.style.display = "none";
     element.classList.remove("slide-out-contact-dropdown");
    }, 200);
}
  

function closeContactDetailEditDropdownOnClickOutside(event) {
    let dropdown = document.getElementById("contactDetailEditDropDown");
    let toggleButton = document.querySelector(".contact-detail-edit-button-mobile");
    if (!dropdown.contains(event.target) && !toggleButton.contains(event.target)) {
      slideOutContactDropdown(dropdown);
      document.removeEventListener("click", closeContactDetailEditDropdownOnClickOutside);
    }
}