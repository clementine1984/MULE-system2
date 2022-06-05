import {Login} from '@osjs/client';

export default class MyCustomLogin extends Login {
  render() {
    // Set a custom class name
    this.$container.className = 'my-custom-login';

    // Add your HTML content
    this.$container.innerHTML = '<H1>Welcome to MULE</H1><br><H2>Use Moodle/Blackboard/etc to login</H2>';

    // Bind the events
    this.on('login:start', () => console.log('Currently trying to log in...'));
    this.on('login:stop', () => console.log('Login was aborted or stopped'));
    this.on('login:error', err => {
	    console.error('An error occured while logging in', err);
	    this.$container.innerHTML = '<H1>Welcome to MULE</H1><br><H2>Use Moodle/Blackboard/etc to login</H2>';})
    

    // To submit a login form (ex when you press a button):
    
    this.emit('login:post', { username: '', password: ''});
    
  }
}