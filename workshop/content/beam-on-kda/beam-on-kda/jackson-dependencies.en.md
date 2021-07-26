+++
title = "Jackson dependencies"
date = 2020-07-10T10:27:19+02:00
weight = 30
chapter = false
+++

When running your Beam applications with an Apache Flink runner, you may experience dependency conflicts for Jackson 2.x. You need to ensure that all Jackson dependencies are leveraging the same version. Otherwise you may experience `NoSuchMethodErrors` during runtime.

```
java.lang.NoSuchMethodError: 'com.fasterxml.jackson.core.json.JsonWriteContext
```

For Apache Flink 1.11, this can be fixed by including the following depencency, that explicitely pulls in the correct version.

{{< highlight xml >}}
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-cbor</artifactId>
    <version>2.12.1</version>
</dependency>
{{< / highlight >}}