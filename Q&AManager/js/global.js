/**
 * builds navigation from the file navigation.json
 * @returns {Promise<void>}
 */
async function buildNavigation() {

    try {
        let response = await fetch('../data/navigation.json');
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        let responseObject = await response.json();
        //responseObject.nav = undefined;


        let navigationData = responseObject.nav;
        console.log(navigationData);

        let navElement = document.getElementById('navigation');

        let inputElement = document.createElement('input');
        inputElement.type = 'checkbox';
        inputElement.id = 'check';

        let labelForCheckElement = document.createElement('label');
        labelForCheckElement.setAttribute("for", "check");
        labelForCheckElement.className = 'checkbtn';

        let spanMenuIconElement = document.createElement('span');
        spanMenuIconElement.className = "material-icons";
        spanMenuIconElement.innerHTML = "menu";

        labelForCheckElement.appendChild(spanMenuIconElement);

        let labelLogoElement = document.createElement('label');
        labelLogoElement.className = "logo";
        labelLogoElement.innerHTML = "Q&A Manager";

        let currentPage = location.href.split("/").slice(-1)[0].split(".")[0];


        let labelCurrentPageElement = document.createElement('label');
        labelCurrentPageElement.className = "current-page-label";

        navElement.appendChild(inputElement);
        navElement.appendChild(labelForCheckElement);
        navElement.appendChild(labelLogoElement);
        labelLogoElement.appendChild(labelCurrentPageElement);


        let ulElement = document.createElement('ul');

        for (let i = 0; i < navigationData.length; i++) {
            let navItem = {
                "id": navigationData[i].id,
                "name": navigationData[i].name,
                "path": navigationData[i].path
            };
            console.log(navItem);
            let liElement = document.createElement('li');
            let aElement = document.createElement('a');
            aElement.href = navItem.path;
            aElement.innerHTML = navItem.name;
            if (navItem.name.toLowerCase() === currentPage.toLowerCase()) {
                labelCurrentPageElement.innerHTML = ' /' + navItem.name;
            }
            liElement.appendChild(aElement);
            ulElement.appendChild(liElement);
        }
        navElement.appendChild(ulElement);

    } catch (err) {
        console.error(err);
    }

}

class QuestionAnswer {
  //  id;
    question;
    answer;
    categoryId;

    constructor(question, answer, categoryId) {
        this.question = question;
        this.answer = answer;
        this.categoryId = categoryId;
    }

    get question() {
        return this.question;
    }

    get answer() {
        return this.answer;
    }

    get categoryId() {
        return this.categoryId;
    }
}

class Category {
   // id;
    name;
    color;

    constructor(name, color) {
        this.name = name;
        this.color = color;
    }
}

const DB_NAME = "qa-manager-indexeddb";
const DB_VERSION = 1;
const DB_QA_STORE_NAME = "question-and-answers";
const DB_CATEGORY_STORE_NAME = "categories";

const BRIGHTEN_VALUE = 30;
const DARKEN_VALUE = 25;

let db;

function openDb() {
    console.log("opening database...");
    let request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = function (evt) {
        db = this.result;
        console.log("database opened");
    }
    request.onerror = function (evt) {
        console.error("error when opening the database:", evt.target.errorCode);
    }

    request.onupgradeneeded = function (evt) {
        let qaStore = evt.currentTarget.result.createObjectStore(DB_QA_STORE_NAME, {
            autoIncrement: true
        });

        //qaStore.createIndex('id', 'id', {unique: true});
        qaStore.createIndex('question', 'question', {unique: true});
        qaStore.createIndex('answer', 'answer', {unique: false});
        qaStore.createIndex('categoryId', 'categoryId', {unique: false});

        let categoryStore = evt.currentTarget.result.createObjectStore(DB_CATEGORY_STORE_NAME, {
            autoIncrement: true
        });

        //  categoryStore.createIndex('id', 'id', {unique: true});
        categoryStore.createIndex('name', 'id', {unique: true});
        categoryStore.createIndex('color', 'id', {unique: true});
    };
}

/**
 * @param {string} store_name
 * @param {string} mode could be "readonly" or "readwrite"
 */
function getObjectStore(store_name, mode) {
    let transaction = db.transaction(store_name, mode);
    return transaction.objectStore(store_name);
}

/**
 * clears the object store for the Q&As
 * @param {boolean} displayListEntriesAfter true if displayListOfEntries schould be executed at the end,
 * false otherwise
 */
function clearQAsObjectStore(displayListEntriesAfter) {
    let store = getObjectStore(DB_QA_STORE_NAME, 'readwrite');
    let request = store.clear()
    request.onsuccess = function (evt) {
        if (displayListEntriesAfter) {
            alert('All data was successfully deleted from the database');
            displayListOfEntries(store, true, true, "");
        }

    }
    request.onerror = function (evt) {
        // todo display message for failure
    }
}

/**
 * clears the object store for the categories
 * @param {boolean} displayListEntriesAfter true if displayListOfEntries schould be executed at the end,
 * false otherwise
 */
function clearCategoriesObjectStore(displayListEntriesAfter) {
    let store = getObjectStore(DB_CATEGORY_STORE_NAME, 'readwrite');
    let request = store.clear()
    request.onsuccess = function (evt) {
        if (displayListEntriesAfter) {
            alert('All data was successfully deleted from the database');
            displayListOfEntries(store, false, false);
        }

    }
    request.onerror = function (evt) {
        // todo display message for failure
    }
}

/**
 * @param {IDBObjectStore=} store the store to be used
 * @param {boolean=} displayOptions 1 when the option buttons should be displayed, 0 otherwise
 */
// todo delete if not used
function displayQAsList(store, displayOptions) {
    console.log('displaying Q&As list...');

    if (typeof (store) === 'undefined') {
        store = getObjectStore(DB_QA_STORE_NAME, 'readonly');
    }

    let pageContentElement = document.getElementById('page-content');
    // clear previous content
    // if on manage or categories page don't remove add button
    if (displayOptions) {
        let manageOptionsButtonContainerElement = document.getElementsByClassName("option-buttons-container")[0];
        while (manageOptionsButtonContainerElement.nextSibling) {
            pageContentElement.removeChild(manageOptionsButtonContainerElement.nextSibling);
        }
    } else {
        pageContentElement.innerHTML = '';
    }

    let numberOfEntriesRequest = store.count();
    let numberOfEntries = -1;


    let h2Element = document.createElement('h2');
    let pElement = document.createElement('p');
    let aElement = document.createElement('a');

    numberOfEntriesRequest.onsuccess = function (evt) {
        numberOfEntries = evt.target.result;
        if (numberOfEntries === 0) {
            h2Element.innerHTML = 'No entries found in the database.';
            if (displayOptions) {
                pElement.innerHTML = 'Please use the button to add Q&As or import an example set of data';
                // todo add link here for the import of example data

                let deleteQaButtonElement = document.getElementById("delete-all-entries-button");
                deleteQaButtonElement.disabled = true;
            } else {
                aElement.innerText = 'Manage';
                aElement.href = './manage.html'
                pElement.innerHTML = 'Please go to the ';
                pElement.appendChild(aElement);
                pElement.innerHTML = pElement.innerHTML + ' page to add Q&As';
            }

            pageContentElement.appendChild(h2Element);
            pageContentElement.appendChild(pElement);

            return;
        }
    }
    numberOfEntriesRequest.onerror = function (evt) {
        h2Element.innerHTML = 'Error when reading the database:';
        pElement.innerHTML = this.error;

        pageContentElement.appendChild(h2Element);
        pageContentElement.appendChild(pElement);
    }


    // request data from db
    let request = store.openCursor();
    request.onsuccess = function (evt) {
        let cursor = evt.target.result;

        // If the cursor is pointing at something, ask for the data
        if (cursor) {
            let key = cursor.key;
            let idbRequest = store.get(key);
            idbRequest.onsuccess = function (evt) {
                let value = evt.target.result;
                if (displayOptions) {
                    let deleteQaButtonElement = document.getElementById("delete-all-entries-button");
                    deleteQaButtonElement.disabled = false;
                }
                buildQuestionAccordion(key, value, displayOptions);
            };
            cursor.continue()
        }

    };
    console.log('Q&As list displayed');

}


/**
 * @param {string} question
 * @param {string} answer
 * @param {number} categoryId
 * @param {boolean} displayListEntriesAfter true if displayListOfEntries should be executed at the end,
 * @param {number} id
 */
function addQAEntry(question, answer, categoryId, displayListEntriesAfter, id) {
    let entry = new QuestionAnswer(question, answer, categoryId);

    let store = getObjectStore(DB_QA_STORE_NAME, 'readwrite');

    let request;
    if (arguments.length === 5) {
        request = store.add(entry, id);
    } else {
        request = store.add(entry);
    }

    request.onsuccess = function (evt) {
        console.log("entry inserted in DB");
        if (displayListEntriesAfter) {
            displayListOfEntries(store, true, true, "");
        }
    }
    request.onerror = function (evt) {
        alert('Error when adding entry to the database.\nPlease make sure that the question does not already exist in the database.');
        console.error("error when adding entry:", evt.target.errorCode);
        // todo display message for failure function
    }

}

/**
 * @param {number} key
 * @param {string} question
 * @param {string} answer
 * @param {number} categoryId
 */
function updateQAEntry(key, question, answer, categoryId) {
    let entry = new QuestionAnswer(question, answer, categoryId);
    let store = getObjectStore(DB_QA_STORE_NAME, 'readwrite');


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
            // todo display success message
            displayListOfEntries(store, true, true,"");
        }
        updateRequest.onerror = function (evt) {
            console.error("error when updating entry:", evt.target.errorCode);
            // todo show message for error??
        }

    }


}

/**
 * adds a category entry to the database
 * @param {string} name
 * @param {color} color
 * @param {boolean} displayListEntriesAfter true if displayListOfEntries should be executed at the end,
 * @param {number} id
 */
function addCategoryEntry(name, color, displayListEntriesAfter, id) {
    let entry = new Category(name, color);

    let store = getObjectStore(DB_CATEGORY_STORE_NAME, 'readwrite');

    let request;
    if (arguments.length === 4) {
        request = store.add(entry, id);
    } else {
        request = store.add(entry);
    }
    request.onsuccess = function (evt) {

        console.log("entry inserted in DB");
        if (displayListEntriesAfter) {
            displayListOfEntries(store, false, false);
            // todo display list of categories
        }

    }
    request.onerror = function (evt) {
        alert('Error when adding entry to the database.\nPlease make sure that the category does not already exist in the database.');
        console.error("error when adding entry:", evt.target.errorCode);
        // todo display message for failure function
    }

}

// todo put the other category functions here


/**
 * @param {number} key
 */
function deleteQAEntry(key) {
    console.log("deleteQAEntry:", key);

    let store = getObjectStore(DB_QA_STORE_NAME, 'readwrite');

    let request = store.get(key);
    request.onsuccess = function (evt) {
        let record = evt.target.result;
        if (typeof record === 'undefined') {
            // todo display failure message with text 'No matching record found'
            return;
        }

        let deleteRequest = store.delete(key);
        deleteRequest.onsuccess = function (evt) {
            alert('Question successfully deleted');
            displayListOfEntries(store, 1, 1, "");
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
 * @param {IDBObjectStore=} store the store to be used
 * @param {boolean=} isQA 1 when the function is used on index or manage pages, 0 when on categories page
 * @param {boolean=} displayOptions 1 when the option buttons should be displayed, 0 otherwise
 * @param {string=} searchText search text to look for
 *
 */
function displayListOfEntries(store, isQA, displayOptions, searchText) {
    let targetString = isQA ? 'Q&A' : 'Category';
    let targetStringInPlural = isQA ? 'Q&As' : 'Categories'

    let decide = (isQA && displayOptions) || !isQA; // manage or categories pages

    console.log('displaying ' + targetStringInPlural.toLowerCase() + '...');

    if (typeof (store) === 'undefined') {
        store = isQA ? getObjectStore(DB_QA_STORE_NAME, 'readonly') : getObjectStore(DB_CATEGORY_STORE_NAME, 'readonly');
    }

    let pageContentElement = document.getElementById('page-content');
    // clear previous content
    // if on manage or categories page don't remove add button
    if (isQA && !displayOptions) { // index page
        let searchContainer = document.getElementsByClassName("search-container")[0];
        while (searchContainer.nextSibling) {
            pageContentElement.removeChild(searchContainer.nextSibling);
        }
    } else if (decide) {
        let optionsButtonContainerElement = document.getElementsByClassName("option-buttons-container")[0];
        while (optionsButtonContainerElement.nextSibling) {
            pageContentElement.removeChild(optionsButtonContainerElement.nextSibling);
        }
    }

    let numberOfEntriesRequest = store.count();
    let numberOfEntries = -1;


    let h2Element = document.createElement('h2');
    let pElement = document.createElement('p');
    let aElement = document.createElement('a');

    let entriesNotFound = false;
    numberOfEntriesRequest.onsuccess = function (evt) {
        numberOfEntries = evt.target.result;
        if (numberOfEntries === 0) {
            entriesNotFound = true;
            h2Element.innerHTML = 'No entries found in the database.';
            if (decide) {
                pElement.innerHTML = 'Please use the button to add ' + targetStringInPlural + ' or import an example set of data';
                // todo add link here for the import of example data

                let deleteQaButtonElement = document.getElementById("delete-all-entries-button");
                deleteQaButtonElement.disabled = true;
            } else {
                aElement.innerText = 'Manage';
                aElement.href = './manage.html'
                pElement.innerHTML = 'Please go to the ';
                pElement.appendChild(aElement);
                pElement.innerHTML = pElement.innerHTML + ' page to add Q&As';
            }

            pageContentElement.appendChild(h2Element);
            pageContentElement.appendChild(pElement);

        }
    }
    numberOfEntriesRequest.onerror = function (evt) {
        h2Element.innerHTML = 'Error when reading the database:';
        pElement.innerHTML = this.error;

        pageContentElement.appendChild(h2Element);
        pageContentElement.appendChild(pElement);
    }

    let searchReturnedAtLeastOneEntry = false;
    // request data from db
    let request = store.openCursor();
    request.onsuccess = function (evt) {
        let cursor = evt.target.result;

        // If the cursor is pointing at something, ask for the data
        if (cursor) {
            let key = cursor.key;
            let idbRequest = store.get(cursor.key);
            idbRequest.onsuccess = function (evt) {
                let value = evt.target.result;
                if (decide) {
                    let deleteEntryButtonElement = document.getElementById("delete-all-entries-button");
                    deleteEntryButtonElement.disabled = false;
                }
                if (isQA) {
                    if (searchText !== undefined) {
                        let searchIsSuccessful = value.question.toLowerCase().includes(searchText.toLowerCase())
                        if (searchIsSuccessful) {
                            searchReturnedAtLeastOneEntry = true;

                            buildQuestionAccordion(key, value, displayOptions);
                        }
                    }
                }
                if (!isQA) {
                    buildCategoryButton(key, value);
                }
            };
            cursor.continue()
        } else {
            if (isQA && !searchReturnedAtLeastOneEntry && searchText !== "") {
                h2Element.innerHTML = 'No entries for this search query.';
                pageContentElement.appendChild(h2Element);
            }

        }

    };
    if (isQA && displayOptions) {
        updateSelectElementWithCategoriesInModal();
    }

    console.log(targetStringInPlural + ' list displayed');

}


/**
 * resets the inputs of the form in the dialog
 * @param {HTMLDialogElement=} modal modal to reset
 */
function resetModalInputs(modal) {
    let children = modal.children
    for (let child of children) {
        if (child instanceof HTMLFormElement) {
            child.reset();
        }
    }

    let spanElement = document.getElementById('answer-input-field');
    if (spanElement !== null) {
        spanElement.innerHTML = '';
    }

    let selectElement = document.getElementById('category-input-field');
    if (selectElement !== null) {
        selectElement.style.background = ''
    }


}


/**
 * adds the category to the list of categories in the dialog
 * @param {Category} category the name of the category to be added to the select element in the dialog
 * @param {number} key id of the category
 */
function addCategoryToSelectElementInDialog(category, key) {
    let selectElement = document.getElementById('category-input-field');
    let optionElement = document.createElement('option');
    optionElement.value = category.name;
    optionElement.innerText = category.name;
    optionElement.setAttribute("category-id", key.toString());
    setBackgroundColorOfElement(optionElement, category.color);
    selectElement.appendChild(optionElement);
}

/**
 * brightens/darkens the given color depending on light/dark mode being used
 * and changes the background of the element
 * @param {HTMLElement} element
 * @param {color} color
 */
function setBackgroundColorOfElement(element, color) {
    let c = tinycolor(color);
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // dark mode
        element.style.backgroundColor = c.darken(DARKEN_VALUE).toString();
    } else {
        element.style.backgroundColor = c.brighten(BRIGHTEN_VALUE).toString();
    }
}

/**
 * adds events for the search bar
 * @param {boolean} displayOptions true if the options buttons are displayed on the page (manage page), false otherwise (index page)
 */
function addSearchEventListener(displayOptions) {
    let searchButtonElement = document.getElementById("search-button");
    searchButtonElement.onclick = function (evt) {
        let searchTextInputElement = document.getElementById("search-input");
        let searchText = searchTextInputElement.value;
        let store = getObjectStore(DB_QA_STORE_NAME, "readonly");
        displayListOfEntries(store, true, displayOptions, searchText);
    }
}