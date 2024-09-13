function toggleEditDeleteVisibility() {
    const subtaskInput = document.getElementById('subtask-input');
    const editDelete = subtaskInput.nextElementSibling;
    const addTask = editDelete.nextElementSibling;
    if (subtaskInput.value.trim() !== '') {
        editDelete.style.display = 'flex';
        addTask.style.display = 'none';
    } else {
        editDelete.style.display = 'none';
        addTask.style.display = 'flex';
    }
}


function toggleCategoryDropdown() {
    const dropdown = document.getElementById('category-dropdown');
    const catField = document.getElementById('category-field');
    const dropdownIcon = document.querySelector('.dropdown-icon-category');
    if (dropdown.style.display === 'flex') {
        dropdown.style.display = 'none';
        dropdownIcon.src = './assets/icons/arrow_drop_down.svg';
        catField.style.borderRadius = "10px";
    } else {
        dropdown.style.display = 'flex';
        dropdownIcon.src = './assets/icons/arrow_drop_up.svg';
        catField.style.borderRadius = "10px 10px 0 0";
    }
}


document.getElementById('subtask-input').addEventListener('input', toggleEditDeleteVisibility);


function handleEnterKey(event, callback) {
    if (event.key === 'Enter') {
        event.preventDefault();
        callback();
    }
}


document.getElementById('subtask-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        addSubtask();
    }
});