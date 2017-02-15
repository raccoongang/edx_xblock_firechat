/* Javascript for FirechatXBlock. */
function FirechatXBlock(runtime, element, api_settings) {
    $(function ($) {
        if (api_settings.api_key && api_settings.auth_domain && api_settings.database_URL) {
            init();
        }

        function init() {
            // Initialize Firebase.
            var config = {
              apiKey: api_settings.api_key,
              authDomain: api_settings.auth_domain,
              databaseURL: api_settings.database_URL
            };

            var appFirebase;
            firebase.apps.forEach(function(item, i, arr) {
                if (item.name == api_settings.name_app_firebase) {
                    appFirebase = item;
                }
            });

            if (!appFirebase) {
                appFirebase = firebase.initializeApp(config, api_settings.name_app_firebase);
            }

            // Get a Firebase Database ref
            var chatRef = appFirebase.database().ref("chat");

            // Create a Firechat instance
            var firechatElement = $('.firechat-wrapper', element)[0];
            var chat = new FirechatUI(chatRef, firechatElement);

            appFirebase.auth().onAuthStateChanged(function(user) {
                // Once authenticated, instantiate Firechat with the logged in user
                if (user) {
                    chat.setUser(user.uid, user.displayName, function(user) {
                      chat.resumeSession();
                    });
                    $('.firechat-wrapper', element).removeClass('hidden');
                    $('.logout-firechat', element).removeClass('hidden');
                    $('.display-name', element).text(user.displayName);
                    $('.login-google', element).addClass('hidden');
                } else {
                    $('.login-google', element).removeClass('hidden');
                    $('.firechat-wrapper', element).addClass('hidden');
                    $('.logout-firechat', element).addClass('hidden');
                }
            });

            $('.login-google', element).on('click', login);
            $('.logout-firechat', element).on('click', logout);

            function login() {
                var provider = new firebase.auth.GoogleAuthProvider();
                appFirebase.auth().signInWithPopup(provider).catch(function(error) {
                  console.log("Error authenticating user:", error);
                });
            }

            function logout() {
                appFirebase.auth().signOut();
            }
        }
    });
}
