const BASE_URL = "https://join-2-b9f87-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Asynchronously fetches data from the specified path in the Firebase database.
 *
 * @async
 * @function getData
 * @param {string} [path=""] - The path in the Firebase database from which to fetch data.
 * @returns {Promise<Object>} A promise that resolves with the JSON data fetched from the database.
 */
async function getData(path = "") {
    let response = await fetch(BASE_URL + path + ".json");
    return (responseToJson = await response.json());
}


/* contacts*/
/**
 * Asynchronously saves data to the specified path in the Firebase database.
 *
 * @async
 * @function saveData
 * @param {string} [path=""] - The path in the Firebase database where the data should be saved.
 * @param {Object} data - The data to be saved, typically a JSON object.
 * @returns {Promise<void>} A promise that resolves when the data is successfully saved.
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
 * Asynchronously removes data from the specified path in the Firebase database.
 *
 * @async
 * @function removeData
 * @param {string} [path=""] - The path in the Firebase database from which data should be deleted.
 * @throws {Error} Throws an error if there is a problem with the DELETE request.
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
 * Asynchronously saves or updates contact data in the Firebase database.
 *
 * @async
 * @function saveDataToFirebase
 * @param {string} contactId - The ID of the contact to be saved or updated.
 * @param {Object} contactData - The contact data to be saved, typically a JSON object.
 * @returns {Promise<void>} A promise that resolves when the data is successfully saved.
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
 * Asynchronously deletes data from the specified path in the Firebase database.
 *
 * @async
 * @function deleteData
 * @param {string} [path=""] - The path in the Firebase database from which data should be deleted.
 * @returns {Promise<Object>} A promise that resolves with the JSON response after deletion.
 */
async function deleteData(path = "") {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "DELETE",
    });
    return responseAsJson = await response.json();
}


/**
 * Asynchronously saves or updates data at the specified path in the Firebase database.
 *
 * @async
 * @function putData
 * @param {string} [path=""] - The path in the Firebase database where the data should be saved or updated.
 * @param {Object} [data={}] - The data to be saved or updated, typically a JSON object.
 * @returns {Promise<Object>} A promise that resolves with the JSON response after the data is saved.
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
 * Asynchronously updates data at the specified path in the Firebase database using the PATCH method.
 *
 * @async
 * @function patchData
 * @param {string} [path=""] - The path in the Firebase database where the data should be updated.
 * @param {Object} [data={}] - The data to be updated, typically a JSON object.
 * @returns {Promise<Object>} A promise that resolves with the JSON response after the data is updated.
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