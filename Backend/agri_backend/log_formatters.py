"""Console formatters: keep terminal output readable (short tracebacks, capped messages)."""

from __future__ import annotations

import logging
import traceback
from typing import Any


class TruncatingConsoleFormatter(logging.Formatter):
    """
    Like the default Formatter, but limits exception text length so the terminal
    is not flooded when something logs with exc_info=True.
    """

    max_traceback_chars = 4000

    def formatException(self, ei: Any) -> str:
        text = ''.join(traceback.format_exception(*ei))
        if len(text) > self.max_traceback_chars:
            return (
                text[: self.max_traceback_chars]
                + '\n... [traceback truncated; increase max_traceback_chars to see more]\n'
            )
        return text
