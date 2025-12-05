import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import './ProductDetail.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${slug}/`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading page-content">Loading...</div>;
  if (!product) return <div className="loading page-content">Product not found</div>;

  return (
    <div className="product-detail page-content">
      <div className="container">
        <div className="detail-grid glass-effect">
          <div className="detail-image">
            {product.image && <img src={product.image} alt={product.name} />}
          </div>
          
          <div className="detail-info">
            <h1>{product.name}</h1>
            <p className="detail-category">{product.category_name}</p>
            <p className="detail-price">${product.final_price}</p>
            {product.discount_price && (
              <p className="original-price">${product.price}</p>
            )}
            <p className="detail-description">{product.description}</p>
            <p className="stock-info">Stock: {product.stock} units</p>
            <button className="btn-primary">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
