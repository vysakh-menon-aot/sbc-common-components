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
"""Function to tracing all services."""
import functools
import inspect
import opentracing

from sbc_common_components.tracing.trace_tags import TraceTags as tags


class ServiceTracing:
    """
    Tracer that can trace certain services.

    """

    @staticmethod
    def _get_class_name_that_defined_method(meth):
        """Get function/method name from class that use as the tracing span name."""
        if inspect.ismethod(meth):
            for cls in inspect.getmro(meth.__self__.__class__):
                if cls.__dict__.get(meth.__name__) is meth:
                    return cls.__qualname__
            meth = meth.__func__  # fallback to __qualname__ parsing
        if inspect.isfunction(meth):
            cls = getattr(inspect.getmodule(meth), meth.__qualname__.split('.<locals>', 1)[0].rsplit('.', 1)[0])
            if isinstance(cls, type):
                return cls.__qualname__
        return None

    @staticmethod
    def enable_tracing(function):
        """Make a function/method run the class' tracing function/method before running."""

        @functools.wraps(function)
        def wrapper(*func_args, **func_kwargs):
            tracer = opentracing.tracer

            scope = tracer.start_active_span(function.__name__)
            span = scope.span
            span.set_tag(tags.COMPONENT, 'Service')
            span.log_kv(
                {
                    tags.CLASS_NAME: ServiceTracing._get_class_name_that_defined_method(function),
                    tags.FUNCTION_NAME: function.__name__,
                    tags.FUNCTION_ARGS: ', '.join('%s' % p for p in func_args),
                    tags.FUNCTION_KWARGS: ', '.join(['{}={!r}'.format(k, v) for k, v in func_kwargs.items()]),
                }
            )
            scope.close()

            retval = function(*func_args, **func_kwargs)

            if retval is not None:
                scope = tracer.start_active_span('{0}.{1}'.format(function.__name__, 'response'))
                span = scope.span
                span.log_kv({tags.FUNCTION_RESPONSE: retval.__dict__})
                scope.close()
            return retval

        return wrapper

    @staticmethod
    def disable_tracing(function):
        """Tag a function/method so that it shouldn't be decorated to call tracing."""
        function.without_tracing = True
        return function

    @staticmethod
    def should_be_tracing(function):
        """Tag a function/method so that it should be decorated to call tracing."""
        try:
            return not bool(function.disable_tracing)
        except AttributeError:
            return True

    @staticmethod
    def trace(decorator, predicate: bool = True):
        """Apply a decorator to all methods that satisfy a predicate, if given."""

        def wrapper(cls):
            for name, method in inspect.getmembers(cls, inspect.ismethod or inspect.isfunction):
                if predicate(method):
                    setattr(cls, name, decorator(method))

            return cls

        return wrapper
