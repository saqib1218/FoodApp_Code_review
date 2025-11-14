import React, { useState } from 'react';
import { UserCircleIcon, BellIcon, ShieldCheckIcon, CogIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@riwayat.pk',
    phone: '+92 300 1234567',
    role: 'Administrator',
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: true,
    sessionTimeout: '30'
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This would be replaced with an API call in production
    console.log('Settings updated:', formData);
    // Show success message
    alert('Settings updated successfully!');
  };

  return (
    <div className="p-6 text-center text-neutral-600">Working on it...</div>
  );
};

export default Settings;
