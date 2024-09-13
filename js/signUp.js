let users = [];


async function initSignUp() {
  await getAllUsers();
}


async function getAllUsers() {
  try {
    let usersResponse = await getData("users");
    users = usersResponse ? Object.values(usersResponse) : [];
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}



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


function updateIconOnInput(inputField) {
  let passwordValue = inputField.value;
  let inputIconDiv = inputField.nextElementSibling;
  let inputFieldImg = inputIconDiv.querySelector("img");
  if (passwordValue === "") {
    inputFieldImg.src = "./assets/icons/lock.svg";
    inputFieldImg.classList.remove("cursor-pointer");
    inputField.type = "password";
  } else if (inputFieldImg.src.includes("lock.svg")) {
    inputFieldImg.src = "./assets/icons/visibility_off.svg";
    inputFieldImg.classList.add("cursor-pointer");
  }
}


function showHidePassword(inputFieldImg) {
  let inputField = inputFieldImg.parentNode.previousElementSibling;
  switch (true) {
    case inputFieldImg.src.includes("lock.svg"):
      break;
    case inputFieldImg.src.includes("visibility_off.svg"):
      inputFieldImg.src = "./assets/icons/visibility.svg";
      inputField.type = "text";
      break;
    case inputFieldImg.src.includes("visibility.svg"):
      inputFieldImg.src = "./assets/icons/visibility_off.svg";
      inputField.type = "password";
      break;
  }
}


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


function successfullSignUpOverlay() {
  let overlay = document.getElementById('signUpSuccessfull');
  let container = overlay.querySelector('.signup-successfull-container');
  overlay.style.display = 'flex';
  container.classList.add('slide-up');
}


function redirectToLogin() {
  setTimeout(() => {
      window.location.href = './index.html';
    }, 1500);
}


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


function setUserInitials() {
  let userName = document.getElementById("name").value.toLowerCase();
  let nameParts = userName.split(" ");
  let initials = nameParts.map((part) => part.charAt(0).toUpperCase()).join("");
  return initials;
}


function formatUserName() {
  let userNameInput = document.getElementById("name");
  let userName = userNameInput.value.trim();
  let formattedUserName = userName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  return formattedUserName;
}


function generateUUID() { 
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
