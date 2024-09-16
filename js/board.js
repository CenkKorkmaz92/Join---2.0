let tasks = [];
let contacts = [];
let currentDraggedElement;
let currentDraggedElementMobile;
let isMobile = false;


/**
 * Initializes the board by updating it with tasks and contacts.
 * This function is called when the page is loaded.
 */
async function initBoard() {
  await updateBoard();
  scrollToSection();
}


/**
 * Updates the board by loading tasks and contacts from Firebase.
 * It then renders the board and applies settings for mobile devices.
 */
async function updateBoard() {
  await loadTasksFromFirebase();
  await loadContactsFromFirebase();
  renderBoard();
  checkAndApplyMobileSettings();
}


/**
 * Checks if the user is on a mobile or tablet device and applies specific settings.
 * If on a mobile device, category icons are displayed on the task cards.
 */
function checkAndApplyMobileSettings() {
  isMobile = isMobileOrTablet();
  if (isMobile) {
    let categoryIcons = document.querySelectorAll('.board-card-category-icon');
    categoryIcons.forEach(icon => {
      icon.style.display = 'block';
    });
  }
}


/**
 * Determines if the current device is a mobile or tablet based on touch capabilities and user agent.
 *
 * @returns {boolean} True if the device is a mobile or tablet, false otherwise.
 */
function isMobileOrTablet() {
  let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let userAgent = navigator.userAgent.toLowerCase();
  let isMobileAgent = /mobi|android|ipad|tablet|touch/i.test(userAgent);
  return isTouchDevice || isMobileAgent;
}


/**
 * Loads tasks from Firebase and maps them into the local tasks array.
 * Each task includes subtasks and assigned users.
 */
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


/**
 * Loads contacts from Firebase and sorts them alphabetically by name.
 * The contacts are stored in the local contacts array.
 */
async function loadContactsFromFirebase() {
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


/**
 * Updates the status and timestamp of a task in Firebase.
 *
 * @param {string} firebaseId - The Firebase ID of the task to update.
 * @param {string} newStatus - The new status of the task.
 */
async function updateTaskStatusInFirebase(firebaseId, newStatus) {
  let newTimestamp = Date.now();
  try {
    await patchData(`tasks/${firebaseId}`, { Status: newStatus, timestamp: newTimestamp });
  } catch (error) {
    console.error(`Error updating task status and timestamp: ${error}`);
  }
}


/**
 * Retrieves the Firebase ID for a given task ID.
 *
 * @param {number} taskId - The ID of the task.
 * @returns {string|null} The Firebase ID of the task, or null if not found.
 */
function getFirebaseIdByTaskId(taskId) {
  let task = tasks.find((t) => t.id == taskId);
  return task ? task.firebaseId : null;
}


/**
 * Clears the inner HTML of all task containers (To Do, In Progress, Await Feedback, Done).
 */
function clearContainers() {
  let containers = getContainersById();
  let { toDoContainer, inProgressContainer, awaitFeedbackContainer, doneContainer } = containers;
  [toDoContainer, inProgressContainer, awaitFeedbackContainer, doneContainer].forEach(container => {
    container.innerHTML = "";
  });
}


/**
 * Renders the task board by clearing containers and populating them with tasks.
 * Tasks are sorted by timestamp and placed in their appropriate containers.
 */
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

/**
 * Returns the appropriate container element for a given task status.
 *
 * @param {Object} task - The task object with a status.
 * @param {Object} containers - An object containing all task containers.
 * @returns {HTMLElement|null} The container element for the task's status, or null if not found.
 */
function getContainerForTaskStatus(task, containers) {
  let containerMap = {
    "to do": containers.toDoContainer,
    "in progress": containers.inProgressContainer,
    "await feedback": containers.awaitFeedbackContainer,
    "done": containers.doneContainer
  };
  return containerMap[task.Status];
}


/**
 * Renders the subtasks of a task, including a progress bar showing completion.
 *
 * @param {Array} subtasks - An array of subtask objects.
 * @returns {string} The HTML string for the subtask section.
 */
function renderSingleTaskSubtask(subtasks) {
  if (!subtasks || subtasks.length === 0) return "";
  let totalSubtasks = subtasks.length;
  let completedSubtasks = subtasks.filter(subtask => subtask.isChecked).length;
  let progressPercentage = (completedSubtasks / totalSubtasks) * 100;
  return generateSingleTaskSubtaskHtml(progressPercentage, completedSubtasks, totalSubtasks);
}


/**
 * Retrieves all task containers by their IDs.
 *
 * @returns {Object} An object containing the task containers (To Do, In Progress, Await Feedback, Done).
 */
function getContainersById() {
  return {
    toDoContainer: document.getElementById("toDo"),
    inProgressContainer: document.getElementById("inProgress"),
    awaitFeedbackContainer: document.getElementById("awaitFeedback"),
    doneContainer: document.getElementById("done")
  };
}


/**
 * Checks if each task container is empty, and if so, adds a placeholder message.
 */
function checkIfContainerIsEmpty() {
  const { toDoContainer, inProgressContainer, awaitFeedbackContainer, doneContainer } = getContainersById();
  addPlaceholderIfEmpty(toDoContainer, "No tasks To do");
  addPlaceholderIfEmpty(inProgressContainer, "No tasks In progress");
  addPlaceholderIfEmpty(awaitFeedbackContainer, "No tasks Await feedback");
  addPlaceholderIfEmpty(doneContainer, "No tasks Done");
}


/**
 * Adds a placeholder message to a container if it is empty.
 *
 * @param {HTMLElement} container - The container to check.
 * @param {string} placeholderText - The placeholder text to display if the container is empty.
 */
function addPlaceholderIfEmpty(container, placeholderText) {
  if (container.innerHTML.trim() === "") {
    container.innerHTML = /*html*/ `<div class="board-section-placeholder">${placeholderText}</div>`;
  }
}


/**
 * Sorts an array of tasks by their timestamp.
 *
 * @param {Array} tasksArray - The array of tasks to sort.
 * @returns {Array} The sorted array of tasks.
 */
function sortTasksByTimestamp(tasksArray) {
  return tasksArray.sort((a, b) => a.timestamp - b.timestamp);
}


/**
 * Returns the HTML for a task's description.
 * If the description is empty, a hidden span is returned.
 *
 * @param {string} description - The task description.
 * @returns {string} The HTML string for the task description.
 */
function checkSingleTaskDescription(description) {
  if (!description || description.trim() === '') {
    return /*html*/ `<span class="board-card-text board-card-description d-none"></span>`;
  } else {
    return /*html*/ `<span class="board-card-text board-card-description">${description}</span>`;
  }
}


/**
 * Returns the HTML for a task's category.
 *
 * @param {string} category - The task category (e.g., "Technical Task", "User Story").
 * @returns {string} The HTML string for the task category section.
 */
function checkSingleTaskCategory(category) {
  if (category === "Technical Task") {
    return generateSingleTaskCategoryHtml("board-card-technical", "Technical Task");
  } else if (category === "User Story") {
    return generateSingleTaskCategoryHtml("board-card-story", "User Story");
  } else {
    return "";
  }
}


/**
 * Returns the HTML for a task's priority icon.
 *
 * @param {string} priority - The task priority (e.g., "urgent", "medium", "low").
 * @returns {string} The HTML string for the priority icon.
 */
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


/**
 * Retrieves the color associated with a contact's name.
 *
 * @param {string} name - The name of the contact.
 * @returns {string} The color associated with the contact, or an empty string if not found.
 */
function getColorForSingleContact(name) {
  let contact = contacts.find(contact => contact.name === name);
  return contact ? contact.color : '';
}


/**
 * Generates the HTML for the profile badges of users assigned to a task.
 *
 * @param {Array} assignedTo - An array of user objects assigned to the task.
 * @returns {string} The HTML string for the profile badges, or an empty string if none are assigned.
 */
function generateAssignedToProfileBadges(assignedTo) {
  if (assignedTo && assignedTo.length > 0) {
    let assignedHtml = generateProfileBadgeHtml(assignedTo);
    let additionalAssigned = generateAdditionalAssignedToCount(assignedTo.length);
    return `${assignedHtml}${additionalAssigned}`;
  } else {
    return '';
  }
}


/**
 * Generates the HTML for up to four profile badges for assigned users.
 *
 * @param {Array} assignedTo - An array of user objects assigned to the task.
 * @returns {string} The HTML string for the profile badges.
 */
function generateProfileBadgeHtml(assignedTo) {
  return assignedTo.slice(0, 4).map(person => {
    let name = getNameForSingleContact(person.id);
    let initials = getInitials(name);
    let color = getColorForSingleContact(person.id);
    return /*html*/`<div class="board-card-single-profile" style="background-color: ${color};">${initials}</div>`;
  }).join('');
}


/**
 * Generates the HTML for displaying the count of additional assigned users if there are more than four.
 *
 * @param {number} length - The total number of assigned users.
 * @returns {string} The HTML string for the additional assigned user count, or an empty string if not needed.
 */
function generateAdditionalAssignedToCount(length) {
  return length > 4 ? /*html*/ `<span class="board-card-assigned-more">+${length - 4}</span>` : '';
}


/**
 * Retrieves the initials from a contact's name.
 *
 * @param {string} name - The full name of the contact.
 * @returns {string} The initials of the contact.
 */
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}


/**
 * Retrieves the color associated with a contact's ID.
 *
 * @param {string} id - The ID of the contact.
 * @returns {string} The color associated with the contact, or an empty string if not found.
 */
function getColorForSingleContact(id) {
  let contact = contacts.find(contact => contact.id === id);
  return contact ? contact.color : '';
}


/**
 * Retrieves the name of a contact by their ID.
 *
 * @param {string} id - The ID of the contact.
 * @returns {string} The name of the contact, or an empty string if not found.
 */
function getNameForSingleContact(id) {
  let contact = contacts.find(contact => contact.id === id);
  return contact ? contact.name : '';
}