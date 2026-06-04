// import React from "react";
import * as React from "react";

export default function EmailTemplateTest(data) {
  const { name } = data;

  return (
    <div>
      <h1>Welcome, {name}!</h1>
    </div>
  );
}
