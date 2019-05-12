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
    Tracer that can trace certain API endpoint.

    @param tracer the OpenTracing tracer implementation to trace apis with
    """

    def inject_tracing_header(self, response_header, tracer=None):
        """
        Function to inject the tracing header to http response .

        Arguments:
            response_header {json} -- http response

        Keyword Arguments:
            tracer {opentracing.tracer} -- tracing tracer
        """
        current_tracer = tracer or self.tracer
        current_span = current_tracer.active_span
        current_tracer.inject(current_span, Format.HTTP_HEADERS, response_header)
