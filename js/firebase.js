/**
 * Basis-URL für die Firebase Realtime Database.
 *
 * @constant {string}
 */
const BASE_URL = "https://join-2-b9f87-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Holt Daten von einem angegebenen Pfad in der Firebase Realtime Database.
 *
 * @async
 * @param {string} [path=""] - Der Pfad zu den Daten.
 * @returns {Promise<Object>} Die abgerufenen Daten als JSON-Objekt.
 */
async function getData(path = "") {
    let response = await fetch(BASE_URL + path + ".json");
    return (responseToJson = await response.json());
}

/**
 * Speichert Daten an einem angegebenen Pfad in der Firebase Realtime Database.
 *
 * @async
 * @param {string} [path=""] - Der Pfad, an dem die Daten gespeichert werden sollen.
 * @param {Object} data - Die zu speichernden Daten.
 * @returns {Promise<void>}
 */
async function saveData(path = "", data) {
    await fetch(`${BASE_URL}${path}.json`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

/**
 * Entfernt Daten von einem angegebenen Pfad in der Firebase Realtime Database.
 *
 * @async
 * @param {string} [path=""] - Der Pfad, von dem die Daten entfernt werden sollen.
 * @returns {Promise<void>}
 */
async function removeData(path = "") {
    try {
        let response = await fetch(`${BASE_URL}${path}.json`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Fehler beim Löschen der Daten: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Fehler beim Entfernen von Daten an Pfad ${path}:`, error);
        throw error;
    }
}

/**
 * Speichert einen Kontakt in der Firebase Realtime Database.
 *
 * @async
 * @param {string} contactId - Die eindeutige ID des Kontakts.
 * @param {Object} contactData - Die Daten des Kontakts.
 * @returns {Promise<void>}
 */
async function saveDataToFirebase(contactId, contactData) {
    await fetch(`${BASE_URL}contacts/${contactId}.json`, {
        method: 'PUT',
        body: JSON.stringify(contactData),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

/**
 * Löscht Daten von einem angegebenen Pfad in der Firebase Realtime Database.
 *
 * @async
 * @param {string} [path=""] - Der Pfad, von dem die Daten gelöscht werden sollen.
 * @returns {Promise<Object>} Die Antwort der Löschoperation als JSON-Objekt.
 */
async function deleteData(path = "") {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "DELETE",
    });
    return responseAsJson = await response.json();
}

/**
 * Aktualisiert Daten an einem angegebenen Pfad in der Firebase Realtime Database.
 *
 * @async
 * @param {string} [path=""] - Der Pfad, an dem die Daten aktualisiert werden sollen.
 * @param {Object} [data={}] - Die zu aktualisierenden Daten.
 * @returns {Promise<Object>} Die Antwort der Aktualisierungsoperation als JSON-Objekt.
 */
async function putData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}

/**
 * Patcht (teilweise aktualisiert) Daten an einem angegebenen Pfad in der Firebase Realtime Database.
 *
 * @async
 * @param {string} [path=""] - Der Pfad, an dem die Daten gepatcht werden sollen.
 * @param {Object} [data={}] - Die zu patchenden Daten.
 * @returns {Promise<Object>} Die Antwort der Patch-Operation als JSON-Objekt.
 */
async function patchData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return await response.json();
}
