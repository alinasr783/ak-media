/**
 * TableRenderer Component
 * يعرض الجداول بشكل عصري وتفاعلي
 */

import { Card } from "../../components/ui/card";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

/**
 * Simple Table Renderer - جدول بسيط وعصري
 */
export default function TableRenderer({ tableData, title }) {
  if (!tableData || !tableData.headers || !tableData.rows) {
    return <p className="text-sm text-muted-foreground">مفيش بيانات كافية للجدول</p>;
  }

  const { headers, rows } = tableData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="overflow-hidden">
        {title && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-muted/30">
            <h3 className="text-base sm:text-lg font-semibold text-right">
              {title}
            </h3>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
                  className={cn(
                    "border-b border-border/50 transition-colors hover:bg-muted/50",
                    rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20"
                  )}
                >
                  {Array.isArray(row) ? (
                    row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-3 sm:px-4 py-2 sm:py-3 text-right"
                      >
                        {cell}
                      </td>
                    ))
                  ) : (
                    headers.map((header, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-3 sm:px-4 py-2 sm:py-3 text-right"
                      >
                        {row[header] || '-'}
                      </td>
                    ))
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {rows.length > 0 && (
          <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-border bg-muted/30 text-xs sm:text-sm text-muted-foreground text-right">
            إجمالي: {rows.length} سجل
          </div>
        )}
      </Card>
    </motion.div>
  );
}

/**
 * Comparison Table - جدول مقارنة (خاص بالحجوزات)
 */
export function ComparisonTableRenderer({ data, title }) {
  if (!data || !data.labels || !data.datasets) {
    return <p className="text-sm text-muted-foreground">مفيش بيانات كافية للمقارنة</p>;
  }

  const headers = ['اليوم', ...data.datasets.map(d => d.label)];
  const rows = data.labels.map((label, index) => {
    const row = [label];
    data.datasets.forEach(dataset => {
      row.push(dataset.data[index] || 0);
    });
    return row;
  });

  // Calculate totals
  const totals = ['الإجمالي'];
  data.datasets.forEach(dataset => {
    const total = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
    totals.push(total);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="overflow-hidden">
        {title && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-muted/30">
            <h3 className="text-base sm:text-lg font-semibold text-right">
              {title}
            </h3>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
                  className={cn(
                    "border-b border-border/50 transition-colors hover:bg-muted/50",
                    rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20"
                  )}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={cn(
                        "px-3 sm:px-4 py-2 sm:py-3 text-right",
                        cellIndex === 0 ? "font-medium" : ""
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </motion.tr>
              ))}
              
              {/* Totals Row */}
              <tr className="border-t-2 border-border bg-primary/10 font-semibold">
                {totals.map((total, index) => (
                  <td
                    key={index}
                    className="px-3 sm:px-4 py-2 sm:py-3 text-right"
                  >
                    {total}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}
