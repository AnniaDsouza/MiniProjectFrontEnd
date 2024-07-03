import React, { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useClipboard from "react-use-clipboard";
import "./ProductForm.css"; // Import the CSS file

const ProductForm = ({ categories, onSubmit, editProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [textToCopy, setTextToCopy] = useState('');
  const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });

  const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
  const { transcript, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (editProduct) {
      setSelectedCategory(editProduct.category);
      setProductName(editProduct.name);
      setExpiryDate(editProduct.expiryDate);
      setText(editProduct.text);
    }
  }, [editProduct]);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      processImage(file);
    }
  };

  const processImage = (image) => {
    setIsOcrProcessing(true);
    Tesseract.recognize(image, "eng", { logger: (m) => console.log(m) }).then(
      ({ data: { text } }) => {
        setProductName(text);
        setIsOcrProcessing(false);
        setIsCameraOpen(false);
      }
    );
  };

  const handleCaptureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      processImage(blob);
    });
  };

  const openCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const video = videoRef.current;
      video.srcObject = stream;
      video.play();
    });
    setIsCameraOpen(true);
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
    setProductName(transcript);
    resetTranscript();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const product = {
      id: editProduct ? editProduct.id : Date.now(),
      category: selectedCategory,
      name: productName,
      expiryDate,
      image,
      text,
    };
    onSubmit(product);
  };

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser does not support speech recognition.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-column">
        <label>
          Category:
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Product Name:
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </label>
        <label>
          Expiry Date:
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </label>
        <label>
          Upload Image:
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>
        <button type="button" onClick={openCamera}>
          Open Camera
        </button>
        {isCameraOpen && (
          <div className="camera-container">
            <video ref={videoRef} width="320" height="240" />
            <button type="button" onClick={handleCaptureImage}>
              Capture Image
            </button>
            <canvas
              ref={canvasRef}
              width="320"
              height="240"
              className="canvas-container"
            />
          </div>
        )}
        {isOcrProcessing && <p>Processing image...</p>}
        <div className="container">
          <div className="main-content" onClick={() => setTextToCopy(transcript)}>
            {transcript}
          </div>
          <div className="btn-style">
            <button type="button" onClick={startListening}>
              Start Listening
            </button>
            <button type="button" onClick={handleStopListening}>
              Stop Listening
            </button>
          </div>
        </div>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
};

export default ProductForm;
