import React from "react";
import "./PlayerHeadshot.scss";

const PlayerHeadshot = ({ playerId, playerName }) => {
  return (
    <div className="headshot-container">
      <img
        src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`}
        alt={playerName}
        className="headshot-image"
      />
      <div className="player-name">
        {playerName}
      </div>
    </div>
  );
};

export default PlayerHeadshot;
