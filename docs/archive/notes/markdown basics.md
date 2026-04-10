Markdown basics you’ll actually use (with examples)
Headings
Markdown headings are # based (more # = smaller heading):

# Title (H1)

## Section (H2)

### Subsection (H3)

#### Small heading (H4)

Paragraphs + line breaks
A blank line starts a new paragraph.
A single newline usually wraps in the same paragraph.
If you need a forced line break, end a line with two spaces:
This is one paragraph.
This is another paragraph.  
This line breaks within the same paragraph.
Bold / italics / inline code
**bold**
_italic_ (or _italic_)
`inline code` (great for filenames like `.cursor/rules/app-purpose.md`)
Bullet lists + sub-lists (nested)

- Main item A
  - Sub item A1
  - Sub item A2
- Main item B
  Numbered lists + sub-lists

1. Step one
2. Step two
   1. Sub-step 2.1
   2. Sub-step 2.2
      Checklists (great for plans)

- [ ] Not done
- [x] Done
      Links
      [Cursor rules docs](https://cursor.com/docs/rules)
      Code blocks
      Use triple backticks for multi-line code:

````ts
export function hello() {
  return "hi";
}
### Quotes (good for “principles”)
```md
> Principle: keep rules short and testable.
Tables (optional, but common)
| Concern | Owner | Notes |
| --- | --- | --- |
| Auth | Backend | OAuth + sessions |
````
