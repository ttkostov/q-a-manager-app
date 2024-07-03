/**
 * builds an accordion element for a single Q&A entry
 * @param {number} key object key in the DB
 * @param {QuestionAnswer} object object to use
 * @param {boolean=} displayOptions 1 when the option buttons should be displayed (on the manage page), 0 otherwise (on index page)
 */

function buildQuestionAccordion(key, object, displayOptions) {

    let store = getObjectStore(DB_CATEGORY_STORE_NAME, 'readonly');

    let request = store.get(object.categoryId);
    request.onsuccess = function () {
        let categoryColor = request.result.color;

        let pageContentElement = document.getElementById('page-content');

        let categoryContainerElement = document.createElement('div');
        categoryContainerElement.className = 'category-container';

        let accordionHeaderElement = document.createElement('button');
        accordionHeaderElement.className = 'accordion-header';
        accordionHeaderElement.innerHTML = object.question;

        let listElementOptionButtonsContainerElement = document.createElement('div');
        listElementOptionButtonsContainerElement.className = 'list-element-option-buttons-container';

        if (displayOptions) {
            buildDeleteAndOptionButtons(listElementOptionButtonsContainerElement, true, key, object);
        }

        let optionExpandButtonElement = document.createElement('button');
        optionExpandButtonElement.className = 'option-button';
        optionExpandButtonElement.id = 'expand-button';

        listElementOptionButtonsContainerElement.appendChild(optionExpandButtonElement);
        accordionHeaderElement.appendChild(listElementOptionButtonsContainerElement);

        setBackgroundColorOfElement(accordionHeaderElement, categoryColor);

        let accordionContentElement = document.createElement('div');
        accordionContentElement.className = 'accordion-panel';

        let lighterColor = new tinycolor(categoryColor).lighten(BRIGHTEN_VALUE/2).toString();
        setBackgroundColorOfElement(accordionContentElement, lighterColor);


        let accordionPElement = document.createElement('p');
        accordionPElement.innerHTML = object.answer;

        accordionContentElement.appendChild(accordionPElement);

        categoryContainerElement.appendChild(accordionHeaderElement);
        categoryContainerElement.appendChild(accordionContentElement);
        pageContentElement.appendChild(categoryContainerElement);

        // add logic
        accordionHeaderElement.addEventListener("click", function () {
            if (this.classList.contains('accordion-header')) {
                this.classList.toggle("active");
            }

            let panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });

    }

    request.onerror = function () {
        console.log("Error reading category database");
    }



}

/**
 * adds delete and edit buttons to the list elements on the manage and categories pages
 * @param {HTMLDivElement} parentElement parent element to which the buttons are added
 * @param {boolean} isQA 1 if the buttons are added in the manage page, 0 if the buttons are added in the categories page
 * @param {number} key object key in the DB
 * @param {object} object object to use
 */
function buildDeleteAndOptionButtons(parentElement, isQA, key, object) {
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

    parentElement.appendChild(optionEditButtonElement);
    parentElement.appendChild(optionDeleteButtonElement);

    if (isQA) {
        optionEditButtonElement.onclick = function (evt) {
            openEditQADialog(key, object);
        }

        optionDeleteButtonElement.onclick = function (evt) {
            if (confirm('Are you sure you to delete the following question:\n' +
                '' + object.question + '\n' +
                'This action cannot be undone!')) {
                deleteQAEntry(key);
            }
        }
    } else {
        optionEditButtonElement.onclick = function (evt) {
            openEditCategoryDialog(key, object); //todo
        }

        optionDeleteButtonElement.onclick = function (evt) {
            if (confirm('Are you sure you to delete the following category:\n' +
                '' + object.name + '\n' +
                'All questions associated with this category will also be deleted.\n' +
                'This action cannot be undone!')) {
                deleteCategoryEntry(key);
            }
        }
    }

}


/**
 * adds button for a category to the html
 * @param {number} key object key in the DB
 * @param {Category} object object to use
 */
function buildCategoryButton(key, object) {
    let pageContentElement = document.getElementById('page-content');

    let accordionHeaderElement = document.createElement('button');
    accordionHeaderElement.className = 'accordion-header';
    accordionHeaderElement.innerHTML = object.name;
    setBackgroundColorOfElement(accordionHeaderElement, object.color);

    let listElementOptionButtonsContainerElement = document.createElement('div');
    listElementOptionButtonsContainerElement.className = 'list-element-option-buttons-container';

    buildDeleteAndOptionButtons(listElementOptionButtonsContainerElement, false, key, object);

    accordionHeaderElement.appendChild(listElementOptionButtonsContainerElement);
    pageContentElement.appendChild(accordionHeaderElement);
}


