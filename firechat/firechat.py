import pkg_resources

from xblock.core import XBlock
from xblock.fields import Scope, String, Boolean
from xblock.fragment import Fragment
from xblockutils.studio_editable import StudioEditableXBlockMixin

# Make '_' a no-op so we can scrape strings
_ = lambda text: text


class FirechatXBlock(StudioEditableXBlockMixin, XBlock):
    display_name = String(
        display_name=_("Display Name"),
        help=_("Display name for this module"),
        default="Firechat",
        scope=Scope.settings,
    )
    api_key = String(
        display_name=_("API KEY"),
        scope=Scope.settings,
    )

    auth_domain = String(
        display_name=_("AUTH DOMAIN"),
        scope=Scope.settings,
    )

    database_URL = String(
        display_name=_("database URL"),
        scope=Scope.settings,
    )

    auth_provider_google = Boolean(
        default=False,
        scope=Scope.settings,
        display_name=_('Enable "Google" authorization'),
        resettable_editor=False
    )

    auth_provider_facebook = Boolean(
        default=False,
        scope=Scope.settings,
        display_name=_('Enable "Facebook" authorization'),
        resettable_editor=False
    )

    auth_provider_twitter = Boolean(
        default=False,
        scope=Scope.settings,
        display_name=_('Enable "Twitter" authorization'),
        resettable_editor=False
    )

    auth_provider_github = Boolean(
        default=False,
        scope=Scope.settings,
        display_name=_('Enable "GitHub" authorization'),
        resettable_editor=False
    )

    auth_provider_anonymous = Boolean(
        default=False,
        scope=Scope.settings,
        display_name=_('Enable "Anonymous" authorization'),
        resettable_editor=False
    )

    editable_fields = (
        'display_name',
        'api_key',
        'auth_domain',
        'database_URL',
        'auth_provider_google',
        'auth_provider_facebook',
        'auth_provider_twitter',
        'auth_provider_github',
        'auth_provider_anonymous'
    )
    has_author_view = True

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def _get_auth_providers(self):
        _filter = lambda f: f.startswith('auth_provider_') and getattr(self, f)
        return map(lambda p: p[14:], filter(_filter, self.editable_fields))

    def student_view(self, context=None):
        html = self.resource_string("static/html/firechat.html")
        frag = Fragment(html.format(self=self))
        frag.add_css(self.resource_string("static/css/firechat.css"))
        frag.add_css_url("https://cdn.firebase.com/libs/firechat/3.0.1/firechat.min.css")
        frag.add_javascript(self.resource_string("static/js/src/firechat.js"))
        frag.add_javascript_url('https://www.gstatic.com/firebasejs/3.3.0/firebase.js')
        frag.add_javascript_url('https://cdn.firebase.com/libs/firechat/3.0.1/firechat.min.js')
        api_settings = {
            'api_key': self.api_key,
            'auth_domain': self.auth_domain,
            'database_URL': self.database_URL,
            'name_app_firebase': 'firebase_{}'.format(self.location.block_id),
            'auth_providers': list(self._get_auth_providers())
        }
        frag.initialize_js('FirechatXBlock', json_args=api_settings)
        return frag

    def author_view(self, context):
        html = self.resource_string("static/html/author_view.html")
        frag = Fragment(html.format(self=self))
        return frag

    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("FirechatXBlock",
             """<firechat/>
             """),
            ("Multiple FirechatXBlock",
             """<vertical_demo>
                <firechat/>
                <firechat/>
                <firechat/>
                </vertical_demo>
             """),
        ]
