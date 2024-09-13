let createTaskFunction = createTask;


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


function closeAddTaskPopup() {
    let popup = document.getElementById('addTaskPopup');
    popup.classList.add('hidden'); 
    popup.classList.remove('show');
    setTimeout(() => {
        popup.style.display = 'none'; 
    }, 400); 
}


window.addEventListener('click', (event) => {
    const popup = document.getElementById('addTaskPopup');
    if (event.target === popup) {
        closeAddTaskPopup();
    }
});


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


async function buildNewTaskObject(status) {
  const assignedContacts = await getAssignedContacts();
  const assignedContactsWithIds = {};
  assignedContacts.forEach(contact => {
      const generatedId = `-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      assignedContactsWithIds[generatedId] = contact;
  });
  return {
      timestamp: Date.now(),id: Date.now(),Title: document.getElementById('title').value.trim(),Description: document.getElementById('description').value.trim(),Assigned_to: assignedContactsWithIds,Due_date: document.getElementById('due-date').value,Prio: currentPriority,Category: document.getElementById('category').value.trim(),Subtasks: getSubtasks(),Status: status
  };
}