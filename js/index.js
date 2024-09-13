let usersData = [];


async function init() {
  displayDesktopSidebar();
  displayHeader();
  displayMobileNav();
  removeClassesIfNotLoggedIn();
  await getUsersData();
  displayInitialsHeaderUser();
}


function initLandscapeWarning() {
  displayLandscapeWarningMobile();
  if (isMobileDevice() && isTouchDevice()) {
    handleOrientationChangeMobile();
  }
}


function displayLandscapeWarningMobile() {
  let warningOverlay = document.getElementById('landscapeWarningMobile');
  warningOverlay.innerHTML = "";
  warningOverlay.innerHTML = displayLandscapeWarningMobileHTML();
}


function handleOrientationChangeMobile() {
  let mediaQuery = window.matchMedia("(orientation: landscape)");
  toggleLandscapeWarning(mediaQuery.matches);
  mediaQuery.addEventListener("change", (e) => {
    toggleLandscapeWarning(e.matches);
  });
  window.addEventListener('resize', () => {
    toggleLandscapeWarning(mediaQuery.matches);
  });
}


function toggleLandscapeWarning(show) {
  let warningOverlay = document.getElementById('landscapeWarningMobile');
  let body = document.querySelector('body');
  if (warningOverlay) {
    if (show && window.innerHeight <= 850) {
      warningOverlay.style.display = 'flex';
      body.style.overflow = 'hidden';
    } else {
      warningOverlay.style.display = 'none';
      body.style.overflow = 'auto';
    }
  }
}


function isMobileDevice() {
  let userAgent = navigator.userAgent.toLowerCase();
  return /mobi|android|iphone|ipod|ipad|tablet/i.test(userAgent);
}


function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}


async function getUsersData() {
  try {
    const data = await getData("users");
    if (data && typeof data === 'object') {
      usersData = Object.values(data);
    } else {
      console.error("Expected an object for usersData, but received:", data);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}


function getInitialsHeaderUser() {
  let user = localStorage.getItem("user");
  let guestInitials = localStorage.getItem("guestInitials");
  if (user) {
    return getUserInitials(user);
  } else if (guestInitials) {
    return guestInitials;
  }
  return "G";
}


function getUserInitials(user) {
  let userData = JSON.parse(atob(user));
  let userId = userData.id;
  if (userId) {
    let foundUser = searchUserById(userId);
    if (foundUser && foundUser.initials) {
      return foundUser.initials;
    }
  }
  return "G";
}


function searchUserById(userId) {
  return usersData.find((u) => u.id === userId) || null;
}


function displayInitialsHeaderUser() {
  let initials = getInitialsHeaderUser();
  let initialsElement = document.getElementById("headerUserInitials");
  if (initialsElement) {
    initialsElement.innerHTML = initials;
  }
}


function displayDesktopSidebar() {
  document.getElementById("desktopSidebar").innerHTML =
    displayDesktopSidebarHTML();
  setActiveLinkSidebar();
}


function setActiveLinkSidebar() {
  let path = window.location.pathname;
  let links = document.querySelectorAll(".sidebar-links");
  let legalLinks = document.querySelectorAll(".legal-links");
  addActiveClass(links, path, "link-desktop-active");
  addActiveClass(legalLinks, path, "legal-links-active");
}


function addActiveClass(links, path, activeClass) {
  links.forEach((link) => {
    if (link.href.includes(path)) {
      link.classList.add(activeClass);
    }
  });
}


function displayHeader() {
  document.getElementById("header").innerHTML = displayHeaderHTML();
}


function displayMobileNav() {
  document.getElementById("mobileNav").innerHTML = displayMobileNavHTML();
  setActiveLinkMobileNav();
}


function setActiveLinkMobileNav() {
  let path = window.location.pathname;
  let links = document.querySelectorAll(".nav-mobile-links");
  addActiveClass(links, path, "nav-mobile-links-active");
}


function pageBack() {
  window.history.back();
}


function removeClassesIfNotLoggedIn() {
  let path = window.location.pathname;
  if (path.includes("legalNoticeExternal") || path.includes("privacyPolicyExternal")) {
    hideElementsIfNotLoggedIn();
    updateLegalLinksNotLoggedIn();
  }
  setActiveLinkSidebar();
}


function hideElementsIfNotLoggedIn() {
  document.querySelector(".header-nav").classList.add("d-none");
  document.querySelector(".sidebar-menu").classList.add("d-none");
  document.getElementById("mobileNav").classList.add("d-none-important");
}


function updateLegalLinksNotLoggedIn() {
  document.getElementById("privacyPolicyLink").href = "./privacyPolicyExternal.html";
  document.getElementById("legalNoticeLink").href = "./legalNoticeExternal.html";
}


function displayDropDownNav() {
  document.getElementById("dropDownNav").innerHTML = displayDropDownNavHTML();
}


function toggleDropDownNav() {
  let dropDownNav = document.getElementById("dropDownNav");
  if (dropDownNav.style.display === "flex") {
    slideOut(dropDownNav);
    document.removeEventListener("click", closeDropDownNavOnClickOutside);
  } else {
    slideIn(dropDownNav);
    document.addEventListener("click", closeDropDownNavOnClickOutside);
  }
}


function slideIn(element) {
  element.style.display = "flex";
  element.classList.remove("slide-out");
  element.classList.add("slide-in");
}


function slideOut(element) {
  element.classList.remove("slide-in");
  element.classList.add("slide-out");
  setTimeout(() => {
    element.style.display = "none";
    element.classList.remove("slide-out");
  }, 200);
}


function closeDropDownNavOnClickOutside(event) {
  let dropDownNav = document.getElementById("dropDownNav");
  let toggleButton = document.querySelector(".header-user-button");
  if (
    !dropDownNav.contains(event.target) &&
    !toggleButton.contains(event.target)
  ) {
    slideOut(dropDownNav);
    document.removeEventListener("click", closeDropDownNavOnClickOutside);
  }
}


