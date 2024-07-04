buildNavigation().then(
    () => {
        console.log("navigation loaded");
        openDb().then(
            () => {
                let store = getObjectStore(DB_CATEGORY_STORE_NAME, "readonly");
                addBackupEventListeners();
            }
        );
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
        getDataSet().then((data) => {
            let date = generateDateAndTimeString();

            //create json file
            const file = new File([JSON.stringify(data)], '', {type: 'application/json'});

            //create temporary url for the json object
            let tempUrl = URL.createObjectURL(file);

            let aTagElement = document.createElement("a");
            aTagElement.setAttribute("href", tempUrl);
            aTagElement.setAttribute("download", 'backup-' + date);
            document.body.appendChild(aTagElement);
            aTagElement.click(); //click the tag so that the download begins
            aTagElement.remove();  //remove the tag after the file is downloaded
        })
            .catch(function (err) {
                alert(err);
            });

    }


    let connectToBackupServerButtonElement = document.getElementById("connect-to-backup-server-button");
    connectToBackupServerButtonElement.onclick = function () {
        getDispatcher();
    }
}
    /**
     * gets all data and saves it to a file
     */
    function getDataSet() {

        let categoriesStore = getObjectStore(DB_CATEGORY_STORE_NAME, "readonly");
        let qasStore = getObjectStore(DB_QA_STORE_NAME, "readonly");


        let categoriesContent;
        let qasContent;

        return new Promise((resolve, reject) => {
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

                            let jsonObjectAsString = JSON.stringify(jsonObject);
                            resolve(jsonObjectAsString);
                        })
                        .catch(function (err) {
                            reject(err);
                        })
                });
        })


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
                        } else if (storeName === DB_CATEGORY_STORE_NAME) {
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

    function connectionSucceeded() {
        let serverInfoContainerElement = document.getElementById('server-info-container');

        //clear previous content
        serverInfoContainerElement.innerHTML = '';

        let h2Element = document.createElement("h2");
        h2Element.innerHTML = 'Connection to the server established';
        h2Element.style.color = 'var(--connection-succeeded-color)';

        serverInfoContainerElement.appendChild(h2Element);

        if (getEntriesLink !== "") {
            getEntries();
        }
    }

    function noDataOnserver(msg) {
        let serverInfoContainerElement = document.getElementById('server-info-container');

        let pElement = document.createElement("p");
        pElement.innerText = msg;
        serverInfoContainerElement.appendChild(pElement);

        if (postEntriesLink !== "") {
            addMakeBackupButton();
        }
    }

    function addMakeBackupButton() {
        let serverInfoContainerElement = document.getElementById('server-info-container');

        let makeBackupButtonElement = document.createElement("button");
        makeBackupButtonElement.className = "global-button";
        let spanElement = document.createElement("span");
        spanElement.innerText = "cloud_upload";
        spanElement.className = "material-symbols-outlined";
        makeBackupButtonElement.appendChild(spanElement);

        makeBackupButtonElement.innerHTML += "Upload New Backup";

        serverInfoContainerElement.appendChild(makeBackupButtonElement);

        makeBackupButtonElement.onclick = function () {
            if (confirm('This will replace the current backup on the server (if available).\n' +
                'Do you want to upload the new backup to the server?')) {
                postEntries();
            }

        }
    }

    function connectionFailed() {
        let serverInfoContainerElement = document.getElementById('server-info-container');

        //clear previous content
        serverInfoContainerElement.innerHTML = '';

        let h2Element = document.createElement("h2");
        h2Element.innerHTML = 'Connection to the server failed';
        h2Element.style.color = 'var(--connection-failed-color)';

        serverInfoContainerElement.appendChild(h2Element);

        addTryAgainButton()
    }

    function addTryAgainButton() {
        let serverInfoContainerElement = document.getElementById('server-info-container');

        let tryAgainButtonElement = document.createElement("button");
        tryAgainButtonElement.className = "global-button";
        let spanElement = document.createElement("span");
        spanElement.innerText = "restart_alt";
        spanElement.className = "material-symbols-outlined";
        tryAgainButtonElement.appendChild(spanElement);

        tryAgainButtonElement.innerHTML += "Try Again";
        serverInfoContainerElement.appendChild(tryAgainButtonElement);

        tryAgainButtonElement.onclick = function () {
            getDispatcher();
        }
    }

    /**
     * displays backup details and adds use backup button
     */
    function backupFound(responseObject) {
        let serverInfoContainerElement = document.getElementById('server-info-container');

        let pElement = document.createElement("p");
        let date = new Date(Date.parse(responseObject.lastUpdated));
        pElement.innerText = 'Backup from ' + date + ' found.';
        pElement.style.fontWeight = 'bold';

        serverInfoContainerElement.appendChild(pElement);
        addUseBackupButton(responseObject);

        if (postEntriesLink !== "") {
            addMakeBackupButton();
        }
    }

    function addUseBackupButton(backupObject) {
        let serverInfoContainerElement = document.getElementById('server-info-container');

        let useBackupButtonElement = document.createElement('button');
        useBackupButtonElement.className = 'global-button';
        let spanElement = document.createElement("span");
        spanElement.innerText = "cloud_download";
        spanElement.className = "material-symbols-outlined";
        useBackupButtonElement.appendChild(spanElement);
        useBackupButtonElement.innerHTML += 'Use this backup';

        serverInfoContainerElement.appendChild(useBackupButtonElement);

        useBackupButtonElement.onclick = function () {
            if (confirm('This will replace the current the data set.\n' +
                'Please consider making a backup or downloading the current data set.\n' +
                'Do you want to import this backup?'
            )) {
                importBackupToDatabase(backupObject);
            }
        }

    }

    function importBackupToDatabase(backupObject) {

        clearCategoriesObjectStore(false);
        clearQAsObjectStore(false);

        for (let category of backupObject.categories) {
            addCategoryEntry(category.name, category.color, false, category.key);
        }

        for (let qa of backupObject.qas) {
            addQAEntry(qa.question, qa.answer, qa.categoryId, false, qa.key);
        }

        alert("Backup successfully imported!");

        getDispatcher();
    }