import Navbar from '../components/Navbar';
import RemoveBackgroundForm from '../components/RemoveBackgoundForm';


const RemoveBackground = () => {
  return (
    <>
      <Navbar />
      <main className="container mx-auto mt-8">
        <RemoveBackgroundForm />
      </main>
    </>
  );
};

export default RemoveBackground;
