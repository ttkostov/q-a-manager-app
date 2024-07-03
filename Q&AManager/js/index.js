/*
async function buildQuestionAccordions() {

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
            console.log("hwhewh");
            let qaItem = qaData[i];
            let headingElement = document.createElement('h2');
            headingElement.innerHTML = qaItem.category;

            let accordionHeaderElement = document.createElement('button');
            accordionHeaderElement.className = 'accordion-header';
            accordionHeaderElement.innerHTML = qaItem.question;

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


buildQuestionAccordions()
    .then(() => console.log("q&a accordions loaded"))


 */

buildNavigation().then(
    () => {
        console.log("navigation loaded");
        openDb();
        setTimeout(function () {

            let store = getObjectStore(DB_QA_STORE_NAME, "readonly");
            //displayQAsList(store, false);
            displayListOfEntries(store, true, false, "");
            addSearchEventListener(false);

        }, 10);
    }
);
