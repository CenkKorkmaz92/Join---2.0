/**
 * Funktion zum Erstellen einer Aufgabe. Kann basierend auf dem Task-Status geändert werden.
 *
 * @type {Function}
 */
let createTaskFunction = createTask;

/**
 * Öffnet das Popup zum Hinzufügen einer neuen Aufgabe und setzt die entsprechende Erstellungsmethode basierend auf dem Task-Status.
 *
 * @param {string} taskStatus - Der Status der Aufgabe ('to do', 'in progress', 'await feedback').
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
 * Schließt das Popup zum Hinzufügen einer neuen Aufgabe.
 */
function closeAddTaskPopup() {
  let popup = document.getElementById('addTaskPopup');
  popup.classList.add('hidden');
  popup.classList.remove('show');
  setTimeout(() => {
    popup.style.display = 'none';
  }, 400);
}

/**
 * Schließt das Add-Task-Popup, wenn ein Klick außerhalb des Popups erfolgt.
 *
 * @param {Event} event - Das Click-Event.
 */
window.addEventListener('click', (event) => {
  const popup = document.getElementById('addTaskPopup');
  if (event.target === popup) {
    closeAddTaskPopup();
  }
});

/**
 * Erstellt eine neue Aufgabe mit dem Status "Await Feedback" nach der Validierung der Eingabefelder.
 * Sendet die Aufgabe an Firebase, leert die Eingabefelder, zeigt ein Popup an und leitet zur Board-Seite weiter.
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
 * Erstellt eine neue Aufgabe mit dem Status "In Progress" nach der Validierung der Eingabefelder.
 * Sendet die Aufgabe an Firebase, leert die Eingabefelder, zeigt ein Popup an und leitet zur Board-Seite weiter.
 */
async function createTaskInProgress() {
  if (!validateFields()) return;
  const newTask = await buildNewTaskObject('in progress');
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
 * Baut ein neues Aufgabenobjekt basierend auf den eingegebenen Daten und dem angegebenen Status.
 *
 * @async
 * @param {string} status - Der Status der neuen Aufgabe ('to do', 'in progress', 'await feedback', etc.).
 * @returns {Promise<Object>} Das neu erstellte Aufgabenobjekt.
 */
async function buildNewTaskObject(status) {
  const assignedContacts = await getAssignedContacts();
  const assignedContactsWithIds = {};
  assignedContacts.forEach(contact => {
    const generatedId = `-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    assignedContactsWithIds[generatedId] = contact;
  });
  return {
    timestamp: Date.now(),
    id: Date.now(),
    Title: document.getElementById('title').value.trim(),
    Description: document.getElementById('description').value.trim(),
    Assigned_to: assignedContactsWithIds,
    Due_date: document.getElementById('due-date').value,
    Prio: currentPriority,
    Category: document.getElementById('category').value.trim(),
    Subtasks: getSubtasks(),
    Status: status
  };
}

/**
 * Dreht eine Aufgabe visuell, indem eine CSS-Klasse hinzugefügt wird.
 *
 * @param {string} taskId - Die ID der Aufgabe, die gedreht werden soll.
 */
function rotateTask(taskId) {
  let element = document.getElementById(taskId);
  element.classList.add("board-card-rotate");
}

/**
 * Startet das Dragging einer Aufgabe und dreht sie, falls nicht mobil.
 *
 * @param {string} taskId - Die ID der Aufgabe, die gezogen wird.
 */
function startDragging(taskId) {
  currentDraggedElement = taskId;
  if (!isMobile) {
    rotateTask(taskId);
  }
}

/**
 * Entfernt die Drehung von einer Aufgabe.
 *
 * @param {HTMLElement} element - Das DOM-Element der Aufgabe.
 */
function resetRotateTask(element) {
  element.classList.remove("board-card-rotate");
}

/**
 * Entfernt die Drehung von einer Aufgabe in der mobilen Ansicht.
 *
 * @param {string} taskId - Die ID der Aufgabe, die zurückgesetzt werden soll.
 */
function resetRotateTaskMobile(taskId) {
  let element = document.getElementById(taskId);
  element.classList.remove("board-card-rotate");
}

/**
 * Bestimmt den Status einer Aufgabe basierend auf der ID des Drop-Containers.
 *
 * @param {string} dropContainerId - Die ID des Drop-Containers.
 * @returns {string|null} Der entsprechende Status oder null, wenn keiner passt.
 */
function getStatusFromDropContainerId(dropContainerId) {
  let statusMap = {
    "toDo": "to do",
    "inProgress": "in progress",
    "awaitFeedback": "await feedback",
    "done": "done"
  };
  return statusMap[dropContainerId] || null;
}

/**
 * Aktualisiert den Status einer Aufgabe in Firebase.
 *
 * @async
 * @param {string} firebaseId - Die Firebase-ID der Aufgabe.
 * @param {string} newStatus - Der neue Status der Aufgabe.
 */
async function updateTaskStatus(firebaseId, newStatus) {
  if (firebaseId) {
    await updateTaskStatusInFirebase(firebaseId, newStatus);
  }
}

/**
 * Verschiebt eine Aufgabe in einen neuen Status und aktualisiert das Board.
 *
 * @async
 * @param {string} dropContainerId - Die ID des Ziel-Containers.
 */
async function moveTo(dropContainerId) {
  if (!currentDraggedElement) return;
  let firebaseId = getFirebaseIdByTaskId(currentDraggedElement);
  let newStatus = getStatusFromDropContainerId(dropContainerId);
  if (newStatus) {
    await updateTaskStatus(firebaseId, newStatus);
  }
  await updateBoard();
  removeHighlightDragArea(dropContainerId);
  currentDraggedElement = null;
}

/**
 * Erlaubt das Ablegen einer Aufgabe in einem Drop-Container.
 *
 * @param {DragEvent} ev - Das Drag-Event.
 */
function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * Hebt einen Drag-Bereich hervor, wenn eine Aufgabe darüber gezogen wird.
 *
 * @param {string} id - Die ID des Drag-Bereichs.
 */
function addHighlightDragArea(id) {
  let dragArea = document.getElementById(id);
  dragArea.classList.add("board-highlight-drag-area");
}

/**
 * Entfernt die Hervorhebung eines Drag-Bereichs.
 *
 * @param {string} id - Die ID des Drag-Bereichs.
 */
function removeHighlightDragArea(id) {
  let dragArea = document.getElementById(id);
  dragArea.classList.remove("board-highlight-drag-area");
}

/**
 * Sucht nach Aufgaben basierend auf dem Eingabewert und filtert die angezeigten Aufgaben.
 */
function searchTasks() {
  let searchField = document.getElementById("boardSearchInput").value.toLowerCase();
  let taskCards = document.querySelectorAll(".board-cards");
  if (searchField === "") {
    showAllTasks(taskCards);
    hideNoResultsError();
  } else {
    filterTasks(searchField, taskCards);
  }
}

/**
 * Zeigt alle Aufgaben an, indem ihre Anzeige auf "flex" gesetzt wird.
 *
 * @param {NodeListOf<HTMLElement>} taskCards - Die Liste der Aufgaben-DOM-Elemente.
 */
function showAllTasks(taskCards) {
  taskCards.forEach(taskCard => {
    taskCard.style.display = "flex";
  });
}

/**
 * Aktualisiert die Sichtbarkeit einer Aufgabe basierend auf einem Filterkriterium.
 *
 * @param {HTMLElement} taskCard - Das DOM-Element der Aufgabe.
 * @param {boolean} shouldShow - Gibt an, ob die Aufgabe angezeigt werden soll.
 */
function updateTaskVisibility(taskCard, shouldShow) {
  taskCard.style.display = shouldShow ? "flex" : "none";
}

/**
 * Filtert Aufgaben basierend auf dem Suchbegriff und aktualisiert die Anzeige.
 *
 * @param {string} searchField - Der Suchbegriff.
 * @param {NodeListOf<HTMLElement>} taskCards - Die Liste der Aufgaben-DOM-Elemente.
 */
function filterTasks(searchField, taskCards) {
  let matchFound = false;
  taskCards.forEach(taskCard => {
    let title = taskCard.querySelector(".board-card-title").innerText.toLowerCase();
    let description = taskCard.querySelector(".board-card-description").innerText.toLowerCase();
    let isMatch = title.includes(searchField) || description.includes(searchField);
    updateTaskVisibility(taskCard, isMatch);
    if (isMatch) matchFound = true;
  });
  matchFound ? hideNoResultsError() : showNoResultsError();
}

/**
 * Zeigt eine Fehlermeldung an, wenn keine Aufgaben gefunden wurden.
 */
function showNoResultsError() {
  document.querySelector(".board-no-results").style.display = "flex";
  document.querySelector(".board-search-input").classList.add("board-no-results-error");
}

/**
 * Verbirgt die Fehlermeldung, wenn Ergebnisse gefunden wurden.
 */
function hideNoResultsError() {
  document.querySelector(".board-no-results").style.display = "none";
  document.querySelector(".board-search-input").classList.remove("board-no-results-error");
}

/**
 * Rendert das Overlay zur mobilen Verschiebung einer Aufgabe.
 *
 * @param {string} taskId - Die ID der Aufgabe, die verschoben werden soll.
 */
function renderMoveToMobileOverlay(taskId) {
  let overlayContainer = document.getElementById("moveToMobileOverlay");
  overlayContainer.innerHTML = "";
  overlayContainer.innerHTML = generateMoveToMobileOverlayHtml(taskId);
}

/**
 * Schließt das mobile Verschiebungs-Overlay, wenn ein Klick außerhalb des Overlays erfolgt.
 *
 * @param {Event} event - Das Click-Event.
 */
function closeMoveToMobileIfClickOutside(event) {
  let card = document.querySelector('.board-move-to-mobile-card');
  if (!card.contains(event.target)) {
    closeMoveToMobileOverlay();
  }
}

/**
 * Öffnet das mobile Verschiebungs-Overlay für eine bestimmte Aufgabe.
 *
 * @param {Event} event - Das Click-Event.
 * @param {string} taskId - Die ID der Aufgabe, die verschoben werden soll.
 */
function openMoveToMobileOverlay(event, taskId) {
  event.stopPropagation();
  currentDraggedElementMobile = taskId;
  renderMoveToMobileOverlay(taskId);
  let overlay = document.getElementById("moveToMobileOverlay");
  let card = overlay.querySelector('.board-move-to-mobile-card');
  rotateTask(taskId);
  showMoveToOverlay(overlay, card);
}

/**
 * Schließt das mobile Verschiebungs-Overlay und setzt den Drehstatus der Aufgabe zurück.
 */
function closeMoveToMobileOverlay() {
  let overlay = document.getElementById("moveToMobileOverlay");
  let card = overlay.querySelector('.board-move-to-mobile-card');
  hideMoveToOverlay(overlay, card);
  if (currentDraggedElementMobile) {
    resetRotateTaskMobile(currentDraggedElementMobile);
    currentDraggedElementMobile = null;
  }
}

/**
 * Zeigt das mobile Verschiebungs-Overlay an und fügt Animationen hinzu.
 *
 * @param {HTMLElement} overlay - Das Overlay-Element.
 * @param {HTMLElement} card - Das Karten-Element innerhalb des Overlays.
 */
function showMoveToOverlay(overlay, card) {
  overlay.style.display = "flex";
  overlay.classList.add('fadeInMoveToMobile');
  card.classList.add('slideInMoveToMobile');
}

/**
 * Verbirgt das mobile Verschiebungs-Overlay und entfernt Animationen.
 *
 * @param {HTMLElement} overlay - Das Overlay-Element.
 * @param {HTMLElement} card - Das Karten-Element innerhalb des Overlays.
 */
function hideMoveToOverlay(overlay, card) {
  card.classList.remove('slideInMoveToMobile');
  card.classList.add('slideOutMoveToMobile');
  overlay.classList.remove('fadeInMoveToMobile');
  overlay.classList.add('fadeOutMoveToMobile');
  setTimeout(() => {
    overlay.style.display = "none";
    overlay.classList.remove('fadeOutMoveToMobile');
    card.classList.remove('slideOutMoveToMobile');
  }, 300);
}

/**
 * Verschiebt eine Aufgabe zu einem neuen Status in der mobilen Ansicht und aktualisiert das Board.
 *
 * @async
 * @param {string} status - Der neue Status der Aufgabe.
 * @param {string} taskId - Die ID der Aufgabe, die verschoben werden soll.
 */
async function moveTaskToMobile(status, taskId) {
  let firebaseId = getFirebaseIdByTaskId(taskId);
  if (firebaseId) {
    await updateTaskStatusInFirebase(firebaseId, status);
    await updateBoard();
  }
  closeMoveToMobileOverlay();
}

/**
 * Scrollt zu einer bestimmten Sektion basierend auf der URL-Parameter 'scrollTo'.
 */
function scrollToSection() {
  let urlParams = new URLSearchParams(window.location.search);
  let scrollTo = urlParams.get('scrollTo');
  if (scrollTo) {
    let targetElement = document.getElementById(scrollTo);
    if (targetElement) {
      targetElement.scrollIntoView();

      let newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }
}
