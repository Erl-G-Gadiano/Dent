const bcrypt = require('bcryptjs');
const hash = '$2a$10$wYf9Kz6ImjP8PplxWgD0s.8Yq3kldQ7mL3Vq0mY6I0QY0r8tJt7aK';
bcrypt.compare('Admin123!', hash).then(valid => console.log('match=', valid)).catch(console.error);