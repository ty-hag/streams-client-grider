import React from 'react';
import { connect } from 'react-redux';
import { signIn, signOut } from '../actions';

require('dotenv').config();

class GoogleAuth extends React.Component {

  /*
    Basic flow when component first loads is:
    1. Create the gAPI object (asynchronously)
    2. Use the gAPI object to create an auth object - this.auth = window.gapi.auth2.getAuthInstance();
    3. Determine whether or not the user is signed in and updated state accordingly - this.onAuthChange(this.auth.isSignedIn.get());
    4. Set listener for auth status change and pass function to call on a change - this.auth.isSignedIn.listen(this.onAuthChange);
  */
  componentDidMount() {

    console.log(process.env);
    window.gapi.load('client:auth2', () => {
      window.gapi.client.init({ // this returns a promise
        clientId: process.env.REACT_APP_GAPI_CLIENT_ID,
        scope: 'email'
      }).then(() => {
        this.auth = window.gapi.auth2.getAuthInstance();
        this.onAuthChange(this.auth.isSignedIn.get());
        this.auth.isSignedIn.listen(this.onAuthChange); // This listener is how we update state on login status change, we call the arg function on trigger
      })
    });
  }

  onAuthChange = (isSignedIn) => { // the callback function passed to auth.isSignedIn.listen is automatically passed argument of true when user is signed in, false when not, so that's what we're referencing here
    if (isSignedIn) {
      this.props.signIn(this.auth.currentUser.get().getId());
    } else {
      this.props.signOut();
    }
  };

  onSignInClick = () => {
    this.auth.signIn(); // this is calling the function on the gapi auth object, which then results in a change in auth state, triggering listener and calling onAuthChange
  }
  onSignOutClick = () => {
    this.auth.signOut(); 
  }

  renderAuthButton() {
    if (this.props.isSignedIn === null) {
      return null;
    } else if (this.props.isSignedIn) {
      return (
        <button onClick={this.onSignOutClick} className="ui red google button">
          <i className="google icon" />
          Sign Out
        </button>
      )
    } else {
      return (
        <button onClick={this.onSignInClick} className="ui red google button">
          <i className="google icon" />
          Sign in with Google
        </button>
      )
    }
  }

  render() {
    return <div>{this.renderAuthButton()}</div>
  }
}

const mapStateToProps = (state) => {
  return {
    isSignedIn: state.auth.isSignedIn
  }
};

export default connect(mapStateToProps, { signIn, signOut })(GoogleAuth);