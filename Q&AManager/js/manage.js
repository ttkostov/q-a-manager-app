/*
async function buildQuestionEditAccordions() {

    try {
        let response = await fetch('../data/example-questions.json');
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        let responseObject = await response.json();
        //responseObject.nav = undefined;

        let qaData = responseObject.qas;

        console.log(qaData);

        let pageContentElement = document.getElementById('page-content');

        let categoryContainerElement = document.createElement('div');
        categoryContainerElement.className = 'category-container';

        for(let i = 0; i < qaData.length; i++ ) {
            let qaItem = qaData[i];
            let headingElement = document.createElement('h2');
            headingElement.innerHTML = qaItem.category;

            let accordionHeaderElement = document.createElement('button');
            accordionHeaderElement.className = 'accordion-option-header';
            accordionHeaderElement.innerHTML = qaItem.question;

            let optionButtonsContainerElement = document.createElement('div');
            optionButtonsContainerElement.className = 'option-buttons-container';

            let optionEditButtonElement = document.createElement('button');
            optionEditButtonElement.className = 'option-button';
            optionEditButtonElement.id = 'edit-button';

            let optionEditButtonSpanElement = document.createElement('span');
            optionEditButtonSpanElement.className = 'material-symbols-outlined';
            optionEditButtonSpanElement.innerHTML = 'edit';

            optionEditButtonElement.appendChild(optionEditButtonSpanElement);

            let optionDeleteButtonElement = document.createElement('button');
            optionDeleteButtonElement.className = 'option-button';
            optionDeleteButtonElement.id = 'delete-button';

            let optionDeleteButtonSpanElement = document.createElement('span');
            optionDeleteButtonSpanElement.className = 'material-symbols-outlined';
            optionDeleteButtonSpanElement.innerText = 'delete';

            optionDeleteButtonElement.appendChild(optionDeleteButtonSpanElement);

            optionButtonsContainerElement.appendChild(optionEditButtonElement);
            optionButtonsContainerElement.appendChild(optionDeleteButtonElement);

            accordionHeaderElement.appendChild(optionButtonsContainerElement);

            let accordionContentElement = document.createElement('div');
            accordionContentElement.className = 'accordion-panel';

            let accordionPElemnt = document.createElement('p');
            accordionPElemnt.innerHTML = qaItem.answer;

            accordionContentElement.appendChild(accordionPElemnt);

            categoryContainerElement.appendChild(headingElement);
            categoryContainerElement.appendChild(accordionHeaderElement);
            categoryContainerElement.appendChild(accordionContentElement);
            pageContentElement.appendChild(categoryContainerElement);
        }

        let bodyElement = document.getElementsByTagName("body")[0];

        let scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = "../js/accordion-logic.js";

        bodyElement.appendChild(scriptElement);

    } catch (err) {
        console.error(err);
    }

}


buildQuestionEditAccordions()
    .then(() => console.log("q&a edit accordions loaded"))

 */

let atLeastOneCategory = false;

buildNavigation().then(
    () => {
        console.log("navigation loaded");
        openDb();
        setTimeout(function () {
            let store = getObjectStore(DB_QA_STORE_NAME, "readonly");
            //displayQAsList(store, true);
            displayListOfEntries(store, true, true,"");
            addEventListeners();
            addSearchEventListener(true);

        }, 10);

    }
);

function openAddQADialog() {
    if(!atLeastOneCategory) {
        alert('No categories found in the database!\nPlease go to the categories page to add a category.');
        return;
    }

    let qaDialogHeadingElement = document.getElementById('manage-qa-dialog-heading');
    qaDialogHeadingElement.innerText =  'Add Q&A';



    let qaDialogElement = document.getElementById('manage-qa-dialog');
    qaDialogElement.showModal()
}

function closeManageQADialog() {
    let qaDialogElement = document.getElementById('manage-qa-dialog');
    resetModalInputs(qaDialogElement);
    qaDialogElement.close()
}

function saveQaAndClose() {
    let qaDialogElement = document.getElementById('manage-qa-dialog');
    let id = +document.getElementById('id-input-field').value;

    let questionInputElement = document.getElementById('question-input-field')
    let questionInput = questionInputElement.value;

    let answerInputElement = document.getElementById('answer-input-field');
    let answerInput = answerInputElement.innerText;

    let categoryInput = 0;
    let categoryInputElement = document.getElementById('category-input-field')
    for(let child of categoryInputElement.children) {
        if (child.innerText === categoryInputElement.value) {
            categoryInput = +child.getAttribute("category-id");
        }
    }

    if(!questionInputElement.checkValidity() || answerInput === '') {
        alert('Please enter a valid question and answer!');
        return;
    }

    let qaDialogHeadingElement = document.getElementById('manage-qa-dialog-heading');
    if(qaDialogHeadingElement.innerText === 'Add Q&A') {
        addQAEntry(questionInput, answerInput, categoryInput, true);
    }
    else {
        updateQAEntry(id, questionInput, answerInput, categoryInput);
    }


    resetModalInputs(qaDialogElement);
    qaDialogElement.close()

}

/**
 * @param {number=} key object key
 * @param {QuestionAnswer=} object object to use to fill the fields
 */
function openEditQADialog(key, object) {
    if(!atLeastOneCategory) {
        alert('No categories found in the database!\nPlease go to the categories page to add a category.');
        return;
    }

    let qaDialogHeadingElement = document.getElementById('manage-qa-dialog-heading');
    qaDialogHeadingElement.innerText =  'Edit Q&A';

    let idInput = document.getElementById('id-input-field');
    idInput.value = key;

    let questionInput = document.getElementById('question-input-field');
    questionInput.value = object.question;
    let answerInput = document.getElementById('answer-input-field');
    answerInput.innerHTML = object.answer;

    let categoryInput = document.getElementById('category-input-field');
    for(let child of categoryInput.children) {
        if (+child.getAttribute("category-id") === object.categoryId) {
            categoryInput.value = child.innerText;
        }
    }


    let qaDialogElement = document.getElementById('manage-qa-dialog');
    qaDialogElement.showModal()
}

function addEventListeners() {
    console.log("adding event listeners...");

    let addQaButtonElement = document.getElementById("add-entry-button");
    addQaButtonElement.onclick = function (evt) {
        openAddQADialog();
    }

    let qaModalCancelButton = document.getElementById("add-qa-cancel-button");
    qaModalCancelButton.onclick = function (evt) {
        closeManageQADialog();
    }

    let qaModalSaveButton = document.getElementById("add-qa-save-button");
    qaModalSaveButton.onclick = function (evt) {
        saveQaAndClose()
    }

    let deleteAllQasButtonElement = document.getElementById("delete-all-entries-button");
    deleteAllQasButtonElement.onclick = function (evt) {
        if (confirm('Are you sure you want to clear the database?\nThis action cannot be undone!')) {
            clearQAsObjectStore(true);
        }
    }
    console.log("event listeners added");

}

/**
 * updates the list of categories in the select element in the dialog
 */
function updateSelectElementWithCategoriesInModal() {
    let store = getObjectStore(DB_CATEGORY_STORE_NAME, 'readonly');

    let numberOfEntriesRequest = store.count();
    let numberOfEntries = -1;

    numberOfEntriesRequest.onsuccess = function (evt) {
        numberOfEntries = evt.target.result;
        if (numberOfEntries === 0) {
            atLeastOneCategory = false;
            return;
        }
    }

    numberOfEntriesRequest.onerror = function (evt) {
        alert('Error when reading the categories database!');
        atLeastOneCategory = false;
        return;
    }

    // clear previous content in select element
    let selectElement = document.getElementById('category-input-field');
    selectElement.innerHTML = '';

    let request = store.openCursor();
    request.onsuccess = function (evt) {
        let cursor = evt.target.result;
        if(cursor) {

            let key = cursor.key;
            let idbRequest = store.get(key);
            idbRequest.onsuccess = function (evt) {
                atLeastOneCategory = true;
                let value = evt.target.result;
                addCategoryToSelectElementInDialog(value, key);
            }
            cursor.continue();
        }

    }

    // change background color of select when changing the input
    selectElement.onchange = function (evt) {
        selectElement.style.background = selectElement.options[selectElement.selectedIndex].style.backgroundColor;
    }
}