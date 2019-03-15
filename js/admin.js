function login() {

    var email = $('#username').val();
    var password = $('#password').val();

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
    });

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = "dashboard.html"
        } else {
          // User is signed out.
          // ...
        }
      });

}