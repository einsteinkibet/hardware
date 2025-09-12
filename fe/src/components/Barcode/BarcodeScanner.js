// src/components/Barcode/BarcodeScanner.js
import React, { useState, useEffect, useRef } from 'react';
import { barcodeAPI, productAPI } from '../../services/api';

const BarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedProducts, setScannedProducts] = useState([]);
  const [manualBarcode, setManualBarcode] = useState('');
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setScanning(true);
      
      // Simulate barcode scanning (in real app, use a barcode scanning library)
      setTimeout(() => {
        simulateBarcodeScan();
      }, 2000);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Cannot access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanning(false);
  };

  const simulateBarcodeScan = () => {
    // Simulate finding a barcode
    const simulatedBarcode = '1234567890123';
    handleBarcodeScan(simulatedBarcode);
  };

  const handleBarcodeScan = async (barcode) => {
    try {
      // Log the scan
      await barcodeAPI.create({
        barcode: barcode,
        scan_type: 'sale',
        location: 'POS Station 1'
      });

      // Look up product
      const response = await barcodeAPI.lookup(barcode);
      const product = response.data;
      
      if (product) {
        setScannedProducts(prev => [...prev, { ...product, scannedAt: new Date() }]);
      } else {
        alert('Product not found for barcode: ' + barcode);
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
      alert('Error scanning barcode: ' + error.message);
    }
  };

  const handleManualBarcodeSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleBarcodeScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const clearScannedProducts = () => {
    setScannedProducts([]);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Barcode Scanner</h1>
        <div className="btn-group">
          <button 
            className={`btn ${scanning ? 'btn-danger' : 'btn-success'}`}
            onClick={scanning ? stopScanning : startScanning}
          >
            <i className={`fas ${scanning ? 'fa-stop' : 'fa-camera'} me-2`}></i>
            {scanning ? 'Stop Scanning' : 'Start Scanning'}
          </button>
          <button className="btn btn-outline-secondary" onClick={clearScannedProducts}>
            <i className="fas fa-trash me-2"></i>Clear
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          {/* Camera Feed */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Scanner</h5>
            </div>
            <div className="card-body text-center">
              {scanning ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxWidth: '400px', border: '2px solid #007bff', borderRadius: '8px' }}
                />
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-camera fa-3x text-muted mb-3"></i>
                  <p className="text-muted">Camera not active. Click "Start Scanning" to begin.</p>
                </div>
              )}
            </div>
          </div>

          {/* Manual Barcode Entry */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Manual Barcode Entry</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleManualBarcodeSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter barcode manually"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          {/* Scanned Products */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Scanned Products ({scannedProducts.length})</h5>
            </div>
            <div className="card-body">
              {scannedProducts.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-barcode fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No products scanned yet</p>
                </div>
              ) : (
                <div className="list-group">
                  {scannedProducts.map((product, index) => (
                    <div key={index} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{product.name}</h6>
                          <small className="text-muted">SKU: {product.sku} | Barcode: {product.barcode}</small>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold">${product.price}</div>
                          <small className="text-muted">
                            {new Date(product.scannedAt).toLocaleTimeString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;