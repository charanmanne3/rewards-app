"""
In-memory TTL cache for recommendation responses.

Suitable for single-instance Render deployments. For multi-instance production,
swap this module with Redis (ElastiCache) using the same key interface.
"""

import logging
import time
from threading import Lock
from typing import Any, Generic, TypeVar

from app.core.config import get_settings

logger = logging.getLogger(__name__)
T = TypeVar("T")


class TTLCache(Generic[T]):
    def __init__(self, ttl_seconds: int, max_size: int = 256) -> None:
        self._ttl = ttl_seconds
        self._max_size = max_size
        self._data: dict[str, tuple[float, T]] = {}
        self._lock = Lock()

    def get(self, key: str) -> T | None:
        with self._lock:
            entry = self._data.get(key)
            if not entry:
                return None
            expires_at, value = entry
            if time.time() > expires_at:
                del self._data[key]
                return None
            return value

    def set(self, key: str, value: T) -> None:
        with self._lock:
            if len(self._data) >= self._max_size:
                oldest = min(self._data, key=lambda k: self._data[k][0])
                del self._data[oldest]
            self._data[key] = (time.time() + self._ttl, value)

    def delete(self, key: str) -> None:
        with self._lock:
            self._data.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._data.clear()
            logger.debug("Cache cleared")


_settings = get_settings()
recommendation_cache: TTLCache[Any] = TTLCache(
    ttl_seconds=_settings.recommendation_cache_ttl_seconds,
    max_size=_settings.cache_max_entries,
)
