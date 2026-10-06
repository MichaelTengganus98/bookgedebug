docker compose up --build -d
http://localhost:8000
docker compose down


pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py runserver