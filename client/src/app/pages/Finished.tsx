import { useLocation, useNavigate } from 'react-router-dom';

const Finished = () => {
  const { state } = useLocation();
  const navigate = useNavigate()

  return (
    <div>
      <p>{state.data.result}</p>
      <p>Assassins:</p>
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
