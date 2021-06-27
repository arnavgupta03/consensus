function onLoad() {
    var socket = io.connect("http://127.0.0.1:5000");
    socket.onconnect(() => {
        socket.emit("connect");
    });

    socket.on("awaitingFinal", function() {
        document.getElementById("page5").remove();

        document.getElementById("page6").className = "mt-auto mr-auto mb-auto w-5/6 h-2/3 bg-indigo-400 rounded-tr-lg rounded-tl-lg rounded-br-lg rounded-bl-lg shadow align-middle flex flex-col justify-center items-center";

        var p6waiting = document.createElement("h2");
        p6waiting.id = "p6waiting";
        p6waiting.innerText = "Waiting...";
        p6waiting.className = "text-9xl mt-4 mb-4";
        document.getElementById("page6").appendChild(p6waiting);

        var p6exp = document.createElement("h5");
        p6exp.id = "p6exp";
        p6exp.innerText = "We're just waiting for everyone to finish up";
        p6exp.className = "text-3xl mt-16 mb-4"
        document.getElementById("page6").appendChild(p6exp);
        return;
    });

    socket.on("finalVerdict", function(finalFilm) {
        if (!!document.getElementById("page5")){
            document.getElementById("page5").remove();
        }
        if (!!document.getElementById("page6")){
            document.getElementById("page6").remove();
        }

        document.getElementById("page7").className = "mt-auto mr-auto mb-auto w-5/6 h-2/3 bg-indigo-400 rounded-tr-lg rounded-tl-lg rounded-br-lg rounded-bl-lg shadow align-middle flex flex-col justify-center items-center grid grid-cols-2 gap-0";

        var finalPoster = document.createElement("img");
        finalPoster.src = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/" + finalFilm["poster"];
        finalPoster.id = "finalPoster";
        finalPoster.className = "w-60 h-90 mt-8 mb-8 ml-32";
        document.getElementById("page7").appendChild(finalPoster);

        var finalside = document.createElement("div");
        finalside.id = "finalside";

        var finalTitle = document.createElement("h3");
        finalTitle.innerText = "Here it is!";
        finalTitle.id = "finalTitle";
        finalTitle.className = "text-center text-6xl mt-8 mb-16 mr-32"
        finalside.appendChild(finalTitle);

        var finalMovieTitle = document.createElement("h3");
        finalMovieTitle.innerText = finalFilm["title"];
        finalMovieTitle.id = "finalMovieTitle";
        finalMovieTitle.className = "font-bold text-center text-6xl mt-8 mb-8 mr-32";
        finalside.appendChild(finalMovieTitle);

        document.getElementById("page7").appendChild(finalside);
    });

    socket.on("startRanking", function(films) {
        localStorage.setItem("rankedFilms", films["films"]);

        document.getElementById("page4").remove();

        document.getElementById("page5").className = "mt-auto mr-auto mb-auto w-5/6 h-2/3 bg-indigo-400 rounded-tr-lg rounded-tl-lg rounded-br-lg rounded-bl-lg shadow align-middle flex flex-col justify-center items-center";

        var p5title = document.createElement("h3");
        p5title.id = "p5title";
        p5title.innerText = "Here are the movies you\'re interested in watching. Rank them from 1 to " + films["films"].length + " in order of preference.";
        p5title.className = "text-3xl text-center mt-4 mb-8 ml-4 mr-4";
        document.getElementById("page5").appendChild(p5title);

        var p5rankingGroup = document.createElement("div");
        p5rankingGroup.id = "p5rankingGroup";
        p5rankingGroup.className = "grid grid-rows-3 gap-2";

        for (var i = 0; i < films["films"].length; i++) {
            var p5rankinput = document.createElement("input");
            p5rankinput.id = "p5rankinput" + i;
            p5rankinput.type = "text";

            var p5ranklabel = document.createElement("label");
            p5ranklabel.id = "p5ranklabel" + i;
            p5ranklabel.innerText = films["titles"][i];
            p5ranklabel.for = "p5rankinput" + i;

            p5rankingGroup.appendChild(p5ranklabel);
            p5rankingGroup.appendChild(p5rankinput);
        }

        document.getElementById("page5").appendChild(p5rankingGroup);

        var p5submit = document.createElement("button");
        p5submit.id = "p5submit";
        p5submit.className = "mt-4 text-center bg-red-300 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full";
        p5submit.innerText = "Submit Rankings";
        p5submit.addEventListener("click", function() {
            var films = localStorage.getItem("rankedFilms").split(',');
            var scores = [];
            for (var i = 0; i < films.length; i++) {
                var input = document.getElementById("p5rankinput" + i).value;
                if (isNaN(input) || input > 3 || input < 1) {
                    alert("Please make sure that all numbers inputted are between 1 and " + films.length);
                    return;
                } else {
                    scores.push(input);
                }
            }
            console.log(scores);
            var users = localStorage.getItem("users");
            var room = localStorage.getItem("room");
            socket.emit("sendRanking", {"films": films, "scores": scores, "users": users, "room": room});
        });

        document.getElementById("page5").appendChild(p5submit);
    });

    socket.on("waitForVote", function() {
        document.getElementById("p4done").innerText = parseInt(document.getElementById("p4done").innerText) + 1;
    });

    socket.on("nextMovie", function(filmInfo) {
        localStorage.setItem("title", filmInfo["title"]);
        localStorage.setItem("id", filmInfo["id"]);
        localStorage.setItem("orderNumber", filmInfo["orderNumber"]);

        document.getElementById("p4title").innerText = filmInfo["title"];
        document.getElementById("p4descript").innerText = filmInfo["overview"];
        document.getElementById("p4rating").innerText = filmInfo["rating"];
        document.getElementById("p4poster").src = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/" + filmInfo["poster_path"];

        document.getElementById("p4users").innerText = localStorage.getItem("users");
        document.getElementById("p4done").innerText = 0;

        document.getElementById("p4watch").style.visibility = "visible";
        document.getElementById("p4not").style.visibility = "visible";
    });

    socket.on("leaveUser", function(data) {
        if (data["page"] === 2)
        {
            document.getElementById("p2room").innerHTML = "Users in room: " + 0;
        }
        location.reload();
    });

    socket.on("newUser", function(users) {
        document.getElementById("p2room").innerHTML = "Users in room: " + users;
    });

    socket.on("startSelect", function(filmInfo) {
        localStorage.setItem("title", filmInfo["title"]);
        localStorage.setItem("id", filmInfo["id"]);
        localStorage.setItem("room", filmInfo["room"]);
        localStorage.setItem("orderNumber", 0);

        document.getElementById("page3").remove();

        document.getElementById("page4").className = "mt-auto mr-auto mb-auto w-5/6 h-2/3 bg-indigo-400 rounded-tr-lg rounded-tl-lg rounded-br-lg rounded-bl-lg shadow flex flex-col";

        var p4instruct = document.createElement("h3");
        p4instruct.id = "p4instruct";
        p4instruct.className = "text-center text-xl mt-4";
        var p4instructTextNode = document.createTextNode("Now we're going to give you some movies! Tell us if you'd want to watch it or not.");
        p4instruct.appendChild(p4instructTextNode);
        document.getElementById("page4").appendChild(p4instruct);

        var p4movieCard = document.createElement("div");
        p4movieCard.className = "grid grid-cols-4 mt-8 pl-8 pr-8 text-center gap-0";

        var p4movieInfo = document.createElement("div");
        p4movieInfo.className = "text-center";

        var p4watch = document.createElement("button");
        p4watch.id = "p4watch";
        p4watch.className = "w-36 h-36 bg-red-300 hover:bg-red-500 text-white font-bold rounded-full mt-24 mb-24 ml-16";
        p4watch.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' fill='currentColor' class='bi bi-camera-reels-fill m-8' viewBox='0 0 16 16'><path d='M6 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'/><path d='M9 6a3 3 0 1 1 0-6 3 3 0 0 1 0 6z'/><path d='M9 6h.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 7.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 16H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h7z'/></svg>";
        p4watch.addEventListener("click", function() {
            document.getElementById("p4title").innerText = "Waiting for everyone to vote...";
            //document.getElementById("p4done").innerText = parseInt(document.getElementById("p4done").innerText) + 1;
            document.getElementById("p4watch").style.visibility = "hidden";
            document.getElementById("p4not").style.visibility = "hidden";
            var users = localStorage.getItem("users");
            var done = parseInt(document.getElementById("p4done").innerText) + 1;
            console.log(users + " " + done);
            socket.emit("postVote", {"vote": true, "users": users, "done": done, "room": localStorage.getItem("room"), "title": localStorage.getItem("title"), "id": localStorage.getItem("id"), "orderNumber": localStorage.getItem("orderNumber"), "genres": localStorage.getItem("genres")});
        });
        p4movieCard.appendChild(p4watch);

        var p4poster = document.createElement("img");
        p4poster.id = "p4poster";
        p4poster.className = "w-54 h-72";
        p4poster.src = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/" + filmInfo["poster_path"];
        p4movieCard.appendChild(p4poster);

        var p4title = document.createElement("h3");
        p4title.id = "p4title";
        var p4titleTextNode = document.createTextNode(filmInfo["title"]);
        p4title.appendChild(p4titleTextNode);
        p4title.className = "text-3xl mt-4 mb-4";
        p4movieInfo.appendChild(p4title);

        var p4descript = document.createElement("p");
        p4descript.id = "p4descript";
        var p4descriptTextNode = document.createTextNode(filmInfo["overview"]);
        p4descript.appendChild(p4descriptTextNode);
        p4descript.className = "text-sm mt-4 mb-4";
        p4movieInfo.appendChild(p4descript);

        var p4ratingLabel = document.createElement("h4");
        p4ratingLabel.id = "p4ratingLabel";
        p4ratingLabel.innerText = "Rating"
        p4ratingLabel.className = "text-md mt-4";
        p4movieInfo.appendChild(p4ratingLabel);

        var p4rating = document.createElement("h4");
        p4rating.id = "p4rating";
        var p4ratingTextNode = document.createTextNode(filmInfo["rating"]);
        p4rating.appendChild(p4ratingTextNode);
        p4ratingLabel.className = "text-md mb-4";
        p4movieInfo.appendChild(p4rating);

        p4movieCard.appendChild(p4movieInfo);

        /*var p4moviePoster = document.createElement("div");
        p4moviePoster.className = "ml-auto mr-auto";*/

        var p4not = document.createElement("button");
        p4not.id = "p4not";
        p4not.className = "w-36 h-36 bg-red-300 hover:bg-red-500 text-white font-bold rounded-full mt-24 mb-24 ml-16";
        p4not.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' fill='currentColor' class='bi bi-x-lg m-8' viewBox='0 0 16 16'><path d='M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z'/></svg>";
        p4not.addEventListener("click", function() {
            document.getElementById("p4title").innerText = "Waiting for everyone to vote...";
            //document.getElementById("p4done").innerText = parseInt(document.getElementById("p4done").innerText) + 1;
            document.getElementById("p4watch").style.visibility = "hidden";
            document.getElementById("p4not").style.visibility = "hidden";
            var users = localStorage.getItem("users");
            var done = parseInt(document.getElementById("p4done").innerText) + 1;
            console.log(users + " " + done);
            socket.emit("postVote", {"vote": false, "users": users, "done": done, "room": localStorage.getItem("room"), "title": localStorage.getItem("title"), "id": localStorage.getItem("id"), "orderNumber": localStorage.getItem("orderNumber"), "genres": localStorage.getItem("genres")});
        });

        var p4userInfo = document.createElement("div");
        p4userInfo.id = "p4userInfo";
        var p4users = document.createElement("p");
        p4users.id = "p4users";
        p4users.innerText = localStorage.getItem("users");
        var p4done = document.createElement("p");
        p4done.id = "p4done";
        p4done.innerText = "0";

        p4userInfo.appendChild(p4users);
        p4userInfo.appendChild(p4done);

        p4movieCard.appendChild(p4not);

        //document.getElementById("page4").appendChild(p4moviePoster);
        document.getElementById("page4").appendChild(p4movieCard);
        //document.getElementById("page4").appendChild(p4watch);
        document.getElementById("page4").appendChild(p4userInfo);
    });

    socket.on("chooseDifferentGenres", function() {
        alert("No movies available for this genre combination.");
    });

    socket.on("addMoreGenres", function() {
        alert("Please add at least one genre");
    });

    socket.on("updateGenres", function(data) {
        var genres = data["genres"];
        var ids = data["ids"];
        localStorage.setItem("genres", ids);
        for (var i = 0; i < genres.length; i++) {
            document.getElementById("p3checkbox" + genres[i]).checked = true;
        }
    });

    socket.on("switchPageThree", function(data) {
        genres = data["genres"]
        localStorage.setItem("users", data["users"]);
        document.getElementById("page2").remove();

        document.getElementById("page3").className = "mt-auto mr-auto mb-auto w-5/6 h-2/3 bg-indigo-400 rounded-tr-lg rounded-tl-lg rounded-br-lg rounded-bl-lg shadow align-middle flex flex-col justify-center items-center";

        var p3title = document.createElement("h3");
        p3title.id = "p3title";
        p3title.className = "text-center text-4xl ml-8 mr-8 mb-8";
        var p3titleTextNode = document.createTextNode("Alright, let's start by choosing the genre(s)! Only hit Submit once everyone's agreed on which genre/genre combo to watch. Only whoever chose the last genre may submit.");
        p3title.appendChild(p3titleTextNode);
        document.getElementById("page3").appendChild(p3title);

        var p3checkboxGroup = document.createElement("div");
        p3checkboxGroup.id = "p3checkboxGroup";
        p3checkboxGroup.className = "grid grid-cols-6 grid-flow-row ml-16 mr-16";
        for (var i = 0; i < 19; i++) {
            var p3checkbox = document.createElement("input");
            p3checkbox.type = "checkbox";
            p3checkbox.id = "p3checkbox" + i.toString();
            p3checkbox.className = "form-checkbox";
            p3checkbox.addEventListener("click", function() {
                var checked = [];
                for (var i = 0; i < 19; i++) {
                    if (document.getElementById("p3checkbox" + i.toString()).checked) {
                        checked.push(i);
                        document.getElementById("p3checkbox" + i.toString()).checked = false;
                    }
                }
                document.getElementById("p3button").style.visibility = "visible";
                socket.emit("genreSelect", checked);
            });
            p3checkboxGroup.appendChild(p3checkbox)

            var p3label = document.createElement("label");
            p3label.for = "p3checkbox" + i.toString();
            var p3labelTextNode = document.createTextNode(genres["genres"][i]["name"]);
            p3label.appendChild(p3labelTextNode);
            p3checkboxGroup.appendChild(p3label);
        }
        var p3button = document.createElement("button");
        p3button.id = "p3button";
        p3button.className = "text-center bg-red-300 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full";
        p3button.style.visibility = "hidden";
        var p3buttonTextNode = document.createTextNode("Submit Genres");
        p3button.appendChild(p3buttonTextNode);
        p3button.addEventListener("click", function() {
            socket.emit("page4");
        });
        document.getElementById("page3").appendChild(document.createElement("br"));
        document.getElementById("page3").appendChild(document.createElement("br"));
        document.getElementById("page3").appendChild(p3checkboxGroup);
        document.getElementById("page3").appendChild(p3button);
    });

    document.getElementById("p1joinCreateGroup").addEventListener("click", function() {
        const groupCode = document.getElementById("p1groupCode").value;
        socket.emit("join", groupCode);
        
        document.getElementById("page1").remove();

        var leaveButton = document.createElement("button");
        leaveButton.id = "leaveButton";
        leaveButton.className = "text-center bg-blue-300 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-full";
        var leaveButtonTextNode = document.createTextNode("Close Room");
        leaveButton.appendChild(leaveButtonTextNode);
        leaveButton.addEventListener("click", function() {
            var page;
            if (!!document.getElementById("page2")) {
                page = 2;
            } else {
                page = 3;
            }
            socket.emit("disconnected", {"groupCode": groupCode, "page": page});
        });
        document.getElementById("leave").appendChild(leaveButton);
        document.getElementById("page2").className = "mt-auto mb-auto mr-auto w-5/6 h-2/3 bg-indigo-400 rounded-tr-lg rounded-tl-lg rounded-br-lg rounded-bl-lg shadow align-middle flex flex-col justify-center items-center";

        var p2title = document.createElement("h3");
        p2title.id = "p2title";
        var p2titleTextNode = document.createTextNode("Great, your group code is " + groupCode + "! Please wait for everyone to join before starting.");
        p2title.className = "text-4xl text-center ml-8 mr-8 mt-4 mb-4";
        p2title.appendChild(p2titleTextNode);

        var p2room = document.createElement("p");
        p2room.id = "p2room";
        p2room.className = "text-center text-2xl mt-4 mb-4"
        /*var p2roomTextNode = document.createTextNode("Users in room: " + people);
        p2title.appendChild(p2roomTextNode);*/

        var p2start = document.createElement("button");
        p2start.id = "p2start";
        p2start.className = "text-center mt-4 mb-4 bg-red-300 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full";
        p2start.addEventListener("click", function() {
            var text = document.getElementById("p2room").innerText;
            socket.emit("page3", text.replace("Users in room: ", ""));
        });
        var p2startTextNode = document.createTextNode("Start Choosing");
        p2start.appendChild(p2startTextNode);

        document.getElementById("page2").appendChild(p2title);
        document.getElementById("page2").appendChild(document.createElement("br"));
        document.getElementById("page2").appendChild(document.createElement("br"));
        document.getElementById("page2").appendChild(p2room);
        document.getElementById("page2").appendChild(document.createElement("br"));
        document.getElementById("page2").appendChild(document.createElement("br"));
        document.getElementById("page2").appendChild(p2start);
    });
};