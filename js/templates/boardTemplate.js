function generateSingleTaskHtml(task) {
  return /*html*/ `
    <div onclick="openTaskDetails(${task.id})" id="${task.id}" class="board-cards" draggable="true"
    ondragstart="startDragging(${task.id})" ondragend="resetRotateTask(this)">
      ${checkSingleTaskCategory(task.Category)}
      <div class="board-card-text-container">
          <span class="board-card-text board-card-title">${task.Title}</span>
          ${checkSingleTaskDescription(task.Description)}
      </div>
      ${renderSingleTaskSubtask(task.Subtasks)}
      <div class="board-card-profiles-priority">
          <div class="board-card-profile-badges">
              ${generateAssignedToProfileBadges(task.Assigned_to)}
          </div>
          ${checkSingleTaskPriority(task.Prio)}
      </div>
      <div onclick="openMoveToMobileOverlay(event, ${task.id})" class="board-card-category-icon"></div>
    </div>
    `;
}


function generateSingleTaskSubtaskHtml(progressPercentage, completedSubtasks, totalSubtasks) {
  return /*html*/ `
      <div class="board-card-subtask-container">
        <div class="board-card-progress-bar">
            <div class="board-card-progress-fill" style="width: ${progressPercentage}%;" role="progressbar"></div>
        </div>
        <div class="board-card-progress-text">
            <span>${completedSubtasks}/${totalSubtasks} Subtasks</span>
        </div>
      </div>
    `;
}


function generateSingleTaskCategoryHtml(categoryClass, categoryLabel) {
  return /*html*/ `
      <div class="${categoryClass}">
        <span>${categoryLabel}</span>
      </div>`;
}


function generateMoveToMobileOverlayHtml(taskId) {
  return /*html*/ `
    <div class="board-move-to-mobile-card">
      <h2 class="board-move-to-title">Move Task to</h2>
      <button class="board-move-to-buttons" onclick="moveTaskToMobile('to do', ${taskId})">To do</button>
      <button class="board-move-to-buttons" onclick="moveTaskToMobile('in progress', ${taskId})">In progress</button>
      <button class="board-move-to-buttons" onclick="moveTaskToMobile('await feedback', ${taskId})">Await feedback</button>
      <button class="board-move-to-buttons" onclick="moveTaskToMobile('done', ${taskId})">Done</button>
      <img class="board-move-to-xmark" src="./assets/icons/close-contact.svg" alt="" onclick="closeMoveToMobileOverlay()">
    </div>
    `;
}