// src/hooks/useBarcodeScanner.js
import { useState, useCallback, useEffect } from 'react';

const useBarcodeScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const startScanning = useCallback(async () => {
    try {
      setIsScanning(true);
      setError(null);
      // Simulate barcode scanning (integrate with actual barcode scanner library)
      const mockBarcode = Math.random().toString(36).substring(2, 10).toUpperCase();
      setTimeout(() => {
        setScannedData(mockBarcode);
        setIsScanning(false);
      }, 1000);
    } catch (err) {
      setError('Failed to start barcode scanner');
      setIsScanning(false);
    }
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    setScannedData(null);
  }, []);

  const clearScannedData = useCallback(() => {
    setScannedData(null);
  }, []);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    scannedData,
    isScanning,
    error,
    startScanning,
    stopScanning,
    clearScannedData
  };
};

export default useBarcodeScanner;