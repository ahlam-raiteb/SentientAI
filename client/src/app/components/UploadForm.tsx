"use client";
import { useState } from 'react';
import Image from 'next/image';



const UploadForm = () => {
  const [image, setImage] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<string>('detect-objects'); 

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setResultImage(null);
    }
  };


  const analyzeImage = async () => {
    if (!image) return;
  
    const formData = new FormData();
    formData.append('image', image);
    formData.append('type', analysisType);
  
    setLoading(true);
  
    try {
      const response = await fetch('http://127.0.0.1:5000/analyse_image', {
        method: 'POST',
        body: formData,
      });
  
      if (response.status === 200) {
        const data = await response.json();
  
        console.log("data << : >> ", data);
        if (data.image_url) {
          const uniqueUrl = `${data.image_url}?t=${new Date().getTime()}`;
          setResultImage(uniqueUrl);
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
  };
  
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
            <div className="relative w-full max-w-md mx-auto">
              <Image
                src={resultImage}
                alt="Analyzed"
                layout="responsive"
                width={16} 
                height={9} 
                className="rounded-lg border"
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default UploadForm;
