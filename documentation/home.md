Welcome to the MathBox Wiki. Here you will find all relevant information to make full use of MathBox's features.

# MathBox

MathBox is an in-browser graphing tool that is controlled through code rather than mathematical expressions, which allows for larger customization. MathBox is focused on making math animations easy. Originally the aim was only to be able to display matrices as linear transformations, but it has grown into far more than anticipated.

# Overview

The user interface is divided into three main sections: the code editor, log, and canvas. Additionally, the Header contains a button to toggle the website's color theme.

Code is written in the editor using JavaScript. Any output and errors produced from the code will be displayed in the log. The Canvas will display elements that are drawn to graphs in the code.

Above the code editor you will see multiple buttons. The first button has the play icon (`▶`). It will execute the code written in the editor. The next two buttons are relevant for loops (see the section below). The last button located to the right clears the log's content.

## Loops

Loops can be defined by returning a function that will act as a ticker function.

```javascript
function tick(t, dt) {
    // write code here that is in dependence of time
}

return tick
```

The parameter `t` represents the loop's current timestamp while `dt` represents the difference in time that has passed since the last function call.

Located above the code editor, there are two buttons dedicated to controlling the loop. The first button shows the loop's current timestamp and will pause or resume the loop upon clicking on it. The second button is an amplifier button which can change the speed at which time is passing. The current amplifier is displayed on the button.

# Default Functions

The following functions can be called to add customized behaviour.

> Note: Most functions in the wiki are written using TypeScript notation. This is to make it easier to understand the parameters.

| Function | Parameters | Description |
| - | - | - |
| `log(...messages: any[]): void` | `messages`: the entries to log. (These can be passed as multiple parameters) | Logs all entries' string value. You may alternatively use the expression `out = value` to avoid nesting complexity with larger expressions. (The setter function for the global value of `out` simply redirects to `log`) |
| `addSlider(callbackFunction: (value: number) => void): void` | `callbackFunction`: a function that is called with the slider's new `value` when the slider is dragged. | Adds a slider in the log that allows for customized visuals. |
| `clear(): void` | | Clears the log.|
| `setHz(hz: number): void` | `hz`: the number of tick calls per second for the loop. This value must be greater than `0`. | Sets the frequency for the current loop. |
| `define(id: string): {graph: object, camera: object}` | `id`: the demanded graph type's id. | Specifies a graph type and returns an object containing the relevant `graph` and `camera` object. The `graph` object can be used to draw elements and the `camera` can be used to manipulate the viewers orientation. Given the specified graph type supports multiple render styles, then the render style button will appear in the top right corner of the canvas and can be used to toggle between render styles. For more information read the page on graph types. |