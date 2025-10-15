import React, { useState, useEffect } from "react";
import { IoClose, IoCheckmark } from "react-icons/io5";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { fetchAllTables, updateTableCount } from "../../../shared/services/Tables";

interface EditTablesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string | null;
  onTablesUpdated: () => void;
}

const EditTablesOverlay: React.FC<EditTablesOverlayProps> = ({
  isOpen,
  onClose,
  organizationId,
  onTablesUpdated
}) => {
  const [currentTableCount, setCurrentTableCount] = useState<number>(0);
  const [targetTableCount, setTargetTableCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load current table count when overlay opens
  useEffect(() => {
    if (isOpen && organizationId) {
      loadCurrentTableCount();
    }
  }, [isOpen, organizationId]);

  const loadCurrentTableCount = async () => {
    if (!organizationId) return;
    
    try {
      setIsLoading(true);
      const tables = await fetchAllTables(organizationId);
      setCurrentTableCount(tables.length);
      setTargetTableCount(tables.length);
    } catch (error) {
      console.error("Failed to load table count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncrement = () => {
    setTargetTableCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (targetTableCount > 0) {
      setTargetTableCount(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    if (!organizationId) return;
    
    try {
      setIsSaving(true);
      await updateTableCount(organizationId, targetTableCount);
      onTablesUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update table count:", error);
      alert("Failed to update table count. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setTargetTableCount(currentTableCount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
         style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}>
      <div className="bg-white rounded-3 p-4 shadow-lg" style={{ minWidth: "400px", maxWidth: "500px" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Edit Tables</h4>
          <button 
            className="btn border-0 bg-transparent" 
            onClick={handleClose}
            disabled={isSaving}
          >
            <IoClose style={{ fontSize: "24px", color: "#999" }} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-muted mb-3">
            Adjust the number of tables for your organization.
          </p>
          
          {isLoading ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-center gap-3">
              {/* Decrement Button */}
              <button
                className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "50px", height: "50px" }}
                onClick={handleDecrement}
                disabled={targetTableCount <= 0 || isSaving}
              >
                <FaMinus />
              </button>

              {/* Table Count Display */}
              <div className="text-center" style={{ minWidth: "120px" }}>
                <div className="fs-1 fw-bold">{targetTableCount}</div>
                <div className="text-muted small">Tables</div>
              </div>

              {/* Increment Button */}
              <button
                className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "50px", height: "50px" }}
                onClick={handleIncrement}
                disabled={isSaving}
              >
                <FaPlus />
              </button>
            </div>
          )}

          {/* Current tables */}
          {!isLoading && (
            <div className="mt-3 p-3 bg-light rounded d-flex align-content-center justify-content-center">
              <div className="small text-muted fw-bold">
                <div>Currently: {currentTableCount}</div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-outline-secondary"
            onClick={handleClose}
            disabled={isSaving}
          >
            Close
          </button>
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleSave}
            disabled={isSaving || isLoading || currentTableCount === targetTableCount}
          >
            {isSaving ? (
              <>
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Saving...</span>
                </div>
                Saving...
              </>
            ) : (
              <>
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTablesOverlay;
