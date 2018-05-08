## AtJSON Query Language

### Types

Types are the primary way to query annotations. This can be done by providing the name directly to the query interface:

```
bold
```

### Namespaces

```
gdocs::ts_un
// Returns all annotations that have the type
// `-gdocs-ts_un`
```

### Unions

In some cases, you want to distill multiple types of annotations into a single type of annotation. This can be done by using unions:

```
html::h1 | html::h2 | html::h3 | html::h4 | html::h5 | html::h6
```


### Functions

The query language has a few functions available for use that make it easier to find information about your annotations and makes queries more succinct:

**like**  
`like` is a regular expression query. The above query for HTML headings can be rewritten using a regular expression like so:

```
html::like(h[1-6])
```

**only**  
`only` adds a restriction to the query that the attributes may *only* contain the parameters listed:

```
link only({ url })
```

### Attributes

The other end of this is having annotations that may need to be reified into multiple annotations. In this case, it's best to query on attributes on that annotation:

```
image { url: like('https://giphy.com') }
```
