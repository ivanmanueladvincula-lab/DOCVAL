# DocVal

## Table of Contents

- [Introduction](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#introduction)
- [Getting Started](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#getting-started)
  - [Prerequisites](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#prerequisites)
  - [Installation Steps](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#installation-steps)
  - [Running the System](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#running-the-system)
    - [Development Mode](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#development-mode)
    - [Production Mode](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#production-mode)
- [Features](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#features)
- [API Endpoints](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#api-endpoints)
- [Dynamic Report Schemas](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#dynamic-report-schemas)
  - [How It Works](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#how-it-works)
  - [Adding a New Document Type](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#adding-a-new-document-type)
  - [Files Involved](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#files-involved)
  - [Report Display Locations](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#report-display-locations)
- [Poject Structure](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#project-structure)
- [Team Members](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#team-members)
- [Support](https://github.com/redthecoderist1000/DocVal?tab=readme-ov-file#api-support)

## Introduction

**DocVal** is an AI-based tool designed for evaluating and validating official documents. This system leverages artificial intelligence to analyze, verify, and assess the authenticity and completeness of official documents with high accuracy. Whether you need to validate certificates, identification documents, official records, or other critical paperwork, DocVal provides a reliable and efficient solution for document verification.

The application features a secure, user-friendly interface that allows users to upload and evaluate documents, with detailed reports and insights generated through advanced AI algorithms.

## Getting Started

### Prerequisites

Before running the system, ensure you have the following installed:

- Node.js (v16 or higher)
- npm (v7 or higher) or yarn/pnpm/bun

### Installation Steps

1. **Clone the repository** (if applicable)

   ```bash
   git clone <repository-url>
   cd docval_final
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory and add the required configuration:

   ```
   NEXT_PUBLIC_BASE_URL=<base-url-for-backend-service>
   NEXTAUTH_SECRET=<your-secret-key>

   ```

### Running the System

#### Development Mode

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

#### Production Mode

To build and run in production:

```bash
npm run build
npm start
```

## Features

- AI-powered document validation and verification
- Secure user authentication
- Dashboard for managing and tracking documents
- Document upload and analysis
- Detailed validation reports
- User profile management
- Dynamic report schemas for different document types

## API Endpoints

All endpoints are served under the Next.js API base path: `/api`.

### Common Headers

- `Content-Type: application/json` for JSON requests
- `Authorization: Bearer <access_token>` for protected endpoints (marked as **Auth required**)

### Auth

#### POST /api/auth/login

- **Auth required:** No
- **Payload:** `{ "email": string, "password": string }`
- **Responses:**
  - **200** `{ message, body: { id, f_name, m_name, l_name, full_name, email, role, division_id, division, division_abrv }, refresh_token, access_token }`
  - **400** `{ message }`
  - **500** `{ message, error }`

#### POST /api/auth/register

- **Auth required:** No
- **Payload:** `{ "f_name"?: string, "m_name"?: string, "l_name"?: string, "email": string, "password": string, "role"?: string[] (role IDs), "division"?: string (UUID) }`
- **Responses:**
  - **201** `{ message, body, refresh_token, access_token }`
  - **210** `{ message: "User created, but failed to send email", body, refresh_token, access_token }`
  - **400** `{ message, error }`
  - **500** `{ message, error }`

#### POST /api/auth/refresh

- **Auth required:** No
- **Payload:** `{ "refreshToken": string }`
- **Responses:**
  - **200** `{ access_token }`
  - **401** `{ message }`
  - **403** `{ message, error }`
  - **500** `{ message, error }`

#### POST /api/auth/password/send_otp

- **Auth required:** No
- **Payload:** `{ "email": string }`
- **Responses:**
  - **200** `{ message, body: { user_id } }`
  - **403** `{ message: "Invalid Email" }`
  - **500** `{ message, error? }`

#### POST /api/auth/password/verify_otp

- **Auth required:** No
- **Payload:** `{ "otp": string, "user_id": string (UUID) }`
- **Responses:**
  - **200** `{ message }`
  - **400** `{ message }`
  - **500** `{ message, error? }`

#### POST /api/auth/password/reset

- **Auth required:** No
- **Payload:** `{ "user_id": string (UUID), "new_pass": string }`
- **Responses:**
  - **200** `{ message }`
  - **400** `{ message }`
  - **500** `{ message }`

#### POST /api/auth/password/resend_otp

- **Auth required:** No
- **Payload:** `{ "user_id": string (UUID) }`
- **Responses:**
  - **200** `{ message, body: { user_id } }`
  - **500** `{ message }`

#### GET|POST /api/auth/[...nextauth]

- **Auth required:** No
- **Payload:** Standard NextAuth credentials flow.
- **Responses:** NextAuth session/token responses (managed by NextAuth).

### Dashboard

#### GET /api/dashboard

- **Auth required:** Yes
- **Payload:** None
- **Responses:**
  - **200** `{ message, body }`
  - **403** `{ error }`
  - **500** `{ message, error }`

### Document

#### GET /api/document/getAllDocType

- **Auth required:** Yes
- **Payload:** None
- **Responses:** **200** `{ message, body: [...] }`

#### GET /api/document/getAllDocClass

- **Auth required:** Yes
- **Payload:** None
- **Responses:** **200** `{ message, body: [...] }`

#### POST /api/document/getFileByUser

- **Auth required:** Yes
- **Payload:** None
- **Responses:** **200** `{ message, body: [...] }`

#### POST /api/document/getFileDetail

- **Auth required:** Yes
- **Payload:** `{ "fileId": string }`
- **Responses:** **200** `{ message, body }` or **400** `{ message }`

#### POST /api/document/createFile

- **Auth required:** Yes
- **Payload:**
  `{ "reference_no": string, "title": string, "doc_type": string (UUID), "doc_class": string (UUID), "sender_office": string (UUID), "sender_person": string, "sender_email": string, "sender_phone": string, "base64_data": string, "office_type": string, "receiving_office"?: string (UUID), "report"?: object }`
- **Responses:** **201** `{ message, body }` or **400** `{ message, error }`

#### PUT /api/document/createFile

- **Auth required:** Yes
- **Payload:** `{ "fileId": string (UUID), "report": object, "status": string }`
- **Responses:** **200** `{ message, body }` or **400** `{ error }`

#### POST /api/document/generateReport

- **Auth required:** Yes
- **Payload:** `{ "base64_data": string, "document_type"?: string }`
- **Responses:** **200** `{ message, body }` or **400** `{ message }`

#### POST /api/document/deleteFile

- **Auth required:** Yes
- **Payload:** `{ "fileId": string }`
- **Responses:** **200** `{ message, body }` or **400** `{ message }`

#### POST /api/document/createDocType

- **Auth required:** Yes
- **Payload:** `{ "name": string }`
- **Responses:** **201** `{ message, body }` or **400** `{ message }`

#### POST /api/document/editDocType

- **Auth required:** Yes
- **Payload:** `{ "docTypeId": string (UUID), "newName": string }`
- **Responses:** **201** `{ message, body }` or **400** `{ message }`

#### POST /api/document/deleteDocType

- **Auth required:** Yes
- **Payload:** `{ "docTypeId": string (UUID) }`
- **Responses:** **200** `{ message, body }` or **400** `{ message }`

#### POST /api/document/createDocClass

- **Auth required:** Yes
- **Payload:** `{ "name": string }`
- **Responses:** **201** `{ message, body }` or **400** `{ message }`

#### POST /api/document/editDocClass

- **Auth required:** Yes
- **Payload:** `{ "docClassId": string (UUID), "newName": string }`
- **Responses:** **201** `{ message, body }` or **400** `{ message }`

#### POST /api/document/deleteDocClass

- **Auth required:** Yes
- **Payload:** `{ "docClassId": string (UUID) }`
- **Responses:** **200** `{ message, body }` or **400** `{ message }`

#### POST /api/document/downloadFile

- **Auth required:** Yes
- **Payload:** `{ "fileName": string }`
- **Responses:**
  - **200** PDF file stream with `Content-Type: application/pdf`
  - **400** `{ message }`
  - **404** `{ message }`

#### GET /api/document/getIncomingFile

- **Auth required:** Yes
- **Payload:** None
- **Responses:** **200** `{ message, body: [...] }`

### Office (Divisions)

#### GET /api/office/getAllDivision

- **Auth required:** Yes
- **Payload:** None
- **Responses:** **200** `{ message, body: [...] }`

#### POST /api/office/createDivision

- **Auth required:** Yes
- **Payload:** `{ "name": string, "abrv": string, "office_type"?: string, "parent_office"?: string (UUID or empty string) }`
- **Responses:** **201** `{ message, body }` or **400** `{ message }`

#### POST /api/office/editDivision

- **Auth required:** Yes
- **Payload:** `{ "divId": string (UUID), "newName"?: string, "newAbrv"?: string }`
- **Responses:** **201** `{ message, body }` or **400** `{ message }`

#### POST /api/office/deleteDivision

- **Auth required:** Yes
- **Payload:** `{ "divisionId": string (UUID) }`
- **Responses:** **200** `{ message, body }` or **400** `{ message }`

### Roles

#### GET /api/roles/getAllRoles

- **Auth required:** Yes
- **Payload:** None
- **Responses:** **200** `{ message, body: [...] }`

### User

#### GET /api/user/getAllUser

- **Auth required:** Yes
- **Payload:** None
- **Responses:** **200** `{ message, body: [...] }`

#### POST /api/user/getUserDetail

- **Auth required:** Yes
- **Payload:** `{ "userId": string (UUID) }`
- **Responses:** **200** `{ message, body }`

#### POST /api/user/editUser

- **Auth required:** Yes
- **Payload:** `{ "userId": string (UUID), "newFName"?: string, "newMName"?: string, "newLName"?: string, "newEmail"?: string, "newDiv"?: string (UUID), "newRole"?: string }`
- **Responses:** **200** `{ message, body, newData }` or **400** `{ message }`

#### POST /api/user/deleteAccount

- **Auth required:** Yes
- **Payload:** `{ "userId": string (UUID) }`
- **Responses:** **200** `{ message, body }` or **400** `{ message }`

### Email

#### POST /api/email/test

- **Auth required:** Yes
- **Payload:** `{ "name": string }`
- **Responses:** **200** `{ message, data }` or **500** `{ message, error }`

### AI

#### /api/ai/evaluate

- **Auth required:** Unknown (route not implemented)
- **Payload/Responses:** Not implemented (route file is empty).

#### /api/ai/fetchDocDetail

- **Auth required:** Unknown (route not implemented)
- **Payload/Responses:** Not implemented (route file is empty).

### Test

#### GET /api/test

- **Auth required:** Yes
- **Payload:** None
- **Responses:** **200** `{ message, data }`

#### POST /api/test

- **Auth required:** Yes
- **Payload:** Any JSON body
- **Responses:** **200** `{ message, user, receivedData, status }`

## Dynamic Report Schemas

The system supports generating AI reports with different structures based on document type. Each document type has a custom schema and instructions that guide the AI model to generate tailored reports.

### How It Works

1. **Base Schema**: All reports include common fields (document_name, summary, key_points, recommendations, references)
2. **Type-Specific Schema**: Each document type can extend the base schema with custom fields
3. **Type-Specific Instructions**: AI receives additional guidance for analyzing specific document types
4. **Dynamic Rendering**: Report sections are displayed based on the selected schema, automatically adapting to any new document types

### Adding a New Document Type

To add support for a new document type:

#### 1. Define the Schema

In `src/app/api/helper/gemini.js` (or your separated schemas file):

```javascript
const newDocumentTypeSchema = {
  ...baseSchema,
  properties: {
    ...baseSchema.properties,
    // Add custom fields specific to your document type
    custom_field: {
      type: "string",
      description: "Description of the custom field",
    },
  },
};
```

#### 2. Register in docTypeSchema

```javascript
const docTypeSchema = {
  "terms of reference": TERMS_OF_REFERENCE_SCHEMA,
  "new document type": NEW_DOCUMENT_TYPE_SCHEMA, // Add this line
};
```

#### 3. Add AI Instructions (Optional)

```javascript
const docTypeInstruction = {
  "terms of reference": "Focus on TOR-specific sections...",
  "new document type": "Focus on your document-specific analysis aspects...", // Add this line
};
```

#### 4. Define Section Order (Optional)

In `src/app/(dashboard)/evaluate/report/components/ReportRenderer.js`:

```javascript
const docTypeSectionOrder = {
  "terms of reference": ["summary", "key_points", "scope_of_work", "deliverables", ...],
  "new document type": ["summary", "key_points", "your_custom_field", ...],  // Add this line
};
```

#### 5. Add Custom Renderer (If Needed)

```javascript
const sectionConfig = {
  your_custom_field: {
    title: "Custom Field Title",
    render: (data) => <Typography variant="body2">{data}</Typography>,
  },
  // ... rest of configs
};
```

#### 6. Update PDF Export (If Needed)

In `src/helper/printables/Report_pdf.js`, add a renderer for custom fields if they need special formatting:

```javascript
const sectionRenderer = {
  summary: { title: "Summary", render: addParagraph },
  key_points: { title: "Key Points", render: addBullets },
  // ... existing renderers
  your_custom_field: {
    title: "Custom Field Title",
    render: (data) => {
      // Custom render logic for PDF
      // Example: addParagraph(data) for text, addBullets(data) for arrays
    },
  },
};
```

Then add the document type section order for PDF generation:

```javascript
const docTypeSectionOrder = {
  "terms of reference": ["summary", "key_points", "scope_of_work", ...],
  "new document type": ["summary", "key_points", "your_custom_field", ...],  // Add this
};
```

### Files Involved

- `src/app/api/helper/gemini.js` - AI configuration
- `src/app/api/helper/schema.js` - Schema definitions
- `src/app/api/document/generateReport/route.js` - API endpoint for report generation
- `src/app/(dashboard)/files/report/components/ReportRenderer.js` - Dynamic report rendering logic (UI)
- `src/helper/printables/Report_pdf.js` - Dynamic PDF export logic
- `src/app/(dashboard)/files/new/page.js` - Document upload with type selection

### Report Display Locations

The dynamic renderer automatically works across:

- `/evaluate/report` - New document report review page
- `/incoming/report` - Incoming document report review page
- File Details Modal's Report Tab

## Project Structure

- `src/app/` - Next.js pages, API routes, and authentication
- `src/components/` - Reusable React components
- `src/helper/` - Utility functions, context providers, and helpers
- `public/` - Static assets and uploaded files

## Team Members

| Name    | Role                  | Email                           |
| ------- | --------------------- | ------------------------------- |
| Arvie   | Documentation         | aezyy.yyzea@gmail.com           |
| Edward  | Documentation         | johnedwardsolaybar263@gmail.com |
| Kenjiro | AI & Documentation    | TakadaKenjiro123@gmail.com      |
| Red     | Fullstack Development | redochavillo@gmail.com          |
| Ron     | UI/UX                 | arboisron2@gmail.com            |

## Support

For issues, questions, or contributions, please refer to the project documentation or contact the development team.
