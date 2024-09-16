/**
 * Schaltet die Sichtbarkeit der Bearbeitungs- und Lösch-Icons für Unteraufgaben um.
 * Zeigt die Bearbeitungs- und Lösch-Icons an, wenn das Unteraufgaben-Eingabefeld nicht leer ist, andernfalls versteckt sie sie.
 */
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

/**
 * Schaltet das Kategorie-Dropdown-Menü um.
 * Zeigt das Dropdown-Menü an, wenn es versteckt ist, und versteckt es, wenn es angezeigt wird.
 * Aktualisiert auch das Dropdown-Icon und die Rahmen-Rundung des Kategorie-Feldes entsprechend.
 */
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

/**
 * Handhabt das Drücken der 'Enter'-Taste in einem Eingabefeld.
 * Verhindert das Standardverhalten und ruft eine Callback-Funktion auf, wenn 'Enter' gedrückt wird.
 *
 * @param {Event} event - Das Tastatur-Event.
 * @param {Function} callback - Die Funktion, die aufgerufen werden soll, wenn 'Enter' gedrückt wird.
 */
function handleEnterKey(event, callback) {
    if (event.key === 'Enter') {
        event.preventDefault();
        callback();
    }
}

// Event Listener für das Eingeben in das Unteraufgaben-Eingabefeld
document.getElementById('subtask-input').addEventListener('input', toggleEditDeleteVisibility);

// Event Listener für das Drücken der 'Enter'-Taste im Unteraufgaben-Eingabefeld
document.getElementById('subtask-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        addSubtask();
    }
});
