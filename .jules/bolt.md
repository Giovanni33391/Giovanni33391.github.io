## 2025-05-14 - [React Namespace Reference Error]
**Learning:** In this environment, using `React.useCallback` or `React.memo` without explicitly importing `React` or having it in the global scope results in a `ReferenceError`. The project follows a named import convention (e.g., `import { useState, useCallback } from 'react'`).
**Action:** Always use named imports for React hooks and components and avoid using the `React` namespace unless `React` is explicitly imported as a default import.

## 2025-05-14 - [Latest Ref Pattern for Stable Callbacks]
**Learning:** When a callback depends on a large piece of state (like an array of challenges) but only needs it for internal logic, using `useRef` to track the latest state value allows removing that state from the `useCallback` dependency array. This prevents the callback from being redefined on every state change, stopping a cascade of re-renders.
**Action:** Apply the 'latest ref pattern' to action callbacks that depend on frequently changing state but are passed down as props to memoized child components.
