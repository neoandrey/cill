export PORT=5000
pip install -r requirements.txt
python /opt/csek/redis_worker.py & gunicorn -w 2 -b 0.0.0.0:$PORT  'csek:app'