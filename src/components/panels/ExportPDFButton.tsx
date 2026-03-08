import { useState } from 'react';
import { nodes, edges, interventions, chainSummary } from '@/data/causalData';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };

export default function ExportPDFButton() {
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const contentW = pageW - margin * 2;
      let y = margin;

      const addPage = () => { pdf.addPage(); y = margin; };
      const checkPage = (needed: number) => { if (y + needed > 270) addPage(); };

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(20, 184, 166);
      pdf.text('Atlas Causality Report', margin, y);
      y += 10;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(120, 120, 130);
      pdf.text(`Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
      y += 8;

      // Divider
      pdf.setDrawColor(60, 60, 70);
      pdf.line(margin, y, pageW - margin, y);
      y += 8;

      // Executive Summary
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(230, 230, 235);
      pdf.text('1. Executive Summary', margin, y);
      y += 7;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(170, 170, 180);
      const summaryLines = pdf.splitTextToSize(chainSummary, contentW);
      pdf.text(summaryLines, margin, y);
      y += summaryLines.length * 4.5 + 6;

      // Stats
      checkPage(20);
      pdf.setFillColor(30, 35, 45);
      pdf.roundedRect(margin, y, contentW, 14, 2, 2, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(20, 184, 166);
      const stats = [
        `${nodes.length} Factors`,
        `${edges.length} Causal Links`,
        `${nodes.filter(n => n.severity === 'critical').length} Critical`,
        `${nodes.filter(n => n.severity === 'high').length} High Risk`,
        `${interventions.length} Interventions`,
      ];
      const statW = contentW / stats.length;
      stats.forEach((s, i) => {
        pdf.text(s, margin + statW * i + statW / 2, y + 9, { align: 'center' });
      });
      y += 20;

      // Impact Ranking Table
      checkPage(40);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(230, 230, 235);
      pdf.text('2. Impact Ranking', margin, y);
      y += 8;

      // Table header
      const cols = [
        { label: 'Factor', x: margin, w: 55 },
        { label: 'Current Value', x: margin + 55, w: 45 },
        { label: 'Severity', x: margin + 100, w: 25 },
        { label: 'Confidence', x: margin + 125, w: 25 },
        { label: 'Score', x: margin + 150, w: 30 },
      ];
      pdf.setFillColor(25, 30, 40);
      pdf.roundedRect(margin, y, contentW, 7, 1, 1, 'F');
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(120, 120, 130);
      cols.forEach(c => pdf.text(c.label, c.x + 2, y + 5));
      y += 9;

      // Sorted rows
      const sortedNodes = [...nodes].sort((a, b) => {
        const scoreA = edges.filter(e => e.sourceId === a.id).reduce((s, e) => s + e.influenceStrength, 0);
        const scoreB = edges.filter(e => e.sourceId === b.id).reduce((s, e) => s + e.influenceStrength, 0);
        return scoreB - scoreA;
      });

      pdf.setFont('helvetica', 'normal');
      sortedNodes.forEach((node) => {
        checkPage(8);
        const score = edges.filter(e => e.sourceId === node.id).reduce((s, e) => s + e.influenceStrength, 0);
        pdf.setFontSize(8);
        pdf.setTextColor(200, 200, 210);
        pdf.text(node.label, cols[0].x + 2, y + 4);
        pdf.setTextColor(140, 140, 150);
        pdf.text((node.currentValue || '—').substring(0, 25), cols[1].x + 2, y + 4);

        // Severity color dot
        const sevColors: Record<string, [number, number, number]> = {
          critical: [220, 70, 70], high: [220, 140, 50], medium: [220, 180, 50], low: [70, 180, 100],
        };
        const sc = sevColors[node.severity] || [120, 120, 120];
        pdf.setFillColor(sc[0], sc[1], sc[2]);
        pdf.circle(cols[2].x + 4, y + 3, 1.5, 'F');
        pdf.setTextColor(sc[0], sc[1], sc[2]);
        pdf.text(node.severity, cols[2].x + 8, y + 4);

        pdf.setTextColor(140, 140, 150);
        pdf.text(node.confidence, cols[3].x + 2, y + 4);
        pdf.text(score.toFixed(2), cols[4].x + 2, y + 4);

        y += 7;
      });

      y += 6;

      // Causal Links
      checkPage(30);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(230, 230, 235);
      pdf.text('3. Key Causal Links', margin, y);
      y += 8;

      const topEdges = [...edges].sort((a, b) => b.influenceStrength - a.influenceStrength).slice(0, 10);
      topEdges.forEach(edge => {
        checkPage(10);
        const src = nodes.find(n => n.id === edge.sourceId);
        const tgt = nodes.find(n => n.id === edge.targetId);
        if (!src || !tgt) return;

        pdf.setFontSize(8);
        pdf.setTextColor(200, 200, 210);
        pdf.text(`${src.label} → ${tgt.label}`, margin + 2, y + 4);
        pdf.setTextColor(120, 120, 130);
        pdf.text(
          `${edge.polarity} | ${Math.round(edge.influenceStrength * 100)}% strength | ${edge.confidence} conf. | ${edge.lagMin}-${edge.lagMax}wk lag`,
          margin + 2, y + 8
        );
        y += 12;
      });

      y += 4;

      // Interventions
      checkPage(30);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(230, 230, 235);
      pdf.text('4. Available Interventions', margin, y);
      y += 8;

      interventions.forEach(intv => {
        checkPage(16);
        pdf.setFillColor(30, 35, 45);
        pdf.roundedRect(margin, y, contentW, 12, 1, 1, 'F');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(20, 184, 166);
        pdf.text(intv.label, margin + 3, y + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(140, 140, 150);
        pdf.text(
          `Impact: ${Math.round(intv.estimatedImpact * 100)}% | Time: ${intv.timeToEffect} | Cost: ${intv.costBand}`,
          margin + 3, y + 9
        );
        y += 14;
      });

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(80, 80, 90);
        pdf.text(`Atlas Causality Report — Page ${i}/${pageCount}`, margin, 290);
        pdf.text(new Date().toISOString(), pageW - margin, 290, { align: 'right' });
      }

      pdf.save('atlas-causality-report.pdf');
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isExporting}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
    >
      {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
      Export PDF
    </button>
  );
}
