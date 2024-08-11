If you're a developer there might be a chance you are looking towards implementing MathBox in an iframe as a display. For this rare occasion MathBox supports several URL parameters to load the website as a customized display.

# Supported Parameters

| Parameter | Values | Description |
| - | - | - |
| `code`           | _source code_             | Places the code in the code-editor and automatically executes it. |
| `theme`          | `light`, `dark`           | Sets the website's appearance. |
| `display-mode`   |                           | Header, panels and the render style button are hidden. |
| `render-style`   | `geometry`, `lighting`    | Sets the graph's render style. This only takes action if the `code` parameter defines a graph type that supports the specified render style. |
| `block-controls` |                           | Blocks canvas controls which prevents users from navigating a scene. |

# Generating URL strings

URLs don't support all characters meaning that strings must be encoded. This can be done using the `encodeURIComponent` function.

Example: `log("Hello World!")`

```javascript
const parameter = "log(\"Hello World!\")"

const encoded = encodeURIComponent(parameter)

console.log(encoded) // Expected output: "log(%22Hello%20World!%22)"
```

You can then add it to your iframe:

`<iframe src="https://soerenfriese.github.io/mathbox/?code=log(%22Hello%20World!%22)">`