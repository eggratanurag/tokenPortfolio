import * as React from "react"
import { Button as StyledButton } from "@/components/reusableComponents/button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react";

// Holdings input component
const HoldingsInput = ({ value, onSave, tokenId, isEditing, setIsEditing, inputRef }: { 
  value: number; 
  onSave: (tokenId: string, holdings: number) => void;
  tokenId: string;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) => {
  const [inputValue, setInputValue] = React.useState(value.toString());

  const handleSave = () => {
    const numValue = parseFloat(inputValue) || 0;
    onSave(tokenId, numValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue(value.toString());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center  gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          className="!w-40 h-8 text-sm"
          autoFocus
          type="number"
          step="0.000001"
          min="0"
        />
        <StyledButton
          onClick={handleSave}
          className="h-8 px-3 text-xs flex-shrink-0"
        >
          Save
        </StyledButton>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded"
      onClick={() => setIsEditing(true)}
    >
      {value > 0 ? value.toFixed(6).replace(/\.?0+$/, '') : '0'}
    </div>
  );
};

export default HoldingsInput;
