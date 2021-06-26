from flask import Flask, render_template, session
import requests, os
from flask_socketio import SocketIO, send, emit, join_room
from werkzeug import debug
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret"
socketio = SocketIO(app, cors_allowed_origins="*")

TMDB_KEY = os.environ.get("TMDB_KEY")

@app.route("/")
def home():
    return render_template("index.html")

@socketio.on("connect")
def test_connect():
    print("Connected!")

@socketio.on("join")
def on_join(room):
    session["roomName"] = room
    join_room(room)
    print("joined " + room)

@socketio.on("page3")
def page3():
    room = session.get("roomName")
    genres = requests.get("https://api.themoviedb.org/3/genre/movie/list?api_key=" + TMDB_KEY + "&language=en-US").json()
    session["genres"] = []
    emit("switchPageThree", genres, to=room)

@socketio.on("genreSelect")
def genreSelect(data):
    allGenres = requests.get("https://api.themoviedb.org/3/genre/movie/list?api_key=" + TMDB_KEY + "&language=en-US").json()

    chosen = []

    for i in data:
        chosen.append(allGenres["genres"][i]["id"])

    session["genres"] = chosen
    session.modified = True

    room = session.get("roomName")
    emit("updateGenres", data, to=room)

@socketio.on("page4")
def page4():
    chosenGenres = session.get("genres")
    if len(chosenGenres) == 0:
        emit("addMoreGenres")
    else:
        genreString = ",".join([str(genre) for genre in chosenGenres])
        data = requests.get("https://api.themoviedb.org/3/discover/movie?api_key=" + TMDB_KEY + "&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=" + genreString).json()
        if len(data["results"]) == 0:
            emit("chooseDifferentGenres")
        else:
            emit("startSelect", {"title": data["results"][0]["title"], "overview": data["results"][0]["overview"], "poster_path": data["results"][0]["poster_path"], "rating": data["results"][0]["vote_average"]})


if __name__ == "__main__":
    socketio.run(app, debug = True)