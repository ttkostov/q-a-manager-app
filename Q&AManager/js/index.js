buildNavigation().then(
    () => {
        console.log('navigation loaded');
        openDb().then(
            () => {
                let store = getObjectStore(DB_QA_STORE_NAME, 'readonly');

                displayListOfEntries(store, true, false, '');
                addSearchEventListener(false);
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('../service-worker.js');
                }
            }
        ).catch(
            (reason) => {
                console.log(reason);
            }
        );
    }
);
