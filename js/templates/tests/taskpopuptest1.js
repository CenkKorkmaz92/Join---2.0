/**
 * Generates the HTML content for the task details popup.
 * 
 * @param {Object} task - The task object containing the details.
 * @returns {string} The HTML string for the popup content.
 */
function generateTaskDetailsPopupHTML(task) {
    return /*html*/ `
        <div class="task-details-content " data-task-id="${task.id}">
            <div class="popup-header">
                <div class="task-category ${checkSingleTaskCategoryPopup(task.Category)}"><span >${task.Category}</span></div>
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
                <div class="delete-button" onclick="deleteTask('${task.firebaseId}')">
                    <img src="./assets/icons/delete.svg" alt="Delete">
                    <span>Delete</span>
                </div>
                <div class="vertical-line"></div>
                <div class="edit-button" onclick="editTask('${task.id}')">
                    <img src="./assets/icons/edit.svg" alt="Edit">
                    <span>Edit</span>
                </div>
            </div>
        </div>
    `;
}


/**
 * Generates the HTML for the edit task form.
 * 
 * @param {Object} task - The task object containing the task details.
 * @returns {string} The HTML string for the edit task form.
 */
function generateEditTaskFormHTML(task) {
    return `
         <form id="editForm" class="add-task-container-popup width-pop-up">
             <div class="popup-content-task">
                 <!-- Title Section -->
                 <div class="input-group">
                     <label for="editTitle">Title<span class="red-color">*</span></label>
                     <input type="text" id="editTitle" class="input-field"  minlength="3" maxlength="50" required
                         placeholder="Enter a title" value="${task.Title}">
                 </div>

                 <!-- Description Section -->
                 <div class="input-group">
                     <label for="editDescription">Description</label>
                     <textarea id="editDescription" class="text-area" minlength="10" maxlength="400"
                         placeholder="Enter a description">${task.Description}</textarea>
                 </div>

       <!-- Due Date Section -->
                 <div class="due-date-section">
                     <div class="input-group">
                         <label for="editDueDate">Due date <span class="required">*</span></label>
                         <input type="text" id="editDueDate" class="input-field" placeholder="dd/mm/yyyy"
                             onfocus="(this.type='date'); this.min = new Date().toISOString().split('T')[0]"
                             onblur="(this.type='text')" required value="${task.Due_date}">
                     </div>
                 </div>

            <!-- Priority Level Section -->
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

                     
                 <!-- Assigned to Section -->
                 <div class="assigned-to">
                     <div class="search-container">
                         <input type="text" id="contact-search-edit" class="contact-search"
                             placeholder="Select contacts to assign" oninput="filterContactsEdit()">

                         <button id="toggle-list-edit" class="toggle-list" onclick="toggleContactListEdit()">
                             <img src="./assets/icons/arrow_drop_down.svg" alt="Dropdown Icon"
                                 id="dropdown-assigned-edit" class="dropdown-icon">
                         </button>
                     </div>
                     <div id="contact-list-edit" class="contact-list hidden">
                     </div>
                     <div id="selected-contacts-edit" class="selected-contacts">
                     ${displaySelectedContactsEdit(task)} 
                     </div>
                 </div>

                 <!-- Subtasks Section -->
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
            <ul id="subtask-list-edit" class="subtask-list" style="list-style-type:disc" >
           ${generateSubtaskListHTML(task.Subtasks, task)}
            </ul>
        </div>
    </div>

             </form>
             <button onclick="saveEditTask('${task.id}', '${task.firebaseId}')" class="create-button" id="delete-button" type="submit">
                 <p>OK</p>
                 <img src="./assets/icons/check.svg" alt="Check">
             </button>
             </div>
         </form>
     `;
}


/**
 * Generates the HTML for a list of subtasks.
 * 
 * @param {Object} subtasks - An object containing subtask data, where keys are subtask IDs and values are subtask objects.
 * @param {Object} task - The parent task object containing the subtasks.
 * @returns {string} The HTML string representing the subtask list.
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
  * Generates the HTML for a saved subtask item.
  * @param {string} newText - The updated text of the subtask.
  * @returns {string} The HTML string for the saved subtask item.
  */
function generateSavedSubtaskHTMLEditTask(newText) {
    return `
      <div ondblclick="editSubtaskEditTask(this)" class="subtask-text"><li>${newText}</li></div>
      <div class="edit-delete-icons-edit" style="display: flex;">
        <img src="./assets/icons/edit.svg" alt="Edit" onclick="editSubtaskEditTask(this)">
        <div class="vertical-line"></div>
        <img src="./assets/icons/delete.svg" alt="Delete" onclick="deleteSubtaskEditTask(this)">
      </div>
    `;
}


/**
 * Generates the HTML for a saved subtask item.
 * 
 * @param {string} newText - The updated subtask description.
 * @param {string} originalText - The original subtask description.
 * @returns {string} The HTML string for the saved subtask item.
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
 * Generates the HTML for editing a subtask in the edit task popup.
 * Includes an input field for the new subtask text and buttons for saving and deleting.
 * 
 * @param {string} subtaskText - The current text of the subtask being edited.
 * @returns {string} The HTML string for the edit subtask form.
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