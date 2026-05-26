import { useParams } from 'react-router-dom';

export default function ClubDetails() {
  const { id } = useParams();

  return (
    <div className="page">
      <h2>Club Details</h2>
      <p>Club ID: {id} — details coming soon.</p>
    </div>
  );
}
