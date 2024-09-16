let createTaskFunction = createTask;


/**
 * Sets the global `createTaskFunction` variable based on the provided task status.
 * This function is used to determine which task creation function should be called 
 * when the "Create task" button is clicked in the popup.
 *
 * @param {string} taskStatus - The status of the task (e.g., 'in progress', 'await feedback', or any other valid status).
 */
function openAddTaskPopup(taskStatus) {
    let popup = document.getElementById('addTaskPopup');
    popup.style.display = 'flex';
    popup.classList.add('show');
    popup.classList.remove('hidden');
    document.getElementById('add-task-mobile').classList.add('nav-mobile-links-active');
    document.getElementById('board-mobile').classList.remove('nav-mobile-links-active');
    switch (taskStatus) {
        case 'in progress':
            createTaskFunction = createTaskInProgress;
            break;
        case 'await feedback':
            createTaskFunction = createTaskAwaitFeedback;
            break;
        default:
            createTaskFunction = createTask;
    }
}


/**
 * Closes the "Add Task" popup with a smooth animation.
 * It first adds the 'hidden' class to trigger the animation, then sets a timeout to 
 * hide the popup completely after the animation duration.
 */
function closeAddTaskPopup() {
    let popup = document.getElementById('addTaskPopup');
    popup.classList.add('hidden');
    popup.classList.remove('show');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 400);
}


// Event listener for clicking outside the popup to close the popup
window.addEventListener('click', (event) => {
    const popup = document.getElementById('addTaskPopup');
    if (event.target === popup) {
        closeAddTaskPopup();
    }
});


/**
 * Creates a new task object with the status "Await feedback" and saves it to Firebase.
 * This function is called when the "Create task" button is clicked in the popup 
 * and the `taskStatus` is set to 'await feedback'.
 */
async function createTaskAwaitFeedback() {
    if (!validateFields()) return;
    const newTask = await buildNewTaskObject('await feedback');
    try {
        const response = await postData("tasks", newTask);
        newTask.firebaseId = response.name;
        clearFields();
        showTaskCreatedPopup();
        setTimeout(() => { window.location.href = 'board.html'; }, 2000);
    } catch (error) {
        console.error("Error creating task:", error);
    }
}


/**
 * Creates a new task object with the status "In progress" and saves it to Firebase.
 * This function is called when the "Create task" button is clicked in the popup 
 * and the `taskStatus` is set to 'in progress'.
 */
async function createTaskInProgress() {
    if (!validateFields()) return;
    const newTask = await buildNewTaskObject('in progress');
    try {
        const response = await postData("tasks", newTask);
        newTask.firebeId = response.name;
        clearFields();
        showTaskCreatedPopup();
        setTimeout(() => { window.location.href = 'board.html'; }, 2000);
    } catch (error) {
        console.error("Error creating task:", error);
    }
}


/**
 * Builds a new task object with data from the form.
 * Assigns unique IDs to assigned contacts.
 * @param {string} status - The status of the new task.
 * @returns {Promise<object>} A promise that resolves with the new task object.
 */
async function buildNewTaskObject(status) {
    const assignedContacts = await getAssignedContacts();
    const assignedContactsWithIds = {};
    assignedContacts.forEach(contact => {
        const generatedId = `-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        assignedContactsWithIds[generatedId] = contact;
    });
    return {
        timestamp: Date.now(), id: Date.now(), Title: document.getElementById('title').value.trim(), Description: document.getElementById('description').value.trim(), Assigned_to: assignedContactsWithIds, Due_date: document.getElementById('due-date').value, Prio: currentPriority, Category: document.getElementById('category').value.trim(), Subtasks: getSubtasks(), Status: status
    };
}