import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between">
        <h1 className="text-white text-lg font-bold">Image Processing App</h1>
        <div className="space-x-4">
          <Link href="/" className="text-white hover:underline">Analyse Image</Link>
          <Link href="/Text" className="text-white hover:underline">Analyse Text</Link>
          <Link href="/Speesh" className="text-white hover:underline">Speesh</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
