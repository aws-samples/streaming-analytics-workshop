+++
title = "Image"
description = "Displays a preformatted image on your page"
weight = 35
+++

The Img shortcode displays a preformatted image that is stored in your [Page Bundle](https://gohugo.io/content-management/page-bundles/) on your page.

## Usage

This shortcode takes two parameters:  

* The relative path to the image (based on the location of the current page).
* The alternate text to be used with the image.  

```markdown
{{%/* img "chapter.en.png" "A Chapter" */%}}
```

{{% img "chapter.en.png" "A Chapter" %}}