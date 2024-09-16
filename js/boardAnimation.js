/**
 * Rotates a task card by adding a CSS class.
 *
 * @param {number} taskId - The ID of the task to rotate.
 */
function rotateTask(taskId) {
  let element = document.getElementById(taskId);
  element.classList.add("board-card-rotate");
}


/**
 * Initiates the dragging process for a task card.
 * Stores the ID of the task being dragged and rotates the task card if the device is not mobile.
 *
 * @param {number} taskId - The ID of the task being dragged. This ID is stored as the current dragged element.
 */
function startDragging(taskId) {
  currentDraggedElement = taskId;
  if (!isMobile) {
    rotateTask(taskId);
  }
}


/**
 * Resets the rotation of a task card by removing a CSS class.
 *
 * @param {HTMLElement} element - The task card element to reset.
 */
function resetRotateTask(element) {
  element.classList.remove("board-card-rotate");
}


/**
* Resets the rotation of a task card for mobile devices by removing a CSS class.
*
* @param {string} taskId - The ID of the task to reset. The function will find the element 
*                          by this ID and remove the "board-card-rotate" class.
*/
function resetRotateTaskMobile(taskId) {
  let element = document.getElementById(taskId);
  element.classList.remove("board-card-rotate");
}


/**
 * Maps a drop container ID to a task status.
 *
 * @param {string} dropContainerId - The ID of the drop container.
 * @returns {string|null} The corresponding task status, or null if not found.
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
 * Updates the status of a task in Firebase if a valid Firebase ID is provided.
 *
 * @param {string} firebaseId - The Firebase ID of the task to update.
 * @param {string} newStatus - The new status of the task.
 */
async function updateTaskStatus(firebaseId, newStatus) {
  if (firebaseId) {
    await updateTaskStatusInFirebase(firebaseId, newStatus);
  }
}


/**
 * Moves a task to a different status based on the drop container it was dragged to.
 * After updating the status in Firebase, the board is refreshed.
 *
 * @param {string} dropContainerId - The ID of the drop container the task was moved to.
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
 * Allows a task card to be dropped into a container by preventing the default behavior.
 *
 * @param {Event} ev - The drag event.
 */
function allowDrop(ev) {
  ev.preventDefault();
}


/**
 * Highlights a drag area by adding a CSS class when a task is dragged over it.
 *
 * @param {string} id - The ID of the drag area to highlight.
 */
function addHighlightDragArea(id) {
  let dragArea = document.getElementById(id);
  dragArea.classList.add("board-highlight-drag-area");
}


/**
 * Removes the highlight from a drag area by removing a CSS class.
 *
 * @param {string} id - The ID of the drag area to unhighlight.
 */
function removeHighlightDragArea(id) {
  let dragArea = document.getElementById(id);
  dragArea.classList.remove("board-highlight-drag-area");
}


/**
 * Filters and displays tasks on the board based on the search input.
 * If no search term is entered, all tasks are shown.
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
 * Displays all task cards on the board.
 *
 * @param {NodeList} taskCards - A NodeList of all task cards.
 */
function showAllTasks(taskCards) {
  taskCards.forEach(taskCard => {
    taskCard.style.display = "flex";
  });
}


/**
 * Updates the visibility of a task card based on whether it should be shown or hidden.
 *
 * @param {HTMLElement} taskCard - The task card element.
 * @param {boolean} shouldShow - Whether the task card should be shown or hidden.
 */
function updateTaskVisibility(taskCard, shouldShow) {
  taskCard.style.display = shouldShow ? "flex" : "none";
}


/**
 * Filters tasks based on the search term and updates their visibility.
 * If no tasks match the search term, a "No results" message is shown.
 *
 * @param {string} searchField - The search term entered by the user.
 * @param {NodeList} taskCards - A NodeList of all task cards.
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
 * Displays a "No results" error message if no tasks match the search term.
 */
function showNoResultsError() {
  document.querySelector(".board-no-results").style.display = "flex";
  document.querySelector(".board-search-input").classList.add("board-no-results-error");
}


/**
 * Hides the "No results" error message.
 */
function hideNoResultsError() {
  document.querySelector(".board-no-results").style.display = "none";
  document.querySelector(".board-search-input").classList.remove("board-no-results-error");
}


/**
 * Renders the "Move Task to" overlay for mobile view.
 * The overlay allows users to move tasks to different status categories.
 *
 * @param {number} taskId - The ID of the task for which the overlay is being rendered.
 */
function renderMoveToMobileOverlay(taskId) {
  let overlayContainer = document.getElementById("moveToMobileOverlay");
  overlayContainer.innerHTML = "";
  overlayContainer.innerHTML = generateMoveToMobileOverlayHtml(taskId);
}


/**
 * Closes the "Move Task to" mobile overlay if the user clicks outside of the overlay card.
 *
 * @param {Event} event - The click event.
 */
function closeMoveToMobileIfClickOutside(event) {
  let card = document.querySelector('.board-move-to-mobile-card');
  if (!card.contains(event.target)) {
    closeMoveToMobileOevrlay();
  }
}


/**
 * Opens the "Move Task to" mobile overlay and applies animation effects.
 *
 * @param {Event} event - The event that triggered the overlay.
 * @param {number} taskId - The ID of the task for which the overlay is being opened.
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
 * Closes the "Move Task to" mobile overlay with animation effects.
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
 * Displays the "Move Task to" mobile overlay with a fade-in and slide-in animation.
 *
 * @param {HTMLElement} overlay - The overlay element.
 * @param {HTMLElement} card - The card element within the overlay.
 */
function showMoveToOverlay(overlay, card) {
  overlay.style.display = "flex";
  overlay.classList.add('fadeInMoveToMobile');
  card.classList.add('slideInMoveToMobile');
}


/**
 * Hides the "Move Task to" mobile overlay with a fade-out and slide-out animation.
 *
 * @param {HTMLElement} overlay - The overlay element.
 * @param {HTMLElement} card - The card element within the overlay.
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
 * Moves a task to a new status in the mobile view.
 * After updating the task status in Firebase, the board is refreshed.
 *
 * @param {string} status - The new status to move the task to.
 * @param {number} taskId - The ID of the task being moved.
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
 * Scrolls the page to a specific section based on the 'scrollTo' parameter in the URL.
 * After scrolling, it removes the 'scrollTo' parameter from the URL to avoid repeated scrolling
 * on page reloads.
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