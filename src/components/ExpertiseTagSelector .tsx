'use client';

import { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  SelectChangeEvent 
} from '@mui/material';

interface ExpertiseTagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  availableOptions?: string[];
  buttonColor?: string;
  buttonHoverColor?: string;
  maxSelections?: number;
}

const DEFAULT_EXPERTISE_OPTIONS = [
  'Orthodontics', 
  'Endodontics', 
  'Prosthodontics', 
  'Pediatric Dentistry', 
  'Oral Surgery', 
  'Periodontics', 
  'Cosmetic Dentistry', 
  'General Dentistry',
  'Implant Dentistry'
];

export default function ExpertiseTagSelector({
  selectedTags,
  onChange,
  availableOptions = DEFAULT_EXPERTISE_OPTIONS,
  buttonColor = '#3b82f6',
  buttonHoverColor = '#2563eb',
  maxSelections = 0, 
}: ExpertiseTagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string>('');

  useEffect(() => {
    setAvailableTags(availableOptions.filter(option => !selectedTags.includes(option)));
  }, [selectedTags, availableOptions]);

  const handleSelectionChange = (event: SelectChangeEvent<string>) => {
    setCurrentSelection(event.target.value as string);
  };

  const addTag = () => {
    if (currentSelection && !selectedTags.includes(currentSelection)) {
      if (maxSelections > 0 && selectedTags.length >= maxSelections) {
        return; 
      }
      
      const updatedTags = [...selectedTags, currentSelection];
      onChange(updatedTags);
      setCurrentSelection('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = selectedTags.filter(tag => tag !== tagToRemove);
    onChange(updatedTags);
  };

  const isAddDisabled = !currentSelection || (maxSelections > 0 && selectedTags.length >= maxSelections);

  return (
    <div>
      {/* Display selected tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedTags.map((tag) => (
          <div key={tag} className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
            <span className="text-gray-800">{tag}</span>
            <button 
              onClick={() => removeTag(tag)}
              className="ml-2 text-gray-500 hover:text-gray-700"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      {/* Selection controls */}
      <div className="flex gap-2">
        <FormControl variant="outlined" size="small" fullWidth>
          <InputLabel id="expertise-select-label">Select Expertise</InputLabel>
          <Select
            labelId="expertise-select-label"
            id="expertise-select"
            value={currentSelection}
            onChange={handleSelectionChange}
            label="Select Expertise"
            disabled={maxSelections > 0 && selectedTags.length >= maxSelections}
          >
            <MenuItem value="" disabled><em>Select an option</em></MenuItem>
            {availableTags.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button 
          variant="contained" 
          onClick={addTag}
          disabled={isAddDisabled}
          sx={{ 
            backgroundColor: '#4AA3BA', 
            '&:hover': {
                backgroundColor: '#3C8DA2',
            },
            minWidth: '80px',
            height: '40px'
          }}
        >
          Add
        </Button>
      </div>
      
      {/* Optional limit indicator */}
      {maxSelections > 0 && (
        <div className="text-sm text-gray-500 mt-2">
          {selectedTags.length} of {maxSelections} selected
        </div>
      )}
    </div>
  );
}