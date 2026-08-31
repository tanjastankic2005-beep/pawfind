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
      showFieldError('name', t('auth.nameRequired'));
      valid = false;
    }

    if (!email.includes('@')) {
      showFieldError('email', t('auth.emailInvalid'));
      valid = false;
    }

    if (password.length < 8) {
      showFieldError('password', t('auth.passwordTooShort'));
      valid = false;
    }

    if (password !== password2) {
      showFieldError('password2', t('auth.passwordsMismatch'));
      valid = false;
    }

    if (!valid) return;

    registerButton.disabled = true;
    registerButton.textContent = t('auth.creatingAccount');

    try {
      const user = await registerUser({ name, email, password });

      registerForm.style.display = 'none';

      formMessage.innerHTML = `
        <div class="success-box">
          <h2>${t('auth.welcome', { name: user.name })}</h2>
          <p>${t('auth.accountCreated')}</p>
          <a href="login.html" class="btn btn-primary">${t('auth.loginButton')}</a>
        </div>
      `;

    } catch (error) {
      console.error(error);

      if (error.status === 409) {
        showFieldError('email', t('auth.emailTaken'));

      } else if (error.data && error.data.errors) {
        formMessage.innerHTML = `
          <div class="error-box">
            <ul>${error.data.errors.map(e => `<li>${e}</li>`).join('')}</ul>
          </div>
        `;

      } else {
        formMessage.innerHTML = `
          <div class="error-box">
            <p>${t('auth.genericError')}</p>
          </div>
        `;
      }

      registerButton.disabled = false;
      registerButton.textContent = t('auth.createAccountButton');
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
      showFieldError('loginEmail', t('auth.emailInvalid'));
      valid = false;
    }

    if (password.length === 0) {
      showFieldError('loginPassword', t('auth.enterPassword'));
      valid = false;
    }

    if (!valid) return;

    loginButton.disabled = true;
    loginButton.textContent = t('auth.loggingIn');

    try {
      await loginUser({ email, password });
      window.location.href = 'index.html';

    } catch (error) {
      console.error(error);

      if (error.status === 401) {
        formMessage.innerHTML = `
          <div class="error-box">
            <p>${t('auth.invalidCredentials')}</p>
          </div>
        `;
      } else {
        formMessage.innerHTML = `
          <div class="error-box">
            <p>${t('auth.genericError')}</p>
          </div>
        `;
      }

      loginButton.disabled = false;
      loginButton.textContent = t('auth.loginButton');
    }
  });

}
