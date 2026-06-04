"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Stack,
  Typography,
  Divider,
  Tooltip,
  Button,
  TextField,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const boldSx = { fontWeight: 700, color: "#111827" };

const sectionConfig = {
  summary: {
    title: "Summary",
    editConfig: {
      label: "Edit Summary",
      placeholder:
        "Enter a concise summary of the document, highlighting key points and overall assessment.",
      multiline: true,
      type: "text",
      minRows: 4,
    },
    render: (data) => (
      <Typography variant="body2" gutterBottom align="justify" sx={boldSx}>
        {data}
      </Typography>
    ),
  },
  key_points: {
    title: "Key Points",
    editConfig: {
      label: "Edit Key Points",
      placeholder:
        "List the key points or findings from the document. Use bullet points for clarity.",
      type: "array",
      multiline: false,
      minRows: 4,
    },
    render: (data) => (
      <>
        {data?.map((point, index) => (
          <Typography key={index} variant="body2" align="justify" sx={boldSx}>
            • {point}
          </Typography>
        ))}
      </>
    ),
  },
  scope_of_work: {
    title: "Scope of Work",
    render: (data) => (
      <Typography variant="body2" gutterBottom align="justify" sx={boldSx}>
        {data}
      </Typography>
    ),
  },
  deliverables: {
    title: "Deliverables",
    render: (data) => (
      <>
        {data?.map((item, index) => (
          <Typography key={index} variant="body2" align="justify" sx={boldSx}>
            • {item}
          </Typography>
        ))}
      </>
    ),
  },
  timeline: {
    title: "Timeline",
    render: (data) => (
      <Typography variant="body2" gutterBottom align="justify" sx={boldSx}>
        {data}
      </Typography>
    ),
  },
  budget_summary: {
    title: "Budget Summary",
    render: (data) => (
      <Typography variant="body2" gutterBottom align="justify" sx={boldSx}>
        {data}
      </Typography>
    ),
  },
  potential_issues: {
    title: "Potential Issues",
    render: (data) => (
      <>
        {data?.compliance_issues && (
          <>
            <Typography variant="body2" sx={{ ...boldSx, mb: 1 }}>
              Compliance Issues
            </Typography>
            {data.compliance_issues.map((issue, index) => (
              <div key={index} style={{ marginBottom: "16px" }}>
                <Typography
                  variant="body2"
                  align="center"
                  fontStyle="italic"
                  sx={{ ...boldSx, mb: 0.5 }}
                >
                  "{issue.excerpt}"
                </Typography>
                <Typography
                  variant="caption"
                  align="center"
                  fontStyle="italic"
                  color="text.disabled"
                  sx={{ display: "block", mb: 1 }}
                >
                  - {issue.location}
                </Typography>
                <Typography variant="body2" align="justify" sx={boldSx}>
                  {issue.explanation}
                </Typography>
              </div>
            ))}
          </>
        )}
        {data?.security_concerns && (
          <>
            <Typography variant="body2" sx={{ ...boldSx, mb: 1, mt: 2 }}>
              Security Concerns
            </Typography>
            {data.security_concerns.map((concern, index) => (
              <div key={index} style={{ marginBottom: "16px" }}>
                <Typography
                  variant="body2"
                  align="center"
                  fontStyle="italic"
                  sx={{ ...boldSx, mb: 0.5 }}
                >
                  "{concern.excerpt}"
                </Typography>
                <Typography
                  variant="caption"
                  align="center"
                  fontStyle="italic"
                  color="text.disabled"
                  sx={{ display: "block", mb: 1 }}
                >
                  - {concern.location}
                </Typography>
                <Typography variant="body2" align="justify" sx={boldSx}>
                  {concern.explanation}
                </Typography>
              </div>
            ))}
          </>
        )}
      </>
    ),
  },
  recommendations: {
    title: "Recommendations",
    render: (data) => (
      <>
        {data?.map((rec, index) => (
          <Typography key={index} variant="body2" align="justify" sx={boldSx}>
            • {rec}
          </Typography>
        ))}
      </>
    ),
  },
  references: {
    title: "References",
    render: (data) => (
      <>
        {data?.map((ref, index) => (
          <Typography key={index} variant="body2" align="justify" sx={boldSx}>
            • {ref}
          </Typography>
        ))}
      </>
    ),
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

  const reportDataKey = useMemo(
    () => JSON.stringify(reportData ?? {}),
    [reportData],
  );

  const editableDataKey = useMemo(
    () => JSON.stringify(editableData ?? {}),
    [editableData],
  );

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
    return (
      <Typography color="text.secondary">No report data available</Typography>
    );
  }

  const normalizedType = documentType?.trim().toLowerCase();
  const sectionOrder =
    docTypeSectionOrder[normalizedType] || defaultSectionOrder;

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
              onChange={(e) => {
                const nextValue = e.target.value;
                setEditableData((prev) => {
                  const current = Array.isArray(prev[sectionKey])
                    ? prev[sectionKey]
                    : safeArray;
                  const updated = current.map((item, i) =>
                    i === index ? nextValue : item,
                  );
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
                [sectionKey]: [
                  ...(Array.isArray(prev[sectionKey])
                    ? prev[sectionKey]
                    : safeArray),
                  "",
                ],
              }))
            }
          >
            Add Row
          </Button>
        </Stack>
      );
    }

    // Object content (e.g., potential issues)
    if (data && typeof data === "object") {
      return (
        <Stack spacing={2}>
          {Object.entries(data).map(([groupKey, groupVal]) => {
            if (Array.isArray(groupVal)) {
              const safeArray = groupVal.length ? groupVal : [{}];
              return (
                <Stack key={groupKey} spacing={1.5}>
                  <Typography variant="subtitle2" textTransform="capitalize">
                    {groupKey.replaceAll("_", " ")}
                  </Typography>
                  {safeArray.map((item, idx) => {
                    const entry =
                      item && typeof item === "object" && !Array.isArray(item)
                        ? item
                        : {};
                    const fieldKeys = Object.keys(entry).length
                      ? Object.keys(entry)
                      : ["value"];
                    return (
                      <Stack
                        key={`${groupKey}-${idx}`}
                        spacing={1}
                        sx={{
                          border: "1px solid #eee",
                          p: 1.5,
                          borderRadius: 1,
                        }}
                      >
                        {fieldKeys.map((fieldKey) => {
                          const fieldValue = entry[fieldKey] ?? "";
                          const isLongText = fieldKey
                            .toLowerCase()
                            .includes("explanation");
                          return (
                            <TextField
                              key={`${groupKey}-${idx}-${fieldKey}`}
                              fullWidth
                              size="small"
                              multiline={isLongText}
                              minRows={isLongText ? 3 : 1}
                              label={fieldKey.replaceAll("_", " ")}
                              value={fieldValue}
                              onChange={(e) => {
                                const nextVal = e.target.value;
                                setEditableData((prev) => {
                                  const currentSection = prev[sectionKey] || {};
                                  const currentGroup = Array.isArray(
                                    currentSection[groupKey],
                                  )
                                    ? currentSection[groupKey]
                                    : safeArray;
                                  const updatedGroup = currentGroup.map(
                                    (row, rowIdx) => {
                                      if (rowIdx !== idx) return row;
                                      return {
                                        ...(row && typeof row === "object"
                                          ? row
                                          : {}),
                                        [fieldKey]: nextVal,
                                      };
                                    },
                                  );
                                  return {
                                    ...prev,
                                    [sectionKey]: {
                                      ...currentSection,
                                      [groupKey]: updatedGroup,
                                    },
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
                onChange={(e) => {
                  const nextVal = e.target.value;
                  setEditableData((prev) => ({
                    ...prev,
                    [sectionKey]: {
                      ...(prev[sectionKey] || {}),
                      [groupKey]: nextVal,
                    },
                  }));
                }}
              />
            );
          })}
        </Stack>
      );
    }

    // String or empty content
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
    <Stack spacing={3}>
      {sectionOrder.map((sectionKey) => {
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
          <div key={sectionKey}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography
                variant="body1"
                gutterBottom
                textTransform="capitalize"
                sx={{ fontWeight: 700, color: "#111827" }}
              >
                {config.title}
              </Typography>
              {onChange && (
                <Tooltip
                  title={`${isEditing ? "Done" : "Edit"} ${config.title}`}
                  arrow
                >
                  <Button
                    variant={isEditing ? "contained" : "outlined"}
                    disableElevation
                    size="small"
                    color="warning"
                    startIcon={
                      !isEditing ? <EditOutlinedIcon fontSize="small" /> : null
                    }
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
            </Stack>

            {isEditing ? (
              renderEditableContent(sectionKey, data, config)
            ) : hasContent ? (
              config.render(data)
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                fontStyle="italic"
              >
                No content yet.
              </Typography>
            )}
            <Divider sx={{ mt: 2 }} />
          </div>
        );
      })}
    </Stack>
  );
}