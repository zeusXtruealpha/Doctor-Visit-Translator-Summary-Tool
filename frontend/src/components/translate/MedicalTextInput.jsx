import React from 'react';

const MedicalTextInput = ({ value, onChange, disabled }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const characterCount = value.length;
  const maxLength = 5000;

  return (
    <div className="card">
      <label htmlFor="medicalText" className="block elderly-text font-medium text-gray-700 mb-3">
        Enter Medical Text
      </label>
      
      <textarea
        id="medicalText"
        name="medicalText"
        rows={8}
        maxLength={maxLength}
        disabled={disabled}
        className="w-full px-4 py-3 text-elderly border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 transition-colors resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="Paste your doctor's notes, prescription details, or medical instructions here. For example:

'Take 2 tablets of paracetamol 500mg twice daily after meals for fever and headache. Apply ice pack on swollen area for 15 minutes every 2 hours. Avoid alcohol and spicy food. Return if symptoms persist after 3 days.'"
        value={value}
        onChange={handleChange}
      />
      
      <div className="mt-2 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Minimum 10 characters required
        </p>
        <p className={`text-sm ${characterCount > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
          {characterCount}/{maxLength}
        </p>
      </div>

      {characterCount > 0 && characterCount < 10 && (
        <p className="mt-1 text-sm text-red-500">
          Please enter at least 10 characters
        </p>
      )}
    </div>
  );
};

export default MedicalTextInput;