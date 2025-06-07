import { useEffect, useRef } from 'react';
import { formatColumnName } from './ReportStyles';

const ColumnSelector = ({ 
  onClose, 
  visibleColumns, 
  setVisibleColumns 
}) => {
  const modalRef = useRef(null);
  
  // Handle clicks outside modal to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
      document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Handle column toggle
  const toggleColumn = (columnName) => {
    setVisibleColumns({
      ...visibleColumns,
      [columnName]: !visibleColumns[columnName]
    });
  };
  
  // Select/Deselect all columns
  const toggleAllColumns = (value) => {
    const updatedColumns = {};
    Object.keys(visibleColumns).forEach(column => {
      updatedColumns[column] = value;
    });
    setVisibleColumns(updatedColumns);
  };
  
  // Count visible columns
  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef} 
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Customize Columns</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">
              {visibleCount} of {Object.keys(visibleColumns).length} columns selected
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={() => toggleAllColumns(true)}
                className="px-2 py-1 text-xs rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              >
                Select All
              </button>
              <button 
                onClick={() => toggleAllColumns(false)}
                className="px-2 py-1 text-xs rounded bg-gray-50 text-gray-600 hover:bg-gray-100"
              >
                Deselect All
              </button>
            </div>
          </div>
          
          <div className="h-[300px] overflow-y-auto border border-gray-200 rounded-md p-2">
            <ul className="divide-y divide-gray-200">
              {Object.keys(visibleColumns).sort().map(column => (
                <li key={column} className="py-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns[column]}
                      onChange={() => toggleColumn(column)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      {formatColumnName(column)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnSelector; 