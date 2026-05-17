"use client";

import type { CollectionDefinition, FieldDefinition, AccessConfig } from "../../core";
import { useCallback, useRef, useState, useEffect } from "react";
import { RichTextEditor } from "./RichTextEditor.js";
import { ImageUpload } from "./ImageUpload.js";
import { RelationInput } from "./RelationInput.js";

interface FormEngineProps {
  collection: CollectionDefinition;
  record?: Record<string, unknown> | null;
  isNew: boolean;
  role?: string;
}

function hasAccess(access: AccessConfig | undefined, operation: string, role?: string): boolean {
  if (!access) return true;
  const allowed = access[operation as keyof AccessConfig];
  if (!allowed || !Array.isArray(allowed)) return true;
  if (!role) return false;
  return allowed.includes(role);
}

function FieldRenderer({
  name, field, value, onChange, onRelationChange, error, role, checked, onCheckedChange,
}: {
  name: string; field: FieldDefinition; value?: unknown; onChange?: (val: string) => void;
  onRelationChange?: (val: string | string[]) => void; error?: string; role?: string;
  checked?: boolean; onCheckedChange?: (checked: boolean) => void;
}) {
  const { component, props } = field.ui;
  if (props?.hidden) return null;
  if (!hasAccess(field.access, "read", role)) return null;

  const errorClass = error ? "adminforge-input-error" : "";
  const resolvedValue = value !== undefined ? value : field.db?.default;
  const isReadOnly = Boolean(props?.readOnly) || !hasAccess(field.access, "update", role);

  switch (component) {
    case "text": case "slug": case "date":
      return (
        <div className="adminforge-field">
          <label htmlFor={name}>{(props?.label as string) ?? name}</label>
          <input id={name} name={name} type={component === "date" ? "datetime-local" : "text"}
            className={`adminforge-input ${errorClass}`} required={!field.db?.nullable}
            defaultValue={typeof resolvedValue === "string" ? resolvedValue : ""} readOnly={isReadOnly} />
          {error && <span className="adminforge-field-err">{error}</span>}
        </div>
      );
    case "boolean":
      return (
        <div className="adminforge-field adminforge-field-checkbox">
          <label htmlFor={name}>
            <input id={name} name={name} type="checkbox"
              checked={!!checked}
              onChange={(e) => onCheckedChange?.(e.target.checked)}
              disabled={isReadOnly} />
            {(props?.label as string) ?? name}
          </label>
          {error && <span className="adminforge-field-err">{error}</span>}
        </div>
      );
    case "relation":
      return (
        <div className="adminforge-field">
          <label>{(props?.label as string) ?? name}</label>
          <RelationInput name={name} to={props?.to as string} relationType={props?.relationType as string}
            value={resolvedValue as string | string[] | undefined} onChange={onRelationChange} error={error} disabled={isReadOnly} />
          {error && <span className="adminforge-field-err">{error}</span>}
        </div>
      );
    case "richText":
      return (
        <div className="adminforge-field">
          <label>{(props?.label as string) ?? name}</label>
          <RichTextEditor name={name} value={typeof resolvedValue === "string" ? resolvedValue : ""}
            onChange={(val) => !isReadOnly && onChange?.(val)} />
          <input type="hidden" name={name} id={`${name}-hidden`} defaultValue={typeof resolvedValue === "string" ? resolvedValue : ""} />
          {error && <span className="adminforge-field-err">{error}</span>}
        </div>
      );
    case "image":
      return <ImageUpload name={name} value={typeof resolvedValue === "string" ? resolvedValue : ""}
        onChange={(val) => !isReadOnly && onChange?.(val)} />;
    default:
      return (
        <div className="adminforge-field">
          <label htmlFor={name}>{(props?.label as string) ?? name}</label>
          <input id={name} name={name} type="text" className={`adminforge-input ${errorClass}`}
            defaultValue={typeof resolvedValue === "string" ? resolvedValue : ""} readOnly={isReadOnly} />
          {error && <span className="adminforge-field-err">{error}</span>}
        </div>
      );
  }
}

export function FormEngine({ collection, record, isNew, role }: FormEngineProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [richTextValues, setRichTextValues] = useState<Record<string, string>>({});
  const [relationValues, setRelationValues] = useState<Record<string, string | string[]>>({});
  const [booleanValues, setBooleanValues] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSave = isNew
    ? hasAccess(collection.access, "create", role)
    : hasAccess(collection.access, "update", role);

  useEffect(() => {
    if (record && !isNew) {
      const rt: Record<string, string> = {};
      const rv: Record<string, string | string[]> = {};
      const bv: Record<string, boolean> = {};
      for (const [key, value] of Object.entries(record)) {
        const field = collection.fields[key];
        if (field?.type === "richText" && typeof value === "string") rt[key] = value;
        if (field?.type === "relation") {
          if (Array.isArray(value)) rv[key] = value.map((v: any) => (typeof v === "string" ? v : v.id));
          else if (typeof value === "string") rv[key] = value;
          else if (value && typeof value === "object" && (value as any).id) rv[key] = (value as any).id;
        }
        if (field?.type === "boolean") bv[key] = !!value;
      }
      setRichTextValues(rt);
      setRelationValues(rv);
      setBooleanValues(bv);
    }
  }, [record, isNew, collection.fields]);

  useEffect(() => {
    if (!isNew) return;
    const form = formRef.current;
    if (!form) return;
    const listeners: { input: HTMLInputElement; fn: EventListener }[] = [];
    Object.entries(collection.fields).forEach(([name, field]) => {
      if (field.type === "slug" && field.ui.props?.from) {
        const src = form.querySelector(`[name="${field.ui.props.from}"]`) as HTMLInputElement | null;
        const dst = form.querySelector(`[name="${name}"]`) as HTMLInputElement | null;
        if (src && dst) {
          const fn = (e: Event) => {
            const val = (e.target as HTMLInputElement).value;
            dst.value = val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          };
          src.addEventListener("input", fn);
          listeners.push({ input: src, fn });
        }
      }
    });
    return () => listeners.forEach((l) => l.input.removeEventListener("input", l.fn));
  }, [isNew, collection.fields]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSave) return;
    setFieldErrors({});
    setSubmitError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) continue;
      const field = collection.fields[key];
      if (!hasAccess(field?.access, isNew ? "create" : "update", role)) continue;
      if (richTextValues[key]) { data[key] = richTextValues[key]; }
      else if (field?.type === "boolean") { continue; } // handled below from state
      else if (field?.type === "relation") { continue; }
      else { data[key] = value.toString(); }
    }
    // Merge boolean values from controlled state
    for (const [name, field] of Object.entries(collection.fields)) {
      if (field.type === "boolean" && hasAccess(field.access, isNew ? "create" : "update", role)) {
        data[name] = booleanValues[name] ?? false;
      }
    }
    for (const [key, val] of Object.entries(relationValues)) {
      if (collection.fields[key] && hasAccess(collection.fields[key]?.access, isNew ? "create" : "update", role)) {
        data[key] = val;
      }
    }
    const url = isNew ? `/api/${collection.name}` : `/api/${collection.name}/${record?.id}`;
    const method = isNew ? "POST" : "PATCH";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) { window.location.href = `/admin/${collection.name}`; }
    else {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      if (err.fields) {
        const errors: Record<string, string> = {};
        for (const f of err.fields as { path: string; message: string }[]) errors[f.path] = f.message;
        setFieldErrors(errors);
      }
      setSubmitError(err.error ?? "An error occurred");
    }
  }, [collection, isNew, record?.id, richTextValues, relationValues, booleanValues, role, canSave]);

  const handleRichTextChange = useCallback((name: string, value: string) => {
    setRichTextValues((prev) => {
      const next = { ...prev, [name]: value };
      const hidden = formRef.current?.querySelector(`#${name}-hidden`) as HTMLInputElement | null;
      if (hidden) hidden.value = value;
      return next;
    });
  }, []);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="adminforge-form">
      {submitError && <div className="adminforge-form-error">{submitError}</div>}
      
      {!isNew && !!record?.id && (
        <div className="adminforge-field">
          <label>Internal ID</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="text" 
              className="adminforge-input" 
              value={String(record.id)} 
              readOnly 
              style={{ background: '#f8fafc', color: '#64748b', fontFamily: 'monospace' }} 
            />
            <button 
              type="button" 
              className="adminforge-btn-icon" 
              title="Copy ID"
              onClick={() => navigator.clipboard.writeText(String(record.id))}
            >
              <span className="material-symbols-outlined">content_copy</span>
            </button>
          </div>
        </div>
      )}
      {Object.entries(collection.fields).map(([name, field]) => {
        const fv = field.type === "relation" && relationValues[name] !== undefined ? relationValues[name] : record?.[name];
        return (
          <FieldRenderer key={name} name={name} field={field} value={fv}
            onChange={(val) => handleRichTextChange(name, val)}
            onRelationChange={(val) => setRelationValues((prev) => ({ ...prev, [name]: val }))}
            checked={field.type === "boolean" ? (booleanValues[name] ?? false) : undefined}
            onCheckedChange={field.type === "boolean" ? (checked) => setBooleanValues((prev) => ({ ...prev, [name]: checked })) : undefined}
            error={fieldErrors[name]} role={role} />
        );
      })}
      {canSave && (
        <div className="adminforge-form-actions">
          <button type="submit" className="adminforge-btn adminforge-btn-primary">
            {isNew ? "Create" : "Save"}
          </button>
        </div>
      )}
    </form>
  );
}
