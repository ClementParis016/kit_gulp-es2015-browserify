import { $ } from './utils';

const welcomeElement = document.createElement('p');
welcomeElement.textContent = 'Welcome 🙃';

$('body').appendChild(welcomeElement);
