"use client";

import { useState, useRef } from "react";
import { useAdminForge } from "../AdminForgeContext.js";

interface ImageUploadProps {
  name: string;
  value?: string;
  onChange: (value: string) => void;
}

export function ImageUpload({ name, value, onChange }: ImageUploadProps) {
  const { apiBase } = useAdminForge();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${apiBase}/_media`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.url);
      setPreview(data.url);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="adminforge-field">
      <label>{(name.charAt(0).toUpperCase() + name.slice(1))} Image</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      <div className="adminforge-image-upload">
        {preview && (
          <img src={preview} alt="Preview" className="adminforge-image-preview" />
        )}
        <button
          type="button"
          className="adminforge-btn adminforge-btn-secondary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : preview ? "Replace Image" : "Choose Image"}
        </button>
      </div>
      <input type="hidden" name={name} value={preview} />
    </div>
  );
}
