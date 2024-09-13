let users = [];


async function initLogin() {
  resetScrollPosition();
  checkPreviousPage();
  displayLoginPage();
  await getAllUsers();
  prefillLoginForm();
}


function resetScrollPosition() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
}


async function getAllUsers() {
  try {
    let usersResponse = await getData("users");
    users = usersResponse ? Object.values(usersResponse) : [];
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}


function checkPreviousPage() {
  if (!document.referrer.includes("signUp.html")) {
    document.getElementById("loginAnimationBg").style.display = "block";
    document.getElementById("loginJoinLogo").style.display = "block";
    document.getElementById("loginJoinLogoNoAnimation").style.display = "none";
  }
}


function displayLoginPage() {
  document.getElementById("loginContent").style.display = "flex";
}


function goToSignUp() {
  window.location.href = "signUp.html";
}


async function guestLogin() {
  await userLoginRemoveLocalStorage();  
  document.getElementById("email").value = "";  
  document.getElementById("password").value = "";  
  await guestLoginSaveLocalStorage();
  redirectToSummary();
}


async function userLogin(user) {
  await guestLoginRemoveLocalStorage();
  await userLoginSaveLocalStorage(user);
  redirectToSummary();
}


function redirectToSummary() {
  localStorage.setItem('cameFromLogin', 'true');
  window.location.href = 'summary.html';
}


async function guestLoginSaveLocalStorage() {
  localStorage.setItem("guestInitials", "G");
}


async function guestLoginRemoveLocalStorage() {
  localStorage.removeItem("guestInitials");
}


async function userLoginSaveLocalStorage(user) {
  let userData = {
    id: user.id,
    rememberMe: document.getElementById("rememberMeCheckbox").checked
};
  localStorage.setItem("user", btoa(JSON.stringify(userData)));
}


async function userLoginRemoveLocalStorage() {
  localStorage.removeItem("user");
}


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


function getPasswordFieldValue() {
  let passwordField = document.getElementById("password");
  return passwordField.value;
}


function getEmailFieldValue() {
  let emailField = document.getElementById("email");
  return emailField.value.trim();
}


function showLoginErrorMessage() {
  let errorMessage = document.getElementById("loginErrorMessage");
  let passwordField = document.getElementById("password");
  errorMessage.style.visibility = "visible";
  passwordField.classList.add("login-input-error");
}


function removeLoginErrorMessage() {
  let errorMessage = document.getElementById("loginErrorMessage");
  let passwordField = document.getElementById("password");
  errorMessage.style.visibility = "hidden";
  passwordField.classList.remove("login-input-error");
}


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


function updateLoginFields(user) {
  let emailField = document.getElementById("email");
  let passwordField = document.getElementById("password");
  let rememberMeCheckbox = document.getElementById("rememberMeCheckbox");
  emailField.value = user.email;
  passwordField.value = user.password;
  rememberMeCheckbox.checked = true;
  updateIconOnInput(passwordField);
}



