
let getEntriesLink = "";
let postEntriesLink = "";


function fetchConfig() {
    let response = fetch('../data/config.json');

    return new Promise((resolve, reject) => {
            response.then(function (data) {
                let config = data.json();
                config.then(
                    function (jsonData) {
                        resolve(jsonData);
                    }
                );
                config.catch(function (err) {
                    reject(err);
                });
            });
            response.catch(function (err) {
                reject(err);
            });
    })

}

function getDispatcher() {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.setDi

    fetchConfig().then(function (configData) {
        let url = urlBuilder(configData.serverAddress, configData.serverPort);
        
        xmlHttp.open("GET", url, true);
        
        xmlHttp.onerror = function (err) {
            connectionFailed();
        }
        xmlHttp.send(null);

        xmlHttp.onload = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {

                let relArray = xmlHttp.getResponseHeader("Link").split(',');
                for (let rel of relArray) {
                    if(rel.includes('get-entries')) {
                        getEntriesLink = extractURLFromResponse(rel)
                    }
                    if(rel.includes('post-entries')) {
                        postEntriesLink = extractURLFromResponse(rel);
                    }
                }
                connectionSucceeded(xmlHttp.responseText);
            }
            else {
                connectionFailed();
            }

        }
    })


}

function getEntries() {
    let url = new URL(getEntriesLink);
    let xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", url, true);
    xmlHttp.onerror = function (err) {
        connectionFailed();
    }
    xmlHttp.send(null);
    xmlHttp.onload = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            if(xmlHttp.getResponseHeader("Content-Type") === "application/json") {
                let responseObject = JSON.parse(xmlHttp.responseText);
                backupFound(responseObject);
            }
            else {
                noDataOnserver(xmlHttp.responseText);
            }

        }
        else {
            connectionFailed();
        }

    }
}

function postEntries() {
    getDataSet().then(function (result) {
        if(result === undefined) {
            alert("No entries found.");
            return false;
        }
        let body = result;
        let url = new URL(postEntriesLink);
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");
        xmlHttp.onerror = function (err) {
            connectionFailed();
        }
        xmlHttp.send(body);
        xmlHttp.onload = () => {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 201) {
                alert(xmlHttp.responseText);
                getDispatcher();
            }
            else {
                alert("Error when creating database!\nServer Error: " + xmlHttp.status + ", " + xmlHttp.responseText);
                getDispatcher();
            }

        }
        
    })
    

}

function urlBuilder(address, port) {
    return new URL('http://' + address + ':' + port);
}

/**
 * takes the value of a Link response header and extracts the URL
 * @param {string} linkValue value of the Link header
 * @returns {string}
 */
function extractURLFromResponse(linkValue) 
{
    return linkValue.match('<.*>').at(0).replace('<','').replace('>','');
}