# README

---

<!-- TOC -->
* [README](#readme)
* [Goal Features](#goal-features)
  * [Getting Started](#getting-started)
  * [How-Tos](#how-tos)
* [Problems intentionally ignored](#problems-intentionally-ignored)
<!-- TOC -->

---

# Goal Features

A tool that people can use to host various RPG campaigns, with a specific focus on a shared understanding of hex crawls / point crawls.

We'd have GMs with priviledged info, the ability to make markers, etc.

We'd have Players with the ability to add shared notes.

We'd have a system for keeping track of resources and the like on a given node.

---
## Getting Started

This website uses a smattering of various tools to deliver a world-class user experience without sacrificing database design or performance.

To set up your dev environment, you'll need to install all of these tools:

1. Ensure that you have a linux-based operating system or WSL installed for this project
2. List setup steps in order here
3. (Optional) Pre-fetch the DaisyUI Library
   * From project root, navigate to `app/views/layouts/application.html.erb`
   * Locate the line `<link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />`, which should be right near the top of the head section
     * If you are prompted to download the library, do so.
     * If you are not prompted to download the libary, run the command `curl -I https://cdn.jsdelivr.net/npm/daisyui@5/dist/full.css`
---

## How-Tos

<details>
<summary>Adding New Javascript</summary>

1. **Create controller file:** `app/javascript/controllers/your_controller_name.js`
```javascript
import { Controller } from "@hotwired/stimulus"
export default class extends Controller {
  static targets = ["element"]
  yourMethod(event) { /* your code */ }
}
```
2. **Register in index:** Add to `app/javascript/controllers/index.js`
```javascript
import YourController from "./your_controller_name"
application.register("your-controller-name", YourController)
```
3. **Build JavaScript:** Run `npm run build`
4. **Add to ERB:** Use `data-controller` attribute
```erb
<div data-controller="your-controller-name">
  <button data-action="click->your-controller-name#yourMethod">Click</button>
  <div data-your-controller-name-target="element">Content</div>
</div>
```
**Notes:**
* Controller registration uses kebab-case (dashes)
* File names use snake_case (underscores)
* Always rebuild after changes (`npm run build` or `esbuild ...`)
</details>

---

# Problems intentionally ignored

* Is it important that we represent enemy kingdoms?