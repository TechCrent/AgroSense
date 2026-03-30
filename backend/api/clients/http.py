from __future__ import annotations

from dataclasses import dataclass


class UpstreamServiceError(RuntimeError):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


@dataclass
class RetryPolicy:
    attempts: int = 2
