const BASE_URL = "https://join-2-b9f87-default-rtdb.europe-west1.firebasedatabase.app/";


async function getData(path = "") {
    let response = await fetch(BASE_URL + path + ".json");
    return (responseToJson = await response.json());
}


async function saveData(path = "", data) {
    await fetch(`${BASE_URL}${path}.json`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}


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


async function saveDataToFirebase(contactId, contactData) {
    await fetch(`${BASE_URL}contacts/${contactId}.json`, {
        method: 'PUT',
        body: JSON.stringify(contactData),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}


async function deleteData(path = "") {
    let response = await fetch(BASE_URL + path + ".json", {
      method: "DELETE",
    });
    return responseAsJson = await response.json();
}


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
