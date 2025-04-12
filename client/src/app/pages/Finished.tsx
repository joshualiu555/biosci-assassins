import { useLocation, useNavigate } from 'react-router-dom';

const Finished = () => {
  const { state } = useLocation();
  const navigate = useNavigate()

  return (
    <div>
      <h1>{state.data.result}</h1>
      <h2>Assassins:</h2>
      {state.data.players.map((player: {
        playerID: string,
        name: string,
        role: string
      }) => (
          player.role === "assassin" ?
            <p key={player.playerID}>{player.name}</p>
              :
            null
      ))}
      <button onClick={() => navigate("/")}>Go back to home</button>
    </div>
  );
};

export default Finished;
