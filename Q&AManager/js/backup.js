buildNavigation().then(
    () => {
        console.log("navigation loaded");
        openDb();
        setTimeout(function () {
            let store = getObjectStore(DB_CATEGORY_STORE_NAME, "readonly");
            addBackupEventListeners();

        }, 10);

    }
);

/**
 * adds events for the buttons on the backup page
 */
function addBackupEventListeners() {
    let importExampleDataButtonElement = document.getElementById("import-example-data-button");

    importExampleDataButtonElement.onclick = function () {
        if (confirm('This will replace the current the data set.\n' +
            'Please consider making a backup or downloading the current data set.\n' +
            'Do you want to import the example dataset?'
        )) {
            clearCategoriesObjectStore(false);
            clearQAsObjectStore(false);
            importExampleData()
                .then(function () {
                    alert('Example set of data successfully imported');
                })
        }
    }
    let downloadDatSetButtonElement = document.getElementById("download-data-set-button");
    downloadDatSetButtonElement.onclick = function () {
        exportDataSetAsFile();
    }

    let connectToBackupServerButtonElement = document.getElementById("connect-to-backup-server-button");


}

function exportDataSetAsFile() {

    let categoriesStore = getObjectStore(DB_CATEGORY_STORE_NAME, "readonly");
    let qasStore = getObjectStore(DB_QA_STORE_NAME, "readonly");


    let categoriesContent;
    let qasContent;

    getDataAsArray(DB_CATEGORY_STORE_NAME)
        .then(function (catResult) {
            categoriesContent = catResult;

            getDataAsArray(DB_QA_STORE_NAME)
                .then(function (qaResult) {
                    qasContent = qaResult;
                    let jsonObject = {
                        "categories": categoriesContent,
                        "qas": qasContent
                    };


                    // get date & time for file name
                    let date = generateDateAndTimeString();

                    //create json file
                    const file = new File([JSON.stringify(jsonObject)], '', { type: 'application/json' });

                    //create temporary url for the json object
                    let tempUrl = URL.createObjectURL(file);

                    let aTagElement = document.createElement("a");
                    aTagElement.setAttribute("href", tempUrl);
                    aTagElement.setAttribute("download", 'backup-' + date);
                    document.body.appendChild(aTagElement);
                    aTagElement.click(); //click the tag so that the download begins
                    aTagElement.remove();  //remove the tag after the file is downloaded
                })
        });


}


/**
 * returns the data from the store as an array
 * @param{string} storeName
 */
function getDataAsArray(storeName) {
    let store = getObjectStore(storeName, "readonly");


    return new Promise(function (resolve, reject) {
        let getAllRequest = store.getAll();
        getAllRequest.onsuccess = function (evt) {
            let allData = getAllRequest.result;

            let getAllKeysRequest = store.getAllKeys();
            getAllKeysRequest.onsuccess = function (evt) {
                let keys = getAllKeysRequest.result;
                let result = [];
                for (let i = 0; i < keys.length; i++) {
                    let obj;
                    if (storeName === DB_QA_STORE_NAME) {
                        obj = {
                            key: keys[i],
                            question: allData[i].question,
                            answer: allData[i].answer,
                            categoryId: allData[i].categoryId
                        };
                    }
                    else if (storeName === DB_CATEGORY_STORE_NAME) {
                        obj = {
                            key: keys[i],
                            name: allData[i].name,
                            color: allData[i].color
                        };
                    }
                    result.push(obj);
                }
                resolve(result);
            }



        }
        getAllRequest.onerror = function (evt) {
            reject(evt.target.error);
        }
    })


    /*
    return new Promise(function (resolve, reject) {
        let values = [];
        let request = store.openCursor();
        request.onsuccess = function (evt) {

            let cursor = evt.target.result;
            if (cursor) {
                let key = cursor.key;
                let idbRequest = store.get(key);
                idbRequest.onsuccess = function (evt) {
                    let value = evt.target.result;
                    let obj;
                    if (storeName === DB_CATEGORY_STORE_NAME) {
                        obj = {
                            "id": key,
                            "name": value.name,
                            "color": value.color
                        }
                    } else if (storeName === DB_QA_STORE_NAME) {
                        obj = {
                            "id": key,
                            "question": value.name,
                            "answer": value.answer,
                            "categoryId": value.categoryId
                        }
                    }
                    values.push(obj);

                }
                cursor.continue();
            }

        }
        resolve(values);
        request.onerror = function (evt) {
            reject(evt);
        }
    })


     */

}

async function importExampleData() {
    let response = await fetch('../data/example-questions.json');

    let responseObject = await response.json();

    let qasData = responseObject.qas;
    let categoriesData = responseObject.categories;

    for (let category of categoriesData) {
        addCategoryEntry(category.name, category.color, false, category.key)
    }

    for (let qa of qasData) {
        addQAEntry(qa.question, qa.answer, qa.categoryId, false, qa.key);
    }

    console.log(qasData);
    console.log(categoriesData);

}

/**
 * @returns {string}
 */
function generateDateAndTimeString() {

    return (new Date()).toISOString().slice(0, 19).replace(":", "-").replace("T", "-").replace(":", "-");
}