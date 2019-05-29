# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Class to extend FlaskTracing."""

from opentracing.propagation import Format
from flask_opentracing import FlaskTracing


class ApiTracing(FlaskTracing):
    """
    Enable tracing that can trace certain API endpoint.
    """

    def inject_tracing_header(self, response_header, tracer=None):
        """
        Function to inject the tracing header to http response .

        Arguments:
            response_header {json} -- http response

        Keyword Arguments:
            tracer {opentracing.tracer} -- specific a tracer if don't what to use global tracer
        """
        current_tracer = tracer or self.tracer
        current_span = current_tracer.active_span
        current_tracer.inject(current_span, Format.HTTP_HEADERS, response_header)

    def add_span_tag(self, tag_name: str, tag_context: str):
        """
        Function to add a span tag to current active span

        Arguments:
            tag_name {str} -- name of tag
            tag_context {str} -- content of tag
        """
        tracer = self.tracer
        scope = tracer.scope_manager.active()
        if scope is not None:
            scope.span.set_tag(tag_name, tag_context)
