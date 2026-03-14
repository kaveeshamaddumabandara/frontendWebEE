// Example usage of ImageUpload component in a form

import { useState } from 'react';
import { ImageUpload } from '../components/ImageUpload';

export function ExampleImageUploadForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileImage: '',
  });

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      profileImage: imageUrl,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data with image:', formData);
    // Submit formData to your API
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <ImageUpload
        onImageUploaded={handleImageUploaded}
        currentImage={formData.profileImage}
        label="Profile Picture"
      />

      <button
        type="submit"
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Submit
      </button>
    </form>
  );
}
