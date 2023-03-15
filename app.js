const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db = null;

const initializerDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is start at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};

initializerDbAndServer();

const convertObjectToResponseObject = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    jerseyNumber: object.jersey_number,
    role: object.role,
  };
};

// get all players list
app.get("/players/", async (request, response) => {
  const getAllPlayerQuery = `
    SELECT * FROM cricket_team;`;
  const allPlayers = await db.all(getAllPlayerQuery);
  response.send(
    allPlayers.map((eachPlayer) => convertObjectToResponseObject(eachPlayer))
  );
});

// add new player details

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId, playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_name,jersey_number,role)
    VALUES
      (
            '${playerName}',
            ${jerseyNumber},
           '${role}'
      );`;

  const dbResponse = await db.run(addPlayerQuery);
  const player = dbResponse.lastID;
  response.send("Player are added");
});

// get player details
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const Players = await db.get(getPlayerQuery);
  response.send(Players);
});

// update player details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `
    UPDATE cricket_team SET 
    player_name = '${playerName} ',
    jersey_number = ${jerseyNumber},
    role = '${role}' 
    WHERE player_id = ${playerId} ;`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//delete players details

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE  FROM cricket_team 
    WHERE player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
