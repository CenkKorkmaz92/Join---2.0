/**
 * Generiert das HTML für das Popup mit den Details einer Aufgabe.
 *
 * @param {Object} task - Das Aufgabenobjekt mit allen notwendigen Details.
 * @param {number|string} task.id - Die eindeutige Kennung der Aufgabe.
 * @param {string} task.Category - Die Kategorie der Aufgabe.
 * @param {string} task.Title - Der Titel der Aufgabe.
 * @param {string} task.Description - Die Beschreibung der Aufgabe.
 * @param {string} task.Due_date - Das Fälligkeitsdatum der Aufgabe.
 * @param {string} task.Prio - Die Priorität der Aufgabe.
 * @param {Object} task.Assigned_to - Die zugewiesenen Kontakte zur Aufgabe.
 * @param {Object} task.Subtasks - Die Unteraufgaben der Aufgabe.
 * @param {string} task.firebaseId - Die Firebase-ID der Aufgabe.
 * @returns {string} Das HTML-String für das Aufgaben-Detail-Popup.
 */
function generateTaskDetailsPopupHTML(task) {
    return /*html*/ `
        <div class="task-details-content " data-task-id="${task.id}">
            <div class="popup-header">
                <div class="task-category ${checkSingleTaskCategoryPopup(task.Category)}"><span>${task.Category}</span></div>
                <img src="./assets/icons/close-contact.svg" alt="Close" class="close-popup-button" onclick="closeTaskDetailsPopup()">
            </div>
            <div class="popup-content-task">
                <span class="task-title">${task.Title}</span>
                <span class="task-description">${task.Description}</span>
                <div class="due-date">
                    <p>Due Date:</p>
                    <span>${task.Due_date}</span>
                </div>
                <div class="priority">
                    <p>Priority:</p>
                    <div class="priority-choice"> ${getPriorityIcon(task.Prio)} </div>
                </div>
                <div class="assigned-to">
                    <p class="assigned-to-title">Assigned To:</p>
                    <div class="contacts">
                        ${displayAssignedContacts(task.Assigned_to)}
                    </div>
                </div>
                <div class="subtasks-container" id="subtask-container">
                    <p class="subtasks-title">Subtasks:</p>
                    <div class="subtasks" id="subtask-list">
                        ${displaySubtasks(task.Subtasks)} 
                    </div>
                </div>
            </div>
            <div class="popup-buttons">
                <div class="delete-button" onclick="openDeletePopUp('${task.firebaseId}')">
                    <div class="task-popup-delete-icon"></div>
                    <span>Delete</span>
                </div>
                <div class="vertical-line"></div>
                <div class="edit-button" onclick="editTask('${task.id}')">
                    <div class="task-popup-delete-icon task-popup-edit-icon"></div>
                    <span>Edit</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generiert das HTML für das Bearbeitungsformular einer Aufgabe.
 *
 * @param {Object} task - Das Aufgabenobjekt mit allen notwendigen Details.
 * @param {number|string} task.id - Die eindeutige Kennung der Aufgabe.
 * @param {string} task.firebaseId - Die Firebase-ID der Aufgabe.
 * @param {string} task.Title - Der Titel der Aufgabe.
 * @param {string} task.Description - Die Beschreibung der Aufgabe.
 * @param {string} task.Due_date - Das Fälligkeitsdatum der Aufgabe.
 * @param {string} task.Prio - Die Priorität der Aufgabe.
 * @param {Object} task.Assigned_to - Die zugewiesenen Kontakte zur Aufgabe.
 * @param {Object} task.Subtasks - Die Unteraufgaben der Aufgabe.
 * @returns {string} Das HTML-String für das Bearbeitungsformular der Aufgabe.
 */
function generateEditTaskFormHTML(task) {
    return /*html*/`
         <div id="editForm" class="popup-content-edit-task-form">
             <div class="popup-content-task popup-content-edit-task">
                
                 <div class="input-group">
                     <label for="editTitle">Title<span class="red-color">*</span></label>
                     <input type="text" id="editTitle" class="input-field"  minlength="3" maxlength="50" required
                         placeholder="Enter a title" value="${task.Title}">
                 </div>

                                <div class="input-group">
                     <label for="editDescription">Description</label>
                     <textarea id="editDescription" class="text-area" minlength="10" maxlength="400"
                         placeholder="Enter a description">${task.Description}</textarea>
                 </div>

                      <div class="due-date-section">
                     <div class="input-group">
                         <label for="editDueDate">Due date<span class="required">*</span></label>
                         <input type="text" id="editDueDate" class="input-field" placeholder="dd/mm/yyyy"
                             onfocus="(this.type='date'); this.min = new Date().toISOString().split('T')[0]"
                             onblur="(this.type='text')" required value="${task.Due_date}">
                     </div>
                 </div>

                <div class="priority-section">
                    <div class="input-group">
                        <p>Prio</p>
                        <div class="priority-buttons">
                            <button id="urgent-btn" type="button" class="prio-btn ${task.Prio === 'urgent' ? 'active' : ''}" onclick="setPrio('urgent')">
                                Urgent <img src="./assets/icons/${task.Prio === 'urgent' ? 'urgentWhite' : 'urgent'}.svg" alt="Urgent">
                            </button>
                            <button id="medium-btn" type="button" class="prio-btn ${task.Prio === 'medium' ? 'active' : ''}" onclick="setPrio('medium')">
                                Medium <img src="./assets/icons/${task.Prio === 'medium' ? 'mediumWhite' : 'medium'}.svg" alt="Medium">
                            </button>
                            <button id="low-btn" type="button" class="prio-btn ${task.Prio === 'low' ? 'active' : ''}" onclick="setPrio('low')">
                                Low <img src="./assets/icons/${task.Prio === 'low' ? 'lowWhite' : 'low'}.svg" alt="Low">
                            </button>
                        </div>
                    </div>
                </div>
             
                 <div class="assigned-to">
                     <div class="search-container">
                         <input type="text" id="contact-search-edit" class="contact-search contact-search-edit"
                             placeholder="Select contacts to assign" oninput="filterContactsEdit()">

                         <button id="toggle-list-edit" class="toggle-list" onclick="toggleContactListEdit()">
                             <img src="./assets/icons/arrow_drop_down.svg" alt="Dropdown Icon"
                                 id="dropdown-assigned-edit" class="dropdown-icon">
                         </button>
                     </div>
                     <div id="contact-list-edit" class="contact-list contact-list-edit hidden">
                     </div>
                     <div id="selected-contacts-edit" class="selected-contacts">
                     ${displaySelectedContactsEdit(task)} 
                     </div>
                 </div>
           
               <div class="subtasks-section">
        <div class="input-group">
            <p>Subtasks</p>
            <div class="subtask-input input-group">
                <input type="text" id="subtask-input-edit" class="input-field" placeholder="Add new subtask" minlength="5" maxlength="30">
                <div class="edit-delete" style="display: none ;">
                    <img src="./assets/icons/reset.svg" alt="Reset" class="reset-icon" onclick="resetSubtaskInputEditTask()">
                    <div class="vertical-line"></div>
                    <img src="./assets/icons/done.svg" alt="Add" class="add-icon" >
                </div>
                <div class="add-subtask" style="display: flex; "onclick="addSubtaskEditTask()">
                                <img src="./assets/icons/add.svg" alt="Add" class="add-icon">
                            </div>
            </div>
            <ul id="subtask-list-edit" class="subtask-list edit-task-subtasks" style="list-style-type:disc" >
           ${generateSubtaskListHTML(task.Subtasks, task)}
            </ul>
        </div>
    </div>

             </form>
             <button onclick="saveEditTask('${task.id}', '${task.firebaseId}')" class="create-button edit-task-ok-button" id="delete-button" type="submit">
                 <p>OK</p>
                 <img src="./assets/icons/check.svg" alt="Check">
             </button>
             </div>
         </form>
     `;
}

/**
 * Generiert das HTML für die Liste der Unteraufgaben einer Aufgabe.
 *
 * @param {Object} subtasks - Das Objekt der Unteraufgaben mit ihren Details.
 * @param {Object} task - Das Aufgabenobjekt, dem die Unteraufgaben zugeordnet sind.
 * @returns {string} Das HTML-String für die Liste der Unteraufgaben.
 */
function generateSubtaskListHTML(subtasks, task) {
    let html = '';
    for (const subtaskId in subtasks) {
        const subtask = subtasks[subtaskId];

        html += `
            <li class="subtask-item sub-hover" style="list-style-type:disc" data-subtask-id="${subtaskId}">
               <span>•</span> <div class="subtask-text" ondblclick="editSubtaskEditTask(this, '${subtask.description}')">${subtask.description}</div>
                <div class="edit-delete-icons-edit" style="display: flex;">
                    <img src="./assets/icons/edit.svg" alt="Edit" onclick="editSubtaskEditTask(this, '${subtask.description}')">
                    <div class="vertical-line"></div>
                    <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteSubtaskEditTask(this, '${task.firebaseId}' )"> 
                </div>
            </li>
        `;
    }
    return html;
}

/**
 * Generiert das HTML für eine gespeicherte Unteraufgabe nach der Bearbeitung.
 *
 * @param {string} newText - Der neue Text der Unteraufgabe.
 * @returns {string} Das HTML-String für die gespeicherte Unteraufgabe.
 */
function generateSavedSubtaskHTMLEditTask(newText) {
    return `
      <input type="text" class="input-field-editing" value="${newText}">
      <div class="edit-delete">
        <img src="./assets/icons/done.svg" alt="Done" onclick="saveSubtaskEditTask(this)">
        <div class="vertical-line"></div>
        <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteSubtaskEditTask(this)">
      </div>
    `;
}

/**
 * Generiert das HTML für eine gespeicherte Unteraufgabe.
 *
 * @param {string} newText - Der neue Text der Unteraufgabe.
 * @param {string} originalText - Der ursprüngliche Text der Unteraufgabe vor der Bearbeitung.
 * @returns {string} Das HTML-String für die gespeicherte Unteraufgabe.
 */
function generateSavedSubtaskHTML(newText, originalText) {
    return `<span>•</span><div class="subtask-text" ondblclick="editSubtaskEditTask(this, '${originalText}')">${newText}</div>  <div class="edit-delete-icons-edit" style="display: flex;">
        <img src="./assets/icons/edit.svg" alt="Edit" onclick="editSubtaskEditTask(this, '${newText}')">
        <div class="vertical-line"></div>
        <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteSubtaskEditTask(this)">
      </div>
    `;
}

/**
 * Generiert das HTML für das Bearbeitungsfeld einer Unteraufgabe.
 *
 * @param {string} subtaskText - Der Text der Unteraufgabe, die bearbeitet werden soll.
 * @returns {string} Das HTML-String für das Bearbeitungsfeld der Unteraufgabe.
 */
function generateEditSubtaskHTMLEditTask(subtaskText) {
    return `
      <input type="text" class="input-field-editing" value="${subtaskText}">
      <div class="edit-delete">
        <img src="./assets/icons/done.svg" alt="Done" onclick="saveSubtaskEditTask(this)">
        <div class="vertical-line"></div>
        <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteSubtaskEditTask(this)">
      </div>
    `;
}
