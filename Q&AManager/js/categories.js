buildNavigation().then(
    () => {
        console.log('navigation loaded');
        openDb().then(
            () => {
                let store = getObjectStore(DB_CATEGORY_STORE_NAME, 'readonly');
                displayListOfEntries(store, false, false, '');
                addCategoriesEventListeners();
            }
        );
    }
);


/**
 * adds event listeners to the elements of the categories page
 */
function addCategoriesEventListeners() {
    console.log('adding event listeners...');

    let addCategoryButtonElement = document.getElementById('add-entry-button');
    addCategoryButtonElement.onclick = function (evt) {
        openAddCategoryDialog();
    }

    let categoryModalCancelButton = document.getElementById('add-category-cancel-button');
    categoryModalCancelButton.onclick = function (evt) {
        closeAddCategoryDialog();
    }

    let categoryModalSaveButton = document.getElementById('add-category-save-button');
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