document.addEventListener('DOMContentLoaded', (event) => {
    const passwordField = document.getElementById('password');
    const togglePasswordButton = document.getElementById('toggle-password');
    const toggleIcon = document.getElementById('toggle-icon');

    togglePasswordButton.addEventListener('click', () => {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);

        if (type === 'text') {
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    });
});