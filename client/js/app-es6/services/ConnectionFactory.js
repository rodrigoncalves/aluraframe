// Module Pattern

var ConnectionFactory = (function() {
    const stores = ['negociacoes'];
    const version = 2;
    const dbname = 'aluraframe'

    var connection = null;
    var close = null;

    return class ConnectionFactory {

        constructor() {
            throw new Error("Cannot instantiate this class");
        }

        static getConnection() {
            return new Promise((resolve, reject) => {

                let openRequest = window.indexedDB.open(dbname, version);

                openRequest.onupgradeneeded = e => {
                    ConnectionFactory._createStores(e.target.result);
                };

                openRequest.onsuccess = e => {
                    if (!connection) {
                        connection = e.target.result;

                        // monkey patch
                        close = connection.close.bind(connection);
                        connection.close = function() {
                            throw new Error('Cannot close connection here');
                        }
                    }
                    resolve(connection);
                };

                openRequest.onerror = e => {
                    let error = e.target.error;
                    console.log(error)
                    reject(error.name);
                };

            });
        }

        static closeConnection() {
            if (connection) {
                close();
                connection = null;
            }
        }

        static _createStores(conn) {
            stores.forEach(store => {
                if (conn.objectStoreNames.contains(store)) {
                    conn.deleteObjectStore(store);
                }

                conn.createObjectStore(store, {autoIncrement: true});
            });
        }
    }

})();
