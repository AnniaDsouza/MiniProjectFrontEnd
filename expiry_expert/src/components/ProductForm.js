import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

const ProductForm = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [image, setImage] = useState(null);
  const [voice, setVoice] = useState(null);
  const [text, setText] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
    Tesseract.recognize(
      image,
      'eng',
      {
        logger: (m) => console.log(m),
      }
    ).then(({ data: { text } }) => {
      setOcrText(text);
      setIsOcrProcessing(false);
      setIsCameraOpen(false);
    });
  };

  const handleCaptureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
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

  const handleVoiceChange = (e) => {
    setVoice(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      category: selectedCategory,
      productName,
      expiryDate,
      image,
      voice,
      text: ocrText || text,
    });
    // Optionally, reset the form after submission
    setSelectedCategory('');
    setProductName('');
    setExpiryDate('');
    setImage(null);
    setVoice(null);
    setText('');
    setOcrText('');
  };

  return (
    <div className="product-form">
      <form onSubmit={handleSubmit}>
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
        <br />
        <label>
          Product Name:
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </label>
        <br />
        <label>
          Expiry Date:
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </label>
        <br />
        <label>
          Upload Image:
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>
        <br />
        <button type="button" onClick={openCamera}>
          Open Camera
        </button>
        {isCameraOpen && (
          <div>
            <video ref={videoRef} width="320" height="240" />
            <button type="button" onClick={handleCaptureImage}>
              Capture Image
            </button>
          </div>
        )}
        <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />
        {isOcrProcessing && <p>Processing image...</p>}
        {ocrText && (
          <div>
            <h3>Extracted Text:</h3>
            <p>{ocrText}</p>
          </div>
        )}
        <label>
          Upload Voice Note:
          <input
            type="file"
            accept="audio/*"
            onChange={handleVoiceChange}
          />
        </label>
        <br />
        <label>
          Text Note:
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ProductForm;
