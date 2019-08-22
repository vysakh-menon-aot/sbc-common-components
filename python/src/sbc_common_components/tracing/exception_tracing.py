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
"""Function to tracing all exceptions."""
import opentracing

from sbc_common_components.tracing.trace_tags import TraceTags


class ExceptionTracing:  # pylint: disable=too-few-public-methods
    """Tracer that can trace certain exceptions."""

    @staticmethod
    def trace(exception, trace_back=None):
        """Rrace exception details.

        Arguments:
            e {Exception} -- Exception class

        Keyword Arguments:
            trace_back {str} -- Exception trace back details
        """
        tracer = opentracing.tracer
        exception_name = exception.__class__.__name__
        error_message = exception.with_traceback(None)

        with (tracer.start_active_span(exception_name)) as scope:
            span = scope.span
            span.set_tag(TraceTags.ERROR, 'true')
            span.log_kv(
                {
                    TraceTags.EVENT: 'error',
                    TraceTags.ERROR_OBJECT: exception_name,
                    TraceTags.ERROR_MESSAGE: error_message,
                    TraceTags.ERROR_TRACE_BACK: trace_back,
                }
            )
