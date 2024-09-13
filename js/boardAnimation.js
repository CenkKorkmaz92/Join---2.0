function rotateTask(taskId) {
  let element = document.getElementById(taskId);
  element.classList.add("board-card-rotate");
}
  

function startDragging(taskId) {
  currentDraggedElement = taskId;
  if (!isMobile) {
    rotateTask(taskId);
  }
}
  

function resetRotateTask(element) {
  element.classList.remove("board-card-rotate");
}


  function resetRotateTaskMobile(taskId) {
    let element = document.getElementById(taskId);
    element.classList.remove("board-card-rotate");
  }
  

function getStatusFromDropContainerId(dropContainerId) {
  let statusMap = {
    "toDo": "to do",
    "inProgress": "in progress",
    "awaitFeedback": "await feedback",
    "done": "done"
  };
  return statusMap[dropContainerId] || null;
}
  

async function updateTaskStatus(firebaseId, newStatus) {
  if (firebaseId) {
    await updateTaskStatusInFirebase(firebaseId, newStatus);
  }
}
  

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
  

function allowDrop(ev) {
  ev.preventDefault();
}
  

function addHighlightDragArea(id) {
  let dragArea = document.getElementById(id);
  dragArea.classList.add("board-highlight-drag-area");
}
  

function removeHighlightDragArea(id) {
  let dragArea = document.getElementById(id);
  dragArea.classList.remove("board-highlight-drag-area");
}


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
  

function showAllTasks(taskCards) {
  taskCards.forEach(taskCard => {
    taskCard.style.display = "flex";
  });
}
  

function updateTaskVisibility(taskCard, shouldShow) {
  taskCard.style.display = shouldShow ? "flex" : "none";
}
  

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
  

function showNoResultsError() {
  document.querySelector(".board-no-results").style.display = "flex";
  document.querySelector(".board-search-input").classList.add("board-no-results-error");
}
  

function hideNoResultsError() {
  document.querySelector(".board-no-results").style.display = "none";
  document.querySelector(".board-search-input").classList.remove("board-no-results-error");
}


function renderMoveToMobileOverlay(taskId) {
  let overlayContainer = document.getElementById("moveToMobileOverlay");
  overlayContainer.innerHTML = "";
  overlayContainer.innerHTML = generateMoveToMobileOverlayHtml(taskId);
}
  

function closeMoveToMobileIfClickOutside(event) {
  let card = document.querySelector('.board-move-to-mobile-card');
    if (!card.contains(event.target)) {
        closeMoveToMobileOevrlay();
    }
}
  

function openMoveToMobileOverlay(event, taskId) {
  event.stopPropagation();
  currentDraggedElementMobile = taskId; 
  renderMoveToMobileOverlay(taskId); 
  let overlay = document.getElementById("moveToMobileOverlay");
  let card = overlay.querySelector('.board-move-to-mobile-card');
  rotateTask(taskId);
  showMoveToOverlay(overlay, card);
}
  

function closeMoveToMobileOverlay() {
  let overlay = document.getElementById("moveToMobileOverlay");
  let card = overlay.querySelector('.board-move-to-mobile-card');
  hideMoveToOverlay(overlay, card);
  if (currentDraggedElementMobile) {
    resetRotateTaskMobile(currentDraggedElementMobile);
    currentDraggedElementMobile = null;
  }
}
  

function showMoveToOverlay(overlay, card) {
  overlay.style.display = "flex"; 
  overlay.classList.add('fadeInMoveToMobile'); 
  card.classList.add('slideInMoveToMobile'); 
}
  

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
  

async function moveTaskToMobile(status, taskId) {
  let firebaseId = getFirebaseIdByTaskId(taskId);
  if (firebaseId) {
      await updateTaskStatusInFirebase(firebaseId, status);
      await updateBoard();
  }
  closeMoveToMobileOverlay();
}


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