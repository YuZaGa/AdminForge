"use client";

import type { CollectionDefinition } from "@adminforge/core";

interface TableEngineProps {
  collection: CollectionDefinition;
  data: unknown[];
  basePath: string;
}

export function TableEngine({ collection, data, basePath }: TableEngineProps) {
  const records = data as Record<string, unknown>[];
  const fieldKeys = Object.keys(collection.fields);
  const displayKeys = ["id", ...fieldKeys.slice(0, 5)];

  return (
    <div className="adminforge-table-wrapper">
      <table className="adminforge-table">
        <thead>
          <tr>
            {displayKeys.map((key) => (
              <th key={key}>{key}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id as string}>
              {displayKeys.map((key) => (
                <td key={key}>
                  {String(record[key] ?? "")}
                </td>
              ))}
              <td>
                <a
                  href={`${basePath}/${record.id}`}
                  className="adminforge-btn adminforge-btn-secondary"
                >
                  Edit
                </a>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan={displayKeys.length + 1}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
