let tasks = [];
let contacts = [];
let currentDraggedElement;
let currentDraggedElementMobile;
let isMobile = false;


async function initBoard() {
  await updateBoard();
  scrollToSection();
}


async function updateBoard() {
  await loadTasksFromFirebase();
  await loadContactsFromFirebase();
  renderBoard();
  checkAndApplyMobileSettings();
}


function checkAndApplyMobileSettings() {
  isMobile = isMobileOrTablet();
  if (isMobile) {
      let categoryIcons = document.querySelectorAll('.board-card-category-icon');
      categoryIcons.forEach(icon => {
          icon.style.display = 'block';
      });
  }
}


function isMobileOrTablet() {
let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let userAgent = navigator.userAgent.toLowerCase();
let isMobileAgent = /mobi|android|ipad|tablet|touch/i.test(userAgent);
return isTouchDevice || isMobileAgent;
}


async function loadTasksFromFirebase() {
  try {
    const fetchedTasks = await getData("tasks");
    tasks = Object.keys(fetchedTasks).map((key) => ({
      firebaseId: key,
      ...fetchedTasks[key],
      Subtasks: fetchedTasks[key].Subtasks ? Object.values(fetchedTasks[key].Subtasks) : [],
      Assigned_to: fetchedTasks[key].Assigned_to ? Object.values(fetchedTasks[key].Assigned_to) : []
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}


async function loadContactsFromFirebase(){
  try {
      const data = await getData('contacts');
      if (data) {
          contacts = Object.values(data);
          contacts.sort((a, b) => a.name.localeCompare(b.name));
      } else {
          contacts = [];
      }
  } catch (error) {
      console.error('Error loading contacts:', error);
  }
}


async function updateTaskStatusInFirebase(firebaseId, newStatus) {
  let newTimestamp = Date.now();
  try {
    await patchData(`tasks/${firebaseId}`, { Status: newStatus, timestamp: newTimestamp });
  } catch (error) {
    console.error(`Error updating task status and timestamp: ${error}`);
  }
}


function getFirebaseIdByTaskId(taskId) {
  let task = tasks.find((t) => t.id == taskId);
  return task ? task.firebaseId : null;
}


function clearContainers() {
  let containers = getContainersById();
  let { toDoContainer, inProgressContainer, awaitFeedbackContainer, doneContainer } = containers;
  [toDoContainer, inProgressContainer, awaitFeedbackContainer, doneContainer].forEach(container => {
    container.innerHTML = "";
  });
}


function renderBoard() {
  clearContainers();
  let containers = getContainersById();
  let sortedTasks = sortTasksByTimestamp(tasks);
  sortedTasks.forEach(task => {
    let container = getContainerForTaskStatus(task, containers);
    if (container) {
      container.innerHTML += generateSingleTaskHtml(task);
    }
  });
  checkIfContainerIsEmpty();
}


function getContainerForTaskStatus(task, containers) {
  let containerMap = {
    "to do": containers.toDoContainer,
    "in progress": containers.inProgressContainer,
    "await feedback": containers.awaitFeedbackContainer,
    "done": containers.doneContainer
  };
  return containerMap[task.Status];
}


function renderSingleTaskSubtask(subtasks) {
  if (!subtasks || subtasks.length === 0) return "";
  let totalSubtasks = subtasks.length;
  let completedSubtasks = subtasks.filter(subtask => subtask.isChecked).length;
  let progressPercentage = (completedSubtasks / totalSubtasks) * 100;
  return generateSingleTaskSubtaskHtml(progressPercentage, completedSubtasks, totalSubtasks);
}


function getContainersById() {
  return {
    toDoContainer: document.getElementById("toDo"),
    inProgressContainer: document.getElementById("inProgress"),
    awaitFeedbackContainer: document.getElementById("awaitFeedback"),
    doneContainer: document.getElementById("done")
  };
}


function checkIfContainerIsEmpty() {
  const { toDoContainer, inProgressContainer, awaitFeedbackContainer, doneContainer } = getContainersById();
  addPlaceholderIfEmpty(toDoContainer, "No tasks To do");
  addPlaceholderIfEmpty(inProgressContainer, "No tasks In progress");
  addPlaceholderIfEmpty(awaitFeedbackContainer, "No tasks Await feedback");
  addPlaceholderIfEmpty(doneContainer, "No tasks Done");
}


function addPlaceholderIfEmpty(container, placeholderText) {
  if (container.innerHTML.trim() === "") {
    container.innerHTML = /*html*/ `<div class="board-section-placeholder">${placeholderText}</div>`;
  }
}


function sortTasksByTimestamp(tasksArray) {
  return tasksArray.sort((a, b) => a.timestamp - b.timestamp);
}


function checkSingleTaskDescription(description) {
  if (!description || description.trim() === '') {
    return /*html*/ `<span class="board-card-text board-card-description d-none"></span>`;
  } else {
    return /*html*/ `<span class="board-card-text board-card-description">${description}</span>`;
  }
}


function checkSingleTaskCategory(category) {
  if (category === "Technical Task") {
    return generateSingleTaskCategoryHtml("board-card-technical", "Technical Task");
  } else if (category === "User Story") {
    return generateSingleTaskCategoryHtml("board-card-story", "User Story");
  } else {
    return "";
  }
}


function checkSingleTaskPriority(priority) {
  if (!priority) return '';
  switch (priority.toLowerCase()) {
    case 'urgent':
      return /*html*/`<img src="./assets/icons/priorityUrgent.svg" alt="Urgent Priority">`;
    case 'medium':
      return /*html*/`<img src="./assets/icons/priorityMedium.svg" alt="Medium Priority">`;
    case 'low':
      return /*html*/`<img src="./assets/icons/priorityLow.svg" alt="Low Priority">`;
    default:
      return '';
  }
}


function getColorForSingleContact(name) {
  let contact = contacts.find(contact => contact.name === name);
  return contact ? contact.color : '';
}


function generateAssignedToProfileBadges(assignedTo) {
  if (assignedTo && assignedTo.length > 0) {
    let assignedHtml = generateProfileBadgeHtml(assignedTo);
    let additionalAssigned = generateAdditionalAssignedToCount(assignedTo.length);
    return `${assignedHtml}${additionalAssigned}`;
  } else {
    return '';
  }
}


function generateProfileBadgeHtml(assignedTo) {
  return assignedTo.slice(0, 4).map(person => {
    let name = getNameForSingleContact(person.id);
    let initials = getInitials(name);
    let color = getColorForSingleContact(person.id);
    return /*html*/`<div class="board-card-single-profile" style="background-color: ${color};">${initials}</div>`;
  }).join('');
}


function generateAdditionalAssignedToCount(length) {
  return length > 4 ? /*html*/ `<span class="board-card-assigned-more">+${length - 4}</span>` : '';
}


function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}


function getColorForSingleContact(id) {
  let contact = contacts.find(contact => contact.id === id);
  return contact ? contact.color : '';
}


function getNameForSingleContact(id) {
  let contact = contacts.find(contact => contact.id === id);
  return contact ? contact.name : '';
}