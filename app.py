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
    os.remove("films.csv")
    with open("main.csv", "w") as out:
        writer = csv.DictWriter(out, fieldnames=["code", "users"])
        writer.writerow({"code": "abcde", "users": 0})
    with open("films.csv", "w") as out:
        writer = csv.DictWriter(out, fieldnames=["code", "films"])
        writer.writerow({"code": "abcde", "films": "|".join(["f", "g", "h", "i", "j", "k", "l", "m", "n", "o"])})
    with open("rankings.csv", "w") as out:
        writer = csv.DictWriter(out, fieldnames=["code", "rankings"])
        writer.writerow({"code": "abcde", "rankings": "~".join(["|".join(['1', '3', '2']), "|".join(['2', '3', '1'])])})

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
    with open("films.csv") as inp, open("tmp_films.csv", "w") as out:
        writer = csv.DictWriter(out, fieldnames=["code", "films"])
        for row in csv.DictReader(inp, fieldnames=["code", "films"]):
            if not (row["code"] == groupCode):
                writer.writerow(row)
    os.remove("films.csv")
    os.rename("tmp_films.csv", "films.csv")
    with open("rankings.csv") as inp, open("tmp_rankings.csv", "w") as out:
        writer = csv.DictWriter(out, fieldnames=["code", "rankings"])
        for row in csv.DictReader(inp, fieldnames=["code", "rankings"]):
            if not (row["code"] == groupCode):
                writer.writerow(row)
    os.remove("rankings.csv")
    os.rename("tmp_rankings.csv", "rankings.csv")
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
    emit("switchPageThree", {"genres": genres, "users": users}, to=room)

@socketio.on("genreSelect")
def genreSelect(data):
    allGenres = requests.get("https://api.themoviedb.org/3/genre/movie/list?api_key=" + TMDB_KEY + "&language=en-US").json()

    chosen = []

    for i in data:
        chosen.append(allGenres["genres"][i]["id"])

    session["genres"] = chosen
    session.modified = True

    all_data = {"genres": data, "ids": chosen}

    room = session.get("roomName")
    emit("updateGenres", all_data, to=room)

@socketio.on("page4")
def page4():
    chosenGenres = session.get("genres")
    room = session.get("roomName")
    users = session.get("users")
    if len(chosenGenres) == 0:
        emit("addMoreGenres", to=room)
    else:
        genreString = ",".join([str(genre) for genre in chosenGenres])
        data = requests.get("https://api.themoviedb.org/3/discover/movie?api_key=" + TMDB_KEY + "&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=" + genreString).json()
        if len(data["results"]) == 0:
            emit("chooseDifferentGenres", to=room)
        else:
            emit("startSelect", {"id": data["results"][0]["id"], "title": data["results"][0]["title"], "overview": data["results"][0]["overview"], "poster_path": data["results"][0]["poster_path"], "rating": data["results"][0]["vote_average"], "room": room, "users": users}, to=room)

@socketio.on("postVote")
def postVote(data):
    room = data["room"]
    if data["vote"]:
        found = False
        with open("films.csv") as inp, open("tmp_films.csv", "w") as out:
            writer = csv.DictWriter(out, fieldnames=["code", "films"])
            for row in csv.DictReader(inp, fieldnames=["code", "films"]):
                if row["code"] == room:
                    new = row["films"].split("|")
                    if not (data["id"] in new):
                        new.append(data["id"])
                        print(new)
                        writer.writerow({"code": row["code"], "films": "|".join(new)})
                    else:
                        writer.writerow(row)
                    found = True
                else:
                    writer.writerow(row)
            print(found)
            if not found:
                writer.writerow({"code":  room, "films": "|".join([data["id"]])})
        os.remove("films.csv")
        os.rename("tmp_films.csv", "films.csv")
    done = int(data["done"])
    users = int(data["users"])
    if done == users:
        with open("films.csv") as inp:
            for row in csv.DictReader(inp, fieldnames=["code", "films"]):
                doneSomething = False
                if row["code"] == room:
                    rowFilms = row["films"].split("|")
                    print(len(rowFilms))
                    if len(rowFilms) == 3:
                        filmTitles = []
                        for film in rowFilms:
                            filmTitles.append(requests.get("https://api.themoviedb.org/3/movie/" + film + "?api_key=" + TMDB_KEY + "&language=en-US").json()["title"])
                        emit("startRanking", {"films": rowFilms, "titles": filmTitles}, to=room)
                        doneSomething = True
                    elif data["id"] in rowFilms:
                        similarFilm = requests.get("https://api.themoviedb.org/3/movie/" + str(data["id"]) + "/similar?api_key=" + TMDB_KEY + "&language=en-US&page=1").json()
                        emit("nextMovie", {"id": similarFilm["results"][0]["id"], "title": similarFilm["results"][0]["title"], "overview": similarFilm["results"][0]["overview"], "poster_path": similarFilm["results"][0]["poster_path"], "rating": similarFilm["results"][0]["vote_average"], "orderNumber": data["orderNumber"]}, to=room)
                        doneSomething = True
                    else:
                        genreString = ",".join([str(genre) for genre in [data["genres"]]])
                        otherFilm = requests.get("https://api.themoviedb.org/3/discover/movie?api_key=" + TMDB_KEY + "&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=" + genreString).json()
                        emit("nextMovie", {"id": otherFilm["results"][int(data["orderNumber"]) + 1]["id"], "title": otherFilm["results"][int(data["orderNumber"]) + 1]["title"], "overview": otherFilm["results"][int(data["orderNumber"]) + 1]["overview"], "poster_path": otherFilm["results"][int(data["orderNumber"]) + 1]["poster_path"], "rating": otherFilm["results"][int(data["orderNumber"]) + 1]["vote_average"], "orderNumber": int(data["orderNumber"]) + 2}, to=room)
                        doneSomething = True
            if not(doneSomething):
                genreString = ",".join([str(genre) for genre in [data["genres"]]])
                otherFilm = requests.get("https://api.themoviedb.org/3/discover/movie?api_key=" + TMDB_KEY + "&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=" + genreString).json()
                emit("nextMovie", {"id": otherFilm["results"][int(data["orderNumber"]) + 1]["id"], "title": otherFilm["results"][int(data["orderNumber"]) + 1]["title"], "overview": otherFilm["results"][int(data["orderNumber"]) + 1]["overview"], "poster_path": otherFilm["results"][int(data["orderNumber"]) + 1]["poster_path"], "rating": otherFilm["results"][int(data["orderNumber"]) + 1]["vote_average"], "orderNumber": int(data["orderNumber"]) + 2}, to=room)
    else:
        emit("waitForVote", {"users": data["users"], "room": room}, to=room)

@socketio.on("sendRanking")
def sendRanking(data):
    users = data["users"]
    films = data["films"]
    scores = data["scores"]
    room = data["room"]
    found = False
    with open("rankings.csv") as inp, open("tmp_rankings.csv", "w") as out:
        writer = csv.DictWriter(out, fieldnames=["code", "rankings"])
        for row in csv.DictReader(inp, fieldnames=["code", "rankings"]):
            if row["code"] == room:
                new = row["rankings"].split("~")
                new.append("|".join(scores))
                print(new)
                writer.writerow({"code": row["code"], "rankings": "~".join(new)})
                found = True
            else:
                writer.writerow(row)
        if not found:
            writer.writerow({"code":  room, "rankings": "~".join(["|".join(scores)])})
    os.remove("rankings.csv")
    os.rename("tmp_rankings.csv", "rankings.csv")
    done = 0
    with open("rankings.csv") as inp:
        for row in csv.DictReader(inp, fieldnames=["code", "rankings"]):
            if row["code"] == room:
                new = row["rankings"].split("~")
                done = len(new)
    print(str(users) + " " + str(done))
    users = int(users)
    done = int(done)
    if users == done:
        final_rankings = []
        with open("rankings.csv") as inp:
            for row in csv.DictReader(inp, fieldnames=["code", "rankings"]):
                if row["code"] == room:
                    final_rankings = row["rankings"].split("~")
        totals = [0] * len(films)
        for user in range(users):
            for film in range(len(films)):
                info = final_rankings[user].split("|")
                totals[film] += int(info[film])
        finalFilmId = films[totals.index(min(totals))]
        finalFilmData = requests.get("https://api.themoviedb.org/3/movie/" + finalFilmId + "?api_key=" + TMDB_KEY + "&language=en-US").json()
        finalFilmTitle = finalFilmData["title"]
        finalFilmPoster = finalFilmData["poster_path"]
        emit("finalVerdict", {"id": finalFilmId, "title": finalFilmTitle, "poster": finalFilmPoster}, to=room)
    else:
        emit("awaitingFinal")

if __name__ == "__main__":
    socketio.run(app, debug = True)