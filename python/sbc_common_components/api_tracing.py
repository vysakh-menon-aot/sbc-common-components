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
"""Function to tracing all methods, functions or exceptions."""
import functools
import inspect
import opentracing

from opentracing.propagation import Format

from flask_opentracing import FlaskTracing
from sbc_common_components.trace_tags import TraceTags as tags


class ApiTracing(FlaskTracing):
    """
    Tracer that can trace certain exceptions.

    @param tracer the OpenTracing tracer implementation to trace exceptions with
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

    def exception_trace(self, e, trace_back=None):
        """[summary]

        Arguments:
            e {[type]} -- [description]

        Keyword Arguments:
            trace_back {[type]} -- [description] (default: {None})
        """
        tracer = self.tracer
        exception_name = e.__class__.__name__
        error_message = e.with_traceback(None)

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

    @staticmethod
    def enable_tracing(function):
        """Make a function/method run the class' tracing function/method before running."""

        @functools.wraps(function)
        def wrapper(*func_args, **func_kwargs):
            # TODO should use self.tracer
            tracer = opentracing.tracer

            try:
                span_ctx = tracer.active_span
                scope = tracer.start_active_span(function.__name__, child_of=span_ctx)
            except (opentracing.InvalidCarrierException, opentracing.SpanContextCorruptedException):
                scope = tracer.start_active_span(function.__name__)

            span = scope.span
            span.set_tag(tags.COMPONENT, 'Service')

            span.log_kv(
                {
                    tags.CLASS_NAME: function.__class__.__name__,
                    tags.FUNCTION_NAME: function.__name__,
                    tags.FUNCTION_PARAMETERS: '(' + ', '.join('%s' % p for p in func_args) + ' )',
                }
            )
            scope.close()

            retval = function(*func_args, **func_kwargs)

            span_ctx = tracer.active_span
            scope = tracer.start_active_span('{0}.{1}'.format(function.__name__, 'response'), child_of=span_ctx)
            span = scope.span
            span.log_kv({tags.FUNCTION_RESPONSE: retval.__dict__})
            scope.close()
            return retval

        return wrapper

    @staticmethod
    def without_tracing(function):
        """Tag a method so that it shouldn't be decorated to call self.load."""
        function.without_tracing = True
        return function

    @staticmethod
    def should_be_tracing(function):
        try:
            return not bool(function.without_tracing)
        except AttributeError:
            return True

    @staticmethod
    def service_trace(decorator, predicate=True):
        """Apply a decorator to all methods that satisfy a predicate, if given."""

        def wrapper(cls):
            for name, method in inspect.getmembers(cls, inspect.ismethod or inspect.isfunction):
                if predicate(method):
                    setattr(cls, name, decorator(method))

            return cls

        return wrapper
