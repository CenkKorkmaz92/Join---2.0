/**
 * Array zur Speicherung der Benutzerdaten.
 *
 * @type {Array<Object>}
 */
let users = [];

/**
 * Initialisiert den Anmeldeprozess, lädt alle Benutzer und füllt das Anmeldeformular aus, falls Daten vorhanden sind.
 *
 * @async
 * @returns {Promise<void>}
 */
async function initSignUp() {
  await getAllUsers();
}

/**
 * Holt alle Benutzer aus der Firebase Realtime Database und speichert sie im `users` Array.
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
 * Fügt einen neuen Benutzer zur Firebase Realtime Database hinzu.
 *
 * @async
 * @param {Object} newUser - Das neue Benutzerobjekt, das hinzugefügt werden soll.
 * @returns {Promise<Object>} Ein Objekt mit der neuen Benutzer-ID.
 */
async function addNewUser(newUser) {
  let usersResponse = await getData("users");
  let userKeysArray = usersResponse ? Object.keys(usersResponse) : [];
  let newUserId = userKeysArray.length;
  await fetch(`${BASE_URL}users/${newUserId}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  });
  return { newUserId };
}

/**
 * Aktualisiert das Icon eines Eingabefeldes basierend auf dessen Inhalt.
 *
 * @param {HTMLInputElement} inputField - Das Eingabefeld, dessen Icon aktualisiert werden soll.
 */
function updateIconOnInput(inputField) {
  let passwordValue = inputField.value;
  let inputFieldImg = inputField.nextElementSibling.querySelector("img");
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
 * Zeigt oder versteckt das Passwortfeld basierend auf dem aktuellen Icon.
 *
 * @param {HTMLImageElement} inputFieldImg - Das Bild-Element des Passwortfeld-Icons.
 */
function showHidePassword(inputFieldImg) {
  let inputField = inputFieldImg.parentNode.previousElementSibling;
  switch (true) {
    case inputFieldImg.src.includes("lock.svg"):
      // Kein Wechsel, da das Icon ein Schloss darstellt.
      break;
    case inputFieldImg.src.includes("visibility_off.svg"):
      // Passwort sichtbar machen.
      inputFieldImg.src = "./assets/icons/visibility.svg";
      inputField.type = "text";
      break;
    case inputFieldImg.src.includes("visibility.svg"):
      // Passwort verstecken.
      inputFieldImg.src = "./assets/icons/visibility_off.svg";
      inputField.type = "password";
      break;
  }
}

/**
 * Validiert das Registrierungsformular, überprüft die E-Mail und das Passwort und fügt einen neuen Benutzer hinzu, wenn alle Validierungen bestehen.
 *
 * @async
 * @returns {Promise<void>}
 */
async function validateSignUpForm() {
  let isEmailValid = checkIfMailExists();
  let isPasswordValid = checkIfPasswordsMatch();
  if (isEmailValid && isPasswordValid) {
    let newUser = createNewUserObject();
    try {
      successfullSignUpOverlay();
      await addNewUser(newUser);
      redirectToLogin();
    } catch (error) {
      console.error('Error adding new user:', error);
    }
  }
}

/**
 * Zeigt eine Erfolgsüberlagerung nach erfolgreicher Registrierung an.
 */
function successfullSignUpOverlay() {
  let overlay = document.getElementById('signUpSuccessfull');
  let container = overlay.querySelector('.signup-successfull-container');
  overlay.style.display = 'flex';
  container.classList.add('slide-up');
}

/**
 * Leitet den Benutzer nach einer erfolgreichen Registrierung zur Login-Seite weiter.
 */
function redirectToLogin() {
  setTimeout(() => {
    window.location.href = './index.html';
  }, 1500);
}

/**
 * Erstellt ein neues Benutzerobjekt basierend auf den Eingabefeldern im Registrierungsformular.
 *
 * @returns {Object} Das neue Benutzerobjekt.
 */
function createNewUserObject() {
  let newUser = {
    id: generateUUID(),
    email: document.getElementById("email").value.trim(),
    initials: setUserInitials(),
    name: formatUserName(),
    password: document.getElementById("password").value,
  };
  return newUser;
}

/**
 * Überprüft, ob die beiden Passwortfelder übereinstimmen.
 *
 * @returns {boolean} True, wenn die Passwörter übereinstimmen, sonst false.
 */
function checkIfPasswordsMatch() {
  let passwordField = document.getElementById("password");
  let confirmPasswordField = document.getElementById("confirmPassword");
  let errorMessage = document.getElementById("signUpErrorMessage");
  if (passwordField.value === confirmPasswordField.value) {
    errorMessage.style.visibility = "hidden";
    confirmPasswordField.classList.remove("signup-input-error");
    return true;
  } else {
    errorMessage.style.visibility = "visible";
    confirmPasswordField.classList.add("signup-input-error");
    return false;
  }
}

/**
 * Überprüft, ob die eingegebene E-Mail-Adresse bereits in den Benutzerdaten existiert.
 *
 * @returns {boolean} True, wenn die E-Mail nicht existiert (also gültig ist), sonst false.
 */
function checkIfMailExists() {
  let emailField = document.getElementById("email");
  let errorMessage = document.getElementById("signUpEmailTaken");
  let emailExists = users.some((user) => user.email === emailField.value.trim());
  if (!emailExists) {
    errorMessage.style.display = "none";
    emailField.classList.remove("signup-input-error");
    return true;
  } else {
    errorMessage.style.display = "block";
    emailField.classList.add("signup-input-error");
    return false;
  }
}

/**
 * Setzt die Initialen eines Benutzers basierend auf seinem Namen.
 *
 * @returns {string} Die ermittelten Initialen.
 */
function setUserInitials() {
  let userName = document.getElementById("name").value.toLowerCase();
  let nameParts = userName.split(" ");
  let initials = nameParts.map((part) => part.charAt(0).toUpperCase()).join("");
  return initials;
}

/**
 * Formatiert den Namen eines Benutzers, indem jeder Teil des Namens mit einem Großbuchstaben beginnt.
 *
 * @returns {string} Der formatierte Benutzername.
 */
function formatUserName() {
  let userNameInput = document.getElementById("name");
  let userName = userNameInput.value.trim();
  let formattedUserName = userName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  return formattedUserName;
}

/**
 * Generiert eine eindeutige UUID für einen neuen Benutzer.
 *
 * @returns {string} Die generierte UUID.
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
