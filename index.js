import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, setDoc, addDoc, collection, query, getDocs, where }
  from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBsv_cO8P_d_1m8wDZAk-T9VuCRWE4Z68Y",
  authDomain: "js-hw1.firebaseapp.com",
  projectId: "js-hw1",
  storageBucket: "js-hw1.appspot.com",
  messagingSenderId: "1023446313284",
  appId: "1:1023446313284:web:dd412c463163e99ee6cf11",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let newData = document.querySelector(".newBtn");
let eventStatus = document.querySelector(".event");
let form = document.querySelector(".form");
let list = document.querySelector(".list");
let formData = document.querySelector(".formData");
let items = document.querySelector(".items");
let submit = document.querySelector(".submit");
let nameInput = document.getElementById("name");
let dateInput = document.getElementById("date");
let descriptionInput = document.getElementById("description");
let Cancel = document.getElementById("Cancel");

populateItems();
items.classList.remove("display");
let mode = 'false';

newData.onclick = function () {
  mode = 'false';
  eventDetails();
  submit.textContent = "Add";
  eventStatus.innerHTML = "Create Event";

  formData.onsubmit = async function (e) {
    e.preventDefault();

    // Extract data from the form
    let eventData = {
      name: nameInput.value,
      date: dateInput.value,
      description: descriptionInput.value,
    };

    // Check if an event with the same data already exists
    const querySnapshot = await getDocs(query(collection(db, "events"), where("name", "==", eventData.name), where("date", "==", eventData.date), where("description", "==", eventData.description)));
    if (!querySnapshot.empty) {
      Swal.fire({
        icon: "error",
        text: "Event already exists!",
      });
      return; // Exit the function
    }

    // If event doesn't exist, add it to Firebase
    addDoc(collection(db, "events"), eventData)
      .then(() => {
        Swal.fire({
          title: "Good job!",
          text: "Event added successfully!",
          icon: "success"
        });
        resetValues();
        window.location.reload;
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  };
};

Cancel.onclick = resetValues;

function resetValues() {
  form.style.color = "rgb(63, 146, 222)";
  list.style.color = "red";
  newData.innerHTML = "+New";
  eventStatus.innerHTML = "Events";
  formData.classList.add("display");
  items.classList.remove("display");
  formData.reset();
  populateItems();
}

// Function to compare event date with current date and set background color
function setColorBasedOnDate(newItem, eventDate) {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set time to start of the day

  // Extract date part from event date for comparison
  const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

  // Compare the event date with the current date
  if (eventDateOnly.getTime() < currentDate.getTime()) {
    newItem.style.backgroundColor = "red"; // Past date
  } else if (eventDateOnly.getTime() === currentDate.getTime()) {
    newItem.style.backgroundColor = "green"; // Current date
  } else {
    newItem.style.backgroundColor = "purple"; // Future date
  }
}

// Function to fetch events data from Firebase and populate the items
async function populateItems() {
  items.innerHTML = ''; // Clear existing items
  const eventsRef = collection(db, "events");
  const eventsSnapshot = await getDocs(eventsRef);
  console.log(eventsSnapshot.docs);

  eventsSnapshot.forEach((doc) => {
    const eventData = doc.data();
    const eventId = doc.id;

    // Create a new item element
    const newItem = document.createElement("div");
    newItem.classList.add("item");

    // Set data-id attribute with the event ID
    newItem.setAttribute("data-id", eventId);

    // Format the date and time
    const eventDate = new Date(eventData.date);
    const formattedDate = eventDate.toLocaleDateString();
    const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Adjusted to only show hours and minutes

    // Set the HTML content of the item
    newItem.innerHTML = `
      <p class="title">${eventData.name}</p>
      <p class="date">${formattedDate}</p>
      <p class="time">${formattedTime}</p>
    `;

    // Set background color based on date
    setColorBasedOnDate(newItem, eventDate);

    // Add click event listener to the new item
    newItem.onclick = function () {
      mode = 'true';
      eventDetails(eventData, eventId);
      submit.textContent = "Save";
      eventStatus.innerHTML = "Edit Event";
    };

    // Append the new item to the items container
    items.appendChild(newItem);
  });
}



function eventDetails(eventData, eventId) {
  form.style.color = "red";
  list.style.color = "rgb(63, 146, 222)";
  newData.innerHTML = "";
  formData.classList.remove("display");
  items.classList.add("display");

  // Populate form fields with event data
  nameInput.value = eventData ? eventData.name : '';
  dateInput.value = eventData ? eventData.date : '';
  descriptionInput.value = eventData ? eventData.description : '';

  // Set a custom attribute on the submit button to store the event ID
  submit.setAttribute("data-id", eventId || '');
}

// Update form submission handling
formData.onsubmit = async function (e) {
  e.preventDefault();

  const eventId = submit.getAttribute("data-id");

  // Extract data from the form
  let eventData = {
    name: nameInput.value,
    date: dateInput.value,
    description: descriptionInput.value,
  };

  // Update the document in Firebase
  if (mode == 'true') {
    await setDoc(doc(db, "events", eventId), eventData);
  } else {
    await addDoc(collection(db, "events"), eventData);
  }

  Swal.fire({
    text: "Event updated successfully!",
    imageUrl: "./img/ok.jpg",
    imageWidth: 150 // Set the width of the image to 200 pixels

  });

  resetValues();
};

