"""Límite de peticiones en memoria (ventana deslizante por IP).

Suficiente para desarrollo y para un único proceso. En producción, con varios
procesos o servidores, habrá que moverlo a un almacén compartido (por ejemplo Redis)
o al proxy/API gateway. Lo dejamos detrás de esta clase para poder cambiarlo.
"""

import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request, status

from app.core.config import SettingsDep

WINDOW_SECONDS = 60.0


class InMemoryRateLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def allow(self, key: str, limit: int, now: float | None = None) -> bool:
        now = time.monotonic() if now is None else now
        with self._lock:
            hits = self._hits[key]
            while hits and now - hits[0] >= WINDOW_SECONDS:
                hits.popleft()
            if len(hits) >= limit:
                return False
            hits.append(now)
            return True

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


rate_limiter = InMemoryRateLimiter()


def enforce_rate_limit(request: Request, settings: SettingsDep) -> None:
    client_ip = request.client.host if request.client else "unknown"
    key = f"{request.url.path}:{client_ip}"
    if not rate_limiter.allow(key, settings.rate_limit_per_minute):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            headers={"Retry-After": str(int(WINDOW_SECONDS))},
        )
