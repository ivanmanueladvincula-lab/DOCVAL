"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Stack,
  Tooltip,
  Button,
  TextField,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

// Sleek text styling applied directly via Tailwind
const renderParagraph = (text) => (
  <p className="text-[13px] sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify mb-2">
    {text}
  </p>
);

const renderList = (items) => (
  <ul className="list-disc pl-5 space-y-1.5 mb-2">
    {items?.map((item, index) => (
      <li key={index} className="text-[13px] sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
        {item}
      </li>
    ))}
  </ul>
);

const sectionConfig = {
  summary: {
    title: "Summary",
    editConfig: {
      label: "Edit Summary",
      placeholder: "Enter a concise summary of the document, highlighting key points and overall assessment.",
      multiline: true,
      type: "text",
      minRows: 4,
    },
    render: (data) => renderParagraph(data),
  },
  key_points: {
    title: "Key Points",
    editConfig: {
      label: "Edit Key Points",
      placeholder: "List the key points or findings from the document.",
      type: "array",
      multiline: false,
      minRows: 4,
    },
    render: (data) => renderList(data),
  },
  scope_of_work: {
    title: "Scope of Work",
    render: (data) => renderParagraph(data),
  },
  deliverables: {
    title: "Deliverables",
    render: (data) => renderList(data),
  },
  timeline: {
    title: "Timeline",
    render: (data) => renderParagraph(data),
  },
  budget_summary: {
    title: "Budget Summary",
    render: (data) => renderParagraph(data),
  },
  potential_issues: {
    title: "Potential Issues",
    render: (data) => (
      <div className="space-y-4">
        {data?.compliance_issues && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Compliance Issues
            </h4>
            {data.compliance_issues.map((issue, index) => (
              <div key={index} className="bg-red-50 dark:bg-red-900/10 border-l-2 border-red-400 p-3 rounded-r-md mb-3">
                <p className="text-sm italic text-slate-800 dark:text-slate-200 mb-1">"{issue.excerpt}"</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium">- {issue.location}</p>
                {renderParagraph(issue.explanation)}
              </div>
            ))}
          </div>
        )}
        {data?.security_concerns && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 mt-4">
              Security Concerns
            </h4>
            {data.security_concerns.map((concern, index) => (
              <div key={index} className="bg-amber-50 dark:bg-amber-900/10 border-l-2 border-amber-400 p-3 rounded-r-md mb-3">
                <p className="text-sm italic text-slate-800 dark:text-slate-200 mb-1">"{concern.excerpt}"</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium">- {concern.location}</p>
                {renderParagraph(concern.explanation)}
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  },
  recommendations: {
    title: "Recommendations",
    render: (data) => renderList(data),
  },
  references: {
    title: "References",
    render: (data) => renderList(data),
  },
};

const docTypeSectionOrder = {
  "terms of reference": [
    "summary",
    "key_points",
    "scope_of_work",
    "deliverables",
    "timeline",
    "budget_summary",
    "potential_issues",
    "recommendations",
    "references",
  ],
};

const defaultSectionOrder = Object.keys(sectionConfig);

export default function ReportRenderer({ reportData, documentType, onChange }) {
  const [editableData, setEditableData] = useState(reportData || {});
  const [editingSections, setEditingSections] = useState({});

  const reportDataKey = useMemo(() => JSON.stringify(reportData ?? {}), [reportData]);
  const editableDataKey = useMemo(() => JSON.stringify(editableData ?? {}), [editableData]);

  useEffect(() => {
    setEditableData(reportData || {});
    setEditingSections({});
  }, [reportDataKey]);

  useEffect(() => {
    if (!onChange) return;
    if (editableDataKey === reportDataKey) return;
    onChange(editableData);
  }, [editableDataKey, reportDataKey, editableData, onChange]);

  if (!reportData) {
    return <p className="text-slate-500 italic text-sm">No report data available</p>;
  }

  const normalizedType = documentType?.trim().toLowerCase();
  const sectionOrder = docTypeSectionOrder[normalizedType] || defaultSectionOrder;

  const renderEditableContent = (sectionKey, data, config) => {
    // Array content
    if (Array.isArray(data)) {
      const safeArray = data.length ? data : [""];
      return (
        <Stack spacing={1.5}>
          {safeArray.map((value, index) => (
            <TextField
              key={`${sectionKey}-${index}`}
              fullWidth
              size="small"
              value={value}
              placeholder={config.editConfig?.placeholder || "Enter value"}
              sx={{ input: { color: 'inherit' }, "& .MuiInputBase-root": { color: "inherit" } }}
              onChange={(e) => {
                const nextValue = e.target.value;
                setEditableData((prev) => {
                  const current = Array.isArray(prev[sectionKey]) ? prev[sectionKey] : safeArray;
                  const updated = current.map((item, i) => (i === index ? nextValue : item));
                  return { ...prev, [sectionKey]: updated };
                });
              }}
            />
          ))}
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              setEditableData((prev) => ({
                ...prev,
                [sectionKey]: [...(Array.isArray(prev[sectionKey]) ? prev[sectionKey] : safeArray), ""],
              }))
            }
          >
            Add Row
          </Button>
        </Stack>
      );
    }

    // Object content
    if (data && typeof data === "object") {
      return (
        <Stack spacing={2}>
          {Object.entries(data).map(([groupKey, groupVal]) => {
            if (Array.isArray(groupVal)) {
              const safeArray = groupVal.length ? groupVal : [{}];
              return (
                <Stack key={groupKey} spacing={1.5}>
                  <p className="text-sm font-bold capitalize text-slate-800 dark:text-white">
                    {groupKey.replaceAll("_", " ")}
                  </p>
                  {safeArray.map((item, idx) => {
                    const entry = item && typeof item === "object" && !Array.isArray(item) ? item : {};
                    const fieldKeys = Object.keys(entry).length ? Object.keys(entry) : ["value"];
                    return (
                      <Stack
                        key={`${groupKey}-${idx}`}
                        spacing={1}
                        className="border border-slate-200 dark:border-slate-700 p-3 rounded-lg bg-white dark:bg-slate-800"
                      >
                        {fieldKeys.map((fieldKey) => {
                          const fieldValue = entry[fieldKey] ?? "";
                          const isLongText = fieldKey.toLowerCase().includes("explanation");
                          return (
                            <TextField
                              key={`${groupKey}-${idx}-${fieldKey}`}
                              fullWidth
                              size="small"
                              multiline={isLongText}
                              minRows={isLongText ? 3 : 1}
                              label={fieldKey.replaceAll("_", " ")}
                              value={fieldValue}
                              sx={{ "& .MuiInputBase-root": { color: "inherit" }, "& .MuiInputLabel-root": { color: "inherit" } }}
                              onChange={(e) => {
                                const nextVal = e.target.value;
                                setEditableData((prev) => {
                                  const currentSection = prev[sectionKey] || {};
                                  const currentGroup = Array.isArray(currentSection[groupKey]) ? currentSection[groupKey] : safeArray;
                                  const updatedGroup = currentGroup.map((row, rowIdx) => {
                                    if (rowIdx !== idx) return row;
                                    return { ...(row && typeof row === "object" ? row : {}), [fieldKey]: nextVal };
                                  });
                                  return {
                                    ...prev,
                                    [sectionKey]: { ...currentSection, [groupKey]: updatedGroup },
                                  };
                                });
                              }}
                            />
                          );
                        })}
                      </Stack>
                    );
                  })}
                </Stack>
              );
            }

            const value = typeof groupVal === "string" ? groupVal : "";
            return (
              <TextField
                key={groupKey}
                fullWidth
                size="small"
                multiline
                minRows={config.editConfig?.minRows || 3}
                label={groupKey.replaceAll("_", " ")}
                value={value}
                sx={{ "& .MuiInputBase-root": { color: "inherit" }, "& .MuiInputLabel-root": { color: "inherit" } }}
                onChange={(e) => {
                  const nextVal = e.target.value;
                  setEditableData((prev) => ({
                    ...prev,
                    [sectionKey]: { ...(prev[sectionKey] || {}), [groupKey]: nextVal },
                  }));
                }}
              />
            );
          })}
        </Stack>
      );
    }

    // String content
    if (typeof data === "string" || data === undefined || data === null) {
      const value = typeof data === "string" ? data : "";
      return (
        <TextField
          fullWidth
          multiline
          minRows={config.editConfig?.minRows || 4}
          size="small"
          placeholder={config.editConfig?.placeholder || `Edit ${config.title}`}
          value={value}
          sx={{ "& .MuiInputBase-root": { color: "inherit" } }}
          onChange={(e) => {
            const nextValue = e.target.value;
            setEditableData((prev) => ({ ...prev, [sectionKey]: nextValue }));
          }}
        />
      );
    }

    return config.render(data);
  };

  return (
    <div className="space-y-6">
      {sectionOrder.map((sectionKey, index) => {
        const config = sectionConfig[sectionKey];
        if (!config) return null;

        const data = editableData[sectionKey];
        const isEditing = Boolean(editingSections[sectionKey]);
        const hasContent = !(
          data === undefined ||
          data === null ||
          (Array.isArray(data) && data.length === 0) ||
          (typeof data === "string" && !data.trim())
        );

        return (
          <div key={sectionKey} className={index !== sectionOrder.length - 1 ? "border-b border-slate-200 dark:border-slate-700/60 pb-6" : ""}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white capitalize">
                {config.title}
              </h3>
              {onChange && (
                <Tooltip title={`${isEditing ? "Done" : "Edit"} ${config.title}`} arrow>
                  <Button
                    variant={isEditing ? "contained" : "outlined"}
                    disableElevation
                    size="small"
                    className={`font-bold ${isEditing ? "bg-amber-500 hover:bg-amber-600 text-white" : "text-slate-500 border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"}`}
                    startIcon={!isEditing ? <EditOutlinedIcon fontSize="small" /> : null}
                    onClick={() =>
                      setEditingSections((prev) => ({
                        ...prev,
                        [sectionKey]: !prev[sectionKey],
                      }))
                    }
                  >
                    {isEditing ? "Done" : "Edit"}
                  </Button>
                </Tooltip>
              )}
            </div>

            {isEditing ? (
              renderEditableContent(sectionKey, data, config)
            ) : hasContent ? (
              config.render(data)
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">No content yet.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}