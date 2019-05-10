import functools
import inspect
import opentracing

from sbc_common_components.trace_tags import TraceTags as tags


def enable_tracing(function):
    """Make a function/method run the class' tracing function/method before running."""

    @functools.wraps(function)
    def wrapper(*func_args, **func_kwargs):
        # using a global tracer
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
        # TODO need to make this span as current active span in the tracer
        scope.close()
        return function(*func_args, **func_kwargs)

    return wrapper


def without_tracing(function):
    """Tag a method so that it shouldn't be decorated to call self.load."""
    function.without_tracing = True
    return function


def should_be_tracing(function):
    try:
        return not bool(function.without_tracing)
    except AttributeError:
        return True


def service_trace(decorator, predicate=True):
    """Apply a decorator to all methods that satisfy a predicate, if given."""

    def wrapper(cls):
        for name, method in inspect.getmembers(cls, inspect.ismethod or inspect.isfunction):
            if predicate(method):
                setattr(cls, name, decorator(method))

        return cls

    return wrapper
