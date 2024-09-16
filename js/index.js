/**
 * Array zur Speicherung der Benutzerdaten.
 *
 * @type {Array<Object>}
 */
let usersData = [];

/**
 * Initialisiert die Anwendung, richtet die Benutzeroberfläche ein und lädt Benutzerdaten.
 *
 * @async
 * @returns {Promise<void>}
 */
async function init() {
  displayDesktopSidebar();
  displayHeader();
  displayMobileNav();
  removeClassesIfNotLoggedIn();
  await getUsersData();
  displayInitialsHeaderUser();
}

/**
 * Initialisiert die Warnung bei Landschaftsorientierung auf mobilen Geräten.
 */
function initLandscapeWarning() {
  displayLandscapeWarningMobile();
  if (isMobileDevice() && isTouchDevice()) {
    handleOrientationChangeMobile();
  }
}

/**
 * Zeigt eine Warnung bei Landschaftsorientierung auf mobilen Geräten an.
 */
function displayLandscapeWarningMobile() {
  let warningOverlay = document.getElementById('landscapeWarningMobile');
  warningOverlay.innerHTML = "";
  warningOverlay.innerHTML = displayLandscapeWarningMobileHTML();
}

/**
 * Handhabt Änderungen der Ausrichtung auf mobilen Geräten.
 */
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

/**
 * Zeigt oder versteckt die Landschaftsorientierungs-Warnung basierend auf dem Parameter.
 *
 * @param {boolean} show - Gibt an, ob die Warnung angezeigt werden soll.
 */
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

/**
 * Überprüft, ob das Gerät ein mobiles Gerät ist.
 *
 * @returns {boolean} True, wenn es sich um ein mobiles Gerät handelt, sonst false.
 */
function isMobileDevice() {
  let userAgent = navigator.userAgent.toLowerCase();
  return /mobi|android|iphone|ipod|ipad|tablet/i.test(userAgent);
}

/**
 * Überprüft, ob das Gerät Touch-fähig ist.
 *
 * @returns {boolean} True, wenn das Gerät Touch-fähig ist, sonst false.
 */
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Holt die Benutzerdaten von der Firebase Realtime Database.
 *
 * @async
 * @returns {Promise<void>}
 */
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

/**
 * Holt die Initialen des aktuellen Benutzers aus dem lokalen Speicher.
 *
 * @returns {string} Die Initialen des Benutzers oder "G" als Standard.
 */
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

/**
 * Holt die Initialen eines Benutzers basierend auf seinen Daten.
 *
 * @param {string} user - Die codierten Benutzerdaten.
 * @returns {string} Die Initialen des Benutzers oder "G" als Standard.
 */
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

/**
 * Sucht einen Benutzer in den Benutzerdaten anhand der ID.
 *
 * @param {string} userId - Die ID des zu suchenden Benutzers.
 * @returns {Object|null} Das Benutzerobjekt oder null, wenn nicht gefunden.
 */
function searchUserById(userId) {
  return usersData.find((u) => u.id === userId) || null;
}

/**
 * Zeigt die Initialen des aktuellen Benutzers im Header an.
 */
function displayInitialsHeaderUser() {
  let initials = getInitialsHeaderUser();
  let initialsElement = document.getElementById("headerUserInitials");
  if (initialsElement) {
    initialsElement.innerHTML = initials;
  }
}

/**
 * Zeigt die Desktop-Seitenleiste an und setzt den aktiven Link.
 */
function displayDesktopSidebar() {
  document.getElementById("desktopSidebar").innerHTML =
    displayDesktopSidebarHTML();
  setActiveLinkSidebar();
}

/**
 * Setzt den aktiven Link in der Seitenleiste basierend auf dem aktuellen Pfad.
 */
function setActiveLinkSidebar() {
  let path = window.location.pathname;
  let links = document.querySelectorAll(".sidebar-links");
  let legalLinks = document.querySelectorAll(".legal-links");
  addActiveClass(links, path, "link-desktop-active");
  addActiveClass(legalLinks, path, "legal-links-active");
}

/**
 * Fügt einer Gruppe von Links eine aktive Klasse hinzu, wenn der Link dem aktuellen Pfad entspricht.
 *
 * @param {NodeListOf<HTMLElement>} links - Die Links, die überprüft werden sollen.
 * @param {string} path - Der aktuelle Pfad der Seite.
 * @param {string} activeClass - Die Klasse, die hinzugefügt werden soll, wenn der Link aktiv ist.
 */
function addActiveClass(links, path, activeClass) {
  links.forEach((link) => {
    if (link.href.includes(path)) {
      link.classList.add(activeClass);
    }
  });
}

/**
 * Rendert den Header der Anwendung.
 */
function displayHeader() {
  document.getElementById("header").innerHTML = displayHeaderHTML();
}

/**
 * Rendert die mobile Navigation und setzt den aktiven Link.
 */
function displayMobileNav() {
  document.getElementById("mobileNav").innerHTML = displayMobileNavHTML();
  setActiveLinkMobileNav();
}

/**
 * Setzt den aktiven Link in der mobilen Navigation basierend auf dem aktuellen Pfad.
 */
function setActiveLinkMobileNav() {
  let path = window.location.pathname;
  let links = document.querySelectorAll(".nav-mobile-links");
  addActiveClass(links, path, "nav-mobile-links-active");
}

/**
 * Navigiert zur vorherigen Seite in der Browser-Historie.
 */
function pageBack() {
  window.history.back();
}

/**
 * Entfernt bestimmte Klassen und aktualisiert Links, wenn der Benutzer nicht eingeloggt ist.
 */
function removeClassesIfNotLoggedIn() {
  let path = window.location.pathname;
  if (path.includes("legalNoticeExternal") || path.includes("privacyPolicyExternal")) {
    hideElementsIfNotLoggedIn();
    updateLegalLinksNotLoggedIn();
  }
  setActiveLinkSidebar();
}

/**
 * Versteckt Elemente, wenn der Benutzer nicht eingeloggt ist.
 */
function hideElementsIfNotLoggedIn() {
  document.querySelector(".header-nav").classList.add("d-none");
  document.querySelector(".sidebar-menu").classList.add("d-none");
  document.getElementById("mobileNav").classList.add("d-none-important");
}

/**
 * Aktualisiert die Links für rechtliche Hinweise, wenn der Benutzer nicht eingeloggt ist.
 */
function updateLegalLinksNotLoggedIn() {
  document.getElementById("privacyPolicyLink").href = "./privacyPolicyExternal.html";
  document.getElementById("legalNoticeLink").href = "./legalNoticeExternal.html";
}

/**
 * Rendert das Dropdown-Menü für die Navigation.
 */
function displayDropDownNav() {
  document.getElementById("dropDownNav").innerHTML = displayDropDownNavHTML();
}

/**
 * Toggles die Sichtbarkeit des Dropdown-Menüs für die Navigation.
 */
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

/**
 * Blendet ein Element mit einer Einblendanimation ein.
 *
 * @param {HTMLElement} element - Das Element, das eingeblendet werden soll.
 */
function slideIn(element) {
  element.style.display = "flex";
  element.classList.remove("slide-out");
  element.classList.add("slide-in");
}

/**
 * Blendet ein Element mit einer Ausblendanimation aus.
 *
 * @param {HTMLElement} element - Das Element, das ausgeblendet werden soll.
 */
function slideOut(element) {
  element.classList.remove("slide-in");
  element.classList.add("slide-out");
  setTimeout(() => {
    element.style.display = "none";
    element.classList.remove("slide-out");
  }, 200);
}

/**
 * Schließt das Dropdown-Menü, wenn außerhalb des Menüs geklickt wird.
 *
 * @param {Event} event - Das Click-Event.
 */
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
