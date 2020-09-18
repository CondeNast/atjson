---
title: Google Docs Content Format Explainer
---

This is a rough sketch of the google docs paste format, which is accessible
via a paste event with a `application/x-vnd.google-docs-document-slice-clip+wrapped`
content type.

The first-level object returned by the paste is mostly ignorable (?) metadata.
We're interested in the `data.resolved` subpath.

At `data.resolved`, there are a number of sub-objects that describe the
document. They are listed here in relative order of relevance to conversion to
atjson documents.

## Body Text: `dsl_spacers`

`dsl_spacers` is the body text in raw form. This includes newlines, and is
largely analagous to atjson's `content` field. As far as I can tell, there are
no differences, except for the omission of object replacement characters
(Google Docs uses `*` instead).

## Styles Applied to Text: `dsl_styleslices`

`dsl_styleslices` describes a number of facets of styling that can be applied
to text. Each "style slice" is a list where each element corresponds to a
character offset in the document.

```js
dsl_styleslices[{ stsl_type: "...", stsl_styles: [] }];
```

Our interest in these is limited for the time being to a few of the `stsl_type`s,
specifically `horizontal_rule`, `link`, `list`, `paragraph`, and `text`. The
format of these is described below:

### `paragraph` style

The paragraph style is aligned to the last character before the newline, and
applies (? - needs verification) to the text seen _since_ the previous paragraph.

Paragraph styles set on a character level are either `null` or an object with the following properties:

`ps_al`: `integer` between `0` and `3`

- `0`: Align text to the start of the line
- `1`: Center text
- `2`: Align text to the end of the line
- `3`: Justify text

`ps_hd`: `integer` between `0` and `6`, `100`, `101` (others?)

- `0`: Normal paragraph
- `1-6`: Headings level 1-6
- `100`: Title
- `101`: Subtitle

`ps_hdid`: 'string' - Heading ID (unknown use)

#### Unimplemented

`ps_al`: `float` - Horizontal alignment  
`ps_ls`: `integer` - Line spacing,  
`ps_awao` `boolean` - unknown  
`ps_sa`: `float` - Space before  
`ps_sb`: `float` - Space after  
`ps_ifl`: `float` - Indent first line  
`ps_il`: `float` - Indent line

#### Unknown

`ps_sd`, `ps_bbtw`, `ps_bb`, `ps_bl`, `ps_br`, `ps_bt`, `ps_ir`, `ps_klt`,
`ps_kwn`, `ps_ltr`, `ps_sm`, `ps_rd`, `ps_shd`

### `text` style

The text style for a given character (per index in `stsl_styles` array) is
either `null` (no _change_ to previous style) or an object with the following
properties set:

`ts_bd`: `boolean` - Bold  
`ts_it`: `boolean` - Italic  
`ts_st`: `boolean` - Strikethrough  
`ts_un`: `boolean` - Underline  
`ts_va`: `enum` (`nor`, `sup`, `sub`) - Vertical align: Superscript / Subscript / Normal  
`ts_sc`: `boolean` - Smallcaps

#### Unimplemented

`ts_fs`: `integer` - Font size  
`ts_ff`: `string` - Font family  
`ts_tw`: `integer` - Text weight  
`ts_bgc2`: `object` - Background color  
`ts_fgc2`: `object` - Foreground color

### `link` style

Links are styled as non-overlapping ranges with entriesin the `stsl_styles`
array either `null` or an object with the `links_link` attribute set.

`links_link` can be one of `null` (no link) or an object with the following
attributes:

`link_type`: `integer` (unknown)  
`ulnk_url`: `string` Destination URL of link.

### `list` style

List styles are in the `dsl_entitymap` object, keyed by the kix id of the list.
For each list:

`le_nb.nl_0.b_a`: `integer` - 2 for roman numerals, 0 otherwise  
`le_nb.nl_0.b_gs`: `string` - Bullet style  
`le_nb.nl_0.b_gt`: `integer` - Enumeration of ordered list types:

- `9`: All bulleted lists have this
- `10`: Numbered
- `12`: Alphabetical (upper case)
- `13`: Alphabetical (lower case)
- `14`: Roman numerals (upper case)
- `15`: Roman numerals (lower case)

### `horizontal_rule` style

## Further reading

- [Forensic analysis of cloud-native artifacts: § Understanding Google Docs](https://www.sciencedirect.com/science/article/pii/S174228761630007X#sec3)
