// src/components/Categories/CategoryManager.js
import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await categoryAPI.create(formData);
      setShowForm(false);
      setFormData({ name: '', description: '', parent: '', is_active: true });
      fetchCategories