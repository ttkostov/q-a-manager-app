buildNavigation().then(
    () => {
        console.log("navigation loaded");
        openDb();
        setTimeout(function () {
            let store = getObjectStore(DB_CATEGORY_STORE_NAME, "readonly");
            //displayQAsList(store, true);
            displayListOfEntries(store, false, false, "");
            //addEventListeners();
            addCategoriesEventListeners();

        }, 10);
    }
);





/**
 * updates a category entry in the database
 * @param {number} key
 * @param {string} name
 * @param {color} color
 */
function updateCategoryEntry(key, name, color) {
    let entry = new Category(name, color);
    let store = getObjectStore(DB_CATEGORY_STORE_NAME, 'readwrite');


    let request = store.get(key);
    request.onsuccess = function (evt) {
        let record = evt.target.result;
        console.log(record)
        if (typeof record === 'undefined') {
            alert('No matching record found');
            return;
        }

        let updateRequest = store.put(entry, key);

        updateRequest.onsuccess = function (evt) {
            displayListOfEntries(store, false, false);
            // todo display success message
            // displayQAsList(store, true);
        }
        updateRequest.onerror = function (evt) {
            console.error("error when updating entry:", evt.target.errorCode);
            // todo show message for error??
        }
    }
}



/**
 * deletes category from the database and all questions associated with it
 * @param {number} key
 */
function deleteCategoryEntry(key) {
    console.log("delete Category Entry:", key);

    let store = getObjectStore(DB_CATEGORY_STORE_NAME, 'readwrite');

    let request = store.get(key);
    request.onsuccess = function (evt) {
        let record = evt.target.result;
        if (typeof record === 'undefined') {
            // todo display failure message with text 'No matching record found'
            return;
        }

        let deleteRequest = store.delete(key);
        deleteRequest.onsuccess = function (evt) {
            // also delete all question from this category
            deleteAllQuestionsWithCategory(record, key);
            displayListOfEntries(store, false, false);
        }

        deleteRequest.onerror = function (evt) {
            console.error("error when delete entry:", evt.target.errorCode);
            // todo show message for error??
        }
    }

    request.onerror = function (evt) {
        console.error("error when delete entry:", evt.target.errorCode);
    }
}

/**
 * deletes all questions with the given category
 * @param {Category} category category to be used
 * @param {number} categoryKey id of the category record that has been updated
 */
function deleteAllQuestionsWithCategory(category, categoryKey) {
    let store = getObjectStore(DB_QA_STORE_NAME, 'readwrite');

    let numberOfEntriesRequest = store.count();
    numberOfEntriesRequest.onsuccess = function (evt) {
        let numberOfEntries = evt.target.result;
        if (numberOfEntries === 0) {
            return;
        }
    }
    numberOfEntriesRequest.onerror = function (evt) {
        alert('Error when reading the question database');
    }

    let request = store.openCursor();
    request.onsuccess = function (evt) {
        let cursor = evt.target.result;

        if (cursor) {
            let key = cursor.key;
            let idbRequest = store.get(key);
            idbRequest.onsuccess = function (evt) {
                let value = evt.target.result;
                if (value.categoryId === categoryKey) {

                    let deleteRequest = store.delete(key);
                    deleteRequest.onsuccess = function (evt) {
                        console.log('Q&A deleted: ' + value.question);
                    }

                    deleteRequest.onerror = function (evt) {
                        console.error("error when deleting entry:", evt.target.errorCode);
                    }


                }
            }
            cursor.continue();
        }
    }

}

/**
 * adds event listeners to the elements of the categories page
 */
function addCategoriesEventListeners() {
    console.log("adding event listeners...");

    let addCategoryButtonElement = document.getElementById("add-entry-button");
    addCategoryButtonElement.onclick = function (evt) {
        openAddCategoryDialog();
    }

    let categoryModalCancelButton = document.getElementById("add-category-cancel-button");
    categoryModalCancelButton.onclick = function (evt) {
        closeAddCategoryDialog();
    }

    let categoryModalSaveButton = document.getElementById("add-category-save-button");
    categoryModalSaveButton.onclick = function (evt) {
        saveCategoryAndClose();
    }

    let deleteAllCategoriesButtonElement = document.getElementById('delete-all-entries-button');
    deleteAllCategoriesButtonElement.onclick = function (evt) {
        if (confirm('All categories and the Q&As associated with them will be deleted.\nAre you sure you want to clear the database?\nThis action cannot be undone!')) {
            clearQAsObjectStore(false);
            clearCategoriesObjectStore(true);
        }
    }
}

/**
 * opens the dialog and changes the heading in the dialog to 'Add Category'
 */
function openAddCategoryDialog() {
    let categoryDialogHeadingElement = document.getElementById('manage-category-dialog-heading');
    categoryDialogHeadingElement.innerText = 'Add Category';

    let categoryDialogElement = document.getElementById('manage-category-dialog');
    categoryDialogElement.showModal()
}

/**
 * resets the inputs in the dialog and closes the dialog
 */
function closeAddCategoryDialog() {
    let categoryDialogElement = document.getElementById('manage-category-dialog');
    resetModalInputs(categoryDialogElement);
    categoryDialogElement.close()
}

/**
 * opens the dialog and changes the heading in the dialog to 'Edit Category'
 * @param {number} key key for the object
 * @param {Category} object
 */
function openEditCategoryDialog(key, object) {
    let categoryDialogHeadingElement = document.getElementById('manage-category-dialog-heading');
    categoryDialogHeadingElement.innerText = 'Edit Category';

    let idInput = document.getElementById('category-id-input-field');
    idInput.value = key;

    let categoryNameInput = document.getElementById('category-name-input-field');
    categoryNameInput.value = object.name;

    let categoryColorInput = document.getElementById('category-color-input-field');
    categoryColorInput.value = object.color;

    let categoryDialogElement = document.getElementById('manage-category-dialog');
    categoryDialogElement.showModal()
}

/**
 * saves the entered category in the database and closes the dialog
 */
function saveCategoryAndClose() {
    let categoryDialogElement = document.getElementById('manage-category-dialog');

    let id = +document.getElementById('category-id-input-field').value;

    let categoryNameInputElement = document.getElementById('category-name-input-field');
    let categoryNameInput = categoryNameInputElement.value;

    let categoryColorInputElement = document.getElementById('category-color-input-field');
    let categoryColorInput = categoryColorInputElement.value;

    if (!categoryNameInputElement.checkValidity() || categoryColorInput === '#000000' || categoryColorInput === '#FFFFFF') {
        alert('Please enter a valid category and color!');
        return;
    }

    let categoryDialogHeadingElement = document.getElementById('manage-category-dialog-heading');
    if (categoryDialogHeadingElement.innerText === 'Add Category') {
        addCategoryEntry(categoryNameInput, categoryColorInput, true);
    } else {
        updateCategoryEntry(id, categoryNameInput, categoryColorInput);
    }
    closeAddCategoryDialog();
}