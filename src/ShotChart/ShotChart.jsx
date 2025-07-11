import React, { useEffect, useState } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, Tooltip, XAxis, YAxis, ZAxis, Layer } from "recharts";
import "./ShotChart.scss";
import Dropdown from "../Shared/Dropdown";
import PlayerHeadshot from "../Shared/PlayerHeadshot";

const shotColor = (made) => (made ? "green" : "red");

const CourtLines = () => {
  return (
    <Layer>
      {/* Outer lines */}
      <rect x={0} y={0} width={500} height={470} stroke="black" fill="none" strokeWidth={2} />

      {/* Hoop */}
      <circle cx={250} cy={422.5} r={7.5} stroke="black" fill="none" strokeWidth={2} />

      {/* Backboard */}
      <line x1={220} y1={430} x2={280} y2={430} stroke="black" strokeWidth={3} />

      {/* Paint Areas */}
      <rect x={170} y={280} width={160} height={190} stroke="black" fill="none" strokeWidth={2} />
      <rect x={190} y={280} width={120} height={190} stroke="black" fill="none" strokeWidth={2} />

      {/* Free throw circles */}
      <path d="M 190 280 A 60 60 0 0 1 310 280" stroke="black" fill="none" strokeWidth={2} />
      <path d="M 190 280 A 60 60 0 0 0 310 280" stroke="black" fill="none" strokeWidth={2} strokeDasharray="5,5" />

      {/* Restricted Area */}
      <path d="M 210 422.5 A 40 40 0 0 1 290 422.5" stroke="black" fill="none" strokeWidth={2} />

      {/* Three Point Lines */}
      <line x1={30} y1={330} x2={30} y2={470} stroke="black" strokeWidth={2} />
      <line x1={470} y1={330} x2={470} y2={470} stroke="black" strokeWidth={2} />
      <path d="M 30 330 A 237.5 237.5 0 0 1 470 330" stroke="black" fill="none" strokeWidth={2} />

      {/* Center Court */}
      <path d="M 190 0 A 60 60 0 0 1 310 0" stroke="black" fill="none" strokeWidth={2} />
      <path d="M 190 0 A 60 60 0 0 0 310 0" stroke="black" fill="none" strokeWidth={2} />
    </Layer>
  );
};

const Court = ({ shots }) => {
  const totalShots = shots.length;
  const madeShots = shots.filter(s => s.SHOT_MADE).length;
  const fgPercentage = totalShots > 0 ? ((madeShots / totalShots) * 100).toFixed(1) : "0.0";

  const totalTwos = shots.filter(s => s.SHOT_TYPE === "2PT Field Goal").length;
  const madeTwos = shots.filter(s => (s.SHOT_TYPE === "2PT Field Goal") & s.SHOT_MADE).length;
  const twosPercentage = totalTwos > 0 ? ((madeTwos / totalTwos) * 100).toFixed(1) : "0.0";

  const totalThrees = shots.filter(s => s.SHOT_TYPE === "3PT Field Goal").length;
  const madeThrees = shots.filter(s => (s.SHOT_TYPE === "3PT Field Goal") & s.SHOT_MADE).length;
  const threesPercentage = totalThrees > 0 ? ((madeThrees / totalThrees) * 100).toFixed(1) : "0.0";

console.log(shots.filter(s => s.SHOT_TYPE === "2PT Field Goal"))

  return (
    <div className="court-container">
      <h2 style={{ textAlign: "center" }}>Clutch Shot Chart</h2>
      <p style={{ textAlign: "center" }}>{`Shooting Percentage: ${fgPercentage}% (${madeShots}/${totalShots})`}</p>
      <p style={{ textAlign: "center" }}>{`Twos Percentage: ${twosPercentage}% (${madeTwos}/${totalTwos})`}</p>
      <p style={{ textAlign: "center" }}>{`Threes Percentage: ${threesPercentage}% (${madeThrees}/${totalThrees})`}</p>
      <ResponsiveContainer width={500} height={470}>
        <ScatterChart>
          <XAxis type="number" dataKey="LOC_X" domain={[0, 500]} hide />
          <YAxis type="number" dataKey="LOC_Y" domain={[0, 470]} hide />
          <ZAxis type="number" range={[100]} />
          <Tooltip
            content={({ payload }) => {
              if (!payload || !payload.length) return null;
              const shot = payload[0].payload;
              return (
                <div className="tooltip">
                  <p><strong>{shot.ACTION_TYPE}</strong></p>
                </div>
              );
            }}
          />

          <CourtLines />
          <Scatter
            name="Shots"
            data={shots}
            shape={(props) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={shotColor(payload.SHOT_MADE)}
                  stroke="#000"
                  strokeWidth={0.5}
                />
              );
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

const ShotChart = () => {
  const [rawShots, setRawShots] = useState([]);
  const [shots, setShots] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [periodFilter, setPeriodFilter] = useState("All");

  useEffect(() => {
    fetch("/clutch_shots_full.json")
      .then((res) => res.json())
      .then((data) => {
        const scale = 10;
        const normalized = data.map(s => ({
          ...s,
          LOC_X: s.LOC_X * scale + 250,
          LOC_Y: s.LOC_Y * scale
        }));

        setRawShots(normalized);

        const uniqueTeams = [...new Set(normalized.map(s => s.TEAM_NAME))];
        setTeams(uniqueTeams);
        const defaultTeam = uniqueTeams[0] || "";
        setSelectedTeam(defaultTeam);

        const teamPlayers = normalized.filter(s => s.TEAM_NAME === defaultTeam);
        const uniquePlayers = [...new Set(teamPlayers.map(s => s.PLAYER_NAME))];
        setPlayers(uniquePlayers);

        const defaultPlayerObj = teamPlayers.find(p => p.PLAYER_NAME === uniquePlayers[0]);
        setSelectedPlayer(defaultPlayerObj?.PLAYER_NAME || "");
        setSelectedPlayerId(defaultPlayerObj?.PLAYER_ID || "");
      });
  }, []);

  useEffect(() => {
    const filtered = rawShots.filter(s =>
      s.TEAM_NAME === selectedTeam &&
      s.PLAYER_NAME === selectedPlayer &&
      (periodFilter === "All" ||
        (periodFilter === "Q4" && s.QUARTER === 4) ||
        (periodFilter === "OT" && s.QUARTER > 4))
    );
    setShots(filtered);
  }, [rawShots, selectedTeam, selectedPlayer, periodFilter]);

  const handleTeamChange = (team) => {
    setSelectedTeam(team);

    const teamPlayers = rawShots.filter(s => s.TEAM_NAME === team);
    const playerList = [...new Set(teamPlayers.map(s => s.PLAYER_NAME))];
    setPlayers(playerList);

    const defaultPlayerObj = playerList.length > 0 ? teamPlayers.find(p => p.PLAYER_NAME === playerList[0]) : null;
    setSelectedPlayer(defaultPlayerObj?.PLAYER_NAME || "");
    setSelectedPlayerId(defaultPlayerObj?.PLAYER_ID || "");
  };

  const handlePlayerChange = (playerName) => {
    setSelectedPlayer(playerName);
    const playerObj = rawShots.find(p => p.PLAYER_NAME === playerName && p.TEAM_NAME === selectedTeam);
    if (playerObj) {
      setSelectedPlayerId(playerObj.PLAYER_ID);
    }
  };

  return (
    <div className="report-container">
      <div className="header">
        <h1>NBA Clutch Shot Visualization</h1>
        <p>This shot chart tracks all shots attempted by a certain player in the final 2 mins of the fourth quarter or during overtime.</p>
      </div>
      
      <div className="chart-container">
        <Court shots={shots} />

        <div className="filter-container">
          <Dropdown
            id="team-select"
            label="Select Team:"
            options={teams}
            value={selectedTeam}
            onChange={handleTeamChange}
          />
          
          <Dropdown
            id="player-select"
            label="Select Player:"
            options={players}
            value={selectedPlayer}
            onChange={handlePlayerChange}
          />

          <Dropdown
            id="period-select"
            label="Period:"
            options={["All", "Q4", "OT"]}
            value={periodFilter}
            onChange={setPeriodFilter}
          />
          {selectedPlayerId && (
          <PlayerHeadshot playerId={selectedPlayerId} playerName={selectedPlayer} />
        )}
      </div>
      </div>
    </div>
  );
};

export default ShotChart;