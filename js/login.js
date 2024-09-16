/**
 * Array zur Speicherung der Benutzerdaten.
 *
 * @type {Array<Object>}
 */
let users = [];

/**
 * Initialisiert den Login-Prozess, setzt die Scrollposition zurück, überprüft die vorherige Seite, zeigt die Login-Seite an und lädt alle Benutzer.
 *
 * @async
 * @returns {Promise<void>}
 */
async function initLogin() {
  resetScrollPosition();
  checkPreviousPage();
  displayLoginPage();
  await getAllUsers();
  prefillLoginForm();
}

/**
 * Setzt die Scrollposition der Seite zurück und deaktiviert die automatische Scroll-Wiederherstellung.
 */
function resetScrollPosition() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
}

/**
 * Holt alle Benutzer aus der Datenbank und speichert sie im `users` Array.
 *
 * @async
 * @returns {Promise<void>}
 */
async function getAllUsers() {
  try {
    let usersResponse = await getData("users");
    users = usersResponse ? Object.values(usersResponse) : [];
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

/**
 * Überprüft die vorherige Seite und zeigt entsprechende Animationen oder Elemente basierend darauf an.
 */
function checkPreviousPage() {
  if (!document.referrer.includes("signUp.html")) {
    document.getElementById("loginAnimationBg").style.display = "block";
    document.getElementById("loginJoinLogo").style.display = "block";
    document.getElementById("loginJoinLogoNoAnimation").style.display = "none";
  }
}

/**
 * Zeigt die Login-Seite an, indem das entsprechende DOM-Element sichtbar gemacht wird.
 */
function displayLoginPage() {
  document.getElementById("loginContent").style.display = "flex";
}

/**
 * Navigiert zur Registrierungsseite.
 */
function goToSignUp() {
  window.location.href = "signUp.html";
}

/**
 * Führt einen Gast-Login durch, entfernt vorhandene Benutzerdaten aus dem lokalen Speicher, leert die Login-Felder, speichert Gastdaten und leitet zur Zusammenfassungsseite weiter.
 *
 * @async
 * @returns {Promise<void>}
 */
async function guestLogin() {
  await userLoginRemoveLocalStorage();
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  await guestLoginSaveLocalStorage();
  redirectToSummary();
}

/**
 * Führt einen Benutzer-Login durch, entfernt Gastdaten aus dem lokalen Speicher, speichert die Benutzerdaten und leitet zur Zusammenfassungsseite weiter.
 *
 * @async
 * @param {Object} user - Das Benutzerobjekt, das eingeloggt werden soll.
 * @returns {Promise<void>}
 */
async function userLogin(user) {
  await guestLoginRemoveLocalStorage();
  await userLoginSaveLocalStorage(user);
  redirectToSummary();
}

/**
 * Leitet den Benutzer zur Zusammenfassungsseite weiter und speichert den Ursprung des Navigationsvorgangs im lokalen Speicher.
 */
function redirectToSummary() {
  localStorage.setItem('cameFromLogin', 'true');
  window.location.href = 'summary.html';
}

/**
 * Speichert die Initialen für einen Gastbenutzer im lokalen Speicher.
 *
 * @async
 * @returns {Promise<void>}
 */
async function guestLoginSaveLocalStorage() {
  localStorage.setItem("guestInitials", "G");
}

/**
 * Entfernt die Gast-Initialen aus dem lokalen Speicher.
 *
 * @async
 * @returns {Promise<void>}
 */
async function guestLoginRemoveLocalStorage() {
  localStorage.removeItem("guestInitials");
}

/**
 * Speichert die Benutzerdaten im lokalen Speicher, codiert als Base64-String.
 *
 * @async
 * @param {Object} user - Das Benutzerobjekt, das gespeichert werden soll.
 * @returns {Promise<void>}
 */
async function userLoginSaveLocalStorage(user) {
  let userData = {
    id: user.id,
    rememberMe: document.getElementById("rememberMeCheckbox").checked
  };
  localStorage.setItem("user", btoa(JSON.stringify(userData)));
}

/**
 * Entfernt die Benutzerdaten aus dem lokalen Speicher.
 *
 * @async
 * @returns {Promise<void>}
 */
async function userLoginRemoveLocalStorage() {
  localStorage.removeItem("user");
}

/**
 * Validiert das Login-Formular, überprüft die E-Mail und das Passwort und führt den Login-Prozess durch, wenn die Daten korrekt sind.
 *
 * @async
 * @returns {Promise<void>}
 */
async function validateLoginForm() {
  let email = getEmailFieldValue();
  let password = getPasswordFieldValue();
  let user = users.find((user) => user.email === email && user.password === password);
  let doesEmailExist = checkIfMailExists();
  if (doesEmailExist && user) {
    removeLoginErrorMessage();
    userLogin(user);
  } else {
    showLoginErrorMessage();
  }
}

/**
 * Überprüft, ob die eingegebene E-Mail-Adresse in den Benutzerdaten existiert und zeigt entsprechende Fehlermeldungen an.
 *
 * @returns {boolean} True, wenn die E-Mail existiert, sonst false.
 */
function checkIfMailExists() {
  let emailField = document.getElementById("email");
  let errorMessage = document.getElementById("loginEmailExists");
  let emailExists = users.some((user) => user.email === emailField.value.trim());
  if (emailExists) {
    errorMessage.style.display = "none";
    emailField.classList.remove("login-input-error");
    return true;
  } else {
    errorMessage.style.display = "block";
    emailField.classList.add("login-input-error");
    return false;
  }
}

/**
 * Holt den Wert des Passwortfeldes.
 *
 * @returns {string} Der eingegebene Passwortwert.
 */
function getPasswordFieldValue() {
  let passwordField = document.getElementById("password");
  return passwordField.value;
}

/**
 * Holt den Wert des E-Mail-Feldes.
 *
 * @returns {string} Der eingegebene E-Mail-Wert, getrimmt.
 */
function getEmailFieldValue() {
  let emailField = document.getElementById("email");
  return emailField.value.trim();
}

/**
 * Zeigt eine allgemeine Fehlermeldung für falsche Login-Daten an und markiert das Passwortfeld.
 */
function showLoginErrorMessage() {
  let errorMessage = document.getElementById("loginErrorMessage");
  let passwordField = document.getElementById("password");
  errorMessage.style.visibility = "visible";
  passwordField.classList.add("login-input-error");
}

/**
 * Entfernt die allgemeine Fehlermeldung und markiert das Passwortfeld nicht mehr.
 */
function removeLoginErrorMessage() {
  let errorMessage = document.getElementById("loginErrorMessage");
  let passwordField = document.getElementById("password");
  errorMessage.style.visibility = "hidden";
  passwordField.classList.remove("login-input-error");
}

/**
 * Aktualisiert das Icon des Passwortfeldes basierend auf dem Inhalt des Feldes.
 *
 * @param {HTMLInputElement} inputField - Das Passwort-Eingabefeld.
 */
function updateIconOnInput(inputField) {
  let passwordValue = inputField.value;
  let inputFieldImg = document.getElementById("passwordFieldImg");
  if (passwordValue === "") {
    inputFieldImg.src = "./assets/icons/lock.svg";
    inputFieldImg.classList.remove("cursor-pointer");
    inputField.type = "password";
  } else if (inputFieldImg.src.includes("lock.svg")) {
    inputFieldImg.src = "./assets/icons/visibility_off.svg";
    inputFieldImg.classList.add("cursor-pointer");
  }
}

/**
 * Zeigt oder versteckt das Passwort, basierend auf dem aktuellen Zustand des Icons.
 */
function showHidePassword() {
  let inputField = document.getElementById("password");
  let inputFieldImg = document.getElementById("passwordFieldImg");
  if (inputFieldImg.src.includes("lock.svg")) {
    return;
  } else if (inputFieldImg.src.includes("visibility_off.svg")) {
    inputFieldImg.src = "./assets/icons/visibility.svg";
    inputField.type = "text";
  } else if (inputFieldImg.src.includes("visibility.svg")) {
    inputFieldImg.src = "./assets/icons/visibility_off.svg";
    inputField.type = "password";
  }
}

/**
 * Füllt das Login-Formular mit gespeicherten Benutzerdaten, falls der Benutzer "Remember Me" ausgewählt hat.
 */
function prefillLoginForm() {
  let storedUserData = localStorage.getItem("user");
  if (storedUserData) {
    let userData = JSON.parse(atob(storedUserData));
    if (userData.rememberMe) {
      let user = users.find((u) => u.id === userData.id);
      if (user) {
        updateLoginFields(user);
      }
    }
  }
}

/**
 * Aktualisiert die Login-Felder mit den gespeicherten Benutzerdaten.
 *
 * @param {Object} user - Das Benutzerobjekt mit E-Mail und Passwort.
 */
function updateLoginFields(user) {
  let emailField = document.getElementById("email");
  let passwordField = document.getElementById("password");
  let rememberMeCheckbox = document.getElementById("rememberMeCheckbox");
  emailField.value = user.email;
  passwordField.value = user.password;
  rememberMeCheckbox.checked = true;
  updateIconOnInput(passwordField);
}
