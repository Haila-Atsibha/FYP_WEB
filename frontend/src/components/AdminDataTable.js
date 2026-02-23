"use client";

import React from 'react';

const AdminDataTable = ({ columns, data, loading, emptyMessage = "No data available" }) => {
    if (loading) {
        return (
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border">
                            {columns.map((col, i) => (
                                <th key={i} className="py-4 px-4 text-sm font-bold text-text-muted">
                                    <div className="h-4 w-20 animate-pulse bg-surface-hover rounded"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, i) => (
                            <tr key={i} className="border-b border-border/50">
                                {columns.map((_, j) => (
                                    <td key={j} className="py-4 px-4">
                                        <div className="h-4 w-full animate-pulse bg-surface-hover rounded"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="py-12 text-center bg-surface rounded-2xl border border-dashed border-border text-text-muted">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-border">
                        {columns.map((col, i) => (
                            <th key={i} className="py-4 px-4 text-sm font-bold text-text-muted">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {data.map((row, i) => (
                        <tr key={i} className="hover:bg-surface-hover transition-colors group">
                            {columns.map((col, j) => (
                                <td key={j} className="py-4 px-4 text-sm text-foreground">
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDataTable;
