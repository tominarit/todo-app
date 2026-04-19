import { useAuth, UserButton } from '@clerk/react';
import { Link } from 'react-router';

export default function Navbar() {
  const { isSignedIn } = useAuth()

  return (
    <nav className="flex items-center justify-between bg-gray-800 p-4 text-white">
      <Link to="/">
        <h1 className="text-xl font-bold">Todo App</h1>
      </Link>
      {isSignedIn && <UserButton />}
    </nav>
    
  )
};