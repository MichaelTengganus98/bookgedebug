# Bookgedebug

A small Django app for searching books through the Google Books API and keeping a personal wishlist.

- Web at `/`: search for books and add or remove them from your wishlist
- REST API: built with Django REST Framework (DRF) under `/api/`
- Database: PostgreSQL(Docker), SQLite(Python local)

## Demo

- Demo test running in google cloud console

[https://bookgedebug-687628058551.asia-southeast2.run.app/](https://bookgedebug-687628058551.asia-southeast2.run.app/)

## Docker command

```powershell
docker compose up --build -d
docker compose down -v
```

## Python run

```powershell
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
```

## API (Django REST Framework)

- GET `/api/books/?q=[query]`
- GET `/api/wishlist/`
- POST `/api/wishlist/`
- DELETE `/api/wishlist/[volume_id]/`