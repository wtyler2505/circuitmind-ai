import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import { bomService, BOMReport } from '../../services/bomService';
import { fetchPartDetails } from '../../services/geminiService';
import { useDiagram } from '../../contexts/DiagramContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useToast } from '../../hooks/useToast';

interface BOMModalProps {
  onClose: () => void;
}

export const BOMModal: React.FC<BOMModalProps> = ({ onClose }) => {
  const { diagram } = useDiagram();
  const { inventory } = useInventory();
  const toast = useToast();

  const [report, setReport] = useState<BOMReport | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);

  useEffect(() => {
    if (diagram) {
      const initialReport = bomService.generateBOM(diagram, inventory);
      setReport(initialReport);
    }
  }, [diagram, inventory]);

  const handleEnrich = async () => {
    if (!report) return;
    setIsEnriching(true);
    try {
      const details = await fetchPartDetails(report.items);
      const enrichedItems = report.items.map(item => {
        const found = details.find(d => d.name === item.name);
        return found ? { ...item, ...found } : item;
      });
      
      const totalEstimatedCost = enrichedItems.reduce((acc, item) => acc + (item.estimatedPrice || 0) * item.quantity, 0);
      
      setReport({
        ...report,
        items: enrichedItems,
        totalEstimatedCost
      });
      toast.success('BOM enriched with market data.');
    } catch (_e) {
      toast.error('Enrichment failed.');
    } finally {
      setIsEnriching(false);
    }
  };

  const exportCSV = () => {
    if (!report) return;
    const csv = Papa.unparse(report.items);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `BOM_${diagram?.title || 'project'}.csv`;
    link.click();
  };

  const exportPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.setFont('courier');
    doc.setTextColor(0, 243, 255); // neon cyan
    doc.setFillColor(5, 5, 8); // cyber black
    doc.rect(0, 0, 210, 297, 'F');

    doc.text('=== BILL OF MATERIALS ===', 10, 10);
    doc.text(`PROJECT: ${diagram?.title || 'UNKNOWN'}`, 10, 20);
    doc.text(`TIMESTAMP: ${new Date(report.timestamp).toLocaleString()}`, 10, 30);
    doc.text('--------------------------------------------------', 10, 40);

    doc.setTextColor(255, 255, 255);
    report.items.forEach((item, i) => {
      const y = 50 + i * 15;
      doc.text(`${item.quantity}x ${item.name}`, 10, y);
      doc.setFontSize(8);
      doc.text(`MPN: ${item.mpn || 'N/A'} | Price: $${item.estimatedPrice || '0.00'}`, 15, y + 5);
      doc.setFontSize(10);
    });

    doc.setTextColor(0, 255, 157); // neon green
    doc.text(`TOTAL ESTIMATED COST: $${report.totalEstimatedCost.toFixed(2)}`, 10, 50 + report.items.length * 15 + 10);

    doc.save(`BOM_${diagram?.title || 'project'}.pdf`);
  };

  if (!report) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-4xl h-[80vh] flex flex-col cut-corner-md shadow-2xl panel-frame">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
          <h2 className="text-sm font-bold text-white uppercase tracking-[0.3em] panel-title">
            <span className="text-neon-cyan">Project</span>_BOM_Manifest
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 p-3 cut-corner-sm">
              <span className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Total Items</span>
              <span className="text-xl font-mono text-neon-cyan">{report.items.length}</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 cut-corner-sm">
              <span className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Est. Cost</span>
              <span className="text-xl font-mono text-neon-green">${report.totalEstimatedCost.toFixed(2)}</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 cut-corner-sm flex items-center justify-center">
              <button 
                onClick={handleEnrich}
                disabled={isEnriching}
                className="px-4 py-2 bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-[10px] font-bold uppercase tracking-widest hover:bg-neon-purple/20 transition-all disabled:opacity-50"
              >
                {isEnriching ? 'Scanning...' : 'Enrich with AI'}
              </button>
            </div>
          </div>

          <table className="w-full text-left font-mono text-[11px]">
            <thead className="text-slate-500 border-b border-white/5">
              <tr>
                <th className="pb-2">QUANTITY</th>
                <th className="pb-2">PART NAME</th>
                <th className="pb-2">MPN</th>
                <th className="pb-2">STOCK</th>
                <th className="pb-2 text-right">UNIT PRICE</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {report.items.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 text-neon-cyan font-bold">{item.quantity}x</td>
                  <td className="py-3">
                    <div className="font-bold text-white">{item.name}</div>
                    <div className="text-[9px] text-slate-500 uppercase">{item.type}</div>
                  </td>
                  <td className="py-3 text-slate-400">{item.mpn || '---'}</td>
                  <td className="py-3">
                    <span className={item.currentStock < item.quantity ? 'text-amber-500' : 'text-slate-500'}>
                      {item.currentStock} in inventory
                    </span>
                  </td>
                  <td className="py-3 text-right text-neon-green">${item.estimatedPrice?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-900/50 flex items-center justify-between">
          <div className="text-[9px] text-slate-500 font-mono italic">
            * Prices are AI-estimated and for reference only.
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportCSV}
              className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-all"
            >
              Export CSV
            </button>
            <button 
              onClick={exportPDF}
              className="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-bold uppercase tracking-widest hover:bg-neon-cyan/20 transition-all"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
