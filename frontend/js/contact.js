const contactForm         = document.querySelector('#contactForm');
const contactSubmitButton = document.querySelector('#contactSubmitButton');
const contactFormMessage  = document.querySelector('#contactFormMessage');


function clearErrors() {
  document.querySelectorAll('.field-error').forEach(p => { p.textContent = ''; });
  contactFormMessage.innerHTML = '';
}

function showFieldError(field, message) {
  const p = document.querySelector(`#error-${field}`);
  if (p) p.textContent = message;
}

function validate(data) {
  let valid = true;

  if (data.name.trim().length < 2) {
    showFieldError('name', t('contact.nameError'));
    valid = false;
  }

  if (!data.email.includes('@')) {
    showFieldError('email', t('contact.emailError'));
    valid = false;
  }

  if (data.message.trim().length < 10) {
    showFieldError('message', t('contact.messageError'));
    valid = false;
  }

  return valid;
}

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearErrors();

  const data = {
    name:    document.querySelector('#contactName').value,
    email:   document.querySelector('#contactEmail').value,
    message: document.querySelector('#contactMessage').value
  };

  if (!validate(data)) return;

  contactSubmitButton.disabled = true;
  contactSubmitButton.textContent = t('contact.sendingButton');

  try {
    await sendContactMessage(data);

    contactForm.style.display = 'none';

    contactFormMessage.innerHTML = `
      <div class="success-box">
        <h2>${t('contact.sentTitle')}</h2>
        <p>${t('contact.sentText')}</p>
        <a href="index.html" class="btn btn-primary">${t('contact.backHome')}</a>
      </div>
    `;

  } catch (error) {
    console.error(error);

    if (error.data && error.data.errors) {
      contactFormMessage.innerHTML = `
        <div class="error-box">
          <p>${t('contact.fixFollowing')}</p>
          <ul>${error.data.errors.map(e => `<li>${e}</li>`).join('')}</ul>
        </div>
      `;
    } else {
      contactFormMessage.innerHTML = `
        <div class="error-box">
          <p>${t('contact.genericError')}</p>
        </div>
      `;
    }

    contactSubmitButton.disabled = false;
    contactSubmitButton.textContent = t('contact.sendButton');
  }
});
