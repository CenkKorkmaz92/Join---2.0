let selectedContactsDataEdit = {};


async function openTaskDetails(taskId) {
    const task = await getTaskById(taskId);
    if (!task) {
        console.error('Task not found!');
        return;
    }
    const popupHTML = generateTaskDetailsPopupHTML(task);
    let popup = document.getElementById('taskDetailsPopup');
    popup.innerHTML = popupHTML;
    popup.style.display = 'flex';
    popup.classList.add('show');
    popup.classList.remove('hidden');
}


function checkSingleTaskCategoryPopup(category) {
    if (category === 'Technical Task') {
        return 'technical-task';
    } else if (category === 'User Story') {
        return 'user-story';
    } else {
        return '';
    }
}


function getPriorityIcon(priority) {
    switch (priority?.toLowerCase()) {
        case 'urgent':
            return `<p>Urgent</p><img src="./assets/icons/priorityUrgent.svg" alt="Urgent Priority">`;
        case 'medium':
            return `<p>Medium</p><img src="./assets/icons/priorityMedium.svg" alt="Medium Priority">`;
        case 'low':
            return `<p>Low</p><img src="./assets/icons/priorityLow.svg" alt="Low Priority">`;
        default:
            return '';
    }
}


function displayAssignedContacts(contacts) {
    if (!contacts || Object.keys(contacts).length === 0) {
        return '<p class="no-assigned">No one.</p>';
    }
    let html = '';
    for (const contactId in contacts) {
        const contact = contacts[contactId];
        const initials = contact.name.split(' ').map(part => part.charAt(0)).join('');
        html += /*html*/ `
        <div class="contact-item-assigned">
          <div class="contact-logo" style="background-color: ${contact.color}">${initials}</div>
          <span>${contact.name}</span>
        </div>
      `;
    }
    return html;
}


function displaySubtasks(subtasks) {
    if (!subtasks || Object.keys(subtasks).length === 0) {
        return '<p>You don`t have any subtasks .</p>';
    }
    let html = '';
    for (const subtaskId in subtasks) {
        const subtask = subtasks[subtaskId];
        const checkboxImg = subtask.isChecked ? './assets/icons/checkedBox.svg' : './assets/icons/uncheckedBox.svg';
        html += /*html*/ `
              <div class="subtask-item-popup ${subtask.isChecked ? 'checked' : ''}" data-subtask-id="${subtaskId}">
                  <div class="subtask-checkbox" onclick="toggleSubtaskCheck( '${subtaskId}');"> 
                      <img src="${checkboxImg}" alt="" id="checkbox-img-${subtaskId}">
                  </div>
                  <span>${subtask.description}</span> 
              </div>`;
    }
    return html;
}


async function toggleSubtaskCheck(subtaskId) {
    taskId = document.querySelector('.task-details-content').dataset.taskId;
    const task = await getTaskByIdToEdit(taskId);
    if (!task) {
        console.error('Task not found!');
        return;
    }
    task.Subtasks[subtaskId].isChecked = !task.Subtasks[subtaskId].isChecked;
    const checkboxImg = document.getElementById(`checkbox-img-${subtaskId}`);
    checkboxImg.src = task.Subtasks[subtaskId].isChecked ? './assets/icons/checkedBox.svg' : './assets/icons/uncheckedBox.svg';
    await putData(`tasks/${task.firebaseId}`, task);
    await updateBoard();
}


function toggleCheckboxImage(checkboxDiv) {
    const img = checkboxDiv.querySelector('img');
    img.src = img.src.includes('checkedBox.svg') ? './assets/icons/uncheckedBox.svg' : './assets/icons/checkedBox.svg';
}


async function getTaskById(taskId) {
    try {
        const allTasks = await getData('tasks');
        for (const firebaseId in allTasks) {
            if (allTasks[firebaseId].id === parseInt(taskId)) {
                return {
                    firebaseId,
                    ...allTasks[firebaseId]
                };
            }
        }
        console.warn(`Task with ID ${taskId} not found.`);
        return null;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return null;
    }
}


async function getTaskByIdToEdit(taskId) {
    let firebaseId;
    const tasks = await getData('tasks');
    for (const id in tasks) {
        if (tasks[id].id === parseInt(taskId)) {
            firebaseId = id;
            return {
                firebaseId,
                ...tasks[id]
            };
        }
    }
    console.warn(`Task with ID ${taskId} not found.`);
    return null;
}


function closeTaskDetailsPopup() {
    let popup = document.getElementById('taskDetailsPopup');
    popup.classList.add('hidden');
    popup.classList.remove('show');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 400);
    subtasksToDelete = [];
}


async function deleteTask(taskId) {
    try {
        await deleteData(`tasks/${taskId}`);
        closeTaskDetailsPopup();
        location.reload();
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}


function openDeletePopUp(taskId) {
    let deletePopUp = document.getElementById('deletePopUp');
    deletePopUp.innerHTML = "";
    deletePopUp.innerHTML = openDeletePopUpHtml(taskId, 'deleteTask');
    deletePopUp.classList.remove('d-none-important'); 
}


function closeDeletePopUp() {
    let deletePopUp = document.getElementById('deletePopUp');
    deletePopUp.classList.add('d-none-important'); 
}


window.addEventListener('click', (event) => {
    const popup = document.getElementById('taskDetailsPopup');
    if (event.target === popup) {
        closeTaskDetailsPopup();
    }
});