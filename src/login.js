const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HR_db', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', { keyPath: 'username' });
        store.createIndex('username', 'username', { unique: true });
      }

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

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const populateDatabase = async () => {
  const db = await openDatabase();
  const transaction = db.transaction('users', 'readwrite');
  const store = transaction.objectStore('users');

  // Dummy user data
  const users = [
    { username: 'c', password: 'c', designation: 'company' },
    { username: 'a', password: 'a', designation: 'hr' }
  ];

  users.forEach(user => store.put(user));

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// Initialize the database and populate it with dummy data
populateDatabase();

const createLoginForm = () => {
  // Create elements
  const container = document.createElement('div');
  const form = document.createElement('form');
  const usernameInput = document.createElement('input');
  const passwordInput = document.createElement('input');
  const submitButton = document.createElement('button');

  // Set attributes and classes
  container.className = 'flex items-center justify-center min-h-screen bg-gray-100';
  form.className = 'bg-white p-6 rounded shadow-md w-full max-w-sm';
  usernameInput.type = 'text';
  usernameInput.placeholder = 'Username';
  usernameInput.className = 'border border-gray-300 p-2 w-full mb-4 rounded';
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Password';
  passwordInput.className = 'border border-gray-300 p-2 w-full mb-4 rounded';
  submitButton.type = 'submit';
  submitButton.textContent = 'Login';
  submitButton.className = 'bg-blue-500 text-white p-2 rounded w-full';

  form.append(usernameInput, passwordInput, submitButton);
  container.appendChild(form);
  document.body.appendChild(container);

  // Handle form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (await validateUser(username, password)) {
      window.location.href = 'hr.html'; // Redirect to hr.html
    } else {
      alert('Invalid username or password');
    }
  });
};

const validateUser = async (username, password) => {
  return new Promise((resolve) => {
    const request = indexedDB.open('HR_db', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('users');
      const store = transaction.objectStore('users');
      const userRequest = store.get(username);

      userRequest.onsuccess = () => {
        const user = userRequest.result;
        resolve(user && user.password === password);
      };

      userRequest.onerror = () => resolve(false);
    };
  });
};

// Initialize the login form
createLoginForm();
