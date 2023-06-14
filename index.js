import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, set, onChildAdded } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
    databaseURL: "https://items-list-22217-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const shoppingListInDB = ref(database, "shoppingList");
const notesRef = ref(database, "notes");

const inputFieldEl = document.getElementById("input-field");
const quantityFieldEl = document.getElementById("quantity-field");
const noteFieldEl = document.getElementById("note-field");
const addButtonEl = document.getElementById("add-button");
const removeButtonEl = document.getElementById("remove-button");
const shoppingListEl = document.getElementById("shopping-list");
const notesListEl = document.getElementById("notes-list");

const containerEl = document.querySelector(".container");

addButtonEl.addEventListener("click", function() {
    let inputValue = inputFieldEl.value;
    let quantityValue = parseInt(quantityFieldEl.value) || 1;
    let item = {
        name: inputValue,
        quantity: quantityValue
    };

    push(shoppingListInDB, item);

    clearInputFieldEl();
    clearQuantityFieldEl();
});

removeButtonEl.addEventListener("click", function() {
    let noteValue = noteFieldEl.value;
    let noteRef = ref(database, `notes/${noteValue}`);

    remove(noteRef);

    clearNoteFieldEl();
});

onValue(shoppingListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val());

        clearShoppingListEl();

        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i];
            let currentItemID = currentItem[0];
            let currentItemValue = currentItem[1];

            appendItemToShoppingListEl(currentItem);
        }
    } else {
        shoppingListEl.innerHTML = "No items here... yet";
    }
});

function clearShoppingListEl() {
    shoppingListEl.innerHTML = "";
}

function clearInputFieldEl() {
    inputFieldEl.value = "";
}

function clearQuantityFieldEl() {
    quantityFieldEl.value = "";
}

function clearNoteFieldEl() {
    noteFieldEl.value = "";
}

function clearNotesListEl() {
    notesListEl.innerHTML = "";
}

function appendItemToShoppingListEl(item) {
    let itemID = item[0];
    let itemValue = item[1];

    let newEl = document.createElement("li");
    let quantitySpan = document.createElement("span");

    quantitySpan.textContent = itemValue.quantity;
    newEl.textContent = itemValue.name + " - ";
    newEl.appendChild(quantitySpan);

    newEl.addEventListener("click", function() {
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`);

        remove(exactLocationOfItemInDB);

        showAnimation();
    });

    shoppingListEl.append(newEl);
}

// Listen for child_added event to fetch existing notes and listen for new child additions
onValue(notesRef, function(snapshot) {
    if (snapshot.exists()) {
        let notesObject = snapshot.val();
        let notesArray = Object.keys(notesObject);

        clearNotesListEl();

        for (let i = 0; i < notesArray.length; i++) {
            let currentNote = notesArray[i];

            appendNoteToNotesListEl(currentNote);
        }
    } 
});

onChildAdded(notesRef, function(data) {
    let noteKey = data.key;
    let noteValue = data.val();

    appendNoteToNotesListEl(noteValue);
});

function appendNoteToNotesListEl(note) {
    let newEl = document.createElement("li");
    newEl.textContent = note;

    newEl.addEventListener("click", function() {
        let noteRef = ref(database, `notes/${note}`);

        remove(noteRef);
    });

    notesListEl.append(newEl);
}

function showAnimation() {
    const animationContainer = document.createElement("div");
    const messageEl = document.createElement("div");
    messageEl.textContent = "Happy Shopping!";
    messageEl.classList.add("message");

    animationContainer.classList.add("animation-container");

    animationContainer.appendChild(messageEl);

    containerEl.appendChild(animationContainer);

    setTimeout(function() {
        animationContainer.classList.add("fade-out");
        setTimeout(function() {
            containerEl.removeChild(animationContainer);
        }, 1000);
    }, 3000);
}
