from flask import Flask, render_template, session
import requests
from flask_socketio import SocketIO, send, emit, join_room

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret"
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def home():
    return render_template("index.html")

@socketio.on("connected")
def test_connect(info):
    print(info)

if __name__ == "__main__":
    socketio.run(app)