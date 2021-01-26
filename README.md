## Streaming Analytics Workshop

In this workshop, you will build an end-to-end streaming architecture to ingest, analyze, and visualize streaming data in near real-time. You set out to improve the operations of a taxi company in New York City. You’ll analyze the telemetry data of a taxi fleet in New York City in near-real time to optimize their fleet operations.

The ready to use workshop is available from https://streaming-analytics.workshop.aws/

## Requirements

1. [Clone this repository](https://help.github.com/articles/fork-a-repo/).
2. [Install Hugo locally](https://gohugo.io/overview/quickstart/).


## What's Included

This project the following folders:

* `deck`: The location to store your presentation materials, if not already stored centrally in a system like KnowledgeMine or Wisdom.
* `resources`: Store any example code, IAM policies, or Cloudformation templates needed by your workshop here.
* `workshop`: This is the core workshop folder. This is generated as HTML and hosted for presentation for customers.


## Navigate to the `workshop` directory

All command line directions in this documentation assume you are in the `workshop` directory. Navigate there now, if you aren't there already.

```bash
cd streaming-analytics/workshop
```

## Create your first chapter page

Chapters are pages that contain other child pages. It has a special layout style and usually just contains a _brief abstract_ of the section.

```markdown
Discover what this template is all about and the core concepts behind it.
```

This template provides archetypes to create skeletons for your workshop. Begin by creating your first chapter page with the following command

```bash
cd workshop
hugo new --kind chapter intro/_index.en.md
```

By opening the given file, you should see the property `chapter=true` on top, meaning this page is a _chapter_.

By default all chapters and pages are created as a draft. If you want to render these pages, remove the property `draft = true` from the metadata.

## Create your first content pages

Then, create content pages inside the previously created chapter. Here are two ways to create content in the chapter:

```bash
hugo new intro/first-content.en.md
hugo new intro/second-content/_index.en.md
```

Feel free to edit thoses files by adding some sample content and replacing the `title` value in the beginning of the files. 

## Launching the website locally

Launch by using the following command:

```bash
hugo serve
```

Go to `http://localhost:1313`

You should notice three things:

1. You have a left-side **Intro** menu, containing two submenus with names equal to the `title` properties in the previously created files.
2. The home page explains how to customize it by following the instructions.
3. When you run `hugo server`, when the contents of the files change, the page automatically refreshes with the changes. Neat!

Alternatively, you can run the following command in a terminal window to tell Hugo to automatically rebuild whenever a file is changed. This can be helpful when rapidly iterating over content changes.

```bash
hugo server
```
