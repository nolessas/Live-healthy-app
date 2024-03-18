// Import Firestore services along with Firebase App and Auth
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, runTransaction } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';


// Your Firebase configuration
const firebaseConfig = {
XXX
};


// Initialize Firebase and services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app); // Initialize Firestore




/*  --- start Workout ---  */

// Function to fetch and display workouts for a specific user
async function loadUserWorkouts(userId) {
  const workoutContainer = document.getElementById('exercises-container');
  if (!workoutContainer) return; // Exit if the container is not found
  
  workoutContainer.innerHTML = ''; // Clear previous content

  try {
    const userWorkoutsRef = collection(db, userId);
    const querySnapshot = await getDocs(userWorkoutsRef);

    if (querySnapshot.empty) {
      workoutContainer.innerHTML = '<p>No workouts found. Start adding some!</p>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const workout = doc.data();
      const workoutName = doc.id.substring(2); // Adjusted for workout naming
      const level = workout.level || 1; // Default to level 1 if not set
      const workoutElement = document.createElement('div');
      workoutElement.className = 'workout';
      workoutElement.innerHTML = `
        <h3>${workoutName}</h3>
        <p id="weight-${doc.id}">Weight: ${workout['8Reps-3Sets']}kg, Level: ${level}</p>
        <button onclick="adjustWeight('${userId}', '${doc.id}', true)">+</button>
        <button onclick="adjustWeight('${userId}', '${doc.id}', false)">-</button>
      `;

      workoutContainer.appendChild(workoutElement);
    });
  } catch (error) {
    console.error("Failed to load workouts: ", error);
    workoutContainer.innerHTML = '<p>Error loading workouts. Please try again later.</p>';
  }
}

// Function to adjust workout weight and level without reloading the entire list
window.adjustWeight = async function (userId, workoutId, increase) {
  const workoutRef = doc(db, userId, workoutId);
  try {
    const newDetails = await runTransaction(db, async (transaction) => {
      const workoutDoc = await transaction.get(workoutRef);
      if (!workoutDoc.exists()) {
        throw "Document does not exist!";
      }
      const workoutData = workoutDoc.data();
      const currentWeight = workoutData['8Reps-3Sets'];
      const currentLevel = workoutData.level || 1;
      const updatedWeight = increase ? currentWeight + 2.5 : currentWeight - 2.5;
      const updatedLevel = increase ? currentLevel + 1 : Math.max(currentLevel - 1, 1); // Prevent level from going below 1

      transaction.update(workoutRef, { '8Reps-3Sets': updatedWeight, 'level': updatedLevel });
      return { newWeight: updatedWeight, newLevel: updatedLevel }; // Return the new details for UI update
    });

    // Update the UI with the new weight and level
    const weightElement = document.getElementById(`weight-${workoutId}`);
    if (weightElement) {
      weightElement.textContent = `Weight: ${newDetails.newWeight}kg, Level: ${newDetails.newLevel}`;
    }
    console.log("Weight and level adjusted successfully.");
  } catch (error) {
    console.error("Failed to adjust weight and level: ", error);
  }
};


// Example usage: Load workouts for a specific user
document.addEventListener('DOMContentLoaded', () => {
  const userId = 'Egis'; // Replace with dynamic user ID from authentication
  loadUserWorkouts(userId);
});


/* --- Workout end --- */


/*     start     MEALS      ######         */



const mealsData = {
  'Breakfast': [{ name: 'Kiaušiniai su salotom', calories: 555, proteins: 51, carbs: 24, fats: 27,note: "Kiaušiniai su salotomis ir duona<br> 3 Kiaušiniai<br> 50g salotų<br> 2 riekes duonos" },
                { name: 'Avižiniai su uogomis', calories: 409, proteins: 14, carbs: 70, fats: 7, note: "Avižiniai su uogomis<br> 100g avižinių dripsnių <br> 50g uogų" },
                { name: 'Virti kiausiniai', calories: 287, proteins: 34, carbs: 18, fats: 10, note: "Virti kiausiniai<br> 3 virti kiaušiniai<br> 2 riekės duonos" }],
  'Snack': [{ name: 'Riesutai / sėklos', calories: 580, proteins: 20, carbs: 20, fats: 52, note: "Riesutai / sėklos<br>100g pasirinktų riešutų" },
            { name: 'Koktelis su bananu', calories: 490, proteins: 40, carbs: 60, fats: 10, note: "Koktelis su bananu<br>180g varškės <br> 1 bananas" },
            { name: 'Varškėtukai su kokusais', calories: 243, proteins: 33, carbs: 7, fats: 9, note: "Varškėtukai su kokusais<br>180g varškės <br> 50g kokosų drožlių<br> 1 kiaušinis<br> 1 bananas" }],
  'Lunch': [{ name: 'Vistiena ir grikiai', calories: 702, proteins: 52, carbs: 81, fats: 21, note: "Vistiena ir grikiai<br>200g vistienos <br> 70g grinių <br> 100g daržovių" },
            { name: 'Tortilija', calories: 735, proteins: 52, carbs: 68, fats: 30, note: "Tortilija<br>200g vistienos <br> 100g daržovių <br> 3 tortilijos" },
            { name: 'Sriuba su kiauliena', calories: 212, proteins: 8, carbs: 19, fats: 13, note: "Sriuba su kiauliena<br>200g kiaulienos <br> 200g dažovių <br> 100g žirnių/lešių" }],
  'Other Snack': [{ name: 'Riesutai / sėklos', calories: 580, proteins: 20, carbs: 20, fats: 52, note: "Riesutai / sėklos<br>100g pasirinktų riešutų" },
                  { name: 'Koktelis su bananu', calories: 490, proteins: 40, carbs: 60, fats: 10, note: "Koktelis su bananu<br>180g varškės <br> 1 bananas" },
                  { name: 'Varškėtukai su kokusais', calories: 243, proteins: 33, carbs: 7, fats: 9, note: "Varškėtukai su kokusais<br>180g varškės <br> 50g kokosų drožlių<br> 1 kiaušinis<br> 1 bananas" }],
  'Dinner': [{ name: 'Vistiena su grikiais', calories: 702, proteins: 52, carbs: 81, fats: 21, note: "Vistiena ir grikiai<br>200g vistienos <br> 70g grinių <br> 100g daržovių" },
             { name: 'Tortilija', calories: 735, proteins: 52, carbs: 68, fats: 30, note: "Tortilija<br>200g vistienos <br> 100g daržovių <br> 3 tortilijos" },
             { name: 'Sriuba su kiauliena', calories: 212, proteins: 8, carbs: 19, fats: 13, note: "Sriuba su kiauliena<br>200g kiaulienos <br> 200g dažovių <br> 100g žirnių/lešių" }],
};


let selectedMeals = {
  'Breakfast': null,
  'Snack': null,
  'Lunch': null,
  'Other Snack': null,
  'Dinner': null
};

const mealNotes = {
  //...
};

function initMealsUI() {
  const mealsContainer = document.getElementById('meals');
  Object.entries(mealsData).forEach(([mealTime, meals]) => {
    const section = document.createElement('div');
    section.className = 'meal-section';
    section.innerHTML = `<h4>${mealTime}</h4>`;
    mealsContainer.appendChild(section);
    

    meals.forEach((meal, index) => {
      const mealOption = document.createElement('div');
      mealOption.className = 'meal-option';
      mealOption.textContent = meal.name;
      // Attach event listener dynamically
      mealOption.addEventListener('click', () => selectMeal(mealTime, index));
      section.appendChild(mealOption);
    });
  });
}

function selectMeal(mealTime, mealIndex) {
  selectedMeals[mealTime] = mealsData[mealTime][mealIndex];
  const selectedMealName = selectedMeals[mealTime].name;
  const selectedMealNote = mealNotes[mealTime] ? mealNotes[mealTime][selectedMealName] : '';
  updateUI(selectedMealNote);

  // Save selected meals in local storage
  localStorage.setItem('selectedMeals', JSON.stringify(selectedMeals));
}

function updateUI() {
  // Update meal selections visually and calculate nutrition summary
  let totalCalories = 0, totalProteins = 0, totalCarbs = 0, totalFats = 0;
  let mealNotesHtml = '<h4>Meal Notes</h4>'; // Add a header for the notes section


  document.querySelectorAll('.meal-option').forEach(option => {
    option.classList.remove('selected');
  });

  Object.entries(selectedMeals).forEach(([mealTime, meal]) => {
    if (meal) {
      const options = document.querySelectorAll(`.meal-section h4`);
      options.forEach(header => {
        if (header.textContent === mealTime) {
          const parentSection = header.parentNode;
          const mealOptions = parentSection.querySelectorAll('.meal-option');
          mealOptions.forEach((option, index) => {
            if (mealsData[mealTime][index].name === meal.name) {
              option.classList.add('selected');
              // Add meal note to the mealNotesHtml
              mealNotesHtml += `<div class="meal-note"><strong>${mealTime}</strong><br>${meal.note.replace(/\n/g, '<br>')}</div>`;
            }
          });
        }
      });

      // Adding to the total nutrition values
      totalCalories += meal.calories;
      totalProteins += meal.proteins;
      totalCarbs += meal.carbs;
      totalFats += meal.fats;
    }
  });

  // Update the nutrition summary text
  document.getElementById('total-calories').textContent = `Calories: ${totalCalories}`;
  document.getElementById('total-proteins').textContent = `Proteins: ${totalProteins}g`;
  document.getElementById('total-carbs').textContent = `Carbs: ${totalCarbs}g`;
  document.getElementById('total-fats').textContent = `Fats: ${totalFats}g`;

  // Insert meal notes HTML into the selected-meal-note div
  const noteElement = document.getElementById('selected-meal-note'); // Ensure you are targeting the correct element
  noteElement.innerHTML = mealNotesHtml;
  noteElement.style.display = mealNotesHtml ? 'block' : 'none';
}

// Retrieve and set selected meals on page load
document.addEventListener('DOMContentLoaded', () => {
  initMealsUI();
  const storedMeals = JSON.parse(localStorage.getItem('selectedMeals'));
  if (storedMeals) {
    selectedMeals = storedMeals;
  }
  updateUI(); // Update UI with potentially loaded selections
});
/*            MEALS   end    ########           */





/*      Start      TAB       ########           */

document.addEventListener('DOMContentLoaded', () => {
  const shoppingListTable = document.getElementById('shopping-list-table');
  
  if (shoppingListTable) {
    // Load and apply selections from localStorage
    Array.from(shoppingListTable.querySelectorAll('tr')).forEach((row, index) => {
      const rowId = `row-${index}`; // Assuming no data-id, using index as identifier
      if (localStorage.getItem(`rowSelected-${rowId}`) === 'true') {
        row.classList.add('selected');
      }
    });

    // Attach the click event listener for selection
    shoppingListTable.addEventListener('click', toggleRowSelection);
  }

  function toggleRowSelection(event) {
    let clickedRow = event.target.closest('tr');
    if (clickedRow) {
      clickedRow.classList.toggle('selected');
      const rowIndex = Array.from(shoppingListTable.querySelectorAll('tr')).indexOf(clickedRow);
      const rowId = `row-${rowIndex}`; // Using rowIndex as a fallback identifier

      if (clickedRow.classList.contains('selected')) {
        localStorage.setItem(`rowSelected-${rowId}`, 'true');
      } else {
        localStorage.removeItem(`rowSelected-${rowId}`);
      }
    }
  }



/*            shop  END    ########           */




/*      Start      TAB       ########           */

function setActiveTab(selectedId) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    if (tab.id === selectedId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

function handleTabSelection(selectedTab) {
  let index;
  switch (selectedTab) {
    case 'Egis': // Workout Tab
      index = 0;
      getAndDisplayUserExercises(selectedTab);
      break;
    case 'Meals': // Meals Tab
      index = 1;
      attachMealButtonListeners();
      break;
    case 'Shoppinglist': // Shopping List Tab
      index = 2;
      break;
    case 'Todo': // To-Do Tab
      index = 3;
      readTodos();
      break;
  }
  
  swiper.slideTo(index);
  setActiveTab(`${selectedTab}-tab`);
}

document.getElementById('user-selection').addEventListener('change', (event) => {
  handleTabSelection(event.target.value);
});
  
  function attachMealButtonListeners() {
    const mealNames = document.querySelectorAll('.meal-name');
    mealNames.forEach(mealName => {
      mealName.removeEventListener('click', toggleMealDescription); // Remove existing listeners to avoid duplicates
      mealName.addEventListener('click', toggleMealDescription); // Add a new listener
    });
  }

  function toggleMealDescription() {
    const description = this.nextElementSibling; // The description is next sibling element
    description.hidden = !description.hidden;
  }

  const selectedTabInput = document.querySelector('input[name="tab"]:checked');
  if (selectedTabInput) {
    handleTabSelection(selectedTabInput.value);
  }
  
 
});

/*      TAB  END    ########     */




/*         start  TODO         */


// Firestore collections reference
const todosRef = collection(db, "todos");

// Function to create a new to-do item
async function createTodo(todoText) {
  try {
    await addDoc(todosRef, { text: todoText, completed: false });
    console.log("To-Do added successfully!");
    // Call readTodos to update the list after adding
    await readTodos();
  } catch (error) {
    console.error("Error adding To-Do: ", error);
  }
}

// Function to read and display to-do items
async function readTodos() {
  const querySnapshot = await getDocs(todosRef);
  const todoList = document.getElementById('todoList');
  todoList.innerHTML = ''; // Clear current list

  
querySnapshot.forEach((docSnapshot) => {
  const todoItem = docSnapshot.data();
  const todoElement = document.createElement('div');
  todoElement.className = 'todo-item';
  
  const todoText = document.createElement('span');
  todoText.textContent = todoItem.text;
  todoText.className = 'todo-text';
  todoText.id = `todo-text-${docSnapshot.id}`; // Unique ID for text element

  const updateButton = document.createElement('button');
  updateButton.textContent = 'Update';
  updateButton.className = 'update-button';
  updateButton.id = `update-button-${docSnapshot.id}`; // Unique ID for button
  updateButton.onclick = () => updateTodo(docSnapshot.id, todoItem.text);

  
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.className = 'delete-button';
  deleteButton.onclick = () => deleteTodo(docSnapshot.id);
  
  todoElement.appendChild(todoText);
  todoElement.appendChild(updateButton);
  todoElement.appendChild(deleteButton);
  
  todoList.appendChild(todoElement);
});
}


// Function to update a to-do item
async function updateTodo(todoId, oldText) {
  // Create an input field for the new to-do text
  const newTextInput = document.createElement('input');
  newTextInput.type = 'text';
  newTextInput.value = oldText;
  newTextInput.className = 'todo-update-input';
  
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.className = 'save-update-button';

  // Replace the to-do text with the new text input
  const todoTextElement = document.querySelector(`#todo-text-${todoId}`);
  todoTextElement.replaceWith(newTextInput);

  // Replace the update button with the save button
  const updateButtonElement = document.querySelector(`#update-button-${todoId}`);
  updateButtonElement.replaceWith(saveButton);

  saveButton.onclick = async () => {
    const updatedText = newTextInput.value.trim();
    if (updatedText) {
      const todoDocRef = doc(db, "todos", todoId);
      try {
        await updateDoc(todoDocRef, { text: updatedText });
        console.log("To-Do updated successfully!");
        // Replace the input field with the updated text
        newTextInput.replaceWith(todoTextElement);
        // Replace the save button with the update button
        saveButton.replaceWith(updateButtonElement);
        // Update the text of the todoTextElement to the new text
        todoTextElement.textContent = updatedText;
      } catch (error) {
        console.error("Error updating To-Do: ", error);
      }
    }
  };
}


// Function to delete a to-do item
async function deleteTodo(todoId) {
  const todoDocRef = doc(db, "todos", todoId);
  try {
    await deleteDoc(todoDocRef);
    console.log("To-Do deleted successfully!");
    await readTodos(); // Refresh the list
  } catch (error) {
    console.error("Error deleting To-Do: ", error);
  }
}

// Event listeners for add button and to-do item interaction
document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.querySelector('#todo-container button');
  const todoInput = document.querySelector('#todo-container #todoInput');

  // Listener for the Add To-Do button
  addButton.addEventListener('click', () => {
    const todoText = todoInput.value.trim();
    if (todoText) {
      createTodo(todoText);
      todoInput.value = ''; // Clear the input after adding
    }
  });

  // Initial call to populate the to-do list
  readTodos();
});


/*   TODO    */