
buildNavigation().then(
    () => {
        console.log("navigation loaded");
        openDb();
        setTimeout(function () {

            let store = getObjectStore(DB_QA_STORE_NAME, "readonly");
            //displayQAsList(store, false);
            displayListOfEntries(store, true, false, "");
            addSearchEventListener(false);
            if ("serviceWorker" in navigator) {
                console.log(navigator.serviceWorker);
               // navigator.serviceWorker.register("../service-worker.js");
            }

        }, 10);
    }
);
