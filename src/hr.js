// Initialize IndexedDB
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('HR_db', 1);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('items')) {
                db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('data')) {
                db.createObjectStore('data', { keyPath: 'id', autoIncrement: true });
            }

            if (!db.objectStoreNames.contains('Department')) {
                db.createObjectStore('Department', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('Role')) {
                db.createObjectStore('Role', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('Registration')) {
                db.createObjectStore('Registration', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e);
    });
};

// Create the top navbar and view container
const createNavbars = () => {
    const app = document.getElementById('app');

    const topNavbar = `
        <div class="bg-blue-500 text-white p-4 flex items-center justify-between">
            <span id="hamburger" class="text-white mr-4 font-bold tracking-widest">
                NetSol
            </span>
            <button id='logout' class="text-lg font-semibold">Logout</button>
        </div>
    `;

    const viewContainer = `
        <div id="view-container" class="p-2 px-10 border-2 border-red-500 h-[90vh] overflow-auto">
            <!-- Dummy views will be injected here -->
        </div>
    `;

    app.innerHTML = topNavbar + viewContainer;
};

// Create card content with CRUD functionality
const createView = async (viewId) => {
    const viewContainer = document.getElementById('view-container');
    const db = await initDB();

    const cards_content = [
        { content: 'Total Employees', val: 55 },
        { content: 'Total Present', val: 50 },
        { content: "Leave", val: 5 },
        { content: "Total Salaries", val: 300000 },
        { content: "Paid Salaries", val: 200000 },
        { content: "Avg Salary", val: 35000 },
    ];

    const list_of_company_cruds = ['Department', 'Role', 'Registration']

    const list_of_btn_ids = ['dpt', 'Role', 'reg', 'del']


    const renderCard = async (dpt, storeName) => {
        const storeList = await render_store_list(storeName);
        return `
            <div class=" bg-white shadow rounded overflow-y-auto h-64 w-[100%]  px-4 flex flex-col justify-start">
                <div class=" flex justify-between fixed h-20  bg-gray-200  flex-col  w-[27%] p-2 px-4 rounded-md">
                    <h3 class="text-lg font-semibold">${dpt}</h3>
                <button class="bg-blue-500 text-white rounded create-button" data-store="${storeName}">New ${dpt} &nbsp <b> + </b> </button>
                </div>
                <div class=" mt-24">${storeList}</div>
            </div>
        `;
    };

    // Function to render the store list as an ordered list
    const render_store_list = async (storeName) => {
        const db = await initDB();
        const transaction = db.transaction(storeName);
        const store = transaction.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.getAll(); // Get all records from the object store

            request.onsuccess = () => {
                const records = request.result;
                if (records.length === 0) {
                    resolve('<p>No records found.</p>');
                } else {
                    const listItems = records.map(record =>
                        `<li class="flex justify-between items-center p-2 border-b">
                            <span>${storeName === 'Registration' ? record.name : record.value}</span>
                            <div>
                                <button class="edit-button bg-blue-500 text-white p-2 rounded" data-store="${storeName}" data-id="${record.id}">Edit</button>
                                <button class="delete-button bg-red-500 text-white p-2 rounded ml-2" data-store="${storeName}" data-id="${record.id}">Delete</button>
                            </div>
                        </li>`
                    ).join('');
                    resolve(`<ol class="list-none p-0">${listItems}</ol>`);
                }
            };

            request.onerror = (e) => reject(e);
        });
    };



    // Edit Item
    const editItem = async (storeName, id) => {
        const db = await initDB();
        const transaction = db.transaction(storeName);
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => {
            const record = request.result;
            const newValue = prompt('Enter new value:', record.value);
            if (newValue !== null) {
                store.put({ ...record, value: newValue });
                alert(`${storeName} item updated`);
                createView(storeName); // Refresh the view
            }
        };
        request.onerror = () => alert('Failed to retrieve item');
    };

    // Delete Item
    const deleteItem = async (storeName, id) => {
        const db = await initDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.delete(id);
        alert(`${storeName} item deleted`);
        createView(storeName); // Refresh the view
    };

    // Attach event listeners for Edit and Delete buttons
    const attachEventListeners = () => {
        document.querySelectorAll('.edit-button').forEach(button =>
            button.addEventListener('click', () => editItem(button.getAttribute('data-store'), Number(button.getAttribute('data-id'))))
        );
        document.querySelectorAll('.delete-button').forEach(button =>
            button.addEventListener('click', () => deleteItem(button.getAttribute('data-store'), Number(button.getAttribute('data-id'))))
        );
    };


    const cardsHtml = await Promise.all(
        list_of_company_cruds.map(crud => renderCard(crud, crud))
    ).then(results => results.join(''));

    const content = `
        <div class="p-4 h-full bg-white shadow rounded border-green-400 border-2">
            <div class="grid grid-cols-3 gap-4 mb-4">
                ${cards_content.map(item => `
                    <div class="bg-gray-200 p-4 rounded shadow">
                        <h3 class="text-lg font-semibold">${item.val}</h3>
                        <p>${item.content}</p>
                    </div>
                `).join('')}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 ">
                ${cardsHtml}
            </div>
        </div>
    `;

    viewContainer.innerHTML = content;

    // Event listeners for CRUD operations
    const createButtons = document.querySelectorAll('.create-button');
    // const readButtons = document.querySelectorAll('.read-button');
    // const updateButtons = document.querySelectorAll('.update-button');
    // const deleteButtons = document.querySelectorAll('.delete-button');

    createButtons.forEach(button => button.addEventListener('click', () => createItem(button.getAttribute('data-store'))));
    // readButtons.forEach(button => button.addEventListener('click', () => readItem(button.getAttribute('data-store'))));
    // updateButtons.forEach(button => button.addEventListener('click', () => updateItem(button.getAttribute('data-store'))));
    // deleteButtons.forEach(button => button.addEventListener('click', () => deleteItem(button.getAttribute('data-store'))));

    attachEventListeners();

};



// CRUD Functions
// const createItem = async (storeName) => {
//     console.log("Looking for storeName -> ", storeName)
//     const db = await initDB();
//     const transaction = db.transaction(storeName, 'readwrite');
//     const store = transaction.objectStore(storeName);
//     const id = Date.now(); // Use a unique ID or other method
//     const item = { id, value: `${storeName} Item` };
//     store.put(item);
//     alert(`${storeName} item created`);
// };
const createItem = async (storeName) => {
    // Open the form for input
    openForm(storeName);
};




const openForm = async (storeName) => {
    let formHtml = '';

    if (storeName === 'Registration') {
        const roles = await getOptionsFromStore('Role');
        const departments = await getOptionsFromStore('Department');

        console.log("roles --> " , roles)
        console.log("departments --> " , departments)

        formHtml = `
            <div id="form-container" class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 overflow-auto">
                <div class="bg-white p-6 rounded shadow-lg max-h-[90vh] overflow-y-auto">
                    <h2 class="text-xl mb-4">Create New ${storeName}</h2>
                    <form id="create-item-form">
                        <label class="block mb-2">Employee ID:</label>
                        <input type="text" name="employeeId" class="border p-2 w-full mb-4" required />
                        
                        <label class="block mb-2">Name:</label>
                        <input type="text" name="name" class="border p-2 w-full mb-4" required />
                        
                        <label class="block mb-2">Date of Birth:</label>
                        <input type="date" name="dob" class="border p-2 w-full mb-4" required />
                        
                        <label class="block mb-2">Gender:</label>
                        <select name="gender" class="border p-2 w-full mb-4" required>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        
                        <label class="block mb-2">Email:</label>
                        <input type="email" name="email" class="border p-2 w-full mb-4" required />
                        
                        <label class="block mb-2">Phone:</label>
                        <input type="tel" name="phone" class="border p-2 w-full mb-4" required />
                        
                        <label class="block mb-2">Address:</label>
                        <input type="text" name="address" class="border p-2 w-full mb-4" required />
                        
                        <label class="block mb-2">Position/Title:</label>
                        <input type="text" name="position" class="border p-2 w-full mb-4" required />
                        
                        <label class="block mb-2">Date of Joining:</label>
                        <input type="date" name="dateOfJoining" class="border p-2 w-full mb-4" required />
                        
                        <label class="block mb-2">Salary Details:</label>
                        <input type="text" name="salary" class="border p-2 w-full mb-4" required />
                        
                        <label class="block mb-2">Emergency Contact Information:</label>
                        <input type="text" name="emergencyContact" class="border p-2 w-full mb-4" required />
                        
                        <label class="block mb-2">Profile Picture:</label>
                        <input type="file" name="profilePicture" class="border p-2 w-full mb-4" />
                        
                        <label class="block mb-2">Role:</label>
                        <select name="role" class="border p-2 w-full mb-4" required>
                            ${roles.map(role => `<option value="${role.id}">${role.value}</option>`).join('')}
                        </select>
                        
                        <label class="block mb-2">Department:</label>
                        <select name="department" class="border p-2 w-full mb-4" required>
                            ${departments.map(department => `<option value="${department.id}">${department.value}</option>`).join('')}
                        </select>
                        
                        <button type="submit" class="bg-green-500 text-white p-2 rounded">Save</button>
                        <button type="button" class="bg-red-500 text-white p-2 rounded ml-2" onclick="closeForm()">Cancel</button>
                    </form>
                </div>
            </div>
        `;
    } else {
        formHtml = `
            <div id="form-container" class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                <div class="bg-white p-6 rounded shadow-lg">
                    <h2 class="text-xl mb-4">Create New ${storeName}</h2>
                    <form id="create-item-form">
                        <label class="block mb-2">ID:</label>
                        <input type="text" name="id" class="border p-2 w-full mb-4" required />
                        <label class="block mb-2">New ${storeName}:</label>
                        <input type="text" name="value" class="border p-2 w-full mb-4" required />
                        <button type="submit" class="bg-green-500 text-white p-2 rounded">Save</button>
                        <button type="button" class="bg-red-500 text-white p-2 rounded ml-2" onclick="closeForm()">Cancel</button>
                    </form>
                </div>
            </div>
        `;
    }

    document.body.insertAdjacentHTML('beforeend', formHtml);

    document.getElementById('create-item-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        let data = {};

        if (storeName === 'Registration') {
            data = {
                employeeId: formData.get('employeeId'),
                name: formData.get('name'),
                dob: formData.get('dob'),
                gender: formData.get('gender'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                position: formData.get('position'),
                dateOfJoining: formData.get('dateOfJoining'),
                salary: formData.get('salary'),
                emergencyContact: formData.get('emergencyContact'),
                profilePicture: formData.get('profilePicture') ? formData.get('profilePicture').name : '',
                role: formData.get('role'),
                department: formData.get('department')
            };
        } else {
            data = { id: formData.get('id'), value: formData.get('value') };
        }

        await saveItemToDB(storeName, data);
        closeForm();
    });
};

// Helper function to get options from IndexedDB
const getOptionsFromStore = async (storeName) => {
    const db = await initDB();
    const transaction = db.transaction(storeName);
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = (e) => reject(e);
    });
};






const saveItemToDB = async (storeName, value) => {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    // const id = Date.now(); // Use a unique ID or other method
    console.log("storeName -> ", storeName)
    console.log("value -> ", value)

    // const item = {  value };
    // console.log("item -> ", item)
    store.put(value);


    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (e) => reject(e);
        createView(storeName);
    });
};





const closeForm = () => {
    const formContainer = document.getElementById('form-container');
    if (formContainer) {
        formContainer.remove();
    }
};




const readItem = async (storeName) => {
    const db = await initDB();
    const transaction = db.transaction(storeName);
    const store = transaction.objectStore(storeName);
    const id = prompt('Enter ID to read');
    const request = store.get(Number(id));
    request.onsuccess = () => alert(`${storeName} item data: ${JSON.stringify(request.result)}`);
    request.onerror = () => alert('Failed to retrieve item');
};

const updateItem = async (storeName) => {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const id = prompt('Enter ID to update');
    const item = { id: Number(id), value: `${storeName} Updated Item` };
    store.put(item);
    alert(`${storeName} item updated`);
};

const deleteItem = async (storeName) => {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const id = prompt('Enter ID to delete');
    store.delete(Number(id));
    alert(`${storeName} item deleted`);
};


// Open form
// const openForm = (formNumber) => {
//     const formHtml = `
//         <div id="form${formNumber}" class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50">
//             <div class="bg-white p-6 rounded shadow-lg">
//                 <h2 class="text-xl mb-4">Form ${formNumber}</h2>
//                 <form id="form${formNumber}-form">
//                     <label class="block mb-2">Data:</label>
//                     <input type="text" name="data" class="border p-2 w-full mb-4" required />
//                     <button type="submit" class="bg-green-500 text-white p-2 rounded">Save</button>
//                     <button type="button" class="bg-red-500 text-white p-2 rounded ml-2" onclick="closeForm(${formNumber})">Close</button>
//                 </form>
//             </div>
//         </div>
//     `;

//     document.body.insertAdjacentHTML('beforeend', formHtml);

//     document.getElementById(`form${formNumber}-form`).addEventListener('submit', async (event) => {
//         event.preventDefault();
//         const data = new FormData(event.target).get('data');
//         await saveDataToDB(data);
//         closeForm(formNumber);
//     });
// };

// Close form
// const closeForm = (formNumber) => {
//     document.getElementById(`form${formNumber}`).remove();
// };

// Save data to IndexedDB
const saveDataToDB = async (data) => {
    const db = await initDB();
    const transaction = db.transaction('data', 'readwrite');
    const store = transaction.objectStore('data');
    store.add({ data });

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (e) => reject(e);
    });
};

// Logout
function logout() {
    const logoutButton = document.getElementById('logout');
    logoutButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// Main function to run the app
const main = async () => {
    await initDB();
    createNavbars();

    // Add event listeners for main options (assuming you still want them)
    document.querySelectorAll('.option').forEach(option =>
        option.addEventListener('click', (e) => {
            const target = e.target;
            createView(target.getAttribute('data-view'));
        })
    );

    // Add event listeners for submenu options
    document.querySelectorAll('.submenu-option').forEach(option =>
        option.addEventListener('click', (e) => createView(e.target.getAttribute('data-view')))
    );

    // Logout
    logout();

    // Initialize with the default view
    createView('view1');
};

// Run the main function
main();
