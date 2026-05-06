"use client";

import type { CollectionDefinition, FieldDefinition } from "@adminforge/core";
import { useCallback, useRef, useState } from "react";
import { RichTextEditor } from "./RichTextEditor.js";

interface FormEngineProps {
  collection: CollectionDefinition;
  record?: Record<string, unknown> | null;
  isNew: boolean;
}

function FieldRenderer({
  name,
  field,
  value,
  onChange,
}: {
  name: string;
  field: FieldDefinition;
  value?: unknown;
  onChange?: (val: string) => void;
}) {
  const { component, props } = field.ui;

  switch (component) {
    case "text":
      return (
        <div className="adminforge-field">
          <label htmlFor={name}>{(props?.label as string) ?? name}</label>
          <input
            id={name}
            name={name}
            type="text"
            className="adminforge-input"
            required={!field.db.nullable}
            defaultValue={typeof value === "string" ? value : ""}
          />
        </div>
      );
    case "boolean":
      return (
        <div className="adminforge-field adminforge-field-checkbox">
          <label htmlFor={name}>
            <input
              id={name}
              name={name}
              type="checkbox"
              defaultChecked={value === true || (field.db.default === true && value === undefined)}
            />
            {(props?.label as string) ?? name}
          </label>
        </div>
      );
    case "richText":
      return (
        <div className="adminforge-field">
          <label>{(props?.label as string) ?? name}</label>
          <RichTextEditor
            name={name}
            value={typeof value === "string" ? value : ""}
            onChange={(val) => onChange?.(val)}
          />
          <input type="hidden" name={name} id={`${name}-hidden`} value={typeof value === "string" ? value : ""} />
        </div>
      );
    default:
      return (
        <div className="adminforge-field">
          <label htmlFor={name}>{(props?.label as string) ?? name}</label>
          <input
            id={name}
            name={name}
            type="text"
            className="adminforge-input"
            defaultValue={typeof value === "string" ? value : ""}
          />
        </div>
      );
  }
}

export function FormEngine({ collection, record, isNew }: FormEngineProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [richTextValues, setRichTextValues] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) continue;
      const stringValue = value.toString();
      if (richTextValues[key]) {
        data[key] = richTextValues[key];
      } else {
        data[key] = stringValue;
      }
    }
    const url = isNew
      ? `/api/${collection.name}`
      : `/api/${collection.name}/${record?.id}`;
    const method = isNew ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      window.location.href = `/admin/${collection.name}`;
    } else {
      const err = await res.json();
      console.error("Failed to save:", err);
    }
  }, [collection.name, isNew, record?.id, richTextValues]);

  const handleRichTextChange = useCallback((name: string, value: string) => {
    setRichTextValues((prev) => {
      const next = { ...prev, [name]: value };
      const hiddenInput = formRef.current?.querySelector(`#${name}-hidden`) as HTMLInputElement | null;
      if (hiddenInput) hiddenInput.value = value;
      return next;
    });
  }, []);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="adminforge-form">
      {Object.entries(collection.fields).map(([name, field]) => (
        <FieldRenderer
          key={name}
          name={name}
          field={field}
          value={record?.[name]}
          onChange={(val) => handleRichTextChange(name, val)}
        />
      ))}
      <div className="adminforge-form-actions">
        <button type="submit" className="adminforge-btn adminforge-btn-primary">
          {isNew ? "Create" : "Save"}
        </button>
      </div>
    </form>
  );
}
