## Streaming Analytics Workshop

This is a collection of workshops and resources for running streaming analytics workloads on AWS.

In the workshop [Apache Flink on Amazon Kinesis Data Analytics](https://streaming-analytics.workshop.aws/flink-on-kda/) you will learn how to deploy, operate, and scale an Apache Flink application with Kinesis Data Analytics. You will also explore the basic concepts of Apache Flink and running Flink applications in a fully managed environment on AWS.

In the workshop [Apache Flink on Amazon Kinesis Data Analytics Studio](https://streaming-analytics.workshop.aws/flink-on-kda-studio/) you will learn how to build Apache Flink applications via. Kinesis Data Analytics Studio Notebooks. Flink is a framework for real time data processing. In this workshop you will explore Flink programing patterns with Flink's support for SQL. After building a Flink application you will deploy your notebook as a long running application.  

In the workshop [Apache Beam on Amazon Kinesis Data Analytics](https://streaming-analytics.workshop.aws/beam-on-kda/) you will learn how you can leverage Beam’s expressive programming model to unify batch and streaming. You will also learn how AWS can help you to effectively build and operate Beam based streaming architectures with low operational overhead in a fully managed environment on AWS.

The full workshop is hosted on https://streaming-analytics.workshop.aws. If you want to adapt the content and file a pull request, you can use the steps below to create a local copy of the workshop.

## Requirements

1. [Install Hugo locally](https://gohugo.io/overview/quickstart/).
1. [Clone this repository](https://help.github.com/articles/fork-a-repo/).
1. Initalize the learn theme by running `git submodule init` and `git submodule update` in the main directory


## What's Included

This project the following folders:

* `deck`: The location to store your presentation materials
* `resources`: Store any example code, IAM policies, or CloudFormation templates needed by your workshop here.
* `workshop`: This is the core workshop folder. This is generated as HTML and hosted for presentation for customers.


## Navigate to the `workshop` directory

All command line directions in this documentation assume you are in the `workshop` directory. Navigate there now, if you aren't there already.

```bash
cd streaming-analytics-workshop/workshop
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
