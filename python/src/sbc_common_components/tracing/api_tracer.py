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
"""Function to creating tracer instance."""
import opentracing
from jaeger_client import Config as JaegerConfig
from opentracing import Tracer


class ApiTracer:
    """Tracer that can trace certain API endpoints, services, db and exceptions."""

    def __init__(self, service_name: str = 'Authentication Services'):
        """Private constructor."""
        self._tracer: Tracer = self.init_tracer(service_name)

    @property
    def tracer(self):
        """Constuctor."""
        if not self._tracer:
            return opentracing.tracer
        return self._tracer

    @tracer.setter
    def tracer(self):
        """Setter."""
        self._tracer: Tracer = self.init_tracer('Authentication Services')

    @staticmethod
    def init_tracer(service_name: str):
        """Initialize tracer."""
        init_config = JaegerConfig(
            config={  # usually read from some yaml config
                'sampler': {'type': 'const', 'param': 1},
                'logging': True,
                'reporter_batch_size': 1,
                'trace_id_header': 'registries-trace-id',
            },
            service_name=service_name,
        )

        return init_config.initialize_tracer()

    @staticmethod
    def new_tracer(service_name: str):
        """Create a new tracer."""
        new_config = JaegerConfig(
            config={  # usually read from some yaml config
                'sampler': {'type': 'const', 'param': 1},
                'logging': True,
                'reporter_batch_size': 1,
                'trace_id_header': 'registries-trace-id',
            },
            service_name=service_name,
        )
        return new_config.new_tracer()
