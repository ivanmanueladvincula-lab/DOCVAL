import * as React from "react";

export default function ResetOTPEmail({ otp, expiryTime = "10 minutes" }) {
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
            backgroundColor: "#2563eb",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h1 style={{ color: "#ffffff", margin: "0", fontSize: "24px" }}>
            Password Reset Request
          </h1>
        </div>

        {/* Content */}
        <div style={{ padding: "30px" }}>
          <p
            style={{ color: "#333333", fontSize: "16px", marginBottom: "20px" }}
          >
            Hi,
          </p>

          <p
            style={{
              color: "#555555",
              fontSize: "14px",
              lineHeight: "1.6",
              marginBottom: "20px",
            }}
          >
            We received a request to reset your password. Use the One-Time
            Password (OTP) below to complete the reset process.
          </p>

          {/* OTP Box */}
          <div
            style={{
              backgroundColor: "#f0f9ff",
              border: "2px solid #2563eb",
              borderRadius: "6px",
              padding: "20px",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                color: "#666666",
                fontSize: "12px",
                margin: "0 0 10px 0",
              }}
            >
              Your OTP Code:
            </p>
            <p
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#2563eb",
                margin: "0",
                letterSpacing: "3px",
              }}
            >
              {otp}
            </p>
          </div>

          {/* Expiry Notice */}
          <p
            style={{
              color: "#ef4444",
              fontSize: "13px",
              marginBottom: "20px",
              padding: "10px",
              backgroundColor: "#fee2e2",
              borderRadius: "4px",
            }}
          >
            ⚠️ This OTP will expire in <strong>{expiryTime}</strong>
          </p>

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
              <strong>How to reset your password:</strong>
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
              <li>Enter the OTP code above on the password reset page</li>
              <li>Create a new, strong password</li>
              <li>Confirm your new password</li>
            </ol>
          </div>

          {/* Security Warning */}
          <p
            style={{
              color: "#666666",
              fontSize: "12px",
              lineHeight: "1.6",
              marginBottom: "20px",
              fontStyle: "italic",
            }}
          >
            If you did not request a password reset, please ignore this email
            and contact our support team immediately.
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
            If you're having trouble resetting your password, please contact our
            support team.
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
