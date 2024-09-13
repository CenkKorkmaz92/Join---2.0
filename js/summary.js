let tasks = [];


async function initSummary() {
  await init();
  getGreeting();
  displayUserName();
  getGreetingAndUserNameMobile();
  await loadTasksFromFirebase();
  displaySummaryMetrics();
}


function getGreetingMessage(time) {
  switch (true) {
    case time >= 0 && time < 6:
      return "Good Night";
    case time >= 6 && time < 12:
      return "Good Morning";
    case time >= 12 && time < 14:
      return "Good Noon";
    case time >= 14 && time < 18:
      return "Good Afternoon";
    case time >= 18 && time < 24:
      return "Good Evening";
    default:
      return "Hello";
  }
}


function getGreeting() {
  let time = new Date().getHours();
  let greeting = getGreetingMessage(time);
  greeting += addCommaIfUserIsLoggedIn();
  document.getElementById("summaryGreeting").innerHTML = greeting;
}


function displayUserName() {
  let user = localStorage.getItem("user");
  if (user) {
    let userData = JSON.parse(atob(user));
    let userId = userData.id;
    let foundUser = searchUserById(userId);
    if (foundUser && foundUser.name) {
      document.getElementById("summaryGreetingName").innerHTML = foundUser.name;
    }
  }
}


function addCommaIfUserIsLoggedIn() {
  return localStorage.getItem("user") ? "," : "";
}


function getGreetingAndUserNameMobile() {
  let getGreeting = document.getElementById("summaryGreeting").innerText;
  let getUserName = document.getElementById("summaryGreetingName").innerText;
  let greetingElement = document.getElementById("summaryGreetingMobile");
  let getUserNameElement = document.getElementById("summaryGreetingNameMobile");
  if (getUserName === "") {
    greetingElement.innerHTML = getGreeting + "!";
  } else {
    greetingElement.innerHTML = getGreeting;
    getUserNameElement.innerHTML = getUserName;
  }
  addAnimationToGreetingMobile();
}


function addAnimationToGreetingMobile() {
  let loginPage = document.referrer.includes("index.html") || localStorage.getItem('cameFromLogin');
  let greetingContainer = document.querySelector(".summary-greeting-mobile");
  if (loginPage) {
    greetingContainer.style.animation = "fadeOutGreetingMobile 2.5s forwards";
    setTimeout(() => {
      greetingContainer.classList.add("d-none");
    }, 2500);
    localStorage.removeItem('cameFromLogin');
  } else {
    greetingContainer.style.display = "none";
  }
}


function displaySummaryMetrics(){
  updateTaskCounts();
  updateUrgentTaskCount();
  updateUpcomingDeadline();
}


async function loadTasksFromFirebase() {
  try {
    const fetchedTasks = await getData("tasks");
    tasks = Object.keys(fetchedTasks).map((key) => ({
      firebaseId: key,
      ...fetchedTasks[key],
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    alert("Failed to load tasks. Please try again later.");
  }
}


function countTasksByStatus(status) {
  return tasks.filter(task => task.Status?.toLowerCase() === status).length;
}


function updateTaskCounts() {
  let toDoTasks = countTasksByStatus("to do");
  let doneTasks = countTasksByStatus("done");
  let inProgressTasks = countTasksByStatus("in progress");
  let awaitFeedbackTasks = countTasksByStatus("await feedback");
  let totalTasks = tasks.length;
  document.getElementById("toDo").innerHTML = toDoTasks;
  document.getElementById("done").innerHTML = doneTasks;
  document.getElementById("inProgress").innerHTML = inProgressTasks;
  document.getElementById("awaitFeedback").innerHTML = awaitFeedbackTasks;
  document.getElementById("totalTasks").innerHTML = totalTasks;
  updateTaskCountsText(totalTasks, inProgressTasks);
}


function updateTaskCountsText(totalTasks, inProgressTasks) {
  document.getElementById("taskBoardText").innerHTML = `${totalTasks === 1 ? "Task" : "Tasks"} in <br> Board`;
  document.getElementById("taskProgressText").innerHTML = `${inProgressTasks === 1 ? "Task" : "Tasks"} in <br> Progress`;
}


function countUrgentTasks(){
  return tasks.filter(task => task.Prio?.toLowerCase() === "urgent").length;
}


function updateUrgentTaskCount() {
  let urgentTasks = countUrgentTasks();
  document.getElementById("urgent").innerHTML = urgentTasks;
}


function getUpcomingDeadline() {
  let now = new Date();
  let tasksWithFutureDueDate = tasks.filter(task => task.Due_date && new Date(task.Due_date) > now);
  tasksWithFutureDueDate.sort((a, b) => new Date(a.Due_date) - new Date(b.Due_date));
  return tasksWithFutureDueDate.length > 0 ? tasksWithFutureDueDate[0] : null;
}


function updateUpcomingDeadline() {
  let upcomingDeadlineDate = document.getElementById("upcomingDeadlineDate");
  let upcomingDeadlineText = document.getElementById("upcomingDeadlineText");
  let upcomingTask = getUpcomingDeadline();
  if (upcomingTask) {
    upcomingDeadlineDate.innerHTML = new Date(upcomingTask.Due_date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } else {
    setNoUpcomingDeadline(upcomingDeadlineDate, upcomingDeadlineText);
  }
}


function setNoUpcomingDeadline(upcomingDeadlineElement, upcomingDeadlineLabel) {
  upcomingDeadlineElement.innerHTML = "";
  upcomingDeadlineElement.style.display = "none";
  upcomingDeadlineLabel.innerHTML = "No upcoming deadline";
}

