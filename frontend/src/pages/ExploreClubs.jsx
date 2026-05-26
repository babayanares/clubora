import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function ExploreClubs() {
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    api.get('/clubs').then((res) => setClubs(res.data.clubs)).catch(console.error);
  }, []);

  return (
    <div className="page">
      <h2>Explore Clubs</h2>
      {clubs.length === 0 ? (
        <p>No clubs yet. <Link to="/clubs/new">Create the first one!</Link></p>
      ) : (
        <ul>
          {clubs.map((club) => (
            <li key={club.id}>
              <Link to={`/clubs/${club.id}`}>{club.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
