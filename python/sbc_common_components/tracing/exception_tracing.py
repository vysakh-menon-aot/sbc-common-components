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


from sbc_common_components.tracing.trace_tags import TraceTags as tags


def exception_trace(ex, trace_back=None):
    """[summary]

        Arguments:
            e {[type]} -- [description]

        Keyword Arguments:
            trace_back {[type]} -- [description] (default: {None})
        """
    tracer = opentracing.tracer
    exception_name = ex.__class__.__name__
    error_message = ex.with_traceback(None)

    try:
        span_ctx = tracer.active_span
        scope = tracer.start_active_span(exception_name, child_of=span_ctx)
    except (opentracing.InvalidCarrierException, opentracing.SpanContextCorruptedException):
        scope = tracer.start_active_span(exception_name)

    span = scope.span
    span.set_tag(tags.ERROR, 'true')
    span.log_kv(
        {
            tags.EVENT: 'error',
            tags.ERROR_OBJECT: exception_name,
            tags.ERROR_MESSAGE: error_message,
            tags.ERROR_TRACE_BACK: trace_back,
        }
    )
    scope.close()
