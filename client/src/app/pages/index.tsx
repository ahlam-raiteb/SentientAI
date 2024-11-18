import Navbar from '../components/Navbar';
import UploadForm from '../components/UploadForm';

const Home = () => {
  return (
    <>
      <Navbar />
      <main className="container mx-auto mt-8">
        <UploadForm />
      </main>
    </>
  );
};

export default Home;
