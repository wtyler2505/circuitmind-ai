import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  inventoryApi,
  type Location,
} from '../../services/inventoryApiClient';

interface LocationNodeProps {
  location: Location;
  depth: number;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
  onAddChild: (parentId: string) => void;
  onShowQR: (location: Location) => void;
}

const LocationNode: React.FC<LocationNodeProps> = ({
  location,
  depth,
  onEdit,
  onDelete,
  onAddChild,
  onShowQR,
}) => {
  const [expanded, setExpanded] = useState(depth < 2);

  const hasChildren = location.children && location.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 px-3 py-2 hover:bg-[#14142a] rounded-lg group transition-colors"
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-slate-300 transition-colors ${hasChildren ? '' : 'invisible'}`}
          aria-label={expanded ? 'Collapse' : 'Expand'}
          aria-expanded={expanded}
        >
          <svg
            className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Location icon */}
        <svg className="w-4 h-4 text-cyan-500/60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>

        {/* Name and description */}
        <div className="flex-1 min-w-0">
          <span className="text-sm text-slate-200">{location.name}</span>
          {location.description && (
            <span className="text-[10px] text-slate-500 ml-2">{location.description}</span>
          )}
        </div>

        {/* Path */}
        <span className="text-[9px] text-slate-600 font-mono hidden md:block">
          {location.path}
        </span>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onShowQR(location)}
            className="p-1 rounded text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            aria-label={`Show QR code for ${location.name}`}
            title="Show QR code"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
          <button
            onClick={() => onAddChild(location.id)}
            className="p-1 rounded text-slate-500 hover:text-green-400 hover:bg-green-500/10 transition-colors"
            aria-label={`Add child location under ${location.name}`}
            title="Add child location"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(location)}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-[#1a1a2e] transition-colors"
            aria-label={`Edit ${location.name}`}
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(location)}
            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label={`Delete ${location.name}`}
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Children */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {location.children!.map((child) => (
              <LocationNode
                key={child.id}
                location={child}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onShowQR={onShowQR}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// QR Code modal
interface QRModalProps {
  location: Location;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ location, onClose }) => {
  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = document.getElementById('qr-code-svg');
    const svgData = svg ? svg.outerHTML : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>QR Code - ${location.name}</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 40px; }
          h2 { margin-bottom: 8px; }
          p { color: #666; margin-bottom: 24px; }
        </style></head>
        <body>
          <h2>${location.name}</h2>
          <p>${location.path}</p>
          ${svgData}
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [location]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`QR code for ${location.name}`}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-[#0f0f1a] border border-[#1a1a2e] rounded-xl p-6 w-full max-w-xs text-center"
      >
        <h3 className="text-sm font-semibold text-slate-100 mb-1">{location.name}</h3>
        <p className="text-[10px] text-slate-500 mb-4 font-mono">{location.path}</p>

        <div className="bg-white rounded-lg p-4 inline-block mb-4" id="qr-code-svg">
          <QRCodeSVG
            value={`circuitmind://location/${location.id}`}
            size={160}
            level="M"
          />
        </div>

        <p className="text-[9px] text-slate-600 mb-4 font-mono break-all">
          circuitmind://location/{location.id}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-lg transition-colors"
          >
            Print QR
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 bg-[#0a0a12] border border-[#1a1a2e] text-slate-400 hover:text-slate-200 text-xs rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Add/Edit location form modal
interface LocationFormProps {
  parentId: string | null;
  editLocation?: Location | null;
  onClose: () => void;
  onSaved: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ parentId, editLocation, onClose, onSaved }) => {
  const [name, setName] = useState(editLocation?.name || '');
  const [description, setDescription] = useState(editLocation?.description || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      if (editLocation) {
        await inventoryApi.updateLocation(editLocation.id, {
          name: name.trim(),
          description: description.trim(),
        });
      } else {
        await inventoryApi.createLocation({
          parentId,
          name: name.trim(),
          description: description.trim(),
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save location');
    } finally {
      setSubmitting(false);
    }
  }, [name, description, parentId, editLocation, onSaved]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={editLocation ? 'Edit location' : 'Add location'}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-[#0f0f1a] border border-[#1a1a2e] rounded-xl w-full max-w-sm mx-4"
      >
        <div className="px-5 py-4 border-b border-[#1a1a2e]">
          <h3 className="text-sm font-semibold text-slate-100">
            {editLocation ? 'Edit Location' : 'Add Location'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div>
            <label htmlFor="loc-name" className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 block mb-1">
              Name
            </label>
            <input
              id="loc-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Shelf A, Drawer 3"
              className="w-full bg-[#0a0a12] border border-[#1a1a2e] text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none placeholder:text-slate-600"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="loc-desc" className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500 block mb-1">
              Description (optional)
            </label>
            <input
              id="loc-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is stored here?"
              className="w-full bg-[#0a0a12] border border-[#1a1a2e] text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none placeholder:text-slate-600"
            />
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs" role="alert">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-[#0a0a12] border border-[#1a1a2e] text-slate-400 hover:text-slate-200 text-xs rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs rounded-lg transition-colors font-medium"
            >
              {submitting ? 'Saving...' : editLocation ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const LocationManager: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [qrLocation, setQrLocation] = useState<Location | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Location | null>(null);

  const loadLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const locs = await inventoryApi.listLocations();
      setLocations(locs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleAddRoot = useCallback(() => {
    setFormParentId(null);
    setEditingLocation(null);
    setShowForm(true);
  }, []);

  const handleAddChild = useCallback((parentId: string) => {
    setFormParentId(parentId);
    setEditingLocation(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((location: Location) => {
    setEditingLocation(location);
    setFormParentId(location.parentId);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((location: Location) => {
    setDeleteConfirm(location);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    try {
      await inventoryApi.deleteLocation(deleteConfirm.id);
      setDeleteConfirm(null);
      loadLocations();
    } catch {
      // Keep modal open on error
    }
  }, [deleteConfirm, loadLocations]);

  const handleFormSaved = useCallback(() => {
    setShowForm(false);
    setEditingLocation(null);
    loadLocations();
  }, [loadLocations]);

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        <div className="h-8 w-48 rounded bg-[#1a1a2e] animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-[#0a0a12] animate-pulse" style={{ marginLeft: `${(i % 3) * 20}px` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-slate-100">
          Storage Locations
        </h2>
        <button
          onClick={handleAddRoot}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Location
        </button>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs" role="alert">
          {error}
          <button onClick={loadLocations} className="ml-2 underline hover:text-red-300">
            Retry
          </button>
        </div>
      )}

      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg className="w-12 h-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-slate-500 text-sm">Create your first storage location</p>
          <p className="text-slate-600 text-xs mt-1">
            Organize where you keep your components
          </p>
        </div>
      ) : (
        <div className="bg-[#0a0a12]/50 border border-[#1a1a2e] rounded-xl">
          {locations.map((loc) => (
            <LocationNode
              key={loc.id}
              location={loc}
              depth={0}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddChild={handleAddChild}
              onShowQR={setQrLocation}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <LocationForm
            parentId={formParentId}
            editLocation={editingLocation}
            onClose={() => { setShowForm(false); setEditingLocation(null); }}
            onSaved={handleFormSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {qrLocation && (
          <QRModal
            location={qrLocation}
            onClose={() => setQrLocation(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm delete"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#0f0f1a] border border-[#1a1a2e] rounded-xl p-5 w-full max-w-xs"
            >
              <h3 className="text-sm font-semibold text-slate-100 mb-2">Delete Location</h3>
              <p className="text-xs text-slate-400 mb-4">
                Delete &ldquo;{deleteConfirm.name}&rdquo;? This will also remove all child locations.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-3 py-2 bg-[#0a0a12] border border-[#1a1a2e] text-slate-400 text-xs rounded-lg transition-colors hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationManager;
