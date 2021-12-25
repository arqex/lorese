"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function lorese(store) {
    let listeners = [];
    let changeBatched = false;
    function emitChange() {
        // Batch multiple changes in the same cycle
        if (changeBatched)
            return;
        changeBatched = true;
        setTimeout(() => {
            listeners.forEach(l => l());
            changeBatched = false;
        });
    }
    return {
        addChangeListener(clbk) {
            listeners.push(clbk);
        },
        removeChangeListener(clbk) {
            let i = listeners.length;
            while (i-- > 0) {
                if (clbk === listeners[i]) {
                    listeners.splice(i, 1);
                }
            }
        },
        emitStateChange: emitChange,
        loader: function (config) {
            const isValid = config.isValid || (() => true);
            const loadCache = new Map();
            function loadData(input, cached) {
                const key = JSON.stringify(input);
                let promise = config.load(input, store);
                loadCache.set(key, {
                    isLoading: true,
                    error: null,
                    promise: promise,
                    data: config.selector(store, input),
                    retry: tryLoad
                });
                promise
                    .then(() => {
                    loadCache.set(key, {
                        isLoading: false,
                        error: null,
                        promise: promise,
                        data: config.selector(store, input),
                        retry: tryLoad
                    });
                    emitChange();
                })
                    .catch(err => {
                    loadCache.set(key, {
                        isLoading: false,
                        error: err,
                        promise: promise,
                        data: undefined,
                        retry: tryLoad
                    });
                    emitChange();
                });
            }
            function tryLoad(input) {
                const key = JSON.stringify(input);
                let loaded = loadCache.get(key);
                const cached = config.selector(store, input);
                const isValidLoad = loaded && (loaded.error ||
                    loaded.isLoading ||
                    (loaded.data === cached && isValid(input)));
                // Try to reuse the cached object
                if (loaded && isValidLoad) {
                    return loaded;
                }
                // If the selector data has been updated, upate the cached data
                if (loaded && cached && isValid(input) && loaded.data !== cached) {
                    loaded = {
                        isLoading: false,
                        error: null,
                        data: cached,
                        retry: tryLoad,
                        promise: Promise.resolve(cached)
                    };
                    loadCache.set(key, loaded);
                    return loaded;
                }
                // The data is not loaded, load it
                loadData(input);
                loaded = loadCache.get(key);
                if (!loaded)
                    throw new Error('Load not cached');
                // return the loading data
                return loaded;
            }
            return tryLoad;
        },
        reducer: function (clbk) {
            return function (arg) {
                let updated = clbk(store, arg);
                store = updated;
                emitChange();
            };
        },
        selector: function (clbk) {
            return function (arg) {
                return clbk(store, arg);
            };
        }
    };
}
exports.default = lorese;
