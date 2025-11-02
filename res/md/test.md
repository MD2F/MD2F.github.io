# Markdown Test File

This file demonstrates **all major GitHub Flavored Markdown (GFM)** features for testing.

---

## 1. Headings

# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

---

## 2. Emphasis

- *Italic text*
- _Italic text_
- **Bold text**
- __Bold text__
- ***Bold and italic***
- ~~Strikethrough~~

---

## 3. Paragraphs and Line Breaks

This is a paragraph with  
a line break.

This is another paragraph.

---

## 4. Blockquotes

> This is a simple blockquote.
>
> > Nested blockquote.
> >
> > With **bold** and *italic* text.

---

## 5. Lists

### Unordered Lists

- Item 1
  - Sub-item 1.1
    - Sub-sub-item 1.1.1
- Item 2
- Item 3

### Ordered Lists

1. First item
2. Second item
   1. Sub-item 2.1
   2. Sub-item 2.2
3. Third item

### Mixed Lists

- Item A
  1. Numbered sub-item
  2. Another sub-item
- Item B

---

## 6. Code

### Inline Code

Text with `inline code` example.

### Code Block (fenced)

```js
// JavaScript example
function greet(name) {
  console.log(`Hello, ${name}!`);
}
greet("World");
```

### Code Block with Language Hint

```python
def greet(name):
    print(f"Hello, {name}!")
```

---

## 7. Links

- [Regular link](https://github.com)
- [Relative link](docs/readme.md)
- Autolink: <https://www.example.com>

---

## 8. Images

![Alt text](https://picsum.photos/300/200 "Placeholder Image")

Relative image:  
![Local Image](../assets/img/duck.png)

---

## 9. Tables

| Name      | Age | City         |
|------------|-----|--------------|
| Alice      | 25  | New York     |
| Bob        | 30  | Los Angeles  |
| **Charlie** | *22* | London       |

### Table with Alignment

| Left Align | Center Align | Right Align |
|:------------|:-------------:|-------------:|
| One         | Two           | Three        |
| Four        | Five          | Six          |

---

## 10. Task Lists

- [x] Write Markdown
- [ ] Test the parser
- [ ] Fix bugs
  - [x] Subtask done

---

## 11. Horizontal Rules

---
***
___

---

## 12. HTML Support

<span style="color: red;">This text is red (if HTML is supported).</span>

<details>
<summary>Expandable section</summary>
This is hidden until expanded.
</details>

---

## 13. Footnotes

Here’s a sentence with a footnote.[^1]

[^1]: This is the footnote text.

---

## 14. Emoji

:smile: :rocket: :+1: :coffee: :sparkles:

---

## 15. Definition Lists (GFM extension)

Term 1  
: Definition for term 1

Term 2  
: Definition for term 2  
: Another definition for term 2

---

## 16. Math (if supported)

Inline math: \(E = mc^2\)

Block math:

```math
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
```

---

## 17. Escaping

\*Not italic\*  
\# Not a heading  
\\ Backslash test

---

## 18. Nested Formatting

**Bold *with italic* text**

> Quoted text with **bold** and `inline code`.

1. List item with [link](#)
   - and an image: ![img](https://picsum.photos/300/200)

---

_End of Test Markdown File_
