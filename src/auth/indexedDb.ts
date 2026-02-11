export const initDB = async (name: string, storeName: string) => {
    const openDB = async () => new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(name, 1)

        request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName)
            }
        }

        request.onblocked = () => {
            console.warn("[IndexedDB] Open blocked — close other tabs")
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)

    })

    const db = await openDB()

    db.onversionchange = () => {
        console.warn("[IndexedDB] Version change — closing")
        db.close()
    }

    const get = async <T extends Record<string, unknown>>(key: string) => {
        const transaction = db.transaction(storeName, "readonly")
        const store = transaction.objectStore(storeName)

        const request = store.get(key) as IDBRequest<T>

        return new Promise<T>((resolve, reject) => {
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    const set = async <T extends Record<string, unknown>>(key: string, value: T) => {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)

        const request = store.put(value, key)

        return await new Promise<void>((resolve, reject) => {
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    }

    return { get, set }
}
