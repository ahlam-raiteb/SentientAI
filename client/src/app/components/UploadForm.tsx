"use client";
import { useState } from "react";
import Image from "next/image";

interface Tag {
  _data: {
    confidence: number;
    name: string;
  };
}

const UploadForm = () => {
  const [image, setImage] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [caption, setCaption] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<string>("detect-objects");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setResultImage(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);
    formData.append("type", analysisType);

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/analyse_image", {
        method: "POST",
        body: formData,
      });

      if (response.status === 200) {
        const data = await response.json();

        console.log("data << : >> ", data);

        if (data.tags && data.tags._data && data.tags._data.values) {
          setTags(data.tags._data.values);
        }

        if (data.caption && data.caption._data) {
          setCaption([data.caption._data.text]);
        }

        if (data.image_url) {
          const uniqueUrl = `${data.image_url}?t=${new Date().getTime()}`;
          setResultImage(uniqueUrl);
        } else {
          alert("Image processing failed");
        }
      } else {
        alert("Image analysis failed with status: " + response.status);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("An error occurred while analyzing the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-[15px] lg:text-xl font-bold mb-4">
        Upload Image for Analysis
      </h2>
      <input type="file" onChange={handleUpload} className="mb-4" accept="image/*" />

      <div className="flex gap-4 mb-4 ">
        <button
          onClick={() => setAnalysisType("detect-people")}
          className={`px-2 py-1 rounded ${
            analysisType === "detect-people" ? "bg-blue-600 text-white" : "bg-gray-300"
          } text-[12px] md:text-[14px]`}
        >
          Detect Objects
        </button>
        <button
          onClick={() => setAnalysisType("detect-objects")}
          className={`px-2 py-1 rounded ${
            analysisType === "detect-objects" ? "bg-blue-600 text-white" : "bg-gray-300"
          } text-[12px] md:text-[14px]`}
        >
          Detect People
        </button>
      </div>

      <button
        onClick={analyzeImage}
        className="flex bg-blue-500 text-white px-2 py-1 rounded text-[12px] md:text-[14px] self-end"
        disabled={loading || !image}
      >
        {loading ? "Analyzing..." : "Analyze Image"}
      </button>

      {resultImage && (
        <div className="mt-6">
          <h3 className="font-bold">Analyzed Image:</h3>
          <div className="flex relative w-full max-w-md mx-auto">
            <Image
              src={resultImage}
              alt="Analyzed"
              layout="responsive"
              width={16}
              height={9}
              className="rounded-lg border"
            />
          </div>
          <h3 className="font-bold p-2">Tags:</h3>
          {tags.map((tag, index) => (
            <div key={index}>
              <>Tag: {tag._data.name} </> 
              <>(confidence: {tag._data.confidence * 100}%)</>
            </div>
          ))}
          <h3 className="font-bold p-2">Caption:</h3>
          {caption.map((capt, index) => (
            <p key={index}>{capt}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadForm;



