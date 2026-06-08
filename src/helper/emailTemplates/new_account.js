import * as React from "react";

export default function NewAccountEmail({
  name,
  email,
  tempPassword,
  resetLink,
  supportEmail = "support@docval.com",
}) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f4f4",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#1d4ed8",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h1 style={{ color: "#ffffff", margin: "0", fontSize: "24px" }}>
            DocVal User Enrollment
          </h1>
        </div>

        {/* Content */}
        <div style={{ padding: "30px" }}>
          <p
            style={{ color: "#333333", fontSize: "16px", marginBottom: "20px" }}
          >
            Hi{name ? ` ${name}` : ""},
          </p>

          <p
            style={{
              color: "#555555",
              fontSize: "14px",
              lineHeight: "1.6",
              marginBottom: "20px",
            }}
          >
            Your account has been successfully enrolled in DocVal. Use the
            credentials below to access the system, then reset your default
            password immediately.
          </p>

          {/* Credentials Box */}
          <div
            style={{
              backgroundColor: "#f0f9ff",
              border: "2px solid #1d4ed8",
              borderRadius: "6px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                color: "#666666",
                fontSize: "12px",
                margin: "0 0 6px 0",
              }}
            >
              Login Email:
            </p>
            <p
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1d4ed8",
                margin: "0 0 12px 0",
                wordBreak: "break-all",
              }}
            >
              {email}
            </p>

            <p
              style={{
                color: "#666666",
                fontSize: "12px",
                margin: "0 0 6px 0",
              }}
            >
              Temporary Password:
            </p>
            <p
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1d4ed8",
                margin: "0",
              }}
            >
              {tempPassword}
            </p>
          </div>

          {/* Instructions */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "15px",
              borderRadius: "6px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                color: "#333333",
                fontSize: "13px",
                margin: "0 0 10px 0",
              }}
            >
              <strong>Next steps:</strong>
            </p>
            <ol
              style={{
                color: "#555555",
                fontSize: "13px",
                lineHeight: "1.8",
                margin: "0",
                paddingLeft: "20px",
              }}
            >
              <li>Sign in using the email and temporary password above</li>
              <li>Reset your default password immediately</li>
              <li>Choose a strong password you have not used before</li>
            </ol>
          </div>

          {resetLink && (
            <div style={{ marginBottom: "20px" }}>
              <a
                href={resetLink}
                style={{
                  display: "inline-block",
                  backgroundColor: "#1d4ed8",
                  color: "#ffffff",
                  textDecoration: "none",
                  padding: "10px 16px",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                Reset Password Now
              </a>
            </div>
          )}

          {/* Security Notice */}
          <p
            style={{
              color: "#ef4444",
              fontSize: "12px",
              marginBottom: "20px",
              padding: "10px",
              backgroundColor: "#fee2e2",
              borderRadius: "4px",
            }}
          >
            ⚠️ For security, do not share your temporary password. Reset it as
            soon as you sign in.
          </p>

          {/* Footer Message */}
          <p
            style={{
              color: "#888888",
              fontSize: "12px",
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #eeeeee",
            }}
          >
            Need help? Contact us at {supportEmail}.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "20px",
            textAlign: "center",
            borderTop: "1px solid #eeeeee",
          }}
        >
          <p style={{ color: "#888888", fontSize: "11px", margin: "0" }}>
            © 2026 DocVal. All rights reserved.
          </p>
          <p
            style={{ color: "#888888", fontSize: "11px", margin: "5px 0 0 0" }}
          >
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  );
}
