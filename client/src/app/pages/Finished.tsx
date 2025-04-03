import { useLocation, useNavigate } from 'react-router-dom';

const Finished = () => {
  const { state } = useLocation();
  const navigate = useNavigate()

  return (
    <div>
      <p>{state.data.result}</p>
      <button onClick={() => navigate("/")}>Go back to home</button>
    </div>
  );
};

export default Finished;
