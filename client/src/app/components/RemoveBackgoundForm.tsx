import { useState } from 'react';
import Image from 'next/image';

const RemoveBackgroundForm = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);

  const removeBackground = async () => {
    const response = await fetch('http://127.0.0.1:5000/remove-background', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl }),
    });

    const data = await response.json();
    setResult(data.output_file || null);
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Remove Background</h2>
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Enter Image URL"
        className="border border-gray-300 rounded p-2 w-full mb-4"
      />
      <button
        onClick={removeBackground}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Remove Background
      </button>
      {result && (
        <div className="mt-4">
          <h3 className="font-bold">Result:</h3>
          <Image 
            width={190}
            height={190}
            src={`http://127.0.0.1:5000/${result}`} 
            alt="Result" 
            className="mt-2"  />
        </div>
      )}
    </div>
  );
};

export default RemoveBackgroundForm;
