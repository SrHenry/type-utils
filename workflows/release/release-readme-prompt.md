Update README.md to document all new features and changes introduced since ${PREV_VERSION} for the ${NEW_VERSION} release.

The following commits were merged since ${PREV_VERSION}:

${COMMITS}

Guidelines:

- Add new Schema types and rules to the API Reference table in the Schema types section
- Add new validation rules to the Validation rules section (with code examples matching existing style)
- Add new Standard Schema interop functions to the Standard Schema Interop section
- Add new utility types to the Utility Types table
- Update the Table of Contents if new sections or subsections are added
- Mark deprecated APIs with a deprecation notice (use HTML <details> block with "Deprecated since <version>" header, recommend replacement API if applicable)
- Use the existing README formatting conventions: markdown tables for API reference, TypeScript code blocks for examples, anchor links for cross-references
- Do NOT remove or alter existing content unless it is being replaced by a newer API
- Do NOT modify version numbers or badges
- Commit your changes with message: "docs: update README for ${NEW_VERSION}"
