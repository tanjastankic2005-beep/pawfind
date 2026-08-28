const registerForm   = document.querySelector('#registerForm');
const registerButton = document.querySelector('#registerButton');
const formMessage    = document.querySelector('#formMessage');


function clearErrors() {
  document.querySelectorAll('.field-error').forEach(p => {
    p.textContent = '';
  });
  formMessage.innerHTML = '';
}

function showFieldError(field, message) {
  const p = document.querySelector(`#error-${field}`);
  if (p) p.textContent = message;
}


// =========================================
//  REGISTRACIJA
// =========================================
if (registerForm) {

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();

    const name      = document.querySelector('#name').value;
    const email     = document.querySelector('#email').value;
    const password  = document.querySelector('#password').value;
    const password2 = document.querySelector('#password2').value;

    let valid = true;

    if (name.trim().length < 2) {
      showFieldError('name', 'Please enter your name.');
      valid = false;
    }

    if (!email.includes('@')) {
      showFieldError('email', 'Please enter a valid email address.');
      valid = false;
    }

    if (password.length < 8) {
      showFieldError('password', 'Password must be at least 8 characters.');
      valid = false;
    }

    if (password !== password2) {
      showFieldError('password2', 'Passwords do not match.');
      valid = false;
    }

    if (!valid) return;

    registerButton.disabled = true;
    registerButton.textContent = 'Creating account…';

    try {
      const user = await registerUser({ name, email, password });

      registerForm.style.display = 'none';

      formMessage.innerHTML = `
        <div class="success-box">
          <h2>Welcome, ${user.name}! 🐾</h2>
          <p>Your account has been created.</p>
          <a href="login.html" class="btn btn-primary">Log in</a>
        </div>
      `;

    } catch (error) {
      console.error(error);

      if (error.status === 409) {
        showFieldError('email', 'An account with this email already exists.');

      } else if (error.data && error.data.errors) {
        formMessage.innerHTML = `
          <div class="error-box">
            <ul>${error.data.errors.map(e => `<li>${e}</li>`).join('')}</ul>
          </div>
        `;

      } else {
        formMessage.innerHTML = `
          <div class="error-box">
            <p>Something went wrong. Please try again.</p>
          </div>
        `;
      }

      registerButton.disabled = false;
      registerButton.textContent = 'Create account';
    }
  });

}


// =========================================
//  PRIJAVA
// =========================================
const loginForm   = document.querySelector('#loginForm');
const loginButton = document.querySelector('#loginButton');

if (loginForm) {

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();

    const email    = document.querySelector('#loginEmail').value;
    const password = document.querySelector('#loginPassword').value;

    let valid = true;

    if (!email.includes('@')) {
      showFieldError('loginEmail', 'Please enter a valid email address.');
      valid = false;
    }

    if (password.length === 0) {
      showFieldError('loginPassword', 'Please enter your password.');
      valid = false;
    }

    if (!valid) return;

    loginButton.disabled = true;
    loginButton.textContent = 'Logging in…';

    try {
      await loginUser({ email, password });
      window.location.href = 'index.html';

    } catch (error) {
      console.error(error);

      if (error.status === 401) {
        formMessage.innerHTML = `
          <div class="error-box">
            <p>Invalid email or password.</p>
          </div>
        `;
      } else {
        formMessage.innerHTML = `
          <div class="error-box">
            <p>Something went wrong. Please try again.</p>
          </div>
        `;
      }

      loginButton.disabled = false;
      loginButton.textContent = 'Log in';
    }
  });

}