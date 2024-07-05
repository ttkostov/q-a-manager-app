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

        let navigationData = responseObject.nav;

        let navElement = document.getElementById('navigation');

        let inputElement = document.createElement('input');
        inputElement.type = 'checkbox';
        inputElement.id = 'check';

        let labelForCheckElement = document.createElement('label');
        labelForCheckElement.setAttribute('for', 'check');
        labelForCheckElement.className = 'checkbtn';

        let spanMenuIconElement = document.createElement('span');
        spanMenuIconElement.className = 'material-icons';
        spanMenuIconElement.innerHTML = 'menu';

        labelForCheckElement.appendChild(spanMenuIconElement);

        let labelLogoElement = document.createElement('label');
        labelLogoElement.className = 'logo';
        labelLogoElement.innerHTML = 'Q&A Manager';

        let currentPage = location.href.split('/').slice(-1)[0].split('.')[0];


        let labelCurrentPageElement = document.createElement('label');
        labelCurrentPageElement.className = 'current-page-label';

        navElement.appendChild(inputElement);
        navElement.appendChild(labelForCheckElement);
        navElement.appendChild(labelLogoElement);
        labelLogoElement.appendChild(labelCurrentPageElement);


        let ulElement = document.createElement('ul');

        for (let i = 0; i < navigationData.length; i++) {
            let navItem = {
                'id': navigationData[i].id, 'name': navigationData[i].name, 'path': navigationData[i].path
            };
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
    name;
    color;

    constructor(name, color) {
        this.name = name;
        this.color = color;
    }
}

const DB_NAME = 'qa-manager-indexeddb';
const DB_VERSION = 1;
const DB_QA_STORE_NAME = 'question-and-answers';
const DB_CATEGORY_STORE_NAME = 'categories';

const BRIGHTEN_VALUE = 30;
const DARKEN_VALUE = 25;

let db;

/**
 * opens the database or initialises it if not already initialised
 * @returns {Promise<unknown>}
 */
function openDb() {
    console.log('opening database...');
    return new Promise((resolve, reject) => {
        let request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = function (evt) {
            db = this.result;
            console.log('database opened');
            resolve();
        }
        request.onerror = function (evt) {
            console.error('error when opening the database:', evt.target.errorCode);
            reject(evt.target.errorCode);
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
            resolve();
        };
    })

}

/**
 * @param {string} store_name
 * @param {string} mode could be 'readonly' or 'readwrite'
 */
function getObjectStore(store_name, mode) {
    let transaction = db.transaction(store_name, mode);
    return transaction.objectStore(store_name);
}

/**
 * clears the object store for the Q&As
 * @param {boolean} displayListEntriesAfter true if displayListOfEntries should be executed at the end,
 * false otherwise
 */
function clearQAsObjectStore(displayListEntriesAfter) {
    let store = getObjectStore(DB_QA_STORE_NAME, 'readwrite');
    let request = store.clear()
    request.onsuccess = function (evt) {
        if (displayListEntriesAfter) {
            alert('All data was successfully deleted from the database');
            displayListOfEntries(store, true, true, '');
        }

    }
    request.onerror = function (evt) {
        displayErrorMessage(evt)
    }
}

/**
 * clears the object store for the categories
 * @param {boolean} displayListEntriesAfter true if displayListOfEntries should be executed at the end,
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
        displayErrorMessage(evt);
    }
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
        console.log('entry inserted in DB');
        if (displayListEntriesAfter) {
            displayListOfEntries(store, true, true, '');
        }
    }
    request.onerror = function (evt) {
        displayErrorMessage(evt, 'Error when adding entry to the database.\nPlease make sure that the question does not already exist in the database.\n')
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
            console.log('Q&A updated!')
            displayListOfEntries(store, true, true, '');
        }
        updateRequest.onerror = function (evt) {
            console.error('error when updating entry:', evt.target.errorCode);
            displayErrorMessage(evt, 'error when updating entry: ');
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

        console.log('entry inserted in DB');
        if (displayListEntriesAfter) {
            displayListOfEntries(store, false, false);
        }
    }
    request.onerror = function (evt) {
        displayErrorMessage(evt, 'Error when adding entry to the database.\nPlease make sure that the category does not already exist in the database.\n');
    }
}


/**
 * @param {number} key
 */
function deleteQAEntry(key) {
    console.log('deleteQAEntry:', key);

    let store = getObjectStore(DB_QA_STORE_NAME, 'readwrite');

    let request = store.get(key);
    request.onsuccess = function (evt) {
        let record = evt.target.result;
        if (typeof record === 'undefined') {
            displayErrorMessage(evt, 'No matching record found!\n');
            return;
        }

        let deleteRequest = store.delete(key);
        deleteRequest.onsuccess = function (evt) {
            alert('Question successfully deleted');
            displayListOfEntries(store, true, true, '');
        }

        deleteRequest.onerror = function (evt) {
            displayErrorMessage(evt, 'error when delete entry: ');
        }
    }

    request.onerror = function (evt) {
        console.error('error when delete entry:', evt.target.errorCode);
    }
}


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
        if (typeof record === 'undefined') {
            alert('No matching record found');
            return;
        }

        let updateRequest = store.put(entry, key);

        updateRequest.onsuccess = function (evt) {
            displayListOfEntries(store, false, false);
            console.log('Category updated!');
        }
        updateRequest.onerror = function (evt) {
            console.error('error when updating entry:', evt.target.errorCode);
            displayErrorMessage(evt, 'Error when updating entry:\n');

        }
    }
}


/**
 * deletes category from the database and all questions associated with it
 * @param {number} key
 */
function deleteCategoryEntry(key) {
    console.log('delete Category Entry:', key);

    let store = getObjectStore(DB_CATEGORY_STORE_NAME, 'readwrite');

    let request = store.get(key);
    request.onsuccess = function (evt) {
        let record = evt.target.result;
        if (typeof record === 'undefined') {
            displayErrorMessage(evt, 'No matching record found.\n');
            return;
        }

        let deleteRequest = store.delete(key);
        deleteRequest.onsuccess = function (evt) {
            // also delete all question from this category
            deleteAllQuestionsWithCategory(record, key);
            displayListOfEntries(store, false, false);
        }

        deleteRequest.onerror = function (evt) {
            displayErrorMessage(evt, 'Error when deleting entry:\n');
        }
    }

    request.onerror = function (evt) {
        console.error('error when delete entry:', evt.target.errorCode);
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
            return false;
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
                        console.error('error when deleting entry:', evt.target.errorCode);
                    }


                }
            }
            cursor.continue();
        }
    }

}


/**
 * @param {IDBObjectStore=} store the store to be used
 * @param {boolean=} isQA true when the function is used on index or manage pages, false when on categories page
 * @param {boolean=} displayOptions true when the option buttons should be displayed, false otherwise
 * @param {string=} searchText search text to look for
 *
 */
function displayListOfEntries(store, isQA, displayOptions, searchText) {
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
        let searchContainer = document.getElementsByClassName('search-container')[0];
        while (searchContainer.nextSibling) {
            pageContentElement.removeChild(searchContainer.nextSibling);
        }
    } else if (decide) {
        let optionsButtonContainerElement = document.getElementsByClassName('option-buttons-container')[0];
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

                let deleteQaButtonElement = document.getElementById('delete-all-entries-button');
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
                    let deleteEntryButtonElement = document.getElementById('delete-all-entries-button');
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
            if (isQA && !searchReturnedAtLeastOneEntry && searchText !== '') {
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
    optionElement.setAttribute('category-id', key.toString());
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
    let searchButtonElement = document.getElementById('search-button');
    searchButtonElement.onclick = function (evt) {
        let searchTextInputElement = document.getElementById('search-input');
        let searchText = searchTextInputElement.value;
        let store = getObjectStore(DB_QA_STORE_NAME, 'readonly');
        displayListOfEntries(store, true, displayOptions, searchText);
    }
}

/**
 * @param {Event} event
 * @param {String} customMessage
 */
function displayErrorMessage(event, customMessage = '') {
    alert(customMessage + event.target.error.message);
}