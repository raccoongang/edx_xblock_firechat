/* Javascript for FirechatXBlock. */
function FirechatXBlock(runtime, element, api_settings) {
    $(function ($) {
        if (api_settings.api_key && api_settings.auth_domain && api_settings.database_URL && api_settings.auth_providers) {
            init();
        }

        function init() {
            // Initialize Firebase.
            var authProviders = {
                google: firebase.auth.GoogleAuthProvider,
                facebook: firebase.auth.FacebookAuthProvider,
                twitter: firebase.auth.TwitterAuthProvider,
                github: firebase.auth.GithubAuthProvider
            };

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
            var chatRef = appFirebase.database().ref("chat_" + api_settings.name_app_firebase);

            // Create a Firechat instance
            var firechatElement = $('.firechat-wrapper', element)[0];
            var chat = new FirechatUI(chatRef, firechatElement);

            appFirebase.auth().onAuthStateChanged(function(user) {
                // Once authenticated, instantiate Firechat with the logged in user
                if (user) {
                    if (user.isAnonymous) {
                        var displayName = "Anonymous_" + user.uid.substr(10, 8);
                    } else {
                        var displayName = user.displayName;
                    }
                    chat.setUser(user.uid, displayName, function(user) {
                      chat.resumeSession();
                    });
                    $('.firechat-wrapper', element).removeClass('hidden');
                    $('.logout-firechat', element).removeClass('hidden');
                    $('.display-name', element).text(displayName);
                    $('.login-block', element).addClass('hidden');
                } else {
                    $('.login-block', element).removeClass('hidden');
                    $('.firechat-wrapper', element).addClass('hidden');
                    $('.logout-firechat', element).addClass('hidden');
                }
            });

            var $loginButtons = $('.login-buttons');

            api_settings.auth_providers.forEach(function(provider) {

                var title = provider.charAt(0).toUpperCase() + provider.slice(1);

                if (provider == 'anonymous') {
                    var btn = ' <button class="login-' + provider + '" data-provider="' + provider + '">Login as ' + title + '</button> '
                } else {
                    var btn = ' <button class="login-' + provider + '" data-provider="' + provider + '">Login with "' + title + '"</button> '
                }

                $loginButtons.append(btn);

                $('.login-' + provider, element).on('click', login);
            });

            $('.logout-firechat button', element).on('click', logout);

            function login(e) {
                if (e.target.dataset.provider == 'anonymous') {
                    appFirebase.auth().signInAnonymously().catch(function(error) {
                        console.log("Error authenticating user:", error);
                    });
                } else {
                    var provider = new authProviders[e.target.dataset.provider]();
                    appFirebase.auth().signInWithPopup(provider).catch(function(error) {
                        console.log("Error authenticating user:", error);
                    });
                }
            }

            function logout() {
                appFirebase.auth().signOut();
            }
        }
    });
}
