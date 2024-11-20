"use client";
import { useState } from 'react';
import Image from 'next/image';

// interface ObjectData {
//   label: string;
//   confidence: number;
//   bbox: [number, number, number, number];
// }

const UploadForm = () => {
  const [image, setImage] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  // const [objects, setObjects] = useState<ObjectData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<string>('detect-objects'); // Default to 'detect-objects'

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setResultImage(null); // Reset previous results
      // setObjects(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append('image', image);
    formData.append('type', analysisType); // Pass the selected analysis type to the backend

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/analyse_image', {
        method: 'POST',
        body: formData
      });
    
      if (response.status === 200) {
        const data = await response.json(); // Correctly wait for the response to be parsed as JSON
    
        if (data.image_url) {
          // Display the image using the URL returned
          const imageElement = document.createElement('img');
          imageElement.src = data.image_url;
          document.body.appendChild(imageElement);
    
          setResultImage(data.image_url);
          // setObjects(data.objects || []);
        } else {
          alert('Image processing failed');
        }
      } else {
        alert('Image analysis failed with status: ' + response.status);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('An error occurred while analyzing the image.');
    } finally {
      setLoading(false);
    }
  }    

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload Image for Analysis</h2>
      <input type="file" onChange={handleUpload} className="mb-4" accept="image/*" />

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setAnalysisType('detect-people')}
          className={`px-4 py-2 rounded ${
            analysisType === 'detect-people' ? 'bg-blue-600 text-white' : 'bg-gray-300'
          }`}
        >
          Detect People
        </button>
        <button
          onClick={() => setAnalysisType('detect-objects')}
          className={`px-4 py-2 rounded ${
            analysisType === 'detect-objects' ? 'bg-blue-600 text-white' : 'bg-gray-300'
          }`}
        >
          Detect Objects
        </button>
        <button
          onClick={() => setAnalysisType('remove-background')}
          className={`px-4 py-2 rounded ${
            analysisType === 'remove-background' ? 'bg-blue-600 text-white' : 'bg-gray-300'
          }`}
        >
          Remove Background
        </button>
      </div>

      <button
        onClick={analyzeImage}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading || !image}
      >
        {loading ? 'Analyzing...' : 'Analyze Image'}
      </button>
      {resultImage && (
        <div className="mt-6">
          <h3 className="font-bold">Analyzed Image:</h3>
          <Image src={resultImage} alt="Analyzed" className="max-w-full border rounded-lg" />
        </div>
)
      }

      {/* {objects && analysisType !== 'remove-background' && (
        <div className="mt-4">
          <h3 className="font-bold">Detected Objects:</h3>
          <ul className="list-disc list-inside">
            {objects.map((obj, idx) => (
              <li key={idx}>
                <strong>{obj.label}</strong>: {Math.round(obj.confidence * 100)}%
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
};

export default UploadForm;
