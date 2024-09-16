/**
 * Generates the HTML for a single task card.
 *
 * @param {Object} task - The task object containing all necessary details.
 * @param {number|string} task.id - The unique identifier for the task.
 * @param {string} task.Category - The category of the task.
 * @param {string} task.Title - The title of the task.
 * @param {string} task.Description - The description of the task.
 * @param {Object} task.Subtasks - The subtasks associated with the task.
 * @param {Object} task.Assigned_to - The contacts assigned to the task.
 * @param {string} task.Prio - The priority level of the task.
 * @returns {string} The HTML string representing the task card.
 */
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

/**
 * Generates the HTML for the subtask section of a single task card.
 *
 * @param {number} progressPercentage - The completion percentage of the subtasks.
 * @param {number} completedSubtasks - The number of completed subtasks.
 * @param {number} totalSubtasks - The total number of subtasks.
 * @returns {string} The HTML string representing the subtask progress bar and text.
 */
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

/**
 * Generates the HTML for the category label of a single task card.
 *
 * @param {string} categoryClass - The CSS class representing the category style.
 * @param {string} categoryLabel - The label text for the category.
 * @returns {string} The HTML string representing the category section.
 */
function generateSingleTaskCategoryHtml(categoryClass, categoryLabel) {
  return /*html*/ `
      <div class="${categoryClass}">
        <span>${categoryLabel}</span>
      </div>`;
}

/**
 * Generates the HTML for the "Move to" overlay on mobile devices.
 *
 * @param {number|string} taskId - The unique identifier for the task to move.
 * @returns {string} The HTML string representing the mobile overlay for moving the task.
 */
function generateMoveToMobileOverlayHtml(taskId) {
  return /*html*/ `
    <div class="board-move-to-mobile-card">
      <h2 class="board-move-to-title">Move Task to</h2>
      <button class="board-move-to-buttons" onclick="moveTaskToMobile('to do', ${taskId})">To do</button>
      <button class="board-move-to-buttons" onclick="moveTaskToMobile('in progress', ${taskId})">In progress</button>
      <button class="board-move-to-buttons" onclick="moveTaskToMobile('await feedback', ${taskId})">Await feedback</button>
      <button class="board-move-to-buttons" onclick="moveTaskToMobile('done', ${taskId})">Done</button>
      <img class="board-move-to-xmark" src="./assets/icons/close-contact.svg" alt="Close" onclick="closeMoveToMobileOverlay()">
    </div>
    `;
}
