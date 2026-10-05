import requests
from django.conf import settings


class BookServiceError(Exception):
    """Google Books API could not be reached"""


def _normalize(item):
    info = item.get("volumeInfo", {})
    links = info.get("imageLinks", {})
    thumbnail = links.get("thumbnail") or links.get("smallThumbnail") or ""
    return {
        "id": item.get("id", ""),
        "title": info.get("title") or "Untitled",
        "authors": info.get("authors") or [],
        "thumbnail": thumbnail.replace("http://", "https://", 1),
        "rating": info.get("averageRating") or 0,
    }


def search_books(query):
    params = {"q": query}
    if settings.GOOGLE_BOOKS_API_KEY:
        params["key"] = settings.GOOGLE_BOOKS_API_KEY
    try:
        resp = requests.get(
            settings.GOOGLE_BOOKS_URL,
            params=params,
            timeout=settings.GOOGLE_BOOKS_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise BookServiceError(str(exc)) from exc

    return [_normalize(i) for i in data.get("items", []) if i.get("id")]
