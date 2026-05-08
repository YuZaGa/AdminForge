import { useEffect, useState } from "react";

interface RelationInputProps {
  name: string;
  to: string;
  value?: string;
  onChange?: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export function RelationInput({ name, to, value, onChange, error, disabled }: RelationInputProps) {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchOptions() {
      try {
        setLoading(true);
        // Note: For large collections, search query param can be added here
        const res = await fetch(`/api/${to}?pageSize=100`);
        const json = await res.json();
        if (mounted && json.data) {
          setOptions(json.data);
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

  const getLabel = (opt: any) => {
    return opt.name || opt.title || opt.label || opt.id;
  };

  const selectedOption = options.find((o) => o.id === value);
  const filteredOptions = options.filter((o) =>
    getLabel(o).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="adminforge-relation">
      {/* Hidden input for native form submission */}
      <input type="hidden" name={name} value={value || ""} />
      
      <div 
        className={`adminforge-input ${error ? "adminforge-input-error" : ""}`}
        style={{ 
          position: "relative", 
          cursor: disabled ? "not-allowed" : "pointer", 
          minHeight: "38px", 
          display: "flex", 
          alignItems: "center",
          opacity: disabled ? 0.6 : 1,
        }}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span style={{ padding: "0 8px", color: selectedOption ? "inherit" : "#888" }}>
          {selectedOption ? getLabel(selectedOption) : "Select..."}
        </span>
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
              {filteredOptions.map((opt) => (
                <li
                  key={opt.id}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    background: value === opt.id ? "#f0f0f0" : "transparent"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = value === opt.id ? "#f0f0f0" : "transparent")}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onChange) onChange(opt.id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {getLabel(opt)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
