/**
 * Array zur Speicherung aller Aufgaben.
 *
 * @type {Array<Object>}
 */
let tasks = [];

/**
 * Array zur Speicherung aller Kontakte.
 *
 * @type {Array<Object>}
 */
let contacts = [];

/**
 * Das aktuell gezogene Element in der Desktop-Ansicht.
 *
 * @type {HTMLElement|null}
 */
let currentDraggedElement = null;

/**
 * Das aktuell gezogene Element in der mobilen Ansicht.
 *
 * @type {HTMLElement|null}
 */
let currentDraggedElementMobile = null;

/**
 * Flag zur Erkennung, ob die aktuelle Ansicht mobil ist.
 *
 * @type {boolean}
 */
let isMobile = false;

/**
 * Initialisiert das Board, lädt Daten und scrollt zur entsprechenden Sektion.
 */
async function initBoard() {
  await updateBoard();
  scrollToSection();
}

/**
 * Aktualisiert das Board, indem Aufgaben und Kontakte geladen und das Board gerendert werden.
 */
async function updateBoard() {
  await loadTasksFromFirebase();
  await loadContactsFromFirebase();
  renderBoard();
  checkAndApplyMobileSettings();
}

/**
 * Prüft, ob die aktuelle Ansicht mobil oder tablet ist, und passt die UI entsprechend an.
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
 * Bestimmt, ob das aktuelle Gerät ein Mobilgerät oder Tablet ist.
 *
 * @returns {boolean} True, wenn das Gerät mobil oder ein Tablet ist, sonst false.
 */
function isMobileOrTablet() {
  let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let userAgent = navigator.userAgent.toLowerCase();
  let isMobileAgent = /mobi|android|ipad|tablet|touch/i.test(userAgent);
  return isTouchDevice || isMobileAgent;
}

/**
 * Lädt alle Aufgaben aus Firebase und aktualisiert das lokale Aufgaben-Array.
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
 * Lädt alle Kontakte aus Firebase, sortiert sie alphabetisch und aktualisiert das lokale Kontakte-Array.
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
 * Aktualisiert den Status einer Aufgabe in Firebase und setzt einen neuen Zeitstempel.
 *
 * @async
 * @param {string} firebaseId - Die Firebase-ID der Aufgabe.
 * @param {string} newStatus - Der neue Status der Aufgabe (z.B. "in progress", "done").
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
 * Holt die Firebase-ID einer Aufgabe anhand ihrer lokalen ID.
 *
 * @param {string|number} taskId - Die lokale ID der Aufgabe.
 * @returns {string|null} Die Firebase-ID der Aufgabe oder null, wenn nicht gefunden.
 */
function getFirebaseIdByTaskId(taskId) {
  let task = tasks.find((t) => t.id == taskId);
  return task ? task.firebaseId : null;
}

/**
 * Löscht den Inhalt aller Task-Container (To Do, In Progress, Await Feedback, Done).
 */
function clearContainers() {
  let containers = getContainersById();
  let { toDoContainer, inProgressContainer, awaitFeedbackContainer, doneContainer } = containers;
  [toDoContainer, inProgressContainer, awaitFeedbackContainer, doneContainer].forEach(container => {
    container.innerHTML = "";
  });
}

/**
 * Rendert das gesamte Board, indem es Aufgaben lädt und an die entsprechenden Container anhängt.
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
 * Bestimmt den entsprechenden Container für eine Aufgabe basierend auf ihrem Status.
 *
 * @param {Object} task - Das Aufgabenobjekt.
 * @param {Object} containers - Ein Objekt, das die verschiedenen Task-Container enthält.
 * @returns {HTMLElement|undefined} Der entsprechende Container für die Aufgabe oder undefined.
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
 * Rendert die Unteraufgaben einer einzelnen Aufgabe und berechnet den Fortschritt.
 *
 * @param {Array<Object>} subtasks - Ein Array von Unteraufgaben.
 * @returns {string} Das HTML für die Unteraufgabenanzeige.
 */
function renderSingleTaskSubtask(subtasks) {
  if (!subtasks || subtasks.length === 0) return "";
  let totalSubtasks = subtasks.length;
  let completedSubtasks = subtasks.filter(subtask => subtask.isChecked).length;
  let progressPercentage = (completedSubtasks / totalSubtasks) * 100;
  return generateSingleTaskSubtaskHtml(progressPercentage, completedSubtasks, totalSubtasks);
}

/**
 * Holt die DOM-Elemente der verschiedenen Task-Container anhand ihrer IDs.
 *
 * @returns {Object} Ein Objekt mit den DOM-Elementen der Task-Container.
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
 * Überprüft, ob die einzelnen Task-Container leer sind, und fügt bei Bedarf Platzhalter hinzu.
 */
function checkIfContainerIsEmpty() {
  const { toDoContainer, inProgressContainer, awaitFeedbackContainer, doneContainer } = getContainersById();
  addPlaceholderIfEmpty(toDoContainer, "No tasks To do");
  addPlaceholderIfEmpty(inProgressContainer, "No tasks In progress");
  addPlaceholderIfEmpty(awaitFeedbackContainer, "No tasks Await feedback");
  addPlaceholderIfEmpty(doneContainer, "No tasks Done");
}

/**
 * Fügt einen Platzhaltertext in einen Container ein, wenn dieser leer ist.
 *
 * @param {HTMLElement} container - Der DOM-Element-Container.
 * @param {string} placeholderText - Der Text, der als Platzhalter angezeigt werden soll.
 */
function addPlaceholderIfEmpty(container, placeholderText) {
  if (container.innerHTML.trim() === "") {
    container.innerHTML = /*html*/ `<div class="board-section-placeholder">${placeholderText}</div>`;
  }
}

/**
 * Sortiert ein Array von Aufgaben basierend auf ihrem Zeitstempel.
 *
 * @param {Array<Object>} tasksArray - Das Array von Aufgaben.
 * @returns {Array<Object>} Das sortierte Array von Aufgaben.
 */
function sortTasksByTimestamp(tasksArray) {
  return tasksArray.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Überprüft die Beschreibung einer Aufgabe und gibt das entsprechende HTML zurück.
 *
 * @param {string} description - Die Beschreibung der Aufgabe.
 * @returns {string} Das HTML für die Aufgabenbeschreibung.
 */
function checkSingleTaskDescription(description) {
  if (!description || description.trim() === '') {
    return /*html*/ `<span class="board-card-text board-card-description d-none"></span>`;
  } else {
    return /*html*/ `<span class="board-card-text board-card-description">${description}</span>`;
  }
}

/**
 * Überprüft die Kategorie einer Aufgabe und gibt das entsprechende HTML zurück.
 *
 * @param {string} category - Die Kategorie der Aufgabe.
 * @returns {string} Das HTML für die Aufgaben-Kategorie.
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
 * Überprüft die Priorität einer Aufgabe und gibt das entsprechende HTML zurück.
 *
 * @param {string} priority - Die Priorität der Aufgabe (z.B. "urgent", "medium", "low").
 * @returns {string} Das HTML für die Prioritätsanzeige.
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
 * Holt die Hintergrundfarbe eines Kontakts anhand seines Namens.
 *
 * @param {string} name - Der Name des Kontakts.
 * @returns {string} Die Hintergrundfarbe des Kontakts.
 */
function getColorForSingleContact(name) {
  let contact = contacts.find(contact => contact.name === name);
  return contact ? contact.color : '';
}

/**
 * Generiert die Profil-Badges für die zugewiesenen Kontakte einer Aufgabe.
 *
 * @param {Array<Object>} assignedTo - Ein Array von zugewiesenen Kontakten.
 * @returns {string} Das HTML für die Profil-Badges.
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
 * Generiert die HTML-Elemente für die Profil-Badges der zugewiesenen Kontakte.
 *
 * @param {Array<Object>} assignedTo - Ein Array von zugewiesenen Kontakten.
 * @returns {string} Das HTML für die Profil-Badges.
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
 * Generiert einen zusätzlichen Zähler für die Anzahl der zugewiesenen Kontakte, wenn diese mehr als 4 sind.
 *
 * @param {number} length - Die Gesamtanzahl der zugewiesenen Kontakte.
 * @returns {string} Das HTML für den zusätzlichen Zähler oder ein leerer String.
 */
function generateAdditionalAssignedToCount(length) {
  return length > 4 ? /*html*/ `<span class="board-card-assigned-more">+${length - 4}</span>` : '';
}

/**
 * Holt die Initialen eines Namens.
 *
 * @param {string} name - Der vollständige Name.
 * @returns {string} Die Initialen des Namens.
 */
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}

/**
 * Holt die Hintergrundfarbe eines Kontakts anhand seiner ID.
 *
 * @param {string} id - Die ID des Kontakts.
 * @returns {string} Die Hintergrundfarbe des Kontakts.
 */
function getColorForSingleContact(id) {
  let contact = contacts.find(contact => contact.id === id);
  return contact ? contact.color : '';
}

/**
 * Holt den Namen eines Kontakts anhand seiner ID.
 *
 * @param {string} id - Die ID des Kontakts.
 * @returns {string} Der Name des Kontakts.
 */
function getNameForSingleContact(id) {
  let contact = contacts.find(contact => contact.id === id);
  return contact ? contact.name : '';
}
