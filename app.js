const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Is Running");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDBandServer();

convertSneakCaseToCamelCase = (teamPlayers) => {
  return {
    playerId: teamPlayers.player_id,
    playerName: teamPlayers.player_name,
    jerseyNumber: teamPlayers.jersey_number,
    role: teamPlayers.role,
  };
};
app.get("/players/", async (request, response) => {
  const getCricketTeam = `
    SELECT * FROM cricket_team
    ORDER BY player_id;`;
  const teamArray = await db.all(getCricketTeam);
  response.send(
    teamArray.map((eachPlayer) => convertSneakCaseToCamelCase(eachPlayer))
  );
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `INSERT INTO
    cricket_team (player_name, jersey_number, role)
    VALUES
    ('${playerName}', ${jerseyNumber}, '${role}');`;
  await db.run(postPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updatePlayer = `
    SELECT * FROM cricket_team
    WHERE player_id = ${playerId};`;
  const player = await db.get(updatePlayer);
  response.send(convertSneakCaseToCamelCase(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayer = `
    UPDATE cricket_team
    SET player_name = ${playerName},
    jersey_number = ${jerseyNumber},
    role = ${role}
    WHERE player_id = ${playerId};
    `;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});
