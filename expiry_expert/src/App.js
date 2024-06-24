import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ProductForm from './components/ProductForm';
import './App.css';

const App = () => {
  const [categories, setCategories] = useState(['Food', 'Medicine', 'Cosmetics','Others']);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleAddClick = () => {
    setIsFormVisible(true);
  };

  const handleCategoryEdit = (oldCategory, newCategoryName) => {
    setCategories(categories.map((cat) => (cat === oldCategory ? newCategoryName : cat)));
  };

  return (
    <div className="App">
      <header>
        <h1 className="gradient-text">Expiry Expert</h1>
      </header>
      <Navbar categories={categories} onCategoryEdit={handleCategoryEdit} />
      {isFormVisible && <ProductForm categories={categories} />}
      <button className="floating-button" onClick={handleAddClick}>
        Add
      </button>
    </div>
  );
};

export default App;
