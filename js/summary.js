/**
 * Array zur Speicherung der Aufgaben.
 *
 * @type {Array<Object>}
 */
let tasks = [];

/**
 * Initialisiert die Zusammenfassungsseite, lädt Benutzerdaten, zeigt Begrüßungen an und lädt Aufgaben.
 *
 * @async
 * @returns {Promise<void>}
 */
async function initSummary() {
  await init();
  getGreeting();
  displayUserName();
  getGreetingAndUserNameMobile();
  await loadTasksFromFirebase();
  displaySummaryMetrics();
}

/**
 * Gibt eine Begrüßungsnachricht basierend auf der aktuellen Uhrzeit zurück.
 *
 * @param {number} time - Die aktuelle Stunde im 24-Stunden-Format.
 * @returns {string} Die entsprechende Begrüßungsnachricht.
 */
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

/**
 * Zeigt die Begrüßungsnachricht im Desktop-Layout an.
 */
function getGreeting() {
  let time = new Date().getHours();
  let greeting = getGreetingMessage(time);
  greeting += addCommaIfUserIsLoggedIn();
  document.getElementById("summaryGreeting").innerHTML = greeting;
}

/**
 * Zeigt den Namen des aktuellen Benutzers in der Zusammenfassung an.
 */
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

/**
 * Fügt ein Komma zur Begrüßungsnachricht hinzu, wenn ein Benutzer eingeloggt ist.
 *
 * @returns {string} Ein Komma oder ein leerer String.
 */
function addCommaIfUserIsLoggedIn() {
  return localStorage.getItem("user") ? "," : "";
}

/**
 * Zeigt die Begrüßungsnachricht und den Benutzernamen im mobilen Layout an.
 */
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

/**
 * Fügt eine Animation zur Begrüßungsnachricht im mobilen Layout hinzu, basierend darauf, ob der Benutzer gerade eingeloggt ist.
 */
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

/**
 * Zeigt die Zusammenfassungsmetriken an, einschließlich Aufgabenanzahlen und dringenden Aufgaben.
 */
function displaySummaryMetrics() {
  updateTaskCounts();
  updateUrgentTaskCount();
  updateUpcomingDeadline();
}

/**
 * Lädt die Aufgaben von Firebase und speichert sie im `tasks` Array.
 *
 * @async
 * @returns {Promise<void>}
 */
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

/**
 * Zählt die Anzahl der Aufgaben mit einem bestimmten Status.
 *
 * @param {string} status - Der Status, nach dem gezählt werden soll (z.B. "to do", "done").
 * @returns {number} Die Anzahl der Aufgaben mit dem angegebenen Status.
 */
function countTasksByStatus(status) {
  return tasks.filter(task => task.Status?.toLowerCase() === status).length;
}

/**
 * Aktualisiert die Aufgabenanzahlen in der Benutzeroberfläche.
 */
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

/**
 * Aktualisiert die Textanzeigen für die Aufgabenanzahlen.
 *
 * @param {number} totalTasks - Die Gesamtanzahl der Aufgaben.
 * @param {number} inProgressTasks - Die Anzahl der Aufgaben, die sich in Bearbeitung befinden.
 */
function updateTaskCountsText(totalTasks, inProgressTasks) {
  document.getElementById("taskBoardText").innerHTML = `${totalTasks === 1 ? "Task" : "Tasks"} in <br> Board`;
  document.getElementById("taskProgressText").innerHTML = `${inProgressTasks === 1 ? "Task" : "Tasks"} in <br> Progress`;
}

/**
 * Zählt die Anzahl der dringenden Aufgaben.
 *
 * @returns {number} Die Anzahl der dringenden Aufgaben.
 */
function countUrgentTasks() {
  return tasks.filter(task => task.Prio?.toLowerCase() === "urgent").length;
}

/**
 * Aktualisiert die Anzahl der dringenden Aufgaben in der Benutzeroberfläche.
 */
function updateUrgentTaskCount() {
  let urgentTasks = countUrgentTasks();
  document.getElementById("urgent").innerHTML = urgentTasks;
}

/**
 * Holt die nächste bevorstehende Frist aus den Aufgaben.
 *
 * @returns {Object|null} Die Aufgabe mit dem nächsten bevorstehenden Datum oder null, wenn keine vorhanden ist.
 */
function getUpcomingDeadline() {
  let now = new Date();
  let tasksWithFutureDueDate = tasks.filter(task => task.Due_date && new Date(task.Due_date) > now);
  tasksWithFutureDueDate.sort((a, b) => new Date(a.Due_date) - new Date(b.Due_date));
  return tasksWithFutureDueDate.length > 0 ? tasksWithFutureDueDate[0] : null;
}

/**
 * Aktualisiert die Anzeige der nächsten bevorstehenden Frist in der Benutzeroberfläche.
 */
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

/**
 * Setzt die Anzeige für keine bevorstehende Frist.
 *
 * @param {HTMLElement} upcomingDeadlineElement - Das Element, das das Datum anzeigen soll.
 * @param {HTMLElement} upcomingDeadlineLabel - Das Element, das den Text anzeigen soll.
 */
function setNoUpcomingDeadline(upcomingDeadlineElement, upcomingDeadlineLabel) {
  upcomingDeadlineElement.innerHTML = "";
  upcomingDeadlineElement.style.display = "none";
  upcomingDeadlineLabel.innerHTML = "No upcoming deadline";
}
