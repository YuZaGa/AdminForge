import { useEffect, useState, useRef } from "react";

interface RelationInputProps {
  name: string;
  to: string;
  relationType?: string;
  value?: string | string[];
  onChange?: (val: string | string[]) => void;
  error?: string;
  disabled?: boolean;
}

export function RelationInput({ name, to, relationType, value, onChange, error, disabled }: RelationInputProps) {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isMulti = relationType === "many-to-many" || relationType === "one-to-many";
  
  // Normalize value to array of strings for easier handling
  const rawValueArray = Array.isArray(value) ? value : value ? [value] : [];
  const selectedIds = rawValueArray.map((v: any) => typeof v === "object" && v !== null ? v.id : v).filter(Boolean);

  useEffect(() => {
    let mounted = true;
    async function fetchOptions() {
      try {
        setLoading(true);
        const res = await fetch(`/api/${to}?pageSize=100`);
        const json = await res.json();
        if (mounted && json.data) {
          const uniqueOptions = [];
          const seen = new Set();
          const getLbl = (opt: any) => opt.name || opt.title || opt.label || opt.id;
          for (const opt of json.data) {
            const lbl = getLbl(opt);
            if (!seen.has(lbl)) {
              seen.add(lbl);
              uniqueOptions.push(opt);
            }
          }
          setOptions(uniqueOptions);
        }
      } catch (err) {
        console.error("Failed to fetch relations", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchOptions();
    return () => {
      mounted = false;
    };
  }, [to]);

  const getLabel = (opt: any) => opt.name || opt.title || opt.label || opt.id;

  const filteredOptions = options.filter((o) =>
    getLabel(o).toLowerCase().includes(search.toLowerCase())
  );

  const toggleOption = (id: string) => {
    if (isMulti) {
      const newIds = selectedIds.includes(id)
        ? selectedIds.filter(v => v !== id)
        : [...selectedIds, id];
      onChange?.(newIds);
    } else {
      onChange?.(id);
      setOpen(false);
      setSearch("");
    }
  };

  const removeOption = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (disabled) return;
    onChange?.(selectedIds.filter(v => v !== id));
  };

  return (
    <div className="adminforge-relation" ref={containerRef} style={{ position: "relative" }}>
      {/* Hidden inputs for native form submission */}
      {selectedIds.length === 0 && <input type="hidden" name={name} value="" />}
      {selectedIds.map(id => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      
      <div 
        className={`adminforge-input ${error ? "adminforge-input-error" : ""}`}
        style={{ 
          position: "relative", 
          cursor: disabled ? "not-allowed" : "pointer", 
          minHeight: "38px", 
          display: "flex", 
          alignItems: "center",
          flexWrap: "wrap",
          gap: "4px",
          padding: "4px 8px",
          opacity: disabled ? 0.6 : 1,
        }}
        onClick={() => !disabled && setOpen(!open)}
      >
        {selectedIds.length > 0 ? (
          selectedIds.map(id => {
            const opt = options.find(o => o.id === id);
            const label = opt ? getLabel(opt) : id;
            if (isMulti) {
              return (
                <span key={id} style={{
                  background: "#e0e0e0",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  {label}
                  <button
                    type="button"
                    onClick={(e) => removeOption(e, id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", fontWeight: "bold" }}
                  >&times;</button>
                </span>
              );
            }
            return <span key={id}>{label}</span>;
          })
        ) : (
          <span style={{ color: "#888" }}>Select...</span>
        )}
      </div>

      {open && (
        <div 
          style={{
            position: "absolute",
            zIndex: 10,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginTop: "4px",
            width: "100%",
            maxHeight: "250px",
            overflowY: "auto",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}
        >
          <div style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                padding: "4px 8px",
                border: "1px solid #ccc",
                borderRadius: "4px"
              }}
            />
          </div>
          {loading ? (
            <div style={{ padding: "8px", color: "#888" }}>Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div style={{ padding: "8px", color: "#888" }}>No options found</div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {filteredOptions.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);
                return (
                  <li
                    key={opt.id}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      background: isSelected ? "#f0f0f0" : "transparent",
                      display: "flex",
                      justifyContent: "space-between"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? "#f0f0f0" : "transparent")}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(opt.id);
                    }}
                  >
                    {getLabel(opt)}
                    {isSelected && isMulti && <span style={{ color: "#417690" }}>✓</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
