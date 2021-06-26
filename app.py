from flask import Flask, render_template, session
import requests, os, csv
from flask_socketio import SocketIO, leave_room, send, emit, join_room
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret"
socketio = SocketIO(app, cors_allowed_origins="*")

TMDB_KEY = os.environ.get("TMDB_KEY")

@app.before_first_request
def before():
    os.remove("main.csv")
    with open("main.csv", "w") as out:
        writer = csv.DictWriter(out, fieldnames=["code", "users"])
        writer.writerow({"code": "abcde", "users": 0})

@app.route("/")
def home():
    return render_template("index.html")

@socketio.on("connect")
def test_connect():
    print("Connected!")

@socketio.on("disconnected")
def test_disconnected(data):
    groupCode = data["groupCode"]
    page = data["page"]
    with open("main.csv") as inp, open("tmp.csv", "w") as out:
        writer = csv.DictWriter(out, fieldnames=["code", "users"])
        for row in csv.DictReader(inp, fieldnames=["code", "users"]):
            if row["code"] == groupCode:
                writer.writerow({"code": row["code"], "users": 0})
            else:
                writer.writerow(row)
    os.remove("main.csv")
    os.rename("tmp.csv", "main.csv")
    print("got here")
    emit("leaveUser", {"users": 0, "page": page}, to=groupCode)
    leave_room(groupCode)

@socketio.on("join")
def on_join(room):
    session["roomName"] = room
    join_room(room)
    print("joined " + room)
    users = 1
    found = False
    with open("main.csv") as inp, open("tmp.csv", "w") as out:
        writer = csv.DictWriter(out, fieldnames=["code", "users"])
        for row in csv.DictReader(inp, fieldnames=["code", "users"]):
            if row["code"] == room:
                writer.writerow({"code": row["code"], "users": int(row["users"]) + 1})
                users = int(row["users"]) + 1
                found = True
            else:
                writer.writerow(row)
        if not found:
            writer.writerow({"code":  room, "users": 1})
    os.remove("main.csv")
    os.rename("tmp.csv", "main.csv")
    emit("newUser", users, to=room)

@socketio.on("page3")
def page3(users):
    room = session.get("roomName")
    genres = requests.get("https://api.themoviedb.org/3/genre/movie/list?api_key=" + TMDB_KEY + "&language=en-US").json()
    session["genres"] = []
    session["users"] = users
    print(users)
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
    room = session.get("room")
    if len(chosenGenres) == 0:
        emit("addMoreGenres")
    else:
        genreString = ",".join([str(genre) for genre in chosenGenres])
        data = requests.get("https://api.themoviedb.org/3/discover/movie?api_key=" + TMDB_KEY + "&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=" + genreString).json()
        if len(data["results"]) == 0:
            emit("chooseDifferentGenres")
        else:
            emit("startSelect", {"title": data["results"][0]["title"], "overview": data["results"][0]["overview"], "poster_path": data["results"][0]["poster_path"], "rating": data["results"][0]["vote_average"], "room": room})


if __name__ == "__main__":
    socketio.run(app, debug = True)